<?php

namespace App\Http\Controllers\Api\Regular;

use App\Http\Controllers\Controller;
use App\Services\InvestmentService;
use App\Services\WalletService;
use App\Services\VideoService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

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
        
        if ($wallet->balance < $amount) {
            return $this->errorResponse(
                'Insufficient funds. Please top up your wallet.',
                400
            );
        }
        
        // Check if video is active and available for investment
        $video = $this->videoService->getVideoById($videoId);
        
        if (!$video || !$video->is_active) {
            return $this->errorResponse(
                'Video not found or not available for investment',
                404
            );
        }
        
        // Process the investment
        $result = $this->investmentService->createInvestment($user->id, $videoId, $amount);
        
        if (!$result['success']) {
            return $this->errorResponse($result['message'], 400);
        }
        
        return $this->successResponse(
            ['investment' => $result['investment']],
            'Investment created successfully'
        );
    }
}