<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use App\Http\Requests\RegisterRequest;

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
}