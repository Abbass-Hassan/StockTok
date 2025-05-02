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
    
}