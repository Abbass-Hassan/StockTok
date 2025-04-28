<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserType;
use App\Traits\FileHandling;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    use FileHandling;

    /**
     * Register a new user.
     */
    public function register($data)
    {
        // Find the regular user type
        $regularUserType = UserType::where('type_name', 'regular')->first();
        
        // Create user
        $user = User::create([
            'user_type_id' => $regularUserType->id,
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'username' => $data['email'], // Default username from email
        ]);
        
        // Create wallet for user
        $user->wallet()->create([
            'balance' => 0,
            'last_updated' => now(),
        ]);
        
        return $user;
    }
}