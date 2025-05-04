<?php

namespace App\Http\Controllers\Api\Regular;

use App\Http\Controllers\Controller;
use App\Services\CommentService;
use App\Services\VideoService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    use ApiResponse;
    
    protected $commentService;
    protected $videoService;
    
    public function __construct(
        CommentService $commentService,
        VideoService $videoService
    ) {
        $this->commentService = $commentService;
        $this->videoService = $videoService;
    }
    
    /**
     * Add a comment to a video.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addComment(Request $request)
    {
        // Validate request
        $request->validate([
            'video_id' => 'required|integer|exists:videos,id',
            'content' => 'required|string|max:500',
            'parent_id' => 'nullable|integer|exists:comments,id'
        ]);
        
        $user = auth()->user();
        $videoId = $request->video_id;
        $content = $request->content;
        $parentId = $request->parent_id;
        
        // Create the comment
        $result = $this->commentService->createComment($user, $videoId, $content, $parentId);
        
        if (!$result['success']) {
            return $this->errorResponse($result['message'], 400);
        }
        
        return $this->successResponse(
            ['comment' => $result['comment']],
            'Comment added successfully'
        );
    }
}