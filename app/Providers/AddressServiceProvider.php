<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\AddressService;

class AddressServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(AddressService::class, function ($app) {
            return new AddressService();
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
