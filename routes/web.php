<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AppController;
use Inertia\Inertia;

// Route::get('/', [AppController::class, 'dashboard']);

Route::get('/', function () {
    return redirect('/dashboard');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

Route::get('/newallowance', function () {
    return Inertia::render('AddAllowance');
})->name('newallowance');
