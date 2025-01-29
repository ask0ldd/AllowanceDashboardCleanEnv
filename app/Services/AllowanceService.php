<?php

namespace App\Services;

use App\Models\Address;
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

    public function createAllowance(array $data): Allowance
    {
        return Allowance::create($data);
    }
}
