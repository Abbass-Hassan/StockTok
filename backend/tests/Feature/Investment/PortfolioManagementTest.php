<?php

namespace Tests\Feature\Investment;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\ApiTestCase;
use App\Models\UserType;
use App\Models\User;
use App\Models\Video;
use App\Models\Wallet;

class PortfolioManagementTest extends ApiTestCase
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
            'title' => 'Portfolio Test Video',
            'description' => 'This video is for testing portfolio management',
            'video_url' => 'videos/portfolio-test-video.mp4',
            'thumbnail_url' => 'thumbnails/portfolio-test-thumbnail.jpg',
            'caption' => 'Portfolio test caption',
            'initial_investment' => 100,
            'upload_fee' => 5,
            'current_value' => 100,
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
     * Create an investment for testing.
     */
    protected function createInvestment($user, $token, $video)
    {
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
        
        return $response->json('data.investment') ?? null;
    }
    
    /**
     * Test portfolio overview endpoint.
     */
    public function test_portfolio_overview_endpoint(): void
    {
        // Create user with sufficient balance
        $investorData = $this->createUserWithBalance(500);
        $user = $investorData['user'];
        $token = $investorData['token'];
        
        // Create multiple videos and investments
        $video1Data = $this->createVideoWithCreator();
        $video1 = $video1Data['video'];
        $this->createInvestment($user, $token, $video1);
        
        $video2Data = $this->createVideoWithCreator();
        $video2 = $video2Data['video'];
        $this->createInvestment($user, $token, $video2);
        
        // Get portfolio overview
        $response = $this->getJson("/api/regular/investments/portfolio/overview", 
            $this->getAuthHeader($token)
        );
        
        // Assert response
        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success')
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'portfolio' => [
                             'total_invested',
                             'current_value',
                             'return_percentage',
                             'investment_count'
                         ]
                     ]
                 ]);
    }
    
    /**
     * Test empty portfolio handling.
     */
    public function test_empty_portfolio_handling(): void
    {
        // Create user with balance but no investments
        $investorData = $this->createUserWithBalance(500);
        $token = $investorData['token'];
        
        // Get portfolio overview
        $response = $this->getJson("/api/regular/investments/portfolio/overview", 
            $this->getAuthHeader($token)
        );
        
        // Assert response
        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success');
                 
        // Check that portfolio shows zero values for a new user
        $portfolio = $response->json('data.portfolio');
        $this->assertEquals(0, $portfolio['total_invested'], 'Total invested should be 0 for new user');
        $this->assertEquals(0, $portfolio['investment_count'], 'Investment count should be 0 for new user');
    }
    
    /**
     * Test portfolio with multiple creators.
     */
    public function test_portfolio_with_multiple_creators(): void
    {
        // Create user with sufficient balance
        $investorData = $this->createUserWithBalance(1000);
        $user = $investorData['user'];
        $token = $investorData['token'];
        
        // Create videos from different creators and invest in them
        $video1Data = $this->createVideoWithCreator();
        $video1 = $video1Data['video'];
        $this->createInvestment($user, $token, $video1);
        
        $video2Data = $this->createVideoWithCreator();
        $video2 = $video2Data['video'];
        $this->createInvestment($user, $token, $video2);
        
        // Get portfolio overview
        $response = $this->getJson("/api/regular/investments/portfolio/overview", 
            $this->getAuthHeader($token)
        );
        
        // Assert response
        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success');
                 
        // Check that portfolio includes creator breakdown
        $this->assertTrue(
            isset($response->json('data')['by_creator']),
            'Portfolio overview should include creator breakdown'
        );
    }
}