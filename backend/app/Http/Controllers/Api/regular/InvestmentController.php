<?php

namespace App\Http\Controllers\Api\regular;

use App\Http\Controllers\Controller;
use App\Services\InvestmentService;
use App\Services\WalletService;
use App\Services\VideoService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Services\AIService;
use Illuminate\Support\Facades\Log;
use App\Models\Transaction;

class InvestmentController extends Controller
{
    use ApiResponse;
    
    protected $investmentService;
    protected $walletService;
    protected $videoService;
    
    public function __construct(
        InvestmentService $investmentService,
        WalletService $walletService,
        VideoService $videoService
    ) {
        $this->investmentService = $investmentService;
        $this->walletService = $walletService;
        $this->videoService = $videoService;
    }
    
    /**
     * Invest in a video.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function investInVideo(Request $request)
    {
        // Validate request
        $request->validate([
            'video_id' => 'required|integer|exists:videos,id',
            'amount' => 'required|numeric|min:1'
        ]);
        
        $user = auth()->user();
        $videoId = $request->video_id;
        $amount = $request->amount;
        
        // Check if user has sufficient balance
        $wallet = $this->walletService->getWallet($user);
        
        if ($wallet['balance'] < $amount) {
            return $this->errorResponse(
                'Insufficient funds. Please top up your wallet.',
                400
            );
        }
        
        // Check if video exists - use Video model directly since we don't have getVideoById
        $video = \App\Models\Video::find($videoId);
        
        if (!$video || !$video->is_active) {
            return $this->errorResponse(
                'Video not found or not available for investment',
                404
            );
        }
        
        // Process the investment - note we pass the user object directly
        $result = $this->investmentService->investInVideo($user, $videoId, $amount);
        
        if (!$result['success']) {
            return $this->errorResponse($result['message'], 400);
        }
        
        return $this->successResponse(
            ['investment' => $result['investment']],
            'Investment created successfully'
        );
    }
    
    /**
     * Get all investments made by the authenticated user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyInvestments(Request $request)
    {
        $user = auth()->user();
        $perPage = $request->get('per_page', 15);
        
        // Get investments (now ensures all values are up-to-date)
        $investments = $this->investmentService->getUserInvestments($user->id, $perPage);
        
        return $this->successResponse(
            ['investments' => $investments],
            'Investments retrieved successfully'
        );
    }
    
    /**
     * Get detailed information about a specific investment.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInvestmentDetails($id)
    {
        $user = auth()->user();
        
        // Get the investment - getInvestmentDetails now ensures values are up-to-date
        $investment = $this->investmentService->getInvestmentDetails($id);
        
        // Check if investment exists and belongs to the user
        if (!$investment || $investment->user_id !== $user->id) {
            return $this->errorResponse('Investment not found', 404);
        }
        
        // Calculate current returns for this investment
        $performance = $this->investmentService->calculateReturns($id);
        
        Log::info('Investment details API response', [
            'investment_id' => $id,
            'current_value' => $investment->current_value,
            'return_percentage' => $investment->return_percentage,
            'performance_current_value' => $performance['current_value'],
            'performance_return_percentage' => $performance['return_percentage']
        ]);
        
        return $this->successResponse([
            'investment' => $investment,
            'performance' => $performance
        ], 'Investment details retrieved successfully');
    }
    
    /**
     * Get portfolio overview for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPortfolioOverview()
    {
        $user = auth()->user();
        
        // Get all user's investments - now this ensures they are all up-to-date
        $investments = $this->investmentService->getUserInvestments($user->id, 100);
        
        // Calculate total invested amount
        $totalInvested = $investments->sum('amount');
        
        // Calculate current value directly from the updated investments
        $currentValue = $investments->sum('current_value');
        
        // Calculate return percentage
        $returnPercentage = 0;
        if ($totalInvested > 0) {
            $returnPercentage = (($currentValue - $totalInvested) / $totalInvested) * 100;
        }
        
        // Get total investor rewards for this user
        $totalRewards = Transaction::where('wallet_id', $user->wallet->id)
            ->where('transaction_type', 'investor_reward')
            ->where('status', 'completed')
            ->sum('amount');
        
        // Group investments by video creator
        $byCreator = $investments->groupBy('video.user_id')
            ->map(function($items) {
                return [
                    'creator_name' => $items->first()->video->user->name ?? 'Unknown Creator',
                    'investment_count' => $items->count(),
                    'total_invested' => $items->sum('amount'),
                    'current_value' => $items->sum('current_value')
                ];
            });
        
        // Log the portfolio calculation for debugging
        Log::info('Portfolio overview calculation', [
            'user_id' => $user->id,
            'total_invested' => $totalInvested,
            'current_value' => $currentValue,
            'return_percentage' => $returnPercentage,
            'investment_count' => $investments->count(),
            'total_investor_rewards' => $totalRewards
        ]);
        
        return $this->successResponse([
            'portfolio' => [
                'total_invested' => $totalInvested,
                'current_value' => $currentValue,
                'return_percentage' => $returnPercentage,
                'investment_count' => $investments->count(),
                'total_rewards' => $totalRewards
            ],
            'by_creator' => $byCreator
        ], 'Portfolio overview retrieved successfully');
    }

    /**
     * Get user's transaction history.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTransactionHistory(Request $request)
    {
        $user = auth()->user();
        $perPage = $request->get('per_page', 15);
        
        // Get the user's wallet
        $wallet = $user->wallet;
        
        if (!$wallet) {
            return $this->errorResponse('Wallet not found', 404);
        }
        
        // Get transactions
        $transactions = Transaction::where('wallet_id', $wallet->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
            
        // Force sync any investments for transactions that are rewards
        $rewardTransactions = $transactions->filter(function($transaction) {
            return $transaction->transaction_type === 'investor_reward';
        });
        
        // Group by video_id to avoid duplicate syncs
        $videoIds = $rewardTransactions->pluck('related_video_id')->unique();
        
        foreach ($videoIds as $videoId) {
            $investments = \App\Models\LikeInvestment::where('user_id', $user->id)
                ->where('video_id', $videoId)
                ->get();
                
            foreach ($investments as $investment) {
                $this->investmentService->syncInvestmentWithTransactions($investment->id);
            }
        }
        
        return $this->successResponse([
            'transactions' => $transactions,
        ], 'Transaction history retrieved successfully');
    }

 /**
 * Get AI-powered investment recommendations.
 *
 * @return \Illuminate\Http\JsonResponse
 */
public function getAIRecommendations()
{
    try {
        $user = auth()->user();
        
        // Get recommendations using our AIService
        $aiService = new \App\Services\AIService();
        $recommendations = $aiService->getInvestmentRecommendations($user->id);
        
        if (!$recommendations['success']) {
            return $this->errorResponse($recommendations['message'], 400);
        }
        
        return $this->successResponse(
            $recommendations,
            'AI investment recommendations retrieved successfully'
        );
    } catch (\Exception $e) {
        Log::error('AI recommendation error', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return $this->errorResponse(
            'Error: ' . $e->getMessage(),
            500
        );
    }
}
}