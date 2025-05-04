<?php

namespace Tests\Feature\Creator;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\ApiTestCase;
use App\Models\UserType;
use App\Models\User;
use App\Models\Video;

class VideoDeletionTest extends ApiTestCase
{
    /**
     * Create a creator user for testing.
     */
    protected function createCreatorUser()
    {
        // Get creator user type
        $creatorUserType = UserType::where('type_name', 'creator')->first();
        
        // Create creator user
        $user = User::create([
            'email' => $this->faker->unique()->safeEmail,
            'password' => bcrypt('password'),
            'username' => $this->faker->userName,
            'user_type_id' => $creatorUserType->id,
        ]);
        
        $token = $user->createToken('test-token')->plainTextToken;
        
        return [
            'user' => $user,
            'token' => $token
        ];
    }
    
    /**
     * Test creator can call delete endpoint for their own video.
     */
    public function test_creator_can_delete_own_video(): void
    {
        // Create a creator user
        $auth = $this->createCreatorUser();
        $user = $auth['user'];
        $token = $auth['token'];
        
        // Create a video for this creator
        $video = Video::create([
            'user_id' => $user->id,
            'title' => 'Video to Delete',
            'description' => 'This video will be deleted',
            'video_url' => 'videos/delete-test-video.mp4',
            'thumbnail_url' => 'thumbnails/delete-test-thumbnail.jpg',
            'caption' => 'Delete caption',
            'initial_investment' => 100,
            'upload_fee' => 5,
            'status' => 'published'
        ]);
        
        // Store the video ID
        $videoId = $video->id;
        
        // Send delete request
        $response = $this->deleteJson("/api/creator/videos/{$videoId}", 
            [], 
            $this->getAuthHeader($token)
        );
        
        // Assert successful deletion response
        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success');
                 
        // Verify that after a DELETE request we can't find the video in the creator's list
        $listResponse = $this->getJson('/api/creator/videos', 
            $this->getAuthHeader($token)
        );
        
        // Get all video IDs from the list
        $videos = $listResponse->json('data.videos');
        $videoIds = array_column($videos, 'id');
        
        // Check that our deleted video ID is not in the list
        $this->assertFalse(
            in_array($videoId, $videoIds),
            'Deleted video should not appear in creator\'s video list'
        );
    }
    
    /**
     * Test creator cannot delete another creator's video.
     */
    public function test_creator_cannot_delete_others_video(): void
    {
        // Create first creator
        $auth1 = $this->createCreatorUser();
        $user1 = $auth1['user'];
        
        // Create a video for first creator
        $video = Video::create([
            'user_id' => $user1->id,
            'title' => 'Other Creator Video to Not Delete',
            'description' => 'This video belongs to another creator',
            'video_url' => 'videos/nodelete-test-video.mp4',
            'thumbnail_url' => 'thumbnails/nodelete-test-thumbnail.jpg',
            'caption' => 'No delete caption',
            'initial_investment' => 100,
            'upload_fee' => 5,
            'status' => 'published'
        ]);
        
        // Create second creator
        $auth2 = $this->createCreatorUser();
        $token2 = $auth2['token'];
        
        // Second creator attempts to delete first creator's video
        $response = $this->deleteJson("/api/creator/videos/{$video->id}", 
            [], 
            $this->getAuthHeader($token2)
        );
        
        // Assert error response - either 403 (Forbidden) or 404 (Not Found)
        $this->assertTrue(
            in_array($response->getStatusCode(), [403, 404]),
            'Response should be either 403 Forbidden or 404 Not Found'
        );
    }
    
    /**
     * Test non-creator users cannot delete videos.
     */
    public function test_regular_users_cannot_delete_videos(): void
    {
        // Create a creator user
        $authCreator = $this->createCreatorUser();
        $creatorUser = $authCreator['user'];
        
        // Create a video
        $video = Video::create([
            'user_id' => $creatorUser->id,
            'title' => 'Video for Regular User Test',
            'description' => 'Testing regular users cannot delete',
            'video_url' => 'videos/regular-test-video.mp4',
            'thumbnail_url' => 'thumbnails/regular-test-thumbnail.jpg',
            'caption' => 'Regular user test caption',
            'initial_investment' => 100,
            'upload_fee' => 5,
            'status' => 'published'
        ]);
        
        // Create a regular user
        $authRegular = $this->createUserAndGetToken();
        $regularToken = $authRegular['token'];
        
        // Regular user attempts to delete the video
        $response = $this->deleteJson("/api/creator/videos/{$video->id}", 
            [], 
            $this->getAuthHeader($regularToken)
        );
        
        // Assert unauthorized/forbidden response
        $this->assertTrue(
            in_array($response->getStatusCode(), [401, 403, 404]),
            'Response should be unauthorized (401) or forbidden (403) or not found (404)'
        );
    }
}