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
            $table->string('submitter_name', 255)->nullable()->after('submitter_role');
            $table->string('submitter_email', 255)->nullable()->after('submitter_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hse_reports', function (Blueprint $table) {
            $table->dropColumn(['submitter_name', 'submitter_email']);
        });
    }
};
