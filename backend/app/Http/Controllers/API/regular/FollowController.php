<?php

namespace App\Http\Controllers\Api\Regular;

use App\Http\Controllers\Controller;
use App\Services\FollowService;
use App\Services\UserService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    use ApiResponse;
    
    protected $followService;
    protected $userService;
    
    public function __construct(
        FollowService $followService,
        UserService $userService
    ) {
        $this->followService = $followService;
        $this->userService = $userService;
    }
    
    // Methods will be added here
}