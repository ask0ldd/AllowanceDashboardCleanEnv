<?php

namespace App\Services;

use App\Models\TokenContract;
use App\Http\Resources\TokenContractResource;

/**
 * Service class for handling token-related operations.
 */
class TokenService
{
    /**
     * Retrieve a collection of token contracts.
     *
     * This method fetches the first 10 token contracts with their associated addresses,
     * and returns them as a collection of TokenContractResource objects.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function getAll(): \Illuminate\Http\Resources\Json\AnonymousResourceCollection // \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $tokens = TokenContract::with('address')->take(10)->get();
        TokenContractResource::withoutWrapping(); // destructuring the resource so no such end format : { data : contract array }
        return TokenContractResource::collection($tokens);
    }
}
