<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'video_url',
        'thumbnail_url',
        'caption',
        'initial_investment',
        'upload_fee',
        'view_count',
        'like_investment_count',
        'current_value',
        'is_active',
    ];

    protected $casts = [
        'initial_investment' => 'float',
        'upload_fee' => 'float',
        'view_count' => 'integer',
        'like_investment_count' => 'integer',
        'current_value' => 'float',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function likeInvestments()
    {
        return $this->hasMany(LikeInvestment::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'related_video_id');
    }
}