<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HseReportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SettingController;

/*
|--------------------------------------------------------------------------
| LOGIN & AUTHENTICATION
|--------------------------------------------------------------------------
*/

Route::get('/', [AuthController::class, 'showLogin']);
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register'])->name('register.attempt');
Route::match(['get', 'post'], '/logout', [AuthController::class, 'logout'])->name('logout');

// FORGOT & RESET PASSWORD
Route::get('/forgot-password', [AuthController::class, 'showForgotPassword'])->name('password.request');
Route::post('/forgot-password', [AuthController::class, 'sendResetLinkEmail'])->name('password.email');
Route::get('/reset-password/{token}', [AuthController::class, 'showResetPassword'])->name('password.reset');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');

/*
|--------------------------------------------------------------------------
| EMAIL APPROVAL CALLBACKS (DIRECT FROM EMAIL CLIENT)
|--------------------------------------------------------------------------
*/

Route::get('/hse-report/approve/{id}/{token}', [
    HseReportController::class,
    'emailApprove',
])->name('hse-report.email-approve');

Route::get('/hse-report/reject/{id}/{token}', [
    HseReportController::class,
    'emailReject',
])->name('hse-report.email-reject');


/*
|--------------------------------------------------------------------------
| USER (FIELD OPERATOR / PIC)
|--------------------------------------------------------------------------
*/

Route::prefix('user')->middleware(['role:user,admin'])->group(function () {
    Route::get('/', function () {
        return redirect()->route('user.input-data');
    });

    Route::get('/input-data', function () {
        return Inertia::render('User/InputData');
    })->name('user.input-data');

    Route::post('/hse-report', [
        HseReportController::class,
        'store'
    ])->name('user.hse-report.store');
});

Route::post('/hse-report', [
    HseReportController::class,
    'store'
])->middleware(['role:user,admin'])->name('hse-report.store');


/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->middleware(['role:admin'])->group(function () {

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

    // Hapus satu report berdasarkan ID (CRUD Delete)
    Route::delete('/hse-report/{id}', [
        HseReportController::class,
        'destroy'
    ])->name('admin.hse-report.destroy');


    /*
    |--------------------------------------------------------------------------
    | HSE PERFORMANCE
    |--------------------------------------------------------------------------
    */

    Route::get('/hse-performance', [
        HseReportController::class,
        'performance',
    ])->name('admin.hse-performance');


    /*
    |--------------------------------------------------------------------------
    | KPI PER RIG
    |--------------------------------------------------------------------------
    */

    Route::get('/kpi-per-rig', [
        HseReportController::class,
        'kpiPerRig',
    ])->name('admin.kpi-per-rig');


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

    Route::get('/approval', [
        HseReportController::class,
        'approvalIndex',
    ])->name('admin.approval');

    Route::post('/approval/{id}', [
        HseReportController::class,
        'updateApprovalStatus',
    ])->name('admin.approval.update');


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

    Route::get('/reports/plan', [
        HseReportController::class,
        'plan',
    ])->name('admin.reports.plan');


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

    Route::get('/reports/actual', [
        HseReportController::class,
        'actual',
    ])->name('admin.reports.actual');


    /*
    |--------------------------------------------------------------------------
    | USER MANAGEMENT
    |--------------------------------------------------------------------------
    */

    Route::get('/users', [UserController::class, 'index'])->name('admin.users');
    Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');
    Route::put('/users/{id}', [UserController::class, 'update'])->name('admin.users.update');
    Route::patch('/users/{id}/toggle-status', [UserController::class, 'toggleStatus'])->name('admin.users.toggle-status');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('admin.users.destroy');


    /*
    |--------------------------------------------------------------------------
    | SETTINGS & PROFILE MANAGEMENT
    |--------------------------------------------------------------------------
    */

    Route::get('/settings', [SettingController::class, 'index'])->name('admin.settings');
    Route::post('/settings/profile', [SettingController::class, 'updateProfile'])->name('admin.settings.profile');
    Route::post('/settings/password', [SettingController::class, 'updatePassword'])->name('admin.settings.password');

});