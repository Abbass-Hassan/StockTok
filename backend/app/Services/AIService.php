<?php

namespace App\Services;

use App\Models\LikeInvestment;
use App\Models\Video;
use App\Schemas\PortfolioRecommendationSchema;
use Illuminate\Support\Facades\Log;
use Prism\Prism\Prism;
use Prism\Prism\Enums\Provider;

class AIService
{
    /**
     * Get investment recommendations for a user based on their portfolio.
     */
    public function getInvestmentRecommendations($userId)
    {
        try {
            $investments = LikeInvestment::with(['video', 'video.user'])
                ->where('user_id', $userId)
                ->where('status', 'active')
                ->get();

            $trendingVideos = Video::where('is_active', true)
                ->orderBy('like_investment_count', 'desc')
                ->limit(10)
                ->get();

            //Prepare data for AI
            $portfolioData = [
                'current_investments' => $investments->map(function ($investment) {
                    return [
                        'video_id' => $investment->video_id,
                        'amount' => $investment->amount,
                        'current_value' => $investment->current_value,
                        'return_percentage' => $investment->return_percentage,
                        'creator' => $investment->video->user->username ?? 'Unknown',
                        'video_title' => substr($investment->video->caption ?? 'Untitled', 0, 30)
                    ];
                }),
                'potential_investments' => $trendingVideos->map(function ($video) {
                    return [
                        'video_id' => $video->id,
                        'creator' => $video->user->username ?? 'Unknown',
                        'title' => substr($video->caption ?? 'Untitled', 0, 30),
                        'current_value' => $video->current_value,
                        'like_count' => $video->like_investment_count
                    ];
                })
            ];

            // Create schema for structured AI response
            $schema = PortfolioRecommendationSchema::createSchema();

            // Generate the prompt
            $prompt = $this->generatePrompt($portfolioData);

            // Get recommendations from Prism
            $response = Prism::structured()
                ->using(Provider::OpenAI, 'gpt-4o')
                ->withSchema($schema)
                ->withPrompt($prompt)
                ->asStructured();

            return [
                'success' => true,
                'recommendations' => $response->structured
            ];

        } catch (\Exception $e) {
            Log::error('Error generating AI recommendations: ' . $e->getMessage(), [
                'user_id' => $userId,
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to generate recommendations: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Generate the prompt for the AI.
     *
     * @param array $portfolioData
     * @return string
     */
    private function generatePrompt($portfolioData)
    {
        $prompt = "I need investment recommendations for a user's portfolio.\n\n";
        
        // Add current investments info
        $prompt .= "CURRENT INVESTMENTS:\n";
        if (count($portfolioData['current_investments']) > 0) {
            foreach ($portfolioData['current_investments'] as $investment) {
                $prompt .= "- Video ID: {$investment['video_id']}, Creator: {$investment['creator']}, ";
                $prompt .= "Title: {$investment['video_title']}, Amount: {$investment['amount']}, ";
                $prompt .= "Current Value: {$investment['current_value']}, ";
                $prompt .= "Return: {$investment['return_percentage']}%\n";
            }
        } else {
            $prompt .= "User has no current investments.\n";
        }
        
        // Add potential investments
        $prompt .= "\nPOTENTIAL INVESTMENTS (TRENDING VIDEOS):\n";
        foreach ($portfolioData['potential_investments'] as $video) {
            $prompt .= "- Video ID: {$video['video_id']}, Creator: {$video['creator']}, ";
            $prompt .= "Title: {$video['title']}, Current Value: {$video['current_value']}, ";
            $prompt .= "Like Count: {$video['like_count']}\n";
        }
        
        // Instructions for the AI
        $prompt .= "\nBased on this data, please provide:";
        $prompt .= "\n1. A brief assessment of the user's current portfolio";
        $prompt .= "\n2. A simple diversification strategy suggestion";
        $prompt .= "\n3. 2-3 specific video recommendations from the potential investments list that would complement their portfolio";
        $prompt .= "\n\nFocus on suggesting videos from different creators than what they already invested in, if possible.";
        
        return $prompt;
    }
}