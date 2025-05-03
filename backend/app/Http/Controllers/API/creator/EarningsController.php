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
}