<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Audit trail & latest admin note on hse_reports
        Schema::table('hse_reports', function (Blueprint $table) {
            if (! Schema::hasColumn('hse_reports', 'updated_by')) {
                $table->unsignedBigInteger('updated_by')->nullable()->after('created_by');
            }
            if (! Schema::hasColumn('hse_reports', 'submitted_by')) {
                $table->unsignedBigInteger('submitted_by')->nullable()->after('updated_by');
            }
            if (! Schema::hasColumn('hse_reports', 'latest_admin_note')) {
                $table->text('latest_admin_note')->nullable()->after('rejection_reason');
            }
        });

        // 2. assigned_rigs on users table
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'assigned_rigs')) {
                $table->json('assigned_rigs')->nullable()->after('area');
            }
        });

        // 3. hse_report_rejection_logs table
        if (! Schema::hasTable('hse_report_rejection_logs')) {
            Schema::create('hse_report_rejection_logs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('report_id');
                $table->unsignedBigInteger('admin_id')->nullable();
                $table->string('admin_name')->nullable();
                $table->integer('revision_number')->default(1);
                $table->text('rejection_reason');
                $table->timestamps();

                $table->foreign('report_id')
                    ->references('id')
                    ->on('hse_reports')
                    ->cascadeOnDelete();

                $table->index('report_id');
                $table->index('admin_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hse_report_rejection_logs');

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'assigned_rigs')) {
                $table->dropColumn('assigned_rigs');
            }
        });

        Schema::table('hse_reports', function (Blueprint $table) {
            $colsToDrop = [];
            if (Schema::hasColumn('hse_reports', 'updated_by')) {
                $colsToDrop[] = 'updated_by';
            }
            if (Schema::hasColumn('hse_reports', 'submitted_by')) {
                $colsToDrop[] = 'submitted_by';
            }
            if (Schema::hasColumn('hse_reports', 'latest_admin_note')) {
                $colsToDrop[] = 'latest_admin_note';
            }
            if (! empty($colsToDrop)) {
                $table->dropColumn($colsToDrop);
            }
        });
    }
};
