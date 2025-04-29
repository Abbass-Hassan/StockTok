<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\VideoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/complete-profile', [AuthController::class, 'completeProfile']);
    
    // Video routes
    Route::post('/videos', [VideoController::class, 'upload']);
    Route::get('/my-videos', [VideoController::class, 'myVideos']);
    
    // video stream route
    Route::get('/videos/{videoId}/stream', [VideoController::class, 'stream']);
});