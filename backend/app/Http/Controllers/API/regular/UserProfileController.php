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
    
    /**
     * Get authenticated user's profile.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyProfile()
    {
        $user = auth()->user();
        
        // Get detailed profile
        $profile = $this->userService->getUserProfile($user->id);
        
        // Add follower and following counts
        $followerCount = $this->followService->getFollowerCount($user->id);
        $followingCount = $this->followService->getFollowingCount($user->id);
        
        $profile['follower_count'] = $followerCount;
        $profile['following_count'] = $followingCount;
        
        return $this->successResponse(
            ['profile' => $profile],
            'Profile retrieved successfully'
        );
    }
}