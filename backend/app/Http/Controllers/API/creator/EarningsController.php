<?php

namespace App\Http\Controllers\Api\Creator;

use App\Http\Controllers\Controller;
use App\Services\WalletService;
use App\Services\InvestmentService;
use App\Services\VideoService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class EarningsController extends Controller
{
    use ApiResponse;
    
    protected $walletService;
    protected $investmentService;
    protected $videoService;
    
    public function __construct(
        WalletService $walletService, 
        InvestmentService $investmentService,
        VideoService $videoService
    ) {
        $this->walletService = $walletService;
        $this->investmentService = $investmentService;
        $this->videoService = $videoService;
    }
    
    /**
     * Get earnings dashboard overview.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDashboard()
    {
        $user = auth()->user();
        
        // Get earnings summary from wallet service
        $earningsSummary = $this->walletService->getEarningsSummary($user);
        
        // Get wallet details
        $wallet = $this->walletService->getWallet($user);
        
        // Get monthly earnings trend (last 3 months)
        $monthlyTrend = $this->walletService->getMonthlyEarnings($user, 3);
        
        return $this->successResponse([
            'summary' => $earningsSummary,
            'wallet' => $wallet,
            'monthly_trend' => $monthlyTrend
        ], 'Earnings dashboard retrieved successfully');
    }



    /**
     * Get earnings for a specific video.
     *
     * @param int $id Video ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function getVideoEarnings($id)
    {
        $user = auth()->user();
        
        // Verify ownership of the video
        $video = $this->videoService->getUserVideos($user->id)->where('id', $id)->first();
        
        if (!$video) {
            return $this->errorResponse('Video not found or you do not have permission', 404);
        }
        
        // Get earnings summary for this video
        $earnings = $this->investmentService->getCreatorEarningsSummary($id);
        
        // Get investment details for this video
        $investments = $this->investmentService->getVideoInvestments($id);
        
        // Get profitability metrics
        $profitability = $this->investmentService->calculateVideoProfitability($id);
        
        return $this->successResponse([
            'video' => $video,
            'earnings' => $earnings,
            'investments' => $investments,
            'profitability' => $profitability
        ], 'Video earnings retrieved successfully');
    }



    /**
     * Get monthly earnings trends.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMonthlyEarnings(Request $request)
    {
        $user = auth()->user();
        
        // Get number of months to include (default: 6)
        $months = $request->get('months', 6);
        
        // Limit to reasonable range
        $months = min(max($months, 1), 24);
        
        // Get earnings data grouped by month
        $monthlyEarnings = $this->walletService->getMonthlyEarnings($user, $months);
        
        // Get total earnings for this period
        $totalEarnings = array_sum(array_column($monthlyEarnings, 'earnings'));
        
        return $this->successResponse([
            'monthly_data' => $monthlyEarnings,
            'total_earnings' => $totalEarnings,
            'period_months' => $months
        ], 'Monthly earnings retrieved successfully');
    }


    /**
     * Get list of top investors for creator's content.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInvestorsList(Request $request)
    {
        $user = auth()->user();
        
        // Get limit parameter (default: 10)
        $limit = $request->get('limit', 10);
        
        // Ensure reasonable limit range
        $limit = min(max($limit, 5), 50);
        
        // Get top investors for this creator
        $topInvestors = $this->investmentService->getCreatorTopInvestors($user->id, $limit);
        
        // Get total number of unique investors
        $totalInvestors = $this->investmentService->getCreatorTopInvestors($user->id, 1000)->count();
        
        return $this->successResponse([
            'top_investors' => $topInvestors,
            'total_unique_investors' => $totalInvestors,
            'limit' => $limit
        ], 'Top investors retrieved successfully');
    }
}