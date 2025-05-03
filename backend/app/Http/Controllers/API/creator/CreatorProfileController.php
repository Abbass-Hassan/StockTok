<?php

namespace App\Http\Controllers\Api\Creator;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use App\Services\FollowService;
use App\Services\VideoService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CreatorProfileController extends Controller
{
    use ApiResponse;
    
    protected $userService;
    protected $followService;
    protected $videoService;
    
    public function __construct(
        UserService $userService, 
        FollowService $followService,
        VideoService $videoService
    ) {
        $this->userService = $userService;
        $this->followService = $followService;
        $this->videoService = $videoService;
    }
}