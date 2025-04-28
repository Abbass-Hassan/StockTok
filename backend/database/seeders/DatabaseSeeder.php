<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserTypeSeeder::class,
            UserSeeder::class,
            WalletSeeder::class,
            VideoSeeder::class,
            LikeInvestmentSeeder::class,
            TransactionSeeder::class,
            CommentSeeder::class,
            FollowSeeder::class,
        ]);
    }
}