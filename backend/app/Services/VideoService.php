<?php

namespace App\Services;

use App\Models\Video;
use App\Models\User;
use App\Traits\FileHandling;
use Illuminate\Support\Facades\DB;
use App\Models\Transaction;

class VideoService
{
    use FileHandling;
    
    /**
     * Upload a new video.
     */
    public function uploadVideo($user, $videoData, $videoFile, $thumbnailFile = null)
    {
        // Use DB transaction to ensure data integrity
        return DB::transaction(function () use ($user, $videoData, $videoFile, $thumbnailFile) {
            // Store video file
            $videoPath = $this->storeFile($videoFile, 'videos');
            $videoUrl = $this->getFileUrl($videoPath);
            
            // Store thumbnail if provided
            $thumbnailUrl = null;
            if ($thumbnailFile) {
                $thumbnailPath = $this->storeFile($thumbnailFile, 'thumbnails');
                $thumbnailUrl = $this->getFileUrl($thumbnailPath);
            }
            
            // Get initial investment amount (default to 0 if not provided)
            $initialInvestment = $videoData['initial_investment'] ?? 0;
            
            // Check if user has enough balance for initial investment
            $wallet = $user->wallet;
            if ($wallet->balance < $initialInvestment) {
                throw new \Exception('Insufficient funds for initial investment');
            }
            
            // Create video record
            $video = Video::create([
                'user_id' => $user->id,
                'video_url' => $videoUrl,
                'thumbnail_url' => $thumbnailUrl,
                'caption' => $videoData['caption'],
                'initial_investment' => $initialInvestment,
                'upload_fee' => 0, // No fee for version 1
                'view_count' => 0,
                'like_investment_count' => 0,
                'current_value' => $initialInvestment,
                'is_active' => true,
            ]);
            
            // If there's an initial investment, deduct from wallet and record transaction
            if ($initialInvestment > 0) {
                // Update wallet balance
                $wallet->decrement('balance', $initialInvestment);
                $wallet->update(['last_updated' => now()]);
                
                // Record the transaction
                Transaction::create([
                    'wallet_id' => $wallet->id,
                    'amount' => -$initialInvestment,
                    'transaction_type' => 'initial_investment',
                    'related_video_id' => $video->id,
                    'status' => 'completed',
                    'description' => 'Initial investment for video #' . $video->id,
                    'fee_amount' => 0 // No fee for version 1
                ]);
            }
            
            return $video;
        });
    }

    /**
     * Stream a video file.
     *
     * @param int $videoId
     * @return array|false
     */
    public function streamVideo($videoId)
    {
        try {
            $video = Video::findOrFail($videoId);
            
            // Get the file path from the URL
            $path = str_replace('/storage/', '', $video->video_url);
            $fullPath = storage_path('app/public/' . $path);
            
            // Check if file exists
            if (!file_exists($fullPath)) {
                return false;
            }
            
            // Get file info
            $fileSize = filesize($fullPath);
            $fileName = basename($fullPath);
            $extension = pathinfo($fileName, PATHINFO_EXTENSION);
            
            // Return file information
            return [
                'path' => $fullPath,
                'name' => $fileName,
                'size' => $fileSize,
                'extension' => $extension
            ];
        } catch (\Exception $e) {
            \Log::error('Error in streamVideo: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get a video by ID.
     *
     * @param int $id
     * @return \App\Models\Video|null
     */
    public function getVideoById($id)
    {
        return Video::find($id);
    }
    
    /**
     * Get videos uploaded by a specific user.
     */
    public function getUserVideos($userId, $perPage = 15)
    {
        return Video::where('user_id', $userId)
                    ->where('is_active', true)
                    ->orderBy('created_at', 'desc')
                    ->paginate($perPage);
    }


    /**
     * Increment view count for a video.
     */
    public function incrementViewCount($videoId)
    {
        $video = Video::findOrFail($videoId);
        
        $video->increment('view_count');
        
        return $video->view_count;
    }

    /**
     * Delete (deactivate) a video.
     */
    public function deleteVideo($videoId)
    {
        $video = Video::findOrFail($videoId);
        
        $video->update([
            'is_active' => false
        ]);
        
        return true;
    }

    /**
     * Update video caption and metadata.
     */
    public function updateVideo($videoId, $data)
    {
        $video = Video::findOrFail($videoId);
        
        $video->update([
            'caption' => $data['caption'] ?? $video->caption,
        ]);
        
        return $video;
    }


    /**
     * Get trending videos based on number of likes.
     */
    public function getTrendingVideos($perPage = 15)
    {
        return Video::where('is_active', true)
                    ->orderBy('like_investment_count', 'desc')  // Most likes first
                    ->orderBy('created_at', 'desc')            // Newer videos first if same likes
                    ->paginate($perPage);
    }


    /**
     * Get all active videos with pagination.
     *
     * @param int $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getAllVideos($perPage = 3)
    {
        return Video::where('is_active', true)
                    ->orderBy('created_at', 'desc')
                    ->paginate($perPage);
    }
}