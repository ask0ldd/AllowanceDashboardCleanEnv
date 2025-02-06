<?php

namespace App\Http\Controllers;

use App\Http\Resources\AllowanceResource;
use App\Models\Allowance;
use App\Services\AllowanceService;
use App\Services\TokenService;
use App\Services\AddressService;
use App\Services\TransactionHashService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Http\Resources\TokenContractResource;

class AllowanceController extends Controller
{
    protected $allowanceService;
    protected $addressService;
    protected $tokenService;
    protected $transactionHashService;

    public function __construct(AllowanceService $allowanceService, AddressService $addressService, TokenService $tokenService, TransactionHashService $transactionHashService)
    {
        $this->allowanceService = $allowanceService;
        $this->addressService = $addressService;
        $this->tokenService = $tokenService;
        $this->transactionHashService = $transactionHashService;
    }

    public function showNewForm(): \Inertia\Response
    {
        $tokenList = $this->tokenService->getAll();
        return Inertia::render('Allowance', ['ownedTokens' => $tokenList]);
    }

    public function showEditForm(Request $request): \Inertia\Response
    {
        try {
            // $tokenList = $request->header('walletAddress') ? $this->tokenService->getAll() : new TokenContractResource([]);
            $tokenList = $this->tokenService->getAll();
            $allowance = Allowance::findOrFail($request->id);
            AllowanceResource::withoutWrapping();
            return Inertia::render('Allowance', [
                'existingAllowance' => AllowanceResource::make($allowance),
                'ownedTokens' => $tokenList,
            ]);
        } catch (ModelNotFoundException $e) {
            return Inertia::render('Page404', [
                'message' => 'Allowance not found',
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Page404', [
                'message' => 'An error occurred while processing your request',
            ]);
        }
    }
}
