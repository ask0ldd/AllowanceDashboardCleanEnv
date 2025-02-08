<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * Controller for handling account-related operations.
 */
class AccountController extends Controller
{
    /**
     * Set the account address in the session.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function setSessionAccount(Request $request)
    {
        $address = $request->input('address');
        session(['accountAddress' => $address]);
        return response()->json(['success' => true]);
    }
}
