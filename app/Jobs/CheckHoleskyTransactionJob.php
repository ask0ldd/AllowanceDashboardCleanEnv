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
use App\Services\TransactionHashService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CheckHoleskyTransactionJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue/*, Dispatchable, SerializesModels*/;

    protected string $transactionHash;
    protected PendingAllowance $pendingAllowance;
    public $tries = 5; // Maximum number of attempts
    private $attemptCount = 0;
    // public $backoff = [60, 120, 360, 600]; // Retry delays in seconds

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
    public function handle(PendingAllowance $pendingAllowance, AllowanceService $allowanceService, PendingAllowanceService $pendingAllowanceService, TransactionHashService $transactionHashService, AddressService $addressService): void // type-hinting the dependencies in the method signature, which Laravel will automatically inject
    {
        try {
            // throw new ManualJobFailedException("Manual Fail for testing purposes.");

            $successNeedle = "title='A Status code indicating if the top-level call succeeded or failed (applicable for Post BYZANTIUM blocks only)'><i class='fa fa-check-circle me-1'></i>Success</span>";

            // !!! create a scraping service and pass it through constructor
            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification
            ])->get('https://holesky.etherscan.io/tx/' . $this->transactionHash);

            if ($response->successful()) {
                $isSuccess = str_contains($response->body(), $successNeedle);
                Log::info('Transaction is a success ? ' . $isSuccess);
                if (!$isSuccess) throw new \Exception('Transaction not validated yet.');

                $pendingAllowance = $pendingAllowanceService->findWithHash($this->transactionHash);
                if (!$pendingAllowance) throw new \Exception("Couldn't find the target pending allowance."); // $this->failed("Couldn't find the target pending allowance.");

                // get ids for all addresses
                $addressIds = $addressService->getIdsforAddressesOrCreate([
                    'owner' => $pendingAllowance['owner_address'],
                    'token' => $pendingAllowance['token_contract_address'],
                    'spender' => $pendingAllowance['spender_address'],
                ]);

                // check if a transaction with the same addresses exists
                $existingAllowance = $allowanceService->findAllowanceWithAddressesIds($addressIds);

                if ($existingAllowance) {
                    // Update existing allowance
                    $existingAllowance->update([ // !!! move to service ?
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

                // !!! should remove pending status to allowance table

                event(new EventTransactionComplete($this->transactionHash));
            } else {
                Log::error('Scrapping failed. Status: ' . $response->status()); // !!! improve errors
                throw new \Exception('Scrapping failed.');
            }
        } catch (\Exception $e) {
            Log::error('Error executing the job: ' . $e->getMessage());
            if ($e instanceof PendingAllowanceNotFoundException || $e instanceof ManualJobFailedException) {
                // event(new EventTransactionFailed($this->transactionHash));
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
    public function failed(\Throwable $exception): void
    {
        Log::info('failed called');
        try {
            Log::error('Job failed: ' . $exception->getMessage());
            if (!$exception instanceof ManualJobFailedException && !$exception instanceof PendingAllowanceNotFoundException) {
                $pendingAllowanceService = app(PendingAllowanceService::class);
                $pendingAllowanceService->deleteWithHash($this->transactionHash); // !!! catch
            }
            event(new EventTransactionFailed($this->transactionHash));
            // !!! should remove pending status to allowance table
        } catch (\Exception $e) {
            Log::error($e->getMessage()); // !!!
            event(new EventTransactionFailed($this->transactionHash));
        }
    }
}

/*$response = Http::post('https://holesky.infura.io/v3/', [
    'jsonrpc' => '2.0',
    'id' => 1,
    'method' => 'eth_getTransactionReceipt',
    'params' => [$this->transactionHash]
]);

$result = $response->json()['result'];

if ($result && $result['status'] === '0x1') {
    // Transaction is completed successfully
    // Add your logic here (e.g., update database, send notification)
    Log::info($result);
}*/