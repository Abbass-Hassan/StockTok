<?php

namespace Tests\Feature\Comments;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\ApiTestCase;
use App\Models\User;
use App\Models\Video;
use App\Models\UserType;

class CommentCreationTest extends ApiTestCase
{
    /**
     * Create a video with a creator user.
     */
    protected function createVideoWithCreator()
    {
        // Get creator user type
        $creatorUserType = UserType::where('type_name', 'creator')->first();
        
        // Create creator user
        $creator = User::create([
            'email' => $this->faker->unique()->safeEmail,
            'password' => bcrypt('password'),
            'username' => $this->faker->userName,
            'user_type_id' => $creatorUserType->id,
        ]);
        
        // Create a video for this creator
        $video = Video::create([
            'user_id' => $creator->id,
            'title' => 'Comment Test Video',
            'description' => 'This video is for testing comments',
            'video_url' => 'videos/comment-test-video.mp4',
            'thumbnail_url' => 'thumbnails/comment-test-thumbnail.jpg',
            'caption' => 'Comment test caption',
            'initial_investment' => 100,
            'upload_fee' => 5,
            'current_value' => 100,
            'status' => 'published',
            'is_active' => true
        ]);
        
        return [
            'creator' => $creator,
            'video' => $video
        ];
    }
    
    /**
     * Test user can add a comment to a video.
     */
    public function test_user_can_add_comment(): void
    {
        // Create a regular user
        $auth = $this->createUserAndGetToken();
        $user = $auth['user'];
        $token = $auth['token'];
        
        // Create a video to comment on
        $videoData = $this->createVideoWithCreator();
        $video = $videoData['video'];
        
        // Prepare comment data
        $commentData = [
            'video_id' => $video->id,
            'content' => 'This is a test comment on the video.'
        ];
        
        // Add comment
        $response = $this->postJson("/api/comments", 
            $commentData, 
            $this->getAuthHeader($token)
        );
        
        // Assert response
        $response->assertStatus(201)
                 ->assertJsonPath('status', 'success')
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'comment'
                     ]
                 ]);
    }
    
    /**
     * Test comment validation.
     */
    public function test_comment_validation(): void
    {
        // Create a regular user
        $auth = $this->createUserAndGetToken();
        $token = $auth['token'];
        
        // Create a video to comment on
        $videoData = $this->createVideoWithCreator();
        $video = $videoData['video'];
        
        // Test empty content
        $emptyData = [
            'video_id' => $video->id,
            'content' => ''
        ];
        
        $response = $this->postJson("/api/comments", 
            $emptyData, 
            $this->getAuthHeader($token)
        );
        
        // Assert validation error for empty content
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['content']);
        
        // Test missing video_id
        $missingVideoData = [
            'content' => 'This comment is missing a video ID.'
        ];
        
        $response = $this->postJson("/api/comments", 
            $missingVideoData, 
            $this->getAuthHeader($token)
        );
        
        // Assert validation error for missing video_id
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['video_id']);
        
        // Test invalid video ID
        $invalidVideoData = [
            'video_id' => 99999, // Non-existent video ID
            'content' => 'This comment has an invalid video ID.'
        ];
        
        $response = $this->postJson("/api/comments", 
            $invalidVideoData, 
            $this->getAuthHeader($token)
        );
        
        // Assert validation error for invalid video_id
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['video_id']);
    }
    
    /**
     * Test user can retrieve video comments.
     */
    public function test_user_can_retrieve_video_comments(): void
    {
        // Create a regular user
        $auth = $this->createUserAndGetToken();
        $user = $auth['user'];
        $token = $auth['token'];
        
        // Create a video to comment on
        $videoData = $this->createVideoWithCreator();
        $video = $videoData['video'];
        
        // Add a comment
        $commentData = [
            'video_id' => $video->id,
            'content' => 'This is a test comment for retrieval.'
        ];
        
        $this->postJson("/api/comments", 
            $commentData, 
            $this->getAuthHeader($token)
        );
        
        // Retrieve video comments
        $response = $this->getJson("/api/videos/{$video->id}/comments", 
            $this->getAuthHeader($token)
        );
        
        // Assert response
        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success')
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'comments'
                     ]
                 ]);
        
        // Verify the comments list contains our comment
        $comments = $response->json('data.comments.data');
        $this->assertNotEmpty($comments, 'Comments list should not be empty');
        
        // Verify our comment content is in the list
        $commentContents = array_column($comments, 'content');
        $this->assertTrue(
            in_array('This is a test comment for retrieval.', $commentContents),
            'Comments list should contain our test comment'
        );
    }
}