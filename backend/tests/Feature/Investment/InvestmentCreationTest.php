<?php

namespace Tests\Feature\Investment;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\ApiTestCase;
use App\Models\UserType;
use App\Models\User;
use App\Models\Video;
use App\Models\Wallet;

class InvestmentCreationTest extends ApiTestCase
{
    /**
     * Create a user with sufficient wallet balance.
     */
    protected function createUserWithBalance($amount = 500)
    {
        // Create a regular user
        $auth = $this->createUserAndGetToken();
        $user = $auth['user'];
        $token = $auth['token'];
        
        // Create wallet with sufficient balance
        $wallet = Wallet::create([
            'user_id' => $user->id,
            'balance' => $amount,
            'last_updated' => now()
        ]);
        
        return [
            'user' => $user,
            'token' => $token,
            'wallet' => $wallet
        ];
    }
    
    /**
     * Create a video with a creator user.
     */
    protected function createVideoWithCreator()
    {
        // Get creator user type
        $creatorUserType = UserType::where('type_name', 'creator')->first();
        
        // Create creator user
        $creator = User::create([
            'email' => $this->faker->unique()->safeEmail,
            'password' => bcrypt('password'),
            'username' => $this->faker->userName,
            'user_type_id' => $creatorUserType->id,
        ]);
        
        // Create wallet for creator
        $creatorWallet = Wallet::create([
            'user_id' => $creator->id,
            'balance' => 0,
            'last_updated' => now()
        ]);
        
        // Create a video for this creator
        $video = Video::create([
            'user_id' => $creator->id,
            'title' => 'Investment Test Video',
            'description' => 'This video is for testing investments',
            'video_url' => 'videos/investment-test-video.mp4',
            'thumbnail_url' => 'thumbnails/investment-test-thumbnail.jpg',
            'caption' => 'Investment test caption',
            'initial_investment' => 100,
            'upload_fee' => 5,
            'current_value' => 100,  // Set initial current value
            'status' => 'published',
            'is_active' => true
        ]);
        
        return [
            'creator' => $creator,
            'video' => $video,
            'wallet' => $creatorWallet
        ];
    }
    
    /**
     * Test investment endpoint responds with success.
     */
    public function test_investment_endpoint_responds_with_success(): void
    {
        // Create user with sufficient balance
        $investorData = $this->createUserWithBalance(500);
        $investor = $investorData['user'];
        $token = $investorData['token'];
        
        // Create video with creator
        $videoData = $this->createVideoWithCreator();
        $video = $videoData['video'];
        
        // Prepare investment data
        $investmentData = [
            'video_id' => $video->id,
            'amount' => 50
        ];
        
        // Make investment request
        $response = $this->postJson("/api/regular/investments", 
            $investmentData, 
            $this->getAuthHeader($token)
        );
        
        // Assert response
        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success');
        
        // Check response has investment data
        $this->assertTrue(
            isset($response->json('data')['investment']),
            'Response should contain investment data'
        );
    }
    
    /**
     * Test investment fails with insufficient funds.
     */
    public function test_investment_fails_with_insufficient_funds(): void
    {
        // Create user with low balance
        $investorData = $this->createUserWithBalance(10);
        $token = $investorData['token'];
        
        // Create video with creator
        $videoData = $this->createVideoWithCreator();
        $video = $videoData['video'];
        
        // Prepare investment data with amount higher than balance
        $investmentData = [
            'video_id' => $video->id,
            'amount' => 100
        ];
        
        // Make investment request
        $response = $this->postJson("/api/regular/investments", 
            $investmentData, 
            $this->getAuthHeader($token)
        );
        
        // Assert error response
        $response->assertStatus(400)
                 ->assertJsonPath('status', 'error');
                 
        // Check response contains error message about insufficient funds
        $responseContent = $response->getContent();
        $this->assertTrue(
            strpos($responseContent, 'Insufficient funds') !== false,
            'Response should mention insufficient funds'
        );
    }
    
    /**
     * Test investment validation.
     */
    public function test_investment_validation(): void
    {
        // Create user with sufficient balance
        $investorData = $this->createUserWithBalance(500);
        $token = $investorData['token'];
        
        // Create video with creator
        $videoData = $this->createVideoWithCreator();
        $video = $videoData['video'];
        
        // Test missing required fields
        $response = $this->postJson("/api/regular/investments", 
            [], 
            $this->getAuthHeader($token)
        );
        
        // Assert validation errors
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['video_id', 'amount']);
                 
        // Test invalid video ID
        $response = $this->postJson("/api/regular/investments", 
            [
                'video_id' => 99999,  // Non-existent video ID
                'amount' => 50
            ], 
            $this->getAuthHeader($token)
        );
        
        // Assert validation error
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['video_id']);
    }
    
    /**
     * Test user can see investments after creating one.
     */
    public function test_user_can_see_investment_after_creation(): void
    {
        // Create user with sufficient balance
        $investorData = $this->createUserWithBalance(500);
        $token = $investorData['token'];
        
        // Create video with creator
        $videoData = $this->createVideoWithCreator();
        $video = $videoData['video'];
        
        // Prepare investment data
        $investmentData = [
            'video_id' => $video->id,
            'amount' => 50
        ];
        
        // Make investment request
        $this->postJson("/api/regular/investments", 
            $investmentData, 
            $this->getAuthHeader($token)
        );
        
        // Get investments list
        $response = $this->getJson("/api/regular/investments",
            $this->getAuthHeader($token)
        );
        
        // Assert response
        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success');
                 
        // Check that the investments list contains data
        $this->assertTrue(
            isset($response->json('data')['investments']),
            'Response should contain investments list'
        );
    }
}