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
    
}