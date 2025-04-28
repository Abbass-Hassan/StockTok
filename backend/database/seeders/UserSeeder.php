<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Get user type IDs
        $regularTypeId = UserType::where('type_name', 'regular')->first()->id;
        $creatorTypeId = UserType::where('type_name', 'creator')->first()->id;
        $adminTypeId = UserType::where('type_name', 'admin')->first()->id;

        // Create admin user
        User::create([
            'user_type_id' => $adminTypeId,
            'username' => 'admin',
            'name' => 'System Administrator',
            'email' => 'admin@stocktok.com',
            'password' => Hash::make('password'),
            'profile_photo_url' => 'https://via.placeholder.com/150',
            'bio' => 'StockTok Administrator',
            'phone' => '+1234567890',
        ]);

        // Create demo creator
        User::create([
            'user_type_id' => $creatorTypeId,
            'username' => 'demoproducer',
            'name' => 'Demo Producer',
            'email' => 'creator@stocktok.com',
            'password' => Hash::make('password'),
            'profile_photo_url' => 'https://via.placeholder.com/150',
            'bio' => 'I create awesome investment-worthy content!',
            'phone' => '+1987654321',
        ]);

        // Create demo regular user
        User::create([
            'user_type_id' => $regularTypeId,
            'username' => 'investor1',
            'name' => 'Demo Investor',
            'email' => 'investor@stocktok.com',
            'password' => Hash::make('password'),
            'profile_photo_url' => 'https://via.placeholder.com/150',
            'bio' => 'Looking for the next big investment opportunity',
            'phone' => '+1122334455',
        ]);

        // Create additional users
        User::factory()->count(20)->regular()->create();
        User::factory()->count(10)->creator()->create();
    }
}