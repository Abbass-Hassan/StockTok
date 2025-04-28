<?php

namespace Database\Seeders;

use App\Models\Follow;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Database\Seeder;

class FollowSeeder extends Seeder
{
    public function run(): void
    {
        // Get user types
        $creatorTypeId = UserType::where('type_name', 'creator')->first()->id;
        $regularTypeId = UserType::where('type_name', 'regular')->first()->id;
        
        // Get demo investor
        $demoInvestor = User::where('username', 'investor1')->first();
        
        // Get demo creator
        $demoCreator = User::where('username', 'demoproducer')->first();
        
        // Demo investor follows demo creator
        Follow::create([
            'follower_id' => $demoInvestor->id,
            'following_id' => $demoCreator->id,
            'created_at' => now()->subDays(30),
            'updated_at' => now()->subDays(30),
        ]);
        
        // Get all creators
        $creators = User::where('user_type_id', $creatorTypeId)->get();
        
        // Get all regular users
        $regularUsers = User::where('user_type_id', $regularTypeId)->get();
        
        // Make demo investor follow 5 random creators
        $randomCreators = $creators->where('id', '!=', $demoCreator->id)->random(min(5, $creators->count() - 1));
        
        foreach ($randomCreators as $creator) {
            Follow::create([
                'follower_id' => $demoInvestor->id,
                'following_id' => $creator->id,
                'created_at' => now()->subDays(rand(1, 14)),
                'updated_at' => now()->subDays(rand(1, 14)),
            ]);
        }
        
        // Create random follow relationships
        foreach ($regularUsers as $user) {
            // Each regular user follows 1-10 random creators
            $creatorCount = min(rand(1, 10), $creators->count());
            $userRandomCreators = $creators->random($creatorCount);
            
            foreach ($userRandomCreators as $creator) {
                // Avoid duplicate follows
                $existingFollow = Follow::where('follower_id', $user->id)
                                      ->where('following_id', $creator->id)
                                      ->first();
                
                if (!$existingFollow) {
                    Follow::create([
                        'follower_id' => $user->id,
                        'following_id' => $creator->id,
                        'created_at' => now()->subDays(rand(1, 30)),
                        'updated_at' => now()->subDays(rand(1, 30)),
                    ]);
                }
            }
        }
        
        // Make some creators follow each other
        foreach ($creators as $follower) {
            $followingCount = min(rand(0, 3), $creators->count() - 1);
            
            if ($followingCount > 0) {
                $potentialFollowing = $creators->where('id', '!=', $follower->id);
                $randomFollowing = $potentialFollowing->random($followingCount);
                
                foreach ($randomFollowing as $following) {
                    // Avoid duplicate follows
                    $existingFollow = Follow::where('follower_id', $follower->id)
                                          ->where('following_id', $following->id)
                                          ->first();
                    
                    if (!$existingFollow) {
                        Follow::create([
                            'follower_id' => $follower->id,
                            'following_id' => $following->id,
                            'created_at' => now()->subDays(rand(1, 30)),
                            'updated_at' => now()->subDays(rand(1, 30)),
                        ]);
                    }
                }
            }
        }
    }
}