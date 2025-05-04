<?php

namespace Tests\Feature\Creator;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\ApiTestCase;
use App\Models\UserType;
use App\Models\User;
use App\Models\Video;

class VideoUpdateTest extends ApiTestCase
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
     * Test the structure of update video endpoint.
     */
    public function test_update_video_endpoint_structure(): void
    {
        // Create a creator user
        $auth = $this->createCreatorUser();
        $user = $auth['user'];
        $token = $auth['token'];
        
        // Create a video for this creator
        $video = Video::create([
            'user_id' => $user->id,
            'title' => 'Original Title',
            'description' => 'Original description',
            'video_url' => 'videos/update-test-video.mp4',
            'thumbnail_url' => 'thumbnails/update-test-thumbnail.jpg',
            'caption' => 'Original caption',
            'initial_investment' => 100,
            'upload_fee' => 5,
            'status' => 'published'
        ]);
        
        // Prepare update data with all required fields
        $updateData = [
            'title' => 'Updated Title',
            'description' => 'Updated description',
            'caption' => 'Updated caption'
        ];
        
        // Send update request
        $response = $this->putJson("/api/creator/videos/{$video->id}", 
            $updateData, 
            $this->getAuthHeader($token)
        );
        
        // Assert response status
        $response->assertStatus(200);
        
        // Basic structure check
        $this->assertTrue(
            isset($response->json()['status']) && 
            isset($response->json()['message']),
            'Response should have status and message fields'
        );
    }
    
    /**
     * Test validation for required fields.
     */
    public function test_update_video_requires_caption(): void
    {
        // Create a creator user
        $auth = $this->createCreatorUser();
        $user = $auth['user'];
        $token = $auth['token'];
        
        // Create a video for this creator
        $video = Video::create([
            'user_id' => $user->id,
            'title' => 'Validation Test Video',
            'description' => 'Testing update validation',
            'video_url' => 'videos/validation-test-video.mp4',
            'thumbnail_url' => 'thumbnails/validation-test-thumbnail.jpg',
            'caption' => 'Validation caption',
            'initial_investment' => 100,
            'upload_fee' => 5,
            'status' => 'published'
        ]);
        
        // Prepare update data without caption
        $invalidData = [
            'title' => 'New Title',
            'description' => 'New description'
            // caption field is missing
        ];
        
        // Send update request
        $response = $this->putJson("/api/creator/videos/{$video->id}", 
            $invalidData, 
            $this->getAuthHeader($token)
        );
        
        // Assert validation error
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['caption']);
    }
    
    /**
     * Test update with different user returns appropriate error.
     */
    public function test_update_with_different_user(): void
    {
        // Create first creator
        $auth1 = $this->createCreatorUser();
        $user1 = $auth1['user'];
        
        // Create a video for first creator
        $video = Video::create([
            'user_id' => $user1->id,
            'title' => 'First Creator Video',
            'description' => 'This video belongs to first creator',
            'video_url' => 'videos/first-creator-video.mp4',
            'thumbnail_url' => 'thumbnails/first-creator-thumbnail.jpg',
            'caption' => 'First creator caption',
            'initial_investment' => 100,
            'upload_fee' => 5,
            'status' => 'published'
        ]);
        
        // Create second creator
        $auth2 = $this->createCreatorUser();
        $token2 = $auth2['token'];
        
        // Second creator attempts to update first creator's video
        $updateData = [
            'title' => 'Unauthorized Update',
            'description' => 'This update should fail',
            'caption' => 'New caption'  // Include required fields
        ];
        
        // Second creator attempts to update
        $response = $this->putJson("/api/creator/videos/{$video->id}", 
            $updateData, 
            $this->getAuthHeader($token2)
        );
        
        // Assert error response - either 403 (Forbidden) or 404 (Not Found)
        $this->assertTrue(
            in_array($response->getStatusCode(), [403, 404]),
            'Response should be either 403 Forbidden or 404 Not Found'
        );
    }
}