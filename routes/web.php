<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AllowanceController;
use App\Http\Controllers\TokenController;
use App\Http\Controllers\DashboardController;

Route::get('/', function () {
    return redirect('/dashboard');
});

Route::get('/dashboard', [DashboardController::class, 'showDashboard'])->name('dashboard');

/*Route::get('/newallowance', function () {
    $tokenList = app(TokenController::class)->getAll();
    return Inertia::render('Allowance', ['tokenList' => $tokenList]);
})->name('newallowance');*/
Route::prefix('/allowance')->controller(AllowanceController::class)->group(function () {
    Route::get('/new', [AllowanceController::class, 'showNewForm'])->name('newallowance');
    Route::get('/edit/{id?}', [AllowanceController::class, 'showEditForm'])->name('editallowance')->defaults('id', 0);
    Route::post('/', [AllowanceController::class, 'save']);
    Route::delete('/delete/{id?}', [AllowanceController::class, 'delete']);
    Route::put('/revoke/{id?}', [AllowanceController::class, 'revoke']);
    Route::put('/', [AllowanceController::class, 'update']);
});

Route::get('/token/symbol', [TokenController::class, 'getSymbol']);

/*
Route::get('/editallowance/{id?}', [AllowanceController::class, 'get'])
    ->name('editallowance')
    ->defaults('id', 0);
*/

/*Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');*/


// Route::get('/', [AppController::class, 'dashboard']);