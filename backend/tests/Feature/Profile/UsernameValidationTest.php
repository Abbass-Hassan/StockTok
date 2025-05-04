<?php

namespace Tests\Feature\Profile;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\ApiTestCase;

class UsernameValidationTest extends ApiTestCase
{
    /**
     * Test valid username updates.
     */
    public function test_valid_username_updates(): void
    {
        // Create user and get token
        $auth = $this->createUserAndGetToken();
        $token = $auth['token'];
        
        // Test various valid usernames according to your application's rules
        $validUsernames = [
            'ab', // Short username
            'valid_username',
            'username123',
            'user_name_123',
            'user name', // With space
            'user.name' // With period
        ];
        
        foreach ($validUsernames as $username) {
            $response = $this->putJson('/api/profile/me', 
                ['username' => $username], 
                $this->getAuthHeader($token)
            );
            
            $response->assertStatus(200)
                    ->assertJsonPath('status', 'success');
            
            // Verify the username was updated in the database
            $this->assertDatabaseHas('users', [
                'id' => $auth['user']->id,
                'username' => $username
            ]);
        }
    }
    
    /**
     * Test unique username requirement.
     */
    public function test_unique_username_requirement(): void
    {
        // Create first user with specific username
        $username = 'unique_test_user_' . time();
        $auth1 = $this->createUserAndGetToken([
            'username' => $username
        ]);
        
        // Create second user
        $auth2 = $this->createUserAndGetToken();
        $token2 = $auth2['token'];
        
        // Try to update second user with first user's username
        $response = $this->putJson('/api/profile/me', 
            ['username' => $username],
            $this->getAuthHeader($token2)
        );
        
        // Assert unique username validation
        $response->assertStatus(400)
                ->assertJsonPath('status', 'error');
    }
    
    /**
     * Test username can be searched.
     */
    public function test_username_can_be_searched(): void
    {
        // Create a user with a specific username
        $uniqueUsername = 'searchable_username_' . time();
        $auth = $this->createUserAndGetToken([
            'username' => $uniqueUsername
        ]);
        $user = $auth['user'];
        $token = $auth['token'];
        
        // Try to find user by username
        $response = $this->getJson("/api/profile/username/{$uniqueUsername}", 
            $this->getAuthHeader($token)
        );
        
        // Assert success and correct user found
        $response->assertStatus(200)
                ->assertJsonPath('data.profile.id', $user->id)
                ->assertJsonPath('data.profile.username', $uniqueUsername);
    }
}