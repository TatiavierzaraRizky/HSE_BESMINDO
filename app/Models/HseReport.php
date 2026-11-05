<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class HseReport extends Model
{
    protected $table = 'hse_reports';

    protected $fillable = [
        'report_date',
        'contract_no',
        'rig_no',
        'work_period',
        'year',
        'period',
        'focus_project',
        'location_district',
        'issued_date',
        'revision_no',
        'program_reference',
        'status',
        'approval_token',
        'remarks',
        'evidence_file',
        'evidence_file_name',
        'submitter_role',
        'submitter_name',
        'submitter_email',
        'rejection_reason',
        'latest_admin_note',
        'approved_at',
        'approved_by',
        'created_by',
        'updated_by',
        'submitted_by',
    ];

    protected $casts = [
        'report_date' => 'date',
        'issued_date' => 'date',
        'approved_at' => 'datetime',
        'year' => 'integer',
    ];

    /**
     * Relasi ke Man Hours
     */
    public function manHours(): HasOne
    {
        return $this->hasOne(
            HseManHour::class,
            'report_id'
        );
    }

    /**
     * Relasi ke Lagging Indicators
     */
    public function laggingIndicators(): HasMany
    {
        return $this->hasMany(
            HseLaggingIndicator::class,
            'report_id'
        );
    }

    /**
     * Relasi ke Leading Indicators
     */
    public function leadingIndicators(): HasMany
    {
        return $this->hasMany(
            HseLeadingIndicator::class,
            'report_id'
        );
    }

    /**
     * Relasi ke User yang menyetujui (Approver)
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    protected $appends = [
        'evidence_file_url',
    ];

    public function getEvidenceFileUrlAttribute(): ?string
    {
        return $this->evidence_file ? asset('storage/'.$this->evidence_file) : null;
    }

    /**
     * Relasi ke User pembuat (Creator)
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relasi ke User pengubah terakhir (Updater)
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Relasi ke User pen-submit terakhir
     */
    public function submitterUser()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    /**
     * Riwayat catatan penolakan dari admin (Rejection History Logs)
     */
    public function rejectionLogs(): HasMany
    {
        return $this->hasMany(HseReportRejectionLog::class, 'report_id')->orderByDesc('created_at');
    }
}
