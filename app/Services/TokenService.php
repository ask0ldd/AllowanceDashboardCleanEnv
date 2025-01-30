<?php

namespace App\Services;

use App\Models\TokenContract;
use Illuminate\Support\Collection;
use App\Http\Resources\TokenContractResource;

class TokenService
{
    // !!! rename?!! getTen
    public function getAll(): \Illuminate\Http\Resources\Json\AnonymousResourceCollection // \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        // return TokenContract::with('address')->paginate(10);
        $tokens = TokenContract::with('address')->take(10)->get();
        TokenContractResource::withoutWrapping(); // destructuring the resource no : { data : contract array }
        return TokenContractResource::collection($tokens);
    }
}
