<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hse_reports', function (Blueprint $table) {
            $table->string('location_district', 150)
                ->nullable()
                ->after('focus_project');
        });
    }

    public function down(): void
    {
        Schema::table('hse_reports', function (Blueprint $table) {
            $table->dropColumn('location_district');
        });
    }
};