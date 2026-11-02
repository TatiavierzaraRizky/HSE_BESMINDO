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
        Schema::table('hse_reports', function (Blueprint $table) {
            $table->string('evidence_file', 500)->nullable()->after('remarks');
            $table->string('evidence_file_name', 255)->nullable()->after('evidence_file');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hse_reports', function (Blueprint $table) {
            $table->dropColumn(['evidence_file', 'evidence_file_name']);
        });
    }
};
