<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Video;
use Illuminate\Database\Eloquent\Factories\Factory;

class VideoFactory extends Factory
{
    protected $model = Video::class;

    public function definition(): array
    {
        $initialInvestment = $this->faker->randomFloat(2, 10, 500);
        $uploadFee = $initialInvestment * 0.05; // 5% of initial investment as fee
        $likeCount = $this->faker->numberBetween(0, 10000);
        $currentValue = $initialInvestment * (1 + ($likeCount / 1000)); // Simple value calculation

        return [
            'user_id' => User::factory()->creator(),
            'video_url' => $this->faker->url() . '.mp4',
            'thumbnail_url' => $this->faker->imageUrl(),
            'caption' => $this->faker->sentence(),
            'initial_investment' => $initialInvestment,
            'upload_fee' => $uploadFee,
            'view_count' => $this->faker->numberBetween(100, 100000),
            'like_investment_count' => $likeCount,
            'current_value' => $currentValue,
            'is_active' => $this->faker->boolean(90), // 90% are active
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => now(),
        ];
    }

    public function trending(): static
    {
        return $this->state(fn (array $attributes) => [
            'view_count' => $this->faker->numberBetween(50000, 1000000),
            'like_investment_count' => $this->faker->numberBetween(5000, 50000),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}