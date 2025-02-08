<?php

namespace App\Jobs;

use App\Events\EventTransactionComplete;
use App\Events\EventTransactionFailed;
use App\Exceptions\ManualJobFailedException;
use App\Exceptions\PendingAllowanceNotFoundException;
use App\Models\PendingAllowance;
use App\Services\AddressService;
use App\Services\AllowanceService;
use App\Services\PendingAllowanceService;
use App\Services\ScrapingService;
use App\Services\TransactionHashService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class CheckHoleskyTransactionJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue;

    protected string $transactionHash;
    protected PendingAllowance $pendingAllowance;
    public $tries = 5; // Maximum number of attempts
    private $attemptCount = 0;
    public $backoff = [60, 120, 360, 600]; // Retry delays in seconds

    /**
     * Create a new job instance.
     */
    public function __construct(PendingAllowance $pendingAllowance)
    {
        $this->transactionHash = $pendingAllowance['transaction_hash'];
        $this->pendingAllowance = $pendingAllowance;
    }

    /**
     * Execute the job.
     */
    // type-hinting the dependencies in the method signature, which Laravel will automatically inject
    public function handle(PendingAllowance $pendingAllowance, AllowanceService $allowanceService, PendingAllowanceService $pendingAllowanceService, TransactionHashService $transactionHashService, AddressService $addressService, ScrapingService $scrapingService): void
    {
        try {
            // throw new ManualJobFailedException("Manual Fail for testing purposes.");

            $successNeedle = "title='A Status code indicating if the top-level call succeeded or failed (applicable for Post BYZANTIUM blocks only)'><i class='fa fa-check-circle me-1'></i>Success</span>";
            // !!! if last try should use second needle
            $secondNeedle = "<i class='fa fa-dot-circle text-secondary me-1'></i>Indexing</span><span class='small text-muted'><i>&nbsp; This transaction has been included and will be reflected in a short while.</i>";

            $response = $scrapingService->scrapeEtherscan($this->transactionHash);

            // check if on etherscan if the transaction has been validated
            if ($response->successful()) {
                $isSuccess = str_contains($response->body(), $successNeedle);
                Log::info('Transaction is a success ? ' . $isSuccess);
                if (!$isSuccess) throw new \Exception('Transaction not validated yet.');

                $pendingAllowance = $pendingAllowanceService->findWithHash($this->transactionHash);
                if (!$pendingAllowance) throw new \Exception("Couldn't find the target pending allowance.");

                // get ids for all addresses
                $addressIds = $addressService->getIdsforAddresses([
                    'owner' => $pendingAllowance['owner_address'],
                    'token' => $pendingAllowance['token_contract_address'],
                    'spender' => $pendingAllowance['spender_address'],
                ]);

                // check if no null id in the array
                $nullAddressIds = array_filter($addressIds, 'is_null');

                // check if a transaction with the same addresses exists
                $existingAllowance = empty($nullAddressIds) ? $allowanceService->findAllowanceWithAddressesIds($addressIds) : null;

                if ($existingAllowance) {
                    // Update existing allowance
                    $existingAllowance->update([ // move to service
                        'amount' => $pendingAllowance['amount'],
                        'is_unlimited' => $pendingAllowance['is_unlimited'],
                        'pending' => false
                    ]);
                } else {
                    // Create new allowance
                    $createdAllowance = $allowanceService->createAllowance([
                        'token_contract_id' => $addressIds['token'],
                        'owner_address_id' => $addressIds['owner'],
                        'spender_address_id' => $addressIds['spender'],
                        'amount' => $pendingAllowance['amount'],
                        'is_unlimited' => $pendingAllowance['is_unlimited'],
                        'pending' => false
                    ]);
                }

                // get the id of the updated or create allowance
                $allowanceId = $existingAllowance ? $existingAllowance->id : ($createdAllowance ? $createdAllowance->id : null);
                if (!$allowanceId) throw new PendingAllowanceNotFoundException("Couldn't create or update the target allowance.");

                // insert the transaction hash into the dedicated table
                $transactionHashService->create($allowanceId, $this->transactionHash);

                // delete the temporary allowance
                $pendingAllowanceService->deleteWithHash($this->transactionHash);

                event(new EventTransactionComplete($this->transactionHash));
            } else {
                Log::error('Scrapping failed. Status: ' . $response->status()); // !!! improve errors
                throw new \Exception('Scrapping failed.');
            }
        } catch (\Exception $e) {
            Log::error('Error executing the job: ' . $e->getMessage());
            if ($e instanceof PendingAllowanceNotFoundException || $e instanceof ManualJobFailedException) {
                Log::info('Marking job as failed due to ' . get_class($e));
                $this->fail($e);
            } else {
                Log::info('Releasing job back to queue due to ' . get_class($e));
                $this->release(60);
            }
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception, AddressService $addressService, AllowanceService $allowanceService): void
    {
        Log::info('failed called');
        try {
            // should be grouped into one service method
            // removing the pending status on the potentially existing allowance 
            $addressIds = $addressService->getIdsforAddresses([
                'owner' => $this->pendingAllowance['owner_address'],
                'token' => $this->pendingAllowance['token_contract_address'],
                'spender' => $this->pendingAllowance['spender_address'],
            ]);

            // check if no null id in the array
            $nullAddressIds = array_filter($addressIds, 'is_null');

            // check if a transaction with the same addresses exists
            $existingAllowance = empty($nullAddressIds) ? $allowanceService->findAllowanceWithAddressesIds($addressIds) : null;
            if ($existingAllowance) {
                $existingAllowance->pending = false;
                $existingAllowance->save();
            }

            Log::error('Job failed: ' . $exception->getMessage());
            if (!$exception instanceof ManualJobFailedException && !$exception instanceof PendingAllowanceNotFoundException) {
                $pendingAllowanceService = app(PendingAllowanceService::class);
                $pendingAllowanceService->deleteWithHash($this->transactionHash); // !!! catch
            }
            event(new EventTransactionFailed($this->transactionHash));
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            event(new EventTransactionFailed($this->transactionHash));
        }
    }
}
