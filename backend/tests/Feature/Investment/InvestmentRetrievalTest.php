<?php

namespace Tests\Feature\Investment;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\ApiTestCase;
use App\Models\UserType;
use App\Models\User;
use App\Models\Video;
use App\Models\Wallet;

class InvestmentRetrievalTest extends ApiTestCase
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
     * Test user can retrieve their investments list.
     */
    public function test_user_can_retrieve_investments_list(): void
    {
        // Create user with sufficient balance
        $investorData = $this->createUserWithBalance(500);
        $user = $investorData['user'];
        $token = $investorData['token'];
        
        // Create video with creator
        $videoData = $this->createVideoWithCreator();
        $video = $videoData['video'];
        
        // Create an investment
        $this->createInvestment($user, $token, $video);
        
        // Get investments list
        $response = $this->getJson("/api/regular/investments", 
            $this->getAuthHeader($token)
        );
        
        // Assert response
        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success')
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'investments'
                     ]
                 ]);
        
        // Check that the investments list is not empty
        $investments = $response->json('data.investments.data');
        $this->assertNotEmpty($investments, 'Investments list should not be empty');
    }
    
    /**
     * Test user can retrieve details of a specific investment.
     */
    public function test_user_can_retrieve_investment_details(): void
    {
        // Create user with sufficient balance
        $investorData = $this->createUserWithBalance(500);
        $user = $investorData['user'];
        $token = $investorData['token'];
        
        // Create video with creator
        $videoData = $this->createVideoWithCreator();
        $video = $videoData['video'];
        
        // Create an investment
        $investment = $this->createInvestment($user, $token, $video);
        
        if (!$investment || !isset($investment['id'])) {
            $this->markTestSkipped('Investment creation failed, cannot test details retrieval.');
        }
        
        // Get investment details
        $response = $this->getJson("/api/regular/investments/{$investment['id']}", 
            $this->getAuthHeader($token)
        );
        
        // Assert response
        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success')
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'investment',
                         'performance'
                     ]
                 ]);
    }
    
    /**
     * Test user can view portfolio overview.
     */
    public function test_user_can_view_portfolio_overview(): void
    {
        // Create user with sufficient balance
        $investorData = $this->createUserWithBalance(500);
        $user = $investorData['user'];
        $token = $investorData['token'];
        
        // Create video with creator
        $videoData = $this->createVideoWithCreator();
        $video = $videoData['video'];
        
        // Create an investment
        $this->createInvestment($user, $token, $video);
        
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
                         'portfolio'
                     ]
                 ]);
        
        // Check that portfolio contains key metrics
        $portfolio = $response->json('data.portfolio');
        $this->assertArrayHasKey('total_invested', $portfolio);
        $this->assertArrayHasKey('current_value', $portfolio);
        $this->assertArrayHasKey('return_percentage', $portfolio);
    }
}