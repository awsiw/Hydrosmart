<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SimulationLog extends Model
{
    protected $fillable = [
        'simulation_id', 'day', 'ph', 'tds', 'water_temperature',
        'nutrients_adder_switch', 'nutrients_adder_percentage',
        'ph_reducer_switch', 'ph_reducer_percentage',
        'cluster_index', 'cluster_label', 'cluster_description', 'cluster_action'
    ];

    protected $appends = ['plant_phase'];

    public function simulation()
    {
        return $this->belongsTo(Simulation::class);
    }

    public function getPlantPhaseAttribute()
    {
        if ($this->day >= 30) {
            return 'panen';
        }
        
        $isSubOptimal = ($this->ph < 5.5 || $this->ph > 7.0 || $this->tds < 400 || $this->tds > 1000 || $this->water_temperature < 15 || $this->water_temperature > 28);
        
        if ($isSubOptimal) {
            return 'layu';
        }
        
        return 'hidup';
    }
}
