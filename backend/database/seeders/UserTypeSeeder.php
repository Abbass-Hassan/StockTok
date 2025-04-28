<?php

namespace Database\Seeders;

use App\Models\UserType;
use Illuminate\Database\Seeder;

class UserTypeSeeder extends Seeder
{
    public function run(): void
    {
        // Create default user types
        UserType::create([
            'type_name' => 'regular',
            'description' => 'Regular users who can watch videos and invest in them',
        ]);

        UserType::create([
            'type_name' => 'creator',
            'description' => 'Content creators who can upload videos and receive investments',
        ]);

        UserType::create([
            'type_name' => 'admin',
            'description' => 'Administrators who can manage all aspects of the platform',
        ]);
    }
}