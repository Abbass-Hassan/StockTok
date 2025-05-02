<?php

namespace App\Services;

use App\Models\User;
use App\Traits\FileHandling;

class UserService
{
    use FileHandling;
    
    /**
     * Get user by ID.
     */
    public function getUserById($userId)
    {
        return User::findOrFail($userId);
    }
    
    /**
     * Get user by username.
     */
    public function getUserByUsername($username)
    {
        return User::where('username', $username)->firstOrFail();
    }


    /**
     * Get user profile data.
     */
    public function getUserProfile($userId)
    {
        $user = User::with('userType')->findOrFail($userId);
        
        return [
            'id' => $user->id,
            'username' => $user->username,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'bio' => $user->bio,
            'profile_photo_url' => $user->profile_photo_url,
            'user_type' => $user->userType->type_name,
            'created_at' => $user->created_at
        ];
    }
}