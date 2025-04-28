<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\UserType;

class UserTypeFactory extends Factory
{
    protected $model = UserType::class;

    public function definition(): array
    {
        $types = ['regular', 'creator', 'admin'];
        
        return [
            'type_name' => $this->faker->unique()->randomElement($types),
            'description' => $this->faker->paragraph(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}