<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('allowances');

        Schema::create('allowances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('token_contract_id')->constrained('token_contracts');
            $table->foreignId('owner_address_id')->constrained('addresses');
            $table->foreignId('spender_address_id')->constrained('addresses');
            $table->unsignedBigInteger('amount');
            $table->boolean('is_unlimited');
            $table->boolean('pending')->default(false);
            // $table->string('transaction_hash', 66)->unique();
            $table->timestamps();

            $table->unique(['token_contract_id', 'owner_address_id', 'spender_address_id']);

            $table->rawIndex('(CASE WHEN is_unlimited THEN amount IS NULL ELSE amount IS NOT NULL END)', 'check_amount_unlimited');
        });

        /*Schema::create('allowances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('token_contract_id');
            $table->unsignedBigInteger('owner_address_id');
            $table->unsignedBigInteger('spender_address_id');
            $table->integer('amount'); // amount = 0 => revoked 
            $table->boolean('is_unlimited');
            $table->string('transaction_hash', 66)->unique();
            $table->timestamps();

            $table->unique(['token_contract_id', 'owner_address_id', 'spender_address_id']);
            $table->foreign('token_contract_id')->references('id')->on('token_contracts');
            $table->foreign('owner_address_id')->references('id')->on('addresses');
            $table->foreign('spender_address_id')->references('id')->on('addresses');

            $table->rawIndex('(CASE WHEN is_unlimited THEN amount IS NULL ELSE amount IS NOT NULL END)', 'check_amount_unlimited');
        });*/

        $owner = strtolower('0xBC389292158700728d014d5b2b6237bFd36FA09C');

        $defaultTokens = [
            ['name' => 'CrystalDrive', 'symbol' => 'CRD', 'token_address' => strtolower('0xf33c13a871b8132827D0370359024726d137D98F'), 'decimals' => 18],
            ['name' => 'CyberSpark', 'symbol' => 'CSP', 'token_address' => strtolower('0xdc52fd9c0F960059932E1bcD521B3C588134f62E'), 'decimals' => 18],
            ['name' => 'EchoChain', 'symbol' => 'ECH', 'token_address' => strtolower('0x1Bdd01191B1c4134D2071B39ea846b9E1Ac2De2e'), 'decimals' => 18],
            ['name' => 'NeoNova', 'symbol' => 'NOV', 'token_address' => strtolower('0xB55506abfF9212E3447Ca7942A8c75b77FAd61A7'), 'decimals' => 18],
            ['name' => 'NimbusNet', 'symbol' => 'NMB', 'token_address' => strtolower('0x78490E03B50bec0922397DE03966CcbA133dD84D'), 'decimals' => 18],
            ['name' => 'PrimeFlow', 'symbol' => 'PRM', 'token_address' => strtolower('0x4E484a9329006770f3b0090F31e96FbD054b9e10'), 'decimals' => 18],
            ['name' => 'Quantum', 'symbol' => 'QTM', 'token_address' => strtolower('0xE659d196348ff53Db02a0989Fe513c60ba6B09D1'), 'decimals' => 18],
            ['name' => 'StellarPulse', 'symbol' => 'STP', 'token_address' => strtolower('0x48BD931FF170CCF38190D2A617C133Ab28fc1ef5'), 'decimals' => 18],
            ['name' => 'VertexCoin', 'symbol' => 'VTX', 'token_address' => strtolower('0xEa2616479716cc345a7797C71639A306451A9AC5'), 'decimals' => 18],
            ['name' => 'ZenithToken', 'symbol' => 'ZNT', 'token_address' => strtolower('0xA9DE06F5692AFFe05A5661708cF59F14c2BA19c4'), 'decimals' => 18],
            //['name' => 'SolarFlare', 'symbol' => 'SFL', 'token_address' => strtolower('0x9429708fD69C596037bAF376C2b2e0cd105Cd34a'), 'decimals' => 18],

        ];

        $spender = strtolower('0x7614c30d8437468A5C177F679cD729962b99b10f');

        $now = now();

        $ownerId = DB::table('addresses')->insertGetId([
            'address' => strtolower($owner),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $spenderId = DB::table('addresses')->insertGetId([
            'address' => strtolower($spender),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // create allowances for each token
        foreach ($defaultTokens as $token) {
            $createdAllowanceId = DB::table('allowances')->insertGetId([
                'token_contract_id' => DB::table('token_contracts')
                    ->whereIn('token_address_id', function ($query) use ($token) {
                        $query->select('id')
                            ->from('addresses')
                            ->where('address', $token['token_address']);
                    })
                    ->value('id'),
                'owner_address_id' => $ownerId,
                'spender_address_id' => $spenderId,
                'amount' => 1000,
                'is_unlimited' => false,
                // 'transaction_hash' => '0x' . str()->random(64),
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('transaction_hashes')->insert([
                'allowance_id' => $createdAllowanceId,
                'hash' => '0x' . str()->random(64),
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // !!! add a transaction hash for the inserted id
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('allowances');
    }
};
