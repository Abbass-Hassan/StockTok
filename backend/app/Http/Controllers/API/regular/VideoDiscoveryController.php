<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Video;
use App\Services\VideoService;
use App\Services\InvestmentService;
use App\Services\FollowService;
use App\Services\UserService;
use App\Services\SearchService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class VideoDiscoveryController extends Controller
{
    use ApiResponse;
    
    protected $videoService;
    protected $investmentService;
    protected $followService;
    protected $userService;
    protected $searchService;
    
    public function __construct(
        VideoService $videoService,
        InvestmentService $investmentService,
        FollowService $followService,
        UserService $userService,
        SearchService $searchService
    ) {
        $this->videoService = $videoService;
        $this->investmentService = $investmentService;
        $this->followService = $followService;
        $this->userService = $userService;
        $this->searchService = $searchService;
    }
    

    /**
     * Get trending videos.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTrendingVideos(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        
        $videos = $this->videoService->getTrendingVideos($perPage);
        
        return $this->successResponse(
            ['videos' => $videos],
            'Trending videos retrieved successfully'
        );
    }


    /**
     * Get videos from creators the user follows.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFollowingFeed(Request $request)
    {
        $user = auth()->user();
        $perPage = $request->get('per_page', 15);
        
        // Get the IDs of creators the user follows
        $following = $this->followService->getFollowing($user->id, 1000)->items();
        $followingIds = collect($following)->pluck('following_id')->toArray();
        
        // If not following anyone, return empty result
        if (empty($followingIds)) {
            return $this->successResponse(
                ['videos' => []],
                'No followed creators found'
            );
        }
        
        // Get recent videos from followed creators
        $videos = Video::whereIn('user_id', $followingIds)
                ->where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        
        return $this->successResponse(
            ['videos' => $videos],
            'Following feed retrieved successfully'
        );
    }
}