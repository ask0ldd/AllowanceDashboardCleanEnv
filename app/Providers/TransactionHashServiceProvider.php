<?php

namespace App\Providers;

use App\Services\TransactionHashService;
use Illuminate\Support\ServiceProvider;

class TransactionHashServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(TransactionHashService::class, function ($app) {
            return new TransactionHashService();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
