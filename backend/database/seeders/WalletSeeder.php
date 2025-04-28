<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;

class WalletSeeder extends Seeder
{
    public function run(): void
    {
        // Create wallets for all existing users
        User::all()->each(function ($user) {
            // Create wallet for admin with high balance
            if ($user->username === 'admin') {
                Wallet::create([
                    'user_id' => $user->id,
                    'balance' => 10000.00,
                    'last_updated' => now(),
                ]);
            } 
            // Create wallet for demo creator with moderate balance
            else if ($user->username === 'demoproducer') {
                Wallet::create([
                    'user_id' => $user->id,
                    'balance' => 5000.00,
                    'last_updated' => now(),
                ]);
            }
            // Create wallet for demo investor with starting balance
            else if ($user->username === 'investor1') {
                Wallet::create([
                    'user_id' => $user->id,
                    'balance' => 1000.00,
                    'last_updated' => now(),
                ]);
            }
            // Create random balance wallets for all other users
            else {
                Wallet::create([
                    'user_id' => $user->id,
                    'balance' => rand(0, 2000) + (rand(0, 100) / 100),
                    'last_updated' => now(),
                ]);
            }
        });
    }
}