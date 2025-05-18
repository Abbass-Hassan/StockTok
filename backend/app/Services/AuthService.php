<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserType;
use App\Models\Transaction;
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
        
        $tempUsername = 'user_' . time() . '_' . rand(1000, 9999);
        
        // Create user
        $user = User::create([
            'user_type_id' => $regularUserType->id,
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'username' => $tempUsername,
        ]);
        
        $wallet = $user->wallet()->create([
            'balance' => 0,
            'last_updated' => now(),
        ]);
        
        // Create initial transaction record for wallet creation
        Transaction::create([
            'wallet_id' => $wallet->id,
            'amount' => 0,
            'transaction_type' => 'wallet_creation',
            'status' => 'completed',
            'description' => 'Initial wallet creation',
            'fee_amount' => 0
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
        $userTypeId = null;
        
        if (isset($data['user_type_id'])) {
            $userTypeId = $data['user_type_id'];
        }
        elseif (isset($data['user_type'])) {
            $typeName = $data['user_type'] === 'Creator' ? 'creator' : 'regular';
            $userType = UserType::where('type_name', $typeName)->first();
            $userTypeId = $userType->id;
        }
        
        $profilePhotoUrl = $user->profile_photo_url;
        if (isset($data['profile_photo']) && $data['profile_photo']) {
            $path = $this->storeFile($data['profile_photo'], 'profile-photos');
            $profilePhotoUrl = $this->getFileUrl($path);
        }
        
        $user->update([
            'username' => $data['username'] ?? $user->username,
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'bio' => $data['bio'] ?? null,
            'profile_photo_url' => $profilePhotoUrl,
            'user_type_id' => $userTypeId,
        ]);
        
        return $user;
    }

    /**
     * Reset password request.
     */
    public function resetPassword($email)
    {
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            return false;
        }
        
        // Generate password reset token
        $token = \Illuminate\Support\Str::random(60);
        
        // Store the token using the table name from config
        \DB::table(config('auth.passwords.users.table'))->updateOrInsert(
            ['email' => $email],
            [
                'email' => $email,
                'token' => Hash::make($token),
                'created_at' => now()
            ]
        );
        
        return [
            'email' => $email,
            'token' => $token
        ];
    }

    /**
     * Update user password.
     */
    public function updatePassword($user, $oldPassword, $newPassword)
    {
        // Verify old password
        if (!Hash::check($oldPassword, $user->password)) {
            return false;
        }
        
        // Update password
        $user->update([
            'password' => Hash::make($newPassword)
        ]);
        
        return true;
    }
}