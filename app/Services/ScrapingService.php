<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class ScrapingService
{
    public function scrapeEtherscan(string $transactionHash): \Illuminate\Http\Client\Response
    {
        return Http::withOptions([
            'verify' => false, // Disable SSL verification
        ])->get('https://holesky.etherscan.io/tx/' . $transactionHash);
    }
}
