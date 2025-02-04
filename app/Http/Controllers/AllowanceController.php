<?php

namespace App\Http\Controllers;

use App\Http\Resources\AllowanceResource;
use App\Jobs\CheckHoleskyTransactionJob;
use App\Models\Allowance;
use App\Services\AllowanceService;
use App\Services\TokenService;
use App\Services\AddressService;
use App\Services\TransactionHashService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

use Illuminate\Foundation\Http\FormRequest;

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

    public function save(LowercaseRequest $request): \Illuminate\Http\RedirectResponse
    {
        try {
            $messages = [
                'spenderAddress.not_in' => 'The spender address cannot be the same as the token address.',
                'ownerAddress.not_in' => 'The spender address cannot be the same as the token address.',
            ];

            $validated = $request->validate([
                'ownerAddress' => ['required', 'string', 'size:42', 'regex:/^0x[a-fA-F0-9]{40}$/', Rule::notIn([$request->input('ERC20TokenAddress')])],
                'ERC20TokenAddress' => ['required', 'string', 'size:42', 'regex:/^0x[a-fA-F0-9]{40}$/'],
                'spenderAddress' => ['required', 'string', 'size:42', 'regex:/^0x[a-fA-F0-9]{40}$/', Rule::notIn([$request->input('ERC20TokenAddress')])],
                'spenderName' => ['string', 'max:50', 'nullable'],
                'amount' => ['numeric', 'min:1', 'required_without:isUnlimited'],
                'isUnlimited' => ['boolean', 'required_without:amount'],
                'transactionHash' => ['string', 'required', 'size:66', 'regex:/^0x[a-fA-F0-9]{64}$/'],
            ], $messages);

            /*$addresses = collect([
                'owner' => $validated['ownerAddress'],
                'token' => $validated['ERC20TokenAddress'],
                'spender' => $validated['spenderAddress'],
            ])->map(function ($address) {
                return Address::firstOrCreate(['address' => $address]);
            });*/

            $addresses = $this->addressService->getOrCreateAddresses([
                'owner' => $validated['ownerAddress'],
                'token' => $validated['ERC20TokenAddress'],
                'spender' => $validated['spenderAddress'],
            ]);

            // check if the allowance doesn't exist
            $isRegistered = $this->allowanceService->isSimilarAllowanceRegistered([
                'token' => $addresses['token'],
                'owner' => $addresses['owner'],
                'spender' => $addresses['spender']
            ]);

            // if so, switch to update
            if ($isRegistered) return $this->update($request);

            $createdAllowance = $this->allowanceService->createAllowance([
                'token_contract_id' => $addresses['token']->id,
                'owner_address_id' => $addresses['owner']->id,
                'spender_address_id' => $addresses['spender']->id,
                'amount' => $validated['isUnlimited'] ? 0 : $validated['amount'],
                'is_unlimited' => $validated['isUnlimited']
            ]);

            $this->transactionHashService->create($createdAllowance->id, $validated['transactionHash']);

            // CheckHoleskyTransaction::dispatch($validated['transactionHash']);
            Log::info('hash : ' . $validated['transactionHash']);
            dispatch(new CheckHoleskyTransactionJob($validated['transactionHash']));

            session()->flash('success', now()->format('H:i:s') . '::Allowance created successfully.');
            return to_route('dashboard');
        } catch (\Exception $e) {
            Log::error('Error creating allowance: ' . $e->getMessage());
            session()->flash('error', now()->format('H:i:s') . '::Error updating allowance.');
            return back()->withErrors(['error' => 'An error occurred while creating the allowance: ' . $e->getMessage(),])->withInput(); // !!! switch to inertia error handling
        }
    }

    public function update(LowercaseRequest $request): \Illuminate\Http\RedirectResponse
    {
        try {
            Log::info($request->id);
            $messages = [
                'spenderAddress.not_in' => 'The spender address cannot be the same as the token address.',
                'ownerAddress.not_in' => 'The spender address cannot be the same as the token address.',
            ];

            // !!! should vallidate if the addresses exists in addresses table since it is an update
            $validated = $request->validate([
                // !!! 'id' => 'required|exists:allowances,id',
                'ownerAddress' => ['required', 'string', 'size:42', 'regex:/^0x[a-fA-F0-9]{40}$/', Rule::notIn([$request->input('ERC20TokenAddress')])],
                'ERC20TokenAddress' => ['required', 'string', 'size:42', 'regex:/^0x[a-fA-F0-9]{40}$/'],
                'spenderAddress' => ['required', 'string', 'size:42', 'regex:/^0x[a-fA-F0-9]{40}$/', Rule::notIn([$request->input('ERC20TokenAddress')])],
                'spenderName' => ['string', 'max:50', 'nullable'],
                'amount' => ['numeric', 'min:1', 'required_without:isUnlimited'],
                'isUnlimited' => ['boolean', 'required_without:amount'],
                'transactionHash' => ['string', 'required', 'size:66', 'regex:/^0x[a-fA-F0-9]{64}$/'],
            ], $messages);

            $allowance = $this->allowanceService->getAllowance($request->id);

            // Validate if the address IDs in the request match those of the existing allowance
            if (!$this->addressService->doRequestAddressesMatchExistingAllowance($validated, $allowance)) // !!! should tell which address doesn't match
                throw new \InvalidArgumentException('The provided addresses do not match the target allowance.');

            $allowance->update([
                'amount' => $validated['isUnlimited'] ? 0 : $validated['amount'],
                'is_unlimited' => $validated['isUnlimited'],
            ]);

            $this->transactionHashService->create($allowance->id, $validated['transactionHash']);

            // CheckHoleskyTransaction::dispatch($validated['transactionHash']);
            Log::info('hash : ' . $validated['transactionHash']);
            dispatch(new CheckHoleskyTransactionJob($validated['transactionHash']));

            session()->flash('success', now()->format('H:i:s') . '::Allowance updated successfully.');
            return to_route('dashboard'); // ->with('success', 'Allowance created successfully.');
        } catch (\Exception $e) {
            Log::error('Error updating allowance: ' . $e->getMessage());
            session()->flash('error', now()->format('H:i:s') . '::Error updating allowance.');
            return back()->withErrors(['error' => 'An error occurred while updating the allowance : ' . $e->getMessage(),])->withInput(); // !!! switch to inertia error handling
        }
    }

    public function showNewForm(): \Inertia\Response
    {
        $tokenList = $this->tokenService->getAll();
        return Inertia::render('Allowance', ['ownedTokens' => $tokenList]);
    }

    public function showEditForm(Request $request): \Inertia\Response
    {
        try {
            $tokenList = $this->tokenService->getAll();
            $allowance = Allowance::findOrFail($request->id); // !!! deal with failure
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
            ]); // !!! deal with message
        }
    }

    public function delete(Request $request): \Illuminate\Http\RedirectResponse
    {
        try {
            $allowance = Allowance::findOrFail($request->id);
            $allowance->delete();
            return to_route('/dashboard')->with('success', 'Allowance deleted successfully.');
        } catch (\Exception $e) {
            session()->flash('error', now()->format('H:i:s') . '::Error deleting the allowance.');
            return back()->with('error', 'Failed to delete allowance: ' . $e->getMessage());
        }
    }

    public function revoke(Request $request): \Illuminate\Http\RedirectResponse //\Inertia\Response //
    {
        // !!! should check if id and addresses match

        // !!!!!!!!! on the backend : check if id contractaddress, owneraddress and spenderaddress trio makes sense, if not, look for the right id

        try {
            $validated = $request->validate([
                // !!! 'id' => 'required|exists:allowances,id',
                'hash' => ['string', 'required', 'size:66', 'regex:/^0x[a-fA-F0-9]{64}$/'],
            ]);

            $allowance = Allowance::findOrFail($request->id);
            $allowance->update(['amount' => '0', 'is_unlimited' => false]);
            Log::info('hash : ' . $validated['hash']);
            dispatch(new CheckHoleskyTransactionJob($validated['hash']));
            session()->flash('success', now()->format('H:i:s') . '::Allowance revoked successfully.');
            return redirect()->back();
            /*
                $showRevoked = $request->boolean('showRevoked', false);
                $showUnlimitedOnly = $request->boolean('showUnlimitedOnly', false);
                $searchValue = $request->string('searchValue', "");

                $allowances = $showRevoked ? $this->allowanceService->getFistTenAllowancesWith($searchValue) : $this->allowanceService->getFistTenActiveAllowancesWith($searchValue);
                AllowanceResource::withoutWrapping();
                return Inertia::render('Dashboard', [
                    'allowances' => AllowanceResource::collection($allowances),
                ]);
            */
        } catch (\Exception $e) {
            session()->flash('error', now()->format('H:i:s') . '::Error revoking the allowance.');
            return back()->with('error', 'Failed to revoke allowance: ' . $e->getMessage());

            /*
                $showRevoked = $request->boolean('showRevoked', false);
                $showUnlimitedOnly = $request->boolean('showUnlimitedOnly', false);
                $searchValue = $request->string('searchValue', "");

                $allowances = $showRevoked ? $this->allowanceService->getFistTenAllowancesWith($searchValue) : $this->allowanceService->getFistTenActiveAllowancesWith($searchValue);
                AllowanceResource::withoutWrapping();
                return Inertia::render('Dashboard', [
                    'allowances' => AllowanceResource::collection($allowances),
                ]);
            */
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

/*
    public function edit(Allowance $allowance)
    {
        return Inertia::render('Allowances/Edit', [
            'allowance' => $allowance
        ]);
    }
*/

/*
try {
        $tokenList = $tokenController->getAll();
        $allowance = Allowance::findOrFail($id);

        AllowanceResource::withoutWrapping();

        return Inertia::render('Allowance', [
            'existingAllowance' => AllowanceResource::make($allowance),
            'ownedTokens' => $tokenList,
        ]);
    } catch (NotFoundHttpException $e) {
        // Handle the case when the allowance is not found
        return Inertia::render('ErrorPage', [
            'message' => 'Allowance not found',
        ]);
    } catch (\Exception $e) {
        // Handle any other unexpected errors
        return Inertia::render('ErrorPage', [
            'message' => 'An error occurred while processing your request',
        ]);
    }
        
*/