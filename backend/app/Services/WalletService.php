<?php

namespace App\Services;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class WalletService
{
    /**
     * Get wallet details for a user.
     */
    public function getWallet($user)
    {
        $wallet = $user->wallet;
        
        return [
            'wallet_id' => $wallet->id,
            'balance' => $wallet->balance,
            'last_updated' => $wallet->last_updated,
            'user_id' => $wallet->user_id
        ];
    }


    /**
     * Add funds to a user's wallet (deposit).
     */
    public function deposit($user, $amount, $paymentMethod = null)
    {
        return DB::transaction(function () use ($user, $amount, $paymentMethod) {
            $wallet = $user->wallet;
            
            // Calculate platform fee (e.g., 5% of deposit amount)
            $feePercentage = 0.05;
            $feeAmount = $amount * $feePercentage;
            $netDeposit = $amount - $feeAmount;
            
            // Update wallet balance
            $wallet->increment('balance', $netDeposit);
            $wallet->update(['last_updated' => now()]);
            
            // Record the transaction
            $transaction = Transaction::create([
                'wallet_id' => $wallet->id,
                'amount' => $netDeposit,
                'transaction_type' => 'deposit',
                'payment_method' => $paymentMethod,
                'created_at' => now(),
                'status' => 'completed',
                'description' => 'Deposit to wallet',
                'fee_amount' => $feeAmount
            ]);
            
            return [
                'success' => true,
                'transaction' => $transaction,
                'wallet' => $wallet,
                'fee' => $feeAmount,
                'net_deposit' => $netDeposit
            ];
        });
    }
    
}