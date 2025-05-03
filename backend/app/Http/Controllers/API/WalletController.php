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
}