<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\Searchable;

class User extends Authenticatable
{
    use Searchable;
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'user_type_id',
        'username',
        'name',
        'email',
        'password',
        'profile_photo_url',
        'bio',
        'phone',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function userType()
    {
        return $this->belongsTo(UserType::class);
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function videos()
    {
        return $this->hasMany(Video::class);
    }

    public function likeInvestments()
    {
        return $this->hasMany(LikeInvestment::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function followers()
    {
        return $this->hasMany(Follow::class, 'following_id');
    }

    public function following()
    {
        return $this->hasMany(Follow::class, 'follower_id');
    }
}