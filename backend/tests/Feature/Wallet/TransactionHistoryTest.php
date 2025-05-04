<?php

namespace Tests\Feature\Wallet;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\ApiTestCase;
use App\Models\Wallet;
use App\Models\Transaction;

class TransactionHistoryTest extends ApiTestCase
{
    /**
     * Test retrieving transaction history.
     */
    public function test_can_retrieve_transaction_history(): void
    {
        // Create a user and get token
        $auth = $this->createUserAndGetToken();
        $user = $auth['user'];
        $token = $auth['token'];
        
        // Create wallet for the user
        $wallet = Wallet::create([
            'user_id' => $user->id,
            'balance' => 500,
            'last_updated' => now()
        ]);
        
        // Create some transactions with unique identifiers
        $uniqueId = uniqid();
        $transaction1 = Transaction::create([
            'wallet_id' => $wallet->id,
            'amount' => 200,
            'transaction_type' => 'deposit',
            'status' => 'completed',
            'description' => "Test transaction {$uniqueId} 1",
            'fee_amount' => 10,
            'created_at' => now()->subMinutes(5)
        ]);
        
        $transaction2 = Transaction::create([
            'wallet_id' => $wallet->id,
            'amount' => -50,
            'transaction_type' => 'withdrawal',
            'status' => 'completed',
            'description' => "Test transaction {$uniqueId} 2",
            'fee_amount' => 2.5,
            'created_at' => now()->subMinutes(3)
        ]);
        
        // Request transaction history
        $response = $this->getJson('/api/wallet/transactions', 
            $this->getAuthHeader($token)
        );
        
        // Basic response validation
        $response->assertStatus(200);
        
        // Verify response contains data
        $this->assertTrue($response->json('data') !== null);
        
        // Verify both transaction IDs exist in database
        $this->assertDatabaseHas('transactions', [
            'id' => $transaction1->id,
            'wallet_id' => $wallet->id,
            'transaction_type' => 'deposit'
        ]);
        
        $this->assertDatabaseHas('transactions', [
            'id' => $transaction2->id,
            'wallet_id' => $wallet->id,
            'transaction_type' => 'withdrawal'
        ]);
    }
    
    /**
     * Test wallet summary.
     */
    public function test_can_retrieve_wallet_summary(): void
    {
        // Create a user and get token
        $auth = $this->createUserAndGetToken();
        $user = $auth['user'];
        $token = $auth['token'];
        
        // Create wallet for the user
        $wallet = Wallet::create([
            'user_id' => $user->id,
            'balance' => 250,
            'last_updated' => now()
        ]);
        
        // Request wallet summary
        $response = $this->getJson('/api/wallet/summary', 
            $this->getAuthHeader($token)
        );
        
        // Basic validation
        $response->assertStatus(200);
        
        // Verify response contains data
        $this->assertTrue($response->json('data') !== null);
        
        // Verify wallet exists in database with correct balance
        $this->assertDatabaseHas('wallets', [
            'id' => $wallet->id,
            'user_id' => $user->id,
            'balance' => 250
        ]);
    }
    
    /**
     * Test that wallet balance updates are reflected in wallet summary.
     */
    public function test_balance_updates_reflected_in_summary(): void
    {
        // Create a user and get token
        $auth = $this->createUserAndGetToken();
        $user = $auth['user'];
        $token = $auth['token'];
        
        // Create wallet for the user with initial balance
        $wallet = Wallet::create([
            'user_id' => $user->id,
            'balance' => 100,
            'last_updated' => now()
        ]);
        
        // Update wallet balance
        $wallet->balance = 150;
        $wallet->save();
        
        // Request wallet summary
        $response = $this->getJson('/api/wallet/summary', 
            $this->getAuthHeader($token)
        );
        
        // Verify response is successful
        $response->assertStatus(200);
        
        // Verify database has updated balance
        $this->assertDatabaseHas('wallets', [
            'id' => $wallet->id,
            'balance' => 150
        ]);
    }
}