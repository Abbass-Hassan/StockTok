<?php

namespace Tests\Feature\Creator;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\ApiTestCase;
use App\Models\UserType;
use App\Models\User;

class VideoDetailsTest extends ApiTestCase
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
     * Test creator can retrieve their videos list.
     */
    public function test_creator_can_retrieve_videos_list(): void
    {
        // Create a creator user
        $auth = $this->createCreatorUser();
        $token = $auth['token'];
        
        // Request creator's videos list
        $response = $this->getJson('/api/creator/videos', 
            $this->getAuthHeader($token)
        );
        
        // Assert response
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'videos'
                     ]
                 ]);
    }
    
    /**
     * Test regular users cannot access creator videos endpoint.
     */
    public function test_regular_users_cannot_access_creator_videos(): void
    {
        // Create a regular user
        $auth = $this->createUserAndGetToken();
        $token = $auth['token'];
        
        // Try to access creator videos endpoint
        $response = $this->getJson('/api/creator/videos', 
            $this->getAuthHeader($token)
        );
        
        // Assert unauthorized/forbidden response
        $this->assertTrue(
            $response->getStatusCode() == 401 || 
            $response->getStatusCode() == 403,
            'Response should be unauthorized (401) or forbidden (403)'
        );
    }
    
    /**
     * Test creator profile endpoint includes creator stats.
     */
    public function test_creator_profile_includes_stats(): void
    {
        // Create a creator user
        $auth = $this->createCreatorUser();
        $token = $auth['token'];
        
        // Request creator profile stats
        $response = $this->getJson('/api/creator/stats', 
            $this->getAuthHeader($token)
        );
        
        // Assert response
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data'  // Just check that data exists, without assuming its structure
                 ]);
        
        // Verify that the response contains some useful data
        $responseData = $response->json('data');
        $this->assertNotEmpty($responseData, 'Creator stats response should contain data');
    }
}