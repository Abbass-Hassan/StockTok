<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use App\Services\FollowService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserProfileController extends Controller
{
    use ApiResponse;
    
    protected $userService;
    protected $followService;
    
    public function __construct(
        UserService $userService,
        FollowService $followService
    ) {
        $this->userService = $userService;
        $this->followService = $followService;
    }
    
    // Methods will be added here
}