<?php

namespace App\Services;

use App\Models\Follow;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;

class FollowService
{
    /**
     * Follow a user.
     */
    public function followUser($follower, $followingId)
    {
        // Don't allow users to follow themselves
        if ($follower->id == $followingId) {
            return [
                'success' => false,
                'message' => 'You cannot follow yourself'
            ];
        }
        
        // Check if already following
        $existingFollow = Follow::where('follower_id', $follower->id)
                              ->where('following_id', $followingId)
                              ->first();
        
        if ($existingFollow) {
            return [
                'success' => false,
                'message' => 'Already following this user'
            ];
        }
        
        // Get the user being followed
        $followingUser = User::findOrFail($followingId);
        
        // Create the follow relationship
        $follow = Follow::create([
            'follower_id' => $follower->id,
            'following_id' => $followingId,
            'created_at' => now()
        ]);
        
        return [
            'success' => true,
            'follow' => $follow,
            'follower' => $follower,
            'following' => $followingUser
        ];
    }
}