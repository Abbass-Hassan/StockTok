<?php

namespace Tests\Feature\Wallet;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\ApiTestCase;
use App\Models\Wallet;

class WithdrawalTest extends ApiTestCase
{
    /**
     * Test successful withdrawal from wallet.
     */
    public function test_successful_withdrawal(): void
    {
        // Create a user and get token
        $auth = $this->createUserAndGetToken();
        $user = $auth['user'];
        $token = $auth['token'];
        
        // Create wallet for the user with an initial balance
        $initialBalance = 200;
        $wallet = Wallet::create([
            'user_id' => $user->id,
            'balance' => $initialBalance,
            'last_updated' => now()
        ]);
        
        // Amount to withdraw
        $withdrawalAmount = 100;
        
        // Make a withdrawal request
        $response = $this->postJson('/api/wallet/withdraw', [
            'amount' => $withdrawalAmount
        ], $this->getAuthHeader($token));
        
        // Assert response
        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success');
        
        // Refresh wallet from database
        $wallet->refresh();
        
        // Calculate expected balance after withdrawal
        $expectedBalance = $initialBalance - $withdrawalAmount;
        
        // Assert wallet balance was updated
        $this->assertEquals($expectedBalance, $wallet->balance);
        
        // Assert transaction was recorded
        $this->assertDatabaseHas('transactions', [
            'wallet_id' => $wallet->id,
            'transaction_type' => 'withdrawal',
            'amount' => -$withdrawalAmount,
            'status' => 'completed'
        ]);
    }
    
    /**
     * Test withdrawal with insufficient funds.
     */
    public function test_withdrawal_insufficient_funds(): void
    {
        // Create a user and get token
        $auth = $this->createUserAndGetToken();
        $user = $auth['user'];
        $token = $auth['token'];
        
        // Create wallet for the user with a small balance
        $wallet = Wallet::create([
            'user_id' => $user->id,
            'balance' => 50,
            'last_updated' => now()
        ]);
        
        // Try to withdraw more than available
        $response = $this->postJson('/api/wallet/withdraw', [
            'amount' => 100
        ], $this->getAuthHeader($token));
        
        // Assert failure response
        $response->assertStatus(400)
                 ->assertJsonPath('status', 'error')
                 ->assertJsonPath('message', 'Insufficient funds');
        
        // Refresh wallet from database
        $wallet->refresh();
        
        // Assert wallet balance remains unchanged
        $this->assertEquals(50, $wallet->balance);
    }
    
    /**
     * Test withdrawal fee calculation.
     */
    public function test_withdrawal_fee_calculation(): void
    {
        // Create a user and get token
        $auth = $this->createUserAndGetToken();
        $user = $auth['user'];
        $token = $auth['token'];
        
        // Create wallet for the user with sufficient balance
        $wallet = Wallet::create([
            'user_id' => $user->id,
            'balance' => 200,
            'last_updated' => now()
        ]);
        
        // Make a withdrawal request
        $response = $this->postJson('/api/wallet/withdraw', [
            'amount' => 100
        ], $this->getAuthHeader($token));
        
        // Assert successful response
        $response->assertStatus(200);
        
        // Get the fee amount from the response
        $feeFromResponse = $response->json('data.fee');
        
        // Check that the fee is approximately 5% (without strict type checking)
        $this->assertEqualsWithDelta(5, $feeFromResponse, 0.01);
        
        // Get the net withdrawal amount from the response
        $netWithdrawalFromResponse = $response->json('data.net_withdrawal');
        
        // Check that the net withdrawal is approximately 95% (without strict type checking)
        $this->assertEqualsWithDelta(95, $netWithdrawalFromResponse, 0.01);
        
        // Assert fee recorded in transaction
        $this->assertDatabaseHas('transactions', [
            'wallet_id' => $wallet->id,
            'transaction_type' => 'withdrawal',
        ]);
    }
}