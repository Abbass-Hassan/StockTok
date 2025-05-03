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


    /**
     * Get the authenticated creator's profile information.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCreatorProfile()
    {
        $user = auth()->user();
        
        // Get basic profile information
        $profile = $this->userService->getUserProfile($user->id);
        
        // Get follower count
        $followerCount = $this->followService->getFollowerCount($user->id);
        
        // Enhance profile with creator-specific information
        $enhancedProfile = array_merge($profile, [
            'follower_count' => $followerCount,
            'is_creator' => true
        ]);
        
        return $this->successResponse(
            ['profile' => $enhancedProfile],
            'Creator profile retrieved successfully'
        );
    }
}