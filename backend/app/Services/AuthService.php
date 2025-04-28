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

    /**
     * Attempt to login a user.
     */
    public function login($credentials)
    {
        if (!Auth::attempt($credentials)) {
            return false;
        }
        
        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;
        
        return [
            'user' => $user,
            'token' => $token
        ];
    }

    /**
     * Logout the current user.
     */
    public function logout()
    {
        $user = Auth::user();
        
        if ($user) {
            $user->tokens()->delete();
        }
        
        return true;
    }


    /**
     * Update user profile information after registration.
     */
    public function completeProfile($user, $data)
    {
        // Get the appropriate user type
        $userTypeId = null;
        if (isset($data['user_type'])) {
            $typeName = $data['user_type'] === 'Creator' ? 'creator' : 'regular';
            $userType = UserType::where('type_name', $typeName)->first();
            $userTypeId = $userType->id;
        }
        
        // Handle profile photo upload if provided
        $profilePhotoUrl = $user->profile_photo_url;
        if (isset($data['profile_photo']) && $data['profile_photo']) {
            // Use the FileHandling trait method
            $path = $this->storeFile($data['profile_photo'], 'profile-photos');
            $profilePhotoUrl = $this->getFileUrl($path);
        }
        
        // Update user profile
        $user->update([
            'username' => $data['username'],
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'bio' => $data['bio'] ?? null,
            'profile_photo_url' => $profilePhotoUrl,
            'user_type_id' => $userTypeId,
        ]);
        
        return $user;
    }
}