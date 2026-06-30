<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('simulation_logs', function (Blueprint $table) {
            $table->string('nutrients_adder_switch')->nullable();
            $table->float('nutrients_adder_percentage')->nullable();
            $table->string('ph_reducer_switch')->nullable();
            $table->float('ph_reducer_percentage')->nullable();
            $table->integer('cluster_index')->nullable();
            $table->string('cluster_label')->nullable();
            $table->text('cluster_description')->nullable();
            $table->text('cluster_action')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('simulation_logs', function (Blueprint $table) {
            $table->dropColumn([
                'nutrients_adder_switch', 'nutrients_adder_percentage', 
                'ph_reducer_switch', 'ph_reducer_percentage', 
                'cluster_index', 'cluster_label', 'cluster_description', 'cluster_action'
            ]);
        });
    }
};
