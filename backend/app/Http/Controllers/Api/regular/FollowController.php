<?php

namespace App\Http\Controllers\Api\regular;

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
    
    /**
     * Follow a user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function followUser(Request $request)
    {
        // Validate request
        $request->validate([
            'following_id' => 'required|integer|exists:users,id',
        ]);
        
        $user = auth()->user();
        $followingId = $request->following_id;
        
        // Follow the user
        $result = $this->followService->followUser($user, $followingId);
        
        if (!$result['success']) {
            return $this->errorResponse($result['message'], 400);
        }
        
        return $this->successResponse(
            ['follow' => $result['follow']],
            'Successfully followed user'
        );
    }


    /**
     * Unfollow a user.
     *
     * @param int $followingId
     * @return \Illuminate\Http\JsonResponse
     */
    public function unfollowUser($followingId)
    {
        $user = auth()->user();
        
        // Unfollow the user
        $result = $this->followService->unfollowUser($user, $followingId);
        
        if (!$result['success']) {
            return $this->errorResponse($result['message'], 400);
        }
        
        return $this->successResponse(
            [],
            $result['message']
        );
    }


    /**
     * Get followers of a user.
     *
     * @param Request $request
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFollowers(Request $request, $userId)
    {
        $perPage = $request->get('per_page', 15);
        
        // Get the followers
        $followers = $this->followService->getFollowers($userId, $perPage);
        
        return $this->successResponse(
            ['followers' => $followers],
            'Followers retrieved successfully'
        );
    }



    /**
     * Get users followed by a user.
     *
     * @param Request $request
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFollowing(Request $request, $userId)
    {
        $perPage = $request->get('per_page', 15);
        
        // Get the following
        $following = $this->followService->getFollowing($userId, $perPage);
        
        return $this->successResponse(
            ['following' => $following],
            'Following retrieved successfully'
        );
    }


    /**
     * Get users followed by the authenticated user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyFollowing(Request $request)
    {
        $user = auth()->user();
        $perPage = $request->get('per_page', 15);
        
        // Get the following
        $following = $this->followService->getFollowing($user->id, $perPage);
        
        return $this->successResponse(
            ['following' => $following],
            'Following retrieved successfully'
        );
    }


    /**
     * Check if the authenticated user is following another user.
     *
     * @param int $followingId
     * @return \Illuminate\Http\JsonResponse
     */
    public function isFollowing($followingId)
    {
        $user = auth()->user();
        
        // Check if following
        $result = $this->followService->isFollowing($user->id, $followingId);
        
        return $this->successResponse(
            $result,
            'Follow status retrieved successfully'
        );
    }


    /**
     * Get follower and following counts for a user.
     *
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFollowCounts($userId)
    {
        // Get follower count
        $followerCount = $this->followService->getFollowerCount($userId);
        
        // Get following count
        $followingCount = $this->followService->getFollowingCount($userId);
        
        return $this->successResponse(
            [
                'follower_count' => $followerCount,
                'following_count' => $followingCount
            ],
            'Follow counts retrieved successfully'
        );
    }
}