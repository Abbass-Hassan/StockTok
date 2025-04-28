<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Video;
use App\Models\UserType;
use Illuminate\Database\Seeder;

class VideoSeeder extends Seeder
{
    public function run(): void
    {
        // Get creator user type ID
        $creatorTypeId = UserType::where('type_name', 'creator')->first()->id;
        
        // Find the demo creator user
        $demoCreator = User::where('username', 'demoproducer')->first();
        
        // Create videos for demo creator
        for ($i = 1; $i <= 5; $i++) {
            $initialInvestment = rand(50, 200) + (rand(0, 99) / 100);
            $uploadFee = $initialInvestment * 0.05;
            $viewCount = rand(1000, 50000);
            $likeCount = rand(100, 5000);
            $currentValue = $initialInvestment * (1 + ($likeCount / 1000));
            
            Video::create([
                'user_id' => $demoCreator->id,
                'video_url' => 'https://example.com/videos/demo' . $i . '.mp4',
                'thumbnail_url' => 'https://example.com/thumbnails/demo' . $i . '.jpg',
                'caption' => 'Demo video #' . $i . ' - Invest now!',
                'initial_investment' => $initialInvestment,
                'upload_fee' => $uploadFee,
                'view_count' => $viewCount,
                'like_investment_count' => $likeCount,
                'current_value' => $currentValue,
                'is_active' => true,
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now(),
            ]);
        }
        
        // Create videos for other creators
        $creators = User::where('user_type_id', $creatorTypeId)
                         ->where('id', '!=', $demoCreator->id)
                         ->get();
        
        foreach ($creators as $creator) {
            // Create 1-3 videos for each creator
            $numVideos = rand(1, 3);
            for ($i = 1; $i <= $numVideos; $i++) {
                Video::factory()->create([
                    'user_id' => $creator->id
                ]);
            }
        }
        
        // Create some trending videos
        Video::factory()->count(3)->trending()->create();
    }
}