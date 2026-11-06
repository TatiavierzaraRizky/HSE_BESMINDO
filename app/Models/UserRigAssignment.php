<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserRigAssignment extends Model
{
    protected $table = 'user_rig_assignments';

    protected $fillable = [
        'user_id',
        'rig_id',
        'rig_no',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function rig(): BelongsTo
    {
        return $this->belongsTo(Rig::class, 'rig_id');
    }
}
