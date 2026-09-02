import React, { useMemo, useState } from "react";
import AdminSidebar from "../../Components/AdminSidebar";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { usePage } from "@inertiajs/react";

/* ============================================================
   BASIC HELPER
============================================================ */

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
        report?.report_date ||
        report?.issued_date ||
        report?.created_at
    ) {
        const date = new Date(
            report.report_date ||
                report.issued_date ||
                report.created_at,
        );

        if (!Number.isNaN(date.getTime())) {
            return date.getMonth();
        }
    }

    if (report?.period !== undefined) {
        const period = Number(report.period);

        if (period >= 1 && period <= 12) {
            return period - 1;
        }
    }

    return 0;
}

function quarter(values, q) {
    const start = q * 3;

    return values
        .slice(start, start + 3)
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

    return number(map[quarterName]);
}

function normalizeReport(report) {
    return {
        ...report,

        manHours: Array.isArray(report?.man_hours)
            ? report.man_hours
            : Array.isArray(report?.manHours)
              ? report.manHours
              : [],

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
        definition:
            "Frequency rate = (kasus cedera x 200.000) / Jam Kerja",
        unit: "Case",
    },
    {
        no: "1.2",
        name: "SERIOUS LOST TIME INJURY (>21 LOST DAY)",
        definition:
            "Frequency rate = (kasus cedera x 200.000) / Jam Kerja",
        unit: "Case",
    },
    {
        no: "1.3",
        name: "RESTRICTED WORK CASE (RWC)",
        definition:
            "Frequency rate = (kasus cedera x 200.000) / Jam Kerja",
        unit: "Case",
    },
    {
        no: "1.4",
        name: "MEDICAL TREATMENT CASE (MTC)",
        definition:
            "Frequency rate = (kasus cedera x 200.000) / Jam Kerja",
        unit: "Case",
    },
    {
        no: "1.5",
        name: "TOTAL RECORDABLE INJURY",
        definition:
            "Frequency rate = (kasus cedera x 200.000) / Jam Kerja",
        unit: "Case",
    },
    {
        no: "1.6",
        name: "MOTOR VEHICLE CRASH (MVC)",
        definition:
            "MVC FR = (kasus x 1.000.000) / kilometer Perjalanan Kendaraan",
        unit: "Case",
    },
    {
        no: "1.7",
        name: "TUMPAHAN / OIL SPILL",
        definition: "Record case >1 barrel",
        unit: "Case",
    },
    {
        no: "1.8",
        name: "FIRE",
        definition: "Record case > Rp. 100 Jt",
        unit: "Case",
    },
    {
        no: "1.9",
        name: "PROPERTY DAMAGE",
        definition: "Record case > Rp. 100 Jt",
        unit: "Case",
    },
    {
        no: "1.10",
        name: "SECURITY CASE",
        definition: "Record case",
        unit: "Case",
    },
    {
        no: "1.11",
        name: "ILLNESS/FATALITY",
        definition: "Record case",
        unit: "Case",
    },
    {
        no: "1.12",
        name: "REPORTABLE CASE : OPS. INCIDENT / ETA / FAC / NEARMISS",
        definition: "Reportable case",
        unit: "Case",
    },
];

/* ============================================================
   LEADING MASTER
   36 POINT SESUAI TEMPLATE EXCEL
============================================================ */

const LEADING_INDICATOR_MASTER = [
    {
        no: 1,
        indicator:
            "OBSERVASI PERILAKU (PEKA) *",
    },
    {
        no: 2,
        indicator:
            "IDENTIFIKASI BAHAYA (HAZID/5 MNT RISK ASSESSMENT)",
    },
    {
        no: 3,
        indicator: "SWA REPORT",
    },
    {
        no: 4,
        indicator:
            "INSPEKSI SAFETY EQUIPMENT & APD * (Eye wash, Shower, Firex, P3K, Tandu, FBH, SCBA)",
    },
    {
        no: 5,
        indicator:
            "EKSTERNAL INSPEKSI LR COLOR CODE",
    },
    {
        no: 6,
        indicator:
            "INSPEKSI BENDA JATUH / DROPS **",
    },
    {
        no: 7,
        indicator:
            "INTERNAL INSPEKSI / V&V OLEH TEAM",
    },
    {
        no: 8,
        indicator:
            "INSPEKSI / Audit SMK3L: PERALATAN, DATA PERSONAL MILIK SUBKONTRAKTOR",
    },
    {
        no: 9,
        indicator:
            "SPOT CHECK KENDARAAN **) **)",
    },
    {
        no: 10,
        indicator:
            "AUDIT INTERNAL & EKSTERNAL (Sistem manajemen *)",
    },
    {
        no: 11,
        indicator:
            "MONITORING KEPATUHAN MENGEMUDI\nMencakup speed / j-MPS report / fatigue *",
    },
    {
        no: 12,
        indicator:
            "Laporan Inspeksi Kendaraan (PTI)",
    },
    {
        no: 13,
        indicator:
            "SPESIFIK MCU RANDOM : NAPZA & MIRAS TEST *)",
    },
    {
        no: 14,
        indicator:
            "PRA MCU (MCU TAHUNAN BAGI YANG KONSULTASI TAHUN SEBELUMNYA)",
    },
    {
        no: 15,
        indicator:
            "TOP MANAGEMENT VISIT / MWT\n(Level General Manager / Dir. Operasi / Direktur Utama ***)",
    },
    {
        no: 16,
        indicator:
            "MANAGEMENT VISIT / MWT\nLevel Coord level s/d Manager *)",
    },
    {
        no: 17,
        indicator:
            "RAPAT RUTIN KESELAMATAN (TGM PER SHIFT/PJM)",
    },
    {
        no: 18,
        indicator:
            "PRE HITCH MEETING",
    },
    {
        no: 19,
        indicator:
            "RAPAT/FORUM BERSAMA LEADER BMS DAN PHR.",
    },
    {
        no: 20,
        indicator:
            "SAFETY TALK MONTHLY MEETING :\n- SUPPORT YARD\n- RIG (Minggu ke IV jadwal PHM)",
    },
    {
        no: 21,
        indicator:
            "LEADERSHIP FORUM ***)",
    },
    {
        no: 22,
        indicator:
            "KAMPANYE KESELAMATAN (PIN/POSTER/STIKER/SPANDUK *)",
    },
    {
        no: 23,
        indicator:
            "REVIEW, TINJAUAN MANAJEMEN *)",
    },
    {
        no: 24,
        indicator:
            "HYGIENE MONITORING : NOISE & LUX MONITORING **)",
    },
    {
        no: 25,
        indicator:
            "HYGIENE MONITORING : Mess, Catering, DAM*)",
    },
    {
        no: 26,
        indicator:
            'INSPEKSI "HOUSEKEEPING RIG"',
    },
    {
        no: 27,
        indicator:
            'PENGHARGAAN: KONTES "HOUSEKEEPING RIG" *)',
    },
    {
        no: 28,
        indicator:
            "PELAPORAN LINGKUNGAN KE DINAS LH",
    },
    {
        no: 29,
        indicator:
            "PENGHARGAAN: RIG OF THE MONTH INTERNAL / EXTERNAL **)",
    },
    {
        no: 30,
        indicator:
            "PENGHARGAAN THE BEST BBS / PEKA",
    },
    {
        no: 31,
        indicator:
            "PENGHARGAAN THE BEST DRIVER",
    },
    {
        no: 32,
        indicator:
            "PENGHARGAAN: PENCAPAIAN KERJA SELAMAT TAHUNAN",
    },
    {
        no: 33,
        indicator:
            "PENGHARGAAN HES REFRESHING :\na. Domestik (minimal 10 orang, mewakili seluruh rig di periode perpelan), sasaran: semua jabatan (operation & Support).\nb. Luar Negri - China / dll (minimal 3 orang mewakili seluruh rig beroperasi di periode pelaksanaan), sasaran: Sr. Supervisor s/d Manager level.",
    },
    {
        no: 34,
        indicator:
            '"ON SITE TRAINING" DI LOKASI *)',
    },
    {
        no: 35,
        indicator:
            "ERP DRILL RIG : H2S&SCBA / FIRE / MEDIVAC/ PENYELAMATAN KERJA DI KETINGGIAN / TUMPAHAN, **)",
    },
    {
        no: 36,
        indicator:
            "ERP DRILL YARD : FIRE / MEDIVAC / TUMPAHAN *)",
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

function calculateSummary(values) {
    const plan = values.plan;
    const actual = values.actual;

    return {
        planQ1: quarter(plan, 0),
        planQ2: quarter(plan, 1),
        planQ3: quarter(plan, 2),
        planQ4: quarter(plan, 3),

        actualQ1: quarter(actual, 0),
        actualQ2: quarter(actual, 1),
        actualQ3: quarter(actual, 2),
        actualQ4: quarter(actual, 3),

        planYtd: plan.reduce(
            (total, value) => total + number(value),
            0,
        ),

        actualYtd: actual.reduce(
            (total, value) => total + number(value),
            0,
        ),
    };
}

/* ============================================================
   BUILD LAGGING
============================================================ */

function buildLaggingRows(reports) {
    const map = new Map();

    LAGGING_INDICATOR_MASTER.forEach((master) => {
        map.set(master.no, {
            no: master.no,
            indicator: master.name,
            definition: master.definition,
            unit: master.unit,
            target: "",,
            values: createValueObject(),
            notes: "",
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

            const key =
                master?.no ||
                item.indicator_no ||
                item.indicator_name;

            if (!map.has(key)) {
                return;
            }

            const row = map.get(key);

            const month =
                Number(item.month) >= 1 &&
                Number(item.month) <= 12
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

            row.values.plan[month] += number(item.plan);

            row.values.actual[month] += number(item.actual);
        });
    });
  
    return Array.from(map.values()).map((item) => ({
        ...item,
        ...calculateSummary(item.values),
    }));
}

/* ============================================================
   BUILD LEADING
============================================================ */

function buildLeadingRows(reports) {
    const map = new Map();

    LEADING_INDICATOR_MASTER.forEach((master) => {
        map.set(String(master.no), {
            no: master.no,
            indicator: master.indicator,
            definition: "",
            definition2: "",
            monthlyTarget: 0,
            annualTarget: 0,
            unit: "Activity",
            values: createValueObject(),
            notes: "",
        });
    });

    reports.forEach((report) => {
        const indicators = report.leadingIndicators || [];

        indicators.forEach((item) => {
            const no = Number(item.indicator_no);

            if (!no || no < 1 || no > 36) {
                return;
            }

            const key = String(no);

            if (!map.has(key)) {
                return;
            }

            const row = map.get(key);

            const month =
                Number(item.month) >= 1 &&
                Number(item.month) <= 12
                    ? Number(item.month) - 1
                    : getMonthFromReport(report);

            row.values.plan[month] += number(item.plan);

            row.values.actual[month] += number(item.actual);

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
                item.target_month !== undefined
            ) {
                row.monthlyTarget = number(
                    item.target_month,
                );
            }

            if (
                item.target_year !== null &&
                item.target_year !== undefined
            ) {
                row.annualTarget = number(
                    item.target_year,
                );
            }
        });
    });

    return Array.from(map.values()).map((item) => ({
        ...item,
        ...calculateSummary(item.values),

        annualTarget:
            item.annualTarget ||
            item.monthlyTarget * 12,
    }));
}

/* ============================================================
   MAN HOURS
============================================================ */

function buildManHourRows(reports) {
    const configs = [
        {
            no: "2.1",
            name: "MANHOURS PREMISES",
            definition:
                "MANHOURS PREMISES",
            unit: "Hours",
            plan: (item) =>
                number(item?.premises_plan),
            actual: (item) =>
                number(item?.premises_actual),
        },
        {
            no: "2.2",
            name: "MANHOURS NON PREMISES",
            definition:
                "MANHOURS NON PREMISES",
            unit: "Hours",
            plan: (item) =>
                number(item?.non_premises_plan),
            actual: (item) =>
                number(item?.non_premises_actual),
        },
        {
            no: "2.3",
            name: "JML KARYAWAN CCPM",
            definition:
                "Jumlah karyawan CCPM",
            unit: "Person",
            plan: (item) =>
                number(item?.total_employees),
            actual: (item) =>
                number(item?.total_employees),
        },
        {
            no: "2.4",
            name: "KILOMETER DRIVEN PREMISES",
            definition:
                "Kilometer driven premises",
            unit: "KM",
            plan: (item) =>
                number(item?.kilometer_premises_plan),
            actual: (item) =>
                number(item?.kilometer_premises_actual),
        },
        {
            no: "2.5",
            name: "KILOMETER DRIVEN NON PREMISES",
            definition:
                "Kilometer driven non premises",
            unit: "KM",
            plan: (item) =>
                number(item?.kilometer_non_premises_plan),
            actual: (item) =>
                number(item?.kilometer_non_premises_actual),
        },
        {
            no: "2.6",
            name: "JUMLAH UNIT CCPM",
            definition:
                "Jumlah unit CCPM",
            unit: "Unit",
            plan: (item) =>
                number(item?.total_vehicles),
            actual: (item) =>
                number(item?.total_vehicles),
        },
    ];

    return configs.map((config) => {
        const values = createValueObject();

        reports.forEach((report) => {
            const month = getMonthFromReport(report);

            const manHours = Array.isArray(report.manHours)
                ? report.manHours[0]
                : report.manHours;

            if (!manHours) return;

            values.plan[month] += config.plan(manHours);
            values.actual[month] += config.actual(manHours);
        });

        return {
            no: config.no,
            indicator: config.name,
            definition: config.definition,
            unit: config.unit,
            target: 0,
            values,
            notes: "Ops : Support",

            ...calculateSummary(values),
        };
    });
}

/* ============================================================
   OPS PERFORMANCE
============================================================ */

const OPS_MASTER = [
    {
        no: "3.1",
        name: "REABILITY",
    },
    {
        no: "3.2",
        name: "AVAILABILITY",
    },
    {
        no: "3.3",
        name: "UTILIZATION",
    },
    {
        no: "3.4",
        name: "NPT TIDAK MELEBIHI BATASAN",
    },
];

function buildOpsRows(reports) {
    const rows = OPS_MASTER.map((item) => ({
        no: item.no,
        indicator: item.name,
        definition: "",
        unit: "",
        target: 0,
        values: createValueObject(),
        notes: "",
    }));

    reports.forEach((report) => {
        const indicators = report.laggingIndicators || [];

        indicators.forEach((item) => {
            const name = String(
                item.indicator_name || "",
            ).toLowerCase();

            let targetRow = null;

            if (
                name.includes("reliability") ||
                name.includes("reability")
            ) {
                targetRow = rows[0];
            } else if (
                name.includes("availability") ||
                name.includes("availibility")
            ) {
                targetRow = rows[1];
            } else if (
                name.includes("utilization")
            ) {
                targetRow = rows[2];
            } else if (name.includes("npt")) {
                targetRow = rows[3];
            }

            if (!targetRow) return;

            const month =
                Number(item.month) >= 1 &&
                Number(item.month) <= 12
                    ? Number(item.month) - 1
                    : getMonthFromReport(report);

            targetRow.values.plan[month] += number(
                item.plan,
            );

            targetRow.values.actual[month] += number(
                item.actual,
            );

            if (item.definition) {
                targetRow.definition =
                    item.definition;
            }

            if (item.unit) {
                targetRow.unit = item.unit;
            }
        });
    });

    return rows.map((row) => ({
        ...row,
        ...calculateSummary(row.values),
    }));
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function Reports() {
    const { reports: rawReports = [] } = usePage().props;

    const reports = useMemo(
        () =>
            Array.isArray(rawReports)
                ? rawReports.map(normalizeReport)
                : [],
        [rawReports],
    );

    /* ========================================================
       FILTER
    ======================================================== */

    const availableYears = useMemo(() => {
        return [
            ...new Set(
                reports.map((report) =>
                    getReportYear(report),
                ),
            ),
        ].sort((a, b) => b - a);
    }, [reports]);

    const availableRigs = useMemo(() => {
        return [
            ...new Set(
                reports
                    .map((report) => report.rig_no)
                    .filter(Boolean),
            ),
        ];
    }, [reports]);

    const availableProjects = useMemo(() => {
        return [
            ...new Set(
                reports
                    .map(
                        (report) =>
                            report.contract_no,
                    )
                    .filter(Boolean),
            ),
        ];
    }, [reports]);

    const availableLocations = useMemo(() => {
        return [
            ...new Set(
                reports
                    .map(
                        (report) =>
                            report.location_district,
                    )
                    .filter(Boolean),
            ),
        ];
    }, [reports]);

    const availableDates = useMemo(() => {
        return [
            ...new Set(
                reports
                    .map(
                        (report) =>
                            report.report_date,
                    )
                    .filter(Boolean),
            ),
        ].sort(
            (a, b) =>
                new Date(b).getTime() -
                new Date(a).getTime(),
        );
    }, [reports]);

    const defaultYear =
        availableYears.length > 0
            ? String(availableYears[0])
            : String(new Date().getFullYear());

    const [reportType, setReportType] =
        useState("HSE Performance");

    const [period, setPeriod] =
        useState("Annual");

    const [year, setYear] =
        useState(defaultYear);

    const [rig, setRig] =
        useState("All Rigs");

    const [project, setProject] =
        useState("All Projects");

    const [location, setLocation] =
        useState("All Locations");

    const [reportDate, setReportDate] =
        useState("All Dates");

    const [preview, setPreview] =
        useState(false);

    const [exporting, setExporting] =
        useState(false);

    /* ========================================================
       FILTERED REPORT
    ======================================================== */

    const filteredReports = useMemo(() => {
        let result = reports.filter(
            (report) =>
                String(getReportYear(report)) ===
                String(year),
        );

        if (rig !== "All Rigs") {
            result = result.filter(
                (report) =>
                    report.rig_no === rig,
            );
        }

        if (project !== "All Projects") {
            result = result.filter(
                (report) =>
                    report.contract_no === project,
            );
        }

        if (location !== "All Locations") {
            result = result.filter(
                (report) =>
                    report.location_district ===
                    location,
            );
        }

        if (reportDate !== "All Dates") {
            result = result.filter(
                (report) =>
                    String(
                        report.report_date,
                    ) === String(reportDate),
            );
        }

        return result.sort((a, b) => {
            const dateA = new Date(
                a.report_date ||
                    a.issued_date ||
                    a.created_at ||
                    0,
            );

            const dateB = new Date(
                b.report_date ||
                    b.issued_date ||
                    b.created_at ||
                    0,
            );

            return (
                dateB.getTime() -
                dateA.getTime()
            );
        });
    }, [
        reports,
        year,
        rig,
        project,
        location,
        reportDate,
    ]);

    /* ========================================================
       REPORT DATA
    ======================================================== */

    const lagging = useMemo(
        () =>
            buildLaggingRows(
                filteredReports,
            ),
        [filteredReports],
    );

    const manHours = useMemo(
        () =>
            buildManHourRows(
                filteredReports,
            ),
        [filteredReports],
    );

    const ops = useMemo(
        () =>
            buildOpsRows(
                filteredReports,
            ),
        [filteredReports],
    );

    const leading = useMemo(
        () =>
            buildLeadingRows(
                filteredReports,
            ),
        [filteredReports],
    );

    const latestReport =
        filteredReports.length > 0
            ? filteredReports[0]
            : null;

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

    function applyCellStyle(
        cell,
        options = {},
    ) {
        cell.font = {
            name: "Arial",
            size: options.size || 9,
            bold: options.bold || false,
            color:
                options.color || "000000",
        };

        cell.alignment = {
            vertical:
                options.vertical || "middle",
            horizontal:
                options.horizontal ||
                "center",
            wrapText:
                options.wrapText !== false,
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
                    argb:
                        options.borderColor ||
                        "222222",
                },
            },
            bottom: {
                style: "thin",
                color: {
                    argb:
                        options.borderColor ||
                        "222222",
                },
            },
            left: {
                style: "thin",
                color: {
                    argb:
                        options.borderColor ||
                        "222222",
                },
            },
            right: {
                style: "thin",
                color: {
                    argb:
                        options.borderColor ||
                        "222222",
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
            `KEY PERFORMANCE INDICATOR BMS#03A`;

        applyCellStyle(ws.getCell("A1"), {
            size: 15,
            bold: true,
            color: "FFFFFF",
            fill: "075E45",
        });

        ws.getRow(1).height = 30;

        ws.mergeCells("A2:J2");
        ws.getCell("A2").value =
            `Tahun Periode : ${year}`;

        ws.mergeCells("K2:S2");

        const issuedDate =
            latestReport?.report_date ||
            latestReport?.issued_date;

        ws.getCell("K2").value =
            `Tgl Diterbitkan / Rev. : ${
                issuedDate
                    ? formatDate(issuedDate)
                    : "-"
            } / Rev.${
                latestReport?.revision_no ??
                "00"
            }`;

        ws.mergeCells("T2:AG2");

        ws.getCell("T2").value =
            `Fokus Corp / Project : ${
                project === "All Projects"
                    ? latestReport?.contract_no ||
                      "-"
                    : project
            }`;

        ws.mergeCells("A3:J3");
        ws.getCell("A3").value =
            `Periode : ${period}`;

        ws.mergeCells("K3:S3");
        ws.getCell("K3").value =
            `Rig / Location : ${
                rig === "All Rigs"
                    ? "All Rigs"
                    : rig
            }`;

        ws.mergeCells("T3:AG3");
        ws.getCell("T3").value =
            `Lokasi / Distrik : ${
                location ===
                "All Locations"
                    ? latestReport?.location_district ||
                      "-"
                    : location
            }`;

        ws.mergeCells("A4:AG4");
        ws.getCell("A4").value =
            "REFERENSI PROGRAM";

        ws.mergeCells("A5:AG5");
        ws.getCell("A5").value =
            latestReport?.program_reference ||
            "-";

        for (let row = 2; row <= 5; row++) {
            ws.getRow(row).height =
                row === 5 ? 28 : 22;

            ws.getRow(row).eachCell(
                (cell) => {
                    applyCellStyle(cell, {
                        size: 9,
                        bold: row !== 5,
                        color: "064E3B",
                        fill:
                            row === 4
                                ? "EFFF00"
                                : row === 5
                                  ? "FAFFF0"
                                  : "F5FFD0",
                        horizontal: "left",
                    });
                },
            );
        }
    }

    /* ========================================================
       EXCEL LAGGING
    ======================================================== */

    function buildExcelLagging(
        ws,
        startRow,
    ) {
        let row = startRow;

        ws.mergeCells(row, 1, row, 38);

        ws.getCell(row, 1).value =
            "LAGGING INDICATOR";

        applyCellStyle(
            ws.getCell(row, 1),
            {
                size: 14,
                bold: true,
                color: "000000",
                fill: "00FF20",
            },
        );

        row++;

        /* HEADER */

        const header1 = row;
        const header2 = row + 1;

        ws.mergeCells(
            header1,
            1,
            header2,
            1,
        );

        ws.mergeCells(
            header1,
            2,
            header2,
            2,
        );

        ws.mergeCells(
            header1,
            3,
            header2,
            3,
        );

        ws.mergeCells(
            header1,
            4,
            header2,
            4,
        );

        ws.getCell(header1, 1).value =
            "POINT YANG DIUKUR";

        ws.getCell(header1, 2).value =
            "DEFINISI\n(FREQUENCY RATE / UNIT)";

        ws.getCell(header1, 3).value =
            "TARGET / ESTIMASI / MONTH";

        ws.getCell(header1, 4).value =
            "KETERANGAN";

        for (let col = 1; col <= 4; col++) {
            applyCellStyle(
                ws.getCell(
                    header1,
                    col,
                ),
                {
                    bold: true,
                    fill: "F1DDDC",
                },
            );
        }

        let col = 5;

        ["Q1", "Q2", "Q3", "Q4"].forEach(
            (q) => {
                ws.mergeCells(
                    header1,
                    col,
                    header1,
                    col + 1,
                );

                ws.getCell(
                    header1,
                    col,
                ).value = q;

                applyCellStyle(
                    ws.getCell(
                        header1,
                        col,
                    ),
                    {
                        bold: true,
                        fill: "F1DDDC",
                    },
                );

                ws.getCell(
                    header2,
                    col,
                ).value = "Plan";

                ws.getCell(
                    header2,
                    col + 1,
                ).value = "Actual";

                applyCellStyle(
                    ws.getCell(
                        header2,
                        col,
                    ),
                    {
                        bold: true,
                        fill: "F1DDDC",
                    },
                );

                applyCellStyle(
                    ws.getCell(
                        header2,
                        col + 1,
                    ),
                    {
                        bold: true,
                        fill: "F1DDDC",
                    },
                );

                col += 2;
            },
        );

        ws.mergeCells(
            header1,
            col,
            header1,
            col + 1,
        );

        ws.getCell(
            header1,
            col,
        ).value = "TOTAL KUMULATIF YTD";

        ws.getCell(
            header2,
            col,
        ).value = "Plan";

        ws.getCell(
            header2,
            col + 1,
        ).value = "Actual";

        applyCellStyle(
            ws.getCell(
                header1,
                col,
            ),
            {
                bold: true,
                fill: "F1DDDC",
            },
        );

        applyCellStyle(
            ws.getCell(
                header2,
                col,
            ),
            {
                bold: true,
                fill: "F1DDDC",
            },
        );

        applyCellStyle(
            ws.getCell(
                header2,
                col + 1,
            ),
            {
                bold: true,
                fill: "F1DDDC",
            },
        );

        col += 2;

        /* MONTH HEADER */

        MONTHS.forEach((month) => {
            ws.mergeCells(
                header1,
                col,
                header1,
                col + 1,
            );

            ws.getCell(
                header1,
                col,
            ).value =
                `${month}-${String(
                    year,
                ).slice(-2)}`;

            ws.getCell(
                header2,
                col,
            ).value = "Plan";

            ws.getCell(
                header2,
                col + 1,
            ).value = "Actual";

            applyCellStyle(
                ws.getCell(
                    header1,
                    col,
                ),
                {
                    bold: true,
                    fill: "F1DDDC",
                },
            );

            applyCellStyle(
                ws.getCell(
                    header2,
                    col,
                ),
                {
                    bold: true,
                    fill: "FFFF00",
                },
            );

            applyCellStyle(
                ws.getCell(
                    header2,
                    col + 1,
                ),
                {
                    bold: true,
                    fill: "FFFF00",
                },
            );

            col += 2;
        });

        row += 2;

        /* SECTION 1 */

        ws.mergeCells(row, 1, row, 38);
        ws.getCell(row, 1).value =
            "1. HES PERFORMANCE";

        applyCellStyle(
            ws.getCell(row, 1),
            {
                bold: true,
                color: "000000",
                fill: "D9D9D9",
                horizontal: "left",
            },
        );

        row++;

        lagging.forEach((item) => {
            const values = [
                `${item.no} ${item.indicator}`,
                item.definition || "",
                item.target,
                item.notes || "",
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

            item.values.plan.forEach(
                (value, index) => {
                    values.push(value);
                    values.push(
                        item.values.actual[
                            index
                        ],
                    );
                },
            );

            values.forEach(
                (value, index) => {
                    const cell =
                        ws.getCell(
                            row,
                            index + 1,
                        );

                    cell.value = value;

                    applyCellStyle(
                        cell,
                        {
                            size: 8,
                            bold:
                                index === 0 ||
                                index === 1,
                            horizontal:
                                index === 1
                                    ? "left"
                                    : "center",
                            fill:
                                row % 2 === 0
                                    ? "FFFFFF"
                                    : "F7F8EE",
                        },
                    );
                },
            );

            row++;
        });

        /* SECTION 2 */

        ws.mergeCells(row, 1, row, 38);
        ws.getCell(row, 1).value =
            "2. MAN HOURS & KILOMETER PERFORMANCE";

        applyCellStyle(
            ws.getCell(row, 1),
            {
                bold: true,
                color: "000000",
                fill: "D9D9D9",
                horizontal: "left",
            },
        );

        row++;

        ws.mergeCells(row, 1, row, 38);
        ws.getCell(row, 1).value =
            "JAM KERJA / MAN HOURS (Total)";

        applyCellStyle(
            ws.getCell(row, 1),
            {
                bold: true,
                color: "000000",
                fill: "DDEBF7",
                horizontal: "left",
            },
        );

        row++;

        const writeMetric = (item) => {
            const values = [
                item.no,
                item.indicator,
                item.target,
                item.notes || "",
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

            item.values.plan.forEach(
                (value, index) => {
                    values.push(value);
                    values.push(
                        item.values.actual[
                            index
                        ],
                    );
                },
            );

            values.forEach(
                (value, index) => {
                    const cell =
                        ws.getCell(
                            row,
                            index + 1,
                        );

                    cell.value = value;

                    applyCellStyle(
                        cell,
                        {
                            size: 8,
                            bold:
                                index === 0 ||
                                index === 1,
                            horizontal:
                                index === 1
                                    ? "left"
                                    : "center",
                        },
                    );
                },
            );

            row++;
        };

        manHours
            .filter((item) =>
                ["2.1", "2.2", "2.3"].includes(
                    item.no,
                ),
            )
            .forEach(writeMetric);

        ws.mergeCells(row, 1, row, 38);
        ws.getCell(row, 1).value =
            "Ops : Support";

        applyCellStyle(
            ws.getCell(row, 1),
            {
                size: 8,
                horizontal: "center",
            },
        );

        row++;

        ws.mergeCells(row, 1, row, 38);
        ws.getCell(row, 1).value =
            "KILOMETER DRIVEN (Total)";

        applyCellStyle(
            ws.getCell(row, 1),
            {
                bold: true,
                color: "000000",
                fill: "DDEBF7",
                horizontal: "left",
            },
        );

        row++;

        manHours
            .filter((item) =>
                ["2.4", "2.5", "2.6"].includes(
                    item.no,
                ),
            )
            .forEach(writeMetric);

        ws.mergeCells(row, 1, row, 38);
        ws.getCell(row, 1).value =
            "Ops : Support";

        applyCellStyle(
            ws.getCell(row, 1),
            {
                size: 8,
                horizontal: "center",
            },
        );

        row++;

        /* SECTION 3 */

        ws.mergeCells(row, 1, row, 38);
        ws.getCell(row, 1).value =
            "3. OPS PERFORMANCE";

        applyCellStyle(
            ws.getCell(row, 1),
            {
                bold: true,
                color: "000000",
                fill: "D9D9D9",
                horizontal: "left",
            },
        );

        row++;

        ops.forEach(writeMetric);

        return row + 1;
    }

    /* ========================================================
       EXCEL LEADING
    ======================================================== */

    function buildExcelLeading(
        ws,
        startRow,
    ) {
        let row = startRow;

        ws.mergeCells(row, 1, row, 39);

        ws.getCell(row, 1).value =
            "LEADING INDICATOR";

        applyCellStyle(
            ws.getCell(row, 1),
            {
                size: 14,
                bold: true,
                color: "000000",
                fill: "00FF20",
            },
        );

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

        leftHeaders.forEach(
            (title, index) => {
                ws.mergeCells(
                    h1,
                    index + 1,
                    h2,
                    index + 1,
                );

                ws.getCell(
                    h1,
                    index + 1,
                ).value = title;

                applyCellStyle(
                    ws.getCell(
                        h1,
                        index + 1,
                    ),
                    {
                        size: 8,
                        bold: true,
                        fill: "F1DDDC",
                    },
                );
            },
        );

        let col = 6;

        ["Q1", "Q2", "Q3", "Q4"].forEach(
            (q) => {
                ws.mergeCells(
                    h1,
                    col,
                    h1,
                    col + 1,
                );

                ws.getCell(
                    h1,
                    col,
                ).value = q;

                ws.getCell(
                    h2,
                    col,
                ).value = "Plan";

                ws.getCell(
                    h2,
                    col + 1,
                ).value = "Actual";

                applyCellStyle(
                    ws.getCell(
                        h1,
                        col,
                    ),
                    {
                        bold: true,
                        fill: "F1DDDC",
                    },
                );

                applyCellStyle(
                    ws.getCell(
                        h2,
                        col,
                    ),
                    {
                        bold: true,
                        fill: "FFFF00",
                    },
                );

                applyCellStyle(
                    ws.getCell(
                        h2,
                        col + 1,
                    ),
                    {
                        bold: true,
                        fill: "FFFF00",
                    },
                );

                col += 2;
            },
        );

        ws.mergeCells(
            h1,
            col,
            h1,
            col + 1,
        );

        ws.getCell(h1, col).value =
            "TOTAL KUMULATIF YTD";

        ws.getCell(h2, col).value =
            "Plan";

        ws.getCell(
            h2,
            col + 1,
        ).value = "Actual";

        applyCellStyle(
            ws.getCell(h1, col),
            {
                bold: true,
                fill: "F1DDDC",
            },
        );

        applyCellStyle(
            ws.getCell(h2, col),
            {
                bold: true,
                fill: "FFFF00",
            },
        );

        applyCellStyle(
            ws.getCell(h2, col + 1),
            {
                bold: true,
                fill: "FFFF00",
            },
        );

        col += 2;

        ws.mergeCells(
            h1,
            col,
            h1,
            col + 23,
        );

        ws.getCell(h1, col).value =
            `TARGET IMPLEMENTASI ${year}`;

        applyCellStyle(
            ws.getCell(h1, col),
            {
                size: 12,
                fill: "F1DDDC",
            },
        );

        let monthCol = col;

        MONTHS.forEach((month) => {
            ws.mergeCells(
                h2,
                monthCol,
                h2,
                monthCol + 1,
            );

            ws.getCell(
                h2,
                monthCol,
            ).value =
                `${month}-${String(
                    year,
                ).slice(-2)}`;

            applyCellStyle(
                ws.getCell(
                    h2,
                    monthCol,
                ),
                {
                    size: 8,
                    fill: "F1DDDC",
                },
            );

            monthCol += 2;
        });

        row += 2;

        leading.forEach((item) => {
            const values = [
                `${item.no}. ${item.indicator}`,
                item.definition || "",
                item.monthlyTarget,
                item.annualTarget,
                item.definition2 ||
                    item.notes ||
                    "",
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

            item.values.plan.forEach(
                (value, index) => {
                    values.push(value);
                    values.push(
                        item.values.actual[
                            index
                        ],
                    );
                },
            );

            values.forEach(
                (value, index) => {
                    const cell =
                        ws.getCell(
                            row,
                            index + 1,
                        );

                    cell.value = value;

                    applyCellStyle(
                        cell,
                        {
                            size: 8,
                            bold:
                                index === 0,
                            horizontal:
                                index === 0 ||
                                index === 1 ||
                                index === 4
                                    ? "left"
                                    : "center",
                            fill:
                                row % 2 === 0
                                    ? "FFFFFF"
                                    : "F7F8EE",
                        },
                    );
                },
            );

            row++;
        });

        return row + 1;
    }

    /* ========================================================
       SIGNATURE EXCEL
    ======================================================== */

    function buildExcelSignature(
        ws,
        startRow,
    ) {
        const row = startRow;

        /* HEADER */

        ws.mergeCells(
            row,
            1,
            row,
            13,
        );

        ws.mergeCells(
            row,
            14,
            row,
            26,
        );

        ws.mergeCells(
            row,
            27,
            row,
            39,
        );

        ws.getCell(row, 1).value =
            "Dilaporkan oleh,";

        ws.getCell(row, 14).value =
            "Disetujui oleh,";

        ws.getCell(row, 27).value =
            "Diketahui Oleh,";

        [1, 14, 27].forEach(
            (col) => {
                applyCellStyle(
                    ws.getCell(
                        row,
                        col,
                    ),
                    {
                        size: 9,
                        fill: "F1DDDC",
                    },
                );
            },
        );

        /* AREA TTD */

        ws.mergeCells(
            row + 1,
            1,
            row + 5,
            13,
        );

        ws.mergeCells(
            row + 1,
            14,
            row + 5,
            26,
        );

        ws.mergeCells(
            row + 1,
            27,
            row + 5,
            39,
        );

        [1, 14, 27].forEach(
            (col) => {
                applyCellStyle(
                    ws.getCell(
                        row + 1,
                        col,
                    ),
                    {
                        size: 9,
                        horizontal:
                            "center",
                    },
                );
            },
        );

        /* NAMA */

        ws.mergeCells(
            row + 6,
            1,
            row + 6,
            13,
        );

        ws.mergeCells(
            row + 6,
            14,
            row + 6,
            26,
        );

        ws.mergeCells(
            row + 6,
            27,
            row + 6,
            39,
        );

        ws.getCell(
            row + 6,
            1,
        ).value =
            "FENNIELLY DHINAWALY";

        ws.getCell(
            row + 6,
            14,
        ).value = "SAIDO";

        /* KOTAK KETIGA KOSONG */

        ws.getCell(
            row + 6,
            27,
        ).value = "";

        [1, 14, 27].forEach(
            (col) => {
                applyCellStyle(
                    ws.getCell(
                        row + 6,
                        col,
                    ),
                    {
                        size: 9,
                        bold: true,
                    },
                );
            },
        );

        /* JABATAN */

        ws.mergeCells(
            row + 7,
            1,
            row + 7,
            13,
        );

        ws.mergeCells(
            row + 7,
            14,
            row + 7,
            26,
        );

        ws.mergeCells(
            row + 7,
            27,
            row + 7,
            39,
        );

        ws.getCell(
            row + 7,
            1,
        ).value =
            "HSE & ISO Jr. Manager";

        ws.getCell(
            row + 7,
            14,
        ).value =
            "General Manager";

        ws.getCell(
            row + 7,
            27,
        ).value = "";

        [1, 14, 27].forEach(
            (col) => {
                applyCellStyle(
                    ws.getCell(
                        row + 7,
                        col,
                    ),
                    {
                        size: 8,
                    },
                );
            },
        );

        ws.getRow(row).height = 18;

        for (
            let r = row + 1;
            r <= row + 5;
            r++
        ) {
            ws.getRow(r).height = 25;
        }

        ws.getRow(row + 6).height = 20;
        ws.getRow(row + 7).height = 20;

        return row + 8;
    }

    /* ========================================================
       EXPORT EXCEL
    ======================================================== */

    const handleExportExcel =
        async () => {
            if (
                filteredReports.length ===
                0
            ) {
                alert(
                    "Tidak ada data report yang sesuai dengan filter.",
                );

                return;
            }

            try {
                setExporting(true);

                const workbook =
                    new ExcelJS.Workbook();

                const ws =
                    workbook.addWorksheet(
                        "KPI BMS#03A",
                    );

                ws.pageSetup = {
                    orientation:
                        "landscape",
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

                row = buildExcelLagging(
                    ws,
                    row,
                );

                row = buildExcelLeading(
                    ws,
                    row,
                );

                ws.mergeCells(
                    row,
                    1,
                    row,
                    39,
                );

                ws.getCell(row, 1).value =
                    "NOTES / REMARKS";

                applyCellStyle(
                    ws.getCell(row, 1),
                    {
                        bold: true,
                        color: "FFFFFF",
                        fill: "064E3B",
                        horizontal:
                            "left",
                    },
                );

                row++;

                ws.mergeCells(
                    row,
                    1,
                    row + 2,
                    39,
                );

                ws.getCell(row, 1).value =
                    latestReport?.remarks ||
                    "Report dibuat berdasarkan data HSE yang tersimpan pada database.";

                applyCellStyle(
                    ws.getCell(row, 1),
                    {
                        size: 9,
                        fill: "F5FFD0",
                        horizontal:
                            "left",
                        vertical:
                            "top",
                    },
                );

                row += 4;

                row =
                    buildExcelSignature(
                        ws,
                        row,
                    );

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
                    ...Array(24).fill(
                        10,
                    ),
                ];

                widths.forEach(
                    (width, index) => {
                        ws.getColumn(
                            index + 1,
                        ).width = width;
                    },
                );

                ws.views = [];

                ws.pageSetup.printArea =
                    `A1:AM${row}`;

                ws.headerFooter.oddFooter =
                    "&CBMSINDO - KPI / HSE REPORT&RPage &P of &N";

                const buffer =
                    await workbook.xlsx.writeBuffer();

                const blob = new Blob(
                    [buffer],
                    {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    },
                );

                const safeProject =
                    project.replace(
                        /[^a-zA-Z0-9]+/g,
                        "_",
                    );

                const safeRig =
                    rig.replace(
                        /[^a-zA-Z0-9]+/g,
                        "_",
                    );

                saveAs(
                    blob,
                    `KPI_BMS03A_${year}_${safeProject}_${safeRig}_Plan_Actual.xlsx`,
                );
            } catch (error) {
                console.error(
                    "EXPORT EXCEL ERROR:",
                    error,
                );

                alert(
                    "Export Excel gagal: " +
                        (error?.message ||
                            "Terjadi kesalahan."),
                );
            } finally {
                setExporting(false);
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

    const renderPlanActualCells = (
        item,
    ) => {
        const cells = [];

        const quarterNames = [
            "Q1",
            "Q2",
            "Q3",
            "Q4",
        ];

        quarterNames.forEach(
            (q) => {
                cells.push(
                    <td
                        key={`${q}-plan`}
                        style={tdCenter}
                    >
                        {formatNumber(
                            getQuarterValue(
                                item,
                                q,
                                "Plan",
                            ),
                        )}
                    </td>,
                );

                cells.push(
                    <td
                        key={`${q}-actual`}
                        style={tdCenter}
                    >
                        {formatNumber(
                            getQuarterValue(
                                item,
                                q,
                                "Actual",
                            ),
                        )}
                    </td>,
                );
            },
        );

        cells.push(
            <td
                key="ytd-plan"
                style={tdCenter}
            >
                {formatNumber(
                    item.planYtd,
                )}
            </td>,
        );

        cells.push(
            <td
                key="ytd-actual"
                style={tdCenter}
            >
                {formatNumber(
                    item.actualYtd,
                )}
            </td>,
        );

        MONTHS.forEach(
            (month, index) => {
                cells.push(
                    <td
                        key={`${month}-plan`}
                        style={tdCenter}
                    >
                        {formatNumber(
                            item.values
                                .plan[
                                index
                            ],
                        )}
                    </td>,
                );

                cells.push(
                    <td
                        key={`${month}-actual`}
                        style={tdCenter}
                    >
                        {formatNumber(
                            item.values
                                .actual[
                                index
                            ],
                        )}
                    </td>,
                );
            },
        );

        return cells;
    };

    const renderLaggingRow = (
        item,
        index,
    ) => (
        <tr
            key={`lagging-${item.no}`}
        >
            <td
                style={{
                    ...tdStyle,
                    fontWeight: "700",
                }}
            >
                <span
                    style={{
                        display:
                            "inline-block",
                        minWidth:
                            "32px",
                        marginRight:
                            "5px",
                        padding:
                            "2px 5px",
                        backgroundColor:
                            "#FFFF00",
                        border:
                            "1px solid #222",
                        textAlign:
                            "center",
                    }}
                >
                    {item.no}
                </span>

                {item.indicator}
            </td>

            <td
                style={{
                    ...tdStyle,
                    whiteSpace:
                        "pre-line",
                }}
            >
                {item.definition ||
                    "-"}
            </td>

            <td style={tdCenter}>
                {formatNumber(
                    item.target,
                )}
            </td>

            <td
                style={{
                    ...tdStyle,
                    whiteSpace:
                        "pre-line",
                    textAlign:
                        "center",
                }}
            >
                {item.notes ||
                    ""}
            </td>

            {renderPlanActualCells(
                item,
            )}
        </tr>
    );

    const renderMetricRow = (
        item,
        index,
    ) => (
        <tr
            key={`metric-${item.no}`}
        >
            <td
                style={{
                    ...tdStyle,
                    fontWeight: "700",
                }}
            >
                <span
                    style={{
                        display:
                            "inline-block",
                        minWidth:
                            "32px",
                        marginRight:
                            "5px",
                        padding:
                            "2px 5px",
                        backgroundColor:
                            "#FFFF00",
                        border:
                            "1px solid #222",
                        textAlign:
                            "center",
                    }}
                >
                    {item.no}
                </span>

                {item.indicator}
            </td>

            <td style={tdStyle}>
                {item.definition ||
                    "-"}
            </td>

            <td style={tdCenter}>
                {formatNumber(
                    item.target,
                )}
            </td>

            <td style={tdCenter}>
                {item.notes ||
                    "Ops : Support"}
            </td>

            {renderPlanActualCells(
                item,
            )}
        </tr>
    );

    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor:
                    "#f3f7f4",
                fontFamily:
                    "Arial, sans-serif",
            }}
        >
            <AdminSidebar />

            <main
                style={{
                    marginLeft: "260px",
                    minHeight: "100vh",
                    padding: "35px",
                    boxSizing:
                        "border-box",
                }}
            >
                {/* HEADER */}

                <div
                    style={{
                        backgroundColor:
                            "white",
                        padding:
                            "18px 24px",
                        borderRadius:
                            "8px",
                        border:
                            "1px solid #d9e2de",
                        marginBottom:
                            "18px",
                        display:
                            "flex",
                        justifyContent:
                            "space-between",
                        alignItems:
                            "center",
                    }}
                >
                    <div>
                        <h1
                            style={{
                                margin: 0,
                                color:
                                    "#064E3B",
                                fontSize:
                                    "28px",
                            }}
                        >
                            Report Generation
                        </h1>

                        <p
                            style={{
                                margin:
                                    "6px 0 0",
                                color:
                                    "#526B60",
                                fontSize:
                                    "14px",
                            }}
                        >
                            Generate report
                            KPI / HSE
                            berdasarkan
                            data database.
                        </p>
                    </div>

                    <button
                        onClick={
                            handleExportExcel
                        }
                        disabled={
                            exporting ||
                            filteredReports.length ===
                                0
                        }
                        style={{
                            backgroundColor:
                                "#EFFF00",
                            color:
                                "#064E3B",
                            border:
                                "none",
                            borderRadius:
                                "6px",
                            padding:
                                "12px 18px",
                            fontSize:
                                "14px",
                            fontWeight:
                                "700",
                            cursor:
                                exporting
                                    ? "not-allowed"
                                    : "pointer",
                            opacity:
                                filteredReports.length ===
                                0
                                    ? 0.5
                                    : 1,
                        }}
                    >
                        {exporting
                            ? "Exporting..."
                            : "Export Excel"}
                    </button>
                </div>

                {/* CONFIGURATION */}

                <section
                    style={{
                        backgroundColor:
                            "white",
                        border:
                            "1px solid #d9e2de",
                        borderRadius:
                            "8px",
                        padding:
                            "20px",
                    }}
                >
                    <h2
                        style={{
                            margin:
                                "0 0 18px",
                            color:
                                "#064E3B",
                            fontSize:
                                "20px",
                        }}
                    >
                        Report Configuration
                    </h2>

                    <div
                        style={{
                            display:
                                "grid",
                            gridTemplateColumns:
                                "repeat(4, minmax(0, 1fr))",
                            gap: "14px",
                        }}
                    >
                        <label
                            style={
                                labelStyle
                            }
                        >
                            Report Type

                            <select
                                value={
                                    reportType
                                }
                                onChange={(
                                    e,
                                ) =>
                                    setReportType(
                                        e
                                            .target
                                            .value,
                                    )
                                }
                                style={
                                    selectStyle
                                }
                            >
                                <option>
                                    HSE
                                    Performance
                                </option>

                                <option>
                                    KPI Per Rig
                                </option>

                                <option>
                                    Target KPI
                                </option>
                            </select>
                        </label>

                        <label
                            style={
                                labelStyle
                            }
                        >
                            Period

                            <select
                                value={
                                    period
                                }
                                onChange={(
                                    e,
                                ) =>
                                    setPeriod(
                                        e
                                            .target
                                            .value,
                                    )
                                }
                                style={
                                    selectStyle
                                }
                            >
                                <option>
                                    Annual
                                </option>

                                <option>
                                    Monthly
                                </option>

                                <option>
                                    Quarterly
                                </option>
                            </select>
                        </label>

                        <label
                            style={
                                labelStyle
                            }
                        >
                            Year

                            <select
                                value={year}
                                onChange={(
                                    e,
                                ) =>
                                    setYear(
                                        e
                                            .target
                                            .value,
                                    )
                                }
                                style={
                                    selectStyle
                                }
                            >
                                {availableYears.map(
                                    (
                                        item,
                                    ) => (
                                        <option
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
                                        >
                                            {
                                                item
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>

                        <label
                            style={
                                labelStyle
                            }
                        >
                            Rig / Location

                            <select
                                value={
                                    rig
                                }
                                onChange={(
                                    e,
                                ) =>
                                    setRig(
                                        e
                                            .target
                                            .value,
                                    )
                                }
                                style={
                                    selectStyle
                                }
                            >
                                <option>
                                    All Rigs
                                </option>

                                {availableRigs.map(
                                    (
                                        item,
                                    ) => (
                                        <option
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
                                        >
                                            {
                                                item
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>
                    </div>

                    <div
                        style={{
                            display:
                                "grid",
                            gridTemplateColumns:
                                "repeat(3, minmax(0, 1fr))",
                            gap: "14px",
                            marginTop:
                                "14px",
                        }}
                    >
                        <label
                            style={
                                labelStyle
                            }
                        >
                            Fokus Corp /
                            Project

                            <select
                                value={
                                    project
                                }
                                onChange={(
                                    e,
                                ) =>
                                    setProject(
                                        e
                                            .target
                                            .value,
                                    )
                                }
                                style={
                                    selectStyle
                                }
                            >
                                <option>
                                    All
                                    Projects
                                </option>

                                {availableProjects.map(
                                    (
                                        item,
                                    ) => (
                                        <option
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
                                        >
                                            {
                                                item
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>

                        <label
                            style={
                                labelStyle
                            }
                        >
                            Lokasi /
                            Distrik

                            <select
                                value={
                                    location
                                }
                                onChange={(
                                    e,
                                ) =>
                                    setLocation(
                                        e
                                            .target
                                            .value,
                                    )
                                }
                                style={
                                    selectStyle
                                }
                            >
                                <option>
                                    All
                                    Locations
                                </option>

                                {availableLocations.map(
                                    (
                                        item,
                                    ) => (
                                        <option
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
                                        >
                                            {
                                                item
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>

                        <label
                            style={
                                labelStyle
                            }
                        >
                            Tanggal Report

                            <select
                                value={
                                    reportDate
                                }
                                onChange={(
                                    e,
                                ) =>
                                    setReportDate(
                                        e
                                            .target
                                            .value,
                                    )
                                }
                                style={
                                    selectStyle
                                }
                            >
                                <option>
                                    All Dates
                                </option>

                                {availableDates.map(
                                    (
                                        item,
                                    ) => (
                                        <option
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
                                        >
                                            {formatDate(
                                                item,
                                            )}
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>
                    </div>

                    <div
                        style={{
                            marginTop:
                                "18px",
                            display:
                                "flex",
                            justifyContent:
                                "flex-end",
                            gap: "10px",
                        }}
                    >
                        <button
                            onClick={
                                handleReset
                            }
                            style={{
                                backgroundColor:
                                    "white",
                                color:
                                    "#064E3B",
                                border:
                                    "1px solid #064E3B",
                                borderRadius:
                                    "6px",
                                padding:
                                    "11px 18px",
                                fontSize:
                                    "14px",
                                cursor:
                                    "pointer",
                            }}
                        >
                            Reset
                        </button>

                        <button
                            onClick={() =>
                                setPreview(
                                    true,
                                )
                            }
                            style={{
                                backgroundColor:
                                    "#064E3B",
                                color:
                                    "white",
                                border:
                                    "none",
                                borderRadius:
                                    "6px",
                                padding:
                                    "11px 18px",
                                fontSize:
                                    "14px",
                                fontWeight:
                                    "700",
                                cursor:
                                    "pointer",
                            }}
                        >
                            Generate Preview
                        </button>
                    </div>
                </section>

                {/* STATUS */}

                {preview && (
                    <div
                        style={{
                            marginTop:
                                "15px",
                            padding:
                                "12px 16px",
                            borderRadius:
                                "6px",
                            backgroundColor:
                                filteredReports.length >
                                0
                                    ? "#E8F7EF"
                                    : "#FFF1F0",
                            border:
                                filteredReports.length >
                                0
                                    ? "1px solid #B8DEC8"
                                    : "1px solid #E7B9B4",
                            color:
                                filteredReports.length >
                                0
                                    ? "#075E45"
                                    : "#A33A2B",
                            fontSize:
                                "13px",
                        }}
                    >
                        {filteredReports.length >
                        0
                            ? `Data ditemukan: ${filteredReports.length} report untuk filter yang dipilih.`
                            : "Tidak ada data report yang sesuai dengan filter."}
                    </div>
                )}

                {/* PREVIEW */}

                {preview &&
                    filteredReports.length >
                        0 && (
                        <section
                            style={{
                                marginTop:
                                    "20px",
                                backgroundColor:
                                    "white",
                                border:
                                    "1px solid #d9e2de",
                                borderRadius:
                                    "8px",
                                padding:
                                    "18px",
                                overflowX:
                                    "auto",
                            }}
                        >
                            <div
                                style={{
                                    display:
                                        "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "center",
                                    marginBottom:
                                        "14px",
                                }}
                            >
                                <div>
                                    <h2
                                        style={{
                                            margin: 0,
                                            color:
                                                "#064E3B",
                                            fontSize:
                                                "20px",
                                        }}
                                    >
                                        Report Preview:
                                        KPI
                                        BMS#03A
                                    </h2>

                                    <p
                                        style={{
                                            margin:
                                                "5px 0 0",
                                            color:
                                                "#61786D",
                                            fontSize:
                                                "13px",
                                        }}
                                    >
                                        {year}
                                        {" • "}
                                        {
                                            period
                                        }
                                        {" • "}
                                        {rig}
                                    </p>
                                </div>

                                <button
                                    onClick={
                                        handleExportExcel
                                    }
                                    disabled={
                                        exporting
                                    }
                                    style={{
                                        backgroundColor:
                                            "#EFFF00",
                                        color:
                                            "#064E3B",
                                        border:
                                            "none",
                                        borderRadius:
                                            "6px",
                                        padding:
                                            "10px 16px",
                                        fontSize:
                                            "14px",
                                        fontWeight:
                                            "700",
                                    }}
                                >
                                    {exporting
                                        ? "Exporting..."
                                        : "Export Excel"}
                                </button>
                            </div>

                            {/* DOCUMENT INFO */}

                            <div
                                style={{
                                    minWidth:
                                        "1800px",
                                    border:
                                        "1px solid #222",
                                    marginBottom:
                                        "18px",
                                }}
                            >
                                <div
                                    style={{
                                        backgroundColor:
                                            "#075E45",
                                        color:
                                            "white",
                                        padding:
                                            "12px",
                                        textAlign:
                                            "center",
                                        fontWeight:
                                            "700",
                                        fontSize:
                                            "18px",
                                    }}
                                >
                                    KEY PERFORMANCE
                                    INDICATOR
                                    BMS#03A
                                </div>

                                <div
                                    style={{
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                            "1fr 1fr 1fr",
                                    }}
                                >
                                    <div
                                        style={{
                                            padding:
                                                "10px",
                                            backgroundColor:
                                                "#F5FFD0",
                                            borderRight:
                                                "1px solid #222",
                                        }}
                                    >
                                        <strong>
                                            Tahun
                                            Periode
                                        </strong>

                                        <div>
                                            :{" "}
                                            {
                                                year
                                            }
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            padding:
                                                "10px",
                                            backgroundColor:
                                                "#F5FFD0",
                                            borderRight:
                                                "1px solid #222",
                                        }}
                                    >
                                        <strong>
                                            Tgl
                                            Diterbitkan
                                            / Rev.
                                        </strong>

                                        <div>
                                            :{" "}
                                            {latestReport?.report_date
                                                ? formatDate(
                                                      latestReport.report_date,
                                                  )
                                                : "-"}{" "}
                                            / Rev.
                                            {latestReport?.revision_no ??
                                                "00"}
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            padding:
                                                "10px",
                                            backgroundColor:
                                                "#F5FFD0",
                                        }}
                                    >
                                        <strong>
                                            Fokus Corp
                                            / Project
                                        </strong>

                                        <div>
                                            :{" "}
                                            {latestReport?.contract_no ||
                                                "-"}
                                        </div>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                            "1fr 1fr 1fr",
                                    }}
                                >
                                    <div
                                        style={{
                                            padding:
                                                "10px",
                                            borderTop:
                                                "1px solid #222",
                                            borderRight:
                                                "1px solid #222",
                                        }}
                                    >
                                        <strong>
                                            Periode
                                        </strong>

                                        <div>
                                            :{" "}
                                            {
                                                period
                                            }
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            padding:
                                                "10px",
                                            borderTop:
                                                "1px solid #222",
                                            borderRight:
                                                "1px solid #222",
                                        }}
                                    >
                                        <strong>
                                            Rig /
                                            Location
                                        </strong>

                                        <div>
                                            :{" "}
                                            {
                                                rig
                                            }
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            padding:
                                                "10px",
                                            borderTop:
                                                "1px solid #222",
                                        }}
                                    >
                                        <strong>
                                            Lokasi /
                                            Distrik
                                        </strong>

                                        <div>
                                            :{" "}
                                            {latestReport?.location_district ||
                                                "-"}
                                        </div>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        padding:
                                            "10px",
                                        borderTop:
                                            "1px solid #222",
                                        backgroundColor:
                                            "#FAFFF0",
                                    }}
                                >
                                    <strong>
                                        Referensi
                                        Program :
                                    </strong>

                                    <div
                                        style={{
                                            marginTop:
                                                "5px",
                                        }}
                                    >
                                        {latestReport?.program_reference ||
                                            "-"}
                                    </div>
                                </div>
                            </div>

                            {/* =================================================
                               LAGGING TABLE
                            ================================================= */}

                            <div
                                style={{
                                    minWidth:
                                        "2200px",
                                    border:
                                        "1px solid #222",
                                }}
                            >
                                <div
                                    style={{
                                        backgroundColor:
                                            "#00FF20",
                                        color:
                                            "#000",
                                        padding:
                                            "8px",
                                        fontWeight:
                                            "700",
                                        fontSize:
                                            "18px",
                                        textAlign:
                                            "center",
                                    }}
                                >
                                    LAGGING INDICATOR
                                </div>

                                <table
                                    style={{
                                        width:
                                            "100%",
                                        borderCollapse:
                                            "collapse",
                                        fontSize:
                                            "11px",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th
                                                rowSpan={
                                                    2
                                                }
                                                style={{
                                                    ...thStyle,
                                                    backgroundColor:
                                                        "#F1DDDC",
                                                    minWidth:
                                                        "330px",
                                                }}
                                            >
                                                POINT YANG
                                                DIUKUR
                                            </th>

                                            <th
                                                rowSpan={
                                                    2
                                                }
                                                style={{
                                                    ...thStyle,
                                                    backgroundColor:
                                                        "#F1DDDC",
                                                    minWidth:
                                                        "260px",
                                                }}
                                            >
                                                DEFINISI
                                            </th>

                                            <th
                                                rowSpan={
                                                    2
                                                }
                                                style={{
                                                    ...thStyle,
                                                    backgroundColor:
                                                        "#F1DDDC",
                                                    minWidth:
                                                        "140px",
                                                }}
                                            >
                                                TARGET /
                                                ESTIMASI /
                                                MONTH
                                            </th>

                                            <th
                                                rowSpan={
                                                    2
                                                }
                                                style={{
                                                    ...thStyle,
                                                    backgroundColor:
                                                        "#F1DDDC",
                                                    minWidth:
                                                        "140px",
                                                }}
                                            >
                                                KETERANGAN
                                            </th>

                                            {[
                                                "Q1",
                                                "Q2",
                                                "Q3",
                                                "Q4",
                                            ].map(
                                                (
                                                    q,
                                                ) => (
                                                    <th
                                                        key={
                                                            q
                                                        }
                                                        colSpan={
                                                            2
                                                        }
                                                        style={{
                                                            ...thStyle,
                                                            backgroundColor:
                                                                "#F1DDDC",
                                                        }}
                                                    >
                                                        {
                                                            q
                                                        }
                                                    </th>
                                                ),
                                            )}

                                            <th
                                                colSpan={
                                                    2
                                                }
                                                style={{
                                                    ...thStyle,
                                                    backgroundColor:
                                                        "#F1DDDC",
                                                }}
                                            >
                                                TOTAL
                                                KUMULATIF
                                                YTD
                                            </th>

                                            {MONTHS.map(
                                                (
                                                    month,
                                                ) => (
                                                    <th
                                                        key={
                                                            month
                                                        }
                                                        colSpan={
                                                            2
                                                        }
                                                        style={{
                                                            ...thStyle,
                                                            backgroundColor:
                                                                "#F1DDDC",
                                                        }}
                                                    >
                                                        {
                                                            month
                                                        }
                                                        -
                                                        {String(
                                                            year,
                                                        ).slice(
                                                            -2,
                                                        )}
                                                    </th>
                                                ),
                                            )}
                                        </tr>

                                        <tr>
                                            {Array.from(
                                                {
                                                    length: 17,
                                                },
                                            ).map(
                                                (
                                                    _,
                                                    index,
                                                ) => (
                                                    <React.Fragment
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        <th
                                                            style={{
                                                                ...thStyle,
                                                                backgroundColor:
                                                                    "#FFFF00",
                                                                fontSize:
                                                                    "9px",
                                                            }}
                                                        >
                                                            Plan
                                                        </th>

                                                        <th
                                                            style={{
                                                                ...thStyle,
                                                                backgroundColor:
                                                                    "#FFFF00",
                                                                fontSize:
                                                                    "9px",
                                                            }}
                                                        >
                                                            Actual
                                                        </th>
                                                    </React.Fragment>
                                                ),
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {/* SECTION 1 */}

                                        <tr>
                                            <td
                                                colSpan={
                                                    38
                                                }
                                                style={{
                                                    ...tdStyle,
                                                    backgroundColor:
                                                        "#D9D9D9",
                                                    fontWeight:
                                                        "700",
                                                    textAlign:
                                                        "left",
                                                }}
                                            >
                                                1. HES
                                                PERFORMANCE
                                            </td>
                                        </tr>

                                        {lagging.map(
                                            (
                                                item,
                                                index,
                                            ) =>
                                                renderLaggingRow(
                                                    item,
                                                    index,
                                                ),
                                        )}

                                        {/* SECTION 2 */}

                                        <tr>
                                            <td
                                                colSpan={
                                                    38
                                                }
                                                style={{
                                                    ...tdStyle,
                                                    backgroundColor:
                                                        "#D9D9D9",
                                                    fontWeight:
                                                        "700",
                                                }}
                                            >
                                                2. MAN
                                                HOURS &
                                                KILOMETER
                                                PERFORMANCE
                                            </td>
                                        </tr>

                                        <tr>
                                            <td
                                                colSpan={
                                                    38
                                                }
                                                style={{
                                                    ...tdStyle,
                                                    backgroundColor:
                                                        "#DDEBF7",
                                                    fontWeight:
                                                        "700",
                                                }}
                                            >
                                                JAM KERJA /
                                                MAN HOURS
                                                (Total)
                                            </td>
                                        </tr>

                                        {manHours
                                            .filter(
                                                (
                                                    item,
                                                ) =>
                                                    [
                                                        "2.1",
                                                        "2.2",
                                                        "2.3",
                                                    ].includes(
                                                        item.no,
                                                    ),
                                            )
                                            .map(
                                                (
                                                    item,
                                                    index,
                                                ) =>
                                                    renderMetricRow(
                                                        item,
                                                        index,
                                                    ),
                                            )}

                                        <tr>
                                            <td
                                                colSpan={
                                                    38
                                                }
                                                style={{
                                                    ...tdStyle,
                                                    textAlign:
                                                        "center",
                                                    fontStyle:
                                                        "italic",
                                                }}
                                            >
                                                Ops :
                                                Support:
                                            </td>
                                        </tr>

                                        <tr>
                                            <td
                                                colSpan={
                                                    38
                                                }
                                                style={{
                                                    ...tdStyle,
                                                    backgroundColor:
                                                        "#DDEBF7",
                                                    fontWeight:
                                                        "700",
                                                }}
                                            >
                                                KILOMETER
                                                DRIVEN
                                                (Total)
                                            </td>
                                        </tr>

                                        {manHours
                                            .filter(
                                                (
                                                    item,
                                                ) =>
                                                    [
                                                        "2.4",
                                                        "2.5",
                                                        "2.6",
                                                    ].includes(
                                                        item.no,
                                                    ),
                                            )
                                            .map(
                                                (
                                                    item,
                                                    index,
                                                ) =>
                                                    renderMetricRow(
                                                        item,
                                                        index,
                                                    ),
                                            )}

                                        <tr>
                                            <td
                                                colSpan={
                                                    38
                                                }
                                                style={{
                                                    ...tdStyle,
                                                    textAlign:
                                                        "center",
                                                    fontStyle:
                                                        "italic",
                                                }}
                                            >
                                                Ops :
                                                Support:
                                            </td>
                                        </tr>

                                        {/* SECTION 3 */}

                                        <tr>
                                            <td
                                                colSpan={
                                                    38
                                                }
                                                style={{
                                                    ...tdStyle,
                                                    backgroundColor:
                                                        "#D9D9D9",
                                                    fontWeight:
                                                        "700",
                                                }}
                                            >
                                                3. OPS
                                                PERFORMANCE
                                            </td>
                                        </tr>

                                        {ops.map(
                                            (
                                                item,
                                                index,
                                            ) =>
                                                renderMetricRow(
                                                    item,
                                                    index,
                                                ),
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* =================================================
                               LEADING TABLE
                            ================================================= */}

                            <div
                                style={{
                                    minWidth:
                                        "2200px",
                                    border:
                                        "1px solid #222",
                                    marginTop:
                                        "18px",
                                }}
                            >
                                <div
                                    style={{
                                        backgroundColor:
                                            "#00FF20",
                                        color:
                                            "#000",
                                        padding:
                                            "8px",
                                        fontWeight:
                                            "700",
                                        fontSize:
                                            "18px",
                                        textAlign:
                                            "center",
                                    }}
                                >
                                    LEADING INDICATOR
                                </div>

                                <table
                                    style={{
                                        width:
                                            "100%",
                                        borderCollapse:
                                            "collapse",
                                        fontSize:
                                            "10px",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th
                                                rowSpan={
                                                    2
                                                }
                                                style={{
                                                    ...thStyle,
                                                    backgroundColor:
                                                        "#F1DDDC",
                                                    minWidth:
                                                        "330px",
                                                }}
                                            >
                                                POINT YANG
                                                DIUKUR/
                                            </th>

                                            <th
                                                rowSpan={
                                                    2
                                                }
                                                style={{
                                                    ...thStyle,
                                                    backgroundColor:
                                                        "#F1DDDC",
                                                }}
                                            >
                                                DEFINISI
                                                <br />
                                                (FREQUENCY
                                                RATE /
                                                UNIT)
                                            </th>

                                            <th
                                                rowSpan={
                                                    2
                                                }
                                                style={{
                                                    ...thStyle,
                                                    backgroundColor:
                                                        "#F1DDDC",
                                                }}
                                            >
                                                TARGET
                                                <br />
                                                (month)
                                            </th>

                                            <th
                                                rowSpan={
                                                    2
                                                }
                                                style={{
                                                    ...thStyle,
                                                    backgroundColor:
                                                        "#F1DDDC",
                                                }}
                                            >
                                                TARGET
                                                <br />
                                                (Year)
                                            </th>

                                            <th
                                                rowSpan={
                                                    2
                                                }
                                                style={{
                                                    ...thStyle,
                                                    backgroundColor:
                                                        "#F1DDDC",
                                                }}
                                            >
                                                DEFINISI
                                                <br />
                                                FREQUENCY
                                                RATE /
                                                UNIT
                                            </th>

                                            {[
                                                "Q1",
                                                "Q2",
                                                "Q3",
                                                "Q4",
                                            ].map(
                                                (
                                                    q,
                                                ) => (
                                                    <th
                                                        key={
                                                            q
                                                        }
                                                        colSpan={
                                                            2
                                                        }
                                                        style={{
                                                            ...thStyle,
                                                            backgroundColor:
                                                                "#F1DDDC",
                                                        }}
                                                    >
                                                        {
                                                            q
                                                        }
                                                    </th>
                                                ),
                                            )}

                                            <th
                                                colSpan={
                                                    2
                                                }
                                                style={{
                                                    ...thStyle,
                                                    backgroundColor:
                                                        "#F1DDDC",
                                                }}
                                            >
                                                TOTAL
                                                KUMULATIF
                                                YTD
                                            </th>

                                            {MONTHS.map(
                                                (
                                                    month,
                                                ) => (
                                                    <th
                                                        key={
                                                            month
                                                        }
                                                        colSpan={
                                                            2
                                                        }
                                                        style={{
                                                            ...thStyle,
                                                            backgroundColor:
                                                                "#F1DDDC",
                                                        }}
                                                    >
                                                        {
                                                            month
                                                        }
                                                        -
                                                        {String(
                                                            year,
                                                        ).slice(
                                                            -2,
                                                        )}
                                                    </th>
                                                ),
                                            )}
                                        </tr>

                                        <tr>
                                            {Array.from(
                                                {
                                                    length: 17,
                                                },
                                            ).map(
                                                (
                                                    _,
                                                    index,
                                                ) => (
                                                    <React.Fragment
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        <th
                                                            style={{
                                                                ...thStyle,
                                                                backgroundColor:
                                                                    "#FFFF00",
                                                                fontSize:
                                                                    "8px",
                                                            }}
                                                        >
                                                            Plan
                                                        </th>

                                                        <th
                                                            style={{
                                                                ...thStyle,
                                                                backgroundColor:
                                                                    "#FFFF00",
                                                                fontSize:
                                                                    "8px",
                                                            }}
                                                        >
                                                            Actual
                                                        </th>
                                                    </React.Fragment>
                                                ),
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {leading.map(
                                            (
                                                item,
                                                index,
                                            ) => (
                                                <tr
                                                    key={
                                                        item.no
                                                    }
                                                >
                                                    <td
                                                        style={{
                                                            ...tdStyle,
                                                            fontWeight:
                                                                "700",
                                                            whiteSpace:
                                                                "pre-line",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                display:
                                                                    "inline-block",
                                                                minWidth:
                                                                    "25px",
                                                                marginRight:
                                                                    "5px",
                                                                padding:
                                                                    "2px 5px",
                                                                backgroundColor:
                                                                    "#FFFF00",
                                                                border:
                                                                    "1px solid #222",
                                                            }}
                                                        >
                                                            {
                                                                item.no
                                                            }
                                                        </span>

                                                        {
                                                            item.indicator
                                                        }
                                                    </td>

                                                    <td
                                                        style={{
                                                            ...tdStyle,
                                                            textAlign:
                                                                "center",
                                                        }}
                                                    >
                                                        {
                                                            item.definition
                                                        }
                                                    </td>

                                                    <td
                                                        style={
                                                            tdCenter
                                                        }
                                                    >
                                                        {formatNumber(
                                                            item.monthlyTarget,
                                                        )}
                                                    </td>

                                                    <td
                                                        style={
                                                            tdCenter
                                                        }
                                                    >
                                                        {formatNumber(
                                                            item.annualTarget,
                                                        )}
                                                    </td>

                                                    <td
                                                        style={{
                                                            ...tdStyle,
                                                            whiteSpace:
                                                                "pre-line",
                                                        }}
                                                    >
                                                        {
                                                            item.definition2
                                                        }
                                                    </td>

                                                    {renderPlanActualCells(
                                                        item,
                                                    )}
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* NOTES */}

                            <div
                                style={{
                                    minWidth:
                                        "2200px",
                                    marginTop:
                                        "18px",
                                }}
                            >
                                <div
                                    style={{
                                        backgroundColor:
                                            "#064E3B",
                                        color:
                                            "white",
                                        padding:
                                            "9px",
                                        fontWeight:
                                            "700",
                                    }}
                                >
                                    NOTES /
                                    REMARKS
                                </div>

                                <div
                                    style={{
                                        padding:
                                            "15px",
                                        minHeight:
                                            "60px",
                                        backgroundColor:
                                            "#F5FFD0",
                                        border:
                                            "1px solid #222",
                                    }}
                                >
                                    {latestReport?.remarks ||
                                        "Report dibuat berdasarkan data HSE yang tersimpan pada database."}
                                </div>
                            </div>

                            {/* SIGNATURE */}

                            <div
                                style={{
                                    minWidth:
                                        "2200px",
                                    marginTop:
                                        "18px",
                                }}
                            >
                                <div
                                    style={{
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                            "1fr 1fr 1fr",
                                    }}
                                >
                                    <div
                                        style={{
                                            textAlign:
                                                "center",
                                            padding:
                                                "7px",
                                            backgroundColor:
                                                "#F1DDDC",
                                            border:
                                                "1px solid #222",
                                        }}
                                    >
                                        Dilaporkan
                                        oleh,
                                    </div>

                                    <div
                                        style={{
                                            textAlign:
                                                "center",
                                            padding:
                                                "7px",
                                            backgroundColor:
                                                "#F1DDDC",
                                            border:
                                                "1px solid #222",
                                        }}
                                    >
                                        Disetujui
                                        oleh,
                                    </div>

                                    <div
                                        style={{
                                            textAlign:
                                                "center",
                                            padding:
                                                "7px",
                                            backgroundColor:
                                                "#F1DDDC",
                                            border:
                                                "1px solid #222",
                                        }}
                                    >
                                        Diketahui
                                        Oleh,
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                            "1fr 1fr 1fr",
                                    }}
                                >
                                    <div
                                        style={{
                                            height:
                                                "120px",
                                            border:
                                                "1px solid #222",
                                        }}
                                    />

                                    <div
                                        style={{
                                            height:
                                                "120px",
                                            border:
                                                "1px solid #222",
                                        }}
                                    />

                                    <div
                                        style={{
                                            height:
                                                "120px",
                                            border:
                                                "1px solid #222",
                                        }}
                                    />
                                </div>

                                <div
                                    style={{
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                            "1fr 1fr 1fr",
                                    }}
                                >
                                    <div
                                        style={{
                                            textAlign:
                                                "center",
                                            fontWeight:
                                                "700",
                                            padding:
                                                "5px",
                                            border:
                                                "1px solid #222",
                                        }}
                                    >
                                        FENNIELLY
                                        DHINAWALY
                                    </div>

                                    <div
                                        style={{
                                            textAlign:
                                                "center",
                                            fontWeight:
                                                "700",
                                            padding:
                                                "5px",
                                            border:
                                                "1px solid #222",
                                        }}
                                    >
                                        SAIDO
                                    </div>

                                    <div
                                        style={{
                                            padding:
                                                "5px",
                                            border:
                                                "1px solid #222",
                                        }}
                                    />
                                </div>

                                <div
                                    style={{
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                            "1fr 1fr 1fr",
                                    }}
                                >
                                    <div
                                        style={{
                                            textAlign:
                                                "center",
                                            padding:
                                                "5px",
                                            backgroundColor:
                                                "#F1DDDC",
                                            border:
                                                "1px solid #222",
                                        }}
                                    >
                                        HSE & ISO
                                        Jr.
                                        Manager
                                    </div>

                                    <div
                                        style={{
                                            textAlign:
                                                "center",
                                            padding:
                                                "5px",
                                            backgroundColor:
                                                "#F1DDDC",
                                            border:
                                                "1px solid #222",
                                        }}
                                    >
                                        General
                                        Manager
                                    </div>

                                    <div
                                        style={{
                                            padding:
                                                "5px",
                                            backgroundColor:
                                                "#F1DDDC",
                                            border:
                                                "1px solid #222",
                                        }}
                                    />
                                </div>
                            </div>
                        </section>
                    )}
            </main>
        </div>
    );
}