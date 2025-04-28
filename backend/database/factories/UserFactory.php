<?php

namespace Database\Factories;

use App\Models\UserType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_type_id' => UserType::factory(),
            'username' => $this->faker->unique()->userName(),
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'), // password
            'remember_token' => Str::random(10),
            'profile_photo_url' => $this->faker->imageUrl(),
            'bio' => $this->faker->paragraph(),
            'phone' => $this->faker->phoneNumber(),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
    
    public function regular(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'user_type_id' => UserType::where('type_name', 'regular')->first()->id ?? UserType::factory()->create(['type_name' => 'regular'])->id,
            ];
        });
    }
    
    public function creator(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'user_type_id' => UserType::where('type_name', 'creator')->first()->id ?? UserType::factory()->create(['type_name' => 'creator'])->id,
            ];
        });
    }
    
    public function admin(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'user_type_id' => UserType::where('type_name', 'admin')->first()->id ?? UserType::factory()->create(['type_name' => 'admin'])->id,
            ];
        });
    }
}