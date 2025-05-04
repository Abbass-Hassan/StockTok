<?php

namespace Tests\Feature\Wallet;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\ApiTestCase;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Transaction;

class WalletCreationTest extends ApiTestCase
{
    /**
     * Test wallet is created automatically on registration.
     */
    public function test_wallet_is_created_on_registration(): void
    {
        // Prepare registration data
        $userData = [
            'email' => 'wallet_test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ];
        
        // Register user
        $response = $this->postJson('/api/register', $userData);
        
        // Assert successful registration
        $response->assertStatus(201);
        
        // Get the user ID from the response
        $userId = $response->json('data.user.id');
        
        // Check if a wallet exists for this user
        $this->assertDatabaseHas('wallets', [
            'user_id' => $userId
        ]);
    }
    
    /**
     * Test wallet creation and initial balance for manual wallet creation.
     */
    public function test_manual_wallet_creation_and_balance(): void
    {
        // Create a user first
        $auth = $this->createUserAndGetToken();
        $user = $auth['user'];
        
        // Manually create a wallet for this user
        $wallet = Wallet::create([
            'user_id' => $user->id,
            'balance' => 0,
            'last_updated' => now()
        ]);
        
        // Create initial transaction
        Transaction::create([
            'wallet_id' => $wallet->id,
            'amount' => 0,
            'transaction_type' => 'wallet_creation',
            'status' => 'completed',
            'description' => 'Initial wallet creation',
            'fee_amount' => 0
        ]);
        
        // Now test the wallet balance
        $this->assertEquals(0, $wallet->balance);
        
        // And verify it in the database
        $this->assertDatabaseHas('wallets', [
            'id' => $wallet->id,
            'user_id' => $user->id,
            'balance' => 0
        ]);
    }
    
    /**
     * Test initial transaction existence for manual wallet creation.
     */
    public function test_initial_transaction_for_manual_wallet(): void
    {
        // Create a user
        $auth = $this->createUserAndGetToken();
        $user = $auth['user'];
        
        // Manually create a wallet for this user
        $wallet = Wallet::create([
            'user_id' => $user->id,
            'balance' => 0,
            'last_updated' => now()
        ]);
        
        // Create initial transaction
        $transaction = Transaction::create([
            'wallet_id' => $wallet->id,
            'amount' => 0,
            'transaction_type' => 'wallet_creation',
            'status' => 'completed',
            'description' => 'Initial wallet creation',
            'fee_amount' => 0
        ]);
        
        // Check for the transaction in the database
        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'wallet_id' => $wallet->id,
            'transaction_type' => 'wallet_creation',
            'status' => 'completed'
        ]);
    }
}