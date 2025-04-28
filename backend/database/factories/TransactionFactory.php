<?php

namespace Database\Factories;

use App\Models\LikeInvestment;
use App\Models\Transaction;
use App\Models\Video;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        $amount = $this->faker->randomFloat(2, 1, 1000);
        $transactionTypes = ['deposit', 'withdrawal', 'like_investment', 'earning', 'fee'];
        $transactionType = $this->faker->randomElement($transactionTypes);
        $statuses = ['completed', 'pending', 'failed'];
        
        // Fee calculation based on transaction type
        $feePercentage = match($transactionType) {
            'deposit' => 0.02, // 2%
            'withdrawal' => 0.03, // 3%
            'like_investment' => 0.01, // 1%
            default => 0, // No fee for other transaction types
        };
        
        $feeAmount = $amount * $feePercentage;

        return [
            'wallet_id' => Wallet::factory(),
            'amount' => $amount,
            'transaction_type' => $transactionType,
            'related_video_id' => in_array($transactionType, ['like_investment', 'earning']) ? Video::factory() : null,
            'related_like_investment_id' => $transactionType === 'earning' ? LikeInvestment::factory() : null,
            'status' => $this->faker->randomElement($statuses),
            'description' => $this->faker->sentence(),
            'fee_amount' => $feeAmount,
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => now(),
        ];
    }

    public function deposit(): static
    {
        return $this->state(fn (array $attributes) => [
            'transaction_type' => 'deposit',
            'amount' => $this->faker->randomFloat(2, 10, 1000),
            'fee_amount' => function (array $attributes) {
                return $attributes['amount'] * 0.02; // 2% fee
            },
            'status' => 'completed',
            'description' => 'Deposit to wallet',
        ]);
    }

    public function withdrawal(): static
    {
        return $this->state(fn (array $attributes) => [
            'transaction_type' => 'withdrawal',
            'amount' => $this->faker->randomFloat(2, 10, 500),
            'fee_amount' => function (array $attributes) {
                return $attributes['amount'] * 0.03; // 3% fee
            },
            'status' => 'completed',
            'description' => 'Withdrawal from wallet',
        ]);
    }
}