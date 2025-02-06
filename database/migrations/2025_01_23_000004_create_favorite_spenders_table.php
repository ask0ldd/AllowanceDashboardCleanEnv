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
        Schema::create('favorite_spenders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_address_id')->constrained('addresses');
            $table->foreignId('spender_address_id')->constrained('addresses');
            $table->unique(['owner_address_id', 'spender_address_id']);
            $table->timestamps();
        });

        /*Schema::create('favorite_spenders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('owner_address_id');
            $table->unsignedBigInteger('spender_address_id');
            $table->timestamps();

            $table->unique(['owner_address_id', 'spender_address_id']);
            $table->foreign('owner_address_id')->references('id')->on('addresses');
            $table->foreign('spender_address_id')->references('id')->on('addresses');
        });*/

        /* !!!!
        */
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favorite_spenders');
    }
};
