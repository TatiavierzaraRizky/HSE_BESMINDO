<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HseKpiTarget extends Model
{
    protected $table = 'hse_kpi_targets';

    protected $fillable = [
        'year',
        'contract_no',
        'rig_no',
        'focus_project',
        'location_district',

        'indicator_no',
        'order_no',
        'indicator_name',
        'is_parent',
        'parent_name',
        'sub_label',
        'category',
        'definition',

        'frequency_rate',
        'target_month',
        'target_year',
        'unit',

        'month',
        'quarter',

        'plan',
        'actual',
        'monthly_plans',

        'notes',
    ];

    protected $casts = [
        'year' => 'integer',
        'indicator_no' => 'string',
        'order_no' => 'integer',
        'is_parent' => 'boolean',
        'parent_name' => 'string',
        'sub_label' => 'string',

        'target_month' => 'string',
        'target_year' => 'string',

        'month' => 'integer',

        'plan' => 'string',
        'actual' => 'string',
        'monthly_plans' => 'array',
    ];
}
