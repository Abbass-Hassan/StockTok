<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'wallet_id',
        'amount',
        'transaction_type',
        'related_video_id',
        'related_like_investment_id',
        'status',
        'description',
        'fee_amount',
    ];

    protected $casts = [
        'amount' => 'float',
        'fee_amount' => 'float',
    ];

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function video()
    {
        return $this->belongsTo(Video::class, 'related_video_id');
    }

    public function likeInvestment()
    {
        return $this->belongsTo(LikeInvestment::class, 'related_like_investment_id');
    }
}