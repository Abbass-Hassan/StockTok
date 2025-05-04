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


    /**
     * Get comments for a video.
     *
     * @param Request $request
     * @param int $videoId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getVideoComments(Request $request, $videoId)
    {
        $perPage = $request->get('per_page', 15);
        
        // Check if video exists and is active
        $video = \App\Models\Video::find($videoId);
        if (!$video || !$video->is_active) {
            return $this->errorResponse('Video not found or not available', 404);
        }
        
        // Get comments
        $comments = $this->commentService->getVideoComments($videoId, $perPage);
        
        return $this->successResponse(
            ['comments' => $comments],
            'Comments retrieved successfully'
        );
    }


    /**
     * Update a comment.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateComment(Request $request, $id)
    {
        // Validate request
        $request->validate([
            'content' => 'required|string|max:500',
        ]);
        
        $user = auth()->user();
        
        // Update the comment
        $result = $this->commentService->updateComment($user, $id, $request->content);
        
        if (!$result['success']) {
            return $this->errorResponse($result['message'], 403);
        }
        
        return $this->successResponse(
            ['comment' => $result['comment']],
            'Comment updated successfully'
        );
    }


    /**
     * Delete a comment.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteComment($id)
    {
        $user = auth()->user();
        
        // Delete the comment
        $result = $this->commentService->deleteComment($user, $id);
        
        if (!$result['success']) {
            return $this->errorResponse($result['message'], 403);
        }
        
        return $this->successResponse(
            [],
            'Comment deleted successfully'
        );
    }


    /**
     * Get replies to a comment.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCommentReplies(Request $request, $id)
    {
        $perPage = $request->get('per_page', 15);
        
        // Check if comment exists
        $comment = \App\Models\Comment::find($id);
        if (!$comment) {
            return $this->errorResponse('Comment not found', 404);
        }
        
        // Get replies
        $replies = $this->commentService->getCommentReplies($id, $perPage);
        
        return $this->successResponse(
            ['replies' => $replies],
            'Comment replies retrieved successfully'
        );
    }


    /**
     * Get comments by the authenticated user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserComments(Request $request)
    {
        $user = auth()->user();
        $perPage = $request->get('per_page', 15);
        
        // Get user comments
        $comments = $this->commentService->getUserComments($user->id, $perPage);
        
        return $this->successResponse(
            ['comments' => $comments],
            'User comments retrieved successfully'
        );
    }
}