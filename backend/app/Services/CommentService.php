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
    
}