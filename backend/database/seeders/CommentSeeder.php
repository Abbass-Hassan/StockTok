<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\User;
use App\Models\Video;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    public function run(): void
    {
        // Get videos
        $videos = Video::all();
        
        // Get users
        $users = User::all();
        
        // Create comments for each video
        foreach ($videos as $video) {
            // Create 3-10 random comments per video
            $numComments = rand(3, 10);
            
            for ($i = 0; $i < $numComments; $i++) {
                // Get random user
                $user = $users->random();
                
                // Create main comment
                $comment = Comment::create([
                    'user_id' => $user->id,
                    'video_id' => $video->id,
                    'content' => $this->getRandomComment(),
                    'parent_id' => null,
                    'created_at' => now()->subDays(rand(1, 14)),
                    'updated_at' => now()->subDays(rand(1, 14)),
                ]);
                
                // 50% chance to add a reply
                if (rand(0, 1) == 1) {
                    // Get another random user
                    $replyUser = $users->random();
                    
                    // Create reply
                    Comment::create([
                        'user_id' => $replyUser->id,
                        'video_id' => $video->id,
                        'content' => $this->getRandomReply(),
                        'parent_id' => $comment->id,
                        'created_at' => $comment->created_at->addHours(rand(1, 24)),
                        'updated_at' => $comment->created_at->addHours(rand(1, 24)),
                    ]);
                }
            }
        }
    }
    
    private function getRandomComment(): string
    {
        $comments = [
            "Great investment opportunity!",
            "This video is going to the moon!",
            "I'm investing right now!",
            "Really interesting content, I think this has potential.",
            "Not sure about this one, any thoughts?",
            "Already seeing returns on my investment here.",
            "This creator consistently delivers quality.",
            "Definitely undervalued right now.",
            "The production quality here is amazing.",
            "Just put in $50, hope it pays off!",
            "This is why I love StockTok - real opportunities.",
            "Anyone else seeing good returns here?",
            "First time investor, is this a good choice?",
            "Love the concept in this video.",
            "Trending video for sure, get in early!",
        ];
        
        return $comments[array_rand($comments)];
    }
    
    private function getRandomReply(): string
    {
        $replies = [
            "I agree, already invested!",
            "Thanks for the tip, just put some money in.",
            "Not sure, the ROI seems low to me.",
            "This creator's videos always perform well.",
            "I got in early and already seeing returns.",
            "How much did you invest?",
            "Do you think it will keep growing?",
            "Definitely a good choice for new investors.",
            "I'm going to wait and see on this one.",
            "This is going viral, good investment!",
            "I've followed this creator for months, very reliable.",
            "Just doubled my investment!",
            "The algorithm is pushing this one hard.",
            "Smart move, I just followed your lead.",
            "Let's revisit this in a week and see how it performs.",
        ];
        
        return $replies[array_rand($replies)];
    }
}