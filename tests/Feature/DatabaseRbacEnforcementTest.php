<?php

namespace Tests\Feature;

use App\Models\HseKpiTarget;
use App\Models\HseLaggingIndicator;
use App\Models\HseLeadingIndicator;
use App\Models\HseManHour;
use App\Models\HseReport;
use App\Models\HseReportRejectionLog;
use App\Models\Rig;
use App\Models\User;
use App\Models\UserRigAssignment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DatabaseRbacEnforcementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed 16 master rigs for test environment
        $rigsData = [
            ['rig_no' => 'BMS # 19', 'name' => 'Rig BMS # 19', 'area' => 'RH-1', 'contract_no' => 'SPHR00576A'],
            ['rig_no' => 'BMS # 20', 'name' => 'Rig BMS # 20', 'area' => 'HO', 'contract_no' => 'SPHR01003C'],
            ['rig_no' => 'BMS # 05', 'name' => 'Rig BMS # 05', 'area' => 'North', 'contract_no' => 'SPHR01002C'],
        ];

        foreach ($rigsData as $r) {
            Rig::firstOrCreate(['rig_no' => $r['rig_no']], $r);
        }
    }

    /**
     * 1. Schema & Relationships Verification:
     * - hse_reports has rig_id, contract_number, month, year, status, created_by, updated_by
     * - Cascading delete on detail tables (man_hours, lagging, leading, rejection_logs)
     */
    public function test_database_schema_and_cascading_foreign_keys(): void
    {
        $this->assertTrue(Schema::hasColumns('hse_reports', [
            'id', 'rig_id', 'contract_number', 'month', 'year', 'status', 'created_by', 'updated_by',
        ]));

        $rig = Rig::where('rig_no', 'BMS # 19')->first();
        $user = User::factory()->create(['role' => 'admin']);

        $report = HseReport::create([
            'rig_id' => $rig->id,
            'rig_no' => $rig->rig_no,
            'contract_no' => 'SPHR00576A',
            'contract_number' => 'SPHR00576A',
            'month' => 1,
            'period' => '01',
            'year' => 2027,
            'report_date' => '2027-01-01',
            'location_district' => 'RH-1',
            'status' => 'draft',
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);

        $manHour = HseManHour::create([
            'report_id' => $report->id,
            'premises_plan' => 1000,
            'premises_actual' => 1000,
        ]);

        $lagging = HseLaggingIndicator::create([
            'report_id' => $report->id,
            'indicator_no' => 1,
            'indicator_name' => 'FATALITY',
            'plan' => 0,
            'actual' => 0,
        ]);

        $leading = HseLeadingIndicator::create([
            'report_id' => $report->id,
            'indicator_no' => '1',
            'indicator_name' => 'PEKA',
            'plan' => 10,
            'actual' => 10,
        ]);

        $rejection = HseReportRejectionLog::create([
            'report_id' => $report->id,
            'admin_id' => $user->id,
            'admin_name' => $user->name,
            'revision_number' => 1,
            'rejection_reason' => 'Data tidak lengkap',
        ]);

        // Verifikasi relasi Eloquent
        $this->assertEquals($rig->id, $report->rig->id);
        $this->assertEquals($report->id, $report->manHours->report_id);
        $this->assertCount(1, $report->laggingIndicators);
        $this->assertCount(1, $report->leadingIndicators);
        $this->assertCount(1, $report->rejectionLogs);

        // Uji Cascading Delete
        $report->delete();

        $this->assertDatabaseMissing('hse_man_hours', ['id' => $manHour->id]);
        $this->assertDatabaseMissing('hse_lagging_indicators', ['id' => $lagging->id]);
        $this->assertDatabaseMissing('hse_leading_indicators', ['id' => $leading->id]);
        $this->assertDatabaseMissing('hse_report_rejection_logs', ['id' => $rejection->id]);
    }

    /**
     * 2. RBAC USER (Field PIC):
     * Scope data strictly limited to assigned rigs. Cannot submit/edit for unassigned rigs.
     */
    public function test_pic_cannot_access_or_submit_unassigned_rig(): void
    {
        $rig19 = Rig::where('rig_no', 'BMS # 19')->first();
        $rig20 = Rig::where('rig_no', 'BMS # 20')->first();

        $pic = User::factory()->create([
            'role' => 'user',
            'name' => 'Ahmad Afandi',
            'email' => 'ahmad@besmindo.com',
            'assigned_rigs' => ['BMS # 19'],
        ]);

        // Catat assignment di user_rig_assignments
        UserRigAssignment::create([
            'user_id' => $pic->id,
            'rig_id' => $rig19->id,
            'rig_no' => 'BMS # 19',
        ]);

        // PIC coba submit ke Rig BMS # 20 (Unassigned Rig) -> Ditolak 403
        $response = $this->actingAs($pic)->post('/hse-report', [
            'is_draft' => 1,
            'date' => '2027-01-01',
            'period' => '01',
            'year' => 2027,
            'contractNo' => 'SPHR01003C',
            'rigNo' => 'BMS # 20',
            'locationDistrict' => 'HO',
        ]);

        $response->assertStatus(403);
        $this->assertStringContainsString('tidak memiliki hak akses untuk mengelola Rig BMS # 20', $response->json('message'));
    }

    /**
     * 3. RBAC USER (Field PIC) vs Master KPI:
     * Master KPI is strictly read-only for PIC. Any attempt to POST, PUT, DELETE returns 403.
     */
    public function test_pic_cannot_mutate_master_kpi_targets(): void
    {
        $pic = User::factory()->create([
            'role' => 'user',
            'name' => 'Edo Syahputra',
            'email' => 'edo@besmindo.com',
        ]);

        $kpiTarget = HseKpiTarget::create([
            'year' => 2027,
            'indicator_name' => '1.1 Fatality Case',
            'category' => 'lagging',
            'target_month' => '0 Case',
            'target_year' => '0 Case',
            'unit' => 'Case',
            'order_no' => 1,
        ]);

        // 1. PIC coba CREATE Target Master KPI -> Ditolak 403
        $createResponse = $this->actingAs($pic)->postJson('/admin/target-kpi', [
            'indicator_name' => 'Custom KPI Hacker',
            'target_month' => '99',
            'year' => 2027,
        ]);
        $createResponse->assertStatus(403);

        // 2. PIC coba UPDATE Target Master KPI -> Ditolak 403
        $updateResponse = $this->actingAs($pic)->putJson("/admin/target-kpi/{$kpiTarget->id}", [
            'target_month' => '999 Case',
        ]);
        $updateResponse->assertStatus(403);

        // 3. PIC coba DELETE Target Master KPI -> Ditolak 403
        $deleteResponse = $this->actingAs($pic)->deleteJson("/admin/target-kpi/{$kpiTarget->id}");
        $deleteResponse->assertStatus(403);

        // 4. PIC akses Read-Only API -> Berhasil 200
        $readResponse = $this->actingAs($pic)->getJson('/user/kpi-targets?year=2027');
        $readResponse->assertStatus(200);
        $readResponse->assertJsonStructure(['kpiTargets', 'indicators']);
    }

    /**
     * 4. RBAC USER Transaction Tables:
     * - DRAFT: Create & Update allowed
     * - REJECTED: Update only allowed (for revision & resubmit)
     * - PENDING: Locked / Read-Only (403)
     * - APPROVED: Locked permanently / Read-Only (403)
     */
    public function test_transaction_status_rbac_enforcement_for_pic(): void
    {
        $rig = Rig::where('rig_no', 'BMS # 19')->first();
        $pic = User::factory()->create([
            'role' => 'user',
            'name' => 'Ahmad Afandi',
            'email' => 'ahmad@besmindo.com',
            'assigned_rigs' => ['BMS # 19'],
        ]);
        UserRigAssignment::create([
            'user_id' => $pic->id,
            'rig_id' => $rig->id,
            'rig_no' => 'BMS # 19',
        ]);

        // A. DRAFT: Create & Update
        $draft = HseReport::create([
            'rig_id' => $rig->id,
            'rig_no' => 'BMS # 19',
            'contract_no' => 'SPHR00576A',
            'contract_number' => 'SPHR00576A',
            'month' => 1,
            'period' => '01',
            'year' => 2027,
            'report_date' => '2027-01-01',
            'location_district' => 'RH-1',
            'status' => 'draft',
            'created_by' => $pic->id,
        ]);

        $updateDraft = $this->actingAs($pic)->post('/hse-report', [
            'draft_id' => $draft->id,
            'is_draft' => 1,
            'date' => '2027-01-01',
            'period' => '01',
            'year' => 2027,
            'contractNo' => 'SPHR00576A',
            'rigNo' => 'BMS # 19',
            'locationDistrict' => 'RH-1',
            'remarks' => 'Draf diperbarui',
        ]);
        $updateDraft->assertStatus(200);
        $this->assertEquals('Draf diperbarui', $draft->fresh()->remarks);

        // B. REJECTED: Update only (edit revisi untuk resubmit)
        $draft->update([
            'status' => 'rejected',
            'latest_admin_note' => 'Perbaiki jam kerja',
        ]);

        Storage::fake('public');
        $resubmitPayload = [
            'draft_id' => $draft->id,
            'is_draft' => 0,
            'date' => '2027-01-01',
            'period' => '01',
            'year' => 2027,
            'contractNo' => 'SPHR00576A',
            'rigNo' => 'BMS # 19',
            'locationDistrict' => 'RH-1',
            'evidence_file' => UploadedFile::fake()->create('revisi.pdf', 100),
            'remarks' => 'Sudah diperbaiki pak',
        ];

        $resubmitResponse = $this->actingAs($pic)->post('/hse-report', $resubmitPayload);
        $resubmitResponse->assertSuccessful();
        $this->assertEquals('pending', $draft->fresh()->status);
        $this->assertEquals('Sudah diperbaiki pak', $draft->fresh()->remarks);

        // C. PENDING: Locked / Read-Only (attempt to update returns 403)
        $pendingAttempt = $this->actingAs($pic)->post('/hse-report', [
            'draft_id' => $draft->id,
            'is_draft' => 1,
            'date' => '2027-01-01',
            'period' => '01',
            'year' => 2027,
            'contractNo' => 'SPHR00576A',
            'rigNo' => 'BMS # 19',
            'locationDistrict' => 'RH-1',
            'remarks' => 'Coba ubah saat pending',
        ]);
        $pendingAttempt->assertStatus(403);
        $this->assertTrue($pendingAttempt->json('is_locked'));

        // D. APPROVED: Locked permanently (attempt to update returns 403)
        $draft->update(['status' => 'approved', 'approved_at' => now()]);

        $approvedAttempt = $this->actingAs($pic)->post('/hse-report', [
            'draft_id' => $draft->id,
            'is_draft' => 1,
            'date' => '2027-01-01',
            'period' => '01',
            'year' => 2027,
            'contractNo' => 'SPHR00576A',
            'rigNo' => 'BMS # 19',
            'locationDistrict' => 'RH-1',
            'remarks' => 'Coba ubah saat approved',
        ]);
        $approvedAttempt->assertStatus(403);
        $this->assertTrue($approvedAttempt->json('is_locked'));
    }

    /**
     * 5. RBAC ADMIN:
     * - Unrestricted scope across all rigs
     * - Full CRUD on Master KPI
     * - APPROVE / REJECT reports
     */
    public function test_admin_has_full_crud_and_approval_powers(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'name' => 'Administrator HSE',
            'email' => 'admin@besmindo.com',
        ]);

        // A. Admin creates Master KPI
        $createKpi = $this->actingAs($admin)->postJson('/admin/target-kpi', [
            'indicator_name' => 'Special Hazard Identification',
            'category' => 'leading',
            'target_month' => '10 Laporan',
            'target_year' => '120 Laporan',
            'unit' => 'Laporan',
            'year' => 2027,
        ]);
        $createKpi->assertSuccessful();

        $kpi = HseKpiTarget::where('indicator_name', 'Special Hazard Identification')->first();
        $this->assertNotNull($kpi);

        // B. Admin updates Master KPI
        $updateKpi = $this->actingAs($admin)->putJson("/admin/target-kpi/{$kpi->id}", [
            'target_month' => '15 Laporan',
        ]);
        $updateKpi->assertSuccessful();
        $this->assertEquals('15 Laporan', $kpi->fresh()->target_month);

        // C. Admin deletes Master KPI
        $deleteKpi = $this->actingAs($admin)->deleteJson("/admin/target-kpi/{$kpi->id}");
        $deleteKpi->assertSuccessful();
        $this->assertNull(HseKpiTarget::find($kpi->id));

        // D. Admin Approves and Rejects Transaction Reports
        $rig = Rig::where('rig_no', 'BMS # 19')->first();
        $report = HseReport::create([
            'rig_id' => $rig->id,
            'rig_no' => 'BMS # 19',
            'contract_no' => 'SPHR00576A',
            'month' => 1,
            'period' => '01',
            'year' => 2027,
            'report_date' => '2027-01-01',
            'location_district' => 'RH-1',
            'status' => 'pending',
        ]);

        // Reject
        $reject = $this->actingAs($admin)->post("/admin/approval/{$report->id}", [
            'status' => 'rejected',
            'rejection_reason' => 'Perbaiki lampiran file evidence',
        ]);
        $reject->assertStatus(200);
        $this->assertEquals('rejected', $report->fresh()->status);
        $this->assertEquals('Perbaiki lampiran file evidence', $report->fresh()->latest_admin_note);
        $this->assertCount(1, $report->fresh()->rejectionLogs);

        // Approve
        $approve = $this->actingAs($admin)->post("/admin/approval/{$report->id}", [
            'status' => 'approved',
        ]);
        $approve->assertStatus(200);
        $this->assertEquals('approved', $report->fresh()->status);
        $this->assertNotNull($report->fresh()->approved_at);
    }
}
