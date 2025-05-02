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
    
}