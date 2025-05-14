<?php

namespace App\Http\Controllers\Api\regular;

use App\Http\Controllers\Controller;
use App\Services\InvestmentService;
use App\Services\WalletService;
use App\Services\VideoService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Services\AIService;

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
        
        // Get the investment - using getInvestmentDetails instead of getInvestmentById
        $investment = $this->investmentService->getInvestmentDetails($id);
        
        // Check if investment exists and belongs to the user
        if (!$investment || $investment->user_id !== $user->id) {
            return $this->errorResponse('Investment not found', 404);
        }
        
        // Calculate current returns for this investment - using calculateReturns for updating
        // This is the original behavior to update the DB when viewing details
        $performance = $this->investmentService->calculateReturns($id);
        
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
        
        // Get all user's investments
        $investments = $this->investmentService->getUserInvestments($user->id, 100);
        
        // Calculate total invested amount
        $totalInvested = $investments->sum('amount');
        
        // Calculate current value without updating the database
        $currentValue = 0;
        $returnPercentage = 0;
        
        // Calculate current values without updating the database
        if ($investments->count() > 0) {
            foreach ($investments as $investment) {
                // Use the non-updating calculation method
                $returns = $this->investmentService->calculateInvestmentReturns($investment);
                $currentValue += $returns['current_value'];
            }
            
            // Calculate overall return percentage
            if ($totalInvested > 0) {
                $returnPercentage = (($currentValue - $totalInvested) / $totalInvested) * 100;
            }
        }
        
        // Group investments by video creator without updating DB
        $byCreator = $investments->groupBy('video.user_id')
            ->map(function($items) {
                $creatorTotalInvested = $items->sum('amount');
                $creatorCurrentValue = 0;
                
                // Calculate current value for each investment in this group
                foreach ($items as $investment) {
                    $returns = $this->investmentService->calculateInvestmentReturns($investment);
                    $creatorCurrentValue += $returns['current_value'];
                }
                
                return [
                    'creator_name' => $items->first()->video->user->name ?? 'Unknown Creator',
                    'investment_count' => $items->count(),
                    'total_invested' => $creatorTotalInvested,
                    'current_value' => $creatorCurrentValue
                ];
            });
        
        return $this->successResponse([
            'portfolio' => [
                'total_invested' => $totalInvested,
                'current_value' => $currentValue,
                'return_percentage' => $returnPercentage,
                'investment_count' => $investments->count()
            ],
            'by_creator' => $byCreator
        ], 'Portfolio overview retrieved successfully');
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
            
            // Create AIService instance with the correct namespace
            $aiService = new \App\Services\AIService();
            
            // Get real AI-powered recommendations
            $recommendations = $aiService->getInvestmentRecommendations($user->id);
            
            if (!$recommendations['success']) {
                return $this->errorResponse($recommendations['message'], 400);
            }
            
            return $this->successResponse(
                $recommendations,
                'AI investment recommendations retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Error: ' . $e->getMessage(),
                500
            );
        }
    }
}