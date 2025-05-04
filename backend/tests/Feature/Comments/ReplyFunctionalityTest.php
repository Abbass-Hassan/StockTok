<?php

namespace Tests\Feature\Comments;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\ApiTestCase;
use App\Models\User;
use App\Models\Video;
use App\Models\UserType;
use App\Models\Comment;

class ReplyFunctionalityTest extends ApiTestCase
{
    /**
     * Create a video with a creator user.
     */
    protected function createVideoWithCreator()
    {
        // Get creator user type
        $creatorUserType = UserType::where('type_name', 'creator')->first();
        
        // Create creator user
        $creator = User::create([
            'email' => $this->faker->unique()->safeEmail,
            'password' => bcrypt('password'),
            'username' => $this->faker->userName,
            'user_type_id' => $creatorUserType->id,
        ]);
        
        // Create a video for this creator
        $video = Video::create([
            'user_id' => $creator->id,
            'title' => 'Reply Test Video',
            'description' => 'This video is for testing replies',
            'video_url' => 'videos/reply-test-video.mp4',
            'thumbnail_url' => 'thumbnails/reply-test-thumbnail.jpg',
            'caption' => 'Reply test caption',
            'initial_investment' => 100,
            'upload_fee' => 5,
            'current_value' => 100,
            'status' => 'published',
            'is_active' => true
        ]);
        
        return [
            'creator' => $creator,
            'video' => $video
        ];
    }
    
    /**
     * Create a comment for testing.
     */
    protected function createComment($user, $token, $videoId, $content = 'Test comment for replies')
    {
        $commentData = [
            'video_id' => $videoId,
            'content' => $content
        ];
        
        $response = $this->postJson("/api/comments", 
            $commentData, 
            $this->getAuthHeader($token)
        );
        
        return $response->json('data.comment');
    }
    
    /**
     * Test user can reply to a comment.
     */
    public function test_user_can_reply_to_comment(): void
    {
        // Create a regular user
        $auth = $this->createUserAndGetToken();
        $user = $auth['user'];
        $token = $auth['token'];
        
        // Create a video
        $videoData = $this->createVideoWithCreator();
        $video = $videoData['video'];
        
        // Create a parent comment
        $parentComment = $this->createComment($user, $token, $video->id, 'Parent comment');
        
        // Prepare reply data
        $replyData = [
            'video_id' => $video->id,
            'content' => 'This is a reply to the parent comment',
            'parent_id' => $parentComment['id']
        ];
        
        // Create reply
        $response = $this->postJson("/api/comments", 
            $replyData, 
            $this->getAuthHeader($token)
        );
        
        // Assert response - using 200 instead of 201 to match your API
        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success')
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'comment'
                     ]
                 ]);
        
        // Verify the reply has the correct parent_id
        $reply = $response->json('data.comment');
        $this->assertEquals($parentComment['id'], $reply['parent_id']);
    }
    
    /**
     * Test retrieving replies to a comment.
     */
    public function test_retrieving_comment_replies(): void
    {
        // Create a regular user
        $auth = $this->createUserAndGetToken();
        $user = $auth['user'];
        $token = $auth['token'];
        
        // Create a video
        $videoData = $this->createVideoWithCreator();
        $video = $videoData['video'];
        
        // Create a parent comment
        $parentComment = $this->createComment($user, $token, $video->id, 'Parent comment for retrieving replies');
        
        // Create several replies
        $replyContents = [
            'First reply to parent',
            'Second reply to parent',
            'Third reply to parent'
        ];
        
        foreach ($replyContents as $content) {
            $this->postJson("/api/comments", 
                [
                    'video_id' => $video->id,
                    'content' => $content,
                    'parent_id' => $parentComment['id']
                ], 
                $this->getAuthHeader($token)
            );
        }
        
        // Retrieve replies to the parent comment
        $response = $this->getJson("/api/comments/{$parentComment['id']}/replies", 
            $this->getAuthHeader($token)
        );
        
        // Assert response
        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success')
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'replies'
                     ]
                 ]);
        
        // Verify the replies list contains our replies
        $replies = $response->json('data.replies.data');
        $this->assertCount(3, $replies, 'Should have 3 replies');
        
        // Check that all our reply contents are in the list
        $replyContentList = array_column($replies, 'content');
        $this->assertEquals(
            count(array_intersect($replyContents, $replyContentList)),
            count($replyContents),
            'All replies should be in the list'
        );
    }
    
    /**
     * Test handling of nested replies.
     */
    public function test_handling_of_nested_replies(): void
    {
        // Create a regular user
        $auth = $this->createUserAndGetToken();
        $user = $auth['user'];
        $token = $auth['token'];
        
        // Create a video
        $videoData = $this->createVideoWithCreator();
        $video = $videoData['video'];
        
        // Create a parent comment
        $parentComment = $this->createComment($user, $token, $video->id, 'Parent comment for nested replies');
        
        // Create a reply to parent
        $replyData = [
            'video_id' => $video->id,
            'content' => 'Reply to parent',
            'parent_id' => $parentComment['id']
        ];
        
        $replyResponse = $this->postJson("/api/comments", 
            $replyData, 
            $this->getAuthHeader($token)
        );
        
        $reply = $replyResponse->json('data.comment');
        
        // Try to create a nested reply (reply to a reply)
        $nestedReplyData = [
            'video_id' => $video->id,
            'content' => 'Nested reply',
            'parent_id' => $reply['id']
        ];
        
        $response = $this->postJson("/api/comments", 
            $nestedReplyData, 
            $this->getAuthHeader($token)
        );
        
        // Check if the response is successful - your API accepts nested replies
        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success');
    }
    
    /**
     * Test user can delete reply.
     */
    public function test_user_can_delete_reply(): void
    {
        // Create a regular user
        $auth = $this->createUserAndGetToken();
        $user = $auth['user'];
        $token = $auth['token'];
        
        // Create a video
        $videoData = $this->createVideoWithCreator();
        $video = $videoData['video'];
        
        // Create a parent comment
        $parentComment = $this->createComment($user, $token, $video->id, 'Parent comment for delete test');
        
        // Create a reply
        $replyData = [
            'video_id' => $video->id,
            'content' => 'Reply that will be deleted',
            'parent_id' => $parentComment['id']
        ];
        
        $replyResponse = $this->postJson("/api/comments", 
            $replyData, 
            $this->getAuthHeader($token)
        );
        
        $reply = $replyResponse->json('data.comment');
        
        // Delete the reply
        $response = $this->deleteJson("/api/comments/{$reply['id']}", 
            [], 
            $this->getAuthHeader($token)
        );
        
        // Assert response
        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success');
        
        // Verify the reply is no longer retrievable
        $getResponse = $this->getJson("/api/comments/{$parentComment['id']}/replies", 
            $this->getAuthHeader($token)
        );
        
        $replies = $getResponse->json('data.replies.data');
        
        // Check if our deleted reply is not in the list
        $replyIds = array_column($replies, 'id');
        $this->assertFalse(
            in_array($reply['id'], $replyIds),
            'Deleted reply should not appear in replies list'
        );
    }
}