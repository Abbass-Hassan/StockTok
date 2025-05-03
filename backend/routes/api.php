<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Creator\VideoManagementController;
use App\Http\Controllers\Api\Creator\EarningsController;
use App\Http\Controllers\Api\Creator\CreatorProfileController;

use Illuminate\Support\Facades\Route;

// Public routes (no authentication required)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/complete-profile', [AuthController::class, 'completeProfile']);
    Route::post('/update-password', [AuthController::class, 'updatePassword']);
    
    // Creator-specific routes
    Route::middleware('creator')->prefix('creator')->group(function () {
        // Video Management
        Route::post('/videos', [VideoManagementController::class, 'uploadVideo']);
        Route::get('/videos', [VideoManagementController::class, 'getMyVideos']);
        Route::get('/videos/{id}', [VideoManagementController::class, 'getVideoDetails']);
        Route::put('/videos/{id}', [VideoManagementController::class, 'updateVideo']);
        Route::delete('/videos/{id}', [VideoManagementController::class, 'deleteVideo']);


        //Earnings routes
        Route::get('/earnings/dashboard', [EarningsController::class, 'getDashboard']);
        Route::get('/earnings/videos/{id}', [EarningsController::class, 'getVideoEarnings']);
        Route::get('/earnings/monthly', [EarningsController::class, 'getMonthlyEarnings']);
        Route::get('/earnings/investors', [EarningsController::class, 'getInvestorsList']);
        Route::post('/earnings/payout', [EarningsController::class, 'requestPayout']);


        // Creator Profile routes
        Route::get('/profile', [CreatorProfileController::class, 'getCreatorProfile']);
        Route::put('/profile', [CreatorProfileController::class, 'updateCreatorProfile']);
        Route::get('/followers', [CreatorProfileController::class, 'getFollowerStats']);
        Route::get('/stats', [CreatorProfileController::class, 'getCreatorStats']);


    });
});