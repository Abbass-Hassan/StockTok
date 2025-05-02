<?php

namespace App\Services;

use App\Models\User;
use App\Models\Video;

class SearchService
{
    /**
     * Search for users by term.
     */
    public function searchUsers($term, $perPage = 15)
    {
        return User::search($term, ['username', 'name', 'bio'])
                 ->orderBy('username')
                 ->paginate($perPage);
    }


    /**
     * Search for videos by term.
     */
    public function searchVideos($term, $perPage = 15)
    {
        return Video::search($term, ['caption'])
                  ->where('is_active', true)
                  ->orderBy('created_at', 'desc')
                  ->paginate($perPage);
    }
}