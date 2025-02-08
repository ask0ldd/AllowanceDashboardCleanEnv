<?php

namespace App\Services;

use App\Models\PendingAllowance;
use Illuminate\Support\Facades\Log;

/**
 * Service class for managing PendingAllowance operations.
 */
class PendingAllowanceService
{
    /**
     * Find a PendingAllowance by its transaction hash.
     *
     * @param string $hash The transaction hash to search for.
     * @return PendingAllowance|null The found PendingAllowance or null if not found.
     */
    public function findWithHash(string $hash): PendingAllowance
    {
        return PendingAllowance::firstWhere([ // !!! try catch
            'transaction_hash' => $hash
        ]);
    }

    /**
     * Create a new PendingAllowance.
     *
     * @param array $data The data to create the PendingAllowance with.
     * @return PendingAllowance The newly created PendingAllowance.
     * @throws \Exception If there's an error during creation.
     */
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

    /**
     * Check if a PendingAllowance with the given hash exists.
     *
     * @param string $hash The transaction hash to check.
     * @return bool True if a PendingAllowance with the hash exists, false otherwise.
     */
    public function deleteWithHash(string $hash): bool // !!! try chatch / return
    {
        try {
            return PendingAllowance::where('transaction_hash', $hash)->delete();
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return false; // or throw a custom exception
        }
    }
}
