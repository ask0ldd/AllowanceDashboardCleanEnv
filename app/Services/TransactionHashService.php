<?php

namespace App\Services;

use App\Models\TransactionHash;

class TransactionHashService
{
    public function create(int $allowanceId, String $hash): TransactionHash
    {
        return TransactionHash::create(['allowance_id' => $allowanceId, 'hash' => $hash]);
    }

    public function doHashExists(string $hash): bool
    {
        return (bool) TransactionHash::firstWhere([
            'hash' => $hash
        ]);
    }
}
