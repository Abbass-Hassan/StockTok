<?php

namespace App\Http\Controllers\Api\Creator;

use App\Http\Controllers\Controller;
use App\Services\VideoService;
use App\Services\InvestmentService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class VideoManagementController extends Controller
{
    use ApiResponse;
    
    protected $videoService;
    protected $investmentService;
    
    public function __construct(VideoService $videoService, InvestmentService $investmentService)
    {
        $this->videoService = $videoService;
        $this->investmentService = $investmentService;
    }
}