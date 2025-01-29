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
}
