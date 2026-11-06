import React, { useMemo, useState } from "react";
import AdminSidebar from "../../Components/AdminSidebar";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { usePage } from "@inertiajs/react";
import { AlertTriangle, Download, X } from "lucide-react";
import { calcFrequencyRate, calcMvcFrequencyRate } from "../../Utils/hseCalculations";
import {
    ALL_AREAS,
    ALL_CONTRACTS,
    ALL_RIG_NAMES,
    CONTRACT_RIG_GROUPS,
    getRigsByContract,
    getContractInfoByRig,
} from "../../Utils/rigContracts";

/* ============================================================
   BASIC HELPER
============================================================ */

const REPORT_QUARTERS = ["Q4", "Q1", "Q2", "Q3"];

const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function number(value) {
    const result = Number(value);
    return Number.isFinite(result) ? result : 0;
}

function formatNumber(value) {
    const n = number(value);

    if (Number.isInteger(n)) {
        return n.toLocaleString("id-ID");
    }

    return n.toLocaleString("id-ID", {
        maximumFractionDigits: 4,
    });
}

function formatDate(date) {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return date;
    }

    return value.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function getReportYear(report) {
    if (report?.year) {
        return Number(report.year);
    }

    const date =
        report?.report_date ||
        report?.issued_date ||
        report?.created_at ||
        null;

    if (date) {
        const parsed = new Date(date);

        if (!Number.isNaN(parsed.getTime())) {
            return parsed.getFullYear();
        }
    }

    return new Date().getFullYear();
}

function getMonthFromReport(report) {
    if (
        report?.period !== undefined &&
        report?.period !== null &&
        report?.period !== ""
    ) {
        const period = Number(report.period);

        if (period >= 1 && period <= 12) {
            return period - 1;
        }
    }

    if (report?.report_date || report?.issued_date || report?.created_at) {
        const date = new Date(
            report.report_date || report.issued_date || report.created_at,
        );

        if (!Number.isNaN(date.getTime())) {
            return date.getMonth();
        }
    }

    return 0;
}

function quarter(values, q, activeMonthCount = 12) {
    const start = q * 3;
    const end = Math.min(start + 3, activeMonthCount);

    if (start >= activeMonthCount) {
        return 0;
    }

    return values
        .slice(start, end)
        .reduce((total, value) => total + number(value), 0);
}

function getQuarterValue(item, quarterName, mode = "Actual") {
    if (!item) return 0;

    const map = {
        Q1: mode === "Plan" ? item.planQ1 : item.actualQ1,
        Q2: mode === "Plan" ? item.planQ2 : item.actualQ2,
        Q3: mode === "Plan" ? item.planQ3 : item.actualQ3,
        Q4: mode === "Plan" ? item.planQ4 : item.actualQ4,
    };

    const val = map[quarterName];
    if (val === undefined || val === null || val === "") return "-";
    if (typeof val === "string") return val;

    return number(val);
}

function normalizeReport(report) {
    const manHoursData = report?.man_hours || report?.manHours || null;

    return {
        ...report,

        manHours: Array.isArray(manHoursData)
            ? manHoursData[0] || null
            : manHoursData,

        laggingIndicators: Array.isArray(report?.lagging_indicators)
            ? report.lagging_indicators
            : Array.isArray(report?.laggingIndicators)
              ? report.laggingIndicators
              : [],

        leadingIndicators: Array.isArray(report?.leading_indicators)
            ? report.leading_indicators
            : Array.isArray(report?.leadingIndicators)
              ? report.leadingIndicators
              : [],
    };
}

/* ============================================================
   LAGGING MASTER
   12 POINT SESUAI TEMPLATE EXCEL
============================================================ */

const LAGGING_INDICATOR_MASTER = [
    {
        no: "1.1",
        name: "FATALITY",
        definition: "Frequency rate = (kasus cedera x 200.000) / Jam Kerja",
        unit: "Case",
        notes: "",
        targetMonth: "0",
        targetFr: "-",
        isCaseFrCombo: true,
    },
    {
        no: "1.2",
        name: "SERIOUS LOST TIME INJURY (>21 LOST DAY)",
        definition: "Frequency rate = (kasus cedera x 200.000) / Jam Kerja",
        unit: "Case",
        notes: "",
        targetMonth: "0",
        targetFr: "-",
        isCaseFrCombo: true,
    },
    {
        no: "1.3",
        name: "RESTRICTED WORK CASE (RWC)",
        definition: "Frequency rate = (kasus cedera x 200.000) / Jam Kerja",
        unit: "Case",
        notes: "",
        targetMonth: "0",
        targetFr: "-",
        isCaseFrCombo: true,
    },
    {
        no: "1.4",
        name: "MEDICAL TREATMENT CASE (MTC)",
        definition: "Frequency rate = (kasus cedera x 200.000) / Jam Kerja",
        unit: "Case",
        notes: "",
        targetMonth: "0",
        targetFr: "-",
        isCaseFrCombo: true,
    },
    {
        no: "1.5",
        name: "TOTAL RECORDABLE INJURY",
        definition: "Frequency rate = (kasus cedera x 200.000) / Jam Kerja",
        unit: "Case",
        notes: "Recordable",
        targetMonth: "0",
        targetFr: "0.00",
        isCaseFrCombo: true,
    },
    {
        no: "1.6",
        name: "MOTOR VEHICLE CRASH (MVC)",
        definition:
            "MVC FR = (kasus x 1.000.000) / kilometer Perjalanan Kendaraan",
        unit: "Case",
        notes: "Recordable",
        targetMonth: "0",
        targetFr: "0.00",
        isCaseFrCombo: true,
    },
    {
        no: "1.7",
        name: "TUMPAHAN / OIL SPILL",
        definition: "Record case > 1 barrel",
        unit: "Case",
        notes: "",
        targetMonth: "0",
        targetFr: "NA",
        isCaseFrCombo: true,
    },
    {
        no: "1.8",
        name: "FIRE",
        definition: "Record case > Rp. 100 Jt",
        unit: "Case",
        notes: "",
        targetMonth: "0",
        targetFr: "NA",
        isCaseFrCombo: true,
    },
    {
        no: "1.9",
        name: "PROPERTY DAMAGE",
        definition: "Record case > Rp. 100 Jt",
        unit: "Case",
        notes: "",
        targetMonth: "0",
        targetFr: "NA",
        isCaseFrCombo: true,
    },
    {
        no: "1.10",
        name: "SECURITY CASE",
        definition: "Record case",
        unit: "Case",
        notes: "",
        targetMonth: "0",
        targetFr: "NA",
        isCaseFrCombo: true,
    },
    {
        no: "1.11",
        name: "ILLNESS/FATALITY",
        definition: "Record case",
        unit: "Case",
        notes: "",
        targetMonth: "0",
        targetFr: "NA",
        isCaseFrCombo: true,
    },
    {
        no: "1.12",
        name: "REPORTABLE CASE : OPS. INCIDENT / ETA / FAC / NEARMISS",
        definition: "Reportable case",
        unit: "Case",
        notes: "Reportable case",
        targetMonth: "0",
        targetFr: "NA",
        isCaseFrCombo: true,
    },
];

/* ============================================================
   LEADING MASTER
   36 POINT SESUAI TEMPLATE EXCEL
============================================================ */

const LEADING_INDICATOR_MASTER = [
    {
        no: 1,
        indicator: "OBSERVASI PERILAKU (PEKA) *)",
        definition: "Min. 2 Laporan / Org / Minggu",
        monthlyTarget: 373,
        annualTarget: 4480,
        definition2: "Kru Operasi",
        defaultPlanMonthly: [
            373, 373, 373, 373, 373, 373, 373, 373, 373, 373, 373, 373,
        ],
    },
    {
        no: 2,
        indicator: "IDENTIFIKASI BAHAYA (HAZID/ 5 MNT RISK ASSESSMENT)",
        definition: "10 Laporan / Shift / Hari",
        monthlyTarget: 600,
        annualTarget: 7200,
        definition2: "Total target bulanan menyesuaikan jumlah hari / bulan",
        defaultPlanMonthly: [
            600, 620, 600, 620, 620, 560, 620, 600, 620, 600, 620, 620,
        ],
    },
    {
        no: 3,
        indicator: "SWA REPORT",
        definition: "3 Laporan/ Shift / Hari",
        monthlyTarget: 180,
        annualTarget: 2160,
        definition2: "",
        defaultPlanMonthly: [
            180, 186, 180, 186, 186, 168, 186, 180, 186, 180, 186, 186,
        ],
    },
    {
        no: 4,
        indicator: "INSPEKSI SAFETY EQUIPMENT & APD :",
        isHeader: true,
        definition: "",
        monthlyTarget: "",
        annualTarget: "",
        definition2: "",
    },
    {
        no: "4.1",
        indicator: "- Eye wash & Shower",
        parentNo: 4,
        definition: "Harian",
        monthlyTarget: 30,
        annualTarget: 365,
        definition2: "",
        defaultPlanMonthly: [
            30, 31, 30, 31, 31, 28, 31, 30, 31, 30, 31, 31,
        ],
    },
    {
        no: "4.2",
        indicator: "- APD & P3K",
        parentNo: 4,
        definition: "1x / Minggu",
        monthlyTarget: 4,
        annualTarget: 48,
        definition2: "",
        defaultPlanMonthly: [
            4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        ],
    },
    {
        no: "4.3",
        indicator: "- Firex, Tandu, SCBA, FBH",
        parentNo: 4,
        definition: "1x / Bulan",
        monthlyTarget: 1,
        annualTarget: 12,
        definition2: "",
        defaultPlanMonthly: [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        ],
    },
    {
        no: 5,
        indicator: "EKSTERNAL INSPEKSI LR COLOR CODE",
        definition: "1x / semester",
        monthlyTarget: "TBA",
        annualTarget: 2,
        definition2: "",
        defaultPlanMonthly: [
            0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
        ],
    },
    {
        no: 6,
        indicator: "INSPEKSI BENDA JATUH / DROPS **)",
        definition: "Per 7 hari / 30 hari / 90 hari / 180 hari",
        monthlyTarget: "TBA",
        annualTarget: 48,
        definition2: "",
        defaultPlanMonthly: [
            4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        ],
    },
    {
        no: 7,
        indicator:
            "INSPEKSI / Audit SMK3L: PERALATAN, DATA PERSONAL MILIK SUBKONTRAKTOR",
        definition: "1x / Tahun",
        monthlyTarget: "TBA",
        annualTarget: 1,
        definition2: "",
        defaultPlanMonthly: [
            0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
    },
    {
        no: 8,
        indicator: "SPOT CHECK KENDARAAN *) **)",
        definition: "1x / semester",
        monthlyTarget: "TBA",
        annualTarget: 2,
        definition2: "",
        defaultPlanMonthly: [
            0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0,
        ],
    },
    {
        no: 9,
        indicator: "AUDIT INTERNAL & EKSTERNAL (Sistem manajemen *)",
        definition: "1x / tahun",
        monthlyTarget: "TBA",
        annualTarget: 1,
        definition2: "",
        defaultPlanMonthly: [
            0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
    },
    {
        no: 10,
        indicator:
            "MONITORING KEPATUHAN PENGEMUDI (Mencakup speed / IVMS report / fatigue *)",
        definition: "100% tak ada pelanggaran",
        monthlyTarget: "100%",
        annualTarget: "100%",
        definition2: "PIC Transport",
        isPercentage: true,
        targetNumber: 100,
        defaultPlanMonthly: [
            100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
        ],
    },
    {
        no: 11,
        indicator: "Inspeksi Kendaraan (PTI) Harian dalam laporan mingguan",
        definition: "4 laporan / unit / bulan",
        monthlyTarget: 32,
        annualTarget: 384,
        definition2: "PIC Transport",
        defaultPlanMonthly: [
            240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240, 240,
        ],
    },
    {
        no: 13,
        indicator: "SPESIFIK RANDOM : NAPZA & MIRAS TEST *)",
        definition: "1x / semester / kontrak",
        monthlyTarget: "TBA",
        annualTarget: 1,
        definition2: "Random 10% jumlah personel / kontrak",
        defaultPlanMonthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
        no: 14,
        indicator: "Medical Check Up :",
        isHeader: true,
        definition: "",
        monthlyTarget: "",
        annualTarget: "",
        definition2: "",
    },
    {
        no: "14.1",
        indicator: "- Pra Pekerjaan (Karyawan Baru)",
        parentNo: 14,
        definition: "Bilamana ada karyawan baru",
        monthlyTarget: "TBA",
        annualTarget: "100%",
        definition2: "",
        defaultPlanMonthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
        no: "14.2",
        indicator: "- Periodik (Tahunan)",
        parentNo: 14,
        definition: "1x/tahun/karyawan",
        monthlyTarget: "TBA",
        annualTarget: "100%",
        definition2: "",
        defaultPlanMonthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
        no: "14.3",
        indicator: "- Pra MCU (histori konsul pada tahun sebelumnya)",
        parentNo: 14,
        definition: "Sesuai histori MCU",
        monthlyTarget: "TBA",
        annualTarget: "TBA",
        definition2: "",
        defaultPlanMonthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
        no: 15,
        indicator:
            "TOP MANAGEMENT VISIT / MWT (Level General Manager / Dir. Operasi / Direktur Utama ***)",
        definition: "1x / Semester",
        monthlyTarget: "TBA",
        annualTarget: 2,
        definition2: "",
        defaultPlanMonthly: [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    },
    {
        no: 16,
        indicator: "MANAGEMENT VISIT / MWT (Level Coord level s/d Manager *)",
        definition: "4X / Rig / bulan",
        monthlyTarget: 4,
        annualTarget: 48,
        definition2: "Mencakup pelaksanaan V&V SIPP's",
        defaultPlanMonthly: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    },
    {
        no: 17,
        indicator: "RAPAT RUTIN KESELAMATAN (TGM PER SHIFT/PJM)",
        definition: "1x / shift / hari",
        monthlyTarget: 60,
        annualTarget: 720,
        definition2: "",
        defaultPlanMonthly: [60, 62, 60, 62, 62, 56, 62, 60, 62, 60, 62, 62],
    },
    {
        no: 18,
        indicator: "PRE HITCH MEETING",
        definition: "3x / Bulan",
        monthlyTarget: 3,
        annualTarget: 36,
        definition2:
            "1 atau 2 hari sebelum kru Jadwal masuk kerja (on schedule) hari-1.",
        defaultPlanMonthly: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    },
    {
        no: 19,
        indicator: "RAPAT/FORUM BERSAMA LEADER BMS DAN PHR.",
        definition: "Minimal 4x / bulan",
        monthlyTarget: 4,
        annualTarget: 48,
        definition2:
            "HMM, HES Council Meeting bulanan, C&C/Alignment meeting mingguan, PQA Mgr mingguan",
        defaultPlanMonthly: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    },
    {
        no: 20,
        indicator: "SAFETY TALK MONTHLY MEETING :",
        isHeader: true,
        definition: "",
        monthlyTarget: "",
        annualTarget: "",
        definition2: "",
    },
    {
        no: "20.1",
        indicator: "- SUPPORT YARD",
        parentNo: 20,
        definition: "Minimal 1X / Bulan",
        monthlyTarget: 1,
        annualTarget: 12,
        definition2: "",
        defaultPlanMonthly: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    {
        no: "20.2",
        indicator: "- RIG (Minggu ke IV jadwal PHM)",
        parentNo: 20,
        definition: "Minimal 1X / Bulan",
        monthlyTarget: 1,
        annualTarget: 12,
        definition2: "",
        defaultPlanMonthly: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    {
        no: 21,
        indicator: "LEADERSHIP FORUM ***)",
        definition: "1X / Caturwulan",
        monthlyTarget: "TBA",
        annualTarget: 3,
        definition2: "",
        defaultPlanMonthly: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    },
    {
        no: 22,
        indicator:
            "KAMPANYE KESELAMATAN (PIN/POSTER/STIKER/ SPANDUK/ Online PHM) *)",
        definition: "1X / 2 bln",
        monthlyTarget: "TBA",
        annualTarget: 6,
        definition2: "",
        defaultPlanMonthly: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    },
    {
        no: 23,
        indicator: "REVIEW, TINJAUAN MANAJEMEN *)",
        definition: "1X / Tahun",
        monthlyTarget: "TBA",
        annualTarget: 1,
        definition2: "",
        defaultPlanMonthly: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
        no: 24,
        indicator: "HYGIENE MONITORING : NOISE & LUX MONITORING **)",
        definition: "Min 1x / semester",
        monthlyTarget: "TBA",
        annualTarget: 2,
        definition2: "",
        defaultPlanMonthly: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    },
    {
        no: 25,
        indicator: "HYGIENE MONITORING : Mess, Catering, DAM*)",
        definition: "Min 1x / tahun",
        monthlyTarget: "TBA",
        annualTarget: 1,
        definition2: "",
        defaultPlanMonthly: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
        no: 26,
        indicator: 'INSPEKSI "HOUSEKEEPING RIG"',
        definition: "1x / Bulan",
        monthlyTarget: 1,
        annualTarget: 12,
        definition2: "Laporan oleh HSE Coord bersama Manager",
        defaultPlanMonthly: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    },
    {
        no: 27,
        indicator: 'PENGHARGAAN: KONTES "HOUSEKEEPING RIG" *)',
        definition: "1x / semester",
        monthlyTarget: "TBA",
        annualTarget: 2,
        definition2: "Dilakukan oleh perwakilan Management",
        defaultPlanMonthly: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    },
    {
        no: 28,
        indicator: "PELAPORAN LINGKUNGAN YARD KE DINAS LH",
        definition: "1x / semester",
        monthlyTarget: "TBA",
        annualTarget: 2,
        definition2: "Laporan DPUH",
        defaultPlanMonthly: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    },
    {
        no: 29,
        indicator: "PENGHARGAAN: RIG OF THE MONTH INTERNAL / EXTERNAL **)",
        definition: "Rig Yang The Best / Mencapai target nilai yang ditentukan",
        monthlyTarget: "TBA",
        annualTarget: "TBA",
        definition2:
            "Rig: Insentif 5% X upah pokok, Support: Insentif 3.5% X upah pokok",
        defaultPlanMonthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
        no: 30,
        indicator: "PENGHARGAAN THE BEST BBS / PEKA",
        definition: "1 orang / bulan / Rig",
        monthlyTarget: 1,
        annualTarget: 12,
        definition2:
            "The best PEKA / BBS dan The best driver support diberikan 1 orang / area",
        defaultPlanMonthly: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    {
        no: 31,
        indicator: "PENGHARGAAN THE BEST DRIVER",
        definition: "1 orang / bulan / Rig",
        monthlyTarget: 1,
        annualTarget: 12,
        definition2:
            "The best PEKA / BBS dan The best driver support diberikan 1 orang / area",
        defaultPlanMonthly: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    {
        no: 32,
        indicator: "PENGHARGAAN: PENCAPAIAN KERJA SELAMAT TAHUNAN",
        definition: "Non recordable case dalam 1 tahun",
        monthlyTarget: "TBA",
        annualTarget: 1,
        definition2: "Voucher Belanja",
        defaultPlanMonthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
        no: 33,
        indicator: 'PENGHARGAAN "Healing" :',
        isHeader: true,
        definition: "",
        monthlyTarget: "",
        annualTarget: "",
        definition2: "",
    },
    {
        no: "33.a",
        indicator:
            "Dalam Negeri :\na. Dalam Provinsi atau Luar provinsi: min. 1 orang / rig dan Divisi support sesuai jumlah Departemen dan jumlah Unit).",
        parentNo: 33,
        definition: "Per Semester",
        monthlyTarget: "TBA",
        annualTarget: 2,
        definition2:
            "Pelaksanaan disesuaikan dengan kondisi bisnis / kontrak & situasi perusahaan.",
        defaultPlanMonthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
        no: "33.b",
        indicator:
            'Luar Negri - China / dll (minimal 3 orang mewakili seluruh b. rig beroperasi di periode penilaian). sasaran : Sr. Supervisor s/d Manager level.',
        parentNo: 33,
        definition: "Per 1 tahun",
        monthlyTarget: "TBA",
        annualTarget: 1,
        definition2:
            "Pelaksanaan disesuaikan dengan kondisi bisnis / kontrak & situasi perusahaan.",
        defaultPlanMonthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
        no: 34,
        indicator:
            "Sosialisasi (kebijakan, Prosedur sistem, KPI, Hiradc, SOP, JSA, MSDS, LOR, dll)",
        definition: "Min 1x / semester",
        monthlyTarget: 6,
        annualTarget: 72,
        definition2: "",
        defaultPlanMonthly: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    },
    {
        no: 35,
        indicator: '"ON SITE TRAINING" DI LOKASI *)',
        definition: "Min 1x / Crew / Bulan",
        monthlyTarget: 3,
        annualTarget: 36,
        definition2: "",
        defaultPlanMonthly: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    },
    {
        no: 36,
        indicator:
            "ERP DRILL RIG : H2S&SCBA / FIRE / MEDIVAC/ PENYELAMATAN KERJA DI KETINGGIAN / TUMPAHAN. **)",
        definition: "1 x / kru / 3 bulan (sesuai jadwal)",
        monthlyTarget: 3,
        annualTarget: 36,
        definition2: "",
        defaultPlanMonthly: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    },
    {
        no: 37,
        indicator: "ERP DRILL YARD : FIRE / MEDIVAC / TUMPAHAN *)",
        definition: "1 x / Semester",
        monthlyTarget: "TBA",
        annualTarget: 2,
        definition2: "",
        defaultPlanMonthly: [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    },
];

/* ============================================================
   BUILD PLAN / ACTUAL INDICATOR
============================================================ */

function createValueObject() {
    return {
        plan: Array(12).fill(0),
        actual: Array(12).fill(0),
    };
}

function calculateSummary(values, activeMonthCount = 12, isPercentage = false) {
    const plan = values?.plan || [];
    const actual = values?.actual || [];

    if (isPercentage) {
        const avgQuarter = (arr, q) => {
            const start = q * 3;
            const end = Math.min(start + 3, activeMonthCount);
            if (start >= activeMonthCount) return 0;
            const slice = arr.slice(start, end).filter((v) => v !== null && v !== undefined && v !== "");
            if (slice.length === 0) return 0;
            const sum = slice.reduce((total, val) => total + number(val), 0);
            return Math.round(sum / slice.length);
        };

        const planQ1 = avgQuarter(plan, 0);
        const actualQ1 = avgQuarter(actual, 0);
        const planQ2 = avgQuarter(plan, 1);
        const actualQ2 = avgQuarter(actual, 1);
        const planQ3 = avgQuarter(plan, 2);
        const actualQ3 = avgQuarter(actual, 2);
        const planQ4 = avgQuarter(plan, 3);
        const actualQ4 = avgQuarter(actual, 3);

        const qSliceP = [planQ1, planQ2, planQ3, planQ4].slice(0, Math.ceil(activeMonthCount / 3)).filter((v) => v > 0);
        const qSliceA = [actualQ1, actualQ2, actualQ3, actualQ4].slice(0, Math.ceil(activeMonthCount / 3)).filter((v) => v > 0);

        return {
            planQ1,
            actualQ1,
            planQ2,
            actualQ2,
            planQ3,
            actualQ3,
            planQ4,
            actualQ4,
            planYtd: qSliceP.length > 0 ? Math.round(qSliceP.reduce((a, b) => a + b, 0) / qSliceP.length) : 0,
            actualYtd: qSliceA.length > 0 ? Math.round(qSliceA.reduce((a, b) => a + b, 0) / qSliceA.length) : 0,
        };
    }

    const planSlice = plan.slice(0, activeMonthCount);
    const actualSlice = actual.slice(0, activeMonthCount);

    return {
        planQ1: quarter(plan, 0, activeMonthCount),
        actualQ1: quarter(actual, 0, activeMonthCount),

        planQ2: quarter(plan, 1, activeMonthCount),
        actualQ2: quarter(actual, 1, activeMonthCount),

        planQ3: quarter(plan, 2, activeMonthCount),
        actualQ3: quarter(actual, 2, activeMonthCount),

        planQ4: quarter(plan, 3, activeMonthCount),
        actualQ4: quarter(actual, 3, activeMonthCount),

        planYtd: planSlice.reduce((total, value) => total + number(value), 0),

        actualYtd: actualSlice.reduce(
            (total, value) => total + number(value),
            0,
        ),
    };
}

/* ============================================================
   BUILD LAGGING
============================================================ */

function buildLaggingRows(reports, activeMonthCount = 12) {
    const map = new Map();

    LAGGING_INDICATOR_MASTER.forEach((master) => {
        const values = createValueObject();
        for (let m = 0; m < 12; m++) {
            values.plan[m] = Number(master.targetMonth) || 0;
            values.actual[m] = Number(master.targetMonth) || 0; // fallback default
        }

        map.set(master.no, {
            no: master.no,
            indicator: master.name,
            definition: master.definition,
            unit: master.unit,
            target: master.targetMonth || 0,
            targetMonth: master.targetMonth || "0",
            targetFr: master.targetFr || (master.isCaseFrCombo ? "0.00" : null),
            isCaseFrCombo: master.isCaseFrCombo,
            values,
            hasManualActual: Array(12).fill(false),
            frequencyRate: Array(12).fill(null),
            notes: master.notes || "",
        });
    });

    reports.forEach((report) => {
        const indicators = report.laggingIndicators || [];

        indicators.forEach((item) => {
            const numberNo = Number(item.indicator_no);

            let master = null;

            if (numberNo >= 1 && numberNo <= 12) {
                master = LAGGING_INDICATOR_MASTER[numberNo - 1];
            }

            const key = master?.no || item.indicator_no || item.indicator_name;

            if (!map.has(key)) {
                return;
            }

            const row = map.get(key);
            if (!row || row.isHeader) {
                return;
            }

            const month =
                Number(item.month) >= 1 && Number(item.month) <= 12
                    ? Number(item.month) - 1
                    : getMonthFromReport(report);

            if (item.definition) {
                row.definition = item.definition;
            }

            if (item.unit) {
                row.unit = item.unit;
            }

            if (item.notes) {
                row.notes = item.notes;
            }

            if (item.frequency_rate !== null && item.frequency_rate !== undefined) {
                row.frequencyRate[month] = Number(item.frequency_rate);
            }

            if (item.plan !== undefined && item.plan !== null && item.plan !== "") {
                row.values.plan[month] = number(item.plan);
            }

            if (item.actual !== undefined && item.actual !== null && item.actual !== "") {
                row.values.actual[month] = number(item.actual);
                row.hasManualActual[month] = true;
            }
        });
    });

    // Perhitungan Kumulatif TRI (1.5) = 1.1 (Fatality) + 1.2 (Serious LTI) + 1.3 (RWC) + 1.4 (MTC)
    const row1_1 = map.get("1.1");
    const row1_2 = map.get("1.2");
    const row1_3 = map.get("1.3");
    const row1_4 = map.get("1.4");
    const row1_5 = map.get("1.5");

    if (row1_5 && row1_1 && row1_2 && row1_3 && row1_4) {
        for (let m = 0; m < 12; m++) {
            const sumPlan =
                row1_1.values.plan[m] +
                row1_2.values.plan[m] +
                row1_3.values.plan[m] +
                row1_4.values.plan[m];
            const sumActual =
                row1_1.values.actual[m] +
                row1_2.values.actual[m] +
                row1_3.values.actual[m] +
                row1_4.values.actual[m];
            row1_5.values.plan[m] = Math.max(row1_5.values.plan[m], sumPlan);
            row1_5.values.actual[m] = Math.max(
                row1_5.values.actual[m],
                sumActual,
            );
            if (row1_1.hasManualActual[m] || row1_2.hasManualActual[m] || row1_3.hasManualActual[m] || row1_4.hasManualActual[m]) {
                row1_5.hasManualActual[m] = true;
            }
        }
    }

    const qIndices = {
        Q4: [8, 9, 10],
        Q1: [11, 0, 1],
        Q2: [2, 3, 4],
        Q3: [5, 6, 7],
    };

    return Array.from(map.values()).map((item) => {
        const hasManualQuarterActual = {
            Q4: qIndices.Q4.some((idx) => item.hasManualActual[idx]),
            Q1: qIndices.Q1.some((idx) => item.hasManualActual[idx]),
            Q2: qIndices.Q2.some((idx) => item.hasManualActual[idx]),
            Q3: qIndices.Q3.some((idx) => item.hasManualActual[idx]),
            YTD: item.hasManualActual.some(Boolean),
        };

        return {
            ...item,
            hasManualQuarterActual,
            ...calculateSummary(item.values, activeMonthCount),
        };
    });
}

/* ============================================================
   BUILD LEADING
============================================================ */

function buildLeadingRows(reports, activeMonthCount = 12) {
    const map = new Map();

    LEADING_INDICATOR_MASTER.forEach((master) => {
        const values = createValueObject();
        const defPlan = master.defaultPlanMonthly || Array(12).fill(Number(master.monthlyTarget) || 0);
        for (let m = 0; m < 12; m++) {
            values.plan[m] = defPlan[m] ?? (Number(master.monthlyTarget) || 0);
            values.actual[m] = values.plan[m]; // default fallback
        }

        map.set(String(master.no), {
            no: master.no,
            indicator: master.indicator,
            isHeader: master.isHeader || false,
            parentNo: master.parentNo || null,
            definition: master.definition || "",
            definition2: master.definition2 || "",
            monthlyTarget: master.monthlyTarget ?? "",
            annualTarget: master.annualTarget ?? "",
            unit: master.isPercentage ? "%" : "Activity",
            isPercentage: master.isPercentage || false,
            targetNumber: master.targetNumber || 0,
            values,
            hasManualActual: Array(12).fill(false),
            notes: "",
        });
    });

    reports.forEach((report) => {
        const indicators = report.leadingIndicators || [];

        indicators.forEach((item) => {
            const rawKey = String(item.indicator_no || "").trim();
            const name = String(item.indicator_name || item.name || "").toLowerCase();
            let key = rawKey;

            // Prioritize specific matching for grouped indicators (4, 14, 20, 33)
            if (name.includes("eye wash") || name.includes("eyewash")) {
                key = "4.1";
            } else if (name.includes("apd & p3k") || name.includes("apd and p3k") || name.includes("p3k")) {
                key = "4.2";
            } else if (name.includes("firex") || (rawKey === "4" && (name.includes("scba") || name.includes("fbh") || name.includes("tandu")))) {
                key = "4.3";
            } else if (name.includes("pra pekerjaan") || (rawKey === "14" && name.includes("baru"))) {
                key = "14.1";
            } else if (name.includes("periodik")) {
                key = "14.2";
            } else if (name.includes("pra mcu") || (rawKey === "14" && name.includes("konsul"))) {
                key = "14.3";
            } else if (name.includes("support yard") || (rawKey === "20" && name.includes("yard"))) {
                key = "20.1";
            } else if (name.includes("support rig") || (rawKey === "20" && (name.includes("rig") || name.includes("minggu ke iv")))) {
                key = "20.2";
            } else if (name.includes("dalam negeri") || (rawKey === "33" && (name.includes("provinsi") || name.includes("support")))) {
                key = "33.a";
            } else if (name.includes("luar negri") || name.includes("luar negeri") || name.includes("china")) {
                key = "33.b";
            } else if (name.includes("sosialisasi")) {
                key = "34";
            } else if (name.includes("on site")) {
                key = "35";
            } else if (name.includes("drill rig") || (name.includes("drill") && !name.includes("yard"))) {
                key = "36";
            } else if (name.includes("drill yard")) {
                key = "37";
            } else if (rawKey === "4") {
                key = "4.1";
            } else if (rawKey === "14") {
                key = "14.1";
            } else if (rawKey === "20") {
                key = "20.1";
            } else if (rawKey === "33") {
                key = "33.a";
            } else if (!map.has(key)) {
                const matched = LEADING_INDICATOR_MASTER.find((m) =>
                    name.includes(m.indicator.slice(0, 15).toLowerCase()) ||
                    m.indicator.toLowerCase().includes(name.slice(0, 15))
                );
                if (matched) {
                    key = String(matched.no);
                }
            }

            if (!map.has(key)) {
                return;
            }

            const row = map.get(key);

            const month =
                Number(item.month) >= 1 && Number(item.month) <= 12
                    ? Number(item.month) - 1
                    : getMonthFromReport(report);

            if (item.plan !== undefined && item.plan !== null && item.plan !== "" && Number(item.plan) > 0) {
                row.values.plan[month] = number(item.plan);
            }
            if (item.actual !== undefined && item.actual !== null && item.actual !== "") {
                row.values.actual[month] = number(item.actual);
                row.hasManualActual[month] = true;
            }

            if (item.definition) {
                row.definition = item.definition;
            }

            if (
                item.frequency_definition ||
                item.frequencyDefinition ||
                item.definition2
            ) {
                row.definition2 =
                    item.frequency_definition ||
                    item.frequencyDefinition ||
                    item.definition2;
            }

            if (item.unit) {
                row.unit = item.unit;
            }

            if (item.notes) {
                row.notes = item.notes;
            }

            if (
                item.target_month !== null &&
                item.target_month !== undefined &&
                item.target_month !== "" &&
                item.target_month !== 0
            ) {
                row.monthlyTarget = item.target_month;
            }

            if (
                item.target_year !== null &&
                item.target_year !== undefined &&
                item.target_year !== "" &&
                item.target_year !== 0
            ) {
                row.annualTarget = item.target_year;
            }
        });
    });

    Array.from(map.values()).forEach((row) => {
        if (row.isHeader) return;
        const hasAnyPlan = row.values.plan.some((v) => v > 0);
        const master = LEADING_INDICATOR_MASTER.find(
            (m) => String(m.no) === String(row.no),
        );
        if (!hasAnyPlan && master && master.defaultPlanMonthly) {
            row.values.plan = [...master.defaultPlanMonthly];
        }
        for (let m = 0; m < 12; m++) {
            if (!row.hasManualActual[m]) {
                row.values.actual[m] = row.values.plan[m];
            }
        }
    });

    const qIndices = {
        Q4: [8, 9, 10],
        Q1: [11, 0, 1],
        Q2: [2, 3, 4],
        Q3: [5, 6, 7],
    };

    return Array.from(map.values()).map((item) => {
        const hasManualQuarterActual = {
            Q4: qIndices.Q4.some((idx) => item.hasManualActual[idx]),
            Q1: qIndices.Q1.some((idx) => item.hasManualActual[idx]),
            Q2: qIndices.Q2.some((idx) => item.hasManualActual[idx]),
            Q3: qIndices.Q3.some((idx) => item.hasManualActual[idx]),
            YTD: item.hasManualActual.some(Boolean),
        };

        if (item.isPercentage) {
            const calcQuarterActual = (monthIndices) => {
                const manual = monthIndices.filter((idx) => idx < activeMonthCount && item.hasManualActual[idx]);
                if (manual.length === 0) return `${item.targetNumber}.00%`;
                const avg = manual.reduce((a, idx) => a + item.values.actual[idx], 0) / manual.length;
                return `${avg.toFixed(2)}%`;
            };

            const manualYtd = Array.from({ length: activeMonthCount }, (_, i) => i).filter((idx) => item.hasManualActual[idx]);
            const actualYtd = manualYtd.length === 0
                ? `${item.targetNumber}.00%`
                : `${(manualYtd.reduce((a, idx) => a + item.values.actual[idx], 0) / manualYtd.length).toFixed(2)}%`;

            return {
                ...item,
                hasManualQuarterActual,
                planQ4: `${item.targetNumber}.00%`,
                actualQ4: calcQuarterActual([8, 9, 10]),
                planQ1: `${item.targetNumber}.00%`,
                actualQ1: calcQuarterActual([11, 0, 1]),
                planQ2: `${item.targetNumber}.00%`,
                actualQ2: calcQuarterActual([2, 3, 4]),
                planQ3: `${item.targetNumber}.00%`,
                actualQ3: calcQuarterActual([5, 6, 7]),
                planYtd: `${item.targetNumber}.00%`,
                actualYtd,
            };
        }

        return {
            ...item,
            hasManualQuarterActual,
            ...calculateSummary(item.values, activeMonthCount),
        };
    });
}

/* ============================================================
   MAN HOURS & KILOMETER PERFORMANCE
============================================================ */

function buildManHourRows(reports, activeMonthCount = 12, masterKpiTargets = []) {
    // Dynamic monthly plans matching official Excel (Month indices: Jan=0, Feb=1, Mar=2, Apr=3, May=4, Jun=5, Jul=6, Aug=7, Sep=8, Oct=9, Nov=10, Dec=11)
    const defaultPremisesMonthly = [17360, 16800, 17360, 17360, 17360, 17360, 16800, 17360, 15680, 15680, 17360, 16800];
    const defaultNonPremisesMonthly = [304, 304, 368, 336, 336, 368, 320, 352, 320, 320, 320, 320];

    const dbPremises = masterKpiTargets?.find(t => t.category === "man_hours" && String(t.indicator_name).toUpperCase().includes("MANHOURS PREMISES") && !String(t.indicator_name).toUpperCase().includes("NON"));
    const premisesMonthly = (dbPremises && Array.isArray(dbPremises.monthly_plans) && dbPremises.monthly_plans.length === 12)
        ? dbPremises.monthly_plans
        : defaultPremisesMonthly;

    const dbNonPremises = masterKpiTargets?.find(t => t.category === "man_hours" && String(t.indicator_name).toUpperCase().includes("NON PREMISES"));
    const nonPremisesMonthly = (dbNonPremises && Array.isArray(dbNonPremises.monthly_plans) && dbNonPremises.monthly_plans.length === 12)
        ? dbNonPremises.monthly_plans
        : defaultNonPremisesMonthly;

    const configs = [
        {
            no: "2.1",
            name: "MANHOURS PREMISES",
            definition: "Total per bulan",
            unit: "Hours",
            target: 17360,
            monthlyPlans: premisesMonthly,
            planQ4: 48720,
            planQ1: 50960,
            planQ2: 52080,
            planQ3: 51520,
            planYtd: 203280,
            notes: "",
            plan: (item) => number(item?.premises_plan),
            actual: (item) => number(item?.premises_actual),
        },
        {
            no: "2.2",
            name: "MANHOURS NON PREMISES",
            definition: "Total per bulan",
            unit: "Hours",
            target: 320,
            monthlyPlans: nonPremisesMonthly,
            planQ4: 960,
            planQ1: 928,
            planQ2: 1040,
            planQ3: 1040,
            planYtd: 3968,
            notes: "",
            plan: (item) => number(item?.non_premises_plan),
            actual: (item) => number(item?.non_premises_actual),
        },
        {
            no: "2.3",
            name: "JML KARYAWAN CCPM",
            definition: "CCPM",
            unit: "Person",
            target: 72,
            monthlyPlans: Array(12).fill(72),
            planQ4: 72,
            planQ1: 72,
            planQ2: 72,
            planQ3: 72,
            planYtd: 72,
            isCountMetric: true,
            notes: "",
            plan: (item) => number(item?.total_employees),
            actual: (item) => number(item?.total_employees),
        },
        {
            no: "2.4",
            name: "KILOMETER DRIVEN PREMISES",
            definition: "Total per bulan",
            unit: "KM",
            target: 9850,
            monthlyPlans: Array(12).fill(9850),
            planQ4: 29551,
            planQ1: 29551,
            planQ2: 29551,
            planQ3: 29551,
            planYtd: 118204,
            notes: "",
            plan: (item) => number(item?.kilometer_premises_plan),
            actual: (item) => number(item?.kilometer_premises_actual),
        },
        {
            no: "2.5",
            name: "KILOMETER DRIVEN NON PREMISES",
            definition: "Total per bulan",
            unit: "KM",
            target: 3831,
            monthlyPlans: Array(12).fill(3831),
            planQ4: 11492,
            planQ1: 11492,
            planQ2: 11492,
            planQ3: 11492,
            planYtd: 45968,
            notes: "",
            plan: (item) => number(item?.kilometer_non_premises_plan),
            actual: (item) => number(item?.kilometer_non_premises_actual),
        },
        {
            no: "2.6",
            name: "JUMLAH UNIT CCPM",
            definition: "CCPM",
            unit: "Unit",
            target: 9,
            monthlyPlans: Array(12).fill(9),
            planQ4: 9,
            planQ1: 9,
            planQ2: 9,
            planQ3: 9,
            planYtd: 9,
            isCountMetric: true,
            notes: "Unit Ops : sesuai kontrak (Foco 2 unit, Crane 1 unit, Bus 1 unit, Vacuum 1 unit, tandem 1 unit, LV 2 unit, Dozer 1 Unit, Lowbed 1 unit)",
            plan: () => 9,
            actual: (item) => number(item?.total_vehicles),
        },
    ];

    const rows = configs.map((config) => {
        const values = createValueObject();
        const hasManualActual = Array(12).fill(false);

        for (let m = 0; m < 12; m++) {
            values.plan[m] = config.monthlyPlans?.[m] ?? config.target;
        }

        reports.forEach((report) => {
            const month = getMonthFromReport(report);

            const manHours =
                (Array.isArray(report.manHours)
                    ? report.manHours[0]
                    : report.manHours) ||
                (Array.isArray(report.man_hours)
                    ? report.man_hours[0]
                    : report.man_hours) ||
                null;

            if (!manHours) return;

            const p = config.plan(manHours);
            if (p > 0 && !config.monthlyPlans) {
                values.plan[month] = p;
            }
            const a = config.actual(manHours);
            if (a !== null && a !== undefined && a !== "" && Number(a) > 0) {
                values.actual[month] = Number(a);
                hasManualActual[month] = true;
            }
        });

        // Fallback default: if user hasn't input manual actual, copy plan to actual!
        for (let m = 0; m < 12; m++) {
            if (!hasManualActual[m]) {
                values.actual[m] = values.plan[m];
            }
        }

        const qIndices = {
            Q4: [8, 9, 10],
            Q1: [11, 0, 1],
            Q2: [2, 3, 4],
            Q3: [5, 6, 7],
        };

        const hasManualQuarterActual = {
            Q4: qIndices.Q4.some((idx) => hasManualActual[idx]),
            Q1: qIndices.Q1.some((idx) => hasManualActual[idx]),
            Q2: qIndices.Q2.some((idx) => hasManualActual[idx]),
            Q3: qIndices.Q3.some((idx) => hasManualActual[idx]),
            YTD: hasManualActual.some(Boolean),
        };

        const sumMonths = (indices) => {
            return indices
                .filter((idx) => idx < activeMonthCount)
                .reduce((sum, idx) => sum + number(values.actual[idx]), 0);
        };

        const countLast = (indices, defVal) => {
            const valid = indices.filter((idx) => idx < activeMonthCount);
            for (let i = valid.length - 1; i >= 0; i--) {
                const val = values.actual[valid[i]];
                if (val > 0) return val;
            }
            return defVal;
        };

        let actualQ4, actualQ1, actualQ2, actualQ3, actualYtd;

        if (config.isCountMetric) {
            actualQ4 = hasManualQuarterActual.Q4 ? countLast([8, 9, 10], config.target) : config.planQ4;
            actualQ1 = hasManualQuarterActual.Q1 ? countLast([11, 0, 1], config.target) : config.planQ1;
            actualQ2 = hasManualQuarterActual.Q2 ? countLast([2, 3, 4], config.target) : config.planQ2;
            actualQ3 = hasManualQuarterActual.Q3 ? countLast([5, 6, 7], config.target) : config.planQ3;
            actualYtd = hasManualQuarterActual.YTD ? countLast(Array.from({ length: 12 }, (_, i) => i), config.target) : config.planYtd;
        } else {
            actualQ4 = hasManualQuarterActual.Q4 ? sumMonths([8, 9, 10]) : config.planQ4;
            actualQ1 = hasManualQuarterActual.Q1 ? sumMonths([11, 0, 1]) : config.planQ1;
            actualQ2 = hasManualQuarterActual.Q2 ? sumMonths([2, 3, 4]) : config.planQ2;
            actualQ3 = hasManualQuarterActual.Q3 ? sumMonths([5, 6, 7]) : config.planQ3;
            actualYtd = hasManualQuarterActual.YTD ? (actualQ4 + actualQ1 + actualQ2 + actualQ3) : config.planYtd;
        }

        return {
            no: config.no,
            indicator: config.name,
            definition: config.definition,
            unit: config.unit,
            target: config.target,
            values,
            hasManualActual,
            hasManualQuarterActual,
            notes: config.notes,
            planQ4: config.planQ4,
            actualQ4,
            planQ1: config.planQ1,
            actualQ1,
            planQ2: config.planQ2,
            actualQ2,
            planQ3: config.planQ3,
            actualQ3,
            planYtd: config.planYtd,
            actualYtd,
        };
    });

    // TOTAL JAM KERJA / MAN HOURS (Total) = 2.1 + 2.2
    const totalManHoursValues = createValueObject();
    const totalManHoursHasManual = Array(12).fill(false);
    for (let i = 0; i < 12; i++) {
        totalManHoursHasManual[i] = rows[0].hasManualActual[i] || rows[1].hasManualActual[i];
        totalManHoursValues.plan[i] =
            rows[0].values.plan[i] + rows[1].values.plan[i];
        totalManHoursValues.actual[i] =
            rows[0].values.actual[i] + rows[1].values.actual[i];
    }
    const totalManHoursQuarterHasManual = {
        Q4: rows[0].hasManualQuarterActual.Q4 || rows[1].hasManualQuarterActual.Q4,
        Q1: rows[0].hasManualQuarterActual.Q1 || rows[1].hasManualQuarterActual.Q1,
        Q2: rows[0].hasManualQuarterActual.Q2 || rows[1].hasManualQuarterActual.Q2,
        Q3: rows[0].hasManualQuarterActual.Q3 || rows[1].hasManualQuarterActual.Q3,
        YTD: rows[0].hasManualQuarterActual.YTD || rows[1].hasManualQuarterActual.YTD,
    };
    const totalManHoursRow = {
        no: "",
        isTotalHeader: true,
        indicator: "JAM KERJA / MAN HOURS (Total)",
        definition: "Total per bulan",
        unit: "Hours",
        target: 17680,
        values: totalManHoursValues,
        hasManualActual: totalManHoursHasManual,
        hasManualQuarterActual: totalManHoursQuarterHasManual,
        notes: "Ops : Dihitung Jml orang / kru",
        planQ4: 49680,
        actualQ4: totalManHoursQuarterHasManual.Q4 ? (rows[0].actualQ4 + rows[1].actualQ4) : 49680,
        planQ1: 51888,
        actualQ1: totalManHoursQuarterHasManual.Q1 ? (rows[0].actualQ1 + rows[1].actualQ1) : 51888,
        planQ2: 53120,
        actualQ2: totalManHoursQuarterHasManual.Q2 ? (rows[0].actualQ2 + rows[1].actualQ2) : 53120,
        planQ3: 52560,
        actualQ3: totalManHoursQuarterHasManual.Q3 ? (rows[0].actualQ3 + rows[1].actualQ3) : 52560,
        planYtd: 207248,
        actualYtd: totalManHoursQuarterHasManual.YTD ? (rows[0].actualYtd + rows[1].actualYtd) : 207248,
    };

    // Sub-row under 2.3: Ops : Support :
    const subEmployeesRow = {
        no: "",
        parentNo: "2.3",
        isSubItem: true,
        isOpsSupportSubRow: true,
        indicator: "Ops : Support :",
        definition: "",
        unit: "Person",
        targetOps: 70,
        targetSupport: 2,
        target: "70 | 2",
        notes: "",
        valuesOps: {
            plan: Array(12).fill(70),
            actual: Array(12).fill(70),
        },
        valuesSupport: {
            plan: Array(12).fill(2),
            actual: Array(12).fill(2),
        },
        planOpsQ4: 70, actualOpsQ4: 70, planSupportQ4: 2, actualSupportQ4: 2,
        planOpsQ1: 70, actualOpsQ1: 70, planSupportQ1: 2, actualSupportQ1: 2,
        planOpsQ2: 70, actualOpsQ2: 70, planSupportQ2: 2, actualSupportQ2: 2,
        planOpsQ3: 70, actualOpsQ3: 70, planSupportQ3: 2, actualSupportQ3: 2,
        planOpsYtd: 70, actualOpsYtd: 70, planSupportYtd: 2, actualSupportYtd: 2,
    };

    // TOTAL KILOMETER DRIVEN (Total) = 2.4 + 2.5
    const totalKilometerValues = createValueObject();
    const totalKmHasManual = Array(12).fill(false);
    for (let i = 0; i < 12; i++) {
        totalKmHasManual[i] = rows[3].hasManualActual[i] || rows[4].hasManualActual[i];
        totalKilometerValues.plan[i] =
            rows[3].values.plan[i] + rows[4].values.plan[i];
        totalKilometerValues.actual[i] =
            rows[3].values.actual[i] + rows[4].values.actual[i];
    }
    const totalKmQuarterHasManual = {
        Q4: rows[3].hasManualQuarterActual.Q4 || rows[4].hasManualQuarterActual.Q4,
        Q1: rows[3].hasManualQuarterActual.Q1 || rows[4].hasManualQuarterActual.Q1,
        Q2: rows[3].hasManualQuarterActual.Q2 || rows[4].hasManualQuarterActual.Q2,
        Q3: rows[3].hasManualQuarterActual.Q3 || rows[4].hasManualQuarterActual.Q3,
        YTD: rows[3].hasManualQuarterActual.YTD || rows[4].hasManualQuarterActual.YTD,
    };
    const totalKilometerRow = {
        no: "",
        isTotalHeader: true,
        indicator: "KILOMETER DRIVEN (Total)",
        definition: "Total per bulan",
        unit: "KM",
        target: 13681,
        values: totalKilometerValues,
        hasManualActual: totalKmHasManual,
        hasManualQuarterActual: totalKmQuarterHasManual,
        notes: "Unit Ops : sesuai kontrak (Foco 2 unit, Crane 1 unit, Bus 1 unit, Vacuum 1 unit, tandem 1 unit, LV 2 unit, Dozer 1 Unit, Lowbed 1 unit)",
        planQ4: 41043,
        actualQ4: totalKmQuarterHasManual.Q4 ? (rows[3].actualQ4 + rows[4].actualQ4) : 41043,
        planQ1: 41043,
        actualQ1: totalKmQuarterHasManual.Q1 ? (rows[3].actualQ1 + rows[4].actualQ1) : 41043,
        planQ2: 41043,
        actualQ2: totalKmQuarterHasManual.Q2 ? (rows[3].actualQ2 + rows[4].actualQ2) : 41043,
        planQ3: 41043,
        actualQ3: totalKmQuarterHasManual.Q3 ? (rows[3].actualQ3 + rows[4].actualQ3) : 41043,
        planYtd: 164172,
        actualYtd: totalKmQuarterHasManual.YTD ? (rows[3].actualYtd + rows[4].actualYtd) : 164172,
    };

    // Sub-row under 2.6: Ops : Support :
    const subVehiclesRow = {
        no: "",
        parentNo: "2.6",
        isSubItem: true,
        isOpsSupportSubRow: true,
        indicator: "Ops : Support :",
        definition: "",
        unit: "Unit",
        targetOps: 8,
        targetSupport: 1,
        target: "8 | 1",
        notes: "",
        valuesOps: {
            plan: Array(12).fill(8),
            actual: Array(12).fill(8),
        },
        valuesSupport: {
            plan: Array(12).fill(1),
            actual: Array(12).fill(1),
        },
        planOpsQ4: 8, actualOpsQ4: 8, planSupportQ4: 1, actualSupportQ4: 1,
        planOpsQ1: 8, actualOpsQ1: 8, planSupportQ1: 1, actualSupportQ1: 1,
        planOpsQ2: 8, actualOpsQ2: 8, planSupportQ2: 1, actualSupportQ2: 1,
        planOpsQ3: 8, actualOpsQ3: 8, planSupportQ3: 1, actualSupportQ3: 1,
        planOpsYtd: 8, actualOpsYtd: 8, planSupportYtd: 1, actualSupportYtd: 1,
    };

    // Update sub rows actuals if reports exist
    const subEmployeesHasManual = Array(12).fill(false);
    const subVehiclesHasManual = Array(12).fill(false);

    reports.forEach((report) => {
        const month = getMonthFromReport(report);
        const manHours =
            (Array.isArray(report.manHours) ? report.manHours[0] : report.manHours) ||
            (Array.isArray(report.man_hours) ? report.man_hours[0] : report.man_hours) ||
            null;
        if (!manHours) return;

        const totalEmp = number(manHours.total_employees);
        if (totalEmp > 0) {
            const ops = totalEmp === 72 ? 70 : (totalEmp > 2 ? totalEmp - 2 : totalEmp);
            const supp = totalEmp === 72 ? 2 : (totalEmp > 2 ? 2 : 0);
            subEmployeesRow.valuesOps.actual[month] = ops;
            subEmployeesRow.valuesSupport.actual[month] = supp;
            subEmployeesHasManual[month] = true;
        }

        const totalVeh = number(manHours.total_vehicles);
        if (totalVeh > 0) {
            const ops = totalVeh === 9 ? 8 : (totalVeh > 1 ? totalVeh - 1 : totalVeh);
            const supp = totalVeh === 9 ? 1 : (totalVeh > 1 ? 1 : 0);
            subVehiclesRow.valuesOps.actual[month] = ops;
            subVehiclesRow.valuesSupport.actual[month] = supp;
            subVehiclesHasManual[month] = true;
        }
    });

    const setQuarterCounts = (subRow, hasManualArr) => {
        const qIndices = {
            Q4: [8, 9, 10],
            Q1: [11, 0, 1],
            Q2: [2, 3, 4],
            Q3: [5, 6, 7],
        };
        const hasManualQuarter = {
            Q4: qIndices.Q4.some((idx) => hasManualArr[idx]),
            Q1: qIndices.Q1.some((idx) => hasManualArr[idx]),
            Q2: qIndices.Q2.some((idx) => hasManualArr[idx]),
            Q3: qIndices.Q3.some((idx) => hasManualArr[idx]),
            YTD: hasManualArr.some(Boolean),
        };
        subRow.hasManualActual = hasManualArr;
        subRow.hasManualQuarterActual = hasManualQuarter;

        const countSubLast = (indices, field, defVal) => {
            const valid = indices.filter((idx) => idx < activeMonthCount);
            for (let i = valid.length - 1; i >= 0; i--) {
                const val = subRow[field].actual[valid[i]];
                if (val > 0) return val;
            }
            return defVal;
        };
        ["Q4", "Q1", "Q2", "Q3"].forEach((q) => {
            subRow[`actualOps${q}`] = countSubLast(qIndices[q], "valuesOps", subRow.targetOps);
            subRow[`actualSupport${q}`] = countSubLast(qIndices[q], "valuesSupport", subRow.targetSupport);
        });
        subRow.actualOpsYtd = countSubLast(Array.from({ length: 12 }, (_, i) => i), "valuesOps", subRow.targetOps);
        subRow.actualSupportYtd = countSubLast(Array.from({ length: 12 }, (_, i) => i), "valuesSupport", subRow.targetSupport);
    };
    setQuarterCounts(subEmployeesRow, subEmployeesHasManual);
    setQuarterCounts(subVehiclesRow, subVehiclesHasManual);

    return [
        totalManHoursRow,
        rows[0], // 2.1 MANHOURS PREMISES
        rows[1], // 2.2 MANHOURS NON PREMISES
        rows[2], // 2.3 JML KARYAWAN CCPM
        subEmployeesRow, // Ops : Support :
        totalKilometerRow,
        rows[3], // 2.4 KILOMETER DRIVEN PREMISES
        rows[4], // 2.5 KILOMETER DRIVEN NON PREMISES
        rows[5], // 2.6 JUMLAH UNIT CCPM
        subVehiclesRow, // Ops : Support :
    ];
}

/* ============================================================
   OPS PERFORMANCE
============================================================ */

const OPS_MASTER = [
    {
        no: "3.1",
        name: "REALIBILITY",
        definition: "Persentase / Bulan",
        unit: "%",
        target: "99.00%",
        targetNumber: 99,
        notes: "Merujuk target Kebijakan Mutu",
        defaultPlan: "99.00%",
        isPercentage: true,
    },
    {
        no: "3.2",
        name: "AVAILIBILITY",
        definition: "Persentase / Bulan",
        unit: "%",
        target: "98.00%",
        targetNumber: 98,
        notes: "Merujuk target Kebijakan Mutu",
        defaultPlan: "98.00%",
        isPercentage: true,
    },
    {
        no: "3.3",
        name: "UTILIZATION",
        definition: "Persentase / Bulan",
        unit: "%",
        target: "90.00%",
        targetNumber: 90,
        notes: "Merujuk target Kebijakan Mutu",
        defaultPlan: "90.00%",
        isPercentage: true,
    },
    {
        no: "3.4",
        name: "NPT TIDAK MELEBIHI BATASAN",
        definition: "Merujuk batasan NPT Pelanggan",
        unit: "Jam",
        target: "< 16 Jam /Rig / Bulan",
        notes: "Merujuk batasan NPT Pelanggan",
        defaultPlan: "< 16 Jam /Rig / Bulan",
        isText: true,
    },
];

function buildOpsRows(reports, activeMonthCount = 12, masterKpiTargets = []) {
    return OPS_MASTER.map((config) => {
        const values = createValueObject();
        const hasManualActual = Array(12).fill(false);

        const dbTarget = masterKpiTargets?.find(
            (t) =>
                t.category === "ops" &&
                ((config.no === "3.1" && String(t.indicator_name).toLowerCase().includes("reliability")) ||
                    (config.no === "3.2" && String(t.indicator_name).toLowerCase().includes("availability")) ||
                    (config.no === "3.3" && String(t.indicator_name).toLowerCase().includes("utilization")) ||
                    (config.no === "3.4" && String(t.indicator_name).toLowerCase().includes("npt")))
        );

        if (config.isPercentage) {
            for (let i = 0; i < 12; i++) {
                values.plan[i] = dbTarget?.monthly_plans?.[i] ?? `${config.targetNumber}.00%`;
                values.actual[i] = values.plan[i]; // default fallback
            }
        } else if (config.isText) {
            for (let i = 0; i < 12; i++) {
                values.plan[i] = dbTarget?.monthly_plans?.[i] ?? "< 16 Jam /Rig / Bulan";
                values.actual[i] = "< 16 Jam /Rig / Bulan";
            }
        }

        reports.forEach((report) => {
            const indicators = [
                ...(report.laggingIndicators || []),
                ...(report.leadingIndicators || []),
            ];

            indicators.forEach((item) => {
                const name = String(
                    item.indicator_name || item.name || "",
                ).toLowerCase();

                let isMatch = false;

                if (
                    config.no === "3.1" &&
                    (name.includes("reliability") ||
                        name.includes("reability") ||
                        name.includes("realibility"))
                ) {
                    isMatch = true;
                } else if (
                    config.no === "3.2" &&
                    (name.includes("availability") ||
                        name.includes("availibility"))
                ) {
                    isMatch = true;
                } else if (
                    config.no === "3.3" &&
                    name.includes("utilization")
                ) {
                    isMatch = true;
                } else if (
                    config.no === "3.4" &&
                    (name.includes("npt") ||
                        name.includes("tidak melebihi batasan"))
                ) {
                    isMatch = true;
                }

                if (!isMatch) return;

                const month =
                    Number(item.month) >= 1 && Number(item.month) <= 12
                        ? Number(item.month) - 1
                        : getMonthFromReport(report);

                if (
                    item.plan !== undefined &&
                    item.plan !== null &&
                    item.plan !== ""
                ) {
                    values.plan[month] = item.plan;
                }

                if (
                    item.actual !== undefined &&
                    item.actual !== null &&
                    item.actual !== ""
                ) {
                    values.actual[month] = item.actual;
                    hasManualActual[month] = true;
                }
            });
        });

        const qIndices = {
            Q4: [8, 9, 10],
            Q1: [11, 0, 1],
            Q2: [2, 3, 4],
            Q3: [5, 6, 7],
        };
        const hasManualQuarterActual = {
            Q4: qIndices.Q4.some((idx) => hasManualActual[idx]),
            Q1: qIndices.Q1.some((idx) => hasManualActual[idx]),
            Q2: qIndices.Q2.some((idx) => hasManualActual[idx]),
            Q3: qIndices.Q3.some((idx) => hasManualActual[idx]),
            YTD: hasManualActual.some(Boolean),
        };

        if (config.isPercentage) {
            const calcQuarterActual = (monthIndices) => {
                const valid = monthIndices.filter((idx) => idx < activeMonthCount && hasManualActual[idx]);
                if (valid.length === 0) return `${config.targetNumber}.00%`;
                const avg = valid.reduce((a, idx) => a + number(values.actual[idx]), 0) / valid.length;
                return `${avg.toFixed(2)}%`;
            };

            const manualYtd = Array.from({ length: activeMonthCount }, (_, i) => i).filter((idx) => hasManualActual[idx]);
            const actualYtd = manualYtd.length === 0
                ? `${config.targetNumber}.00%`
                : `${(manualYtd.reduce((a, idx) => a + number(values.actual[idx]), 0) / manualYtd.length).toFixed(2)}%`;

            const pQ = config.no === "3.1" ? { q4: "99.00%", q1: "99%", q2: "99.00%", q3: "99.00%" }
                     : config.no === "3.2" ? { q4: "98.00%", q1: "98%", q2: "98.00%", q3: "98.00%" }
                     : { q4: "90.00%", q1: "90%", q2: "90.00%", q3: "90.00%" };

            return {
                no: config.no,
                indicator: config.name,
                definition: config.definition,
                unit: config.unit,
                target: config.target,
                notes: config.notes,
                isPercentage: true,
                values,
                hasManualActual,
                hasManualQuarterActual,
                planQ4: pQ.q4,
                actualQ4: hasManualQuarterActual.Q4 ? calcQuarterActual([8, 9, 10]) : pQ.q4,
                planQ1: pQ.q1,
                actualQ1: hasManualQuarterActual.Q1 ? calcQuarterActual([11, 0, 1]) : pQ.q1,
                planQ2: pQ.q2,
                actualQ2: hasManualQuarterActual.Q2 ? calcQuarterActual([2, 3, 4]) : pQ.q2,
                planQ3: pQ.q3,
                actualQ3: hasManualQuarterActual.Q3 ? calcQuarterActual([5, 6, 7]) : pQ.q3,
                planYtd: `${config.targetNumber}.00%`,
                actualYtd,
            };
        }

        if (config.isText) {
            return {
                no: config.no,
                indicator: config.name,
                definition: config.definition,
                unit: config.unit,
                target: config.target,
                notes: config.notes,
                isText: true,
                values,
                hasManualActual,
                hasManualQuarterActual,
                planQ4: "< 16 Jam /Rig / Bulan",
                actualQ4: "< 16 Jam /Rig / Bulan",
                planQ1: "< 16 Jam /Rig / Bulan",
                actualQ1: "< 16 Jam /Rig / Bulan",
                planQ2: "< 16 Jam /Rig / Bulan",
                actualQ2: "< 16 Jam /Rig / Bulan",
                planQ3: "< 16 Jam /Rig / Bulan",
                actualQ3: "< 16 Jam /Rig / Bulan",
                planYtd: "< 16 Jam /Rig / Bulan",
                actualYtd: "< 16 Jam /Rig / Bulan",
            };
        }

        return {
            no: config.no,
            indicator: config.name,
            definition: config.definition,
            unit: config.unit,
            target: config.target,
            notes: config.notes,
            values,
            hasManualActual,
            hasManualQuarterActual,
            ...calculateSummary(values, activeMonthCount),
        };
    });
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function Reports() {
    const { reports: rawReports = [], masterKpiTargets = [] } = usePage().props;

    const reports = useMemo(
        () =>
            Array.isArray(rawReports) ? rawReports.map(normalizeReport) : [],
        [rawReports],
    );

    /* ========================================================
       FILTER
    ======================================================== */

    const availableYears = useMemo(() => {
        const list = [
            ...new Set(reports.map((report) => getReportYear(report))),
        ].filter(Boolean);
        if (!list.includes(2027)) list.push(2027);
        return list.sort((a, b) => b - a);
    }, [reports]);

    const ALL_MASTER_RIGS = Array.from(new Set([
        ...ALL_RIG_NAMES,
        "BMS#01", "BMS#02", "BMS#03", "BMS#03A", "BMS#05",
        "BMS#06", "BMS#07", "BMS#08", "BMS#09", "BMS#10",
        "BMS#11", "BMS#15", "BMS#16", "BMS#17", "BMS#18",
        "BMS#19", "BMS#20", "BMS#21", "BMS#22", "BMS#23"
    ]));

    const availableProjects = useMemo(() => {
        return ALL_CONTRACTS;
    }, []);

    const [project, setProject] = useState("All Projects");

    const currentContractGroup = useMemo(() => {
        if (!project || project === "All Projects") return null;
        return CONTRACT_RIG_GROUPS.find((g) => g.contractNo === project) || null;
    }, [project]);

    const availableRigs = useMemo(() => {
        if (project && project !== "All Projects") {
            const rigsInContract = getRigsByContract(project);
            if (rigsInContract && rigsInContract.length > 0) {
                return rigsInContract;
            }
        }
        const set = new Set(ALL_MASTER_RIGS);
        reports.forEach((r) => {
            if (r.rig_no) set.add(r.rig_no);
        });
        return Array.from(set);
    }, [reports, project]);

    const availableLocations = useMemo(() => {
        const set = new Set(ALL_AREAS);
        reports.forEach((report) => {
            if (report.location_district) set.add(report.location_district);
        });
        return Array.from(set);
    }, [reports]);

    const defaultYear =
        availableYears.length > 0
            ? String(availableYears[0])
            : "2027";

    const [reportType, setReportType] = useState("HSE Performance");

    const [period, setPeriod] = useState("Annual");

    const [year, setYear] = useState(defaultYear);

    const [rig, setRig] = useState("All Rigs");

    const [location, setLocation] = useState("All Locations");

    const [reportDate, setReportDate] = useState("All Dates");

    const [preview, setPreview] = useState(false);

    const handleContractChange = (newContract) => {
        setProject(newContract);
        setRig("All Rigs");
        if (newContract && newContract !== "All Projects") {
            const group = CONTRACT_RIG_GROUPS.find((g) => g.contractNo === newContract);
            if (group?.area) {
                setLocation(group.area);
            }
        } else {
            setLocation("All Locations");
        }
    };

    const [exporting, setExporting] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    const availableDates = useMemo(() => {
        return [
            ...new Set(
                reports
                    .filter(
                        (report) =>
                            !year ||
                            year === "All" ||
                            String(getReportYear(report)) === String(year),
                    )
                    .map((report) => report.report_date)
                    .filter(Boolean),
            ),
        ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    }, [reports, year]);

    /* ========================================================
       CUTOFF MONTH FROM SELECTED REPORT DATE
    ======================================================== */

    const selectedCutoffMonth = useMemo(() => {
        if (reportDate === "All Dates") return -1;

        const selectedReport = reports.find(
            (r) => String(r.report_date) === String(reportDate),
        );

        if (selectedReport) {
            return getMonthFromReport(selectedReport);
        }

        const d = new Date(reportDate);
        if (!Number.isNaN(d.getTime())) {
            return d.getMonth();
        }

        return -1;
    }, [reportDate, reports]);

    /* ========================================================
       FILTERED REPORT
    ======================================================== */

    const filteredReports = useMemo(() => {
        let result = reports.filter(
            (report) => String(getReportYear(report)) === String(year),
        );

        if (rig !== "All Rigs") {
            const targetRig = String(rig).replace(/\s+/g, "").toUpperCase();
            result = result.filter((report) => {
                if (!report.rig_no) return false;
                if (report.rig_no === rig) return true;
                const normalizedRigs = String(report.rig_no)
                    .split(",")
                    .map((item) => item.replace(/\s+/g, "").toUpperCase());
                return normalizedRigs.includes(targetRig);
            });
        }

        if (project !== "All Projects") {
            const targetContract = String(project).trim().toUpperCase();
            result = result.filter(
                (report) =>
                    report.contract_no === project ||
                    String(report.contract_no || "").trim().toUpperCase() === targetContract,
            );
        }

        if (location !== "All Locations") {
            result = result.filter(
                (report) => report.location_district === location,
            );
        }

        if (selectedCutoffMonth >= 0) {
            result = result.filter(
                (report) => getMonthFromReport(report) <= selectedCutoffMonth,
            );
        }

        return result.sort((a, b) => {
            const dateA = new Date(
                a.report_date || a.issued_date || a.created_at || 0,
            );

            const dateB = new Date(
                b.report_date || b.issued_date || b.created_at || 0,
            );

            return dateB.getTime() - dateA.getTime();
        });
    }, [reports, year, rig, project, location, selectedCutoffMonth]);

    const latestMonthIndex = useMemo(() => {
        if (selectedCutoffMonth >= 0) {
            return selectedCutoffMonth;
        }

        let maxMonth = -1;
        filteredReports.forEach((r) => {
            const m = getMonthFromReport(r);
            if (m > maxMonth) {
                maxMonth = m;
            }
        });

        if (maxMonth >= 0) return maxMonth;

        const currentYear = new Date().getFullYear();
        if (String(year) === String(currentYear)) {
            return new Date().getMonth();
        } else if (Number(year) < currentYear) {
            return 11;
        }
        return 2;
    }, [filteredReports, selectedCutoffMonth, year]);

    const activeMonths = useMemo(() => {
        if (period === "Annual") {
            return MONTHS.map((name, index) => ({
                name,
                index,
            }));
        }

        const startMonth = Math.max(0, latestMonthIndex - 2);
        const list = [];
        for (let m = startMonth; m <= latestMonthIndex; m++) {
            list.push({
                name: MONTHS[m],
                index: m,
            });
        }
        return list;
    }, [period, latestMonthIndex]);

    /* ========================================================
       REPORT DATA
    ======================================================== */

    const lagging = useMemo(
        () => buildLaggingRows(filteredReports, latestMonthIndex + 1),
        [filteredReports, latestMonthIndex],
    );

    const manHours = useMemo(
        () => buildManHourRows(filteredReports, latestMonthIndex + 1, masterKpiTargets),
        [filteredReports, latestMonthIndex, masterKpiTargets],
    );

    const ops = useMemo(
        () => buildOpsRows(filteredReports, latestMonthIndex + 1, masterKpiTargets),
        [filteredReports, latestMonthIndex, masterKpiTargets],
    );

    const leading = useMemo(
        () => buildLeadingRows(filteredReports, latestMonthIndex + 1),
        [filteredReports, latestMonthIndex],
    );

    const latestReport = useMemo(() => {
        if (reportDate !== "All Dates") {
            const matched = filteredReports.find(
                (r) => String(r.report_date) === String(reportDate),
            );
            if (matched) return matched;
        }
        return filteredReports.length > 0 ? filteredReports[0] : null;
    }, [filteredReports, reportDate]);

    /* ========================================================
       RESET
    ======================================================== */

    const handleReset = () => {
        setReportType("HSE Performance");
        setPeriod("Annual");
        setYear(defaultYear);
        setRig("All Rigs");
        setProject("All Projects");
        setLocation("All Locations");
        setReportDate("All Dates");
        setPreview(false);
    };

    /* ========================================================
       EXCEL STYLE
    ======================================================== */

    function applyCellStyle(cell, options = {}) {
        cell.font = {
            name: "Arial",
            size: options.size || 9,
            bold: options.bold || false,
            color: options.color || "000000",
        };

        cell.alignment = {
            vertical: options.vertical || "middle",
            horizontal: options.horizontal || "center",
            wrapText: options.wrapText !== false,
        };

        if (options.fill) {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                    argb: options.fill,
                },
            };
        }

        cell.border = {
            top: {
                style: "thin",
                color: {
                    argb: options.borderColor || "222222",
                },
            },
            bottom: {
                style: "thin",
                color: {
                    argb: options.borderColor || "222222",
                },
            },
            left: {
                style: "thin",
                color: {
                    argb: options.borderColor || "222222",
                },
            },
            right: {
                style: "thin",
                color: {
                    argb: options.borderColor || "222222",
                },
            },
        };
    }

    /* ========================================================
       EXCEL HEADER
    ======================================================== */

    function buildExcelHeader(ws) {
        ws.mergeCells("A1:AM1");

        ws.getCell("A1").value =
            `KEY PERFORMANCE INDICATOR (HSE) - PT BESMINDO MATERI SEWATAMA (BMSD/03/FO/HSE/02/17 Rev: #12)`;

        applyCellStyle(ws.getCell("A1"), {
            size: 15,
            bold: true,
            color: "FFFFFF",
            fill: "075E45",
        });

        ws.getRow(1).height = 30;

        ws.mergeCells("A2:J2");
        ws.getCell("A2").value = `Tahun Periode : ${year}`;

        ws.mergeCells("K2:S2");

        const issuedDate =
            latestReport?.report_date || latestReport?.issued_date;

        ws.getCell("K2").value = `Tgl Diterbitkan / Rev. : ${
            issuedDate ? formatDate(issuedDate) : "-"
        } / Rev.${latestReport?.revision_no ?? "00"}`;

        ws.mergeCells("T2:AG2");

        ws.getCell("T2").value = `Fokus Corp / Project : ${
            project === "All Projects"
                ? latestReport?.contract_no || "-"
                : project
        }`;

        ws.mergeCells("A3:J3");
        ws.getCell("A3").value = `Periode : ${period}`;

        ws.mergeCells("K3:S3");
        ws.getCell("K3").value = `Rig / Location : ${
            rig === "All Rigs" ? "All Rigs" : rig
        }`;

        ws.mergeCells("T3:AG3");
        ws.getCell("T3").value = `Lokasi / Distrik : ${
            location === "All Locations"
                ? latestReport?.location_district || "-"
                : location
        }`;

        ws.mergeCells("A4:AG4");
        ws.getCell("A4").value = "REFERENSI PROGRAM";

        ws.mergeCells("A5:AG5");
        ws.getCell("A5").value = latestReport?.program_reference || "-";

        for (let row = 2; row <= 5; row++) {
            ws.getRow(row).height = row === 5 ? 28 : 22;

            ws.getRow(row).eachCell((cell) => {
                applyCellStyle(cell, {
                    size: 9,
                    bold: row !== 5,
                    color: "064E3B",
                    fill:
                        row === 4 ? "EFFF00" : row === 5 ? "FAFFF0" : "F5FFD0",
                    horizontal: "left",
                });
            });
        }
    }

    /* ========================================================
       EXCEL LAGGING
    ======================================================== */

    function buildExcelLagging(ws, startRow) {
        let row = startRow;
        const totalCols = 72;

        ws.mergeCells(row, 1, row, totalCols);

        ws.getCell(row, 1).value = "LAGGING INDICATOR";

        applyCellStyle(ws.getCell(row, 1), {
            size: 14,
            bold: true,
            color: "000000",
            fill: "00FF20",
        });

        row++;

        /* 3-TIER HEADER */

        const header1 = row;
        const header2 = row + 1;
        const header3 = row + 2;

        ws.mergeCells(header1, 1, header3, 1);
        ws.mergeCells(header1, 2, header3, 2);
        ws.mergeCells(header1, 3, header3, 3);
        ws.mergeCells(header1, 4, header3, 4);

        ws.getCell(header1, 1).value = "POINT YANG DIUKUR";
        ws.getCell(header1, 2).value = "DEFINISI\n(FREQUENCY RATE / UNIT)";
        ws.getCell(header1, 3).value = "TARGET / ESTIMASI / MONTH";
        ws.getCell(header1, 4).value = "KETERANGAN";

        for (let col = 1; col <= 4; col++) {
            applyCellStyle(ws.getCell(header1, col), {
                bold: true,
                fill: "F1DDDC",
            });
        }

        const periodList = [
            "Q1",
            "Q2",
            "Q3",
            "Q4",
            "TOTAL KUMULATIF YTD",
            ...MONTHS.map((m) => `${m}-${String(year).slice(-2)}`),
        ];

        let col = 5;

        periodList.forEach((pTitle) => {
            // Header Row 1: Period Title (span 4 cols)
            ws.mergeCells(header1, col, header1, col + 3);
            ws.getCell(header1, col).value = pTitle;
            applyCellStyle(ws.getCell(header1, col), {
                bold: true,
                fill: "F1DDDC",
            });

            // Header Row 2: Plan (2 cols) & Actual (2 cols)
            ws.mergeCells(header2, col, header2, col + 1);
            ws.getCell(header2, col).value = "Plan";
            applyCellStyle(ws.getCell(header2, col), {
                bold: true,
                fill: "FFFF00",
            });

            ws.mergeCells(header2, col + 2, header2, col + 3);
            ws.getCell(header2, col + 2).value = "Actual";
            applyCellStyle(ws.getCell(header2, col + 2), {
                bold: true,
                fill: "FFFF00",
            });

            // Header Row 3: Case, FR under Plan; Case, FR under Actual
            ws.getCell(header3, col).value = "Case";
            ws.getCell(header3, col + 1).value = "FR";
            ws.getCell(header3, col + 2).value = "Case";
            ws.getCell(header3, col + 3).value = "FR";

            for (let c = col; c < col + 4; c++) {
                applyCellStyle(ws.getCell(header3, c), {
                    bold: true,
                    fill: "FFFF00",
                    size: 8,
                });
            }

            col += 4;
        });

        row = header3 + 1;

        /* SECTION 1 */

        ws.mergeCells(row, 1, row, totalCols);
        ws.getCell(row, 1).value = "1. HES PERFORMANCE";

        applyCellStyle(ws.getCell(row, 1), {
            bold: true,
            color: "000000",
            fill: "D9D9D9",
            horizontal: "left",
        });

        row++;

        lagging.forEach((item) => {
            const isTri = item.no === "1.5" || (item.indicator && item.indicator.includes("TOTAL RECORDABLE INJURY"));
            const isMvc = item.no === "1.6" || (item.indicator && item.indicator.includes("MOTOR VEHICLE CRASH"));
            const isCaseFr = isTri || isMvc || Boolean(item.isCaseFrCombo);
            const totalHours = manHours?.find((m) => m.indicator?.includes("JAM KERJA / MAN HOURS (Total)")) || (manHours && manHours.length > 0 ? manHours[0] : null);
            const totalKm = manHours?.find((m) => m.indicator?.includes("KILOMETER DRIVEN (Total)")) || (manHours && manHours.length > 5 ? manHours[5] : null);

            const targetDisplay = isCaseFr ? `Case: ${item.targetMonth || 0} | FR: ${item.targetFr || "0.00"}` : (item.target ?? 0);
            const baseCols = [
                `${item.no} ${item.indicator}`,
                item.definition || "",
                targetDisplay,
                item.notes || "",
            ];

            baseCols.forEach((val, idx) => {
                const cell = ws.getCell(row, idx + 1);
                cell.value = val;
                applyCellStyle(cell, {
                    size: 8,
                    bold: idx === 0 || idx === 1,
                    horizontal: idx === 1 ? "left" : "center",
                    fill: row % 2 === 0 ? "FFFFFF" : "F7F8EE",
                });
            });

            const is1_1to1_4 = ["1.1", "1.2", "1.3", "1.4"].includes(item.no);
            const is1_7to1_12 = !is1_1to1_4 && !isTri && !isMvc;

            const getLagQuad = (pCases, aCases, pHours = 0, aHours = 0, pKm = 0, aKm = 0, mIdx = null) => {
                const pc = Number(pCases) || 0;
                const ac = Number(aCases) || 0;
                let pFr = "-";
                let aFr = "-";

                if (is1_1to1_4) {
                    pFr = "-";
                    if (mIdx !== null && item.frequencyRate?.[mIdx] !== null && item.frequencyRate?.[mIdx] !== undefined) {
                        aFr = Number(item.frequencyRate[mIdx]).toFixed(2);
                    } else if (aHours > 0 && ac > 0) {
                        aFr = calcFrequencyRate(ac, aHours);
                    } else {
                        aFr = "-";
                    }
                } else if (is1_7to1_12) {
                    pFr = "NA";
                    if (mIdx !== null && item.frequencyRate?.[mIdx] !== null && item.frequencyRate?.[mIdx] !== undefined) {
                        aFr = Number(item.frequencyRate[mIdx]).toFixed(2);
                    } else {
                        aFr = "NA";
                    }
                } else if (isTri) {
                    pFr = pHours > 0 ? calcFrequencyRate(pc, pHours) : "0.00";
                    if (mIdx !== null && item.frequencyRate?.[mIdx] !== null && item.frequencyRate?.[mIdx] !== undefined) {
                        aFr = Number(item.frequencyRate[mIdx]).toFixed(2);
                    } else if (aHours > 0) {
                        aFr = calcFrequencyRate(ac, aHours);
                    } else {
                        aFr = "0.00";
                    }
                } else if (isMvc) {
                    pFr = pKm > 0 ? calcMvcFrequencyRate(pc, pKm) : "0.00";
                    if (mIdx !== null && item.frequencyRate?.[mIdx] !== null && item.frequencyRate?.[mIdx] !== undefined) {
                        aFr = Number(item.frequencyRate[mIdx]).toFixed(2);
                    } else if (aKm > 0) {
                        aFr = calcMvcFrequencyRate(ac, aKm);
                    } else {
                        aFr = "0.00";
                    }
                }

                return { pc, pFr, ac, aFr };
            };

            const periodsData = [
                getLagQuad(item.planQ1, item.actualQ1, Number(totalHours?.planQ1) || 0, Number(totalHours?.actualQ1) || 0, Number(totalKm?.planQ1) || 0, Number(totalKm?.actualQ1) || 0),
                getLagQuad(item.planQ2, item.actualQ2, Number(totalHours?.planQ2) || 0, Number(totalHours?.actualQ2) || 0, Number(totalKm?.planQ2) || 0, Number(totalKm?.actualQ2) || 0),
                getLagQuad(item.planQ3, item.actualQ3, Number(totalHours?.planQ3) || 0, Number(totalHours?.actualQ3) || 0, Number(totalKm?.planQ3) || 0, Number(totalKm?.actualQ3) || 0),
                getLagQuad(item.planQ4, item.actualQ4, Number(totalHours?.planQ4) || 0, Number(totalHours?.actualQ4) || 0, Number(totalKm?.planQ4) || 0, Number(totalKm?.actualQ4) || 0),
                getLagQuad(item.planYtd, item.actualYtd, Number(totalHours?.planYtd) || 0, Number(totalHours?.actualYtd) || 0, Number(totalKm?.planYtd) || 0, Number(totalKm?.actualYtd) || 0),
                ...MONTHS.map((_, idx) => {
                    const pHours = Number(totalHours?.values?.plan?.[idx]) || 0;
                    const aHours = Number(totalHours?.values?.actual?.[idx]) || 0;
                    const pKm = Number(totalKm?.values?.plan?.[idx]) || 0;
                    const aKm = Number(totalKm?.values?.actual?.[idx]) || 0;
                    return getLagQuad(item.values?.plan?.[idx], item.values?.actual?.[idx], pHours, aHours, pKm, aKm, idx);
                }),
            ];

            let col = 5;
            periodsData.forEach(({ pc, pFr, ac, aFr }) => {
                // 1. HES Performance (1.1-1.12) selalu mengisi 4 kolom: Plan Case, Plan FR, Actual Case, Actual FR
                if (true) {
                    const c1 = ws.getCell(row, col);
                    c1.value = pc;
                    applyCellStyle(c1, { size: 8, fill: row % 2 === 0 ? "FFFFFF" : "F7F8EE" });

                    const c2 = ws.getCell(row, col + 1);
                    c2.value = pFr;
                    applyCellStyle(c2, { size: 8, fill: row % 2 === 0 ? "FFFFFF" : "F7F8EE" });

                    const c3 = ws.getCell(row, col + 2);
                    c3.value = ac;
                    applyCellStyle(c3, { size: 8, fill: row % 2 === 0 ? "FFFFFF" : "F7F8EE" });

                    const c4 = ws.getCell(row, col + 3);
                    c4.value = aFr;
                    applyCellStyle(c4, { size: 8, fill: row % 2 === 0 ? "FFFFFF" : "F7F8EE" });
                } else {
                    ws.mergeCells(row, col, row, col + 1);
                    const pCell = ws.getCell(row, col);
                    pCell.value = pc;
                    applyCellStyle(pCell, { size: 8, fill: row % 2 === 0 ? "FFFFFF" : "F7F8EE" });

                    ws.mergeCells(row, col + 2, row, col + 3);
                    const aCell = ws.getCell(row, col + 2);
                    aCell.value = ac;
                    applyCellStyle(aCell, { size: 8, fill: row % 2 === 0 ? "FFFFFF" : "F7F8EE" });
                }
                col += 4;
            });

            row++;
        });

        /* SECTION 2 */

        ws.mergeCells(row, 1, row, totalCols);
        ws.getCell(row, 1).value = "2. MAN HOURS & KILOMETER PERFORMANCE";

        applyCellStyle(ws.getCell(row, 1), {
            bold: true,
            color: "000000",
            fill: "D9D9D9",
            horizontal: "left",
        });

        row++;

        const writeMetric = (item) => {
            const isHeader = item.isTotalHeader || (!item.no && !item.isOpsSupportSubRow);
            const isSub = Boolean(item.isOpsSupportSubRow);

            const formatForExcel = (val, isPlan = false) => {
                if (val === undefined || val === null || val === "") return "";
                if (typeof val === "string") return val;
                if (item?.isPercentage) {
                    if (isPlan && (val === 0 || val === "0") && item.targetNumber) {
                        return `${item.targetNumber}.00%`;
                    }
                    return `${Number(val).toFixed(2)}%`;
                }
                if (item?.isText) {
                    return "< 16 Jam /Rig / Bulan";
                }
                return val;
            };

            const baseCols = [
                item.no || "",
                isSub ? "   Ops :       Support :" : item.indicator,
                isSub ? `${item.targetOps} | ${item.targetSupport}` : (typeof item.target === "number" ? item.target : (item.target || "")),
                item.notes || "",
            ];

            baseCols.forEach((val, idx) => {
                const cell = ws.getCell(row, idx + 1);
                cell.value = val;
                applyCellStyle(cell, {
                    size: 8,
                    bold: isHeader || idx === 0 || idx === 1 || isSub,
                    horizontal: idx === 1 ? "left" : "center",
                    fill: isHeader ? "DDEBF7" : (row % 2 === 0 ? "FFFFFF" : "F7F8EE"),
                });
            });

            let col = 5;

            if (isSub) {
                const quarterNames = REPORT_QUARTERS;
                quarterNames.forEach((q) => {
                    const pOps = item[`planOps${q}`] ?? item.targetOps;
                    const pSupp = item[`planSupport${q}`] ?? item.targetSupport;
                    const aOps = item[`actualOps${q}`] ?? item.targetOps;
                    const aSupp = item[`actualSupport${q}`] ?? item.targetSupport;

                    [pOps, pSupp, aOps, aSupp].forEach((v, cIdx) => {
                        const cell = ws.getCell(row, col + cIdx);
                        cell.value = v;
                        applyCellStyle(cell, {
                            size: 8,
                            horizontal: "center",
                            fill: row % 2 === 0 ? "FFFFFF" : "F7F8EE",
                        });
                    });
                    col += 4;
                });

                // YTD
                [
                    item.planOpsYtd ?? item.targetOps,
                    item.planSupportYtd ?? item.targetSupport,
                    item.actualOpsYtd ?? item.targetOps,
                    item.actualSupportYtd ?? item.targetSupport,
                ].forEach((v, cIdx) => {
                    const cell = ws.getCell(row, col + cIdx);
                    cell.value = v;
                    applyCellStyle(cell, {
                        size: 8,
                        horizontal: "center",
                        fill: row % 2 === 0 ? "FFFFFF" : "F7F8EE",
                    });
                });
                col += 4;

                // 12 Months
                MONTHS.forEach((_, mIdx) => {
                    const pOps = item.valuesOps?.plan?.[mIdx] ?? item.targetOps;
                    const pSupp = item.valuesSupport?.plan?.[mIdx] ?? item.targetSupport;
                    const aOps = item.valuesOps?.actual?.[mIdx] ?? item.targetOps;
                    const aSupp = item.valuesSupport?.actual?.[mIdx] ?? item.targetSupport;

                    [pOps, pSupp, aOps, aSupp].forEach((v, cIdx) => {
                        const cell = ws.getCell(row, col + cIdx);
                        cell.value = v;
                        applyCellStyle(cell, {
                            size: 8,
                            horizontal: "center",
                            fill: row % 2 === 0 ? "FFFFFF" : "F7F8EE",
                        });
                    });
                    col += 4;
                });
            } else {
                const metricPeriods = [
                    ...REPORT_QUARTERS.map((q) => ({
                        pVal: formatForExcel(getQuarterValue(item, q, "Plan"), true),
                        aVal: formatForExcel(getQuarterValue(item, q, "Actual"), false),
                    })),
                    { pVal: formatForExcel(item.planYtd, true), aVal: formatForExcel(item.actualYtd, false) },
                    ...MONTHS.map((_, idx) => ({
                        pVal: formatForExcel(item.values?.plan?.[idx], true),
                        aVal: formatForExcel(item.values?.actual?.[idx], false),
                    })),
                ];

                metricPeriods.forEach(({ pVal, aVal }) => {
                    // Plan merged across 2 columns
                    ws.mergeCells(row, col, row, col + 1);
                    const pCell = ws.getCell(row, col);
                    pCell.value = pVal;
                    applyCellStyle(pCell, {
                        size: 8,
                        bold: isHeader,
                        horizontal: "center",
                        fill: isHeader ? "DDEBF7" : (row % 2 === 0 ? "FFFFFF" : "F7F8EE"),
                    });

                    // Actual merged across 2 columns
                    ws.mergeCells(row, col + 2, row, col + 3);
                    const aCell = ws.getCell(row, col + 2);
                    aCell.value = aVal;
                    applyCellStyle(aCell, {
                        size: 8,
                        bold: isHeader,
                        horizontal: "center",
                        fill: isHeader ? "DDEBF7" : (row % 2 === 0 ? "FFFFFF" : "F7F8EE"),
                    });

                    col += 4;
                });
            }

            row++;
        };

        manHours.forEach(writeMetric);

        /* SECTION 3 */

        ws.mergeCells(row, 1, row, totalCols);
        ws.getCell(row, 1).value = "3. OPS PERFORMANCE";

        applyCellStyle(ws.getCell(row, 1), {
            bold: true,
            color: "000000",
            fill: "D9D9D9",
            horizontal: "left",
        });

        row++;

        ops.forEach(writeMetric);

        return row + 1;
    }

    /* ========================================================
       EXCEL LEADING
    ======================================================== */

    function buildExcelLeading(ws, startRow) {
        let row = startRow;

        ws.mergeCells(row, 1, row, 39);

        ws.getCell(row, 1).value = "LEADING INDICATOR";

        applyCellStyle(ws.getCell(row, 1), {
            size: 14,
            bold: true,
            color: "000000",
            fill: "00FF20",
        });

        row++;

        const h1 = row;
        const h2 = row + 1;

        const leftHeaders = [
            "POINT YANG DIUKUR/",
            "DEFINISI\n(FREQUENCY RATE / UNIT)",
            "TARGET\n(month)",
            "TARGET\n(Year)",
            "DEFINISI\nFREQUENCY RATE / UNIT",
        ];

        leftHeaders.forEach((title, index) => {
            ws.mergeCells(h1, index + 1, h2, index + 1);

            ws.getCell(h1, index + 1).value = title;

            applyCellStyle(ws.getCell(h1, index + 1), {
                size: 8,
                bold: true,
                fill: "F1DDDC",
            });
        });

        let col = 6;

        REPORT_QUARTERS.forEach((q) => {
            ws.mergeCells(h1, col, h1, col + 1);

            ws.getCell(h1, col).value = q;

            ws.getCell(h2, col).value = "Plan";

            ws.getCell(h2, col + 1).value = "Actual";

            applyCellStyle(ws.getCell(h1, col), {
                bold: true,
                fill: "F1DDDC",
            });

            applyCellStyle(ws.getCell(h2, col), {
                bold: true,
                fill: "FFFF00",
            });

            applyCellStyle(ws.getCell(h2, col + 1), {
                bold: true,
                fill: "FFFF00",
            });

            col += 2;
        });

        ws.mergeCells(h1, col, h1, col + 1);

        ws.getCell(h1, col).value = "TOTAL KUMULATIF YTD";

        ws.getCell(h2, col).value = "Plan";

        ws.getCell(h2, col + 1).value = "Actual";

        applyCellStyle(ws.getCell(h1, col), {
            bold: true,
            fill: "F1DDDC",
        });

        applyCellStyle(ws.getCell(h2, col), {
            bold: true,
            fill: "FFFF00",
        });

        applyCellStyle(ws.getCell(h2, col + 1), {
            bold: true,
            fill: "FFFF00",
        });

        col += 2;

        ws.mergeCells(h1, col, h1, col + 23);

        ws.getCell(h1, col).value = `TARGET IMPLEMENTASI ${year}`;

        applyCellStyle(ws.getCell(h1, col), {
            size: 12,
            fill: "F1DDDC",
        });

        let monthCol = col;

        MONTHS.forEach((month) => {
            ws.mergeCells(h2, monthCol, h2, monthCol + 1);

            ws.getCell(h2, monthCol).value = `${month}-${String(year).slice(
                -2,
            )}`;

            applyCellStyle(ws.getCell(h2, monthCol), {
                size: 8,
                fill: "F1DDDC",
            });

            monthCol += 2;
        });

        row += 2;

        leading.forEach((item) => {
            if (item.isHeader) {
                const headerRow = [
                    `${item.no}. ${item.indicator}`,
                    "",
                    "",
                    "",
                    "",
                    ...Array(10 + MONTHS.length * 2).fill(""),
                ];
                ws.addRow(headerRow);
                applyCellStyle(ws.getCell(row, 1), {
                    bold: true,
                    fill: "E2E8F0",
                });
                row++;
                return;
            }

            const values = [
                item.parentNo ? `   ${item.no}. ${item.indicator}` : `${item.no}. ${item.indicator}`,
                item.definition || "",
                item.monthlyTarget,
                item.annualTarget,
                item.definition2 || item.notes || "",
                item.planQ1,
                item.actualQ1,
                item.planQ2,
                item.actualQ2,
                item.planQ3,
                item.actualQ3,
                item.planQ4,
                item.actualQ4,
                item.planYtd,
                item.actualYtd,
            ];

            item.values.plan.forEach((value, index) => {
                values.push(value);
                values.push(item.values.actual[index]);
            });

            values.forEach((value, index) => {
                const cell = ws.getCell(row, index + 1);

                cell.value = value;

                applyCellStyle(cell, {
                    size: 8,
                    bold: index === 0,
                    horizontal:
                        index === 0 || index === 1 || index === 4
                            ? "left"
                            : "center",
                    fill: row % 2 === 0 ? "FFFFFF" : "F7F8EE",
                });
            });

            row++;
        });

        return row + 1;
    }

    /* ========================================================
       SIGNATURE EXCEL
    ======================================================== */

    function buildExcelSignature(ws, startRow) {
        const row = startRow;

        /* HEADER */

        ws.mergeCells(row, 1, row, 13);

        ws.mergeCells(row, 14, row, 26);

        ws.mergeCells(row, 27, row, 39);

        ws.getCell(row, 1).value = "Dilaporkan oleh,";

        ws.getCell(row, 14).value = "Disetujui oleh,";

        ws.getCell(row, 27).value = "Diketahui Oleh,";

        [1, 14, 27].forEach((col) => {
            applyCellStyle(ws.getCell(row, col), {
                size: 9,
                fill: "F1DDDC",
            });
        });

        /* AREA TTD */

        ws.mergeCells(row + 1, 1, row + 5, 13);

        ws.mergeCells(row + 1, 14, row + 5, 26);

        ws.mergeCells(row + 1, 27, row + 5, 39);

        [1, 14, 27].forEach((col) => {
            applyCellStyle(ws.getCell(row + 1, col), {
                size: 9,
                horizontal: "center",
            });
        });

        /* NAMA */

        ws.mergeCells(row + 6, 1, row + 6, 13);

        ws.mergeCells(row + 6, 14, row + 6, 26);

        ws.mergeCells(row + 6, 27, row + 6, 39);

        ws.getCell(row + 6, 1).value = "FENNIELLY DHINAWALY";

        ws.getCell(row + 6, 14).value = "SAIDO";

        /* KOTAK KETIGA KOSONG */

        ws.getCell(row + 6, 27).value = "";

        [1, 14, 27].forEach((col) => {
            applyCellStyle(ws.getCell(row + 6, col), {
                size: 9,
                bold: true,
            });
        });

        /* JABATAN */

        ws.mergeCells(row + 7, 1, row + 7, 13);

        ws.mergeCells(row + 7, 14, row + 7, 26);

        ws.mergeCells(row + 7, 27, row + 7, 39);

        ws.getCell(row + 7, 1).value = "HSE & ISO Jr. Manager";

        ws.getCell(row + 7, 14).value = "General Manager";

        ws.getCell(row + 7, 27).value = "";

        [1, 14, 27].forEach((col) => {
            applyCellStyle(ws.getCell(row + 7, col), {
                size: 8,
            });
        });

        ws.getRow(row).height = 18;

        for (let r = row + 1; r <= row + 5; r++) {
            ws.getRow(r).height = 25;
        }

        ws.getRow(row + 6).height = 20;
        ws.getRow(row + 7).height = 20;

        return row + 8;
    }

    /* ========================================================
       EXPORT EXCEL
    ======================================================== */

    const handleExportExcelClick = () => {
        setShowExportModal(true);
    };

    const handleConfirmExport = async () => {
        setShowExportModal(false);
        await handleExportExcel();
    };

    const handleExportExcel = async () => {
        try {
            setExporting(true);
            window.dispatchEvent(
                new CustomEvent("show-cute-loading", {
                    detail: {
                        message: "Sedang menyiapkan Excel... 📑✨",
                        subMessage: "Menyusun baris data dan format laporan...",
                    },
                }),
            );

            const workbook = new ExcelJS.Workbook();

            const ws = workbook.addWorksheet(
                rig !== "All Rigs" ? `KPI ${rig}` : "KPI HSE",
            );

            ws.pageSetup = {
                orientation: "landscape",
                paperSize: 8,
                fitToPage: true,
                fitToWidth: 1,
                fitToHeight: 0,
                horizontalCentered: true,
            };

            ws.pageMargins = {
                left: 0.15,
                right: 0.15,
                top: 0.25,
                bottom: 0.25,
                header: 0.1,
                footer: 0.1,
            };

            buildExcelHeader(ws);

            let row = 7;

            row = buildExcelLagging(ws, row);

            row = buildExcelLeading(ws, row);

            ws.mergeCells(row, 1, row, 39);

            ws.getCell(row, 1).value = "NOTES / REMARKS";

            applyCellStyle(ws.getCell(row, 1), {
                bold: true,
                color: "FFFFFF",
                fill: "064E3B",
                horizontal: "left",
            });

            row++;

            ws.mergeCells(row, 1, row + 2, 39);

            ws.getCell(row, 1).value = latestReport?.remarks || "";

            applyCellStyle(ws.getCell(row, 1), {
                size: 9,
                fill: "F5FFD0",
                horizontal: "left",
                vertical: "top",
            });

            row += 4;

            row = buildExcelSignature(ws, row);

            /* WIDTH */

            const widths = [
                7,
                36,
                18,
                18,
                11,
                11,
                11,
                11,
                11,
                11,
                11,
                11,
                11,
                11,
                ...Array(24).fill(10),
            ];

            widths.forEach((width, index) => {
                ws.getColumn(index + 1).width = width;
            });

            ws.views = [];

            ws.pageSetup.printArea = `A1:AM${row}`;

            ws.headerFooter.oddFooter =
                "&CBMSINDO - KPI / HSE REPORT&RPage &P of &N";

            const buffer = await workbook.xlsx.writeBuffer();

            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const safeProject = project.replace(/[^a-zA-Z0-9]+/g, "_");

            const safeRig = rig.replace(/[^a-zA-Z0-9]+/g, "_");

            saveAs(
                blob,
                `KPI_BMS03A_${year}_${safeProject}_${safeRig}_Plan_Actual.xlsx`,
            );
        } catch (error) {
            console.error("EXPORT EXCEL ERROR:", error);

            alert(
                "Export Excel gagal: " +
                    (error?.message || "Terjadi kesalahan."),
            );
        } finally {
            setExporting(false);
            window.dispatchEvent(new CustomEvent("hide-cute-loading"));
        }
    };

    /* ========================================================
       STYLE
    ======================================================== */

    const selectStyle = {
        width: "100%",
        marginTop: "6px",
        padding: "11px",
        border: "1px solid #c9d8d1",
        borderRadius: "5px",
        backgroundColor: "#f7faf8",
        fontSize: "14px",
        boxSizing: "border-box",
    };

    const labelStyle = {
        color: "#36564A",
        fontSize: "13px",
        fontWeight: "600",
    };

    const thStyle = {
        padding: "7px",
        border: "1px solid #222",
        textAlign: "center",
        verticalAlign: "middle",
        whiteSpace: "nowrap",
    };

    const tdStyle = {
        padding: "6px",
        border: "1px solid #222",
        verticalAlign: "middle",
    };

    const tdCenter = {
        ...tdStyle,
        textAlign: "center",
    };

    /* ========================================================
       REACT TABLE ROW
    ======================================================== */

    const formatMetricCell = (val, item, isPlan = false, hours = 0, km = 0) => {
        if (val === undefined || val === null || val === "") return "-";
        if (typeof val === "string") return val;

        const isTri =
            item?.no === "1.5" ||
            (item?.indicator &&
                item.indicator.includes("TOTAL RECORDABLE INJURY"));
        const isMvc =
            item?.no === "1.6" ||
            (item?.indicator && item.indicator.includes("MOTOR VEHICLE CRASH"));

        if (isTri || isMvc || item?.isCaseFrCombo) {
            const cases = Number(val) || 0;
            const frFormatted = isMvc
                ? calcMvcFrequencyRate(cases, km)
                : calcFrequencyRate(cases, hours);

            return (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        height: "100%",
                        fontSize: "9px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            borderBottom: "1px solid #cbd5e1",
                            backgroundColor: "#e2e8f0",
                            fontWeight: "700",
                            color: "#1e293b",
                            padding: "1px 0",
                        }}
                    >
                        <span
                            style={{
                                flex: 1,
                                textAlign: "center",
                                borderRight: "1px solid #cbd5e1",
                            }}
                        >
                            Case
                        </span>
                        <span style={{ flex: 1, textAlign: "center" }}>FR</span>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            padding: "2px 0",
                            alignItems: "center",
                        }}
                    >
                        <span
                            style={{
                                flex: 1,
                                textAlign: "center",
                                borderRight: "1px solid #e2e8f0",
                                fontWeight: cases > 0 ? "700" : "400",
                                color: cases > 0 ? "#dc2626" : "inherit",
                            }}
                        >
                            {cases}
                        </span>
                        <span
                            style={{
                                flex: 1,
                                textAlign: "center",
                                fontWeight: frFormatted !== "0.00" ? "700" : "400",
                                color: frFormatted !== "0.00" ? "#dc2626" : "inherit",
                            }}
                        >
                            {frFormatted}
                        </span>
                    </div>
                </div>
            );
        }

        if (item?.isPercentage) {
            if (isPlan && val === 0 && item.targetNumber) {
                return `${item.targetNumber}.00%`;
            }
            return `${Number(val).toFixed(2)}%`;
        }
        if (item?.isText) {
            return "< 16 Jam /Rig / Bulan";
        }
        return formatNumber(val);
    };

    const renderPlanActualCells = (item) => {
        const cells = [];
        const totalManHoursItem = manHours?.find((m) => m.indicator?.includes("JAM KERJA / MAN HOURS (Total)")) || (manHours && manHours.length > 0 ? manHours[0] : null);
        const totalKmItem = manHours?.find((m) => m.indicator?.includes("KILOMETER DRIVEN (Total)")) || (manHours && manHours.length > 5 ? manHours[5] : null);

        const quarterNames = REPORT_QUARTERS;

        quarterNames.forEach((q) => {
            const hPlan = Number(totalManHoursItem?.[ `plan${q}` ]) || 0;
            const hAct = Number(totalManHoursItem?.[ `actual${q}` ]) || 0;
            const kmPlan = Number(totalKmItem?.[ `plan${q}` ]) || 0;
            const kmAct = Number(totalKmItem?.[ `actual${q}` ]) || 0;
            const isQFallback = !item.hasManualQuarterActual?.[q];

            cells.push(
                <td key={`${q}-plan`} style={tdCenter}>
                    <span style={{ fontWeight: "700", color: "#004d32" }}>
                        {formatMetricCell(
                            getQuarterValue(item, q, "Plan"),
                            item,
                            true,
                            hPlan,
                            kmPlan,
                        )}
                    </span>
                </td>,
            );

            cells.push(
                <td
                    key={`${q}-actual`}
                    style={tdCenter}
                >
                    <span
                        style={{
                            fontWeight: isQFallback ? "600" : "700",
                            color: isQFallback ? "#64748b" : "#0f172a",
                            fontStyle: isQFallback ? "italic" : "normal",
                        }}
                        title={isQFallback ? "Target acuan default (belum ada input)" : "Data aktual realisasi"}
                    >
                        {formatMetricCell(
                            getQuarterValue(item, q, "Actual"),
                            item,
                            false,
                            hAct,
                            kmAct,
                        )}
                    </span>
                </td>,
            );
        });

        // YTD
        const hYtdPlan = Number(totalManHoursItem?.planYtd) || 0;
        const hYtdAct = Number(totalManHoursItem?.actualYtd) || 0;
        const kmYtdPlan = Number(totalKmItem?.planYtd) || 0;
        const kmYtdAct = Number(totalKmItem?.actualYtd) || 0;
        const isYtdFallback = !item.hasManualQuarterActual?.YTD;

        cells.push(
            <td key="ytd-plan" style={tdCenter}>
                <span style={{ fontWeight: "700", color: "#004d32" }}>
                    {formatMetricCell(item.planYtd, item, true, hYtdPlan, kmYtdPlan)}
                </span>
            </td>,
        );

        cells.push(
            <td
                key="ytd-actual"
                style={tdCenter}
            >
                <span
                    style={{
                        fontWeight: isYtdFallback ? "600" : "700",
                        color: isYtdFallback ? "#64748b" : "#0f172a",
                        fontStyle: isYtdFallback ? "italic" : "normal",
                    }}
                    title={isYtdFallback ? "Target acuan default (belum ada input)" : "Data aktual realisasi"}
                >
                    {formatMetricCell(item.actualYtd, item, false, hYtdAct, kmYtdAct)}
                </span>
            </td>,
        );

        activeMonths.forEach((m) => {
            const hMPlan = Number(totalManHoursItem?.values?.plan?.[m.index]) || 0;
            const hMAct = Number(totalManHoursItem?.values?.actual?.[m.index]) || 0;
            const kmMPlan = Number(totalKmItem?.values?.plan?.[m.index]) || 0;
            const kmMAct = Number(totalKmItem?.values?.actual?.[m.index]) || 0;
            const isMFallback = !item.hasManualActual?.[m.index];

            cells.push(
                <td key={`${m.name}-plan`} style={tdCenter}>
                    <span style={{ fontWeight: "700", color: "#004d32" }}>
                        {formatMetricCell(item.values.plan[m.index], item, true, hMPlan, kmMPlan)}
                    </span>
                </td>,
            );

            cells.push(
                <td
                    key={`${m.name}-actual`}
                    style={tdCenter}
                >
                    <span
                        style={{
                            fontWeight: isMFallback ? "600" : "700",
                            color: isMFallback ? "#64748b" : "#0f172a",
                            fontStyle: isMFallback ? "italic" : "normal",
                        }}
                        title={isMFallback ? "Target acuan default (belum ada input)" : "Data aktual realisasi"}
                    >
                        {formatMetricCell(item.values.actual[m.index], item, false, hMAct, kmMAct)}
                    </span>
                </td>,
            );
        });

        return cells;
    };

    const renderLaggingCaseFrCells = (item) => {
        const cells = [];
        const isTri = item.no === "1.5" || (item.indicator && item.indicator.includes("TOTAL RECORDABLE INJURY"));
        const isMvc = item.no === "1.6" || (item.indicator && item.indicator.includes("MOTOR VEHICLE CRASH"));
        const isCaseFr = isTri || isMvc || Boolean(item.isCaseFrCombo);

        const totalManHoursItem = manHours?.find((m) => m.indicator?.includes("JAM KERJA / MAN HOURS (Total)")) || (manHours && manHours.length > 0 ? manHours[0] : null);
        const totalKmItem = manHours?.find((m) => m.indicator?.includes("KILOMETER DRIVEN (Total)")) || (manHours && manHours.length > 5 ? manHours[5] : null);

        const quarterNames = REPORT_QUARTERS;

        const renderPeriodQuad = (keyPrefix, planCase, actualCase, planHours = 0, actualHours = 0, planKm = 0, actualKm = 0, mIdx = null, periodKey = null) => {
            const pCases = Number(planCase) || 0;
            const aCases = Number(actualCase) || 0;

            const isManual = mIdx !== null ? Boolean(item.hasManualActual?.[mIdx]) : Boolean(item.hasManualQuarterActual?.[periodKey]);
            const isFallback = !isManual;

            // Baris 1.1 s/d 1.12 seluruhnya menampilkan sub-kolom Case & FR
            const is1_1to1_4 = ["1.1", "1.2", "1.3", "1.4"].includes(item.no);
            const is1_7to1_12 = !is1_1to1_4 && !isTri && !isMvc;

            let pFr = "-";
            let aFr = "-";

            if (is1_1to1_4) {
                pFr = "-";
                if (mIdx !== null && item.frequencyRate?.[mIdx] !== null && item.frequencyRate?.[mIdx] !== undefined) {
                    aFr = Number(item.frequencyRate[mIdx]).toFixed(2);
                } else if (actualHours > 0 && aCases > 0) {
                    aFr = calcFrequencyRate(aCases, actualHours);
                } else {
                    aFr = "-";
                }
            } else if (is1_7to1_12) {
                pFr = "NA";
                if (mIdx !== null && item.frequencyRate?.[mIdx] !== null && item.frequencyRate?.[mIdx] !== undefined) {
                    aFr = Number(item.frequencyRate[mIdx]).toFixed(2);
                } else {
                    aFr = "NA";
                }
            } else if (isTri) {
                pFr = planHours > 0 ? calcFrequencyRate(pCases, planHours) : "0.00";
                if (mIdx !== null && item.frequencyRate?.[mIdx] !== null && item.frequencyRate?.[mIdx] !== undefined) {
                    aFr = Number(item.frequencyRate[mIdx]).toFixed(2);
                } else if (actualHours > 0) {
                    aFr = calcFrequencyRate(aCases, actualHours);
                } else {
                    aFr = "0.00";
                }
            } else if (isMvc) {
                pFr = planKm > 0 ? calcMvcFrequencyRate(pCases, planKm) : "0.00";
                if (mIdx !== null && item.frequencyRate?.[mIdx] !== null && item.frequencyRate?.[mIdx] !== undefined) {
                    aFr = Number(item.frequencyRate[mIdx]).toFixed(2);
                } else if (actualKm > 0) {
                    aFr = calcMvcFrequencyRate(aCases, actualKm);
                } else {
                    aFr = "0.00";
                }
            }

            return (
                <React.Fragment key={keyPrefix}>
                    {/* PLAN CASE */}
                    <td style={{ ...tdCenter, fontWeight: "700", color: "#004d32" }}>
                        {formatNumber(pCases)}
                    </td>
                    {/* PLAN FR */}
                    <td style={{ ...tdCenter, fontWeight: "700", color: "#004d32" }}>
                        {pFr}
                    </td>
                    {/* ACTUAL CASE */}
                    <td
                        style={{
                            ...tdCenter,
                            fontWeight: aCases > 0 ? "700" : (isFallback ? "600" : "700"),
                            color: aCases > 0 ? "#dc2626" : (isFallback ? "#64748b" : "#0f172a"),
                            fontStyle: isFallback ? "italic" : "normal",
                        }}
                        title={isFallback ? "Target acuan default (belum ada input)" : "Data aktual realisasi"}
                    >
                        {formatNumber(aCases)}
                    </td>
                    {/* ACTUAL FR */}
                    <td
                        style={{
                            ...tdCenter,
                            fontWeight: aFr !== "-" && aFr !== "NA" && aFr !== "0.00" ? "700" : (isFallback ? "600" : "700"),
                            color: aFr !== "-" && aFr !== "NA" && aFr !== "0.00" ? "#dc2626" : (isFallback ? "#64748b" : "#0f172a"),
                            fontStyle: isFallback ? "italic" : "normal",
                        }}
                        title={isFallback ? "Target acuan default (belum ada input)" : "Data aktual realisasi"}
                    >
                        {aFr}
                    </td>
                </React.Fragment>
            );
        };

        // Quarters Q1..Q4
        quarterNames.forEach((q) => {
            const pHours = Number(totalManHoursItem?.[`plan${q}`]) || 0;
            const aHours = Number(totalManHoursItem?.[`actual${q}`]) || 0;
            const pKm = Number(totalKmItem?.[`plan${q}`]) || 0;
            const aKm = Number(totalKmItem?.[`actual${q}`]) || 0;
            const pCase = getQuarterValue(item, q, "Plan");
            const aCase = getQuarterValue(item, q, "Actual");
            cells.push(renderPeriodQuad(`${item.no}-${q}`, pCase, aCase, pHours, aHours, pKm, aKm, null, q));
        });

        // YTD
        const ytdPHours = Number(totalManHoursItem?.planYtd) || 0;
        const ytdAHours = Number(totalManHoursItem?.actualYtd) || 0;
        const ytdPKm = Number(totalKmItem?.planYtd) || 0;
        const ytdAKm = Number(totalKmItem?.actualYtd) || 0;
        cells.push(renderPeriodQuad(`${item.no}-ytd`, item.planYtd, item.actualYtd, ytdPHours, ytdAHours, ytdPKm, ytdAKm, null, "YTD"));

        // Months
        activeMonths.forEach((m) => {
            const mPHours = Number(totalManHoursItem?.values?.plan?.[m.index]) || 0;
            const mAHours = Number(totalManHoursItem?.values?.actual?.[m.index]) || 0;
            const mPKm = Number(totalKmItem?.values?.plan?.[m.index]) || 0;
            const mAKm = Number(totalKmItem?.values?.actual?.[m.index]) || 0;
            const pCase = item.values?.plan?.[m.index] || 0;
            const aCase = item.values?.actual?.[m.index] || 0;
            cells.push(renderPeriodQuad(`${item.no}-${m.name}`, pCase, aCase, mPHours, mAHours, mPKm, mAKm, m.index, null));
        });

        return cells;
    };

    const renderLaggingRow = (item, index) => {
        const isTri = item.no === "1.5" || (item.indicator && item.indicator.includes("TOTAL RECORDABLE INJURY"));
        const isMvc = item.no === "1.6" || (item.indicator && item.indicator.includes("MOTOR VEHICLE CRASH"));
        const isCaseFr = isTri || isMvc || Boolean(item.isCaseFrCombo);

        return (
            <tr key={`lagging-${item.no}`}>
                <td
                    style={{
                        ...tdStyle,
                        fontWeight: "700",
                    }}
                >
                    <span
                        style={{
                            display: "inline-block",
                            minWidth: "32px",
                            marginRight: "5px",
                            padding: "2px 5px",
                            backgroundColor: "#FFFF00",
                            border: "1px solid #222",
                            textAlign: "center",
                        }}
                    >
                        {item.no}
                    </span>

                    {item.indicator}
                </td>

                <td
                    style={{
                        ...tdStyle,
                        whiteSpace: "pre-line",
                    }}
                >
                    {item.definition || ""}
                </td>

                <td style={tdCenter}>
                    {isCaseFr ? (
                        <div style={{ display: "inline-flex", gap: "6px", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "11px", fontWeight: "700", color: "#004d32" }}>
                                Case: {item.targetMonth || item.target || "0"}
                            </span>
                            <span style={{ color: "#cbd5e1" }}>|</span>
                            <span style={{ fontSize: "11px", fontWeight: "700", color: "#004d32" }}>
                                FR: {item.targetFr || "0.00"}
                            </span>
                        </div>
                    ) : (
                        typeof item.target === "string"
                            ? item.target
                            : formatNumber(item.target)
                    )}
                </td>

                <td
                    style={{
                        ...tdStyle,
                        whiteSpace: "pre-line",
                        textAlign: "center",
                    }}
                >
                    {item.notes || ""}
                </td>

                {renderLaggingCaseFrCells(item)}
            </tr>
        );
    };

    const renderMetricMergedCells = (item) => {
        const cells = [];
        const quarterNames = REPORT_QUARTERS;

        const formatVal = (val, isPlan = false) => {
            if (item?.isText) {
                return "< 16 Jam /Rig / Bulan";
            }
            if (val === undefined || val === null || val === "") return "-";
            if (typeof val === "string") return val;
            if (item?.isPercentage) {
                if (isPlan && (val === 0 || val === "0") && item.targetNumber) {
                    return `${item.targetNumber}.00%`;
                }
                return `${Number(val).toFixed(2)}%`;
            }
            return formatNumber(val);
        };

        const renderTextOrValue = (val) => {
            const formatted = formatVal(val);
            if (item?.isText) {
                return (
                    <span
                        style={{
                            display: "inline-block",
                            fontSize: "8.5px",
                            lineHeight: "1.25",
                            whiteSpace: "normal",
                            wordBreak: "normal",
                            padding: "2px 1px",
                            fontWeight: "600",
                        }}
                    >
                        {formatted}
                    </span>
                );
            }
            return formatted;
        };

        const cellStyle = item?.isText
            ? { ...tdCenter, padding: "3px 2px", whiteSpace: "normal", verticalAlign: "middle" }
            : tdCenter;

        if (item?.isOpsSupportSubRow) {
            const renderQuarterSubCell = (q) => {
                const pOps = item[`planOps${q}`] ?? item.targetOps;
                const pSupp = item[`planSupport${q}`] ?? item.targetSupport;
                const aOps = item[`actualOps${q}`] ?? item.targetOps;
                const aSupp = item[`actualSupport${q}`] ?? item.targetSupport;
                const isSubFallback = !item.hasManualQuarterActual?.[q];

                return [
                    <td key={`${q}-plan`} colSpan={2} style={tdCenter}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                whiteSpace: "nowrap",
                                gap: "4px",
                            }}
                        >
                            <span style={{ flex: 1, textAlign: "center", fontWeight: "700", color: "#004d32" }}>
                                {formatNumber(pOps)}
                            </span>
                            <span style={{ color: "#94a3b8", fontWeight: "300" }}>|</span>
                            <span style={{ flex: 1, textAlign: "center", fontWeight: "700", color: "#004d32" }}>
                                {formatNumber(pSupp)}
                            </span>
                        </div>
                    </td>,
                    <td key={`${q}-actual`} colSpan={2} style={tdCenter}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                whiteSpace: "nowrap",
                                gap: "4px",
                            }}
                        >
                            <span
                                style={{
                                    flex: 1,
                                    textAlign: "center",
                                    fontWeight: isSubFallback ? "600" : "700",
                                    color: isSubFallback ? "#64748b" : "#0f172a",
                                    fontStyle: isSubFallback ? "italic" : "normal",
                                }}
                                title={isSubFallback ? "Target acuan default (belum ada input)" : "Data aktual realisasi"}
                            >
                                {formatNumber(aOps)}
                            </span>
                            <span style={{ color: "#94a3b8", fontWeight: "300" }}>|</span>
                            <span
                                style={{
                                    flex: 1,
                                    textAlign: "center",
                                    fontWeight: isSubFallback ? "600" : "700",
                                    color: isSubFallback ? "#64748b" : "#0f172a",
                                    fontStyle: isSubFallback ? "italic" : "normal",
                                }}
                                title={isSubFallback ? "Target acuan default (belum ada input)" : "Data aktual realisasi"}
                            >
                                {formatNumber(aSupp)}
                            </span>
                        </div>
                    </td>,
                ];
            };

            quarterNames.forEach((q) => {
                cells.push(...renderQuarterSubCell(q));
            });

            // YTD
            const isYtdSubFallback = !item.hasManualQuarterActual?.YTD;
            cells.push(
                <td key="ytd-plan" colSpan={2} style={tdCenter}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            whiteSpace: "nowrap",
                            gap: "4px",
                        }}
                    >
                        <span style={{ flex: 1, textAlign: "center", fontWeight: "700", color: "#004d32" }}>
                            {formatNumber(item.planOpsYtd ?? item.targetOps)}
                        </span>
                        <span style={{ color: "#94a3b8", fontWeight: "300" }}>|</span>
                        <span style={{ flex: 1, textAlign: "center", fontWeight: "700", color: "#004d32" }}>
                            {formatNumber(item.planSupportYtd ?? item.targetSupport)}
                        </span>
                    </div>
                </td>,
                <td key="ytd-actual" colSpan={2} style={tdCenter}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            whiteSpace: "nowrap",
                            gap: "4px",
                        }}
                    >
                        <span
                            style={{
                                flex: 1,
                                textAlign: "center",
                                fontWeight: isYtdSubFallback ? "600" : "700",
                                color: isYtdSubFallback ? "#64748b" : "#0f172a",
                                fontStyle: isYtdSubFallback ? "italic" : "normal",
                            }}
                            title={isYtdSubFallback ? "Target acuan default (belum ada input)" : "Data aktual realisasi"}
                        >
                            {formatNumber(item.actualOpsYtd ?? item.targetOps)}
                        </span>
                        <span style={{ color: "#94a3b8", fontWeight: "300" }}>|</span>
                        <span
                            style={{
                                flex: 1,
                                textAlign: "center",
                                fontWeight: isYtdSubFallback ? "600" : "700",
                                color: isYtdSubFallback ? "#64748b" : "#0f172a",
                                fontStyle: isYtdSubFallback ? "italic" : "normal",
                            }}
                            title={isYtdSubFallback ? "Target acuan default (belum ada input)" : "Data aktual realisasi"}
                        >
                            {formatNumber(item.actualSupportYtd ?? item.targetSupport)}
                        </span>
                    </div>
                </td>,
            );

            // Active Months
            activeMonths.forEach((m) => {
                const pOps = item.valuesOps?.plan?.[m.index] ?? item.targetOps;
                const pSupp = item.valuesSupport?.plan?.[m.index] ?? item.targetSupport;
                const aOps = item.valuesOps?.actual?.[m.index] ?? item.targetOps;
                const aSupp = item.valuesSupport?.actual?.[m.index] ?? item.targetSupport;
                const isMSubFallback = !item.hasManualActual?.[m.index];

                cells.push(
                    <td key={`${m.name}-plan`} colSpan={2} style={tdCenter}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                whiteSpace: "nowrap",
                                gap: "4px",
                            }}
                        >
                            <span style={{ flex: 1, textAlign: "center", fontWeight: "700", color: "#004d32" }}>
                                {formatNumber(pOps)}
                            </span>
                            <span style={{ color: "#94a3b8", fontWeight: "300" }}>|</span>
                            <span style={{ flex: 1, textAlign: "center", fontWeight: "700", color: "#004d32" }}>
                                {formatNumber(pSupp)}
                            </span>
                        </div>
                    </td>,
                    <td key={`${m.name}-actual`} colSpan={2} style={tdCenter}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                whiteSpace: "nowrap",
                                gap: "4px",
                            }}
                        >
                            <span
                                style={{
                                    flex: 1,
                                    textAlign: "center",
                                    fontWeight: isMSubFallback ? "600" : "700",
                                    color: isMSubFallback ? "#64748b" : "#0f172a",
                                    fontStyle: isMSubFallback ? "italic" : "normal",
                                }}
                                title={isMSubFallback ? "Target acuan default (belum ada input)" : "Data aktual realisasi"}
                            >
                                {formatNumber(aOps)}
                            </span>
                            <span style={{ color: "#94a3b8", fontWeight: "300" }}>|</span>
                            <span
                                style={{
                                    flex: 1,
                                    textAlign: "center",
                                    fontWeight: isMSubFallback ? "600" : "700",
                                    color: isMSubFallback ? "#64748b" : "#0f172a",
                                    fontStyle: isMSubFallback ? "italic" : "normal",
                                }}
                                title={isMSubFallback ? "Target acuan default (belum ada input)" : "Data aktual realisasi"}
                            >
                                {formatNumber(aSupp)}
                            </span>
                        </div>
                    </td>,
                );
            });

            return cells;
        }

        quarterNames.forEach((q) => {
            const pVal = getQuarterValue(item, q, "Plan");
            const aVal = getQuarterValue(item, q, "Actual");
            const isQFallback = !item.hasManualQuarterActual?.[q];
            cells.push(
                <td key={`${q}-plan`} colSpan={2} style={cellStyle}>
                    <span style={{ fontWeight: "700", color: "#004d32" }}>
                        {renderTextOrValue(pVal)}
                    </span>
                </td>,
                <td key={`${q}-actual`} colSpan={2} style={cellStyle}>
                    <span
                        style={{
                            fontWeight: isQFallback ? "600" : "700",
                            color: isQFallback ? "#64748b" : "#0f172a",
                            fontStyle: isQFallback ? "italic" : "normal",
                        }}
                        title={isQFallback ? "Target acuan default (belum ada input)" : "Data aktual realisasi"}
                    >
                        {renderTextOrValue(aVal)}
                    </span>
                </td>,
            );
        });

        // YTD
        const isYtdFallback = !item.hasManualQuarterActual?.YTD;
        cells.push(
            <td key="ytd-plan" colSpan={2} style={cellStyle}>
                <span style={{ fontWeight: "700", color: "#004d32" }}>
                    {renderTextOrValue(item.planYtd)}
                </span>
            </td>,
            <td key="ytd-actual" colSpan={2} style={cellStyle}>
                <span
                    style={{
                        fontWeight: isYtdFallback ? "600" : "700",
                        color: isYtdFallback ? "#64748b" : "#0f172a",
                        fontStyle: isYtdFallback ? "italic" : "normal",
                    }}
                    title={isYtdFallback ? "Target acuan default (belum ada input)" : "Data aktual realisasi"}
                >
                    {renderTextOrValue(item.actualYtd)}
                </span>
            </td>,
        );

        // Active Months
        activeMonths.forEach((m) => {
            const mPlan = item.values?.plan?.[m.index];
            const mAct = item.values?.actual?.[m.index];
            const isMFallback = !item.hasManualActual?.[m.index];
            cells.push(
                <td key={`${m.name}-plan`} colSpan={2} style={cellStyle}>
                    <span style={{ fontWeight: "700", color: "#004d32" }}>
                        {renderTextOrValue(mPlan)}
                    </span>
                </td>,
                <td key={`${m.name}-actual`} colSpan={2} style={cellStyle}>
                    <span
                        style={{
                            fontWeight: isMFallback ? "600" : "700",
                            color: isMFallback ? "#64748b" : "#0f172a",
                            fontStyle: isMFallback ? "italic" : "normal",
                        }}
                        title={isMFallback ? "Target acuan default (belum ada input)" : "Data aktual realisasi"}
                    >
                        {renderTextOrValue(mAct)}
                    </span>
                </td>,
            );
        });

        return cells;
    };

    const renderMetricRow = (item, index) => {
        const isHeader = item.isTotalHeader || (!item.no && !item.isOpsSupportSubRow);
        const isSub = Boolean(item.isOpsSupportSubRow);

        return (
            <tr
                key={`metric-${item.no || item.indicator}-${index}`}
                style={isHeader ? { backgroundColor: "#DDEBF7" } : undefined}
            >
                <td
                    style={{
                        ...tdStyle,
                        backgroundColor: isHeader ? "#DDEBF7" : undefined,
                        fontWeight: isHeader ? "700" : isSub ? "600" : undefined,
                        paddingLeft: isSub ? "36px" : tdStyle.paddingLeft || "8px",
                    }}
                >
                    {item.no ? (
                        <span
                            style={{
                                display: "inline-block",
                                minWidth: "32px",
                                marginRight: "5px",
                                padding: "2px 5px",
                                backgroundColor: "#FFFF00",
                                border: "1px solid #222",
                                textAlign: "center",
                                fontWeight: "700",
                            }}
                        >
                            {item.no}
                        </span>
                    ) : null}

                    {isSub ? (
                        <div style={{ display: "inline-flex", gap: "28px", fontStyle: "italic", fontWeight: "600", color: "#374151" }}>
                            <span>Ops :</span>
                            <span>Support :</span>
                        </div>
                    ) : (
                        item.indicator
                    )}
                </td>

                <td
                    style={{
                        ...tdStyle,
                        backgroundColor: isHeader ? "#DDEBF7" : undefined,
                        fontWeight: isHeader ? "700" : undefined,
                        textAlign: isSub ? "center" : "left",
                    }}
                >
                    {item.definition || "-"}
                </td>

                <td
                    style={{
                        ...tdCenter,
                        backgroundColor: isHeader ? "#DDEBF7" : undefined,
                        fontWeight: isHeader || isSub ? "700" : undefined,
                    }}
                >
                    {isSub ? (
                        <div style={{ display: "inline-flex", gap: "6px", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#004d32" }}>{item.targetOps}</span>
                            <span style={{ color: "#cbd5e1" }}>|</span>
                            <span style={{ color: "#004d32" }}>{item.targetSupport}</span>
                        </div>
                    ) : typeof item.target === "string" ? (
                        item.target
                    ) : (
                        formatNumber(item.target)
                    )}
                </td>

                <td
                    style={{
                        ...tdCenter,
                        backgroundColor: isHeader ? "#DDEBF7" : undefined,
                        fontWeight: isHeader ? "700" : undefined,
                    }}
                >
                    {item.notes || ""}
                </td>

                {renderMetricMergedCells(item)}
            </tr>
        );
    };

    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f3f7f4",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <AdminSidebar />

            <main
                style={{
                    marginLeft: "var(--admin-sidebar-width, 215px)",
                    width: "calc(100% - var(--admin-sidebar-width, 215px))",
                    transition:
                        "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    minHeight: "100vh",
                    padding: "35px",
                    boxSizing: "border-box",
                }}
            >
                {/* HEADER */}

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "18px 24px",
                        borderRadius: "8px",
                        border: "1px solid #d9e2de",
                        marginBottom: "18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div>
                        <h1
                            style={{
                                margin: 0,
                                color: "#064E3B",
                                fontSize: "28px",
                            }}
                        >
                            Report Generation
                        </h1>

                        <p
                            style={{
                                margin: "6px 0 0",
                                color: "#526B60",
                                fontSize: "14px",
                            }}
                        >
                            Generate report KPI / HSE berdasarkan data database.
                        </p>
                    </div>

                    <button
                        onClick={handleExportExcelClick}
                        disabled={exporting}
                        style={{
                            backgroundColor: "#EFFF00",
                            color: "#064E3B",
                            border: "none",
                            borderRadius: "6px",
                            padding: "12px 18px",
                            fontSize: "14px",
                            fontWeight: "700",
                            cursor: exporting ? "not-allowed" : "pointer",
                            opacity: exporting ? 0.7 : 1,
                        }}
                    >
                        {exporting ? "Exporting..." : "Export Excel"}
                    </button>
                </div>

                {/* CONFIGURATION */}

                <section
                    style={{
                        backgroundColor: "white",
                        border: "1px solid #d9e2de",
                        borderRadius: "8px",
                        padding: "20px",
                    }}
                >
                    <h2
                        style={{
                            margin: "0 0 18px",
                            color: "#064E3B",
                            fontSize: "20px",
                        }}
                    >
                        Report Configuration
                    </h2>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                            gap: "14px",
                        }}
                    >
                        <label style={labelStyle}>
                            Report Type
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                style={selectStyle}
                            >
                                <option>HSE Performance</option>

                                <option>KPI Per Rig</option>

                                <option>Target KPI</option>
                            </select>
                        </label>

                        <label style={labelStyle}>
                            Period
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                style={selectStyle}
                            >
                                <option>Annual</option>

                                <option>Monthly</option>

                                <option>Quarterly</option>
                            </select>
                        </label>

                        <label style={labelStyle}>
                            Year
                            <select
                                value={year}
                                onChange={(e) => {
                                    setYear(e.target.value);
                                    setReportDate("All Dates");
                                }}
                                style={selectStyle}
                            >
                                {availableYears.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label style={labelStyle}>
                            {project !== "All Projects" ? "Rig dalam Kontrak Terpilih" : "Rig / Location"}
                            <select
                                value={rig}
                                onChange={(e) => setRig(e.target.value)}
                                style={selectStyle}
                            >
                                <option value="All Rigs">
                                    {project !== "All Projects" ? "📌 Semua Rig (Konsolidasi Kontrak)" : "All Rigs (Semua Rig)"}
                                </option>

                                {availableRigs.map((item) => (
                                    <option key={item} value={item}>
                                        🛢️ {item}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: "14px",
                            marginTop: "14px",
                        }}
                    >
                        <label style={labelStyle}>
                            Nomor Kontrak (Filter Grouping Rig)
                            <select
                                value={project}
                                onChange={(e) => handleContractChange(e.target.value)}
                                style={selectStyle}
                            >
                                <option value="All Projects">-- Semua Nomor Kontrak --</option>

                                {CONTRACT_RIG_GROUPS.map((g) => (
                                    <option key={g.contractNo} value={g.contractNo}>
                                        {g.contractNo} — Area {g.area} ({g.rigs.join(", ")})
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label style={labelStyle}>
                            Lokasi / Distrik
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                style={selectStyle}
                            >
                                <option>All Locations</option>

                                {availableLocations.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label style={labelStyle}>
                            Tanggal Report
                            <select
                                value={reportDate}
                                onChange={(e) => setReportDate(e.target.value)}
                                style={selectStyle}
                            >
                                <option>All Dates</option>

                                {availableDates.map((item) => (
                                    <option key={item} value={item}>
                                        {formatDate(item)}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div
                        style={{
                            marginTop: "18px",
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "10px",
                        }}
                    >
                        <button
                            onClick={handleReset}
                            style={{
                                backgroundColor: "white",
                                color: "#064E3B",
                                border: "1px solid #064E3B",
                                borderRadius: "6px",
                                padding: "11px 18px",
                                fontSize: "14px",
                                cursor: "pointer",
                            }}
                        >
                            Reset
                        </button>

                        <button
                            onClick={() => setPreview(true)}
                            style={{
                                backgroundColor: "#064E3B",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                padding: "11px 18px",
                                fontSize: "14px",
                                fontWeight: "700",
                                cursor: "pointer",
                            }}
                        >
                            Generate Preview
                        </button>
                    </div>
                </section>

                {/* CONTRACT & RIG GROUPING BANNER / SUB-TABS */}
                {currentContractGroup && (
                    <div
                        style={{
                            marginTop: "20px",
                            backgroundColor: "#ffffff",
                            border: "1.5px solid #004d32",
                            borderRadius: "12px",
                            padding: "16px 20px",
                            boxShadow: "0 4px 15px rgba(0, 77, 50, 0.08)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: "10px",
                                marginBottom: "14px",
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontSize: "11px",
                                        fontWeight: "800",
                                        color: "#059669",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                    }}
                                >
                                    Pengelompokan Rig Berdasarkan Kontrak (Sesuai Excel Resmi)
                                </div>
                                <div
                                    style={{
                                        fontSize: "18px",
                                        fontWeight: "900",
                                        color: "#004d32",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        marginTop: "2px",
                                    }}
                                >
                                    <span>Nomor Kontrak: {currentContractGroup.contractNo}</span>
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: "800",
                                            padding: "2px 10px",
                                            borderRadius: "12px",
                                            backgroundColor: "#ecfdf5",
                                            color: "#004d32",
                                            border: "1px solid #a7f3d0",
                                        }}
                                    >
                                        Area {currentContractGroup.area}
                                    </span>
                                </div>
                            </div>
                            <div style={{ fontSize: "12.5px", color: "#475569" }}>
                                <strong>HSE Coord:</strong> {currentContractGroup.hseCoord || "-"} •{" "}
                                <strong>Rig Terdaftar:</strong> {currentContractGroup.rigs.join(", ")}
                            </div>
                        </div>

                        {/* RIG SUB-TABS (KLIK UNTUK SWITCH PREVIEW LANGSUNG) */}
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setRig("All Rigs");
                                    setPreview(true);
                                }}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    border: rig === "All Rigs" ? "1.5px solid #004d32" : "1px solid #cbd5e1",
                                    backgroundColor: rig === "All Rigs" ? "#004d32" : "#f8fafc",
                                    color: rig === "All Rigs" ? "#efff00" : "#334155",
                                    fontSize: "12.5px",
                                    fontWeight: "800",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                    boxShadow: rig === "All Rigs" ? "0 2px 6px rgba(0, 77, 50, 0.25)" : "none",
                                }}
                            >
                                📌 Seluruh Rig Kontrak (Konsolidasi)
                            </button>
                            {currentContractGroup.rigs.map((r) => {
                                const isActive = rig === r;
                                return (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => {
                                            setRig(r);
                                            setPreview(true);
                                        }}
                                        style={{
                                            padding: "8px 16px",
                                            borderRadius: "8px",
                                            border: isActive ? "1.5px solid #004d32" : "1px solid #cbd5e1",
                                            backgroundColor: isActive ? "#004d32" : "#ffffff",
                                            color: isActive ? "#efff00" : "#1e293b",
                                            fontSize: "12.5px",
                                            fontWeight: "800",
                                            cursor: "pointer",
                                            transition: "all 0.15s ease",
                                            boxShadow: isActive ? "0 2px 6px rgba(0, 77, 50, 0.25)" : "none",
                                        }}
                                    >
                                        🛢️ {r}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* STATUS */}

                {preview && (
                    <div
                        style={{
                            marginTop: "15px",
                            padding: "12px 18px",
                            borderRadius: "8px",
                            backgroundColor:
                                filteredReports.length > 0
                                    ? "#E8F7EF"
                                    : "#EFF6FF",
                            border:
                                filteredReports.length > 0
                                    ? "1px solid #B8DEC8"
                                    : "1px solid #BFDBFE",
                            color:
                                filteredReports.length > 0
                                    ? "#075E45"
                                    : "#1E40AF",
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        }}
                    >
                        {filteredReports.length > 0 ? (
                            <span>
                                <strong>Data Ditemukan:</strong> Terdeteksi {filteredReports.length} laporan actual manual untuk filter yang dipilih. Tabel di bawah menggabungkan data Actual manual yang telah diisi dengan nilai Target Plan default untuk periode yang belum diinput.
                            </span>
                        ) : (
                            <span>
                                <strong>Mode Default Master Plan:</strong> Belum ada data laporan Actual manual yang diinput untuk filter/rig yang dipilih. Tabel Report tetap ditampilkan 100% penuh menggunakan nilai acuan Master Target / Plan default Excel (angka aktual acuan ditampilkan dengan warna abu-abu miring).
                            </span>
                        )}
                    </div>
                )}

                {/* PREVIEW */}

                {preview && (
                    <section
                        style={{
                            marginTop: "20px",
                            backgroundColor: "white",
                            border: "1px solid #d9e2de",
                            borderRadius: "8px",
                            padding: "18px",
                            overflowX: "auto",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "14px",
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                        color: "#064E3B",
                                        fontSize: "20px",
                                    }}
                                >
                                    Report Preview: KPI{" "}
                                    {rig !== "All Rigs" ? rig : "(All Rigs)"}
                                </h2>

                                <p
                                    style={{
                                        margin: "5px 0 0",
                                        color: "#61786D",
                                        fontSize: "13px",
                                    }}
                                >
                                    {year}
                                    {" • "}
                                    {period}
                                    {" • "}
                                    {rig}
                                </p>
                            </div>

                            <button
                                onClick={handleExportExcelClick}
                                disabled={exporting}
                                style={{
                                    backgroundColor: "#EFFF00",
                                    color: "#064E3B",
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "10px 16px",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                }}
                            >
                                {exporting ? "Exporting..." : "Export Excel"}
                            </button>
                        </div>

                        {/* DOCUMENT INFO */}

                        <div
                            style={{
                                minWidth: "1800px",
                                border: "1px solid #222",
                                marginBottom: "18px",
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: "#075E45",
                                    color: "white",
                                    padding: "12px",
                                    textAlign: "center",
                                    fontWeight: "700",
                                    fontSize: "18px",
                                }}
                            >
                                KEY PERFORMANCE INDICATOR (HSE){" "}
                                {rig !== "All Rigs" ? rig : ""}
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr",
                                }}
                            >
                                <div
                                    style={{
                                        padding: "10px",
                                        backgroundColor: "#F5FFD0",
                                        borderRight: "1px solid #222",
                                    }}
                                >
                                    <strong>Tahun Periode</strong>

                                    <div>: {year}</div>
                                </div>

                                <div
                                    style={{
                                        padding: "10px",
                                        backgroundColor: "#F5FFD0",
                                        borderRight: "1px solid #222",
                                    }}
                                >
                                    <strong>Tgl Diterbitkan / Rev.</strong>

                                    <div>
                                        :{" "}
                                        {latestReport?.report_date
                                            ? `${formatDate(latestReport.report_date)} / Rev.${latestReport?.revision_no ?? "00"}`
                                            : "Master Default KPI / Rev.00"}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        padding: "10px",
                                        backgroundColor: "#F5FFD0",
                                    }}
                                >
                                    <strong>Fokus Corp / Project</strong>

                                    <div>
                                        : {latestReport?.contract_no || (project !== "All Projects" ? project : (currentContractGroup?.contractNo || "-"))}
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr",
                                }}
                            >
                                <div
                                    style={{
                                        padding: "10px",
                                        borderTop: "1px solid #222",
                                        borderRight: "1px solid #222",
                                    }}
                                >
                                    <strong>Periode</strong>

                                    <div>: {period}</div>
                                </div>

                                <div
                                    style={{
                                        padding: "10px",
                                        borderTop: "1px solid #222",
                                        borderRight: "1px solid #222",
                                    }}
                                >
                                    <strong>Rig / Location</strong>

                                    <div>: {rig}</div>
                                </div>

                                <div
                                    style={{
                                        padding: "10px",
                                        borderTop: "1px solid #222",
                                    }}
                                >
                                    <strong>Lokasi / Distrik</strong>

                                    <div>
                                        :{" "}
                                        {latestReport?.location_district || (location !== "All Locations" ? location : (currentContractGroup?.area || "-"))}
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{
                                    padding: "10px",
                                    borderTop: "1px solid #222",
                                    backgroundColor: "#FAFFF0",
                                }}
                            >
                                <strong>Referensi Program :</strong>

                                <div
                                    style={{
                                        marginTop: "5px",
                                    }}
                                >
                                    {latestReport?.program_reference || "Form Standar KPI HSE PT Besmindo Materi Sewatama"}
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                               LEGEND / KETERANGAN STATUS METRIK
                            ================================================= */}
                        <div
                            style={{
                                minWidth: "1800px",
                                display: "flex",
                                alignItems: "center",
                                gap: "24px",
                                backgroundColor: "#ffffff",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                padding: "10px 18px",
                                marginBottom: "14px",
                                fontSize: "12px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                        >
                            <span style={{ fontWeight: "700", color: "#064E3B", display: "flex", alignItems: "center", gap: "6px" }}>
                                <span>Keterangan Status Metrik:</span>
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ width: "14px", height: "14px", borderRadius: "3px", backgroundColor: "#DDEBF7", border: "1px solid #94a3b8", display: "inline-block" }}></span>
                                <span style={{ fontWeight: "700", color: "#004d32" }}>Plan / Target (Acuan Baku Master Excel)</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ width: "14px", height: "14px", borderRadius: "3px", backgroundColor: "#f8fafc", border: "1px dashed #64748b", display: "inline-block" }}></span>
                                <span style={{ fontStyle: "italic", fontWeight: "600", color: "#64748b" }}>Actual Fallback (Abu-abu Miring: Menggunakan target acuan Excel karena belum ada input aktual)</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ width: "14px", height: "14px", borderRadius: "3px", backgroundColor: "#e2e8f0", border: "1px solid #0f172a", display: "inline-block" }}></span>
                                <span style={{ fontWeight: "700", color: "#0f172a" }}>Actual Realisasi (Hitam Bold: Hasil input aktual user)</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ width: "14px", height: "14px", borderRadius: "3px", backgroundColor: "#fee2e2", border: "1px solid #dc2626", display: "inline-block" }}></span>
                                <span style={{ fontWeight: "700", color: "#dc2626" }}>Insiden Kasus &gt; 0 (Merah)</span>
                            </div>
                        </div>

                        {/* =================================================
                               LAGGING TABLE
                            ================================================= */}

                        <div
                            style={{
                                minWidth: `${Math.max(2200, 870 + (5 + activeMonths.length) * 220)}px`,
                                border: "1px solid #222",
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: "#00FF20",
                                    color: "#000",
                                    padding: "8px",
                                    fontWeight: "700",
                                    fontSize: "18px",
                                    textAlign: "center",
                                }}
                            >
                                LAGGING INDICATOR
                            </div>

                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: "11px",
                                }}
                            >
                                <thead>
                                    {/* TIER 1: BASE HEADERS & PERIOD TITLES */}
                                    <tr>
                                        <th
                                            rowSpan={3}
                                            style={{
                                                ...thStyle,
                                                backgroundColor: "#F1DDDC",
                                                minWidth: "330px",
                                            }}
                                        >
                                            POINT YANG DIUKUR
                                        </th>

                                        <th
                                            rowSpan={3}
                                            style={{
                                                ...thStyle,
                                                backgroundColor: "#F1DDDC",
                                                minWidth: "260px",
                                            }}
                                        >
                                            DEFINISI (FREQUENCY RATE / UNIT)
                                        </th>

                                        <th
                                            rowSpan={3}
                                            style={{
                                                ...thStyle,
                                                backgroundColor: "#F1DDDC",
                                                minWidth: "140px",
                                            }}
                                        >
                                            TARGET / ESTIMASI / MONTH
                                        </th>

                                        <th
                                            rowSpan={3}
                                            style={{
                                                ...thStyle,
                                                backgroundColor: "#F1DDDC",
                                                minWidth: "140px",
                                            }}
                                        >
                                            KETERANGAN
                                        </th>

                                        {REPORT_QUARTERS.map((q) => (
                                            <th
                                                key={q}
                                                colSpan={4}
                                                style={{
                                                    ...thStyle,
                                                    backgroundColor: "#F1DDDC",
                                                }}
                                            >
                                                {q}
                                            </th>
                                        ))}

                                        <th
                                            colSpan={4}
                                            style={{
                                                ...thStyle,
                                                backgroundColor: "#F1DDDC",
                                            }}
                                        >
                                            <div>TOTAL KUMULATIF YTD</div>
                                            {latestMonthIndex < 11 && (
                                                <div
                                                    style={{
                                                        fontSize: "9px",
                                                        fontWeight:
                                                            "normal",
                                                        color: "#475569",
                                                    }}
                                                >
                                                    (Jan - {MONTHS[latestMonthIndex]})
                                                </div>
                                            )}
                                        </th>

                                        {activeMonths.map((m) => (
                                            <th
                                                key={m.name}
                                                colSpan={4}
                                                style={{
                                                    ...thStyle,
                                                    backgroundColor: "#F1DDDC",
                                                }}
                                            >
                                                {m.name}-{String(year).slice(-2)}
                                            </th>
                                        ))}
                                    </tr>

                                    {/* TIER 2: PLAN & ACTUAL PER PERIOD */}
                                    <tr>
                                        {Array.from({
                                            length: 5 + activeMonths.length,
                                        }).map((_, index) => (
                                            <React.Fragment key={`plan-act-header-${index}`}>
                                                <th
                                                    colSpan={2}
                                                    style={{
                                                        ...thStyle,
                                                        backgroundColor:
                                                            "#FFFF00",
                                                        fontSize: "10px",
                                                        fontWeight: "700",
                                                        minWidth: "72px",
                                                    }}
                                                >
                                                    Plan
                                                </th>

                                                <th
                                                    colSpan={2}
                                                    style={{
                                                        ...thStyle,
                                                        backgroundColor:
                                                            "#FFFF00",
                                                        fontSize: "10px",
                                                        fontWeight: "700",
                                                        minWidth: "72px",
                                                    }}
                                                >
                                                    Actual
                                                </th>
                                            </React.Fragment>
                                        ))}
                                    </tr>

                                    {/* TIER 3: CASE & FR UNDER PLAN, CASE & FR UNDER ACTUAL */}
                                    <tr>
                                        {Array.from({
                                            length: 5 + activeMonths.length,
                                        }).map((_, index) => (
                                            <React.Fragment key={`case-fr-header-${index}`}>
                                                <th
                                                    style={{
                                                        ...thStyle,
                                                        backgroundColor:
                                                            "#FFFF00",
                                                        fontSize: "9px",
                                                        minWidth: "36px",
                                                    }}
                                                >
                                                    Case
                                                </th>

                                                <th
                                                    style={{
                                                        ...thStyle,
                                                        backgroundColor:
                                                            "#FFFF00",
                                                        fontSize: "9px",
                                                        minWidth: "36px",
                                                    }}
                                                >
                                                    FR
                                                </th>

                                                <th
                                                    style={{
                                                        ...thStyle,
                                                        backgroundColor:
                                                            "#FFFF00",
                                                        fontSize: "9px",
                                                        minWidth: "36px",
                                                    }}
                                                >
                                                    Case
                                                </th>

                                                <th
                                                    style={{
                                                        ...thStyle,
                                                        backgroundColor:
                                                            "#FFFF00",
                                                        fontSize: "9px",
                                                        minWidth: "36px",
                                                    }}
                                                >
                                                    FR
                                                </th>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {/* SECTION 1 */}

                                    <tr>
                                        <td
                                            colSpan={
                                                4 +
                                                (5 + activeMonths.length) * 4
                                            }
                                            style={{
                                                ...tdStyle,
                                                backgroundColor: "#D9D9D9",
                                                fontWeight: "700",
                                                textAlign: "left",
                                            }}
                                        >
                                            1. HES PERFORMANCE
                                        </td>
                                    </tr>

                                    {lagging.map((item, index) =>
                                        renderLaggingRow(item, index),
                                    )}

                                    {/* SECTION 2 */}

                                    <tr>
                                        <td
                                            colSpan={
                                                4 +
                                                (5 + activeMonths.length) * 4
                                            }
                                            style={{
                                                ...tdStyle,
                                                backgroundColor: "#D9D9D9",
                                                fontWeight: "700",
                                            }}
                                        >
                                            2. MAN HOURS & KILOMETER PERFORMANCE
                                        </td>
                                    </tr>

                                    {manHours.map((item, index) =>
                                        renderMetricRow(item, index),
                                    )}

                                    {/* SECTION 3 */}

                                    <tr>
                                        <td
                                            colSpan={
                                                4 +
                                                (5 + activeMonths.length) * 4
                                            }
                                            style={{
                                                ...tdStyle,
                                                backgroundColor: "#D9D9D9",
                                                fontWeight: "700",
                                            }}
                                        >
                                            3. OPS PERFORMANCE
                                        </td>
                                    </tr>

                                    {ops.map((item, index) =>
                                        renderMetricRow(item, index),
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* =================================================
                               LEADING TABLE
                            ================================================= */}

                        <div
                            style={{
                                minWidth: "2200px",
                                border: "1px solid #222",
                                marginTop: "18px",
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: "#00FF20",
                                    color: "#000",
                                    padding: "8px",
                                    fontWeight: "700",
                                    fontSize: "18px",
                                    textAlign: "center",
                                }}
                            >
                                LEADING INDICATOR
                            </div>

                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: "10px",
                                }}
                            >
                                <thead>
                                    <tr>
                                        <th
                                            rowSpan={2}
                                            style={{
                                                ...thStyle,
                                                backgroundColor: "#F1DDDC",
                                                minWidth: "330px",
                                            }}
                                        >
                                            POINT YANG DIUKUR/
                                        </th>

                                        <th
                                            rowSpan={2}
                                            style={{
                                                ...thStyle,
                                                backgroundColor: "#F1DDDC",
                                            }}
                                        >
                                            DEFINISI
                                            <br />
                                            (FREQUENCY RATE / UNIT)
                                        </th>

                                        <th
                                            rowSpan={2}
                                            style={{
                                                ...thStyle,
                                                backgroundColor: "#F1DDDC",
                                            }}
                                        >
                                            TARGET
                                            <br />
                                            (month)
                                        </th>

                                        <th
                                            rowSpan={2}
                                            style={{
                                                ...thStyle,
                                                backgroundColor: "#F1DDDC",
                                            }}
                                        >
                                            TARGET
                                            <br />
                                            (Year)
                                        </th>

                                        <th
                                            rowSpan={2}
                                            style={{
                                                ...thStyle,
                                                backgroundColor: "#F1DDDC",
                                            }}
                                        >
                                            DEFINISI
                                            <br />
                                            FREQUENCY RATE / UNIT
                                        </th>

                                        {REPORT_QUARTERS.map((q) => (
                                            <th
                                                key={q}
                                                colSpan={2}
                                                style={{
                                                    ...thStyle,
                                                    backgroundColor: "#F1DDDC",
                                                }}
                                            >
                                                {q}
                                            </th>
                                        ))}

                                        <th
                                            colSpan={2}
                                            style={{
                                                ...thStyle,
                                                backgroundColor: "#F1DDDC",
                                            }}
                                        >
                                            <div>TOTAL KUMULATIF YTD</div>
                                            {latestMonthIndex < 11 && (
                                                <div
                                                    style={{
                                                        fontSize: "9px",
                                                        fontWeight:
                                                            "normal",
                                                        color: "#475569",
                                                    }}
                                                >
                                                    (Jan - {MONTHS[latestMonthIndex]})
                                                </div>
                                            )}
                                        </th>

                                        {activeMonths.map((m) => (
                                            <th
                                                key={m.name}
                                                colSpan={2}
                                                style={{
                                                    ...thStyle,
                                                    backgroundColor: "#F1DDDC",
                                                }}
                                            >
                                                {m.name}-{String(year).slice(-2)}
                                            </th>
                                        ))}
                                    </tr>

                                    <tr>
                                        {Array.from({
                                            length: 5 + activeMonths.length,
                                        }).map((_, index) => (
                                            <React.Fragment key={index}>
                                                <th
                                                    style={{
                                                        ...thStyle,
                                                        backgroundColor:
                                                            "#FFFF00",
                                                        fontSize: "8px",
                                                    }}
                                                >
                                                    Plan
                                                </th>

                                                <th
                                                    style={{
                                                        ...thStyle,
                                                        backgroundColor:
                                                            "#FFFF00",
                                                        fontSize: "8px",
                                                    }}
                                                >
                                                    Actual
                                                </th>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {leading.map((item, index) => {
                                        if (item.isHeader) {
                                            return (
                                                <tr key={`header-${item.no}`} style={{ backgroundColor: "#F1F5F9" }}>
                                                    <td
                                                        colSpan={5 + (5 + activeMonths.length) * 2}
                                                        style={{
                                                            ...tdStyle,
                                                            fontWeight: "700",
                                                            backgroundColor: "#E2E8F0",
                                                            color: "#0F172A",
                                                            padding: "7px 10px",
                                                            textAlign: "left",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                display: "inline-block",
                                                                minWidth: "25px",
                                                                marginRight: "8px",
                                                                padding: "2px 6px",
                                                                backgroundColor: "#FFFF00",
                                                                border: "1px solid #222",
                                                                textAlign: "center",
                                                                fontWeight: "700",
                                                            }}
                                                        >
                                                            {item.no}
                                                        </span>
                                                        <strong>{item.indicator}</strong>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return (
                                        <tr key={item.no}>
                                            <td
                                                style={{
                                                    ...tdStyle,
                                                    fontWeight: item.parentNo ? "600" : "700",
                                                    paddingLeft: item.parentNo ? "25px" : "8px",
                                                    whiteSpace: "pre-line",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        minWidth: "25px",
                                                        marginRight: "5px",
                                                        padding: "2px 5px",
                                                        backgroundColor:
                                                            item.parentNo ? "#FEF08A" : "#FFFF00",
                                                        border: "1px solid #222",
                                                        textAlign: "center",
                                                        fontSize: "10px",
                                                    }}
                                                >
                                                    {item.no}
                                                </span>

                                                {item.indicator}
                                            </td>

                                            <td
                                                style={{
                                                    ...tdStyle,
                                                    textAlign: "center",
                                                }}
                                            >
                                                {item.definition}
                                            </td>

                                            <td style={tdCenter}>
                                                {typeof item.monthlyTarget ===
                                                "string"
                                                    ? item.monthlyTarget
                                                    : formatNumber(
                                                          item.monthlyTarget,
                                                      )}
                                            </td>

                                            <td style={tdCenter}>
                                                {typeof item.annualTarget ===
                                                "string"
                                                    ? item.annualTarget
                                                    : formatNumber(
                                                          item.annualTarget,
                                                      )}
                                            </td>

                                            <td
                                                style={{
                                                    ...tdStyle,
                                                    whiteSpace: "pre-line",
                                                }}
                                            >
                                                {item.definition2}
                                            </td>

                                            {renderPlanActualCells(item)}
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* NOTES */}

                        <div
                            style={{
                                minWidth: "2200px",
                                marginTop: "18px",
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: "#064E3B",
                                    color: "white",
                                    padding: "9px",
                                    fontWeight: "700",
                                }}
                            >
                                NOTES / REMARKS
                            </div>

                            <div
                                style={{
                                    padding: "15px",
                                    minHeight: "60px",
                                    backgroundColor: "#F5FFD0",
                                    border: "1px solid #222",
                                }}
                            >
                                {latestReport?.remarks || ""}
                            </div>
                        </div>

                        {/* SIGNATURE */}

                        <div
                            style={{
                                minWidth: "2200px",
                                marginTop: "18px",
                            }}
                        >
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr",
                                }}
                            >
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "7px",
                                        backgroundColor: "#F1DDDC",
                                        border: "1px solid #222",
                                    }}
                                >
                                    Dilaporkan oleh,
                                </div>

                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "7px",
                                        backgroundColor: "#F1DDDC",
                                        border: "1px solid #222",
                                    }}
                                >
                                    Disetujui oleh,
                                </div>

                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "7px",
                                        backgroundColor: "#F1DDDC",
                                        border: "1px solid #222",
                                    }}
                                >
                                    Diketahui Oleh,
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr",
                                }}
                            >
                                <div
                                    style={{
                                        height: "120px",
                                        border: "1px solid #222",
                                    }}
                                />

                                <div
                                    style={{
                                        height: "120px",
                                        border: "1px solid #222",
                                    }}
                                />

                                <div
                                    style={{
                                        height: "120px",
                                        border: "1px solid #222",
                                    }}
                                />
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr",
                                }}
                            >
                                <div
                                    style={{
                                        textAlign: "center",
                                        fontWeight: "700",
                                        padding: "5px",
                                        border: "1px solid #222",
                                    }}
                                >
                                    FENNIELLY DHINAWALY
                                </div>

                                <div
                                    style={{
                                        textAlign: "center",
                                        fontWeight: "700",
                                        padding: "5px",
                                        border: "1px solid #222",
                                    }}
                                >
                                    SAIDO
                                </div>

                                <div
                                    style={{
                                        padding: "5px",
                                        border: "1px solid #222",
                                    }}
                                />
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr",
                                }}
                            >
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "5px",
                                        backgroundColor: "#F1DDDC",
                                        border: "1px solid #222",
                                    }}
                                >
                                    HSE & ISO Jr. Manager
                                </div>

                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "5px",
                                        backgroundColor: "#F1DDDC",
                                        border: "1px solid #222",
                                    }}
                                >
                                    General Manager
                                </div>

                                <div
                                    style={{
                                        padding: "5px",
                                        backgroundColor: "#F1DDDC",
                                        border: "1px solid #222",
                                    }}
                                />
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* MODAL POP-UP KONFIRMASI / PENGINGAT EKSPOR EXCEL */}
            <ExportExcelConfirmModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onConfirm={handleConfirmExport}
                isExporting={exporting}
                reportConfig={{
                    reportType: "HSE Performance",
                    period,
                    year,
                    rig,
                    project,
                    location,
                    reportDate,
                }}
            />
        </div>
    );
}

/* ============================================================
   SUB-COMPONENT: MODAL PENGINGAT EKSPOR EXCEL
============================================================ */

function ExportExcelConfirmModal({ isOpen, onClose, onConfirm, isExporting, reportConfig }) {
    const [confirmSignCheckbox, setConfirmSignCheckbox] = useState(false);

    if (!isOpen) return null;

    const { reportType, period, year, rig, project, location } = reportConfig || {};

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(15, 23, 42, 0.65)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: "20px",
                boxSizing: "border-box",
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    maxWidth: "520px",
                    width: "100%",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
                    border: "1.5px solid #fde68a",
                    overflow: "hidden",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "18px 24px",
                        backgroundColor: "#b45309",
                        backgroundImage: "linear-gradient(135deg, #b45309 0%, #78350f 100%)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "20px" }}>⚠️</span>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#fef3c7" }}>
                                Pengingat Ekspor Laporan Excel
                            </h3>
                            <p style={{ margin: 0, fontSize: "11.5px", color: "#fde68a", fontWeight: "600" }}>
                                Pemeriksaan Kelengkapan Tanda Tangan & Administrasi
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isExporting}
                        style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            color: "#fde68a",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            borderRadius: "4px",
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: "22px 24px" }}>
                    {/* Warning Box */}
                    <div
                        style={{
                            backgroundColor: "#fffbeb",
                            border: "1.5px solid #fde68a",
                            borderRadius: "10px",
                            padding: "16px 18px",
                            marginBottom: "16px",
                            display: "flex",
                            gap: "12px",
                            alignItems: "flex-start",
                        }}
                    >
                        <AlertTriangle size={22} color="#b45309" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <div style={{ fontSize: "13.5px", color: "#92400e", lineHeight: "1.55", fontWeight: "600" }}>
                            File laporan Excel akan segera diunduh. Jangan lupa untuk mengisi nama Asmen dan menambahkan tanda tangan manual pada berkas Excel setelah file berhasil diekspor.
                        </div>
                    </div>

                    {/* Metadata Summary Box */}
                    <div
                        style={{
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "9px",
                            padding: "12px 16px",
                            marginBottom: "18px",
                            fontSize: "12.5px",
                        }}
                    >
                        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "6px", marginBottom: "6px" }}>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>Jenis Laporan:</span>
                            <span style={{ color: "#0f172a", fontWeight: "700" }}>{reportType || "HSE Performance"}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "6px", marginBottom: "6px" }}>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>Periode / Tahun:</span>
                            <span style={{ color: "#004d32", fontWeight: "800" }}>{period} - Tahun {year}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "6px", marginBottom: "6px" }}>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>Rig / Lokasi:</span>
                            <span style={{ color: "#0f172a", fontWeight: "700" }}>{rig} ({location})</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "6px" }}>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>Nomor Kontrak:</span>
                            <span style={{ color: "#0f172a", fontWeight: "700" }}>{project === "All Projects" ? "-- Semua Nomor Kontrak --" : project}</span>
                        </div>
                    </div>

                    {/* Optional Checkbox */}
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            cursor: "pointer",
                            userSelect: "none",
                            backgroundColor: confirmSignCheckbox ? "#f0fdf4" : "#f8fafc",
                            border: confirmSignCheckbox ? "1.5px solid #86efac" : "1px solid #cbd5e1",
                            borderRadius: "8px",
                            padding: "11px 14px",
                            transition: "all 0.15s ease",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={confirmSignCheckbox}
                            onChange={(e) => setConfirmSignCheckbox(e.target.checked)}
                            style={{
                                width: "16px",
                                height: "16px",
                                accentColor: "#004d32",
                                cursor: "pointer",
                            }}
                        />
                        <span style={{ fontSize: "13px", fontWeight: "700", color: confirmSignCheckbox ? "#166534" : "#334155" }}>
                            Saya memahami dan akan melengkapi tanda tangan.{" "}
                            <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#64748b" }}>(opsional)</span>
                        </span>
                    </label>
                </div>

                {/* Footer Actions */}
                <div
                    style={{
                        padding: "14px 24px",
                        backgroundColor: "#f1f5f9",
                        borderTop: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isExporting}
                        style={{
                            height: "38px",
                            padding: "0 18px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #cbd5e1",
                            borderRadius: "7px",
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#475569",
                            cursor: "pointer",
                        }}
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isExporting}
                        style={{
                            height: "38px",
                            padding: "0 22px",
                            backgroundColor: "#EFFF00",
                            border: "1px solid #d9e021",
                            borderRadius: "7px",
                            fontSize: "13px",
                            fontWeight: "800",
                            color: "#064E3B",
                            cursor: isExporting ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <Download size={15} />
                        {isExporting ? "Mengunduh File..." : "Lanjutkan Ekspor / Unduh Excel"}
                    </button>
                </div>
            </div>
        </div>
    );
}
