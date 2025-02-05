<?php

namespace App\Listeners;

use App\Events\EventTransactionComplete;

class ListenerTransactionComplete
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(EventTransactionComplete $event): void
    {
        //
    }
}
