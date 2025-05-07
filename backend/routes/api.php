<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\creator\VideoManagementController;
use App\Http\Controllers\Api\creator\EarningsController;
use App\Http\Controllers\Api\creator\CreatorProfileController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\regular\VideoDiscoveryController;
use App\Http\Controllers\Api\regular\InvestmentController;
use App\Http\Controllers\Api\regular\CommentController;
use App\Http\Controllers\Api\regular\FollowController;
use App\Http\Controllers\Api\UserProfileController;
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

    // Wallet routes
    Route::prefix('wallet')->group(function () {
        Route::get('/', [WalletController::class, 'getWalletDetails']);
        Route::post('/deposit', [WalletController::class, 'depositFunds']);
        Route::post('/withdraw', [WalletController::class, 'withdrawFunds']);
        Route::get('/transactions', [WalletController::class, 'getTransactionHistory']);
        Route::get('/summary', [WalletController::class, 'getWalletSummary']);
    });
    
    // Common functionality routes (accessible by both regular users and creators)
    Route::prefix('comments')->group(function () {
        Route::post('/', [CommentController::class, 'addComment']);
        Route::put('/{id}', [CommentController::class, 'updateComment']);
        Route::delete('/{id}', [CommentController::class, 'deleteComment']);
        Route::get('/{id}/replies', [CommentController::class, 'getCommentReplies']);
        Route::get('/user', [CommentController::class, 'getUserComments']);
    });
    
    // Follow routes (accessible by both regular users and creators)
    Route::prefix('follows')->group(function () {
        Route::post('/', [FollowController::class, 'followUser']);
        Route::delete('/{followingId}', [FollowController::class, 'unfollowUser']);
        Route::get('/following', [FollowController::class, 'getMyFollowing']);
        Route::get('/user/{userId}/followers', [FollowController::class, 'getFollowers']);
        Route::get('/user/{userId}/following', [FollowController::class, 'getFollowing']);
        Route::get('/user/{followingId}/status', [FollowController::class, 'isFollowing']);
        Route::get('/user/{userId}/counts', [FollowController::class, 'getFollowCounts']);
    });
    
    // User profile routes (accessible by both regular users and creators)
    Route::prefix('profile')->group(function () {
        Route::get('/me', [UserProfileController::class, 'getMyProfile']);
        Route::put('/me', [UserProfileController::class, 'updateMyProfile']);
        Route::get('/user/{userId}', [UserProfileController::class, 'getUserProfile']);
        Route::get('/username/{username}', [UserProfileController::class, 'getUserByUsername']);
    });
    
    // Video comments route
    Route::get('/videos/{videoId}/comments', [CommentController::class, 'getVideoComments']);

    // Creator-specific routes
    Route::middleware('creator')->prefix('creator')->group(function () {
        // Video Management
        Route::post('/videos', [VideoManagementController::class, 'uploadVideo']);
        Route::get('/videos', [VideoManagementController::class, 'getMyVideos']);
        Route::get('/videos/{id}', [VideoManagementController::class, 'getVideoDetails']);
        Route::put('/videos/{id}', [VideoManagementController::class, 'updateVideo']);
        Route::delete('/videos/{id}', [VideoManagementController::class, 'deleteVideo']);
        Route::get('/videos/{id}/stream', [VideoManagementController::class, 'streamVideo']);


        // Earnings routes
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

    // Regular user specific routes
    Route::middleware('regular')->prefix('regular')->group(function () {
        // Video discovery routes
        Route::prefix('videos')->group(function () {
            Route::get('/trending', [VideoDiscoveryController::class, 'getTrendingVideos']);
            Route::get('/following', [VideoDiscoveryController::class, 'getFollowingFeed']);
            Route::get('/search', [VideoDiscoveryController::class, 'searchVideos']);
            Route::get('/{id}', [VideoDiscoveryController::class, 'getVideoDetails']);
            Route::get('/{id}/stream', [VideoDiscoveryController::class, 'streamVideo']);
        });

        // Investment routes
        Route::post('/investments', [InvestmentController::class, 'investInVideo']);
        Route::get('/investments', [InvestmentController::class, 'getMyInvestments']);
        Route::get('/investments/portfolio/overview', [InvestmentController::class, 'getPortfolioOverview']);
        Route::get('/investments/{id}', [InvestmentController::class, 'getInvestmentDetails']);
    });
});