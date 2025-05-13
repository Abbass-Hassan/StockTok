<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class AIService
{
    protected $apiKey;
    protected $baseUrl = 'https://api.openai.com/v1';

    public function __construct()
    {
        $this->apiKey = env('OPENAI_API_KEY');
        
        if (!$this->apiKey) {
            Log::error('OpenAI API key not found in environment variables');
        }
    }

    /**
     * Make a request to OpenAI API
     */
    protected function makeRequest($endpoint, $data)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . $endpoint, $data);

            if ($response->successful()) {
                return $response->json();
            } else {
                Log::error('OpenAI API error: ' . $response->body());
                return null;
            }
        } catch (\Exception $e) {
            Log::error('Error making OpenAI request: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Generate text using OpenAI
     */
    public function generateText($prompt, $model = 'gpt-3.5-turbo')
    {
        $data = [
            'model' => $model,
            'messages' => [
                ['role' => 'system', 'content' => 'You are an investment advisor specializing in content creator investments.'],
                ['role' => 'user', 'content' => $prompt]
            ],
            'temperature' => 0.7,
            'max_tokens' => 800
        ];

        $response = $this->makeRequest('/chat/completions', $data);
        
        if ($response && isset($response['choices'][0]['message']['content'])) {
            return $response['choices'][0]['message']['content'];
        }
        
        return null;
    }

    /**
     * Categorize video based on caption
     */
    public function categorizeVideo($videoCaption)
    {
        // Check cache first to avoid repeated API calls
        $cacheKey = 'video_category_' . md5($videoCaption);
        
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }
        
        $prompt = "Please identify the main category of this video based on its caption. 
        Respond with only ONE category name from this list: Cooking, Fitness, Tech, Fashion, Travel, Education, Entertainment, Finance, Gaming, Beauty, DIY, Music, Art.
        
        Video caption: \"$videoCaption\"";
        
        $category = $this->generateText($prompt);
        
        // Clean up the response - remove quotes, extra spaces, etc.
        $category = trim($category);
        $category = preg_replace('/[^a-zA-Z]/', '', $category);
        
        // Cache the result for 7 days
        Cache::put($cacheKey, $category, 60 * 24 * 7);
        
        return $category;
    }

    /**
     * Analyze user's investment history and preferences
     */
    public function analyzeUserInvestments($userId)
    {
        // Get user's investment history using existing service
        $investmentService = app(InvestmentService::class);
        $investments = $investmentService->getUserInvestments($userId, 100)->items();
        
        if (empty($investments)) {
            return [
                'success' => false,
                'message' => 'No investment history found'
            ];
        }
        
        // Initialize category data
        $categories = [];
        $totalInvested = 0;
        $totalCurrentValue = 0;
        
        // Process each investment
        foreach ($investments as $investment) {
            // Skip investments without video information
            if (!isset($investment->video) || !isset($investment->video->caption)) {
                continue;
            }
            
            // Get or categorize the video
            $category = $this->categorizeVideo($investment->video->caption);
            
            if (!isset($categories[$category])) {
                $categories[$category] = [
                    'count' => 0,
                    'invested' => 0,
                    'current_value' => 0,
                    'videos' => []
                ];
            }
            
            // Update category data
            $categories[$category]['count']++;
            $categories[$category]['invested'] += $investment->amount;
            $categories[$category]['current_value'] += $investment->current_value;
            $categories[$category]['videos'][] = [
                'id' => $investment->video->id,
                'caption' => $investment->video->caption,
                'investment_id' => $investment->id,
                'amount' => $investment->amount,
                'current_value' => $investment->current_value,
                'return_percentage' => $investment->return_percentage
            ];
            
            $totalInvested += $investment->amount;
            $totalCurrentValue += $investment->current_value;
        }
        
        // Calculate performance for each category
        foreach ($categories as $name => &$data) {
            $data['return_percentage'] = $data['invested'] > 0 
                ? (($data['current_value'] - $data['invested']) / $data['invested']) * 100 
                : 0;
            $data['portfolio_percentage'] = $totalInvested > 0 
                ? ($data['invested'] / $totalInvested) * 100 
                : 0;
        }
        
        // Sort categories by performance (best first)
        uasort($categories, function($a, $b) {
            return $b['return_percentage'] <=> $a['return_percentage'];
        });
        
        return [
            'success' => true,
            'categories' => $categories,
            'total_invested' => $totalInvested,
            'total_current_value' => $totalCurrentValue,
            'overall_return_percentage' => $totalInvested > 0 
                ? (($totalCurrentValue - $totalInvested) / $totalInvested) * 100 
                : 0
        ];
    }

    /**
     * Get investment recommendations for a user
     */
    public function getInvestmentRecommendations($userId)
    {
        // Analyze user investments
        $analysis = $this->analyzeUserInvestments($userId);
        
        // Handle case where user has no investment history
        if (!$analysis['success']) {
            if ($analysis['message'] == 'No investment history found') {
                // Get trending videos for new users
                $videoService = app(VideoService::class);
                $trendingVideos = $videoService->getTrendingVideos(5)->items();
                
                if (empty($trendingVideos)) {
                    // Fallback to all available videos if no trending ones
                    $allVideos = $videoService->getAllVideos(5)->items();
                    
                    if (empty($allVideos)) {
                        // Ultimate fallback - mock recommendations if no videos at all
                        return [
                            'success' => true,
                            'recommendations' => [
                                'recommendations' => [
                                    [
                                        'video_id' => 0,
                                        'reason' => 'No videos currently available for investment. This is a placeholder recommendation.',
                                        'suggested_amount' => '$5-$10',
                                        'priority' => 'low',
                                        'video_details' => [
                                            'id' => 0,
                                            'caption' => 'Placeholder Video',
                                            'creator' => 'System',
                                            'view_count' => 0,
                                            'like_investment_count' => 0,
                                            'current_value' => 5.00
                                        ]
                                    ]
                                ],
                                'portfolio_insights' => 'You have no investments yet, and there are currently no videos available. Check back soon as creators add new content.',
                                'investment_strategy' => 'Wait for new videos to be added to the platform before making your first investment.'
                            ],
                            'is_new_user' => true,
                            'is_empty_system' => true
                        ];
                    }
                    
                    // Use all available videos instead
                    $trendingVideos = $allVideos;
                }
                
                $recommendations = [
                    'recommendations' => [],
                    'portfolio_insights' => 'You have no investments yet. Start by investing in popular videos.',
                    'investment_strategy' => 'As a new investor, consider starting with small investments in trending videos.'
                ];
                
                // Add trending videos as recommendations
                foreach ($trendingVideos as $video) {
                    $recommendations['recommendations'][] = [
                        'video_id' => $video->id,
                        'reason' => 'Popular trending video with good potential',
                        'suggested_amount' => '$5-$10',
                        'priority' => 'medium',
                        'video_details' => [
                            'id' => $video->id,
                            'caption' => $video->caption,
                            'creator' => $video->user->username ?? 'Unknown Creator',
                            'view_count' => $video->view_count,
                            'like_investment_count' => $video->like_investment_count,
                            'current_value' => $video->current_value
                        ]
                    ];
                }
                
                return [
                    'success' => true,
                    'recommendations' => $recommendations,
                    'is_new_user' => true
                ];
            }
            
            return [
                'success' => false,
                'message' => $analysis['message']
            ];
        }
        
        // Get trending videos using existing service
        $videoService = app(VideoService::class);
        $trendingVideos = $videoService->getTrendingVideos(20)->items();
        
        if (empty($trendingVideos)) {
            // Fallback to all videos if no trending ones
            $trendingVideos = $videoService->getAllVideos(20)->items();
            
            if (empty($trendingVideos)) {
                return [
                    'success' => false,
                    'message' => 'No videos found to recommend'
                ];
            }
        }
        
        // Prepare data for AI analysis
        $categoryData = [];
        foreach ($analysis['categories'] as $name => $data) {
            $categoryData[] = [
                'category' => $name,
                'invested' => $data['invested'],
                'return_percentage' => $data['return_percentage'],
                'portfolio_percentage' => $data['portfolio_percentage']
            ];
        }
        
        // Prepare trending videos data
        $videoData = [];
        foreach ($trendingVideos as $video) {
            // Skip videos the user has already invested in
            $alreadyInvested = false;
            foreach ($analysis['categories'] as $category) {
                foreach ($category['videos'] as $investedVideo) {
                    if ($investedVideo['id'] == $video->id) {
                        $alreadyInvested = true;
                        break 2;
                    }
                }
            }
            
            if ($alreadyInvested) {
                continue;
            }
            
            $category = $this->categorizeVideo($video->caption);
            
            $videoData[] = [
                'id' => $video->id,
                'caption' => $video->caption,
                'category' => $category,
                'creator' => $video->user->username ?? 'Unknown Creator',
                'creator_id' => $video->user_id,
                'view_count' => $video->view_count,
                'like_investment_count' => $video->like_investment_count,
                'current_value' => $video->current_value
            ];
        }
        
        // If no videos left after filtering out invested ones
        if (empty($videoData)) {
            return [
                'success' => true,
                'recommendations' => [
                    'recommendations' => [],
                    'portfolio_insights' => 'You have already invested in all available videos.',
                    'investment_strategy' => 'Consider increasing your investments in videos you already own, or wait for new content to be added.'
                ],
                'portfolio_analysis' => $analysis
            ];
        }
        
        // Prepare AI prompt
        $prompt = "Based on the user's investment history and portfolio analysis, recommend 3-5 videos to invest in.

USER PORTFOLIO ANALYSIS:
" . json_encode($categoryData, JSON_PRETTY_PRINT) . "

Overall portfolio return: " . number_format($analysis['overall_return_percentage'], 2) . "%
Total invested: $" . number_format($analysis['total_invested'], 2) . "

TRENDING VIDEOS AVAILABLE FOR INVESTMENT:
" . json_encode($videoData, JSON_PRETTY_PRINT) . "

Provide recommendations in this JSON format:
{
  \"recommendations\": [
    {
      \"video_id\": \"id_here\",
      \"reason\": \"Explanation why this is recommended\",
      \"suggested_amount\": \"$XX-$YY range\",
      \"priority\": \"high/medium/low\"
    }
  ],
  \"portfolio_insights\": \"Brief analysis of current portfolio and diversification advice\",
  \"investment_strategy\": \"Suggested overall investment approach\"
}";

        // Generate recommendations using OpenAI
        $aiResponse = $this->generateText($prompt);
        
        if (!$aiResponse) {
            return [
                'success' => false,
                'message' => 'Failed to generate recommendations'
            ];
        }
        
        // Extract JSON from the response
        $jsonStart = strpos($aiResponse, '{');
        $jsonEnd = strrpos($aiResponse, '}');
        
        if ($jsonStart === false || $jsonEnd === false) {
            // Fallback if AI didn't return valid JSON
            return [
                'success' => true,
                'raw_recommendations' => $aiResponse,
                'portfolio_analysis' => $analysis
            ];
        }
        
        $jsonString = substr($aiResponse, $jsonStart, $jsonEnd - $jsonStart + 1);
        
        try {
            $recommendations = json_decode($jsonString, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON');
            }
            
            // Add video details to recommendations
            if (isset($recommendations['recommendations'])) {
                foreach ($recommendations['recommendations'] as &$rec) {
                    foreach ($videoData as $video) {
                        if ($video['id'] == $rec['video_id']) {
                            $rec['video_details'] = $video;
                            break;
                        }
                    }
                }
            }
            
            return [
                'success' => true,
                'recommendations' => $recommendations,
                'portfolio_analysis' => $analysis
            ];
        } catch (\Exception $e) {
            return [
                'success' => true,
                'raw_recommendations' => $aiResponse,
                'portfolio_analysis' => $analysis
            ];
        }
    }
}