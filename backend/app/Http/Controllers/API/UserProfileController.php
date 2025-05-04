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

    /**
     * Update authenticated user's profile.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateMyProfile(Request $request)
    {
        $user = auth()->user();
        
        // Validate request
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:50|unique:users,username,' . $user->id,
            'bio' => 'sometimes|string|max:500',
            'phone' => 'sometimes|string|max:20|nullable',
            'profile_photo' => 'sometimes|image|max:5120', // 5MB max
        ]);
        
        if ($validator->fails()) {
            return $this->errorResponse($validator->errors()->first(), 400);
        }
        
        // Update user profile
        $updatedUser = $this->userService->updateProfile($user, $request->all());
        
        // Get detailed profile with additional info
        $profile = $this->userService->getUserProfile($updatedUser->id);
        
        // Add follower and following counts
        $followerCount = $this->followService->getFollowerCount($updatedUser->id);
        $followingCount = $this->followService->getFollowingCount($updatedUser->id);
        
        $profile['follower_count'] = $followerCount;
        $profile['following_count'] = $followingCount;
        
        return $this->successResponse(
            ['profile' => $profile],
            'Profile updated successfully'
        );
    }


    /**
     * Get another user's public profile.
     *
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserProfile($userId)
    {
        $authUser = auth()->user();
        
        try {
            // Get profile
            $profile = $this->userService->getUserProfile($userId);
            
            // Add follower and following counts
            $followerCount = $this->followService->getFollowerCount($userId);
            $followingCount = $this->followService->getFollowingCount($userId);
            
            $profile['follower_count'] = $followerCount;
            $profile['following_count'] = $followingCount;
            
            // Check if authenticated user is following this user
            $isFollowing = $this->followService->isFollowing($authUser->id, $userId);
            $profile['is_following'] = $isFollowing['is_following'];
            
            return $this->successResponse(
                ['profile' => $profile],
                'User profile retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('User not found', 404);
        }
    }


    /**
     * Get user by username.
     *
     * @param string $username
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserByUsername($username)
    {
        $authUser = auth()->user();
        
        try {
            // Get user by username
            $user = $this->userService->getUserByUsername($username);
            
            // Get profile
            $profile = $this->userService->getUserProfile($user->id);
            
            // Add follower and following counts
            $followerCount = $this->followService->getFollowerCount($user->id);
            $followingCount = $this->followService->getFollowingCount($user->id);
            
            $profile['follower_count'] = $followerCount;
            $profile['following_count'] = $followingCount;
            
            // Check if authenticated user is following this user
            $isFollowing = $this->followService->isFollowing($authUser->id, $user->id);
            $profile['is_following'] = $isFollowing['is_following'];
            
            return $this->successResponse(
                ['profile' => $profile],
                'User profile retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('User not found', 404);
        }
    }
}