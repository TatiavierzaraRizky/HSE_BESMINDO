<?php

namespace App\Http\Controllers;

use App\Mail\HseReportApprovalMail;
use App\Models\HseKpiTarget;
use App\Models\HseLaggingIndicator;
use App\Models\HseLeadingIndicator;
use App\Models\HseManHour;
use App\Models\HseReport;
use App\Models\HseReportRejectionLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;

class HseReportController extends Controller
{
    /**
     * Menyiapkan data reports dan filters dari database.
     */
    private function getReportData(Request $request): array
    {
        $query = HseReport::with([
            'manHours',
            'laggingIndicators',
            'leadingIndicators',
        ])->where('status', '!=', 'draft');

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        if ($request->filled('period') && $request->period !== 'all') {
            $query->where('period', $request->period);
        }

        if ($request->filled('rig_no') && $request->rig_no !== 'all') {
            $query->where('rig_no', $request->rig_no);
        }

        // Focus Corp / Project pada form = contract_no di database.
        if ($request->filled('contract_no') && $request->contract_no !== 'all') {
            $query->where('contract_no', $request->contract_no);
        }

        if ($request->filled('location_district') && $request->location_district !== 'all') {
            $query->where('location_district', $request->location_district);
        }

        if ($request->filled('report_date') && $request->report_date !== 'all') {
            $query->whereDate('report_date', $request->report_date);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $reports = $query
            ->orderByDesc('report_date')
            ->orderByDesc('id')
            ->get();

        // Tambahkan quarter_data agar bisa dipakai bila diperlukan oleh React.
        $reports->transform(function ($report) {
            $quarterData = [
                'Q1' => [],
                'Q2' => [],
                'Q3' => [],
                'Q4' => [],
            ];

            foreach ($report->laggingIndicators as $indicator) {
                $month = (int) ($indicator->month ?? 0);

                if ($month >= 1 && $month <= 3) {
                    $quarter = 'Q1';
                } elseif ($month >= 4 && $month <= 6) {
                    $quarter = 'Q2';
                } elseif ($month >= 7 && $month <= 9) {
                    $quarter = 'Q3';
                } elseif ($month >= 10 && $month <= 12) {
                    $quarter = 'Q4';
                } else {
                    continue;
                }

                $quarterData[$quarter][] = [
                    'id' => $indicator->id,
                    'indicator_no' => $indicator->indicator_no,
                    'indicator_name' => $indicator->indicator_name,
                    'definition' => $indicator->definition,
                    'unit' => $indicator->unit,
                    'plan' => (float) ($indicator->plan ?? 0),
                    'actual' => (float) ($indicator->actual ?? 0),
                    'frequency_rate' => $indicator->frequency_rate !== null
                        ? (float) $indicator->frequency_rate
                        : null,
                    'month' => $indicator->month,
                    'year' => $indicator->year,
                    'notes' => $indicator->notes,
                ];
            }

            $report->quarter_data = $quarterData;

            return $report;
        });

        $years = HseReport::query()
            ->where('status', '!=', 'draft')
            ->whereNotNull('year')
            ->where('year', '!=', '')
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year')
            ->values();

        if ($years->isEmpty()) {
            $years = collect([2027]);
        } elseif (! $years->contains(2027)) {
            $years->prepend(2027);
        }

        $periods = HseReport::query()
            ->where('status', '!=', 'draft')
            ->whereNotNull('period')
            ->where('period', '!=', '')
            ->distinct()
            ->orderBy('period')
            ->pluck('period')
            ->values();

        $rigs = HseReport::query()
            ->where('status', '!=', 'draft')
            ->whereNotNull('rig_no')
            ->where('rig_no', '!=', '')
            ->distinct()
            ->orderBy('rig_no')
            ->pluck('rig_no')
            ->values();

        $focusCorps = HseReport::query()
            ->where('status', '!=', 'draft')
            ->whereNotNull('contract_no')
            ->where('contract_no', '!=', '')
            ->distinct()
            ->orderBy('contract_no')
            ->pluck('contract_no')
            ->values();

        $locations = HseReport::query()
            ->where('status', '!=', 'draft')
            ->whereNotNull('location_district')
            ->where('location_district', '!=', '')
            ->distinct()
            ->orderBy('location_district')
            ->pluck('location_district')
            ->values();

        $statuses = HseReport::query()
            ->where('status', '!=', 'draft')
            ->whereNotNull('status')
            ->where('status', '!=', '')
            ->distinct()
            ->orderBy('status')
            ->pluck('status')
            ->values();

        $reportDates = HseReport::query()
            ->where('status', '!=', 'draft')
            ->whereNotNull('report_date')
            ->select('report_date')
            ->distinct()
            ->orderByDesc('report_date')
            ->pluck('report_date')
            ->map(fn ($date) => Carbon::parse($date)->format('Y-m-d'))
            ->values();

        return [
            'reports' => $reports,
            'filters' => [
                'years' => $years,
                'periods' => $periods,
                'rigs' => $rigs,
                'focusCorps' => $focusCorps,
                'locations' => $locations,
                'statuses' => $statuses,
                'reportDates' => $reportDates,
            ],
            'selected' => [
                'year' => $request->year,
                'period' => $request->period,
                'rig_no' => $request->rig_no,
                'contract_no' => $request->contract_no,
                'location_district' => $request->location_district,
                'report_date' => $request->report_date,
                'status' => $request->status,
            ],
            'masterKpiTargets' => HseKpiTarget::where('year', (int) ($request->year ?? 2027))->get(),
        ];
    }

    /**
     * Data Master untuk Halaman Input Data (Admin & User)
     */
    public function getInputPageData(Request $request)
    {
        $year = (int) ($request->year ?? 2027);
        $masterKpiTargets = HseKpiTarget::where('year', $year)->get();
        $user = auth()->user();
        $assignedRigs = $user?->getAssignedRigs() ?? [];

        $userDrafts = [];
        $existingSubmissions = [];

        if ($user) {
            $draftQuery = HseReport::where('status', 'draft')
                ->with([
                    'manHours',
                    'laggingIndicators',
                    'leadingIndicators',
                    'creator:id,name,email',
                    'updater:id,name,email',
                ])
                ->orderByDesc('updated_at');

            $subQuery = HseReport::where('status', '!=', 'draft')
                ->with([
                    'manHours',
                    'laggingIndicators',
                    'leadingIndicators',
                    'creator:id,name,email',
                    'updater:id,name,email',
                    'submitterUser:id,name,email',
                    'rejectionLogs',
                ])
                ->orderByDesc('updated_at');

            if ($user->role !== 'admin') {
                $draftQuery->whereIn('rig_no', $assignedRigs);
                $subQuery->whereIn('rig_no', $assignedRigs);
            }

            $userDrafts = $draftQuery->get();
            $existingSubmissions = $subQuery->get();
        }

        return [
            'masterKpiTargets' => $masterKpiTargets,
            'year' => $year,
            'userDrafts' => $userDrafts,
            'existingSubmissions' => $existingSubmissions,
            'assignedRigs' => $assignedRigs,
            'user' => $user,
        ];
    }

    public function inputDataAdmin(Request $request)
    {
        return Inertia::render('Admin/InputData', $this->getInputPageData($request));
    }

    public function inputDataUser(Request $request)
    {
        return Inertia::render('User/InputData', $this->getInputPageData($request));
    }

    /**
     * Halaman khusus daftar Draf Laporan PIC.
     */
    public function draftsUser(Request $request)
    {
        $user = auth()->user();
        $assignedRigs = $user?->getAssignedRigs() ?? [];

        $draftQuery = HseReport::where('status', 'draft')
            ->with([
                'manHours',
                'creator:id,name,email',
                'updater:id,name,email',
            ])
            ->orderByDesc('updated_at');

        if ($user && $user->role !== 'admin') {
            $draftQuery->whereIn('rig_no', $assignedRigs);
        }

        $drafts = $draftQuery->get();

        return Inertia::render('User/Drafts', [
            'drafts' => $drafts,
            'assignedRigs' => $assignedRigs,
            'user' => $user,
        ]);
    }

    /**
     * Halaman khusus Status & History Laporan PIC.
     */
    public function historyUser(Request $request)
    {
        $user = auth()->user();
        $assignedRigs = $user?->getAssignedRigs() ?? [];

        $reportsQuery = HseReport::where('status', '!=', 'draft')
            ->with([
                'manHours',
                'creator:id,name,email',
                'updater:id,name,email',
                'submitterUser:id,name,email',
                'approver:id,name,email',
                'rejectionLogs',
            ])
            ->orderByDesc('updated_at');

        if ($user && $user->role !== 'admin') {
            $reportsQuery->whereIn('rig_no', $assignedRigs);
        }

        $reports = $reportsQuery->get();

        return Inertia::render('User/History', [
            'reports' => $reports,
            'assignedRigs' => $assignedRigs,
            'user' => $user,
        ]);
    }

    /**
     * Menampilkan halaman Admin Dashboard dengan live data.
     */
    public function dashboard(Request $request)
    {
        return Inertia::render('Admin/AdminDashboard', $this->getReportData($request));
    }

    /**
     * Menampilkan halaman Reports utama.
     */
    public function index(Request $request)
    {
        return Inertia::render('Admin/Reports', $this->getReportData($request));
    }

    /**
     * Menampilkan halaman Plan Report.
     */
    public function plan(Request $request)
    {
        return Inertia::render('Admin/PlanReport', $this->getReportData($request));
    }

    /**
     * Menampilkan halaman Actual Report.
     */
    public function actual(Request $request)
    {
        return Inertia::render('Admin/ActualReport', $this->getReportData($request));
    }

    /**
     * Menampilkan halaman KPI Per Rig.
     */
    public function kpiPerRig(Request $request)
    {
        return Inertia::render('Admin/KPIPerRig', $this->getReportData($request));
    }

    /**
     * Menampilkan halaman HSE Performance.
     */
    public function performance(Request $request)
    {
        return Inertia::render('Admin/HSEPerformance', $this->getReportData($request));
    }

    /**
     * Menyimpan report utama sekaligus data Man Hours, Lagging, dan Leading.
     * Mendukung alur simpan Draft (tanpa wajib evidence & tanpa email approval)
     * dan Submit Resmi (berstatus pending & kirim notifikasi approval).
     */
    public function store(Request $request)
    {
        if ($request->has('data')) {
            $decoded = json_decode($request->input('data'), true);
            if (is_array($decoded)) {
                $request->merge($decoded);
            }
        }

        $isDraft = $request->boolean('is_draft') || ($request->input('status') === 'draft');
        $draftId = $request->input('draft_id');
        $user = auth()->user();

        $reqYear = ! empty($request->input('year'))
            ? (int) $request->input('year')
            : ((int) date('Y', strtotime($request->input('date', 'now'))));
        $reqPeriod = (string) $request->input('period');
        $reqRig = (string) $request->input('rigNo');
        $reqContract = (string) $request->input('contractNo');

        // ========================================================
        // HAK AKSES BERBASIS RIG (SECURITY CHECK)
        // PIC dari rig yang berbeda SANGAT DILARANG menginput/mengedit rig lain
        // ========================================================
        if ($user && ! $user->canAccessRig($reqRig)) {
            return response()->json([
                'success' => false,
                'message' => "Anda tidak memiliki hak akses untuk mengelola Rig {$reqRig}. Hak akses Anda dibatasi pada rig yang ditugaskan.",
            ], 403);
        }

        $existingReport = null;
        if ($draftId) {
            $existingReport = HseReport::find($draftId);

            if ($existingReport && $user && ! $user->canAccessRig($existingReport->rig_no)) {
                return response()->json([
                    'success' => false,
                    'message' => "Anda tidak memiliki hak akses untuk mengelola data Rig {$existingReport->rig_no}.",
                ], 403);
            }

            // Tolak hanya jika laporan ini sudah disubmit (pending) atau approved
            if ($existingReport && in_array($existingReport->status, ['pending', 'approved'])) {
                $monthNames = [
                    '01' => 'Januari', '02' => 'Februari', '03' => 'Maret',
                    '04' => 'April', '05' => 'Mei', '06' => 'Juni',
                    '07' => 'Juli', '08' => 'Agustus', '09' => 'September',
                    '10' => 'Oktober', '11' => 'November', '12' => 'Desember',
                ];
                $paddedPeriod = str_pad((string) $existingReport->period, 2, '0', STR_PAD_LEFT);
                $monthName = $monthNames[$paddedPeriod] ?? "Bulan {$existingReport->period}";

                return response()->json([
                    'success' => false,
                    'is_duplicate' => true,
                    'message' => "Data untuk Rig {$existingReport->rig_no} periode {$monthName} {$existingReport->year} sudah pernah dikirim (Submitted). Tidak dapat melakukan penginputan ulang untuk mencegah duplikasi data.",
                ], 422);
            }
        }

        // ========================================================
        // VALIDASI DUPLIKASI DATA:
        // Cek apakah kombinasi Rig, Kontrak, Tahun, dan Periode ini
        // sudah pernah disubmit/diapprove sebelumnya oleh PIC manapun.
        // Status 'rejected' TIDAK dianggap duplikasi karena kru lapangan
        // diperbolehkan untuk merevisi dan melakukan submit ulang (resubmit).
        // ========================================================
        $duplicateQuery = HseReport::whereIn('status', ['pending', 'approved'])
            ->where('rig_no', $reqRig)
            ->where('contract_no', $reqContract)
            ->where('year', $reqYear)
            ->where('period', $reqPeriod);

        if ($draftId) {
            $duplicateQuery->where('id', '!=', $draftId);
        }
        if ($existingReport) {
            $duplicateQuery->where('id', '!=', $existingReport->id);
        }

        $alreadySubmitted = $duplicateQuery->first();
        if ($alreadySubmitted) {
            $monthNames = [
                '01' => 'Januari', '02' => 'Februari', '03' => 'Maret',
                '04' => 'April', '05' => 'Mei', '06' => 'Juni',
                '07' => 'Juli', '08' => 'Agustus', '09' => 'September',
                '10' => 'Oktober', '11' => 'November', '12' => 'Desember',
            ];
            $paddedPeriod = str_pad($reqPeriod, 2, '0', STR_PAD_LEFT);
            $monthName = $monthNames[$paddedPeriod] ?? "Bulan {$reqPeriod}";

            return response()->json([
                'success' => false,
                'is_duplicate' => true,
                'message' => "Data untuk Rig {$reqRig} periode {$monthName} {$reqYear} sudah pernah dikirim (Submitted). Tidak dapat melakukan penginputan ulang untuk mencegah duplikasi data.",
            ], 422);
        }

        if (! $existingReport) {
            $existingReport = HseReport::where('rig_no', $reqRig)
                ->where('contract_no', $reqContract)
                ->where('year', $reqYear)
                ->where('period', $reqPeriod)
                ->where(function ($q) use ($isDraft) {
                    if ($isDraft) {
                        $q->where('status', 'draft');
                    } else {
                        $q->whereIn('status', ['draft', 'rejected']);
                    }
                })
                ->first();
        }

        $hasExistingEvidence = ! empty($existingReport?->evidence_file);

        $evidenceRule = ['file', 'mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx', 'max:20480'];
        if ($isDraft || $hasExistingEvidence) {
            array_unshift($evidenceRule, 'nullable');
        } else {
            array_unshift($evidenceRule, 'required');
        }

        $validator = Validator::make($request->all(), [
            'date' => ['required', 'date'],
            'contractNo' => ['required', 'string', 'max:100'],
            'rigNo' => ['required', 'string', 'max:100'],
            'workPeriod' => ['nullable', 'string', 'max:100'],
            'period' => ['required', 'string', 'max:10'],
            'year' => ['nullable', 'integer'],
            'focusProject' => ['nullable', 'string', 'max:150'],
            'locationDistrict' => ['required', 'string', 'max:150'],
            'issuedDate' => ['nullable', 'date'],
            'revisionNo' => ['nullable', 'string', 'max:50'],
            'programReference' => ['nullable', 'string'],
            'submitterRole' => ['nullable', 'string'],
            'submitterName' => ['nullable', 'string', 'max:255'],
            'submitterEmail' => ['nullable', 'string', 'max:255'],

            'manHoursPremisesPlan' => ['nullable', 'numeric', 'min:0'],
            'manHoursNonPremisesPlan' => ['nullable', 'numeric', 'min:0'],
            'manHoursPremisesActual' => ['nullable', 'numeric', 'min:0'],
            'manHoursNonPremisesActual' => ['nullable', 'numeric', 'min:0'],

            'totalEmployees' => ['nullable', 'numeric', 'min:0'],
            'totalVehicles' => ['nullable', 'numeric', 'min:0'],

            'kilometerPremisesPlan' => ['nullable', 'numeric', 'min:0'],
            'kilometerNonPremisesPlan' => ['nullable', 'numeric', 'min:0'],
            'kilometerPremisesActual' => ['nullable', 'numeric', 'min:0'],
            'kilometerNonPremisesActual' => ['nullable', 'numeric', 'min:0'],

            'lagging' => ['nullable', 'array'],
            'lagging.*.indicator_name' => ['required', 'string', 'max:255'],
            'lagging.*.indicator_no' => ['nullable'],
            'lagging.*.definition' => ['nullable', 'string'],
            'lagging.*.unit' => ['nullable', 'string', 'max:100'],
            'lagging.*.target_month' => ['nullable'],
            'lagging.*.target_year' => ['nullable'],
            'lagging.*.plan' => ['nullable'],
            'lagging.*.actual' => ['nullable'],
            'lagging.*.frequency_rate' => ['nullable'],
            'lagging.*.notes' => ['nullable', 'string'],
            'lagging.*.keterangan' => ['nullable', 'string'],

            'leading' => ['nullable', 'array'],
            'leading.*.indicator_name' => ['required', 'string', 'max:255'],
            'leading.*.indicator_no' => ['nullable'],
            'leading.*.is_parent' => ['nullable'],
            'leading.*.parent_name' => ['nullable', 'string', 'max:255'],
            'leading.*.sub_label' => ['nullable', 'string', 'max:50'],
            'leading.*.definition' => ['nullable', 'string'],
            'leading.*.unit' => ['nullable', 'string', 'max:100'],
            'leading.*.target_month' => ['nullable'],
            'leading.*.target_year' => ['nullable'],
            'leading.*.plan' => ['nullable'],
            'leading.*.actual' => ['nullable'],
            'leading.*.notes' => ['nullable', 'string'],

            'remarks' => ['nullable', 'string'],
            'evidence_file' => $evidenceRule,
        ], [
            'evidence_file.required' => 'File dokumen bukti penginputan (Evidence File) wajib dilampirkan sebelum mengirim laporan KPI.',
            'evidence_file.file' => 'Bukti penginputan harus berupa file dokumen/gambar yang valid.',
            'evidence_file.mimes' => 'Format file bukti harus berupa PDF, JPG, PNG, Word (DOC/DOCX), atau Excel (XLS/XLSX).',
            'evidence_file.max' => 'Ukuran file bukti maksimal 20 MB.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first() ?: 'Validasi data gagal. Silakan periksa kembali isian formulir.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        try {
            $report = DB::transaction(function () use ($validated, $request, $isDraft, $existingReport) {
                $year = ! empty($validated['year']) ? (int) $validated['year'] : (int) date('Y', strtotime($validated['date']));
                $month = (int) date('n', strtotime($validated['date']));
                $approvalToken = Str::random(40);
                $submitterRole = $validated['submitterRole'] ?? ($request->is('admin/*') ? 'admin' : 'user');
                $targetStatus = $isDraft ? 'draft' : 'pending';

                $evidencePath = null;
                $evidenceName = null;
                if ($request->hasFile('evidence_file')) {
                    $file = $request->file('evidence_file');
                    $evidenceName = $file->getClientOriginalName();
                    $evidencePath = $file->store('evidence_files', 'public');
                }

                if ($existingReport) {
                    $updatePayload = [
                        'report_date' => $validated['date'],
                        'contract_no' => $validated['contractNo'],
                        'rig_no' => $validated['rigNo'],
                        'work_period' => $validated['workPeriod'] ?? null,
                        'year' => $year,
                        'period' => $validated['period'],
                        'focus_project' => $validated['focusProject'] ?? $validated['contractNo'],
                        'location_district' => $validated['locationDistrict'],
                        'issued_date' => $validated['issuedDate'] ?? $validated['date'],
                        'revision_no' => $validated['revisionNo'] ?? '00',
                        'program_reference' => $validated['programReference'] ?? null,
                        'status' => $targetStatus,
                        'remarks' => $validated['remarks'] ?? null,
                        'updated_by' => auth()->id(),
                    ];

                    // Preservasi nama & email pembuat pertama (creator). Hanya isi jika belum ada sebelumnya.
                    if (empty($existingReport->created_by)) {
                        $updatePayload['created_by'] = auth()->id();
                    }
                    if (empty($existingReport->submitter_name)) {
                        $updatePayload['submitter_name'] = auth()->user()?->name ?? ($validated['submitterName'] ?? 'User Lapangan');
                        $updatePayload['submitter_email'] = auth()->user()?->email ?? ($validated['submitterEmail'] ?? null);
                        $updatePayload['submitter_role'] = $submitterRole;
                    }

                    if (! $isDraft) {
                        $updatePayload['approval_token'] = $approvalToken;
                        $updatePayload['rejected_at'] = null;
                        $updatePayload['submitted_by'] = auth()->id();
                    }

                    if ($evidencePath) {
                        $updatePayload['evidence_file'] = $evidencePath;
                        $updatePayload['evidence_file_name'] = $evidenceName;
                    }

                    $existingReport->update($updatePayload);

                    // Bersihkan record anak untuk digantikan data terbaru
                    $existingReport->manHours()->delete();
                    $existingReport->laggingIndicators()->delete();
                    $existingReport->leadingIndicators()->delete();

                    $report = $existingReport;
                } else {
                    $report = HseReport::create([
                        'report_date' => $validated['date'],
                        'contract_no' => $validated['contractNo'],
                        'rig_no' => $validated['rigNo'],
                        'work_period' => $validated['workPeriod'] ?? null,
                        'year' => $year,
                        'period' => $validated['period'],
                        'focus_project' => $validated['focusProject'] ?? $validated['contractNo'],
                        'location_district' => $validated['locationDistrict'],
                        'issued_date' => $validated['issuedDate'] ?? $validated['date'],
                        'revision_no' => $validated['revisionNo'] ?? '00',
                        'program_reference' => $validated['programReference'] ?? null,
                        'status' => $targetStatus,
                        'approval_token' => $approvalToken,
                        'remarks' => $validated['remarks'] ?? null,
                        'evidence_file' => $evidencePath,
                        'evidence_file_name' => $evidenceName,
                        'submitter_role' => $submitterRole,
                        'submitter_name' => auth()->user()?->name ?? ($validated['submitterName'] ?? 'User Lapangan'),
                        'submitter_email' => auth()->user()?->email ?? ($validated['submitterEmail'] ?? null),
                        'created_by' => auth()->id(),
                        'updated_by' => auth()->id(),
                        'submitted_by' => ! $isDraft ? auth()->id() : null,
                    ]);
                }

                /*
                |--------------------------------------------------------------------------
                | MAN HOURS & KM: AUTO-FALLBACK & MANUAL OVERRIDE
                |--------------------------------------------------------------------------
                */
                $premisesPlan = (isset($validated['manHoursPremisesPlan']) && $validated['manHoursPremisesPlan'] !== '')
                    ? (float) $validated['manHoursPremisesPlan'] : 17360;
                $premisesActual = (isset($validated['manHoursPremisesActual']) && $validated['manHoursPremisesActual'] !== '')
                    ? (float) $validated['manHoursPremisesActual'] : $premisesPlan;

                $nonPremisesPlan = (isset($validated['manHoursNonPremisesPlan']) && $validated['manHoursNonPremisesPlan'] !== '')
                    ? (float) $validated['manHoursNonPremisesPlan'] : 320;
                $nonPremisesActual = (isset($validated['manHoursNonPremisesActual']) && $validated['manHoursNonPremisesActual'] !== '')
                    ? (float) $validated['manHoursNonPremisesActual'] : $nonPremisesPlan;

                $kmPremisesPlan = (isset($validated['kilometerPremisesPlan']) && $validated['kilometerPremisesPlan'] !== '')
                    ? (float) $validated['kilometerPremisesPlan'] : 9850.32;
                $kmPremisesActual = (isset($validated['kilometerPremisesActual']) && $validated['kilometerPremisesActual'] !== '')
                    ? (float) $validated['kilometerPremisesActual'] : $kmPremisesPlan;

                $kmNonPremisesPlan = (isset($validated['kilometerNonPremisesPlan']) && $validated['kilometerNonPremisesPlan'] !== '')
                    ? (float) $validated['kilometerNonPremisesPlan'] : 3830.68;
                $kmNonPremisesActual = (isset($validated['kilometerNonPremisesActual']) && $validated['kilometerNonPremisesActual'] !== '')
                    ? (float) $validated['kilometerNonPremisesActual'] : $kmNonPremisesPlan;

                $totalEmployees = (isset($validated['totalEmployees']) && $validated['totalEmployees'] !== '')
                    ? (int) $validated['totalEmployees'] : 72;
                $totalVehicles = (isset($validated['totalVehicles']) && $validated['totalVehicles'] !== '')
                    ? (int) $validated['totalVehicles'] : 9;

                HseManHour::create([
                    'report_id' => $report->id,
                    'premises_plan' => $premisesPlan,
                    'non_premises_plan' => $nonPremisesPlan,
                    'premises_actual' => $premisesActual,
                    'non_premises_actual' => $nonPremisesActual,
                    'kilometer_premises_plan' => $kmPremisesPlan,
                    'kilometer_non_premises_plan' => $kmNonPremisesPlan,
                    'kilometer_premises_actual' => $kmPremisesActual,
                    'kilometer_non_premises_actual' => $kmNonPremisesActual,
                    'total_employees' => $totalEmployees,
                    'total_vehicles' => $totalVehicles,
                ]);

                $totalManHoursActual = $premisesActual + $nonPremisesActual;
                $totalKilometerActual = $kmPremisesActual + $kmNonPremisesActual;

                /*
                |--------------------------------------------------------------------------
                | LAGGING INDICATORS / HES PERFORMANCE (AUTO-FALLBACK & MANUAL OVERRIDE)
                |--------------------------------------------------------------------------
                */
                foreach ($validated['lagging'] ?? [] as $indicator) {
                    $indicatorNo = (int) ($indicator['indicator_no'] ?? 0);
                    $rawPlan = $indicator['plan'] ?? ($indicator['target_month'] ?? 0);
                    $plan = is_numeric($rawPlan) ? (float) $rawPlan : 0;
                    // AUTO-FALLBACK: Jika kosong / tidak diisi, gunakan Plan
                    $rawActual = (isset($indicator['actual']) && $indicator['actual'] !== '' && $indicator['actual'] !== null)
                        ? $indicator['actual'] : $rawPlan;
                    $actual = is_numeric($rawActual) ? (float) $rawActual : 0;

                    $definition = $indicator['definition'] ?? null;

                    switch ($indicatorNo) {
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                            $definition = 'Frequency rate = (kasus cedera x 200.000) / Jam Kerja';
                            break;
                        case 6:
                            $definition = 'MVC FR = (kasus x 1.000.000) / kilometer Perjalanan Kendaraan';
                            break;
                        case 7:
                            $definition = 'Record case > 1 barrel';
                            break;
                        case 8:
                        case 9:
                            $definition = 'Record case > Rp. 100 Jt';
                            break;
                        case 10:
                        case 11:
                            $definition = 'Record case';
                            break;
                        case 12:
                            $definition = 'Reportable case';
                            break;
                    }

                    $frequencyRate = null;

                    if ($indicatorNo >= 1 && $indicatorNo <= 5) {
                        if (isset($indicator['frequency_rate']) && $indicator['frequency_rate'] !== '' && $indicator['frequency_rate'] !== null) {
                            $frequencyRate = (float) $indicator['frequency_rate'];
                        } elseif ($totalManHoursActual > 0) {
                            $frequencyRate = ($actual * 200000) / $totalManHoursActual;
                        } else {
                            $frequencyRate = 0;
                        }
                    } elseif ($indicatorNo === 6) {
                        if (isset($indicator['frequency_rate']) && $indicator['frequency_rate'] !== '' && $indicator['frequency_rate'] !== null) {
                            $frequencyRate = (float) $indicator['frequency_rate'];
                        } elseif ($totalKilometerActual > 0) {
                            $frequencyRate = ($actual * 1000000) / $totalKilometerActual;
                        } else {
                            $frequencyRate = 0;
                        }
                    } elseif ($indicatorNo >= 7 && $indicatorNo <= 12) {
                        $frequencyRate = null;
                    }

                    $notes = $indicator['notes'] ?? ($indicator['keterangan'] ?? null);
                    if (empty($notes)) {
                        if ($indicatorNo === 5 || $indicatorNo === 6) {
                            $notes = 'Recordable';
                        } elseif ($indicatorNo === 12) {
                            $notes = 'Reportable case';
                        } else {
                            $notes = $validated['remarks'] ?? null;
                        }
                    }

                    HseLaggingIndicator::create([
                        'report_id' => $report->id,
                        'indicator_no' => $indicator['indicator_no'] ?? null,
                        'indicator_name' => $indicator['indicator_name'],
                        'definition' => $definition,
                        'unit' => $indicator['unit'] ?? 'Case',
                        'plan' => $plan,
                        'actual' => $actual,
                        'frequency_rate' => $frequencyRate,
                        'month' => $month,
                        'year' => $year,
                        'notes' => $notes,
                    ]);
                }

                /*
                |--------------------------------------------------------------------------
                | LEADING INDICATORS
                |--------------------------------------------------------------------------
                */
                foreach ($validated['leading'] ?? [] as $indicator) {
                    $targetMonth = (isset($indicator['target_month']) && $indicator['target_month'] !== '') ? (string) $indicator['target_month'] : null;
                    $targetYear = (isset($indicator['target_year']) && $indicator['target_year'] !== '') ? (string) $indicator['target_year'] : null;
                    $plan = (isset($indicator['plan']) && $indicator['plan'] !== '') ? (string) $indicator['plan'] : ($targetMonth ?? '0');
                    $actual = (isset($indicator['actual']) && $indicator['actual'] !== '' && $indicator['actual'] !== null)
                        ? (string) $indicator['actual'] : $plan;

                    HseLeadingIndicator::create([
                        'report_id' => $report->id,
                        'indicator_no' => isset($indicator['indicator_no']) ? (string) $indicator['indicator_no'] : null,
                        'indicator_name' => $indicator['indicator_name'],
                        'is_parent' => ! empty($indicator['is_parent']),
                        'parent_name' => $indicator['parent_name'] ?? null,
                        'sub_label' => $indicator['sub_label'] ?? null,
                        'definition' => $indicator['definition'] ?? null,
                        'unit' => $indicator['unit'] ?? 'Activity',
                        'target_month' => $targetMonth ?? $plan,
                        'target_year' => $targetYear,
                        'plan' => $plan,
                        'actual' => $actual,
                        'month' => $month,
                        'year' => $year,
                        'notes' => $indicator['notes'] ?? ($validated['remarks'] ?? null),
                    ]);
                }

                return $report;
            });

            if ($isDraft) {
                return response()->json([
                    'success' => true,
                    'is_draft' => true,
                    'draft_id' => $report->id,
                    'saved_at' => now()->format('H:i'),
                    'message' => 'Draft laporan berhasil disimpan pada '.now()->format('H:i').'. Data Anda aman di server.',
                    'data' => $report->load([
                        'manHours',
                        'laggingIndicators',
                        'leadingIndicators',
                    ]),
                ], 200);
            }

            // Kirim email permohonan approval ke admin hanya jika bukan draft (submitted)
            $adminEmail = config('hse.admin_email', env('ADMIN_HSE_EMAIL', 'admin@besmindo.com'));
            try {
                if ($adminEmail) {
                    Mail::to($adminEmail)->send(new HseReportApprovalMail($report));
                }
            } catch (\Throwable $mailError) {
                Log::warning('HSE Approval Email could not be sent: '.$mailError->getMessage());
            }

            return response()->json([
                'success' => true,
                'is_draft' => false,
                'message' => 'Data HSE berhasil disubmit dan diteruskan untuk permohonan approval admin.',
                'data' => $report->load([
                    'manHours',
                    'laggingIndicators',
                    'leadingIndicators',
                ]),
            ], 201);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data HSE gagal disimpan.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle approval langsung dari link email.
     */
    public function emailApprove($id, $token)
    {
        $report = HseReport::where('id', $id)
            ->where('approval_token', $token)
            ->firstOrFail();

        $report->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => auth()->id() ?? 1,
        ]);

        return view('emails.approval_result', [
            'title' => 'Laporan HSE Berhasil Disetujui!',
            'message' => "Laporan HSE Rig {$report->rig_no} Periode Bulan {$report->period} ({$report->year}) telah disetujui. Data kini aktif di seluruh dashboard dan laporan.",
            'status' => 'approved',
        ]);
    }

    /**
     * Handle penolakan langsung dari link email.
     */
    public function emailReject($id, $token)
    {
        $report = HseReport::where('id', $id)
            ->where('approval_token', $token)
            ->firstOrFail();

        $report->update([
            'status' => 'rejected',
            'rejected_at' => now(),
        ]);

        return view('emails.approval_result', [
            'title' => 'Laporan HSE Ditolak',
            'message' => "Laporan HSE Rig {$report->rig_no} Periode Bulan {$report->period} ({$report->year}) telah ditandai sebagai Ditolak.",
            'status' => 'rejected',
        ]);
    }

    /**
     * Menampilkan halaman Approval di Admin Dashboard.
     * Hanya menampilkan laporan yang berstatus 'pending', 'approved', atau 'rejected'.
     * Laporan berstatus 'draft' strictly dikecualikan dan tidak pernah muncul di Approval Admin.
     */
    public function approvalIndex(Request $request)
    {
        $reports = HseReport::where('status', '!=', 'draft')
            ->with([
                'manHours',
                'laggingIndicators',
                'leadingIndicators',
                'approver',
                'creator',
                'updater',
                'submitterUser',
                'rejectionLogs',
            ])
            ->orderByRaw("CASE WHEN status = 'pending' THEN 1 WHEN status = 'approved' THEN 2 ELSE 3 END")
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Admin/Approval', [
            'reports' => $reports,
        ]);
    }

    /**
     * Menghapus Draft laporan HSE milik PIC / Operator.
     */
    public function deleteDraft($id)
    {
        $report = HseReport::where('id', $id)->first();

        if (! $report) {
            return response()->json([
                'success' => false,
                'message' => 'Draf laporan tidak ditemukan.',
            ], 404);
        }

        if ($report->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Laporan ini telah disubmit dan tidak dapat dihapus sebagai draf.',
            ], 400);
        }

        if (auth()->user()?->role !== 'admin' && ! auth()->user()?->canAccessRig($report->rig_no)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk menghapus draf ini.',
            ], 403);
        }

        DB::transaction(function () use ($report) {
            $report->manHours()->delete();
            $report->laggingIndicators()->delete();
            $report->leadingIndicators()->delete();
            $report->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Draft laporan HSE berhasil dihapus.',
        ]);
    }

    /**
     * Update status approval via Admin UI dashboard.
     */
    public function updateApprovalStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected,pending'],
            'rejection_reason' => ['nullable', 'string'],
        ]);

        $report = HseReport::findOrFail($id);

        $updateData = [
            'status' => $validated['status'],
        ];

        if ($validated['status'] === 'approved') {
            $updateData['approved_at'] = now();
            $updateData['approved_by'] = auth()->id() ?? 1;
        } elseif ($validated['status'] === 'rejected') {
            $reason = $validated['rejection_reason'] ?? 'Ditolak oleh administrator';
            $revisionNumber = $report->rejectionLogs()->count() + 1;

            HseReportRejectionLog::create([
                'report_id' => $report->id,
                'admin_id' => auth()->id(),
                'admin_name' => auth()->user()?->name ?? 'Administrator HSE',
                'revision_number' => $revisionNumber,
                'rejection_reason' => $reason,
            ]);

            $updateData['rejected_at'] = now();
            $updateData['rejection_reason'] = $reason;
            $updateData['latest_admin_note'] = $reason;
        }

        $report->update($updateData);

        return response()->json([
            'success' => true,
            'message' => "Status laporan HSE berhasil diubah menjadi {$validated['status']}.",
            'data' => $report->load(['rejectionLogs']),
        ]);
    }

    /**
     * Detail report.
     */
    public function show($id)
    {
        $report = HseReport::with([
            'manHours',
            'laggingIndicators',
            'leadingIndicators',
        ])->findOrFail($id);

        return Inertia::render('Admin/Reports', [
            'reports' => [$report],

            'filters' => [
                'years' => [],
                'periods' => [],
                'rigs' => [],
                'focusCorps' => [],
                'locations' => [],
                'statuses' => [],
                'reportDates' => [],
            ],

            'selected' => [
                'year' => $report->year,

                'period' => $report->period,

                'rig_no' => $report->rig_no,

                'contract_no' => $report->contract_no,

                'location_district' => $report->location_district,

                'report_date' => $report->report_date,

                'status' => $report->status,
            ],
        ]);
    }

    /**
     * Menghapus report HSE dan data terkait (CRUD Delete).
     */
    public function destroy($id)
    {
        $report = HseReport::findOrFail($id);

        DB::transaction(function () use ($report) {
            $report->manHours()->delete();
            $report->laggingIndicators()->delete();
            $report->leadingIndicators()->delete();
            $report->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Laporan HSE berhasil dihapus.',
        ]);
    }
}
