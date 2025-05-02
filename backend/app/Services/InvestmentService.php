<?php

namespace App\Services;

use App\Models\LikesInvestment;
use App\Models\Video;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class InvestmentService
{
    /**
     * Invest in a video (like with investment).
     */
    public function investInVideo($user, $videoId, $amount)
    {
        // Start a database transaction to ensure all operations complete successfully
        return DB::transaction(function () use ($user, $videoId, $amount) {
            // Find the video
            $video = Video::findOrFail($videoId);
            
            // Check if user has enough balance
            $wallet = $user->wallet;
            if ($wallet->balance < $amount) {
                return [
                    'success' => false,
                    'message' => 'Insufficient funds'
                ];
            }
            
            // Create the investment record
            $investment = LikesInvestment::create([
                'user_id' => $user->id,
                'video_id' => $videoId,
                'amount' => $amount,
                'created_at' => now(),
                'status' => 'active',
                'return_percentage' => 0,
                'current_value' => $amount
            ]);
            
            // Update user's wallet (decrease balance)
            $wallet->decrement('balance', $amount);
            $wallet->update(['last_updated' => now()]);
            
            // Record the transaction
            Transaction::create([
                'wallet_id' => $wallet->id,
                'amount' => -$amount,
                'transaction_type' => 'like_investment',
                'related_video_id' => $videoId,
                'related_like_investment_id' => $investment->id,
                'created_at' => now(),
                'status' => 'completed',
                'description' => 'Investment in video #' . $videoId,
                'fee_amount' => 0 // No fee for version 1
            ]);
            
            // Update video stats
            $video->increment('like_investment_count');
            $video->increment('current_value', $amount);
            
            return [
                'success' => true,
                'investment' => $investment,
                'video' => $video
            ];
        });
    }
    
}