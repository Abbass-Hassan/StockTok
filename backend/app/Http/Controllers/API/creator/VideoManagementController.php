<?php

namespace App\Http\Controllers\Api\Creator;

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
}