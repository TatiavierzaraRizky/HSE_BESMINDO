/**
 * MASTER KPI TARGETS & PLAN KONFIGURASI SESUAI FORM EXCEL RESMI
 * No. Formulir: BMSD/03/FO/HSE/02/17 | No. Revisi: #12
 * PT BESMINDO MATERI SEWATAMA
 */

export const MASTER_LAGGING_TARGETS = [
    {
        no: 1,
        indicatorNo: "1.1",
        name: "FATALITY",
        definition: "Frequency rate = (kasus cedera x 200.000) / Jam Kerja",
        keterangan: "",
        notes: "",
        unit: "Case",
        targetMonth: "0",
        targetYear: "0",
        targetFr: "0.00",
        plan: "0",
        planFr: "0.00",
        frequencyRate: "0.00",
        isCaseFrCombo: true,
    },
    {
        no: 2,
        indicatorNo: "1.2",
        name: "SERIOUS LOST TIME INJURY (>21 LOST DAY)",
        definition: "Frequency rate = (kasus cedera x 200.000) / Jam Kerja",
        keterangan: "",
        notes: "",
        unit: "Case",
        targetMonth: "0",
        targetYear: "0",
        targetFr: "0.00",
        plan: "0",
        planFr: "0.00",
        frequencyRate: "0.00",
        isCaseFrCombo: true,
    },
    {
        no: 3,
        indicatorNo: "1.3",
        name: "RESTRICTED WORK CASE (RWC)",
        definition: "Frequency rate = (kasus cedera x 200.000) / Jam Kerja",
        keterangan: "",
        notes: "",
        unit: "Case",
        targetMonth: "0",
        targetYear: "0",
        targetFr: "0.00",
        plan: "0",
        planFr: "0.00",
        frequencyRate: "0.00",
        isCaseFrCombo: true,
    },
    {
        no: 4,
        indicatorNo: "1.4",
        name: "MEDICAL TREATMENT CASE (MTC)",
        definition: "Frequency rate = (kasus cedera x 200.000) / Jam Kerja",
        keterangan: "",
        notes: "",
        unit: "Case",
        targetMonth: "0",
        targetYear: "0",
        targetFr: "0.00",
        plan: "0",
        planFr: "0.00",
        frequencyRate: "0.00",
        isCaseFrCombo: true,
    },
    {
        no: 5,
        indicatorNo: "1.5",
        name: "TOTAL RECORDABLE INJURY",
        definition: "TRI = Fatality + LTI + RWC + MTC",
        keterangan: "Recordable",
        notes: "Recordable",
        unit: "Case",
        targetMonth: "0",
        targetYear: "0",
        targetFr: "0.00",
        plan: "0",
        planFr: "0.00",
        frequencyRate: "0.00",
        isCaseFrCombo: true,
    },
    {
        no: 6,
        indicatorNo: "1.6",
        name: "MOTOR VEHICLE CRASH (MVC)",
        definition: "MVC FR = (kasus x 1.000.000) / kilometer Perjalanan Kendaraan",
        keterangan: "Recordable",
        notes: "Recordable",
        unit: "Case",
        targetMonth: "0",
        targetYear: "0",
        targetFr: "0.00",
        plan: "0",
        planFr: "0.00",
        frequencyRate: "0.00",
        isCaseFrCombo: true,
    },
    {
        no: 7,
        indicatorNo: "1.7",
        name: "TUMPAHAN / OIL SPILL",
        definition: "Record case > 1 barrel",
        keterangan: "",
        notes: "",
        unit: "Case",
        targetMonth: "0",
        targetYear: "0",
        targetFr: "0.00",
        plan: "0",
        planFr: "0.00",
        frequencyRate: "0.00",
        isCaseFrCombo: true,
    },
    {
        no: 8,
        indicatorNo: "1.8",
        name: "FIRE",
        definition: "Record case > Rp. 100 Jt",
        keterangan: "",
        notes: "",
        unit: "Case",
        targetMonth: "0",
        targetYear: "0",
        targetFr: "0.00",
        plan: "0",
        planFr: "0.00",
        frequencyRate: "0.00",
        isCaseFrCombo: true,
    },
    {
        no: 9,
        indicatorNo: "1.9",
        name: "PROPERTY DAMAGE",
        definition: "Record case > Rp. 100 Jt",
        keterangan: "",
        notes: "",
        unit: "Case",
        targetMonth: "0",
        targetYear: "0",
        targetFr: "0.00",
        plan: "0",
        planFr: "0.00",
        frequencyRate: "0.00",
        isCaseFrCombo: true,
    },
    {
        no: 10,
        indicatorNo: "1.10",
        name: "SECURITY CASE",
        definition: "Record case",
        keterangan: "",
        notes: "",
        unit: "Case",
        targetMonth: "0",
        targetYear: "0",
        targetFr: "0.00",
        plan: "0",
        planFr: "0.00",
        frequencyRate: "0.00",
        isCaseFrCombo: true,
    },
    {
        no: 11,
        indicatorNo: "1.11",
        name: "ILLNESS/FATALITY",
        definition: "Record case",
        keterangan: "",
        notes: "",
        unit: "Case",
        targetMonth: "0",
        targetYear: "0",
        targetFr: "0.00",
        plan: "0",
        planFr: "0.00",
        frequencyRate: "0.00",
        isCaseFrCombo: true,
    },
    {
        no: 12,
        indicatorNo: "1.12",
        name: "REPORTABLE CASE : OPS. INCIDENT / ETA / FAC / NEARMISS",
        definition: "Reportable case",
        keterangan: "Reportable case",
        notes: "Reportable case",
        unit: "Case",
        targetMonth: "0",
        targetYear: "0",
        targetFr: "0.00",
        plan: "0",
        planFr: "0.00",
        frequencyRate: "0.00",
        isCaseFrCombo: true,
    },
];

export const MASTER_MAN_HOURS_TARGETS = {
    totalManHours: 17680,
    premisesPlan: 17360,
    nonPremisesPlan: 320,
    totalEmployees: 72,
    employeesOps: 70,
    employeesSupport: 2,
    totalKilometer: 13681,
    kilometerPremisesPlan: 9850,
    kilometerNonPremisesPlan: 3831,
    totalVehicles: 9,
    vehiclesOps: 8,
    vehiclesSupport: 1,
};

// Target resmi bulanan sesuai standar Excel KPI (Index 0 = Jan, ..., 11 = Dec)
export const MONTHLY_PREMISES_PLANS = [
    17360, // Jan (index 0)
    16800, // Feb (index 1)
    17360, // Mar (index 2)
    17360, // Apr (index 3)
    17360, // May (index 4)
    17360, // Jun (index 5)
    16800, // Jul (index 6)
    17360, // Aug (index 7)
    15680, // Sep (index 8)
    15680, // Oct (index 9)
    17360, // Nov (index 10)
    16800, // Dec (index 11)
];

export const MONTHLY_NON_PREMISES_PLANS = [
    304, // Jan (index 0)
    304, // Feb (index 1)
    368, // Mar (index 2)
    336, // Apr (index 3)
    336, // May (index 4)
    368, // Jun (index 5)
    320, // Jul (index 6)
    352, // Aug (index 7)
    320, // Sep (index 8)
    320, // Oct (index 9)
    320, // Nov (index 10)
    320, // Dec (index 11)
];

export const MONTHLY_TOTAL_MAN_HOURS_PLANS = [
    17664, // Jan
    17104, // Feb
    17728, // Mar
    17696, // Apr
    17696, // May
    17728, // Jun
    17120, // Jul
    17712, // Aug
    16000, // Sep
    16000, // Oct
    17680, // Nov
    17120, // Dec
];

export const MONTHLY_KILOMETER_PREMISES_PLANS = Array(12).fill(9850);
export const MONTHLY_KILOMETER_NON_PREMISES_PLANS = Array(12).fill(3831);
export const MONTHLY_TOTAL_KILOMETER_PLANS = Array(12).fill(13681);
export const MONTHLY_TOTAL_EMPLOYEES_PLANS = Array(12).fill(72);
export const MONTHLY_EMPLOYEES_OPS_PLANS = Array(12).fill(70);
export const MONTHLY_EMPLOYEES_SUPPORT_PLANS = Array(12).fill(2);
export const MONTHLY_TOTAL_VEHICLES_PLANS = Array(12).fill(9);
export const MONTHLY_VEHICLES_OPS_PLANS = Array(12).fill(8);
export const MONTHLY_VEHICLES_SUPPORT_PLANS = Array(12).fill(1);

export const MASTER_OPS_TARGETS = {
    reliability: 0.99,
    availability: 0.98,
    utilization: 0.90,
    nptHoursMax: 16,
};

export const MASTER_LEADING_TARGETS = [
    {
        no: "1",
        name: "OBSERVASI PERILAKU (PEKA) *)",
        definition: "Min. 2 Laporan / Org / Minggu",
        unit: "Laporan",
        targetMonth: "373",
        targetYear: "4480",
    },
    {
        no: "2",
        name: "IDENTIFIKASI BAHAYA (HAZID/ 5 MNT RISK ASSESSMENT)",
        definition: "10 Laporan/ Shift / Hari",
        unit: "Laporan",
        targetMonth: "600",
        targetYear: "7200",
    },
    {
        no: "3",
        name: "SWA REPORT",
        definition: "3 Laporan/ Shift / Hari",
        unit: "Laporan",
        targetMonth: "180",
        targetYear: "2160",
    },
    {
        no: "4",
        name: "INSPEKSI SAFETY EQUIPMENT & APD :",
        definition: "",
        unit: "Inspeksi",
        targetMonth: "",
        targetYear: "0",
        isParent: true,
        subItems: [
            {
                subNo: "",
                name: "Eye wash & Shower",
                definition: "Harian",
                targetMonth: "30",
                targetYear: "365",
            },
            {
                subNo: "",
                name: "APD & P3K",
                definition: "1x / Minggu",
                targetMonth: "4",
                targetYear: "48",
            },
            {
                subNo: "",
                name: "Firex, Tandu, SCBA, FBH",
                definition: "1x / Bulan",
                targetMonth: "1",
                targetYear: "12",
            },
        ],
    },
    {
        no: "5",
        name: "EKSTERNAL INSPEKSI LR COLOR CODE",
        definition: "1x / semester",
        unit: "Inspeksi",
        targetMonth: "TBA",
        targetYear: "2",
    },
    {
        no: "6",
        name: "INSPEKSI BENDA JATUH / DROPS **)",
        definition: "Per 7 hari / 30 hari / 90 hari / 180 hari",
        unit: "Inspeksi",
        targetMonth: "TBA",
        targetYear: "48",
    },
    {
        no: "7",
        name: "INPEKSI / Audit SMK3L: PERALATAN, DATA PERSONAL MILIK SUBKONTRAKTOR",
        definition: "1x / Tahun",
        unit: "Audit",
        targetMonth: "TBA",
        targetYear: "1",
    },
    {
        no: "8",
        name: "SPOT CHECK KENDARAAN *) **)",
        definition: "1x / semester",
        unit: "Inspeksi",
        targetMonth: "TBA",
        targetYear: "2",
    },
    {
        no: "9",
        name: "AUDIT INTERNAL & EKSTERNAL (Sistem manajemen *)",
        definition: "1x / tahun",
        unit: "Audit",
        targetMonth: "TBA",
        targetYear: "1",
    },
    {
        no: "10",
        name: "MONITORING KEPATUHAN MENGEMUDI (Mencakup speed / i-JMS report / fatigue *)",
        definition: "100% tak ada pelanggaran",
        unit: "Kepatuhan",
        targetMonth: "100%",
        targetYear: "100%",
    },
    {
        no: "11",
        name: "Inspeksi Kendaraan (PTI) Harian dalam laporan mingguan",
        definition: "4 laporan / unit / bulan",
        unit: "Laporan",
        targetMonth: "32",
        targetYear: "384",
    },
    {
        no: "13",
        name: "SPESIFIK RANDOM : NAPZA & MIRAS TEST *)",
        definition: "1x / semester / kontrak",
        unit: "Test",
        targetMonth: "TBA",
        targetYear: "1",
    },
    {
        no: "14",
        name: "Medical Check Up :",
        definition: "",
        unit: "Pemeriksaan",
        targetMonth: "",
        targetYear: "",
        isParent: true,
        subItems: [
            {
                subNo: "1",
                name: "Pra Pekerjaan (Karyawan Baru)",
                definition: "Bilamana ada karyawan baru",
                targetMonth: "TBA",
                targetYear: "100%",
            },
            {
                subNo: "2",
                name: "Periodik (Tahunan)",
                definition: "1x/tahun/karyawan",
                targetMonth: "TBA",
                targetYear: "100%",
            },
            {
                subNo: "3",
                name: "Pra MCU (histori konsul pada tahun sebelumnya)",
                definition: "Sesuai histori MCU",
                targetMonth: "TBA",
                targetYear: "",
            },
        ],
    },
    {
        no: "15",
        name: "TOP MANAGEMENT VISIT / MWT (Level General Manager / Dir. Operasi / Direktur Utama ***)",
        definition: "1x / Semester",
        unit: "Kunjungan",
        targetMonth: "TBA",
        targetYear: "2",
    },
    {
        no: "16",
        name: "MANAGEMENT VISIT / MWT Level Coord level s/d Manager *)",
        definition: "4X / Rig / bulan",
        unit: "Kunjungan",
        targetMonth: "4",
        targetYear: "48",
    },
    {
        no: "17",
        name: "RAPAT RUTIN KESELAMATAN (TGM PER SHIFT/PJM)",
        definition: "1x / shift / hari",
        unit: "Rapat",
        targetMonth: "60",
        targetYear: "730",
    },
    {
        no: "18",
        name: "PRE HITCH MEETING",
        definition: "3x / Bulan",
        unit: "Rapat",
        targetMonth: "3",
        targetYear: "36",
    },
    {
        no: "19",
        name: "RAPAT/FORUM BERSAMA LEADER BMS DAN PHR",
        definition: "Minimal 4x / bulan",
        unit: "Rapat",
        targetMonth: "4",
        targetYear: "48",
    },
    {
        no: "20",
        name: "SAFETY TALK MONTHLY MEETING :",
        definition: "Minimal 1X / Bulan",
        unit: "Meeting",
        targetMonth: "",
        targetYear: "",
        isParent: true,
        subItems: [
            {
                subNo: "",
                name: "-  SUPPORT YARD",
                definition: "Minimal 1X / Bulan",
                targetMonth: "1",
                targetYear: "12",
            },
            {
                subNo: "",
                name: "-  RIG (Minggu ke IV jadwal PHM)",
                definition: "Minimal 1X / Bulan",
                targetMonth: "1",
                targetYear: "12",
            },
        ],
    },
    {
        no: "21",
        name: "LEADERSHIP FORUM ***)",
        definition: "1X / Caturwulan",
        unit: "Forum",
        targetMonth: "TBA",
        targetYear: "3",
    },
    {
        no: "22",
        name: "KAMPANYE KESELAMATAN (PIN/POSTER/STIKER/SPANDUK/Online PHM) *)",
        definition: "1X / 2 bln",
        unit: "Kampanye",
        targetMonth: "TBA",
        targetYear: "6",
    },
    {
        no: "23",
        name: "REVIEW, TINJAUAN MANAJEMEN *)",
        definition: "1X / Tahun",
        unit: "Review",
        targetMonth: "TBA",
        targetYear: "1",
    },
    {
        no: "24",
        name: "HYGIENE MONITORING : NOISE & LUX MONITORING **)",
        definition: "Min 1x / semester",
        unit: "Monitoring",
        targetMonth: "TBA",
        targetYear: "2",
    },
    {
        no: "25",
        name: "HYGIENE MONITORING : Mess, Catering, DAM*)",
        definition: "Min 1x / tahun",
        unit: "Monitoring",
        targetMonth: "TBA",
        targetYear: "1",
    },
    {
        no: "26",
        name: "INSPEKSI \"HOUSEKEEPING RIG\"",
        definition: "1x / Bulan",
        unit: "Inspeksi",
        targetMonth: "1",
        targetYear: "12",
    },
    {
        no: "27",
        name: "PENGHARGAAN: KONTES \"HOUSEKEEPING RIG\" *)",
        definition: "1x / semester",
        unit: "Penghargaan",
        targetMonth: "TBA",
        targetYear: "2",
    },
    {
        no: "28",
        name: "PELAPORAN LINGKUNGAN YARD KE DINAS LH",
        definition: "1x / semester",
        unit: "Laporan",
        targetMonth: "TBA",
        targetYear: "2",
    },
    {
        no: "29",
        name: "PENGHARGAAN: RIG OF THE MONTH INTERNAL / EXTERNAL **)",
        definition: "Rig Yang The Best / Mencapai target nilai yang ditentukan",
        unit: "Penghargaan",
        targetMonth: "TBA",
        targetYear: "TBA",
    },
    {
        no: "30",
        name: "PENGHARGAAN THE BEST BBS / PEKA",
        definition: "1 orang / bulan / Rig",
        unit: "Orang",
        targetMonth: "1",
        targetYear: "12",
    },
    {
        no: "31",
        name: "PENGHARGAAN THE BEST DRIVER",
        definition: "1 orang / bulan / Rig",
        unit: "Orang",
        targetMonth: "1",
        targetYear: "12",
    },
    {
        no: "32",
        name: "PENGHARGAAN: PENCAPAIAN KERJA SELAMAT TAHUNAN",
        definition: "Non recordable case dalam 1 tahun",
        unit: "Penghargaan",
        targetMonth: "TBA",
        targetYear: "1",
    },
    {
        no: "33",
        name: "PENGHARGAAN \"Healing\" :",
        definition: "",
        unit: "Penghargaan",
        targetMonth: "",
        targetYear: "",
        isParent: true,
        subItems: [
            {
                subNo: "a.",
                name: "Dalam Negeri:\nDalam Provinsi atau Luar provinsi: min. 1 orang / rig dan Divisi support sesuai (jumlah Departemen dan jumlah Unit).",
                definition: "Per Semester",
                targetMonth: "TBA",
                targetYear: "2",
            },
            {
                subNo: "b.",
                name: "Luar Negri - China / dll (minimal 3 orang: mewakili seluruh rig beroperasi di periode penilaian), sasaran: Sr. Supervisor s/d Manager level",
                definition: "Per 1 Tahun",
                targetMonth: "TBA",
                targetYear: "1",
            },
        ],
    },
    {
        no: "34",
        name: "Sosialisasi (Kebijakan, Prosedur sistem, KPI, Hrade, SOP, JSA, MSDS, LOR, dll)",
        definition: "Min 1x / semester",
        unit: "Sesi",
        targetMonth: "6",
        targetYear: "72",
    },
    {
        no: "35",
        name: "\"ON SITE TRAINING\" DI LOKASI *)",
        definition: "Min 1x / Crew / Bulan",
        unit: "Sesi",
        targetMonth: "3",
        targetYear: "36",
    },
    {
        no: "36",
        name: "ERP DRILL RIG : H2S&SCBA / FIRE / MEDIVAC/ PENYELAMATAN KERJA DI KETINGGIAN / TUMPAHAN. **)",
        definition: "1x / kru / 3 bulan (sesuai jadwal)",
        unit: "Drill",
        targetMonth: "3",
        targetYear: "36",
    },
    {
        no: "37",
        name: "ERP DRILL YARD : FIRE / MEDIVAC / TUMPAHAN *)",
        definition: "1x / Semester",
        unit: "Drill",
        targetMonth: "TBA",
        targetYear: "2",
    },
];

/**
 * Mengubah struktur hirarkis MASTER_LEADING_TARGETS menjadi flat array
 * yang berurutan sesuai tampilan form Excel
 */
export function getFlatLeadingIndicators() {
    const list = [];
    MASTER_LEADING_TARGETS.forEach((item) => {
        const parentKey = `lead_${item.no}`;
        list.push({
            id: parentKey,
            no: item.no,
            subNo: "",
            name: item.name,
            customName: item.name,
            definition: item.definition || "",
            unit: item.unit || "Activity",
            targetMonth: item.targetMonth,
            targetYear: item.targetYear,
            plan: item.targetMonth,
            actual: "",
            isParent: !!item.isParent,
            isSubItem: false,
            parentId: null,
            isCustom: false,
        });

        if (item.subItems && item.subItems.length > 0) {
            item.subItems.forEach((sub, sIdx) => {
                const subKey = `lead_${item.no}_sub_${sIdx + 1}`;
                list.push({
                    id: subKey,
                    no: "",
                    subNo: sub.subNo || "",
                    name: sub.name,
                    customName: sub.name,
                    definition: sub.definition || "",
                    unit: sub.unit || item.unit || "Activity",
                    targetMonth: sub.targetMonth,
                    targetYear: sub.targetYear,
                    plan: sub.targetMonth,
                    actual: "",
                    isParent: false,
                    isSubItem: true,
                    parentId: parentKey,
                    isCustom: false,
                });
            });
        }
    });
    return list;
}

/**
 * Mengembalikan state default lagging indicators dalam bentuk key-value object
 */
export function getDefaultLaggingState() {
    const state = {};
    MASTER_LAGGING_TARGETS.forEach((item, index) => {
        const id = `lag_${index + 1}`;
        state[id] = {
            id,
            no: index + 1,
            indicatorNo: item.indicatorNo || `1.${index + 1}`,
            name: item.name,
            customName: item.name,
            definition: item.definition || "",
            keterangan: item.keterangan || item.notes || "",
            notes: item.notes || item.keterangan || "",
            unit: item.unit || "Case",
            targetMonth: item.targetMonth ?? "0",
            targetYear: item.targetYear ?? "0",
            plan: item.targetMonth ?? "0",
            targetFr: item.targetFr ?? (item.isCaseFrCombo ? "0.00" : null),
            planFr: item.targetFr ?? (item.isCaseFrCombo ? "0.00" : null),
            actual: "",
            actualFr: "",
            frequencyRate: item.frequencyRate || "",
            isCaseFrCombo: Boolean(item.isCaseFrCombo),
            isCustom: false,
        };
    });
    return state;
}

/**
 * Mengembalikan state default leading indicators dalam bentuk key-value object
 */
export function getDefaultLeadingState() {
    const state = {};
    getFlatLeadingIndicators().forEach((item) => {
        state[item.id] = { ...item };
    });
    return state;
}

/**
 * Mengembalikan konfigurasi default target & plan untuk Rig & Bulan tertentu
 */
export function getDefaultKpiTargets(rigNo = null, month = null) {
    const mIdx =
        typeof month === "number" && month >= 1 && month <= 12
            ? month - 1
            : typeof month === "number" && month >= 0 && month < 12
            ? month
            : null;

    const premisesPlan = mIdx !== null ? MONTHLY_PREMISES_PLANS[mIdx] : MASTER_MAN_HOURS_TARGETS.premisesPlan;
    const nonPremisesPlan = mIdx !== null ? MONTHLY_NON_PREMISES_PLANS[mIdx] : MASTER_MAN_HOURS_TARGETS.nonPremisesPlan;
    const totalManHours = premisesPlan + nonPremisesPlan;

    return {
        manHours: {
            ...MASTER_MAN_HOURS_TARGETS,
            premisesPlan,
            nonPremisesPlan,
            totalManHours,
        },
        ops: { ...MASTER_OPS_TARGETS },
        lagging: MASTER_LAGGING_TARGETS.map((t) => ({ ...t })),
        leading: getFlatLeadingIndicators(),
    };
}

/**
 * Mencari target master KPI per Rig & Bulan dari array database masterKpiTargets
 * dengan fallback ke data statis resmi.
 */
export function getRigMonthPlanTargets({ masterKpiTargets = [], rigNo = "", contractNo = "", monthIndex = 0 }) {
    const cleanRig = String(rigNo || "").trim().toLowerCase().replace(/\s+/g, "");
    const defaults = getDefaultKpiTargets(rigNo, monthIndex);

    const rigSpecific = cleanRig
        ? (masterKpiTargets || []).filter((t) => t.rig_no && t.rig_no.toLowerCase().replace(/\s+/g, "") === cleanRig)
        : [];
    const globalTargets = (masterKpiTargets || []).filter((t) => !t.rig_no);
    const applicableTargets = rigSpecific.length > 0 ? rigSpecific : globalTargets;

    const findDbTarget = (category, indicatorName) => {
        const cleanName = String(indicatorName || "").trim().toLowerCase();
        const found =
            applicableTargets.find((t) => {
                if (category && t.category !== category) return false;
                return String(t.indicator_name || "").trim().toLowerCase() === cleanName;
            }) ||
            (applicableTargets !== globalTargets
                ? globalTargets.find((t) => {
                      if (category && t.category !== category) return false;
                      return String(t.indicator_name || "").trim().toLowerCase() === cleanName;
                  })
                : null);

        if (found) {
            if (Array.isArray(found.monthly_plans) && found.monthly_plans[monthIndex] !== undefined) {
                return found.monthly_plans[monthIndex];
            }
            if (found.target_month !== undefined && found.target_month !== null && found.target_month !== "") {
                return found.target_month;
            }
            if (found.plan !== undefined && found.plan !== null && found.plan !== "") {
                return found.plan;
            }
        }
        return null;
    };

    const manHoursPremisesPlan = findDbTarget("man_hours", "MANHOURS PREMISES") ?? defaults.manHours.premisesPlan;
    const manHoursNonPremisesPlan = findDbTarget("man_hours", "MANHOURS NON PREMISES") ?? defaults.manHours.nonPremisesPlan;
    const kilometerPremisesPlan = findDbTarget("man_hours", "KILOMETER DRIVEN PREMISES") ?? defaults.manHours.kilometerPremisesPlan;
    const kilometerNonPremisesPlan = findDbTarget("man_hours", "KILOMETER DRIVEN NON PREMISES") ?? defaults.manHours.kilometerNonPremisesPlan;
    const employees = findDbTarget("man_hours", "JML KARYAWAN") ?? defaults.manHours.totalEmployees;
    const totalVehicles = findDbTarget("man_hours", "JUMLAH UNIT") ?? defaults.manHours.totalVehicles;

    return {
        manHoursPremisesPlan,
        manHoursNonPremisesPlan,
        kilometerPremisesPlan,
        kilometerNonPremisesPlan,
        employees,
        totalVehicles,
        findDbTarget,
    };
}
