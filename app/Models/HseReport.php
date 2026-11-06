<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class HseReport extends Model
{
    protected $table = 'hse_reports';

    protected $fillable = [
        'rig_id',
        'report_date',
        'contract_no',
        'contract_number',
        'rig_no',
        'work_period',
        'year',
        'period',
        'month',
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
        'month' => 'integer',
        'rig_id' => 'integer',
    ];

    protected static function booted(): void
    {
        static::saving(function (self $report) {
            // Sinkronkan contract_number dengan contract_no
            if (! empty($report->contract_no) && empty($report->contract_number)) {
                $report->contract_number = $report->contract_no;
            } elseif (! empty($report->contract_number) && empty($report->contract_no)) {
                $report->contract_no = $report->contract_number;
            }

            // Sinkronkan month dengan period
            if (! empty($report->period) && empty($report->month)) {
                $report->month = (int) $report->period;
            }

            // Sinkronkan rig_id dan rig_no
            if (! empty($report->rig_no) && empty($report->rig_id)) {
                $rig = Rig::where('rig_no', $report->rig_no)->first();
                if ($rig) {
                    $report->rig_id = $rig->id;
                }
            } elseif (! empty($report->rig_id) && empty($report->rig_no)) {
                $rig = Rig::find($report->rig_id);
                if ($rig) {
                    $report->rig_no = $rig->rig_no;
                }
            }
        });
    }

    /**
     * Relasi ke Master Rig
     */
    public function rig(): BelongsTo
    {
        return $this->belongsTo(Rig::class, 'rig_id');
    }

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
