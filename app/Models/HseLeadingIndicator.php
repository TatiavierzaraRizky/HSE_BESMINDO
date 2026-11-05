<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HseLeadingIndicator extends Model
{
    protected $table = 'hse_leading_indicators';

    protected $fillable = [
        'report_id',
        'indicator_no',
        'indicator_name',
        'is_parent',
        'parent_name',
        'sub_label',
        'definition',
        'unit',
        'target_month',
        'target_year',
        'plan',
        'actual',
        'month',
        'year',
        'notes',
    ];

    protected $casts = [
        'indicator_no' => 'string',
        'is_parent' => 'boolean',
        'parent_name' => 'string',
        'sub_label' => 'string',
        'target_month' => 'string',
        'target_year' => 'string',
        'plan' => 'string',
        'actual' => 'string',
        'month' => 'integer',
        'year' => 'integer',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(
            HseReport::class,
            'report_id'
        );
    }
}
