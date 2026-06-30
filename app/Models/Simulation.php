<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Simulation extends Model
{
    protected $fillable = ['title', 'description', 'visibility', 'image', 'user_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function logs()
    {
        return $this->hasMany(SimulationLog::class);
    }

    public function chatMessages()
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function latestLog()
    {
        return $this->hasOne(SimulationLog::class)->orderBy('day', 'desc')->latestOfMany();
    }
}
