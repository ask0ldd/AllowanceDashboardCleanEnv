<?php

namespace App\Services;

use App\Models\TransactionHash;

/**
 * Service class for managing TransactionHash operations.
 */
class TransactionHashService
{
    /**
     * Create a new TransactionHash record.
     *
     * @param int $allowanceId The ID of the associated allowance.
     * @param string $hash The transaction hash.
     * @return TransactionHash The created TransactionHash instance.
     */
    public function create(int $allowanceId, String $hash): TransactionHash
    {
        return TransactionHash::create(['allowance_id' => $allowanceId, 'hash' => $hash]);
    }

    /**
     * Check if a hash already exists in the database.
     *
     * @param string $hash The transaction hash to check.
     * @return bool True if the hash exists, false otherwise.
     */
    public function doHashExists(string $hash): bool
    {
        return (bool) TransactionHash::firstWhere([
            'hash' => $hash
        ]);
    }
}
