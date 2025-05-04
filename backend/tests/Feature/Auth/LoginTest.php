<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\ApiTestCase;
use App\Models\UserType;
use App\Models\User;

class LoginTest extends ApiTestCase
{
    /**
     * Test user can login with valid credentials.
     */
    public function test_user_can_login_with_valid_credentials(): void
    {
        // Get regular user type
        $regularUserType = UserType::where('type_name', 'regular')->first();
        
        // Create a user
        $user = User::create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'username' => 'testuser',
            'user_type_id' => $regularUserType->id,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'user',
                         'token'
                     ]
                 ]);
    }

    /**
     * Test login fails with invalid credentials.
     */
    public function test_login_fails_with_invalid_credentials(): void
    {
        // First create a user since we need to have a user in the database
        $regularUserType = UserType::where('type_name', 'regular')->first();
        
        $user = User::create([
            'email' => 'real@example.com',
            'password' => bcrypt('password123'),
            'username' => 'realuser',
            'user_type_id' => $regularUserType->id,
        ]);
        
        // Try to login with wrong password
        $response = $this->postJson('/api/login', [
            'email' => 'real@example.com',
            'password' => 'wrongpassword'
        ]);

        $response->assertStatus(401)
                 ->assertJson([
                     'status' => 'error',
                     'message' => 'Invalid credentials'
                 ]);
    }

    /**
     * Test login validation.
     */
    public function test_login_requires_email_and_password(): void
    {
        $response = $this->postJson('/api/login', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email', 'password']);
    }
}