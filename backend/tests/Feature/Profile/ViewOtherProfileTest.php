<?php

namespace Tests\Feature\Profile;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\ApiTestCase;
use App\Models\User;
use App\Models\UserType;

class ViewOtherProfileTest extends ApiTestCase
{
    /**
     * Test user can view another user's profile.
     */
    public function test_user_can_view_other_user_profile(): void
    {
        // Create an authenticated user
        $auth = $this->createUserAndGetToken();
        $token = $auth['token'];
        
        // Create another user to view
        $regularUserType = UserType::where('type_name', 'regular')->first();
        $otherUser = User::create([
            'email' => 'other@example.com',
            'password' => bcrypt('password123'),
            'username' => 'otheruser',
            'user_type_id' => $regularUserType->id,
        ]);

        // Request other user's profile
        $response = $this->getJson("/api/profile/user/{$otherUser->id}", 
            $this->getAuthHeader($token)
        );

        // Assert response
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'profile' => [
                             'id',
                             'username',
                             'email',
                             // Other profile fields
                         ]
                     ]
                 ]);
                 
        // Verify the returned profile is for the correct user
        $response->assertJsonPath('data.profile.id', $otherUser->id)
                 ->assertJsonPath('data.profile.username', $otherUser->username);
    }

    /**
     * Test user can find profile by username.
     */
    public function test_user_can_find_profile_by_username(): void
    {
        // Create an authenticated user
        $auth = $this->createUserAndGetToken();
        $token = $auth['token'];
        
        // Create another user to find
        $regularUserType = UserType::where('type_name', 'regular')->first();
        $otherUser = User::create([
            'email' => 'findme@example.com',
            'password' => bcrypt('password123'),
            'username' => 'findthisuser',
            'user_type_id' => $regularUserType->id,
        ]);

        // Request user by username
        $response = $this->getJson("/api/profile/username/{$otherUser->username}", 
            $this->getAuthHeader($token)
        );

        // Assert response
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'profile' => [
                             'id',
                             'username',
                             'email',
                             // Other profile fields
                         ]
                     ]
                 ]);
                 
        // Verify the returned profile is for the correct user
        $response->assertJsonPath('data.profile.id', $otherUser->id)
                 ->assertJsonPath('data.profile.username', $otherUser->username);
    }

    /**
     * Test 404 is returned for non-existent user.
     */
    public function test_404_returned_for_nonexistent_user(): void
    {
        // Create an authenticated user
        $auth = $this->createUserAndGetToken();
        $token = $auth['token'];
        
        // Request non-existent user profile
        $nonExistentId = 9999;
        $response = $this->getJson("/api/profile/user/{$nonExistentId}", 
            $this->getAuthHeader($token)
        );

        // Assert not found response
        $response->assertStatus(404);
    }
}