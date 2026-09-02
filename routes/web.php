<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\HseReportController;

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Login');
});

Route::get('/login', function () {
    return Inertia::render('Login');
});


/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | DASHBOARD
    |--------------------------------------------------------------------------
    */

    Route::get('/dashboard', function () {
        return Inertia::render('Admin/AdminDashboard');
    })->name('admin.dashboard');


    /*
    |--------------------------------------------------------------------------
    | INPUT DATA HSE
    |--------------------------------------------------------------------------
    */

    Route::get('/input-data', function () {
        return Inertia::render('Admin/InputData');
    })->name('admin.input-data');


    /*
    |--------------------------------------------------------------------------
    | HSE REPORT API
    |--------------------------------------------------------------------------
    */

    // Simpan data HSE
    Route::post('/hse-report', [
        HseReportController::class,
        'store'
    ])->name('admin.hse-report.store');


    // Ambil daftar report
    Route::get('/hse-report', [
        HseReportController::class,
        'index'
    ])->name('admin.hse-report.index');


    // Ambil satu report berdasarkan ID
    Route::get('/hse-report/{id}', [
        HseReportController::class,
        'show'
    ])->name('admin.hse-report.show');


    /*
    |--------------------------------------------------------------------------
    | HSE PERFORMANCE
    |--------------------------------------------------------------------------
    */

    Route::get('/hse-performance', function () {
        return Inertia::render('Admin/HSEPerformance');
    })->name('admin.hse-performance');


    /*
    |--------------------------------------------------------------------------
    | KPI PER RIG
    |--------------------------------------------------------------------------
    */

    Route::get('/kpi-per-rig', function () {
        return Inertia::render('Admin/KPIPerRig');
    })->name('admin.kpi-per-rig');


    /*
    |--------------------------------------------------------------------------
    | TARGET KPI MANAGEMENT
    |--------------------------------------------------------------------------
    */

    Route::get('/target-kpi', function () {
        return Inertia::render('Admin/TargetKPIManagement');
    })->name('admin.target-kpi');


    /*
    |--------------------------------------------------------------------------
    | CONTRACT MANAGEMENT
    |--------------------------------------------------------------------------
    */

    Route::get('/contract-management', function () {
        return Inertia::render('Admin/ContractManagement');
    })->name('admin.contract-management');


    /*
    |--------------------------------------------------------------------------
    | RIG MANAGEMENT
    |--------------------------------------------------------------------------
    */

    Route::get('/rig-management', function () {
        return Inertia::render('Admin/RigManagement');
    })->name('admin.rig-management');


    /*
    |--------------------------------------------------------------------------
    | APPROVAL
    |--------------------------------------------------------------------------
    */

    Route::get('/approval', function () {
        return Inertia::render('Admin/Approval');
    })->name('admin.approval');


    /*
    |--------------------------------------------------------------------------
    | REPORTS UTAMA
    |--------------------------------------------------------------------------
    */

    Route::get('/reports', [
        HseReportController::class,
        'index'
    ])->name('admin.reports');


    /*
    |--------------------------------------------------------------------------
    | REPORT PLAN
    |--------------------------------------------------------------------------
    |
    | Halaman khusus untuk menampilkan:
    | - Plan
    | - Januari - Desember
    | - Q1 - Q4
    | - YTD
    |
    */

    Route::get('/reports/plan', function () {
        return Inertia::render('Admin/PlanReport');
    })->name('admin.reports.plan');


    /*
    |--------------------------------------------------------------------------
    | REPORT ACTUAL
    |--------------------------------------------------------------------------
    |
    | Halaman khusus untuk menampilkan:
    | - Actual
    | - Januari - Desember
    | - Q1 - Q4
    | - YTD
    |
    */

    Route::get('/reports/actual', function () {
        return Inertia::render('Admin/ActualReport');
    })->name('admin.reports.actual');


    /*
    |--------------------------------------------------------------------------
    | USER MANAGEMENT
    |--------------------------------------------------------------------------
    */

    Route::get('/users', function () {
        return Inertia::render('Admin/UserManagement');
    })->name('admin.users');

});