<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\PendingAllowanceService;

class PendingAllowanceServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(PendingAllowanceService::class, function ($app) {
            return new PendingAllowanceService();
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
