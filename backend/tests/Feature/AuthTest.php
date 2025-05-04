<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class AuthTest extends TestCase
{
    // This trait will reset your database after each test
    use RefreshDatabase;

    /**
     * Test user registration with valid data.
     *
     * @return void
     */
    public function test_user_can_register_with_valid_data()
    {
        // Data for registration
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        // Make a POST request to the register endpoint
        $response = $this->postJson('/api/register', $userData);

        // Assert the response status is 201 (Created)
        $response->assertStatus(201);
        
        // Assert the response structure
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'user',
                'token'
            ]
        ]);
        
        // Assert the user was created in the database
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'name' => 'Test User'
        ]);
    }
}