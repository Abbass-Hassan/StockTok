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
}