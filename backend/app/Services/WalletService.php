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
    public function deposit($user, $amount)
    {
        return DB::transaction(function () use ($user, $amount) {
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

    /**
     * Withdraw funds from a user's wallet.
     */
    public function withdraw($user, $amount)
    {
        return DB::transaction(function () use ($user, $amount) {
            $wallet = $user->wallet;

            // Calculate platform fee (e.g., 5% of withdrawal amount)
            $feePercentage = 0.05;
            $feeAmount = $amount * $feePercentage;
            $netWithdrawal = $amount - $feeAmount;

            // Check if user has enough balance
            if ($wallet->balance < $amount) {
                return [
                    'success' => false,
                    'message' => 'Insufficient funds'
                ];
            }

            // Update wallet balance
            $wallet->decrement('balance', $amount);
            $wallet->update(['last_updated' => now()]);

            // Record the transaction
            $transaction = Transaction::create([
                'wallet_id' => $wallet->id,
                'amount' => -$amount,
                'transaction_type' => 'withdrawal',
                'created_at' => now(),
                'status' => 'completed',
                'description' => 'Withdrawal from wallet',
                'fee_amount' => $feeAmount
            ]);

            return [
                'success' => true,
                'transaction' => $transaction,
                'wallet' => $wallet,
                'fee' => $feeAmount,
                'net_withdrawal' => $netWithdrawal
            ];
        });
    }

    /**
     * Get transaction history for a wallet.
     */
    public function getTransactionHistory($wallet, $perPage = 15)
    {
        return Transaction::where('wallet_id', $wallet->id)
                        ->orderBy('created_at', 'desc')
                        ->paginate($perPage);
    }

    /**
     * Get earnings summary for a user.
     */
    public function getEarningsSummary($user)
    {
        $wallet = $user->wallet;

        // Get total deposited
        $totalDeposited = Transaction::where('wallet_id', $wallet->id)
                                    ->where('transaction_type', 'deposit')
                                    ->sum('amount');

        // Get total withdrawn
        $totalWithdrawn = Transaction::where('wallet_id', $wallet->id)
                                    ->where('transaction_type', 'withdrawal')
                                    ->sum('amount');

        // Get total earned from investments
        $totalInvestmentReturns = Transaction::where('wallet_id', $wallet->id)
                                            ->where('transaction_type', 'investment_return')
                                            ->sum('amount');

        // Get total earned as creator
        $totalCreatorEarnings = Transaction::where('wallet_id', $wallet->id)
                                          ->where('transaction_type', 'creator_earning')
                                          ->sum('amount');

        // Get total spent on investments
        $totalInvestmentSpent = Transaction::where('wallet_id', $wallet->id)
                                          ->where('transaction_type', 'like_investment')
                                          ->sum('amount');

        // Calculate net earnings
        $netEarnings = $totalInvestmentReturns + $totalCreatorEarnings;

        return [
            'total_deposited' => $totalDeposited,
            'total_withdrawn' => $totalWithdrawn,
            'total_investment_returns' => $totalInvestmentReturns,
            'total_creator_earnings' => $totalCreatorEarnings,
            'total_investment_spent' => $totalInvestmentSpent,
            'net_earnings' => $netEarnings,
            'current_balance' => $wallet->balance
        ];
    }


    /**
     * Get earnings grouped by month
     */
    public function getMonthlyEarnings($user, $months = 6)
    {
        $wallet = $user->wallet;
        $startDate = now()->subMonths($months)->startOfMonth();
        
        // Get creator earnings transactions grouped by month
        $monthlyEarnings = Transaction::where('wallet_id', $wallet->id)
            ->where('transaction_type', 'creator_earning')
            ->where('created_at', '>=', $startDate)
            ->select(
                DB::raw('SUM(amount) as total'),
                DB::raw('COUNT(*) as count'),
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');
        
        // Create a result array with all months (including those with zero earnings)
        $results = [];
        for ($i = 0; $i < $months; $i++) {
            $monthKey = now()->subMonths($i)->format('Y-m');
            $monthName = now()->subMonths($i)->format('F Y');
            
            $results[$monthKey] = [
                'month' => $monthName,
                'month_key' => $monthKey,
                'earnings' => $monthlyEarnings->has($monthKey) 
                    ? $monthlyEarnings[$monthKey]->total 
                    : 0,
                'transactions' => $monthlyEarnings->has($monthKey) 
                    ? $monthlyEarnings[$monthKey]->count 
                    : 0
            ];
        }
        
        // Sort by month (newest first)
        krsort($results);
        
        return array_values($results);
    }
}
