<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AllowanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tokenContractId' => $this->token_contract_id,
            'ownerAddressId' => $this->owner_address_id,
            'spenderAddressId' => $this->spender_address_id,
            'amount' => $this->amount,
            'tokenContractAddress' => $this->tokenContract->address->address,
            'tokenContractSymbol' => $this->tokenContract->symbol,
            'tokenContractName' => $this->tokenContract->name,
            'ownerAddress' => $this->ownerAddress->address,
            'spenderAddress' => $this->spenderAddress->address,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
            'isUnlimited' => $this->is_unlimited,
            'pending' => $this->pending,
        ];
    }
}
