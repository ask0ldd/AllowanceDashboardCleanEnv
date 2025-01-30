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
            ->get();
    }
}
