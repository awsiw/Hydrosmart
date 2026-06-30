<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SimulationController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function (Illuminate\Http\Request $request) {
    $simulations = \App\Models\Simulation::with('latestLog')
        ->where('user_id', $request->user()->id)
        ->get();
        
    return Inertia::render('Dashboard', [
        'simulations' => $simulations
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/user-guide', function () { return Inertia::render('Dashboard'); })->name('user-guide');

    Route::get('/public', [SimulationController::class, 'directory'])->name('simulations.directory');
    Route::get('/simulations', [SimulationController::class, 'index'])->name('simulations.index');
    Route::post('/simulations', [SimulationController::class, 'store'])->name('simulations.store');
    Route::get('/simulations/new', [SimulationController::class, 'show'])->defaults('title', 'new')->name('simulations.new');
    Route::get('/simulations/{title}', [SimulationController::class, 'show'])->name('simulations.show');
    Route::delete('/simulations/{title}', [SimulationController::class, 'destroy'])->name('simulations.destroy');
    Route::patch('/simulations/{title}/toggle-visibility', [SimulationController::class, 'toggleVisibility'])->name('simulations.toggle-visibility');
    Route::post('/simulations/{title}/chat', [SimulationController::class, 'chat'])->name('simulations.chat');
    Route::post('/simulations/{title}/logs', [SimulationController::class, 'storeLog'])->name('simulations.logs.store');
    Route::delete('/simulations/{title}/logs/{id}', [SimulationController::class, 'destroyLog'])->name('simulations.logs.destroy');
});

require __DIR__.'/auth.php';
