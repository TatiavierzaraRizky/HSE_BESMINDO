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
        Schema::table('hse_kpi_targets', function (Blueprint $table) {
            if (! Schema::hasColumn('hse_kpi_targets', 'category')) {
                $table->string('category', 50)->default('leading')->after('indicator_name')->index();
            }

            if (! Schema::hasColumn('hse_kpi_targets', 'monthly_plans')) {
                $table->json('monthly_plans')->nullable()->after('plan');
            }

            if (! Schema::hasColumn('hse_kpi_targets', 'order_no')) {
                $table->integer('order_no')->default(0)->after('indicator_no');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hse_kpi_targets', function (Blueprint $table) {
            if (Schema::hasColumn('hse_kpi_targets', 'category')) {
                $table->dropColumn('category');
            }

            if (Schema::hasColumn('hse_kpi_targets', 'monthly_plans')) {
                $table->dropColumn('monthly_plans');
            }

            if (Schema::hasColumn('hse_kpi_targets', 'order_no')) {
                $table->dropColumn('order_no');
            }
        });
    }
};
