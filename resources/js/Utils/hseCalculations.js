/**
 * HSE Dynamic Calculation Utilities
 * Based on Master KPI Formula (BMS Operations):
 * C:\Users\LENOVO\Downloads\OTP & KPI 2026 BMS 7,15,18.xlsx
 */

export function getDaysInMonth(year, month) {
    const y = Number(year) || new Date().getFullYear();
    const m = Number(month) || 1;
    return new Date(y, m, 0).getDate();
}

/**
 * 1. Lagging Frequency Rates
 */
export function calcFrequencyRate(cases, manHours) {
    const c = Number(cases) || 0;
    const h = Number(manHours) || 0;
    if (c <= 0 || h <= 0) return "0.00";
    return ((c * 200000) / h).toFixed(2);
}

export function calcMvcFrequencyRate(cases, totalKm) {
    const c = Number(cases) || 0;
    const km = Number(totalKm) || 0;
    if (c <= 0 || km <= 0) return "0.00";
    return ((c * 1000000) / km).toFixed(2);
}

/**
 * 2. TRI (Total Recordable Injury) Sum
 * TRI = Fatality (1.1) + Serious LTI (1.2) + RWC (1.3) + MTC (1.4)
 */
export function calcTRI(fatality = 0, seriousLti = 0, rwc = 0, mtc = 0) {
    return Number(fatality || 0) + Number(seriousLti || 0) + Number(rwc || 0) + Number(mtc || 0);
}

/**
 * 3. Dynamic Man Hours Formulas
 * Premises = (((Ops/3)*2)*12) * daysInMonth
 * Non Premises = Support * 8 * 20
 */
export function calcPremisesHours(opsEmployees, daysInMonth) {
    const ops = Number(opsEmployees) || 0;
    const days = Number(daysInMonth) || 30;
    return Math.round(((ops / 3) * 2 * 12) * days);
}

export function calcNonPremisesHours(supportEmployees, workDays = 20) {
    const supp = Number(supportEmployees) || 0;
    return supp * 8 * workDays;
}

/**
 * 4. Dynamic Leading Targets
 * PEKA Target = (((Ops/3)*2)*2)*4
 * PTI Target = Vehicles * 4
 */
export function calcPekaTarget(opsEmployees) {
    const ops = Number(opsEmployees) || 0;
    return Math.round(((ops / 3) * 2 * 2 * 4));
}

export function calcPtiTarget(vehicles) {
    const v = Number(vehicles) || 0;
    return v * 4;
}

/**
 * 5. Full Excel Estimation Generator
 * Generates plan values for any Rig, any month, and any crew size.
 */
export function calcExcelEstimates(period, year, employees, vehicles, currentKm = 0) {
    const p = Number(period) || 1;
    const y = Number(year) || new Date().getFullYear();
    const days = getDaysInMonth(y, p);

    const emp = Number(employees) || 0;
    const veh = Number(vehicles) || 0;

    // Split Ops / Support (Standard rig: Ops is total minus ~2 support staff)
    const opsEmp = emp > 4 ? emp - 2 : emp;
    const suppEmp = emp > 4 ? 2 : (emp > 0 ? 1 : 0);

    const manHoursPremisesPlan = calcPremisesHours(opsEmp, days);
    const manHoursNonPremisesPlan = calcNonPremisesHours(suppEmp, 20);

    // KM Premises 72% / Non-Premises 28%
    const totalKm = Number(currentKm) > 0 ? Number(currentKm) : 13681;
    const kilometerPremisesPlan = Math.round(totalKm * 0.72);
    const kilometerNonPremisesPlan = Math.round(totalKm * 0.28);

    const leadingPlans = {
        "OBSERVASI PERILAKU (PEKA) *)": calcPekaTarget(opsEmp),
        "IDENTIFIKASI BAHAYA (HAZID/ 5 MNT RISK ASSESSMENT)": 10 * 2 * days,
        "SWA REPORT": 3 * 2 * days,
        "- Eye wash & Shower": days,
        "- APD & P3K": 4,
        "- Firex, Tandu, SCBA, FBH": 1,
        "EKSTERNAL INSPEKSI LR COLOR CODE": [6, 12].includes(p) ? 1 : 0,
        "INSPEKSI BENDA JATUH / DROPS **)": 4,
        "INSPEKSI / Audit SMK3L: PERALATAN, DATA PERSONAL MILIK SUBKONTRAKTOR": p === 12 ? 1 : 0,
        "SPOT CHECK KENDARAAN *) **)": [6, 12].includes(p) ? 1 : 0,
        "AUDIT INTERNAL & EKSTERNAL (Sistem manajemen *)": p === 12 ? 1 : 0,
        "MONITORING KEPATUHAN PENGEMUDI (Mencakup speed / IVMS report / fatigue *)": 100,
        "Inspeksi Kendaraan (PTI) Harian dalam laporan mingguan": calcPtiTarget(veh > 0 ? veh : 8),
        "SPESIFIK RANDOM : NAPZA & MIRAS TEST *)": [6, 12].includes(p) ? 1 : 0,
        "- Pra Pekerjaan (Karyawan Baru)": 0,
        "- Periodik (Tahunan)": 0,
        "- Pra MCU (histori konsul pada tahun sebelumnya)": 0,
        "TOP MANAGEMENT VISIT / MWT (Level General Manager / Dir. Operasi / Direktur Utama ***)": [6, 12].includes(p) ? 1 : 0,
        "MANAGEMENT VISIT / MWT (Level Coord level s/d Manager *)": 4,
        "RAPAT RUTIN KESELAMATAN (TGM PER SHIFT/PJM)": 2 * days,
        "PRE HITCH MEETING": 3,
        "RAPAT/FORUM BERSAMA LEADER BMS DAN PHR.": 4,
        "- SUPPORT YARD": 1,
        "- RIG (Minggu ke IV jadwal PHM)": 1,
        "LEADERSHIP FORUM ***)": [4, 8, 12].includes(p) ? 1 : 0,
        "KAMPANYE KESELAMATAN (PIN/POSTER/STIKER/ SPANDUK/ Online PHM) *)": p % 2 === 0 ? 1 : 0,
        "REVIEW, TINJAUAN MANAJEMEN *)": p === 12 ? 1 : 0,
        "HYGIENE MONITORING : NOISE & LUX MONITORING **)": [6, 12].includes(p) ? 1 : 0,
        "HYGIENE MONITORING : Mess, Catering, DAM*)": p === 12 ? 1 : 0,
        'INSPEKSI "HOUSEKEEPING RIG"': 1,
        'PENGHARGAAN: KONTES "HOUSEKEEPING RIG" *)': [6, 12].includes(p) ? 1 : 0,
        "PELAPORAN LINGKUNGAN YARD KE DINAS LH": [6, 12].includes(p) ? 1 : 0,
        'PENGHARGAAN: RIG OF THE MONTH INTERNAL / EXTERNAL **)': 0,
        "PENGHARGAAN THE BEST BBS / PEKA": 1,
        "PENGHARGAAN THE BEST DRIVER": 1,
        "PENGHARGAAN: PENCAPAIAN KERJA SELAMAT TAHUNAN": p === 12 ? 1 : 0,
        "- Dalam Negeri : a. Dalam Provinsi atau Luar provinsi": [6, 12].includes(p) ? 1 : 0,
        "- Luar Negri - China / dll": p === 12 ? 1 : 0,
        "Sosialisasi (kebijakan, Prosedur sistem, KPI, Hiradc, SOP, JSA, MSDS, LOR, dll)": 6,
        '"ON SITE TRAINING" DI LOKASI *)': 3,
        "ERP DRILL RIG : H2S&SCBA / FIRE / MEDIVAC/ PENYELAMATAN KERJA DI KETINGGIAN / TUMPAHAN. **)": 3,
        "ERP DRILL YARD : FIRE / MEDIVAC / TUMPAHAN *)": [6, 12].includes(p) ? 1 : 0,
    };

    return {
        daysInMonth: days,
        manHoursPremisesPlan,
        manHoursNonPremisesPlan,
        kilometerPremisesPlan,
        kilometerNonPremisesPlan,
        leadingPlans,
    };
}
