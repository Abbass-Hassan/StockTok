<?php

namespace App\Traits;

use Illuminate\Support\Facades\Log;

trait Loggable
{
    /**
     * Log general information with a standardized format.
     *
     * @param string $action The action being performed
     * @param array $data Additional data to log
     * @param string $level Log level (info, error, debug, warning, etc.)
     * @return void
     */
    protected function logActivity(string $action, array $data = [], string $level = 'info'): void
    {
        $context = array_merge([
            'action' => $action,
            'timestamp' => now()->toDateTimeString(),
            'class' => get_class($this),
        ], $data);

        Log::$level($action, $context);
    }

    /**
     * Log investment-related information.
     *
     * @param string $action The investment action
     * @param int $investmentId Investment ID
     * @param array $data Additional investment data
     * @return void
     */
    protected function logInvestment(string $action, int $investmentId, array $data = []): void
    {
        $this->logActivity("Investment {$action}", array_merge([
            'investment_id' => $investmentId,
        ], $data));
    }

    /**
     * Log transaction-related information.
     *
     * @param string $action The transaction action
     * @param int $transactionId Transaction ID
     * @param string $type Transaction type
     * @param array $data Additional transaction data
     * @return void
     */
    protected function logTransaction(string $action, int $transactionId, string $type, array $data = []): void
    {
        $this->logActivity("Transaction {$action}", array_merge([
            'transaction_id' => $transactionId,
            'transaction_type' => $type,
        ], $data));
    }

    /**
     * Log video-related information.
     *
     * @param string $action The video action
     * @param int $videoId Video ID
     * @param array $data Additional video data
     * @return void
     */
    protected function logVideo(string $action, int $videoId, array $data = []): void
    {
        $this->logActivity("Video {$action}", array_merge([
            'video_id' => $videoId,
        ], $data));
    }

    /**
     * Log user-related information.
     *
     * @param string $action The user action
     * @param int $userId User ID
     * @param array $data Additional user data
     * @return void
     */
    protected function logUser(string $action, int $userId, array $data = []): void
    {
        $this->logActivity("User {$action}", array_merge([
            'user_id' => $userId,
        ], $data));
    }

    /**
     * Log wallet-related information.
     *
     * @param string $action The wallet action
     * @param int $walletId Wallet ID
     * @param array $data Additional wallet data
     * @return void
     */
    protected function logWallet(string $action, int $walletId, array $data = []): void
    {
        $this->logActivity("Wallet {$action}", array_merge([
            'wallet_id' => $walletId,
        ], $data));
    }

    /**
     * Log investment returns calculation.
     *
     * @param int $investmentId Investment ID
     * @param float $originalAmount Original investment amount
     * @param float $currentValue Current investment value
     * @param float $returnPercentage Return percentage
     * @param array $additionalData Additional calculation data
     * @return void
     */
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

    /**
     * Log investor reward distribution.
     *
     * @param int $videoId Video ID
     * @param int $newInvestorId New investor user ID
     * @param array $existingInvestorIds Existing investor user IDs
     * @param float $rewardPool Total reward pool amount
     * @param int $transactionCount Number of transactions created
     * @return void
     */
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

    /**
     * Log individual investor reward.
     *
     * @param int $userId User ID
     * @param int $videoId Video ID
     * @param int $investmentId Investment ID
     * @param float $rewardAmount Reward amount
     * @param int $transactionId Transaction ID
     * @param float $previousValue Previous investment value
     * @param float $newValue New investment value
     * @param float $newReturnPercentage New return percentage
     * @return void
     */
    protected function logInvestorReward(
        int $userId, 
        int $videoId, 
        int $investmentId, 
        float $rewardAmount, 
        int $transactionId, 
        float $previousValue, 
        float $newValue, 
        float $newReturnPercentage
    ): void
    {
        $this->logUser('investor reward distributed', $userId, [
            'video_id' => $videoId,
            'investment_id' => $investmentId,
            'reward_amount' => $rewardAmount,
            'transaction_id' => $transactionId,
            'previous_value' => $previousValue,
            'new_value' => $newValue,
            'new_return_percentage' => $newReturnPercentage
        ]);
    }

    /**
     * Log investment update.
     *
     * @param int $investmentId Investment ID
     * @param float $beforeValue Value before update
     * @param float $beforePercentage Return percentage before update
     * @param float $afterValue Value after update
     * @param float $afterPercentage Return percentage after update
     * @return void
     */
    protected function logInvestmentUpdate(
        int $investmentId, 
        float $beforeValue, 
        float $beforePercentage, 
        float $afterValue, 
        float $afterPercentage
    ): void
    {
        $this->logInvestment('updated', $investmentId, [
            'before_current_value' => $beforeValue,
            'before_return_percentage' => $beforePercentage,
            'after_current_value' => $afterValue,
            'after_return_percentage' => $afterPercentage
        ]);
    }

    /**
     * Log an error with stack trace.
     *
     * @param string $message Error message
     * @param \Throwable $exception The exception
     * @param array $context Additional context data
     * @return void
     */
    protected function logError(string $message, \Throwable $exception, array $context = []): void
    {
        Log::error($message, array_merge([
            'exception' => get_class($exception),
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
        ], $context));
    }
}
