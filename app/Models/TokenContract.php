<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Address;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TokenContract extends Model
{
    use HasFactory;

    protected $fillable = [
        'token_address_id',
        'name',
        'symbol',
        'decimals',
    ];

    protected $casts = [
        'token_address_id' => 'integer',
        'decimals' => 'integer',
    ];

    public function address()
    {
        return $this->belongsTo(Address::class, 'token_address_id');
    }
}

?>
