<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\AllowanceService;

class AllowanceServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(AllowanceService::class, function ($app) {
            return new AllowanceService();
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
