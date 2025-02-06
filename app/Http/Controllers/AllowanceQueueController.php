<?php

namespace App\Http\Controllers;

use App\Jobs\CheckHoleskyTransactionJob;
use App\Models\Allowance;
use App\Services\AllowanceService;
use App\Services\TokenService;
use App\Services\AddressService;
use App\Services\PendingAllowanceService;
use App\Services\TransactionHashService;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

use Illuminate\Foundation\Http\FormRequest;

class AllowanceQueueController extends Controller
{
    protected $allowanceService;
    protected $addressService;
    protected $tokenService;
    protected $transactionHashService;
    protected $pendingAllowanceService;

    public function __construct(AllowanceService $allowanceService, PendingAllowanceService $pendingAllowanceService, AddressService $addressService, TokenService $tokenService, TransactionHashService $transactionHashService)
    {
        $this->allowanceService = $allowanceService;
        $this->addressService = $addressService;
        $this->tokenService = $tokenService;
        $this->transactionHashService = $transactionHashService;
        $this->pendingAllowanceService = $pendingAllowanceService;
    }

    public function add(LowercaseRequest $request)
    {
        try {
            $validation_messages = [
                'spenderAddress.not_in' => 'The spender address cannot be the same as the token address.',
                'ownerAddress.not_in' => 'The spender address cannot be the same as the token address.',
            ];

            $validated = $request->validate([
                'ownerAddress' => ['required', 'string', 'size:42', 'regex:/^0x[a-fA-F0-9]{40}$/', Rule::notIn([$request->input('ERC20TokenAddress')])],
                'ERC20TokenAddress' => ['required', 'string', 'size:42', 'regex:/^0x[a-fA-F0-9]{40}$/'],
                'spenderAddress' => ['required', 'string', 'size:42', 'regex:/^0x[a-fA-F0-9]{40}$/', Rule::notIn([$request->input('ERC20TokenAddress')])],
                'spenderName' => ['string', 'max:50', 'nullable'],
                'amount' => ['numeric', 'min:0', 'required_without:isUnlimited'],
                'isUnlimited' => ['boolean', 'required_without:amount'],
                'transactionHash' => ['string', 'required', 'size:66', 'regex:/^0x[a-fA-F0-9]{64}$/'],
            ], $validation_messages);

            if ($this->transactionHashExists($validated['transactionHash'])) {
                throw new \Error("Hash should be unique.");
            }

            $pendingAllowanceData = $this->preparePendingAllowanceData($request, $validated);
            $pendingAllowance = $this->pendingAllowanceService->create($pendingAllowanceData);

            if ($request->id) {
                // get ids for all addresses
                $addressIds = $this->addressService->getIdsforAddressesOrCreate([ // !!! should not create
                    'owner' => $validated['ownerAddress'],
                    'token' => $validated['ERC20TokenAddress'],
                    'spender' => $validated['spenderAddress'],
                ]);

                // check if a transaction with the same addresses exists
                $allowance = $this->allowanceService->findAllowanceWithAddressesIds($addressIds);

                if ($allowance) {
                    $allowance->pending = true;
                    $allowance->save();
                }
            }

            dispatch(new CheckHoleskyTransactionJob($pendingAllowance));

            session()->flash('success', now()->format('H:i:s') . '::Allowance queued successfully.');
            return to_route('dashboard'); // !!! render instead : leads to empty dashboard
        } catch (\Exception $e) {
            Log::error('Error creating allowance: ' . $e->getMessage());
            session()->flash('error', now()->format('H:i:s') . '::Error queuing allowance.');
            // !!! switch to inertia error handling
            return back()->withErrors(['error' => 'An error occurred while creating the allowance: ' . $e->getMessage(),])->withInput();
        }
    }

    private function transactionHashExists(string $transactionHash): bool
    {
        return $this->transactionHashService->doHashExists($transactionHash) ||
            $this->pendingAllowanceService->doHashExists($transactionHash);
    }

    // Provide the necessary data to generate a pending allowance (used subsequently to create or update an allowance)
    private function preparePendingAllowanceData(LowercaseRequest $request, array $validated): array
    {
        if ($request->id) {
            $allowance = Allowance::findOrFail($request->id);
            return [
                'token_contract_address' => $allowance->tokenContract->address->address,
                'owner_address' => $allowance->ownerAddress->address,
                'spender_address' => $allowance->spenderAddress->address,
                'amount' => $validated['isUnlimited'] ? 0 : $validated['amount'],
                'is_unlimited' => $validated['isUnlimited'],
                'transaction_hash' => $validated['transactionHash'],
            ];
        } else {
            return [
                'token_contract_address' => $validated['ERC20TokenAddress'],
                'owner_address' => $validated['ownerAddress'],
                'spender_address' => $validated['spenderAddress'],
                'amount' => $validated['isUnlimited'] ? 0 : $validated['amount'],
                'is_unlimited' => $validated['isUnlimited'],
                'transaction_hash' => $validated['transactionHash'],
            ];
        }
    }
}

class LowercaseRequest extends FormRequest
{
    protected function prepareForValidation()
    {
        $properties = ['ownerAddress', 'spenderAddress', 'ERC20TokenAddress'];

        foreach ($properties as $property) {
            if ($this->has($property)) {
                $this->merge([$property => strtolower($this->input($property))]);
            }
        }
    }
}
