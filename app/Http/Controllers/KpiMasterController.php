<?php

namespace App\Http\Controllers;

use App\Models\HseIndicator;
use App\Models\HseKpiTarget;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KpiMasterController extends Controller
{
    /**
     * Tampilkan halaman Target KPI Management di Admin, atau list JSON untuk API.
     */
    public function index(Request $request)
    {
        $year = (int) ($request->input('year') ?? 2027);

        $kpiTargets = HseKpiTarget::where('year', $year)
            ->orderBy('order_no')
            ->get();

        $indicators = HseIndicator::where('is_active', true)->get();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'kpiTargets' => $kpiTargets,
                'indicators' => $indicators,
            ]);
        }

        return Inertia::render('Admin/TargetKPIManagement', [
            'kpiTargets' => $kpiTargets,
            'indicators' => $indicators,
            'year' => $year,
        ]);
    }

    /**
     * Tambah Poin / Target Master KPI baru (CRUD: Create - Admin Only).
     */
    public function store(Request $request)
    {
        if ($request->user()?->role !== 'admin') {
            abort(403, 'Akses Ditolak: Hanya Administrator yang berwenang menambah data Master KPI.');
        }

        $validated = $request->validate([
            'indicator_name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'in:leading,lagging,Leading,Lagging'],
            'definition' => ['nullable', 'string'],
            'target_month' => ['nullable', 'string', 'max:100'],
            'target_year' => ['nullable', 'string', 'max:100'],
            'unit' => ['nullable', 'string', 'max:100'],
            'year' => ['nullable', 'integer'],
            'plan' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        $year = (int) ($validated['year'] ?? 2027);
        $maxOrder = (int) HseKpiTarget::where('year', $year)->max('order_no');

        $kpi = HseKpiTarget::create([
            'year' => $year,
            'indicator_name' => $validated['indicator_name'],
            'category' => strtolower($validated['category'] ?? 'leading'),
            'definition' => $validated['definition'] ?? null,
            'target_month' => $validated['target_month'] ?? '-',
            'target_year' => $validated['target_year'] ?? '-',
            'unit' => $validated['unit'] ?? 'Laporan',
            'order_no' => $maxOrder + 1,
            'plan' => $validated['plan'] ?? ($validated['target_month'] ?? '0'),
            'notes' => $validated['notes'] ?? null,
        ]);

        // Simpan juga ke hse_indicators jika belum ada
        HseIndicator::firstOrCreate(
            ['name' => $validated['indicator_name']],
            [
                'code' => 'KPI_'.strtoupper(substr(md5($validated['indicator_name']), 0, 6)),
                'definition' => $validated['definition'] ?? null,
                'calculation_type' => 'manual',
                'unit' => $validated['unit'] ?? 'Laporan',
                'is_active' => true,
            ]
        );

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Poin Master Target KPI berhasil ditambahkan.',
                'data' => $kpi,
            ]);
        }

        return redirect()->back()->with('success', 'Poin Master Target KPI berhasil ditambahkan.');
    }

    /**
     * Perbarui Definisi, Formula, Target Default, atau Poin KPI (CRUD: Update - Admin Only).
     */
    public function update(Request $request, $id)
    {
        if ($request->user()?->role !== 'admin') {
            abort(403, 'Akses Ditolak: Hanya Administrator yang berwenang mengubah Master KPI.');
        }

        $kpi = HseKpiTarget::findOrFail($id);

        $validated = $request->validate([
            'indicator_name' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string'],
            'definition' => ['nullable', 'string'],
            'target_month' => ['nullable', 'string', 'max:100'],
            'target_year' => ['nullable', 'string', 'max:100'],
            'unit' => ['nullable', 'string', 'max:100'],
            'plan' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        $updateData = [];
        if (isset($validated['indicator_name'])) {
            $updateData['indicator_name'] = $validated['indicator_name'];
        }
        if (isset($validated['category'])) {
            $updateData['category'] = strtolower($validated['category']);
        }
        if (isset($validated['definition'])) {
            $updateData['definition'] = $validated['definition'];
        }
        if (isset($validated['target_month'])) {
            $updateData['target_month'] = $validated['target_month'];
        }
        if (isset($validated['target_year'])) {
            $updateData['target_year'] = $validated['target_year'];
        }
        if (isset($validated['unit'])) {
            $updateData['unit'] = $validated['unit'];
        }
        if (isset($validated['plan'])) {
            $updateData['plan'] = $validated['plan'];
        }
        if (isset($validated['notes'])) {
            $updateData['notes'] = $validated['notes'];
        }

        $kpi->update($updateData);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Data Master Target KPI berhasil diperbarui.',
                'data' => $kpi,
            ]);
        }

        return redirect()->back()->with('success', 'Data Master Target KPI berhasil diperbarui.');
    }

    /**
     * Hapus Poin Master Target KPI (CRUD: Delete - Admin Only).
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()?->role !== 'admin') {
            abort(403, 'Akses Ditolak: Hanya Administrator yang berwenang menghapus Master KPI.');
        }

        $kpi = HseKpiTarget::findOrFail($id);
        $kpi->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Poin Master Target KPI berhasil dihapus.',
            ]);
        }

        return redirect()->back()->with('success', 'Poin Master Target KPI berhasil dihapus.');
    }
}
