<?php

namespace App\Services;

use App\Models\Address;
use Illuminate\Support\Collection;

/**
 * Class AddressService
 * 
 * This service class provides methods for managing and retrieving addresses.
 * 
 * @package App\Services
 */
class AddressService
{
    /**
     * Get or create addresses from an array of address strings.
     *
     * @param array $addresses An array of address strings
     * @return \Illuminate\Support\Collection A collection of Address models
     */
    public function getOrCreateAddresses(array $addresses): Collection
    {
        return collect($addresses)->map(function ($address) {
            return Address::firstOrCreate(['address' => $address]);
        });
    }

    /**
     * Get or create addresses and return their IDs.
     *
     * @param array $addresses An array of address strings with keys 'owner', 'token', and 'spender'
     * @return array An array containing the IDs of the created or found addresses
     */
    public function getIdsforAddressesOrCreate(array $addresses)
    {
        $createdAddresses = collect($addresses)->mapWithKeys(function ($address, $key) {
            $createdAddress = Address::firstOrCreate(['address' => $address]);
            return [$key => $createdAddress->id];
        });

        return [
            'owner' => $createdAddresses['owner'],
            'token' => $createdAddresses['token'],
            'spender' => $createdAddresses['spender'],
        ];
    }

    /**
     * Get IDs for existing addresses.
     *
     * @param array $addresses An array of address strings with keys 'owner', 'token', and 'spender'
     * @return array An array containing the IDs of the found addresses or null if not found
     */
    public function getIdsForAddresses(array $addresses)
    {
        $foundAddresses = collect($addresses)->mapWithKeys(function ($address, $key) {
            $foundAddress = Address::where('address', $address)->first();
            return [$key => $foundAddress ? $foundAddress->id : null];
        });

        return [
            'owner' => $foundAddresses['owner'],
            'token' => $foundAddresses['token'],
            'spender' => $foundAddresses['spender'],
        ];
    }

    /**
     * Check if the requested addresses match an existing allowance.
     *
     * @param array $validated An array containing validated data with keys 'ownerAddress', 'ERC20TokenAddress', and 'spenderAddress'
     * @param mixed $allowance The allowance object to compare against
     * @return bool Returns true if the addresses match the existing allowance, false otherwise
     */
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
        // Case-insensitive queries
        /*$ownerAddress = Address::whereRaw('LOWER(address) = ?', [strtolower($validated['ownerAddress'])])->firstOrFail();
        $tokenAddress = Address::whereRaw('LOWER(address) = ?', [strtolower($validated['ERC20TokenAddress'])])->firstOrFail();
        $spenderAddress = Address::whereRaw('LOWER(address) = ?', [strtolower($validated['spenderAddress'])])->firstOrFail();

        if (
            $allowance->token_contract_id !== $tokenAddress->id ||
            $allowance->owner_address_id !== $ownerAddress->id ||
            $allowance->spender_address_id !== $spenderAddress->id
        ) return false;

        return true;*/
    }
}
