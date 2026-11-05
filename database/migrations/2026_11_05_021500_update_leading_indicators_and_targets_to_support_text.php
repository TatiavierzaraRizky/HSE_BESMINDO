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
        Schema::table('hse_leading_indicators', function (Blueprint $table) {
            $table->string('indicator_no', 50)->nullable()->change();
            $table->string('target_month', 100)->nullable()->change();
            $table->string('target_year', 100)->nullable()->change();
            $table->string('plan', 100)->nullable()->change();
            $table->string('actual', 100)->nullable()->change();

            if (! Schema::hasColumn('hse_leading_indicators', 'is_parent')) {
                $table->boolean('is_parent')->default(false)->after('indicator_name');
            }
            if (! Schema::hasColumn('hse_leading_indicators', 'parent_name')) {
                $table->string('parent_name', 255)->nullable()->after('is_parent');
            }
            if (! Schema::hasColumn('hse_leading_indicators', 'sub_label')) {
                $table->string('sub_label', 50)->nullable()->after('parent_name');
            }
        });

        Schema::table('hse_kpi_targets', function (Blueprint $table) {
            $table->string('indicator_no', 50)->nullable()->change();
            $table->string('target_month', 100)->nullable()->change();
            $table->string('target_year', 100)->nullable()->change();
            $table->string('plan', 100)->nullable()->change();
            $table->string('actual', 100)->nullable()->change();

            if (! Schema::hasColumn('hse_kpi_targets', 'is_parent')) {
                $table->boolean('is_parent')->default(false)->after('indicator_name');
            }
            if (! Schema::hasColumn('hse_kpi_targets', 'parent_name')) {
                $table->string('parent_name', 255)->nullable()->after('is_parent');
            }
            if (! Schema::hasColumn('hse_kpi_targets', 'sub_label')) {
                $table->string('sub_label', 50)->nullable()->after('parent_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hse_leading_indicators', function (Blueprint $table) {
            if (Schema::hasColumn('hse_leading_indicators', 'sub_label')) {
                $table->dropColumn('sub_label');
            }
            if (Schema::hasColumn('hse_leading_indicators', 'parent_name')) {
                $table->dropColumn('parent_name');
            }
            if (Schema::hasColumn('hse_leading_indicators', 'is_parent')) {
                $table->dropColumn('is_parent');
            }
        });

        Schema::table('hse_kpi_targets', function (Blueprint $table) {
            if (Schema::hasColumn('hse_kpi_targets', 'sub_label')) {
                $table->dropColumn('sub_label');
            }
            if (Schema::hasColumn('hse_kpi_targets', 'parent_name')) {
                $table->dropColumn('parent_name');
            }
            if (Schema::hasColumn('hse_kpi_targets', 'is_parent')) {
                $table->dropColumn('is_parent');
            }
        });
    }
};
