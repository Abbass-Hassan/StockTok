<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait FileHandling
{
    /**
     * Store a file and return the path.
     */
    protected function storeFile($file, $directory = 'uploads')
    {
        // Generate a unique file name
        $fileName = Str::random(20) . '.' . $file->getClientOriginalExtension();
        
        // Store the file
        $path = $file->storeAs($directory, $fileName, 'public');
        
        return $path;
    }

    /**
     * Get the URL for a stored file.
     */
    protected function getFileUrl($path)
    {
        if (!$path) {
            return null;
        }
        
        return Storage::url($path);
    }
}