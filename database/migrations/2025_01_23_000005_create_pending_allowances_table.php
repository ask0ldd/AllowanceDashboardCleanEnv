<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('pending_allowances');

        Schema::create('pending_allowances', function (Blueprint $table) {
            $table->id();
            $table->string('token_contract_address', 42);
            $table->string('owner_address', 42);
            $table->string('spender_address', 42);
            $table->unsignedBigInteger('amount');
            $table->boolean('is_unlimited');
            $table->string('transaction_hash', 66)->unique();
            $table->timestamps();

            // $table->rawIndex('(CASE WHEN is_unlimited THEN amount IS NULL ELSE amount IS NOT NULL END)', 'check_amount_unlimited');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pending_allowances');
    }
};
