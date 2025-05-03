<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WalletService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    use ApiResponse;
    
    protected $walletService;
 
    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }


    /**
     * Get wallet details for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getWalletDetails()
    {
        $user = auth()->user();
        
        // Get wallet details
        $wallet = $this->walletService->getWallet($user);
        
        return $this->successResponse(
            ['wallet' => $wallet],
            'Wallet details retrieved successfully'
        );
    }


    /**
     * Deposit funds into the user's wallet.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function depositFunds(Request $request)
    {
        $user = auth()->user();
        
        // Validate the request
        $request->validate([
            'amount' => 'required|numeric|min:10',
        ]);
        
        // Process the deposit
        $result = $this->walletService->deposit($user, $request->amount);
        
        if (!isset($result['success']) || !$result['success']) {
            return $this->errorResponse(
                $result['message'] ?? 'Failed to process deposit',
                400
            );
        }
        
        return $this->successResponse([
            'transaction' => $result['transaction'],
            'wallet' => $result['wallet'],
            'fee' => $result['fee'],
            'net_deposit' => $result['net_deposit']
        ], 'Funds deposited successfully');
    }


    /**
     * Withdraw funds from the user's wallet.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function withdrawFunds(Request $request)
    {
        $user = auth()->user();
        
        // Validate the request
        $request->validate([
            'amount' => 'required|numeric|min:10',
        ]);
        
        // Process the withdrawal
        $result = $this->walletService->withdraw($user, $request->amount);
        
        if (!$result['success']) {
            return $this->errorResponse(
                $result['message'],
                400
            );
        }
        
        return $this->successResponse([
            'transaction' => $result['transaction'],
            'wallet' => $result['wallet'],
            'fee' => $result['fee'],
            'net_withdrawal' => $result['net_withdrawal']
        ], 'Funds withdrawn successfully');
    }
}