<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Http\Resources\AllowanceResource;
use App\Services\AllowanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    protected $allowanceService;

    public function __construct(AllowanceService $allowanceService)
    {
        $this->allowanceService = $allowanceService;
    }

    public function showDashboard(Request $request): \Inertia\Response
    {
        if (!$request->header('walletAddress')) return Inertia::render('Dashboard');
        $showRevoked = $request->boolean('showRevoked', false);
        $showUnlimitedOnly = $request->boolean('showUnlimitedOnly', false);
        $searchValue = $request->string('searchValue', "");

        $walletAddress = strtolower($request->header('walletAddress'));
        // Log::info($walletAddress);

        $allowances = null;
        if ($showRevoked) {
            $allowances = $this->allowanceService->getFirstTenRevokedAllowancesWith($walletAddress, $searchValue);
        } elseif ($showUnlimitedOnly) {
            $allowances = $this->allowanceService->getFirstTenUnlimitedAllowancesWith($walletAddress, $searchValue);
        } else {
            $allowances = $this->allowanceService->getFistTenActiveAllowancesWith($walletAddress, $searchValue);
        }

        AllowanceResource::withoutWrapping();
        return Inertia::render('Dashboard', [
            'allowances' => AllowanceResource::collection($allowances),
        ]);
    }
}
