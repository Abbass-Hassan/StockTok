<?php

namespace Database\Seeders;

use App\Models\LikeInvestment;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        // Get demo investor's wallet
        $demoInvestor = User::where('username', 'investor1')->first();
        $investorWallet = Wallet::where('user_id', $demoInvestor->id)->first();
        
        // Create initial deposit transaction
        Transaction::create([
            'wallet_id' => $investorWallet->id,
            'amount' => 1000.00,
            'transaction_type' => 'deposit',
            'related_video_id' => null,
            'related_like_investment_id' => null,
            'status' => 'completed',
            'description' => 'Initial deposit',
            'fee_amount' => 20.00, // 2% fee
            'created_at' => now()->subDays(45),
            'updated_at' => now()->subDays(45),
        ]);
        
        // Create transactions for each like/investment by the demo investor
        $investments = LikeInvestment::where('user_id', $demoInvestor->id)->get();
        
        foreach ($investments as $investment) {
            Transaction::create([
                'wallet_id' => $investorWallet->id,
                'amount' => $investment->amount,
                'transaction_type' => 'like_investment',
                'related_video_id' => $investment->video_id,
                'related_like_investment_id' => $investment->id,
                'status' => 'completed',
                'description' => 'Investment in video #' . $investment->video_id,
                'fee_amount' => $investment->amount * 0.01, // 1% fee
                'created_at' => $investment->created_at,
                'updated_at' => $investment->created_at,
            ]);
        }
        
        // Create transactions for all users
        $wallets = Wallet::all();
        
        foreach ($wallets as $wallet) {
            // Create 1-5 deposit transactions
            $numDeposits = rand(1, 5);
            for ($i = 0; $i < $numDeposits; $i++) {
                $amount = rand(50, 500) + (rand(0, 99) / 100);
                Transaction::create([
                    'wallet_id' => $wallet->id,
                    'amount' => $amount,
                    'transaction_type' => 'deposit',
                    'related_video_id' => null,
                    'related_like_investment_id' => null,
                    'status' => 'completed',
                    'description' => 'Deposit to wallet',
                    'fee_amount' => $amount * 0.02, // 2% fee
                    'created_at' => now()->subDays(rand(1, 60)),
                    'updated_at' => now()->subDays(rand(1, 60)),
                ]);
            }
            
            // Create 0-3 withdrawal transactions
            $numWithdrawals = rand(0, 3);
            for ($i = 0; $i < $numWithdrawals; $i++) {
                $amount = rand(20, 200) + (rand(0, 99) / 100);
                Transaction::create([
                    'wallet_id' => $wallet->id,
                    'amount' => $amount,
                    'transaction_type' => 'withdrawal',
                    'related_video_id' => null,
                    'related_like_investment_id' => null,
                    'status' => 'completed',
                    'description' => 'Withdrawal from wallet',
                    'fee_amount' => $amount * 0.03, // 3% fee
                    'created_at' => now()->subDays(rand(1, 30)),
                    'updated_at' => now()->subDays(rand(1, 30)),
                ]);
            }
        }
    }
}