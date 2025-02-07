<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class EventTransactionComplete implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $hash;

    /**
     * Create a new event instance.
     */
    public function __construct(string $hash)
    {
        Log::info('EventTransactionComplete constructed', ['data' => $hash]); // !!!
        $this->hash = $hash;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel
     */
    public function broadcastOn(): Channel
    {
        return new Channel('transaction-results');
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'transaction.complete';
    }

    /*public function broadcastWhen(): bool
    {
        try {
            // Attempt to check broadcasting connection
            // This is a placeholder; implement actual connection check
            $this->checkBroadcastingConnection();
            return true;
        } catch (BroadcastException $e) {
            Log::error('Broadcasting failed', ['error' => $e->getMessage()]);
            // Handle the error (e.g., store in database for retry)
            $this->handleBroadcastingError();
            return false;
        }
    }

    private function checkBroadcastingConnection()
    {
    }

    private function handleBroadcastingError()
    {
    }*/
}
