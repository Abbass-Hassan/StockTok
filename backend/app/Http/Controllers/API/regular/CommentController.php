<?php

namespace App\Http\Controllers\Api\Regular;

use App\Http\Controllers\Controller;
use App\Services\CommentService;
use App\Services\VideoService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    use ApiResponse;
    
    protected $commentService;
    protected $videoService;
    
    public function __construct(
        CommentService $commentService,
        VideoService $videoService
    ) {
        $this->commentService = $commentService;
        $this->videoService = $videoService;
    }
    
    // Methods will be added here
}