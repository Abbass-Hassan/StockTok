<?php

namespace Tests\Feature\Profile;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\ApiTestCase;
use App\Models\User;

class ProfileRetrievalTest extends ApiTestCase
{
    /**
     * Test user can retrieve their own profile.
     */
    public function test_user_can_retrieve_own_profile(): void
    {
        // Create user and get token
        $auth = $this->createUserAndGetToken();
        $user = $auth['user'];
        $token = $auth['token'];

        // Request profile with authentication
        $response = $this->getJson('/api/profile/me', 
            $this->getAuthHeader($token)
        );

        // Assert response structure and data
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'profile' => [
                             'id',
                             'username',
                             'email',
                             // Other expected profile fields
                         ]
                     ]
                 ]);
                 
        // Verify the returned profile matches the user
        $response->assertJsonPath('data.profile.id', $user->id)
                 ->assertJsonPath('data.profile.email', $user->email);
    }

    /**
     * Test user cannot retrieve profile without authentication.
     */
    public function test_user_cannot_retrieve_profile_without_auth(): void
    {
        // Request profile without authentication
        $response = $this->getJson('/api/profile/me');

        // Assert unauthorized
        $response->assertStatus(401);
    }
}