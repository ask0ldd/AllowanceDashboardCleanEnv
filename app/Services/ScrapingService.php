<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

/**
 * This service provides methods for scraping data from external websites.
 */
class ScrapingService
{
    /**
     * Scrape transaction data from Etherscan.
     * 
     * @param string $transactionHash The hash of the Ethereum transaction to scrape.
     * @return \Illuminate\Http\Client\Response The HTTP response from Etherscan.
     * @throws \Illuminate\Http\Client\ConnectionException If a connection error occurs.
     * @throws \Illuminate\Http\Client\RequestException If the request fails.
     */
    public function scrapeEtherscan(string $transactionHash): \Illuminate\Http\Client\Response
    {
        return Http::withOptions([
            'verify' => false, // Disable SSL verification
        ])->get('https://holesky.etherscan.io/tx/' . $transactionHash);
    }
}
