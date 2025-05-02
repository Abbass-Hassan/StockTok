<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Video;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CommentService
{
    /**
     * Create a new comment on a video.
     */
    public function createComment($user, $videoId, $content, $parentId = null)
    {
        // Validate video exists
        $video = Video::findOrFail($videoId);
        
        // If parent comment is provided, verify it exists and belongs to the same video
        if ($parentId) {
            $parentComment = Comment::findOrFail($parentId);
            if ($parentComment->video_id != $videoId) {
                return [
                    'success' => false,
                    'message' => 'Parent comment does not belong to this video'
                ];
            }
        }
        
        // Create the comment
        $comment = Comment::create([
            'user_id' => $user->id,
            'video_id' => $videoId,
            'content' => $content,
            'parent_id' => $parentId,
            'created_at' => now()
        ]);
        
        return [
            'success' => true,
            'comment' => $comment,
            'user' => $user,
            'video' => $video
        ];
    }


    /**
     * Delete a comment.
     */
    public function deleteComment($user, $commentId)
    {
        $comment = Comment::findOrFail($commentId);
        
        // Check if user owns the comment or is the video owner
        $video = Video::findOrFail($comment->video_id);
        
        if ($comment->user_id != $user->id && $video->user_id != $user->id) {
            return [
                'success' => false,
                'message' => 'You do not have permission to delete this comment'
            ];
        }
        
        // Delete the comment
        $comment->delete();
        
        return [
            'success' => true,
            'message' => 'Comment deleted successfully'
        ];
    }

    /**
     * Get comments for a video.
     */
    public function getVideoComments($videoId, $perPage = 15)
    {
        // Get only top-level comments (not replies)
        return Comment::with(['user', 'replies.user'])
                    ->where('video_id', $videoId)
                    ->whereNull('parent_id')
                    ->orderBy('created_at', 'desc')
                    ->paginate($perPage);
    }


    /**
     * Get replies to a specific comment.
     */
    public function getCommentReplies($commentId, $perPage = 15)
    {
        return Comment::with('user')
                    ->where('parent_id', $commentId)
                    ->orderBy('created_at', 'asc')
                    ->paginate($perPage);
    }


    /**
     * Get comments by a user.
     */
    public function getUserComments($userId, $perPage = 15)
    {
        return Comment::with(['video', 'parent'])
                    ->where('user_id', $userId)
                    ->orderBy('created_at', 'desc')
                    ->paginate($perPage);
    }


    /**
     * Update a comment.
     */
    public function updateComment($user, $commentId, $content)
    {
        $comment = Comment::findOrFail($commentId);
        
        // Check if user owns the comment
        if ($comment->user_id != $user->id) {
            return [
                'success' => false,
                'message' => 'You do not have permission to update this comment'
            ];
        }
        
        // Update the comment
        $comment->update([
            'content' => $content
        ]);
        
        return [
            'success' => true,
            'comment' => $comment,
            'message' => 'Comment updated successfully'
        ];
    }


    /**
     * Get comment count for a video.
     */
    public function getCommentCount($videoId)
    {
        return Comment::where('video_id', $videoId)->count();
    }
    
}