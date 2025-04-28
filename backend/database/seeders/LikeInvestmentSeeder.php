<?php

namespace Database\Seeders;

use App\Models\LikeInvestment;
use App\Models\User;
use App\Models\Video;
use Illuminate\Database\Seeder;

class LikeInvestmentSeeder extends Seeder
{
    public function run(): void
    {
        // Get demo investor
        $demoInvestor = User::where('username', 'investor1')->first();
        
        // Get videos
        $videos = Video::all();
        
        // Create investments for demo investor
        foreach ($videos->take(10) as $video) {
            $amount = rand(10, 50) + (rand(0, 99) / 100);
            $returnPercentage = rand(-10, 30) + (rand(0, 99) / 100);
            $currentValue = $amount * (1 + ($returnPercentage / 100));
            
            LikeInvestment::create([
                'user_id' => $demoInvestor->id,
                'video_id' => $video->id,
                'amount' => $amount,
                'status' => 'active',
                'return_percentage' => $returnPercentage,
                'current_value' => $currentValue,
                'created_at' => now()->subDays(rand(1, 20)),
                'updated_at' => now(),
            ]);
            
            // Update video like_investment_count and current_value
            $video->like_investment_count++;
            $video->current_value += $amount;
            $video->save();
        }
        
        // Get regular users
        $users = User::where('id', '!=', $demoInvestor->id)->get();
        
        // Create random investments
        foreach ($videos as $video) {
            // Get 1-10 random users to invest in this video
            $randomUsers = $users->random(rand(1, min(10, $users->count())));
            
            foreach ($randomUsers as $user) {
                $amount = rand(1, 100) + (rand(0, 99) / 100);
                $returnPercentage = rand(-20, 40) + (rand(0, 99) / 100);
                $currentValue = $amount * (1 + ($returnPercentage / 100));
                
                LikeInvestment::create([
                    'user_id' => $user->id,
                    'video_id' => $video->id,
                    'amount' => $amount,
                    'status' => 'active',
                    'return_percentage' => $returnPercentage,
                    'current_value' => $currentValue,
                    'created_at' => now()->subDays(rand(1, 30)),
                    'updated_at' => now(),
                ]);
                
                // Update video like_investment_count and current_value
                $video->like_investment_count++;
                $video->current_value += $amount;
                $video->save();
            }
        }
    }
}