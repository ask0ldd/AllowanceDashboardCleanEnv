<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Http\Resources\AllowanceResource;
use App\Services\AllowanceService;
use Illuminate\Http\Request;

/**
 * Controller for handling dashboard-related operations.
 */
class DashboardController extends Controller
{
    protected $allowanceService;

    public function __construct(AllowanceService $allowanceService)
    {
        $this->allowanceService = $allowanceService;
    }

    /**
     * Display the dashboard with filtered allowances.
     *
     * @param Request $request The incoming HTTP request
     * @return \Inertia\Response
     */
    public function showDashboard(Request $request): \Inertia\Response
    {
        if (!$request->header('walletAddress')) return Inertia::render('Dashboard');
        $showRevoked = $request->boolean('showRevoked', false);
        $showUnlimitedOnly = $request->boolean('showUnlimitedOnly', false);
        $searchValue = $request->string('searchValue', "");
        $resetFilters = $request->string('resetFilters', false);

        $walletAddress = strtolower($request->header('walletAddress'));

        $allowances = null;
        // !!! should add sorting to the table
        if ($showRevoked) {
            $allowances = $this->allowanceService->getFirstTenRevokedAllowancesWith($walletAddress, $searchValue);
        } elseif ($showUnlimitedOnly) {
            $allowances = $this->allowanceService->getFirstTenUnlimitedAllowancesWith($walletAddress, $searchValue);
        } else {
            $allowances = $this->allowanceService->getFistTenActiveAllowancesWith($walletAddress, $searchValue);
        }

        session()->flash('resetFilters', $resetFilters);

        AllowanceResource::withoutWrapping();
        return Inertia::render('Dashboard', [
            'allowances' => AllowanceResource::collection($allowances),
        ]);
    }
}
