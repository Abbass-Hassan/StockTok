<?php

namespace App\Services;

use App\Models\Video;
use App\Models\User;
use App\Traits\FileHandling;

class VideoService
{
    use FileHandling;
    
    /**
     * Upload a new video.
     */
    public function uploadVideo($user, $videoData, $videoFile, $thumbnailFile = null)
    {
        // Store video file
        $videoPath = $this->storeFile($videoFile, 'videos');
        $videoUrl = $this->getFileUrl($videoPath);
        
        // Store thumbnail if provided
        $thumbnailUrl = null;
        if ($thumbnailFile) {
            $thumbnailPath = $this->storeFile($thumbnailFile, 'thumbnails');
            $thumbnailUrl = $this->getFileUrl($thumbnailPath);
        }
        
        // Create video record
        $video = Video::create([
            'user_id' => $user->id,
            'video_url' => $videoUrl,
            'thumbnail_url' => $thumbnailUrl,
            'caption' => $videoData['caption'],
            'initial_investment' => $videoData['initial_investment'] ?? 0,
            'upload_fee' => 0, // No fee for version 1
            'view_count' => 0,
            'like_investment_count' => 0,
            'current_value' => $videoData['initial_investment'] ?? 0,
            'is_active' => true,
        ]);
        
        return $video;
    }

    /**
     * Stream a video file.
     */
    public function streamVideo($videoId)
    {
        $video = Video::findOrFail($videoId);
        
        // Get the file path from the URL
        $path = str_replace('/storage/', '', parse_url($video->video_url, PHP_URL_PATH));
        $fullPath = storage_path('app/public/' . $path);
        
        // Check if file exists
        if (!file_exists($fullPath)) {
            return false;
        }
        
        // Get file info
        $fileSize = filesize($fullPath);
        $fileName = basename($fullPath);
        
        // Stream the file
        return [
            'path' => $fullPath,
            'name' => $fileName,
            'size' => $fileSize
        ];
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
}