<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Video;
use App\Services\VideoService;
use App\Services\InvestmentService;
use App\Services\FollowService;
use App\Services\UserService;
use App\Services\SearchService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class VideoDiscoveryController extends Controller
{
    use ApiResponse;
    
    protected $videoService;
    protected $investmentService;
    protected $followService;
    protected $userService;
    protected $searchService;
    
    public function __construct(
        VideoService $videoService,
        InvestmentService $investmentService,
        FollowService $followService,
        UserService $userService,
        SearchService $searchService
    ) {
        $this->videoService = $videoService;
        $this->investmentService = $investmentService;
        $this->followService = $followService;
        $this->userService = $userService;
        $this->searchService = $searchService;
    }
    
}