<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HseReportRejectionLog extends Model
{
    protected $table = 'hse_report_rejection_logs';

    protected $fillable = [
        'report_id',
        'admin_id',
        'admin_name',
        'revision_number',
        'rejection_reason',
    ];

    protected $casts = [
        'revision_number' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(HseReport::class, 'report_id');
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
