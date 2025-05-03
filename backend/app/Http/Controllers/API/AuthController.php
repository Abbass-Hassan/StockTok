<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\UserProfileUpdateRequest;
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
     *
     * @param RegisterRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(RegisterRequest $request)
    {
        // Use validated data from the request
        $user = $this->authService->register($request->validated());
        
        // Generate token
        $token = $user->createToken('auth_token')->plainTextToken;
        
        return $this->successResponse([
            'user' => $user,
            'token' => $token
        ], 'User registered successfully', 201);
    }


    /**
     * Log in a user.
     *
     * @param LoginRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(LoginRequest $request)
    {
        // Use validated data from the request
        $result = $this->authService->login($request->validated());
        
        if (!$result) {
            return $this->errorResponse('Invalid credentials', 401);
        }
        
        return $this->successResponse([
            'user' => $result['user'],
            'token' => $result['token']
        ], 'Login successful');
    }


    /**
     * Log out a user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        $this->authService->logout();
        
        return $this->successResponse(null, 'Logged out successfully');
    }


    /**
     * Complete user profile after registration.
     *
     * @param UserProfileUpdateRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function completeProfile(UserProfileUpdateRequest $request)
    {
        // Use validated data from the request
        $user = $this->authService->completeProfile(auth()->user(), $request->validated());
        
        return $this->successResponse([
            'user' => $user
        ], 'Profile completed successfully');
    }


    /**
     * Request password reset.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);
        
        $result = $this->authService->resetPassword($request->email);
        
        if (!$result) {
            return $this->errorResponse('User not found', 404);
        }
        
        return $this->successResponse($result, 'Password reset link sent');
    }


}