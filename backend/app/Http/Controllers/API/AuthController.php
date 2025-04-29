<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UserProfileUpdateRequest;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use ApiResponse;

    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request)
    {
        $validatedData = $request->validated();
        $user = $this->authService->register($validatedData);

        return $this->successResponse(
            ['user' => $user], 
            'User registered successfully'
        );
    }

    /**
     * Complete user profile after registration.
     */
    public function completeProfile(UserProfileUpdateRequest $request)
    {
        $validatedData = $request->validated();
        $user = $this->authService->completeProfile(auth()->user(), $validatedData);

        return $this->successResponse(
            ['user' => $user], 
            'Profile updated successfully'
        );
    }

    /**
     * Login a user.
     */
    public function login(LoginRequest $request)
    {
        $validatedData = $request->validated();
        
        $loginData = $this->authService->login($validatedData);
        
        if (!$loginData) {
            return $this->errorResponse('Invalid credentials', 401);
        }

        return $this->successResponse(
            $loginData, 
            'Login successful'
        );
    }

    /**
     * Logout the authenticated user.
     */
    public function logout(Request $request)
    {
        $this->authService->logout();
        
        return $this->successResponse(
            null, 
            'Logged out successfully'
        );
    }
}