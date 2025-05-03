<?php

namespace App\Http\Controllers\Api\Regular;

use App\Http\Controllers\Controller;
use App\Services\VideoService;
use App\Services\FollowService;
use App\Services\InvestmentService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class VideoDiscoveryController extends Controller
{
    use ApiResponse;
    
    protected $videoService;
    protected $followService;
    protected $investmentService;
    
    public function __construct(
        VideoService $videoService,
        FollowService $followService,
        InvestmentService $investmentService
    ) {
        $this->videoService = $videoService;
        $this->followService = $followService;
        $this->investmentService = $investmentService;
    }
}