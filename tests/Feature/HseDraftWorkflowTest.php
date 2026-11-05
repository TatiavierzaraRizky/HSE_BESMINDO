<?php

namespace Tests\Feature;

use App\Models\HseReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class HseDraftWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_save_and_manage_draft_reports(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'email' => 'pic@besmindo.com',
            'assigned_rigs' => ['BMS # 19'],
        ]);
        $admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin@besmindo.com',
        ]);

        // 1. Simpan sebagai Draft (tanpa file evidence, is_draft = 1)
        $draftPayload = [
            'is_draft' => 1,
            'date' => '2027-01-01',
            'period' => '01',
            'year' => 2027,
            'contractNo' => 'SPHR00576A',
            'rigNo' => 'BMS # 19',
            'locationDistrict' => 'RH-1',
            'manHoursPremisesPlan' => 17360,
            'manHoursPremisesActual' => 17360,
            'manHoursNonPremisesPlan' => 304,
            'manHoursNonPremisesActual' => 304,
            'totalEmployees' => 72,
            'totalVehicles' => 9,
            'kilometerPremisesPlan' => 9850,
            'kilometerPremisesActual' => 9850,
            'kilometerNonPremisesPlan' => 3831,
            'kilometerNonPremisesActual' => 3831,
            'remarks' => 'Draf catatan lapangan uji coba',
            'lagging' => [
                'lag_1' => ['indicator_name' => 'FATALITY', 'actual' => 0, 'frequency_rate' => 0.00],
            ],
            'leading' => [
                'lead_1' => ['indicator_name' => 'Management Safety Walkthrough (MSW)', 'actual' => 5],
            ],
        ];

        $response = $this->actingAs($user)->post('/hse-report', $draftPayload);
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'is_draft' => true,
        ]);

        $draftId = $response->json('draft_id');
        $this->assertNotNull($draftId);

        $savedReport = HseReport::find($draftId);
        $this->assertNotNull($savedReport);
        $this->assertEquals('draft', $savedReport->status);
        $this->assertEquals($user->id, $savedReport->created_by);

        // 2. Verifikasi Draf TIDAK BOLEH tampil di Admin Approval
        $approvalResponse = $this->actingAs($admin)->get('/admin/approval');
        $approvalResponse->assertStatus(200);

        // Record harus berstatus 'draft' dan tidak muncul di query status != 'draft'
        $nonDraftReport = HseReport::where('status', '!=', 'draft')->where('id', $draftId)->first();
        $this->assertNull($nonDraftReport, 'Draft should not appear in non-draft queries');

        // 3. User lain tidak boleh menghapus draf ini
        $otherUser = User::factory()->create([
            'role' => 'user',
            'email' => 'other@besmindo.com',
        ]);
        $unauthorizedDelete = $this->actingAs($otherUser)->delete("/user/hse-report/draft/{$draftId}");
        $unauthorizedDelete->assertStatus(403);

        // 4. User pemilik draf dapat menghapus draf miliknya
        $deleteResponse = $this->actingAs($user)->delete("/user/hse-report/draft/{$draftId}");
        $deleteResponse->assertStatus(200);
        $deleteResponse->assertJson(['success' => true]);

        $this->assertNull(HseReport::find($draftId), 'Draft should be deleted from database');
    }

    public function test_cannot_submit_duplicate_report_for_same_rig_contract_and_period(): void
    {
        $pic1 = User::factory()->create([
            'role' => 'user',
            'email' => 'pic1@besmindo.com',
            'assigned_rigs' => ['BMS # 19'],
        ]);
        $pic2 = User::factory()->create([
            'role' => 'user',
            'email' => 'pic2@besmindo.com',
            'assigned_rigs' => ['BMS # 19'],
        ]);

        Storage::fake('public');

        $payload = [
            'is_draft' => 0,
            'date' => '2027-01-01',
            'period' => '01',
            'year' => 2027,
            'contractNo' => 'SPHR00576A',
            'rigNo' => 'BMS # 19',
            'locationDistrict' => 'RH-1',
            'evidence_file' => UploadedFile::fake()->create('evidence.pdf', 100, 'application/pdf'),
            'manHoursPremisesPlan' => 17360,
            'manHoursPremisesActual' => 17360,
            'manHoursNonPremisesPlan' => 304,
            'manHoursNonPremisesActual' => 304,
            'totalEmployees' => 72,
            'totalVehicles' => 9,
            'kilometerPremisesPlan' => 9850,
            'kilometerPremisesActual' => 9850,
            'kilometerNonPremisesPlan' => 3831,
            'kilometerNonPremisesActual' => 3831,
            'remarks' => 'Pengiriman pertama',
            'lagging' => [
                'lag_1' => ['indicator_name' => 'FATALITY', 'actual' => 0, 'frequency_rate' => 0.00],
            ],
            'leading' => [
                'lead_1' => ['indicator_name' => 'Management Safety Walkthrough (MSW)', 'actual' => 5],
            ],
        ];

        // 1. PIC 1 submit laporan
        $firstSubmit = $this->actingAs($pic1)->post('/hse-report', $payload);
        $firstSubmit->assertSuccessful();
        $firstSubmit->assertJson(['success' => true]);

        // Verifikasi laporan pertama masuk status pending/submitted
        $this->assertDatabaseHas('hse_reports', [
            'rig_no' => 'BMS # 19',
            'contract_no' => 'SPHR00576A',
            'year' => 2027,
            'period' => '01',
            'status' => 'pending',
        ]);

        // 2. PIC 2 mencoba submit untuk Rig, Kontrak, Tahun, dan Periode yang sama persis
        $duplicateSubmit = $this->actingAs($pic2)->post('/hse-report', $payload);
        $duplicateSubmit->assertStatus(422);
        $duplicateSubmit->assertJson([
            'success' => false,
            'is_duplicate' => true,
        ]);
        $this->assertStringContainsString('sudah pernah dikirim (Submitted)', $duplicateSubmit->json('message'));
        $this->assertStringContainsString('Tidak dapat melakukan penginputan ulang untuk mencegah duplikasi data', $duplicateSubmit->json('message'));
    }

    public function test_rejected_report_can_be_resubmitted_by_pic_with_revisions(): void
    {
        Storage::fake('public');

        $pic = User::factory()->create([
            'role' => 'user',
            'email' => 'pic_revisi@besmindo.com',
            'assigned_rigs' => ['BMS # 19'],
        ]);
        $admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin_revisi@besmindo.com',
        ]);

        $payload = [
            'is_draft' => 0,
            'date' => '2027-02-01',
            'period' => '02',
            'year' => 2027,
            'contractNo' => 'SPHR00576A',
            'rigNo' => 'BMS # 19',
            'locationDistrict' => 'RH-1',
            'evidence_file' => UploadedFile::fake()->create('initial_evidence.pdf', 100, 'application/pdf'),
            'manHoursPremisesPlan' => 17360,
            'manHoursPremisesActual' => 15000,
            'manHoursNonPremisesPlan' => 304,
            'manHoursNonPremisesActual' => 304,
            'totalEmployees' => 72,
            'totalVehicles' => 9,
            'kilometerPremisesPlan' => 9850,
            'kilometerPremisesActual' => 9850,
            'kilometerNonPremisesPlan' => 3831,
            'kilometerNonPremisesActual' => 3831,
            'remarks' => 'Pengajuan awal sebelum ditolak',
        ];

        // 1. Submit awal
        $submit = $this->actingAs($pic)->post('/hse-report', $payload);
        $submit->assertSuccessful();

        $report = HseReport::where('rig_no', 'BMS # 19')->where('period', '02')->first();
        $this->assertNotNull($report);
        $this->assertEquals('pending', $report->status);

        // 2. Admin menolak laporan dengan catatan revisi
        $rejectResponse = $this->actingAs($admin)->post("/admin/approval/{$report->id}", [
            'status' => 'rejected',
            'rejection_reason' => 'Jumlah Man Hours tidak sesuai dengan Manpower, mohon disesuaikan.',
        ]);
        $rejectResponse->assertSuccessful();

        $report->refresh();
        $this->assertEquals('rejected', $report->status);
        $this->assertEquals('Jumlah Man Hours tidak sesuai dengan Manpower, mohon disesuaikan.', $report->rejection_reason);

        // 3. PIC melakukan perbaikan & submit ulang (resubmit)
        $resubmitPayload = array_merge($payload, [
            'draft_id' => $report->id,
            'manHoursPremisesActual' => 17360,
            'remarks' => 'Sudah diperbaiki sesuai catatan admin: man hours disesuaikan menjadi 17360.',
        ]);

        $resubmit = $this->actingAs($pic)->post('/hse-report', $resubmitPayload);
        $resubmit->assertSuccessful();
        $resubmit->assertJson(['success' => true]);

        $report->refresh();
        $this->assertEquals('pending', $report->status, 'Status report should return to pending after resubmission');
        $this->assertNull($report->rejected_at, 'rejected_at timestamp should be reset after resubmission');
        $this->assertEquals(17360, $report->manHours->premises_actual, 'Updated man hours should be saved in database');
    }

    public function test_cross_pic_collaboration_on_same_rig_and_cross_rig_isolation(): void
    {
        Storage::fake('public');

        // Ahmad & Edo assigned to BMS # 19
        $ahmad = User::factory()->create([
            'role' => 'user',
            'name' => 'Ahmad Afandi',
            'email' => 'ahmad.afandi@besmindo.com',
            'assigned_rigs' => ['BMS # 19', 'BMS # 16'],
        ]);

        $edo = User::factory()->create([
            'role' => 'user',
            'name' => 'Edo Syahputra',
            'email' => 'edo.syahputra@besmindo.com',
            'assigned_rigs' => ['BMS # 19', 'BMS # 11'],
        ]);

        // Joko assigned only to BMS # 20
        $joko = User::factory()->create([
            'role' => 'user',
            'name' => 'Joko Nuryanto',
            'email' => 'joko.nuryanto@besmindo.com',
            'assigned_rigs' => ['BMS # 20'],
        ]);

        $admin = User::factory()->create([
            'role' => 'admin',
            'name' => 'Admin HSE',
            'email' => 'admin@besmindo.com',
        ]);

        // 1. Ahmad membuat draft untuk BMS # 19
        $draftPayload = [
            'is_draft' => 1,
            'date' => '2027-03-01',
            'period' => '03',
            'year' => 2027,
            'contractNo' => 'SPHR00576A',
            'rigNo' => 'BMS # 19',
            'locationDistrict' => 'RH-1',
            'manHoursPremisesPlan' => 17360,
            'manHoursPremisesActual' => 10000,
            'totalEmployees' => 72,
            'totalVehicles' => 9,
            'remarks' => 'Draf oleh Ahmad',
        ];

        $draftRes = $this->actingAs($ahmad)->post('/hse-report', $draftPayload);
        $draftRes->assertSuccessful();
        $draftId = $draftRes->json('draft_id');

        $report = HseReport::find($draftId);
        $this->assertEquals($ahmad->id, $report->created_by);

        // 2. Joko (BMS # 20) DILARANG mengakses/mengedit data Rig BMS # 19
        $jokoForbiddenRes = $this->actingAs($joko)->post('/hse-report', array_merge($draftPayload, [
            'draft_id' => $draftId,
            'remarks' => 'Coba edit oleh Joko',
        ]));
        $jokoForbiddenRes->assertStatus(403);

        // 3. Edo (rekan satu rig BMS # 19) BISA mengupdate dan mensubmit laporan
        $edoSubmitRes = $this->actingAs($edo)->post('/hse-report', [
            'is_draft' => 0,
            'draft_id' => $draftId,
            'date' => '2027-03-01',
            'period' => '03',
            'year' => 2027,
            'contractNo' => 'SPHR00576A',
            'rigNo' => 'BMS # 19',
            'locationDistrict' => 'RH-1',
            'evidence_file' => UploadedFile::fake()->create('edo_evidence.pdf', 100, 'application/pdf'),
            'manHoursPremisesPlan' => 17360,
            'manHoursPremisesActual' => 17360,
            'totalEmployees' => 72,
            'totalVehicles' => 9,
            'remarks' => 'Diselesaikan dan disubmit oleh Edo',
        ]);
        $edoSubmitRes->assertSuccessful();

        $report->refresh();
        $this->assertEquals('pending', $report->status);
        $this->assertEquals($ahmad->id, $report->created_by, 'Creator should remain Ahmad');
        $this->assertEquals($edo->id, $report->updated_by, 'Updater should be Edo');
        $this->assertEquals($edo->id, $report->submitted_by, 'Submitter should be Edo');

        // 4. Admin menolak revisi #1
        $this->actingAs($admin)->post("/admin/approval/{$report->id}", [
            'status' => 'rejected',
            'rejection_reason' => 'Catatan revisi pertama: tidak lengkap',
        ])->assertSuccessful();

        $report->refresh();
        $this->assertEquals('rejected', $report->status);
        $this->assertEquals('Catatan revisi pertama: tidak lengkap', $report->latest_admin_note);
        $this->assertCount(1, $report->rejectionLogs);

        // 5. Admin menolak revisi #2 dengan catatan baru
        $this->actingAs($admin)->post("/admin/approval/{$report->id}", [
            'status' => 'rejected',
            'rejection_reason' => 'masih salah cak, minta edos tolong perbaiki',
        ])->assertSuccessful();

        $report->refresh();
        $this->assertEquals('masih salah cak, minta edos tolong perbaiki', $report->latest_admin_note);
        $this->assertCount(2, $report->rejectionLogs);
        $this->assertEquals(2, $report->rejectionLogs->last()->revision_number);
        $this->assertEquals('masih salah cak, minta edos tolong perbaiki', $report->rejectionLogs->last()->rejection_reason);

        // 6. Cek halaman menu baru PIC: /user/drafts dan /user/history
        $draftsPageRes = $this->actingAs($edo)->get('/user/drafts');
        $draftsPageRes->assertSuccessful();

        $historyPageRes = $this->actingAs($edo)->get('/user/history');
        $historyPageRes->assertSuccessful();

        // 7. Cek endpoint realtime multi-tab session auth check (/auth/current-user)
        $authRes = $this->actingAs($edo)->getJson('/auth/current-user');
        $authRes->assertSuccessful();
        $authRes->assertJson([
            'authenticated' => true,
            'user' => [
                'id' => $edo->id,
                'name' => 'Edo Syahputra',
                'role' => 'user',
                'assigned_rigs' => ['BMS # 19', 'BMS # 11'],
            ],
        ]);

        // Cek ketika unauthenticated
        auth()->logout();
        $guestRes = $this->getJson('/auth/current-user');
        $guestRes->assertSuccessful();
        $guestRes->assertJson([
            'authenticated' => false,
            'user' => null,
        ]);
    }
}
