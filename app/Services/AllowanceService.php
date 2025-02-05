<?php

namespace App\Services;

use App\Models\Allowance;

class AllowanceService
{
    public function findPreexistingAllowance(array $addresses): ?Allowance
    {
        return Allowance::firstWhere([
            'token_contract_id' => $addresses['token']->id,
            'owner_address_id' => $addresses['owner']->id,
            'spender_address_id' => $addresses['spender']->id,
        ]);
    }

    public function findAllowanceWithAddressesIds(array $addresses): ?Allowance
    {
        return Allowance::where('owner_address_id', $addresses['owner'])
            ->where('token_contract_id', $addresses['token'])
            ->where('spender_address_id', $addresses['spender'])
            ->first();
    }

    public function isSimilarAllowanceRegistered(array $addresses): bool
    {
        return (bool) Allowance::firstWhere([
            'token_contract_id' => $addresses['token']->id,
            'owner_address_id' => $addresses['owner']->id,
            'spender_address_id' => $addresses['spender']->id,
        ]);
    }

    public function createAllowance(array $data): Allowance
    {
        return Allowance::create($data);
    }

    public function getAllowance(int $id): ?Allowance
    {
        try {
            return Allowance::findOrFail($id);
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function getFistTenActiveAllowancesWith(string $searchTerm): \Illuminate\Database\Eloquent\Collection //\Illuminate\Pagination\LengthAwarePaginator
    {
        return Allowance::with(['tokenContract', 'ownerAddress', 'spenderAddress'])
            ->take(10)
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
            ->where(function ($query) {
                $query->where('amount', '>', 0)
                    ->orWhere('is_unlimited', true);
            })
            ->get();
        // ->paginate(10);
    }

    // !!! merge both
    public function getFistTenAllowancesWith(string $searchTerm): \Illuminate\Database\Eloquent\Collection // \Illuminate\Pagination\LengthAwarePaginator
    {
        return Allowance::with(['tokenContract', 'ownerAddress', 'spenderAddress'])
            ->take(10)
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
    }

    public function getFirstTenUnlimitedAllowancesWith(string $searchTerm): \Illuminate\Database\Eloquent\Collection
    {
        return Allowance::with(['tokenContract', 'ownerAddress', 'spenderAddress'])
            ->take(10)
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
            ->where(function ($query) {
                $query->where('is_unlimited', true);
            })
            ->get();
    }

    public function getFirstTenRevokedAllowancesWith(string $searchTerm): \Illuminate\Database\Eloquent\Collection
    {
        return Allowance::with(['tokenContract', 'ownerAddress', 'spenderAddress'])
            ->take(10)
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
            ->where(function ($query) {
                $query->where('is_unlimited', false)->where('amount', 0);
            })
            ->get();
    }
}
