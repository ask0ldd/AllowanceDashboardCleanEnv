<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Allowance extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'allowances';

    protected $fillable = [
        'token_contract_id',
        'owner_address_id',
        'spender_address_id',
        'amount',
        // 'transaction_hash',
        'is_unlimited',
    ];

    protected $casts = [
        'amount' => 'string',
        'token_contract_id' => 'integer',
        'owner_address_id' => 'integer',
        'spender_address_id' => 'integer',
        'is_unlimited' => 'boolean'
    ];

    public function tokenContract()
    {
        return $this->belongsTo(TokenContract::class);
    }

    public function ownerAddress()
    {
        return $this->belongsTo(Address::class, 'owner_address_id');
    }

    public function spenderAddress()
    {
        return $this->belongsTo(Address::class, 'spender_address_id');
    }
}
