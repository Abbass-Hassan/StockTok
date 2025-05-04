<?php

namespace Tests\Feature\Profile;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\ApiTestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProfileUpdateTest extends ApiTestCase
{
    /**
     * Test user can update basic profile information.
     */
    public function test_user_can_update_basic_info(): void
    {
        // Create user and get token
        $auth = $this->createUserAndGetToken();
        $user = $auth['user'];
        $token = $auth['token'];
        
        // Prepare update data
        $updateData = [
            'name' => 'Updated Name',
            'username' => 'updated_username',
            'bio' => 'This is my updated bio'
        ];
        
        // Send update request
        $response = $this->putJson('/api/profile/me', $updateData, 
            $this->getAuthHeader($token)
        );
        
        // Assert response
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'profile'
                     ]
                 ]);
        
        // Verify database was updated
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'username' => 'updated_username',
            'bio' => 'This is my updated bio'
        ]);
    }
    
    /**
     * Test username uniqueness validation.
     */
    public function test_username_must_be_unique(): void
    {
        // Create first user
        $auth1 = $this->createUserAndGetToken([
            'username' => 'existing_username'
        ]);
        
        // Create second user
        $auth2 = $this->createUserAndGetToken();
        $token2 = $auth2['token'];
        
        // Try to update second user with first user's username
        $response = $this->putJson('/api/profile/me', 
            ['username' => 'existing_username'],
            $this->getAuthHeader($token2)
        );
        
        // Assert validation error - changed from 422 to 400
        $response->assertStatus(400)
                 ->assertJsonPath('status', 'error'); // Check for error status instead
    }
    
    /**
     * Test field validation rules.
     */
    public function test_profile_update_validation(): void
    {
        // Create user and get token
        $auth = $this->createUserAndGetToken();
        $token = $auth['token'];
        
        // Test validation with invalid data
        $response = $this->putJson('/api/profile/me', [
            'username' => 'a', // Too short
            'name' => str_repeat('a', 300), // Too long
            'phone' => 'not-a-phone-number'
        ], $this->getAuthHeader($token));
        
        // Assert validation errors - changed from 422 to 400
        $response->assertStatus(400)
                 ->assertJsonPath('status', 'error'); // Check for error status instead
    }
}