<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AppController;
use App\Http\Controllers\AllowanceController;
use App\Http\Controllers\TokenController;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect('/dashboard');
});

Route::get('/dashboard', [AllowanceController::class, 'getAll'])->name('dashboard');

/*Route::get('/newallowance', function () {
    $tokenList = app(TokenController::class)->getAll();
    return Inertia::render('Allowance', ['tokenList' => $tokenList]);
})->name('newallowance');*/
/*Route::prefix('allowance')->controller(AllowanceController::class)->group(function(){
})*/
Route::get('/allowance/new', [AllowanceController::class, 'new'])->name('newallowance');

Route::get('/allowance/edit/{id?}', [AllowanceController::class, 'edit'])->name('editallowance')->defaults('id', 0);

Route::post('/allowance', [AllowanceController::class, 'save']);


/*
Route::get('/editallowance/{id?}', [AllowanceController::class, 'get'])
    ->name('editallowance')
    ->defaults('id', 0);
*/

/*Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');*/


// Route::get('/', [AppController::class, 'dashboard']);