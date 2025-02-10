<?php

namespace Tests\Unit;

use App\Http\Resources\TokenContractResource;
use PHPUnit\Framework\TestCase;
use Illuminate\Http\Request;
use stdClass;

class TokenContractResourceTest extends TestCase
{
    /**
     * Data transformation testing
     */
    public function testTokenContractResourceTransformsCorrectly()
    {
        // data to 
        $mockData = new stdClass();
        $mockData->id = 1;
        $mockData->created_at = '2025-02-10 06:00:00';
        $mockData->updated_at = '2025-02-10 06:30:00';
        $mockData->token_address_id = 123;
        $mockData->name = 'Test Token';
        $mockData->symbol = 'TTK';
        $mockData->decimals = 18;
        $mockData->address = (object) ['address' => '0x123456789abcdef'];

        // instanciate the resource
        $resource = new TokenContractResource($mockData);

        // simulate a request since toArray needs it as a parameter
        $request = Request::create('/');
        $result = $resource->toArray($request);

        // assert structure
        $this->assertIsArray($result);
        $this->assertArrayHasKey('id', $result);
        $this->assertArrayHasKey('created_at', $result);
        $this->assertArrayHasKey('updated_at', $result);
        $this->assertArrayHasKey('token_address_id', $result);
        $this->assertArrayHasKey('name', $result);
        $this->assertArrayHasKey('symbol', $result);
        $this->assertArrayHasKey('decimals', $result);
        $this->assertArrayHasKey('address', $result);

        // assert values
        $this->assertEquals(1, $result['id']);
        $this->assertEquals('2025-02-10 06:00:00', $result['created_at']);
        $this->assertEquals('2025-02-10 06:30:00', $result['updated_at']);
        $this->assertEquals(123, $result['token_address_id']);
        $this->assertEquals('Test Token', $result['name']);
        $this->assertEquals('TTK', $result['symbol']);
        $this->assertEquals(18, $result['decimals']);
        $this->assertEquals('0x123456789abcdef', $result['address']);
    }
}
