<?php

namespace App\Services;

use App\Models\Address;
use Illuminate\Support\Collection;

class AddressService
{
    public function getOrCreateAddresses(array $addresses): Collection
    {
        return collect($addresses)->map(function ($address) {
            return Address::firstOrCreate(['address' => $address]);
        });
    }

    public function doRequestAddressesMatchExistingAllowance($validated, $allowance): bool
    {
        // hardcoded for simplicity
        $ownerAddress = Address::where('address', $validated['ownerAddress'])->firstOrFail();
        $tokenAddress = Address::where('address', $validated['ERC20TokenAddress'])->firstOrFail();
        $spenderAddress = Address::where('address', $validated['spenderAddress'])->firstOrFail();
        if (
            $allowance->token_contract_id !== $tokenAddress->id ||
            $allowance->owner_address_id !== $ownerAddress->id ||
            $allowance->spender_address_id !== $spenderAddress->id
        ) return false;
        return true;
    }
}
