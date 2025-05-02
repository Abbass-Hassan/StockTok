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
            // Find the video and creator
            $video = Video::findOrFail($videoId);
            $creator = User::findOrFail($video->user_id);
            
            // Calculate shares
            $creatorShare = $amount * 0.25; // 25% to creator
            $platformFee = $amount * 0.05;  // 5% platform fee
            $investmentAmount = $amount - $creatorShare - $platformFee;
            
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
                'amount' => $investmentAmount,
                'created_at' => now(),
                'status' => 'active',
                'return_percentage' => 0,
                'current_value' => $investmentAmount
            ]);
            
            // Update user's wallet (decrease balance)
            $wallet->decrement('balance', $amount);
            $wallet->update(['last_updated' => now()]);
            
            // Add creator's share to their wallet
            $creatorWallet = $creator->wallet;
            $creatorWallet->increment('balance', $creatorShare);
            $creatorWallet->update(['last_updated' => now()]);
            
            // Record the investment transaction
            Transaction::create([
                'wallet_id' => $wallet->id,
                'amount' => -$amount,
                'transaction_type' => 'like_investment',
                'related_video_id' => $videoId,
                'related_like_investment_id' => $investment->id,
                'created_at' => now(),
                'status' => 'completed',
                'description' => 'Investment in video #' . $videoId,
                'fee_amount' => $platformFee
            ]);
            
            // Record the creator earning transaction
            Transaction::create([
                'wallet_id' => $creatorWallet->id,
                'amount' => $creatorShare,
                'transaction_type' => 'creator_earning',
                'related_video_id' => $videoId,
                'related_like_investment_id' => $investment->id,
                'created_at' => now(),
                'status' => 'completed',
                'description' => 'Creator earnings from video #' . $videoId,
                'fee_amount' => 0
            ]);
            
            // Update video stats
            $video->increment('like_investment_count');
            $video->increment('current_value', $investmentAmount);
            
            return [
                'success' => true,
                'investment' => $investment,
                'video' => $video,
                'creator_share' => $creatorShare,
                'platform_fee' => $platformFee
            ];
        });
    }

    /**
     * Get details of a specific investment.
     */
    public function getInvestmentDetails($investmentId)
    {
        return LikesInvestment::with(['user', 'video'])
                            ->findOrFail($investmentId);
    }


    /**
     * Get all investments made by a user.
     */
    public function getUserInvestments($userId, $perPage = 15)
    {
        return LikesInvestment::with('video')
                            ->where('user_id', $userId)
                            ->where('status', 'active')
                            ->orderBy('created_at', 'desc')
                            ->paginate($perPage);
    }


    /**
     * Get all investments on a specific video.
     */
    public function getVideoInvestments($videoId, $perPage = 15)
    {
        return LikesInvestment::with('user')
                            ->where('video_id', $videoId)
                            ->where('status', 'active')
                            ->orderBy('amount', 'desc')
                            ->paginate($perPage);
    }


    /**
     * Calculate current returns for an investment.
     */
    public function calculateReturns($investmentId)
    {
        $investment = LikesInvestment::with('video')->findOrFail($investmentId);
        $video = $investment->video;
        
        // Calculate what percentage of the video this investment owns
        $ownershipPercentage = $investment->amount / $video->current_value;
        
        // Calculate current value of the investment
        $currentInvestmentValue = $video->current_value * $ownershipPercentage;
        
        // Calculate return percentage
        $returnPercentage = (($currentInvestmentValue - $investment->amount) / $investment->amount) * 100;
        
        // Update the investment record
        $investment->update([
            'current_value' => $currentInvestmentValue,
            'return_percentage' => $returnPercentage
        ]);
        
        return [
            'investment' => $investment,
            'original_amount' => $investment->amount,
            'current_value' => $currentInvestmentValue,
            'return_percentage' => $returnPercentage
        ];
    }
    
}