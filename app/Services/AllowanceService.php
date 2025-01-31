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

    public function getAllowance($id): ?Allowance
    {
        try {
            return Allowance::findOrFail($id);
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function getFistTenActiveAllowances(): \Illuminate\Database\Eloquent\Collection
    {
        return Allowance::with(['tokenContract', 'ownerAddress', 'spenderAddress'])
            ->take(10)
            ->where(function ($query) {
                $query->where('amount', '>', 0)
                    ->orWhere('is_unlimited', true);
            })
            ->get(); // !! should use paginate
    }

    // !!! merge both
    public function getFistTenAllowances(): \Illuminate\Database\Eloquent\Collection
    {
        return Allowance::with(['tokenContract', 'ownerAddress', 'spenderAddress'])
            ->take(10)
            ->get(); // !! should use paginate
    }

    public function getFistTenActiveAllowancesWith(String $searchTerm): \Illuminate\Database\Eloquent\Collection
    {
        return Allowance::with(['tokenContract', 'ownerAddress', 'spenderAddress'])
            ->take(10)
            ->where(function ($query) {
                $query->where('amount', '>', 0)
                    ->orWhere('is_unlimited', true);
            })
            /*->whereHas('tokenContract', function ($q) use ($searchTerm) {
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
            })*/
            ->get(); // !! should use paginate
    }

    // !!! merge both
    public function getFistTenAllowancesWith(String $searchTerm): \Illuminate\Database\Eloquent\Collection
    {
        return Allowance::with(['tokenContract', 'ownerAddress', 'spenderAddress'])
            ->take(10)
            /*->whereHas('tokenContract', function ($q) use ($searchTerm) {
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
            })*/
            ->get(); // !! should use paginate
    }
}
