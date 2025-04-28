<?php

namespace Database\Seeders;

use App\Models\UserType;
use Illuminate\Database\Seeder;

class UserTypeSeeder extends Seeder
{
    public function run(): void
    {
        // Array of user types to create
        $userTypes = [
            [
                'type_name' => 'regular',
                'description' => 'Regular users who can watch videos and invest in them',
            ],
            [
                'type_name' => 'creator',
                'description' => 'Content creators who can upload videos and receive investments',
            ],
            [
                'type_name' => 'admin',
                'description' => 'Administrators who can manage all aspects of the platform',
            ],
        ];

        // Check if each user type exists before creating
        foreach ($userTypes as $userType) {
            UserType::firstOrCreate(
                ['type_name' => $userType['type_name']],
                ['description' => $userType['description']]
            );
        }
    }
}