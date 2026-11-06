<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ========================================================
        // 1. TABEL MASTER RIGS (MASTER DATA RIG)
        // ========================================================
        if (! Schema::hasTable('rigs')) {
            Schema::create('rigs', function (Blueprint $table) {
                $table->id();
                $table->string('rig_no', 100)->unique();
                $table->string('name', 150);
                $table->string('area', 100);
                $table->string('contract_no', 100)->nullable();
                $table->string('status', 50)->default('active');
                $table->timestamps();

                $table->index('rig_no');
                $table->index('area');
            });
        }

        // SEED SELURUH 16 RIG OPERASIONAL PT. BESMINDO MATERI SEWATAMA
        $rigsData = [
            ['rig_no' => 'BMS # 19', 'name' => 'Rig BMS # 19', 'area' => 'RH-1', 'contract_no' => 'SPHR00576A'],
            ['rig_no' => 'BMS # 20', 'name' => 'Rig BMS # 20', 'area' => 'HO', 'contract_no' => 'SPHR01003C'],
            ['rig_no' => 'BMS # 05', 'name' => 'Rig BMS # 05', 'area' => 'North', 'contract_no' => 'SPHR01002C'],
            ['rig_no' => 'BMS # 06', 'name' => 'Rig BMS # 06', 'area' => 'HO', 'contract_no' => 'SPHR01067C'],
            ['rig_no' => 'BMS # 21', 'name' => 'Rig BMS # 21', 'area' => 'HO', 'contract_no' => 'SPHR01071C'],
            ['rig_no' => 'BMS # 02', 'name' => 'Rig BMS # 02', 'area' => 'South', 'contract_no' => 'SPHR01095C'],
            ['rig_no' => 'BMS # 03', 'name' => 'Rig BMS # 03', 'area' => 'South', 'contract_no' => 'SPHR01095C'],
            ['rig_no' => 'BMS # 08', 'name' => 'Rig BMS # 08', 'area' => 'South', 'contract_no' => 'SPHR01095C'],
            ['rig_no' => 'BMS # 03a', 'name' => 'Rig BMS # 03a', 'area' => 'HO', 'contract_no' => 'SPHR01097C'],
            ['rig_no' => 'BMS # 17', 'name' => 'Rig BMS # 17', 'area' => 'North', 'contract_no' => 'SPHR01096C'],
            ['rig_no' => 'BMS # 16', 'name' => 'Rig BMS # 16', 'area' => 'RH-1', 'contract_no' => 'SPHR00797A'],
            ['rig_no' => 'BMS # 11', 'name' => 'Rig BMS # 11', 'area' => 'RH-1', 'contract_no' => 'SPHR00797A'],
            ['rig_no' => 'BMS # 10', 'name' => 'Rig BMS # 10', 'area' => 'RH-1', 'contract_no' => 'SPHR00797A'],
            ['rig_no' => 'BMS # 18', 'name' => 'Rig BMS # 18', 'area' => 'North', 'contract_no' => 'SPHR01220A'],
            ['rig_no' => 'BMS # 15', 'name' => 'Rig BMS # 15', 'area' => 'North', 'contract_no' => 'SPHR01220A'],
            ['rig_no' => 'BMS # 07', 'name' => 'Rig BMS # 07', 'area' => 'South', 'contract_no' => 'SPHR01220A'],
        ];

        foreach ($rigsData as $rig) {
            DB::table('rigs')->updateOrInsert(
                ['rig_no' => $rig['rig_no']],
                [
                    'name' => $rig['name'],
                    'area' => $rig['area'],
                    'contract_no' => $rig['contract_no'],
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // ========================================================
        // 2. TABEL PENUGASAN RIG PIC (USER_RIG_ASSIGNMENTS)
        // ========================================================
        if (! Schema::hasTable('user_rig_assignments')) {
            Schema::create('user_rig_assignments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('rig_id')->constrained('rigs')->cascadeOnDelete();
                $table->string('rig_no', 100);
                $table->timestamps();

                $table->unique(['user_id', 'rig_id']);
                $table->index('rig_no');
            });
        }

        // SINKRONKAN DATA PENUGASAN DARI TABEL USERS KE USER_RIG_ASSIGNMENTS
        $allRigs = DB::table('rigs')->get()->keyBy('rig_no');
        $users = DB::table('users')->get();
        foreach ($users as $userRecord) {
            $rigList = [];
            if (! empty($userRecord->assigned_rigs)) {
                $decoded = json_decode($userRecord->assigned_rigs, true);
                if (is_array($decoded)) {
                    $rigList = $decoded;
                }
            }
            if (empty($rigList) && ! empty($userRecord->area) && isset(User::AREA_RIG_MAP[$userRecord->area])) {
                $rigList = User::AREA_RIG_MAP[$userRecord->area];
            }

            foreach ($rigList as $rNo) {
                if (isset($allRigs[$rNo])) {
                    DB::table('user_rig_assignments')->updateOrInsert(
                        ['user_id' => $userRecord->id, 'rig_id' => $allRigs[$rNo]->id],
                        [
                            'rig_no' => $rNo,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                }
            }
        }

        // ========================================================
        // 3. OPTIMALISASI TABEL HSE_REPORTS (SCHEMA, FK & INDEX)
        // ========================================================
        Schema::table('hse_reports', function (Blueprint $table) {
            if (! Schema::hasColumn('hse_reports', 'rig_id')) {
                $table->unsignedBigInteger('rig_id')->nullable()->after('id');
            }
            if (! Schema::hasColumn('hse_reports', 'contract_number')) {
                $table->string('contract_number', 100)->nullable()->after('contract_no');
            }
            if (! Schema::hasColumn('hse_reports', 'month')) {
                $table->unsignedTinyInteger('month')->nullable()->after('period');
            }
        });

        // SINKRONISASI KOLOM DI HSE_REPORTS DENGAN RIGS & PERIOD
        $reports = DB::table('hse_reports')->get();
        foreach ($reports as $rep) {
            $rigId = isset($allRigs[$rep->rig_no]) ? $allRigs[$rep->rig_no]->id : null;
            $monthNum = ! empty($rep->period) ? (int) $rep->period : null;

            DB::table('hse_reports')->where('id', $rep->id)->update([
                'rig_id' => $rigId,
                'contract_number' => $rep->contract_no,
                'month' => $monthNum,
            ]);
        }

        // TAMBAHKAN FOREIGN KEYS & INDEX OPTIMAL PADA HSE_REPORTS
        Schema::table('hse_reports', function (Blueprint $table) {
            // Index kolom & composite index untuk performa filter yang sangat cepat
            $table->index(['rig_id', 'month', 'year'], 'hse_reports_rig_month_year_idx');
            $table->index('rig_id', 'hse_reports_rig_id_idx');
            $table->index('month', 'hse_reports_month_idx');
            $table->index('contract_number', 'hse_reports_contract_number_idx');

            // Foreign Key rig_id -> rigs.id
            $table->foreign('rig_id')
                ->references('id')
                ->on('rigs')
                ->nullOnDelete();

            // Foreign Key created_by -> users.id jika belum ada
            if (Schema::hasColumn('hse_reports', 'created_by')) {
                $table->foreign('created_by')
                    ->references('id')
                    ->on('users')
                    ->nullOnDelete();
            }

            // Foreign Key updated_by -> users.id jika belum ada
            if (Schema::hasColumn('hse_reports', 'updated_by')) {
                $table->foreign('updated_by')
                    ->references('id')
                    ->on('users')
                    ->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hse_reports', function (Blueprint $table) {
            $table->dropForeign(['rig_id']);
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);

            $table->dropIndex('hse_reports_rig_month_year_idx');
            $table->dropIndex('hse_reports_rig_id_idx');
            $table->dropIndex('hse_reports_month_idx');
            $table->dropIndex('hse_reports_contract_number_idx');

            $table->dropColumn(['rig_id', 'contract_number', 'month']);
        });

        Schema::dropIfExists('user_rig_assignments');
        Schema::dropIfExists('rigs');
    }
};
