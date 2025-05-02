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
    public function createComment($user, $videoId, $content)
    {
        // Validate video exists
        $video = Video::findOrFail($videoId);
        
        // Create the comment
        $comment = Comment::create([
            'user_id' => $user->id,
            'video_id' => $videoId,
            'content' => $content,
            'created_at' => now(),
            'is_active' => true
        ]);
        
        return [
            'success' => true,
            'comment' => $comment,
            'user' => $user,
            'video' => $video
        ];
    }
    
}