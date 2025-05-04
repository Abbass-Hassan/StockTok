<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\UserType;
use App\Models\User;

class ApiTestCase extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Setup the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create user types with descriptions
        UserType::create([
            'type_name' => 'regular',
            'description' => 'Regular user account type'
        ]);
        
        UserType::create([
            'type_name' => 'creator',
            'description' => 'Creator account with additional permissions'
        ]);
    }

    /**
     * Create a user and get a token
     */
    protected function createUserAndGetToken(array $attributes = [])
    {
        // Get regular user type
        $regularUserType = UserType::where('type_name', 'regular')->first();
        
        // Create user with necessary fields
        $user = User::create(array_merge([
            'email' => $this->faker->unique()->safeEmail,
            'password' => bcrypt('password'),
            'username' => $this->faker->userName,
            'user_type_id' => $regularUserType->id,
        ], $attributes));
        
        $token = $user->createToken('test-token')->plainTextToken;
        
        return [
            'user' => $user,
            'token' => $token
        ];
    }

    /**
     * Get auth header with bearer token
     */
    protected function getAuthHeader($token)
    {
        return ['Authorization' => 'Bearer ' . $token];
    }
}