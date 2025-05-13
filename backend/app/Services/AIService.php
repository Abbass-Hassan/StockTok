<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    protected $apiKey;
    
    public function __construct()
    {
        $this->apiKey = env('OPENAI_API_KEY');
    }
    
    /**
     * Get simple test recommendations
     */
    public function getTestRecommendations($userId)
    {
        return [
            'success' => true,
            'recommendations' => [
                [
                    'video_id' => 1,
                    'reason' => 'This is a test recommendation based on your previous investments',
                    'suggested_amount' => '$10-$20',
                    'priority' => 'high'
                ],
                [
                    'video_id' => 2,
                    'reason' => 'This creator has content similar to your interests',
                    'suggested_amount' => '$15-$30',
                    'priority' => 'medium'
                ]
            ],
            'portfolio_insights' => 'This is a test portfolio analysis',
            'investment_strategy' => 'Test investment strategy recommendation'
        ];
    }
}