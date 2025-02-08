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

/**
 * Controller for managing allowances.
 */
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

    /**
     * Display the form for creating a new allowance.
     *
     * @return \Inertia\Response The Inertia response containing the Allowance component with token list.
     */
    public function showNewForm(): \Inertia\Response
    {
        $tokenList = $this->tokenService->getAll();
        return Inertia::render('Allowance', ['ownedTokens' => $tokenList]);
    }

    /**
     * Display the form for editing an existing allowance.
     *
     * @param Request $request The incoming HTTP request containing the allowance ID.
     * @return \Inertia\Response The Inertia response containing the Allowance component with existing allowance data and token list.
     *
     * @throws ModelNotFoundException If the requested allowance is not found.
     * @throws \Exception For any other unexpected errors during processing.
     */
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
