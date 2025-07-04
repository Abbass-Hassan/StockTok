<?php

namespace App\Http\Controllers\Api\creator;

use App\Http\Controllers\Controller;
use App\Services\VideoService;
use App\Services\InvestmentService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Http\Requests\VideoUploadRequest;

class VideoManagementController extends Controller
{
    use ApiResponse;
    
    protected $videoService;
    protected $investmentService;
    
    public function __construct(VideoService $videoService, InvestmentService $investmentService)
    {
        $this->videoService = $videoService;
        $this->investmentService = $investmentService;
    }


    /**
     * Upload a new video.
     *
     * @param VideoUploadRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadVideo(VideoUploadRequest $request)
    {
        try {
            // Upload the video using validated data
            $video = $this->videoService->uploadVideo(
                auth()->user(),
                $request->validated(),
                $request->file('video_file'),
                $request->file('thumbnail')
            );
            
            return $this->successResponse(
                ['video' => $video],
                'Video uploaded successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                $e->getMessage(),
                500
            );
        }
    }


    /**
     * Get videos uploaded by the logged-in creator.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyVideos(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        
        $videos = $this->videoService->getUserVideos(auth()->id(), $perPage);
        
        return $this->successResponse(
            ['videos' => $videos],
            'Videos retrieved successfully'
        );
    }


    /**
     * Update video details.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateVideo(Request $request, $id)
    {
        // Validate the request
        $request->validate([
            'caption' => 'required|string|max:1000',
        ]);
        
        // Verify ownership
        $video = $this->videoService->getUserVideos(auth()->id())->where('id', $id)->first();
        
        if (!$video) {
            return $this->errorResponse('Video not found or you do not have permission', 404);
        }
        
        // Update the video
        $updatedVideo = $this->videoService->updateVideo($id, $request->only(['caption']));
        
        return $this->successResponse(
            ['video' => $updatedVideo],
            'Video updated successfully'
        );
    }


    /**
     * Delete a video.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteVideo($id)
    {
        // Verify ownership
        $video = $this->videoService->getUserVideos(auth()->id())->where('id', $id)->first();
        
        if (!$video) {
            return $this->errorResponse('Video not found or you do not have permission', 404);
        }
        
        // Delete the video
        $this->videoService->deleteVideo($id);
        
        return $this->successResponse(
            null,
            'Video deleted successfully'
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
        // Verify ownership
        $video = $this->videoService->getUserVideos(auth()->id())->where('id', $id)->first();
        
        if (!$video) {
            return $this->errorResponse('Video not found or you do not have permission', 404);
        }
        
        // Get profitability information
        $profitability = $this->investmentService->calculateVideoProfitability($id);
        
        // Get creator earnings
        $earnings = $this->investmentService->getCreatorEarningsSummary($id);
        
        return $this->successResponse([
            'video' => $video,
            'profitability' => $profitability,
            'earnings' => $earnings
        ], 'Video details retrieved successfully');
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
     * Delete all videos from the database.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteAllVideos()
    {
        try {
            $count = $this->videoService->deleteAllVideos();
            
            return $this->successResponse(
                ['deleted_count' => $count],
                'All videos have been permanently deleted from the database'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to delete videos: ' . $e->getMessage(),
                500
            );
        }
    }
}