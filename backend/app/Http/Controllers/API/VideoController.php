<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\VideoUploadRequest;
use App\Services\VideoService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class VideoController extends Controller
{
    use ApiResponse;

    protected $videoService;

    public function __construct(VideoService $videoService)
    {
        $this->videoService = $videoService;
    }

    /**
     * Upload a new video.
     */
    public function upload(VideoUploadRequest $request)
    {
        $validatedData = $request->validated();
        
        $video = $this->videoService->uploadVideo(
            auth()->user(),
            $validatedData,
            $request->file('video_file'),
            $request->hasFile('thumbnail') ? $request->file('thumbnail') : null
        );

        return $this->successResponse(
            ['video' => $video],
            'Video uploaded successfully'
        );
    }

    /**
     * Stream a video.
     */
    public function stream($videoId)
    {
        $videoData = $this->videoService->streamVideo($videoId);
        
        if (!$videoData) {
            return $this->errorResponse('Video not found', 404);
        }
        
        $stream = new BinaryFileResponse($videoData['path']);
        $stream->headers->set('Content-Type', 'video/mp4');
        $stream->headers->set('Content-Length', $videoData['size']);
        $stream->headers->set('Accept-Ranges', 'bytes');
        $stream->headers->set('Content-Disposition', 'inline; filename="' . $videoData['name'] . '"');
        
        return $stream;
    }

    
    /**
     * Get videos uploaded by the authenticated user.
     */
    public function myVideos(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        
        $videos = $this->videoService->getUserVideos(auth()->id(), $perPage);
        
        return $this->successResponse(
            ['videos' => $videos],
            'Your videos retrieved successfully'
        );
    }
}