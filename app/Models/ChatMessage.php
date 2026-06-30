<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    protected $fillable = ['simulation_id', 'sender', 'text', 'mode'];

    public function simulation()
    {
        return $this->belongsTo(Simulation::class);
    }
}
