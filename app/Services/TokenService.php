<?php

namespace App\Services;

use App\Models\TokenContract;
use App\Http\Resources\TokenContractResource;

class TokenService
{
    public function getAll(): \Illuminate\Http\Resources\Json\AnonymousResourceCollection // \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $tokens = TokenContract::with('address')->take(10)->get();
        TokenContractResource::withoutWrapping(); // destructuring the resource so no such end format : { data : contract array }
        return TokenContractResource::collection($tokens);
    }
}
