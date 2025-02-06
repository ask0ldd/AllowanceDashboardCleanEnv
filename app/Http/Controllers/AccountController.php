<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function setSessionAccount(Request $request)
    {
        $address = $request->input('address');
        session(['accountAddress' => $address]);
        return response()->json(['success' => true]);
    }
}
