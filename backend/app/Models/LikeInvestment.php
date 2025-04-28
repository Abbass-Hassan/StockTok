<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LikeInvestment extends Model
{
    use HasFactory;

    protected $table = 'likes_investments';

    protected $fillable = [
        'user_id',
        'video_id',
        'amount',
        'status',
        'return_percentage',
        'current_value',
    ];

    protected $casts = [
        'amount' => 'float',
        'return_percentage' => 'float',
        'current_value' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function video()
    {
        return $this->belongsTo(Video::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'related_like_investment_id');
    }
}