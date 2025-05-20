<?php

namespace App\Traits;

use Illuminate\Support\Facades\Log;

trait Loggable {}
protected function logActivity(string $action, array $data = [], string $level = 'info'): void
{
    $context = array_merge([
        'action' => $action,
        'timestamp' => now()->toDateTimeString(),
        'class' => get_class($this),
    ], $data);

    Log::$level($action, $context);
}
protected function logInvestment(string $action, int $investmentId, array $data = []): void
{
    $this->logActivity("Investment {$action}", array_merge([
        'investment_id' => $investmentId,
    ], $data));
}
protected function logTransaction(string $action, int $transactionId, string $type, array $data = []): void
{
    $this->logActivity("Transaction {$action}", array_merge([
        'transaction_id' => $transactionId,
        'transaction_type' => $type,
    ], $data));
}
protected function logVideo(string $action, int $videoId, array $data = []): void
{
    $this->logActivity("Video {$action}", array_merge([
        'video_id' => $videoId,
    ], $data));
}

protected function logUser(string $action, int $userId, array $data = []): void
{
    $this->logActivity("User {$action}", array_merge([
        'user_id' => $userId,
    ], $data));
}
protected function logWallet(string $action, int $walletId, array $data = []): void
{
    $this->logActivity("Wallet {$action}", array_merge([
        'wallet_id' => $walletId,
    ], $data));
}

protected function logReturnsCalculation(
    int $investmentId,
    float $originalAmount,
    float $currentValue,
    float $returnPercentage,
    array $additionalData = []
): void
{
    $this->logInvestment('returns calculated', $investmentId, array_merge([
        'original_amount' => $originalAmount,
        'current_value' => $currentValue,
        'return_percentage' => $returnPercentage,
    ], $additionalData));
}
protected function logInvestorRewards(
    int $videoId,
    int $newInvestorId,
    array $existingInvestorIds,
    float $rewardPool,
    int $transactionCount
): void
{
    $this->logVideo('investor rewards distributed', $videoId, [
        'new_investor' => $newInvestorId,
        'existing_investors' => $existingInvestorIds,
        'reward_pool' => $rewardPool,
        'transactions_created' => $transactionCount
    ]);
}
