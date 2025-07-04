<?php

namespace App\Http\Controllers\Api\regular;

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


    /**
     * Stream a video file.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function streamVideo($id)
    {
        try {
            $videoInfo = $this->videoService->streamVideo($id);
            
            if (!$videoInfo) {
                return $this->errorResponse('Video not found or cannot be streamed', 404);
            }
            
            // Determine content type based on extension
            $contentType = 'video/mp4'; // Default
            if (strtolower($videoInfo['extension']) === 'mov') {
                $contentType = 'video/quicktime';
            }
            
            // Set headers for streaming
            $headers = [
                'Content-Type' => $contentType,
                'Content-Disposition' => 'inline; filename="' . $videoInfo['name'] . '"',
                'Accept-Ranges' => 'bytes',
                'Content-Length' => $videoInfo['size']
            ];
            
            // Return file response
            return response()->file($videoInfo['path'], $headers);
        } catch (\Exception $e) {
            return $this->errorResponse('Error streaming video: ' . $e->getMessage(), 500);
        }
    }


    /**
     * Search for videos.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function searchVideos(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:2',
        ]);
        
        $perPage = $request->get('per_page', 15);
        $term = $request->get('query');
        
        $videos = $this->searchService->searchVideos($term, $perPage);
        
        return $this->successResponse(
            ['videos' => $videos],
            'Video search results retrieved successfully'
        );
    }


    /**
     * Get detailed information about a specific video.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getVideoDetails($id)
    {
        try {
            // Find the video
            $video = Video::findOrFail($id);
            
            if (!$video->is_active) {
                return $this->errorResponse('Video not found or has been removed', 404);
            }
            
            // Increment view count
            $this->videoService->incrementViewCount($id);
            
            // Get creator information
            $creator = $this->userService->getUserProfile($video->user_id);
            
            // Get profitability information
            $profitability = $this->investmentService->calculateVideoProfitability($id);
            
            // Check if user follows the creator
            $isFollowing = false;
            if (auth()->check()) {
                $followCheck = $this->followService->isFollowing(auth()->id(), $video->user_id);
                $isFollowing = $followCheck['is_following'];
            }
            
            // Check if user has invested in this video
            $userInvestment = null;
            if (auth()->check()) {
                $investments = $this->investmentService->getUserInvestments(auth()->id());
                foreach ($investments as $investment) {
                    if ($investment->video_id == $id) {
                        $userInvestment = [
                            'investment_id' => $investment->id,
                            'amount' => $investment->amount,
                            'current_value' => $investment->current_value,
                            'return_percentage' => $investment->return_percentage
                        ];
                        break;
                    }
                }
            }
            
            return $this->successResponse([
                'video' => $video,
                'creator' => $creator,
                'profitability' => $profitability,
                'is_following_creator' => $isFollowing,
                'user_investment' => $userInvestment
            ], 'Video details retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Error retrieving video details: ' . $e->getMessage(), 500);
        }
    }


    /**
     * Get videos by a specific user.
     *
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserVideos($userId, Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            
            // Get videos for the specified user
            $videos = $this->videoService->getUserVideos($userId, $perPage);
            
            // Make sure videos are active/public
            if ($videos->isEmpty()) {
                return $this->successResponse(
                    ['videos' => []],
                    'No videos found for this user'
                );
            }
            
            return $this->successResponse(
                ['videos' => $videos],
                'User videos retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Error retrieving user videos: ' . $e->getMessage(), 500);
        }
    }


    /**
     * Get videos by a creator directly from the Video model.
     *
     * @param int $creatorId
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCreatorVideos($creatorId, Request $request)
    {
        try {
            $perPage = $request->get('per_page', 3);
            
            // Verify this is a creator
            $user = User::findOrFail($creatorId);
            if ($user->user_type !== 'creator') {
                return $this->errorResponse('This user is not a creator', 400);
            }
            
            // Direct database query to get videos - bypassing any middleware issues
            $videos = \App\Models\Video::where('user_id', $creatorId)
                        ->where('is_active', true)
                        ->orderBy('created_at', 'desc')
                        ->paginate($perPage);
            
            return $this->successResponse(
                ['videos' => $videos],
                'Creator videos retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Error retrieving creator videos: ' . $e->getMessage(), 500);
        }
    }


    /**
     * Get all videos with pagination.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllVideos(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            
            // Get all active videos with pagination
            $videos = $this->videoService->getAllVideos($perPage);
            
            return $this->successResponse(
                ['videos' => $videos],
                'All videos retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Error retrieving videos: ' . $e->getMessage(), 500);
        }
    }
}