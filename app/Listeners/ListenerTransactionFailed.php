<?php

namespace App\Listeners;

use App\Events\EventTransactionFailed;

class ListenerTransactionFailed
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
    public function handle(EventTransactionFailed $event): void
    {
        //
    }
}
