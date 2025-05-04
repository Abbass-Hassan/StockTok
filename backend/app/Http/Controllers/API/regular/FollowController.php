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
}