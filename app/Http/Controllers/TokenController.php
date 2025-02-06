<?php

namespace App\Http\Controllers;

use App\Models\TokenContract;
use App\Models\Address;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TokenController extends Controller
{
    public function getSymbol(Request $request)
    {
        $address = Address::whereLike('address', "{$request->address}", true)->first();

        if (!$address) {
            return Inertia::render('Allowance');
        }
        $contract = TokenContract::where('token_address_id', '=', $address->id)->first();
        // should create relationship to make this work : $contract = $address->tokenContract;
        if (!$contract) {
            return Inertia::render('Allowance');
        }
        return Inertia::render('Allowance', ['symbol' => $contract->symbol]);
    }
}
