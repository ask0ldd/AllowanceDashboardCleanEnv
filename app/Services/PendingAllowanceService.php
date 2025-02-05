<?php

namespace App\Services;

use App\Models\PendingAllowance;
use Illuminate\Support\Facades\Log;

class PendingAllowanceService
{
    public function findWithHash(string $hash): PendingAllowance
    {
        return PendingAllowance::firstWhere([ // !!! try catch
            'transaction_hash' => $hash
        ]);
    }

    public function create(array $data): PendingAllowance
    {
        return PendingAllowance::create($data); // !!! try catch
    }

    public function doHashExists(string $hash): bool
    {
        return (bool) PendingAllowance::firstWhere([
            'transaction_hash' => $hash
        ]);
    }

    public function deleteWithHash(string $hash) // !!! try chatch / return
    {
        try {
            return PendingAllowance::where('transaction_hash', $hash)->delete();
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return false; // or throw a custom exception
        }
    }
}
