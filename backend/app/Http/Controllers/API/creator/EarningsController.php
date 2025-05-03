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
}