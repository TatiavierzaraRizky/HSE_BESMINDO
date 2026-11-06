<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rig extends Model
{
    protected $table = 'rigs';

    protected $fillable = [
        'rig_no',
        'name',
        'area',
        'contract_no',
        'status',
    ];

    /**
     * Relasi ke seluruh laporan HSE pada rig ini.
     */
    public function reports(): HasMany
    {
        return $this->hasMany(HseReport::class, 'rig_id');
    }

    /**
     * Relasi ke seluruh User (PIC / Operator) yang ditugaskan ke rig ini.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_rig_assignments', 'rig_id', 'user_id')
            ->withTimestamps();
    }

    /**
     * Relasi ke pivot penugasan rig.
     */
    public function userAssignments(): HasMany
    {
        return $this->hasMany(UserRigAssignment::class, 'rig_id');
    }
}
