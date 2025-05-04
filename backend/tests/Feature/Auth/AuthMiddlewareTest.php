<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\ApiTestCase;

class AuthMiddlewareTest extends ApiTestCase
{
    /**
     * Test protected route requires authentication.
     */
    public function test_protected_route_requires_authentication(): void
    {
        // Use a protected route from your application
        $response = $this->getJson('/api/profile/me');

        $response->assertStatus(401);
    }

    /**
     * Test authenticated user can access protected route.
     */
    public function test_authenticated_user_can_access_protected_route(): void
    {
        // Create user and get token
        $auth = $this->createUserAndGetToken();
        
        // Access protected route with token
        $response = $this->getJson('/api/profile/me', 
            $this->getAuthHeader($auth['token'])
        );

        $response->assertStatus(200);
    }

    /**
     * Test invalid token is rejected.
     */
    public function test_invalid_token_is_rejected(): void
    {
        // Access protected route with invalid token
        $response = $this->getJson('/api/profile/me', [
            'Authorization' => 'Bearer invalid-token'
        ]);

        $response->assertStatus(401);
    }
}