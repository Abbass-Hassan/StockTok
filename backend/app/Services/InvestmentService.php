<?php

namespace App\Services;

use App\Models\LikeInvestment;
use App\Models\Video;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class InvestmentService
{


//     /**
//  * Invest in a video (like with investment).
//  */
// public function investInVideo($user, $videoId, $amount)
// {
//     // Start a database transaction to ensure all operations complete successfully
//     return DB::transaction(function () use ($user, $videoId, $amount) {
//         // Find the video and creator
//         $video = Video::findOrFail($videoId);
//         $creator = User::findOrFail($video->user_id);
        
//         // Calculate creator's share
//         $creatorShare = $amount * 0.25; // 25% to creator
//         $investmentAmount = $amount - $creatorShare;
        
//         // Check if user has enough balance
//         $wallet = $user->wallet;
//         if ($wallet->balance < $amount) {
//             return [
//                 'success' => false,
//                 'message' => 'Insufficient funds'
//             ];
//         }
        
//         // Create the investment record
//         $investment = LikeInvestment::create([
//             'user_id' => $user->id,
//             'video_id' => $videoId,
//             'amount' => $investmentAmount,
//             'created_at' => now(),
//             'status' => 'active',
//             'return_percentage' => 0,
//             'current_value' => $investmentAmount
//         ]);
        
//         // Update user's wallet (decrease balance)
//         $wallet->decrement('balance', $amount);
//         $wallet->update(['last_updated' => now()]);
        
//         // Add creator's share to their wallet
//         $creatorWallet = $creator->wallet;
//         $creatorWallet->increment('balance', $creatorShare);
//         $creatorWallet->update(['last_updated' => now()]);
        
//         // Record the investment transaction
//         Transaction::create([
//             'wallet_id' => $wallet->id,
//             'amount' => -$amount,
//             'transaction_type' => 'like_investment',
//             'related_video_id' => $videoId,
//             'related_like_investment_id' => $investment->id,
//             'created_at' => now(),
//             'status' => 'completed',
//             'description' => 'Investment in video #' . $videoId,
//             'fee_amount' => 0  // No fee on investments
//         ]);
        
//         // Record the creator earning transaction
//         Transaction::create([
//             'wallet_id' => $creatorWallet->id,
//             'amount' => $creatorShare,
//             'transaction_type' => 'creator_earning',
//             'related_video_id' => $videoId,
//             'related_like_investment_id' => $investment->id,
//             'created_at' => now(),
//             'status' => 'completed',
//             'description' => 'Creator earnings from video #' . $videoId,
//             'fee_amount' => 0  // No fee on creator earnings
//         ]);
        
//         // Update video stats
//         $video->increment('like_investment_count');
//         $video->increment('current_value', $investmentAmount);
        
//         // NEW CODE: Distribute rewards to previous investors
//         // Get existing investors (excluding current investor)
//         $existingInvestments = LikeInvestment::where('video_id', $videoId)
//             ->where('user_id', '!=', $user->id)
//             ->where('status', 'active')
//             ->get();

//         // If there are previous investors, distribute 10% of the new investment among them
//         if ($existingInvestments->count() > 0) {
//             $investorRewardPool = $amount * 0.10; // 10% to previous investors
            
//             // Calculate total existing investment amount for proportional distribution
//             $totalExistingAmount = $existingInvestments->sum('amount');
            
//             foreach ($existingInvestments as $existingInvestment) {
//                 // Calculate proportional share based on investment amount
//                 $sharePercentage = $existingInvestment->amount / $totalExistingAmount;
//                 $rewardAmount = $investorRewardPool * $sharePercentage;
                
//                 // Add reward to investor's wallet
//                 $investorWallet = User::find($existingInvestment->user_id)->wallet;
//                 $investorWallet->increment('balance', $rewardAmount);
                
//                 // Record transaction
//                 Transaction::create([
//                     'wallet_id' => $investorWallet->id,
//                     'amount' => $rewardAmount,
//                     'transaction_type' => 'investor_reward',
//                     'related_video_id' => $videoId,
//                     'related_like_investment_id' => $investment->id,
//                     'created_at' => now(),
//                     'status' => 'completed',
//                     'description' => 'Reward from new investment in video #' . $videoId,
//                     'fee_amount' => 0
//                 ]);
//             }
//         }
//         // END NEW CODE
        
//         return [
//             'success' => true,
//             'investment' => $investment,
//             'video' => $video,
//             'creator_share' => $creatorShare
//         ];
//     });
// }

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
        
        // Calculate creator's share
        $creatorShare = $amount * 0.25; // 25% to creator
        $investmentAmount = $amount - $creatorShare;
        
        // Check if user has enough balance
        $wallet = $user->wallet;
        if ($wallet->balance < $amount) {
            return [
                'success' => false,
                'message' => 'Insufficient funds'
            ];
        }
        
        // Create the investment record
        $investment = LikeInvestment::create([
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
            'fee_amount' => 0  // No fee on investments
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
            'fee_amount' => 0  // No fee on creator earnings
        ]);
        
        // Update video stats
        $video->increment('like_investment_count');
        $video->increment('current_value', $investmentAmount);
        
        // Distribute rewards to previous investors
        $existingInvestments = LikeInvestment::where('video_id', $videoId)
            ->where('user_id', '!=', $user->id)
            ->where('status', 'active')
            ->get();

        // If there are previous investors, distribute 10% of the new investment among them
        if ($existingInvestments->count() > 0) {
            $investorRewardPool = $amount * 0.10; // 10% to previous investors
            
            // Calculate total existing investment amount for proportional distribution
            $totalExistingAmount = $existingInvestments->sum('amount');
            
            foreach ($existingInvestments as $existingInvestment) {
                // Calculate proportional share based on investment amount
                $sharePercentage = $existingInvestment->amount / $totalExistingAmount;
                $rewardAmount = $investorRewardPool * $sharePercentage;
                
                // Add reward to investor's wallet
                $investorWallet = User::find($existingInvestment->user_id)->wallet;
                $investorWallet->increment('balance', $rewardAmount);
                $investorWallet->update(['last_updated' => now()]); // Added this line
                
                // ADDED CODE: Update the investment's current value and return percentage
                $newCurrentValue = $existingInvestment->current_value + $rewardAmount;
                $newReturnPercentage = (($newCurrentValue - $existingInvestment->amount) / $existingInvestment->amount) * 100;
                
                $existingInvestment->update([
                    'current_value' => $newCurrentValue,
                    'return_percentage' => $newReturnPercentage
                ]);
                // END ADDED CODE
                
                // Record transaction - amount is already positive
                Transaction::create([
                    'wallet_id' => $investorWallet->id,
                    'amount' => $rewardAmount,
                    'transaction_type' => 'investor_reward',
                    'related_video_id' => $videoId,
                    'related_like_investment_id' => $investment->id,
                    'created_at' => now(),
                    'status' => 'completed',
                    'description' => 'Reward from new investment in video #' . $videoId,
                    'fee_amount' => 0
                ]);
            }

            // Add debugging information to logs
            \Log::info('Investor rewards distributed', [
                'video_id' => $videoId,
                'new_investor' => $user->id,
                'existing_investors' => $existingInvestments->pluck('user_id'),
                'reward_pool' => $investorRewardPool,
                'transactions_created' => $existingInvestments->count()
            ]);
        }
        
        return [
            'success' => true,
            'investment' => $investment,
            'video' => $video,
            'creator_share' => $creatorShare
        ];
    });
}

    /**
     * Get details of a specific investment.
     */
    public function getInvestmentDetails($investmentId)
    {
        return LikeInvestment::with(['user', 'video'])
                            ->findOrFail($investmentId);
    }


    /**
     * Get all investments made by a user.
     */
    public function getUserInvestments($userId, $perPage = 15)
    {
        return LikeInvestment::with('video')
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
        return LikeInvestment::with('user')
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
        $investment = LikeInvestment::with('video')->findOrFail($investmentId);
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


    /**
     * Calculate profitability of a video.
     */
    public function calculateVideoProfitability($videoId)
    {
        $video = Video::findOrFail($videoId);
        
        $profitability = [
            'initial_investment' => $video->initial_investment,
            'current_value' => $video->current_value,
            'total_growth' => (($video->current_value - $video->initial_investment) / $video->initial_investment) * 100,
            'like_investment_count' => $video->like_investment_count,
            'roi' => ($video->current_value / $video->initial_investment)
        ];
        
        return $profitability;
    }


    /**
     * Get creator earnings summary for a video.
     */
    public function getCreatorEarningsSummary($videoId)
    {
        $video = Video::findOrFail($videoId);
        $creator = User::findOrFail($video->user_id);
        
        // Get all creator earning transactions for this video
        $earnings = Transaction::where('wallet_id', $creator->wallet->id)
                              ->where('related_video_id', $videoId)
                              ->where('transaction_type', 'creator_earning')
                              ->sum('amount');
        
        return [
            'video_id' => $videoId,
            'total_investments' => $video->like_investment_count,
            'total_earnings' => $earnings
        ];
    }
    



    /**
     * Get top investors for a creator across all videos
     */
    public function getCreatorTopInvestors($creatorId, $limit = 10)
    {
        // Get all videos by this creator
        $videoIds = Video::where('user_id', $creatorId)
                        ->where('is_active', true)
                        ->pluck('id');
        
        if ($videoIds->isEmpty()) {
            return collect();
        }
        
        // Get top investors across all videos
        $topInvestors = LikeInvestment::whereIn('video_id', $videoIds)
                    ->where('status', 'active')
                    ->select(
                        'user_id',
                        DB::raw('SUM(amount) as total_invested'),
                        DB::raw('COUNT(*) as investment_count')
                    )
                    ->with(['user:id,name,username,profile_photo_url'])
                    ->groupBy('user_id')
                    ->orderBy('total_invested', 'desc')
                    ->limit($limit)
                    ->get();
        
        return $topInvestors;
    }
}