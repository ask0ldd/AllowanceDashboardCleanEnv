<?php

use App\Http\Controllers\AccountController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AllowanceController;
use App\Http\Controllers\AllowanceQueueController;
use App\Http\Controllers\TokenController;
use App\Http\Controllers\DashboardController;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect('/dashboard');
});

Route::get('/dashboard', [DashboardController::class, 'showDashboard'])->name('dashboard')/*->where('path', '.*')*/;

Route::prefix('/allowance')->controller(AllowanceController::class)->group(function () {
    Route::get('/new', [AllowanceController::class, 'showNewForm'])->name('newallowance');
    Route::get('/edit/{id?}', [AllowanceController::class, 'showEditForm'])->name('editallowance')->defaults('id', 0);
    Route::post('/queue', [AllowanceQueueController::class, 'add']);
    Route::put('/queue/{id?}', [AllowanceQueueController::class, 'add']);
    Route::put('/queue/revoke/{id?}', [AllowanceQueueController::class, 'add']);
});

Route::get('/token/symbol', [TokenController::class, 'getSymbol']);

Route::post('/set-account', [AccountController::class, 'setSessionAccount']);

Route::fallback(function () {
    return Inertia::render('Page404');
})->name('page404');

// Route::post('/', [AllowanceController::class, 'save']);
// Route::put('/revoke/{id?}', [AllowanceController::class, 'revoke']);
// Route::put('/{id?}', [AllowanceController::class, 'update']);
