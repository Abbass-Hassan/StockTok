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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained('wallets')->onDelete('cascade');
            $table->float('amount');
            $table->string('transaction_type');
            $table->foreignId('related_video_id')->nullable()->constrained('videos')->nullOnDelete();
            $table->foreignId('related_like_investment_id')->nullable()->constrained('likes_investments')->nullOnDelete();
            $table->string('status');
            $table->text('description')->nullable();
            $table->float('fee_amount')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};