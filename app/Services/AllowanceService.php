<?php

namespace App\Services;

use App\Models\Allowance;

/**
 * Class AllowanceService
 *
 * This service class handles operations related to Allowance models.
 *
 * @package App\Services
 */
class AllowanceService
{
    /**
     * Find a pre-existing allowance based on given addresses.
     *
     * @param array $addresses An array containing 'token', 'owner', and 'spender' addresses
     * @return Allowance|null The found Allowance or null if not found
     */
    public function findPreexistingAllowance(array $addresses): ?Allowance
    {
        return Allowance::firstWhere([
            'token_contract_id' => $addresses['token']->id,
            'owner_address_id' => $addresses['owner']->id,
            'spender_address_id' => $addresses['spender']->id,
        ]);
    }

    /**
     * Find an allowance using address IDs.
     *
     * @param array $addresses An array containing 'owner', 'token', and 'spender' address IDs
     * @return Allowance|null The found Allowance or null if not found
     */
    public function findAllowanceWithAddressesIds(array $addresses): ?Allowance
    {
        return Allowance::where('owner_address_id', $addresses['owner'])
            ->where('token_contract_id', $addresses['token'])
            ->where('spender_address_id', $addresses['spender'])
            ->first();
    }

    /**
     * Check if a similar allowance is registered.
     *
     * @param array $addresses An array containing 'token', 'owner', and 'spender' addresses
     * @return bool True if a similar allowance exists, false otherwise
     */
    public function isSimilarAllowanceRegistered(array $addresses): bool
    {
        return (bool) Allowance::firstWhere([
            'token_contract_id' => $addresses['token']->id,
            'owner_address_id' => $addresses['owner']->id,
            'spender_address_id' => $addresses['spender']->id,
        ]);
    }

    /**
     * Create a new allowance.
     *
     * @param array $data The data for creating the allowance
     * @return Allowance The created Allowance instance
     */
    public function createAllowance(array $data): Allowance
    {
        return Allowance::create($data);
    }

    /**
     * Get an allowance by its ID.
     *
     * @param int $id The ID of the allowance
     * @return Allowance|null The found Allowance or null if not found
     * @throws \Exception If the allowance is not found
     */
    public function getAllowance(int $id): ?Allowance
    {
        try {
            return Allowance::findOrFail($id);
        } catch (\Exception $e) {
            throw $e;
        }
    }

    /**
     * Get the first ten active allowances for a wallet address with a search term.
     *
     * @param string $walletAddress The wallet address to search for
     * @param string $searchTerm The search term to filter results
     * @return Collection A collection of Allowance models
     */
    public function getFistTenActiveAllowancesWith(string $walletAddress, string $searchTerm): \Illuminate\Database\Eloquent\Collection //\Illuminate\Pagination\LengthAwarePaginator
    {
        return Allowance::with(['tokenContract', 'ownerAddress', 'spenderAddress'])
            ->whereHas('ownerAddress', function ($q) use ($walletAddress) {
                $q->where('address', $walletAddress);
            })
            ->where(function ($query) use ($searchTerm) {
                $query->whereHas('tokenContract', function ($q) use ($searchTerm) {
                    $q->where('name', 'LIKE', '%' . strtolower($searchTerm) . '%')
                        ->orWhereHas('address', function ($subq) use ($searchTerm) {
                            $subq->where('address', 'LIKE', '%' . strtolower($searchTerm) . '%');
                        })
                        ->orWhere('symbol', 'LIKE', '%' . strtolower($searchTerm) . '%');
                })
                    ->orWhereHas('spenderAddress', function ($q) use ($searchTerm) {
                        $q->where('address', 'LIKE', '%' . strtolower($searchTerm) . '%');
                    });
            })
            ->where(function ($query) {
                $query->where('amount', '>', 0)
                    ->orWhere('is_unlimited', true);
            })
            // ->take(10)
            ->get();
        // ->paginate(10);
    }

    /**
     * Get the first ten unlimited allowances for a wallet address with a search term.
     *
     * @param string $walletAddress The wallet address to search for
     * @param string $searchTerm The search term to filter results
     * @return Collection A collection of Allowance models
     */
    public function getFirstTenUnlimitedAllowancesWith(string $walletAddress, string $searchTerm): \Illuminate\Database\Eloquent\Collection
    {
        return Allowance::with(['tokenContract', 'ownerAddress', 'spenderAddress'])
            ->where('is_unlimited', true)
            ->whereHas('ownerAddress', function ($q) use ($walletAddress) {
                $q->where('address', $walletAddress);
            })
            ->where(function ($query) use ($searchTerm) {
                $query->whereHas('tokenContract', function ($q) use ($searchTerm) {
                    $q->where('name', 'LIKE', '%' . strtolower($searchTerm) . '%')
                        ->orWhereHas('address', function ($subq) use ($searchTerm) {
                            $subq->where('address', 'LIKE', '%' . strtolower($searchTerm) . '%');
                        })
                        ->orWhere('symbol', 'LIKE', '%' . strtolower($searchTerm) . '%');
                })
                    ->orWhereHas('spenderAddress', function ($q) use ($searchTerm) {
                        $q->where('address', 'LIKE', '%' . strtolower($searchTerm) . '%');
                    });
            })
            // ->take(10)
            ->get();
    }

    /**
     * Get the first ten revoked allowances for a wallet address with a search term.
     *
     * @param string $walletAddress The wallet address to search for
     * @param string $searchTerm The search term to filter results
     * @return Collection A collection of Allowance models
     */
    public function getFirstTenRevokedAllowancesWith(string $walletAddress, string $searchTerm): \Illuminate\Database\Eloquent\Collection
    {
        return Allowance::with(['tokenContract', 'ownerAddress', 'spenderAddress'])
            // ->take(10)
            ->where(function ($query) {
                $query->where('is_unlimited', false)->where('amount', 0);
            })
            ->whereHas('ownerAddress', function ($q) use ($walletAddress) {
                $q->where('address', $walletAddress);
            })
            ->where(function ($query) use ($searchTerm) {
                $query->whereHas('tokenContract', function ($q) use ($searchTerm) {
                    $q->where('name', 'LIKE', '%' . strtolower($searchTerm) . '%')
                        ->orWhereHas('address', function ($subq) use ($searchTerm) {
                            $subq->where('address', 'LIKE', '%' . strtolower($searchTerm) . '%');
                        })
                        ->orWhere('symbol', 'LIKE', '%' . strtolower($searchTerm) . '%');
                })
                    ->orWhereHas('ownerAddress', function ($q) use ($searchTerm) {
                        $q->where('address', 'LIKE', '%' . strtolower($searchTerm) . '%');
                    })
                    ->orWhereHas('spenderAddress', function ($q) use ($searchTerm) {
                        $q->where('address', 'LIKE', '%' . strtolower($searchTerm) . '%');
                    });
            })
            ->get();
    }

    /**
     * Get the first ten active allowances for a wallet address.
     *
     * @param string $walletAddress The wallet address to search for
     * @return Collection A collection of Allowance models
     */
    public function getFistTenActiveAllowancesFor(string $walletAddress): \Illuminate\Database\Eloquent\Collection //\Illuminate\Pagination\LengthAwarePaginator
    {
        return Allowance::with(['ownerAddress'])
            ->whereHas('ownerAddress', function ($q) use ($walletAddress) {
                $q->where('address', $walletAddress);
            })
            ->where(function ($query) {
                $query->where('amount', '>', 0)
                    ->orWhere('is_unlimited', true);
            })
            // ->take(10)
            ->get();
    }

    /*public function getFistTenAllowancesWith(string $searchTerm): \Illuminate\Database\Eloquent\Collection // \Illuminate\Pagination\LengthAwarePaginator
    {
        return Allowance::with(['tokenContract', 'ownerAddress', 'spenderAddress'])
            // ->take(10)
            ->whereHas('tokenContract', function ($q) use ($searchTerm) {
                $q->where('name', 'LIKE', '%' . strtolower($searchTerm) . '%')
                    ->orWhereHas('address', function ($subq) use ($searchTerm) {
                        $subq->where('address', 'LIKE', '%' . strtolower($searchTerm) . '%');
                    })
                    ->orWhere('symbol', 'LIKE', '%' . strtolower($searchTerm) . '%');
            })
            ->orWhereHas('ownerAddress', function ($q) use ($searchTerm) {
                $q->where('address', 'LIKE', '%' . strtolower($searchTerm) . '%');
            })
            ->orWhereHas('spenderAddress', function ($q) use ($searchTerm) {
                $q->where('address', 'LIKE', '%' . strtolower($searchTerm) . '%');
            })
            ->get();
        // ->paginate(10);
    }*/
}
