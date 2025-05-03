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


    /**
     * Update the authenticated creator's profile information.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateCreatorProfile(Request $request)
    {
        $user = auth()->user();
        
        // Validate the request
        $request->validate([
            'name' => 'nullable|string|max:255',
            'username' => 'nullable|string|max:100|unique:users,username,' . $user->id,
            'bio' => 'nullable|string|max:1000',
            'phone' => 'nullable|string|max:20',
            'profile_photo' => 'nullable|image|max:5120', // 5MB max
        ]);
        
        // Update the profile
        $updatedUser = $this->userService->updateProfile(
            $user,
            $request->only(['name', 'username', 'bio', 'phone', 'profile_photo'])
        );
        
        // Get updated profile information
        $profile = $this->userService->getUserProfile($updatedUser->id);
        
        // Get follower count
        $followerCount = $this->followService->getFollowerCount($updatedUser->id);
        
        // Enhance profile with creator-specific information
        $enhancedProfile = array_merge($profile, [
            'follower_count' => $followerCount,
            'is_creator' => true
        ]);
        
        return $this->successResponse(
            ['profile' => $enhancedProfile],
            'Creator profile updated successfully'
        );
    }


    /**
     * Get information about the creator's followers.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFollowerStats(Request $request)
    {
        $user = auth()->user();
        $perPage = $request->get('per_page', 15);
        
        // Get paginated list of followers
        $followers = $this->followService->getFollowers($user->id, $perPage);
        
        // Get total follower count
        $followerCount = $this->followService->getFollowerCount($user->id);
        
        return $this->successResponse([
            'followers' => $followers,
            'total_count' => $followerCount
        ], 'Follower statistics retrieved successfully');
    }
}