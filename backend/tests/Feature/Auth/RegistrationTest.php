<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\ApiTestCase;
use App\Models\UserType;
use App\Models\User;

class RegistrationTest extends ApiTestCase
{
    /**
     * Test user can register with valid data.
     */
    public function test_user_can_register_with_valid_data(): void
    {
        $userData = [
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'user',
                         'token'
                     ]
                 ]);
                 
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com'
        ]);
    }

    /**
     * Test registration validation errors.
     */
    public function test_registration_requires_email_and_password(): void
    {
        // Empty request
        $response = $this->postJson('/api/register', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email', 'password']);

        // Invalid email
        $response = $this->postJson('/api/register', [
            'email' => 'not-an-email',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test registration with existing email.
     */
    public function test_registration_fails_with_duplicate_email(): void
    {
        // Get regular user type
        $regularUserType = UserType::where('type_name', 'regular')->first();
        
        // Create a user first
        $user = User::create([
            'email' => 'existing@example.com',
            'password' => bcrypt('password123'),
            'username' => 'existinguser',
            'user_type_id' => $regularUserType->id,
        ]);

        // Try to register with the same email
        $response = $this->postJson('/api/register', [
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }
}