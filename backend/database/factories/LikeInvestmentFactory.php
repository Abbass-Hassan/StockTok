<?php

namespace Database\Factories;

use App\Models\LikeInvestment;
use App\Models\User;
use App\Models\Video;
use Illuminate\Database\Eloquent\Factories\Factory;

class LikeInvestmentFactory extends Factory
{
    protected $model = LikeInvestment::class;

    public function definition(): array
    {
        $amount = $this->faker->randomFloat(2, 1, 100);
        $statuses = ['active', 'complete', 'pending'];
        $returnPercentage = $this->faker->randomFloat(2, -20, 50);
        $currentValue = $amount * (1 + ($returnPercentage / 100));

        return [
            'user_id' => User::factory(),
            'video_id' => Video::factory(),
            'amount' => $amount,
            'status' => $this->faker->randomElement($statuses),
            'return_percentage' => $returnPercentage,
            'current_value' => $currentValue,
            'created_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'updated_at' => now(),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    public function complete(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'complete',
        ]);
    }

    public function profitable(): static
    {
        return $this->state(fn (array $attributes) => [
            'return_percentage' => $this->faker->randomFloat(2, 10, 100),
        ]);
    }
}