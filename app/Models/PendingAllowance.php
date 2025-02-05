<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PendingAllowance extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'pending_allowances';

    protected $fillable = [
        'token_contract_address',
        'owner_address',
        'spender_address',
        'amount',
        'transaction_hash',
        'is_unlimited',
    ];

    protected $casts = [
        'amount' => 'string',
        'token_contract_address' => 'string',
        'owner_address' => 'string',
        'spender_address' => 'string',
        'transacion_hash' => 'string',
        'is_unlimited' => 'boolean'
    ];
}
