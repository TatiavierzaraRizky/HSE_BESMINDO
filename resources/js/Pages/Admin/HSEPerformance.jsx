import React, { useMemo, useState } from "react";
import AdminSidebar from "../../Components/AdminSidebar";
import { usePage } from "@inertiajs/react";

/* ============================================================
   HELPER FUNCTIONS & CONSTANTS
============================================================ */

const MONTH_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function number(val) {
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
}

function formatNumber(val) {
    const n = number(val);
    if (Number.isInteger(n)) {
        return n.toLocaleString("id-ID");
    }
    return n.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

function normalizeReport(report) {
    const manHoursData = report?.man_hours || report?.manHours || null;
    return {
        ...report,
        manHours: Array.isArray(manHoursData) ? manHoursData[0] || null : manHoursData,
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

function getReportYear(report) {
    if (report?.year) return Number(report.year);
    const date = report?.report_date || report?.issued_date || report?.created_at;
    if (date) {
        const parsed = new Date(date);
        if (!Number.isNaN(parsed.getTime())) return parsed.getFullYear();
    }
    return new Date().getFullYear();
}

function getReportMonth(report) {
    if (report?.period !== undefined && report?.period !== null && report?.period !== "") {
        const p = Number(report.period);
        if (p >= 1 && p <= 12) return p - 1;
    }
    const date = report?.report_date || report?.issued_date || report?.created_at;
    if (date) {
        const parsed = new Date(date);
        if (!Number.isNaN(parsed.getTime())) return parsed.getMonth();
    }
    return 0;
}

export default function HSEPerformance() {
    const { reports: rawReports = [], filters = {} } = usePage().props;

    const reports = useMemo(() => {
        return Array.isArray(rawReports) ? rawReports.map(normalizeReport) : [];
    }, [rawReports]);

    const activeYear = 2027;

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLog, setSelectedLog] = useState(null);
    const rowsPerPage = 6;

    // Active reports for operating year 2027
    const activeReports = useMemo(() => {
        const list = reports.filter(r => getReportYear(r) === activeYear);
        return list.length > 0 ? list : reports;
    }, [reports, activeYear]);

    // =========================================================
    // CALCULATION METRICS ACCORDING TO MASTER EXCEL FORMULAS
    // =========================================================

    const metrics = useMemo(() => {
        let manHoursPremisesPlan = 0;
        let manHoursPremisesActual = 0;
        let manHoursNonPremisesPlan = 0;
        let manHoursNonPremisesActual = 0;
        let totalEmployees = 0;
        let kmPremisesPlan = 0;
        let kmPremisesActual = 0;
        let kmNonPremisesPlan = 0;
        let kmNonPremisesActual = 0;

        let fatalityCases = 0;
        let seriousLtiCases = 0;
        let rwcCases = 0;
        let mtcCases = 0;
        let mvcCases = 0;
        let oilSpillCases = 0;
        let fireCases = 0;
        let propertyDamageCases = 0;
        let securityCases = 0;
        let illnessFatalityCases = 0;
        let reportableCases = 0;

        let totalLeadingPlan = 0;
        let totalLeadingActual = 0;

        // Specific leading categories
        let pekaActual = 0, pekaPlan = 0;
        let hazidActual = 0, hazidPlan = 0;
        let swaActual = 0, swaPlan = 0;
        let apdActual = 0, apdPlan = 0;
        let mwtActual = 0, mwtPlan = 0;
        let auditActual = 0, auditPlan = 0;

        // Monthly trends (12 months)
        const monthlyManHours = Array(12).fill(0);
        const monthlyLagging = Array(12).fill(0);

        // Quarterly lagging
        const quarterlyLagging = { Q1: { incidents: 0, nearMiss: 0 }, Q2: { incidents: 0, nearMiss: 0 }, Q3: { incidents: 0, nearMiss: 0 }, Q4: { incidents: 0, nearMiss: 0 } };

        activeReports.forEach(r => {
            const mIdx = getReportMonth(r);
            const mh = r.manHours || {};

            const mhPremAct = number(mh.man_hours_premises_actual ?? mh.manHoursPremisesActual ?? 0);
            const mhNonPremAct = number(mh.man_hours_non_premises_actual ?? mh.manHoursNonPremisesActual ?? 0);
            const mhPremPlan = number(mh.man_hours_premises_plan ?? mh.manHoursPremisesPlan ?? 0);
            const mhNonPremPlan = number(mh.man_hours_non_premises_plan ?? mh.manHoursNonPremisesPlan ?? 0);

            const kmPremAct = number(mh.km_premises_actual ?? mh.kmPremisesActual ?? 0);
            const kmNonPremAct = number(mh.km_non_premises_actual ?? mh.kmNonPremisesActual ?? 0);
            const kmPremPlan = number(mh.km_premises_plan ?? mh.kmPremisesPlan ?? 0);
            const kmNonPremPlan = number(mh.km_non_premises_plan ?? mh.kmNonPremisesPlan ?? 0);

            const empCount = number(mh.total_employees ?? mh.totalEmployees ?? 0);

            manHoursPremisesPlan += mhPremPlan;
            manHoursPremisesActual += mhPremAct;
            manHoursNonPremisesPlan += mhNonPremPlan;
            manHoursNonPremisesActual += mhNonPremAct;

            kmPremisesPlan += kmPremPlan;
            kmPremisesActual += kmPremAct;
            kmNonPremisesPlan += kmNonPremPlan;
            kmNonPremisesActual += kmNonPremAct;

            totalEmployees += empCount;

            const repTotalMh = mhPremAct + mhNonPremAct;
            monthlyManHours[mIdx] += repTotalMh;

            // Lagging Indicators
            r.laggingIndicators?.forEach(lag => {
                const no = String(lag.indicator_no || "").trim();
                const name = String(lag.indicator_name || lag.name || "").toUpperCase();
                const act = number(lag.actual_value ?? lag.actual ?? 0);

                if (no === "1.1" || name.includes("FATALITY")) fatalityCases += act;
                else if (no === "1.2" || name.includes("SERIOUS LOST TIME") || name.includes("LTI")) seriousLtiCases += act;
                else if (no === "1.3" || name.includes("RESTRICTED WORK") || name.includes("RWC")) rwcCases += act;
                else if (no === "1.4" || name.includes("MEDICAL TREATMENT") || name.includes("MTC")) mtcCases += act;
                else if (no === "1.6" || name.includes("MOTOR VEHICLE") || name.includes("MVC")) mvcCases += act;
                else if (no === "1.7" || name.includes("SPILL") || name.includes("TUMPAHAN")) oilSpillCases += act;
                else if (no === "1.8" || name.includes("FIRE")) fireCases += act;
                else if (no === "1.9" || name.includes("PROPERTY DAMAGE")) propertyDamageCases += act;
                else if (no === "1.10" || name.includes("SECURITY")) securityCases += act;
                else if (no === "1.11" || name.includes("ILLNESS")) illnessFatalityCases += act;
                else if (no === "1.12" || name.includes("REPORTABLE") || name.includes("NEARMISS")) reportableCases += act;

                // Quarterly aggregation
                const qKey = mIdx <= 2 ? "Q1" : mIdx <= 5 ? "Q2" : mIdx <= 8 ? "Q3" : "Q4";
                if (no === "1.12" || name.includes("NEARMISS") || name.includes("REPORTABLE")) {
                    quarterlyLagging[qKey].nearMiss += act;
                } else if (act > 0) {
                    quarterlyLagging[qKey].incidents += act;
                }

                monthlyLagging[mIdx] += act;
            });
        });

        const totalManHoursActual = manHoursPremisesActual + manHoursNonPremisesActual;
        const totalKmActual = kmPremisesActual + kmNonPremisesActual;

        // Total Recordable Injury (TRI = 1.1 + 1.2 + 1.3 + 1.4)
        const triCases = fatalityCases + seriousLtiCases + rwcCases + mtcCases;

        // Total All Lagging Incidents (1.1 - 1.11)
        const totalIncidents = fatalityCases + seriousLtiCases + rwcCases + mtcCases + mvcCases + oilSpillCases + fireCases + propertyDamageCases + securityCases + illnessFatalityCases;
        const zeroIncidentRate = totalIncidents === 0 ? 100 : Math.max(0, 100 - totalIncidents * 15);

        // Frequency Rate = (TRI x 200,000) / Total Man Hours
        const fr = totalManHoursActual > 0 ? (triCases * 200000) / totalManHoursActual : 0;

        // MVC FR = (MVC x 1,000,000) / Total KM
        const mvcFr = totalKmActual > 0 ? (mvcCases * 1000000) / totalKmActual : 0;

        // Max manhour for trend normalization
        const maxMh = Math.max(...monthlyManHours, 1);

        return {
            totalManHoursActual,
            totalKmActual,
            totalEmployees,
            fatalityCases,
            seriousLtiCases,
            rwcCases,
            mtcCases,
            triCases,
            mvcCases,
            oilSpillCases,
            fireCases,
            propertyDamageCases,
            securityCases,
            illnessFatalityCases,
            reportableCases,
            totalIncidents,
            zeroIncidentRate,
            fr,
            mvcFr,
            monthlyTrend: monthlyManHours.map((val, idx) => ({
                month: MONTH_SHORT[idx],
                value: val,
                percentage: Math.max(15, Math.round((val / maxMh) * 100)),
            })),
            quarterlyLagging,
        };
    }, [activeReports]);

    // =========================================================
    // RIG PERFORMANCE & SAFE MAN HOURS COMPARISON
    // =========================================================
    const rigPerformanceData = useMemo(() => {
        const rigMap = new Map();

        activeReports.forEach((r) => {
            const rigNo = r.rig_no || "Unassigned Rig";
            if (!rigMap.has(rigNo)) {
                rigMap.set(rigNo, {
                    rigNo,
                    manHoursPremises: 0,
                    manHoursNonPremises: 0,
                    totalManHours: 0,
                    totalKm: 0,
                    incidents: 0,
                    nearMiss: 0,
                    reportCount: 0,
                });
            }

            const item = rigMap.get(rigNo);
            item.reportCount += 1;

            const mh = r.manHours || {};
            const mhPrem = number(mh.man_hours_premises_actual ?? mh.manHoursPremisesActual ?? 0);
            const mhNonPrem = number(mh.man_hours_non_premises_actual ?? mh.manHoursNonPremisesActual ?? 0);
            const kmPrem = number(mh.km_premises_actual ?? mh.kmPremisesActual ?? 0);
            const kmNonPrem = number(mh.km_non_premises_actual ?? mh.kmNonPremisesActual ?? 0);

            item.manHoursPremises += mhPrem;
            item.manHoursNonPremises += mhNonPrem;
            item.totalManHours += (mhPrem + mhNonPrem);
            item.totalKm += (kmPrem + kmNonPrem);

            r.laggingIndicators?.forEach((lag) => {
                const no = String(lag.indicator_no || "").trim();
                const name = String(lag.indicator_name || lag.name || "").toUpperCase();
                const act = number(lag.actual_value ?? lag.actual ?? 0);

                if (no === "1.12" || name.includes("NEARMISS") || name.includes("REPORTABLE")) {
                    item.nearMiss += act;
                } else if (act > 0) {
                    item.incidents += act;
                }
            });
        });

        const list = Array.from(rigMap.values());
        list.sort((a, b) => b.totalManHours - a.totalManHours || a.rigNo.localeCompare(b.rigNo));
        return list;
    }, [activeReports]);

    const maxRigHours = useMemo(() => {
        if (rigPerformanceData.length === 0) return 1;
        return Math.max(...rigPerformanceData.map(r => r.totalManHours), 1);
    }, [rigPerformanceData]);

    const rigsWithZeroIncidents = useMemo(() => {
        return rigPerformanceData.filter(r => r.incidents === 0).length;
    }, [rigPerformanceData]);

    // =========================================================
    // LAGGING INDICATORS (1.1 Fatality s/d 1.12 Report)
    // =========================================================

    const laggingTableData = useMemo(() => {
        return [
            { no: "1.1", name: "FATALITY", unit: "Case", target: 0, actual: metrics.fatalityCases, fr: metrics.totalManHoursActual > 0 ? ((metrics.fatalityCases * 200000) / metrics.totalManHoursActual).toFixed(2) : "0.00" },
            { no: "1.2", name: "SERIOUS LOST TIME INJURY (>21 LOST DAY)", unit: "Case", target: 0, actual: metrics.seriousLtiCases, fr: metrics.totalManHoursActual > 0 ? ((metrics.seriousLtiCases * 200000) / metrics.totalManHoursActual).toFixed(2) : "0.00" },
            { no: "1.3", name: "RESTRICTED WORK CASE (RWC)", unit: "Case", target: 0, actual: metrics.rwcCases, fr: metrics.totalManHoursActual > 0 ? ((metrics.rwcCases * 200000) / metrics.totalManHoursActual).toFixed(2) : "0.00" },
            { no: "1.4", name: "MEDICAL TREATMENT CASE (MTC)", unit: "Case", target: 0, actual: metrics.mtcCases, fr: metrics.totalManHoursActual > 0 ? ((metrics.mtcCases * 200000) / metrics.totalManHoursActual).toFixed(2) : "0.00" },
            { no: "1.5", name: "TOTAL RECORDABLE INJURY (TRI)", unit: "Case", target: 0, actual: metrics.triCases, fr: metrics.fr.toFixed(2), isHighlight: true },
            { no: "1.6", name: "MOTOR VEHICLE CRASH (MVC)", unit: "Case", target: 0, actual: metrics.mvcCases, fr: metrics.mvcFr.toFixed(2) },
            { no: "1.7", name: "TUMPAHAN / OIL SPILL (> 1 BBL)", unit: "Case", target: 0, actual: metrics.oilSpillCases, fr: "-" },
            { no: "1.8", name: "FIRE (> 100 JUTA)", unit: "Case", target: 0, actual: metrics.fireCases, fr: "-" },
            { no: "1.9", name: "PROPERTY DAMAGE", unit: "Case", target: 0, actual: metrics.propertyDamageCases, fr: "-" },
            { no: "1.10", name: "SECURITY CASE", unit: "Case", target: 0, actual: metrics.securityCases, fr: "-" },
            { no: "1.11", name: "ILLNESS FATALITY", unit: "Case", target: 0, actual: metrics.illnessFatalityCases, fr: "-" },
            { no: "1.12", name: "REPORTABLE CASE (NEAR MISS)", unit: "Case", target: 0, actual: metrics.reportableCases, fr: "-" },
        ].map(item => ({
            ...item,
            status: item.actual === 0 ? "COMPLY" : "NOT COMPLY",
        }));
    }, [metrics]);

    // =========================================================
    // SUMMARY INSIDEN DARI DATA LAPORAN (REPORT)
    // =========================================================

    const incidentLogs = useMemo(() => {
        const list = [];
        activeReports.forEach(r => {
            const mh = r.manHours || {};
            const repMh = number(mh.man_hours_premises_actual ?? 0) + number(mh.man_hours_non_premises_actual ?? 0);

            r.laggingIndicators?.forEach(lag => {
                const act = number(lag.actual_value ?? lag.actual ?? 0);
                if (act > 0) {
                    const name = lag.indicator_name || lag.name || "Incident";
                    const isHigh = name.toUpperCase().includes("FATALITY") || name.toUpperCase().includes("LTI");
                    list.push({
                        id: `lag-${lag.id || Math.random()}`,
                        date: r.report_date || r.issued_date || `${activeYear}-01-01`,
                        location: `${r.rig_no || "General"} (${r.location_district || "Area"})`,
                        event: `${name} (${act} Kasus)`,
                        category: "Lagging Incident",
                        severity: isHigh ? "High" : "Medium",
                        manHours: formatNumber(repMh),
                        status: r.status === "approved" ? "Verified" : "Pending Review",
                        contract: r.contract_no || "SPHR00108C",
                        submitter: r.submitter_name || "HSE Officer",
                        notes: lag.notes || r.remarks || "Kronologi insiden operasional.",
                    });
                }
            });
        });

        return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [activeReports, activeYear]);

    const totalPages = Math.max(1, Math.ceil(incidentLogs.length / rowsPerPage));
    const currentData = incidentLogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleExport = () => {
        alert(`Export HSE Performance Summary\nTahun Operasi: ${activeYear}\nTotal Safe Man Hours: ${formatNumber(metrics.totalManHoursActual)}\nTotal Distance (KM): ${formatNumber(metrics.totalKmActual)}\nTRI Cases: ${metrics.triCases} (FR: ${metrics.fr.toFixed(4)})\nMVC Cases: ${metrics.mvcCases} (MVC FR: ${metrics.mvcFr.toFixed(4)})\nTotal Insiden: ${metrics.totalIncidents}\nZero Incident Rate: ${metrics.zeroIncidentRate}%\nTotal Unit Rig Terdata: ${rigPerformanceData.length}`);
    };

    // Style constants
    const colors = {
        green: "#004d32",
        green2: "#00583b",
        lightGreen: "#e8f1ed",
        bg: "#f4f7fb",
        border: "#d9e1e8",
        text: "#102033",
        muted: "#64748b",
        red: "#c91f2c",
        yellow: "#efff00",
    };

    const cardStyle = {
        backgroundColor: "#ffffff",
        border: `1px solid ${colors.border}`,
        borderRadius: "10px",
        padding: "18px",
        boxSizing: "border-box",
        boxShadow: "0 2px 4px rgba(0, 77, 50, 0.04)",
    };

    const headerButtonStyle = {
        width: "38px",
        height: "38px",
        borderRadius: "8px",
        border: `1px solid ${colors.border}`,
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: "16px",
        transition: "all 0.2s ease",
    };

    const sectionHeaderStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "14px",
        flexWrap: "wrap",
        gap: "8px",
    };

    const sectionTitleStyle = {
        margin: 0,
        fontSize: "15px",
        fontWeight: "800",
        color: "#0f172a",
        letterSpacing: "-0.01em",
    };

    const thStyle = {
        padding: "11px 14px",
        backgroundColor: "#f8fafc",
        color: "#475569",
        fontSize: "11.5px",
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        borderBottom: "1px solid #e2e8f0",
        whiteSpace: "nowrap",
    };

    const tdStyle = {
        padding: "11px 14px",
        fontSize: "12.5px",
        color: "#334155",
        verticalAlign: "middle",
    };

    const tableButtonStyle = {
        padding: "4px 8px",
        backgroundColor: "#f1f5f9",
        border: "1px solid #cbd5e1",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "13px",
    };

    const exportButtonStyle = {
        padding: "7px 14px",
        backgroundColor: colors.green,
        color: "#ffffff",
        border: "none",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
    };

    const paginationButtonStyle = (disabled) => ({
        padding: "6px 12px",
        border: `1px solid ${colors.border}`,
        borderRadius: "6px",
        backgroundColor: disabled ? "#f1f5f9" : "#ffffff",
        color: disabled ? "#94a3b8" : colors.text,
        fontSize: "12px",
        fontWeight: "700",
        cursor: disabled ? "not-allowed" : "pointer",
    });

    return (
        <div style={{ minHeight: "100vh", backgroundColor: colors.bg, fontFamily: "'Inter', Arial, sans-serif", color: colors.text }}>
            {/* SIDEBAR */}
            <AdminSidebar />

            {/* MAIN CONTENT */}
            <main
                style={{
                    marginLeft: "var(--admin-sidebar-width, 215px)",
                    width: "calc(100% - var(--admin-sidebar-width, 215px))",
                    transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    minHeight: "100vh",
                    boxSizing: "border-box",
                }}
            >
                {/* TOP HEADER */}
                <header
                    style={{
                        height: "70px",
                        backgroundColor: "#ffffff",
                        borderBottom: `1px solid ${colors.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 28px",
                        boxSizing: "border-box",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: colors.green }} />
                        <span style={{ color: colors.green, fontSize: "16px", fontWeight: "800", letterSpacing: "-0.02em" }}>
                            PT BESMINDO MATERI SEWATAMA &bull; HSE Performance
                        </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ fontSize: "12px", color: colors.muted, fontWeight: "600" }}>
                            Form: <span style={{ color: colors.green, fontWeight: "700" }}>BMSD/03/FO/HSE/02/17 (Rev: #12)</span>
                        </div>
                        <button type="button" onClick={handleExport} style={headerButtonStyle} title="Export Summary">
                            📥
                        </button>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <div style={{ padding: "28px", boxSizing: "border-box" }}>
                    {/* TITLE + LIVE STATUS */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            gap: "20px",
                            marginBottom: "20px",
                            flexWrap: "wrap",
                        }}
                    >
                        <div style={{ flex: 1, minWidth: "260px" }}>
                            <h1 style={{ margin: 0, fontSize: "26px", color: "#0f172a", fontWeight: "800", letterSpacing: "-0.02em" }}>
                                HSE Performance & Statistical Monitoring
                            </h1>
                            <p style={{ marginTop: "6px", marginBottom: 0, fontSize: "13.5px", color: colors.muted, fontWeight: "500" }}>
                                Pemantauan indikator keselamatan kerja (Lagging), Safe Man Hours, TRI, Frequency Rates, dan rekapitulasi insiden operasional per unit kerja.
                            </p>
                        </div>

                        {/* STATUS BADGE TAHUN 2027 (REPLACES REDUNDANT FILTER BOX) */}
                        <div
                            style={{
                                backgroundColor: "#ffffff",
                                border: `1px solid ${colors.border}`,
                                borderRadius: "10px",
                                padding: "10px 18px",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                            }}
                        >
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "8px",
                                    backgroundColor: colors.lightGreen,
                                    color: colors.green,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "18px",
                                    fontWeight: "800",
                                }}
                            >
                                📊
                            </div>
                            <div>
                                <div style={{ fontSize: "11px", fontWeight: "700", color: colors.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    Tahun Operasional:
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                                    <span style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>
                                        {activeYear}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            fontWeight: "700",
                                            padding: "2px 8px",
                                            borderRadius: "12px",
                                            backgroundColor: "#dcfce7",
                                            color: "#166534",
                                            border: "1px solid #86efac",
                                        }}
                                    >
                                        Live Report Data
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KPI CARDS */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                            gap: "14px",
                            marginBottom: "16px",
                        }}
                    >
                        <KpiCard
                            title="Total Safe Man Hours"
                            value={formatNumber(metrics.totalManHoursActual)}
                            subtitle="Premises + Non-Premises"
                            change={`FR: ${metrics.fr.toFixed(4)}`}
                            icon="⏱"
                            isGood={true}
                        />

                        <KpiCard
                            title="Total Distance (KM)"
                            value={formatNumber(metrics.totalKmActual)}
                            subtitle="Premises + Non-Premises"
                            change={`MVC FR: ${metrics.mvcFr.toFixed(4)}`}
                            icon="🚗"
                            isGood={true}
                        />

                        <KpiCard
                            title="Total Recordable Injury (TRI)"
                            value={String(metrics.triCases)}
                            subtitle={`Fatality: ${metrics.fatalityCases} | LTI: ${metrics.seriousLtiCases} | RWC: ${metrics.rwcCases}`}
                            change={metrics.triCases === 0 ? "Zero Incident (Safe)" : "Incident Recorded"}
                            icon="🛡"
                            isGood={metrics.triCases === 0}
                        />

                        <KpiCard
                            title="Zero Incident Compliance"
                            value={`${metrics.zeroIncidentRate}%`}
                            subtitle={`Total Kasus: ${metrics.totalIncidents} Insiden`}
                            change={metrics.totalIncidents === 0 ? "COMPLY (100% Aman)" : "INCIDENT RECORDED"}
                            icon="🎯"
                            isGood={metrics.totalIncidents === 0}
                        />
                    </div>

                    {/* SECONDARY ROW: FORMULAS / DETAILS */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                            gap: "14px",
                            marginBottom: "16px",
                        }}
                    >
                        <FormulaBadge label="Frequency Rate Formula" formula="FR = (TRI × 200,000) / Man Hours" value={metrics.fr.toFixed(4)} />
                        <FormulaBadge label="MVC Frequency Rate" formula="MVC FR = (MVC × 1,000,000) / KM" value={metrics.mvcFr.toFixed(4)} />
                        <FormulaBadge label="Total Active Personnel" formula="Employees (Ops + Support)" value={formatNumber(metrics.totalEmployees)} />
                        <FormulaBadge label="Environmental & Fire" formula="Oil Spill (>1bbl) & Fire (>100Jt)" value={`${metrics.oilSpillCases} Spill / ${metrics.fireCases} Fire`} />
                    </div>

                    {/* CHART AREA */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1.8fr 0.9fr",
                            gap: "14px",
                            marginBottom: "16px",
                        }}
                    >
                        {/* HSE TREND */}
                        <section style={cardStyle}>
                            <div style={sectionHeaderStyle}>
                                <div>
                                    <h2 style={sectionTitleStyle}>Monthly Safe Man Hours Trend ({activeYear})</h2>
                                    <span style={{ fontSize: "12px", color: colors.muted }}>Distribusi akumulasi jam kerja selamat per bulan</span>
                                </div>
                                <span style={{ fontSize: "12px", fontWeight: "700", color: colors.green }}>
                                    Full Year (12 Bulan)
                                </span>
                            </div>

                            <div
                                style={{
                                    height: "210px",
                                    backgroundColor: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    padding: "20px 14px 10px",
                                    boxSizing: "border-box",
                                    display: "flex",
                                    alignItems: "flex-end",
                                    gap: "6px",
                                }}
                            >
                                {metrics.monthlyTrend.map((item, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            flex: 1,
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "flex-end",
                                            alignItems: "center",
                                            gap: "4px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "100%",
                                                height: `${item.percentage}%`,
                                                backgroundColor: item.value > 0 ? colors.green : "#cbd5e1",
                                                borderTop: `3px solid ${colors.yellow}`,
                                                borderRadius: "4px 4px 0 0",
                                                transition: "all 0.3s ease",
                                                cursor: "pointer",
                                                position: "relative",
                                            }}
                                            title={`${item.month}: ${formatNumber(item.value)} Man Hours`}
                                        />
                                        <span style={{ fontSize: "11px", fontWeight: "700", color: colors.muted }}>
                                            {item.month}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* LAGGING QUARTERS & FR BENCHMARK */}
                        <section style={cardStyle}>
                            <div style={sectionHeaderStyle}>
                                <div>
                                    <h2 style={sectionTitleStyle}>Lagging Incidents by Quarter (Q1 - Q4)</h2>
                                    <span style={{ fontSize: "11px", color: colors.muted }}>Distribusi insiden per kuartal</span>
                                </div>
                                <div style={{ fontSize: "11px", color: colors.muted, display: "flex", gap: "8px" }}>
                                    <span><span style={{ color: colors.red }}>●</span> Incident</span>
                                    <span><span style={{ color: "#64748b" }}>●</span> Near Miss</span>
                                </div>
                            </div>

                            <div
                                style={{
                                    height: "120px",
                                    display: "flex",
                                    alignItems: "flex-end",
                                    gap: "12px",
                                    padding: "10px 14px",
                                    boxSizing: "border-box",
                                    backgroundColor: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    marginBottom: "12px",
                                }}
                            >
                                {["Q1", "Q2", "Q3", "Q4"].map((qKey) => {
                                    const qData = metrics.quarterlyLagging[qKey];
                                    const incHeight = Math.min(100, (qData.incidents + (qData.incidents > 0 ? 1 : 0)) * 30);
                                    const nearMissHeight = Math.min(100, qData.nearMiss * 15);
                                    return (
                                        <div key={qKey} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                                            <div style={{ width: "100%", height: "80px", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "4px" }}>
                                                <div
                                                    style={{
                                                        width: "14px",
                                                        height: qData.incidents > 0 ? `${incHeight}%` : "4px",
                                                        backgroundColor: qData.incidents > 0 ? colors.red : "#cbd5e1",
                                                        borderRadius: "3px 3px 0 0",
                                                    }}
                                                    title={`${qKey} Insiden: ${qData.incidents}`}
                                                />
                                                <div
                                                    style={{
                                                        width: "14px",
                                                        height: qData.nearMiss > 0 ? `${nearMissHeight}%` : "4px",
                                                        backgroundColor: "#64748b",
                                                        borderRadius: "3px 3px 0 0",
                                                    }}
                                                    title={`${qKey} Near Miss: ${qData.nearMiss}`}
                                                />
                                            </div>
                                            <span style={{ fontSize: "11px", fontWeight: "800", color: colors.green }}>{qKey}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* FR BENCHMARK BOXES */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                <div style={{ padding: "8px 10px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                    <div style={{ fontSize: "10px", fontWeight: "700", color: colors.muted }}>TRI FR (Target &le; 0.50)</div>
                                    <div style={{ fontSize: "14px", fontWeight: "900", color: Number(metrics.fr) <= 0.5 ? colors.green : colors.red }}>
                                        {metrics.fr.toFixed(2)} <span style={{ fontSize: "10px", fontWeight: "600", color: colors.muted }}>({Number(metrics.fr) <= 0.5 ? "Comply" : "Over"})</span>
                                    </div>
                                </div>
                                <div style={{ padding: "8px 10px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                    <div style={{ fontSize: "10px", fontWeight: "700", color: colors.muted }}>MVC FR (Target 0.00)</div>
                                    <div style={{ fontSize: "14px", fontWeight: "900", color: Number(metrics.mvcFr) === 0 ? colors.green : colors.red }}>
                                        {metrics.mvcFr.toFixed(2)} <span style={{ fontSize: "10px", fontWeight: "600", color: colors.muted }}>({Number(metrics.mvcFr) === 0 ? "Comply" : "Over"})</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* KOMPARASI JAM KERJA SELAMAT PER UNIT RIG */}
                    <section style={{ ...cardStyle, marginBottom: "16px" }}>
                        <div style={sectionHeaderStyle}>
                            <div>
                                <h2 style={sectionTitleStyle}>Komparasi Jam Kerja Selamat per Unit Rig ({activeYear})</h2>
                                <span style={{ fontSize: "12px", color: colors.muted }}>
                                    Perbandingan akumulasi Safe Man Hours, jarak tempuh operasional (KM), dan kepatuhan Zero Incident per unit rig.
                                </span>
                            </div>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <span style={{ fontSize: "11px", fontWeight: "700", padding: "4px 10px", backgroundColor: "#f1f5f9", color: "#475569", borderRadius: "6px" }}>
                                    Total Rig Aktif: {rigPerformanceData.length} Unit
                                </span>
                                <span style={{ fontSize: "11px", fontWeight: "700", padding: "4px 10px", backgroundColor: "#ecfdf5", color: "#065f46", borderRadius: "6px" }}>
                                    Zero Incident: {rigsWithZeroIncidents}/{rigPerformanceData.length || 1} Rig ({rigPerformanceData.length > 0 ? Math.round((rigsWithZeroIncidents / rigPerformanceData.length) * 100) : 100}%)
                                </span>
                            </div>
                        </div>

                        {rigPerformanceData.length === 0 ? (
                            <div
                                style={{
                                    padding: "36px 20px",
                                    textAlign: "center",
                                    backgroundColor: "#f8fafc",
                                    borderRadius: "8px",
                                    border: "1.5px dashed #cbd5e1",
                                }}
                            >
                                <div style={{ fontSize: "36px", marginBottom: "8px" }}>🏗️</div>
                                <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: "800", color: "#1e293b" }}>
                                    Belum Ada Laporan Rig untuk Tahun {activeYear}
                                </h4>
                                <p style={{ margin: 0, fontSize: "13px", color: colors.muted, maxWidth: "520px", marginInline: "auto", lineHeight: "1.5" }}>
                                    Komparasi performa jam kerja selamat, jarak tempuh operasional, dan kepatuhan insiden antar-rig akan otomatis ditampilkan di sini setelah laporan di-input pada menu Input Data.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {rigPerformanceData.map((rigItem, idx) => {
                                    const percentOfMax = Math.max(8, Math.round((rigItem.totalManHours / maxRigHours) * 100));
                                    const shareOfTotal = metrics.totalManHoursActual > 0
                                        ? ((rigItem.totalManHours / metrics.totalManHoursActual) * 100).toFixed(1)
                                        : "0.0";
                                    const isZeroIncident = rigItem.incidents === 0;

                                    return (
                                        <div
                                            key={rigItem.rigNo}
                                            style={{
                                                padding: "14px 16px",
                                                backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fbfcfd",
                                                borderRadius: "8px",
                                                border: "1px solid #e2e8f0",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "8px",
                                                transition: "all 0.2s ease",
                                            }}
                                        >
                                            {/* TOP ROW: RIG NAME & STATS */}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <div
                                                        style={{
                                                            width: "32px",
                                                            height: "32px",
                                                            borderRadius: "6px",
                                                            backgroundColor: colors.lightGreen,
                                                            color: colors.green,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontWeight: "900",
                                                            fontSize: "13px",
                                                        }}
                                                    >
                                                        #{idx + 1}
                                                    </div>
                                                    <div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <span style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a" }}>
                                                                {rigItem.rigNo}
                                                            </span>
                                                            <span style={{ fontSize: "11.5px", color: colors.muted, fontWeight: "600" }}>
                                                                ({rigItem.reportCount} Laporan Bulanan)
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: "11px", color: colors.muted, marginTop: "2px" }}>
                                                            Premises: {formatNumber(rigItem.manHoursPremises)} Jam | Non-Premises: {formatNumber(rigItem.manHoursNonPremises)} Jam
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                                    <div style={{ textAlign: "right" }}>
                                                        <div style={{ fontSize: "16px", fontWeight: "900", color: colors.green, letterSpacing: "-0.01em" }}>
                                                            {formatNumber(rigItem.totalManHours)} <span style={{ fontSize: "11px", fontWeight: "600", color: colors.muted }}>Jam</span>
                                                        </div>
                                                        <div style={{ fontSize: "11px", color: colors.muted }}>
                                                            Kontribusi: <strong style={{ color: colors.green }}>{shareOfTotal}%</strong>
                                                        </div>
                                                    </div>

                                                    <span
                                                        style={{
                                                            padding: "4px 10px",
                                                            borderRadius: "6px",
                                                            fontSize: "11px",
                                                            fontWeight: "800",
                                                            backgroundColor: isZeroIncident ? "#dcfce7" : "#fee2e2",
                                                            color: isZeroIncident ? "#166534" : "#991b1b",
                                                            border: `1px solid ${isZeroIncident ? "#86efac" : "#fca5a5"}`,
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        {isZeroIncident ? "✓ Zero Incident (Safe)" : `⚠ ${rigItem.incidents} Insiden`}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* PROGRESS BAR */}
                                            <div
                                                style={{
                                                    width: "100%",
                                                    height: "10px",
                                                    backgroundColor: "#e2e8f0",
                                                    borderRadius: "5px",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${percentOfMax}%`,
                                                        height: "100%",
                                                        background: isZeroIncident
                                                            ? `linear-gradient(90deg, ${colors.green} 0%, #10b981 100%)`
                                                            : `linear-gradient(90deg, ${colors.green} 0%, ${colors.red} 100%)`,
                                                        borderRadius: "5px",
                                                        transition: "width 0.4s ease",
                                                    }}
                                                />
                                            </div>

                                            {/* BOTTOM ROW: KM & NEAR MISS */}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: colors.muted }}>
                                                <span>Total Jarak Tempuh: <strong style={{ color: "#334155" }}>{formatNumber(rigItem.totalKm)} KM</strong></span>
                                                <span>Near Miss Terlaporkan: <strong style={{ color: "#334155" }}>{rigItem.nearMiss} Kasus</strong></span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* TABEL 1.1 FATALITY S/D 1.12 REPORT */}
                    <section style={{ ...cardStyle, marginBottom: "16px" }}>
                        <div style={sectionHeaderStyle}>
                            <div>
                                <h2 style={sectionTitleStyle}>Tabel 1.1 Fatality s/d 1.12 (HSE Lagging Indicators Record)</h2>
                                <span style={{ fontSize: "12px", color: colors.muted }}>
                                    Data indikator lagging bersumber langsung dari database laporan HSE (Report).
                                </span>
                            </div>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <span style={{ fontSize: "11px", fontWeight: "700", padding: "4px 8px", backgroundColor: "#ecfdf5", color: "#065f46", borderRadius: "6px" }}>
                                    Target Insiden: 0 Case
                                </span>
                            </div>
                        </div>

                        <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...thStyle, width: "60px", textAlign: "center" }}>No</th>
                                        <th style={thStyle}>Indikator Lagging</th>
                                        <th style={{ ...thStyle, width: "80px", textAlign: "center" }}>Satuan</th>
                                        <th style={{ ...thStyle, width: "100px", textAlign: "center" }}>Target (Plan)</th>
                                        <th style={{ ...thStyle, width: "110px", textAlign: "center" }}>Aktual (Kasus)</th>
                                        <th style={{ ...thStyle, width: "140px", textAlign: "center" }}>Frequency Rate (FR)</th>
                                        <th style={{ ...thStyle, width: "120px", textAlign: "center" }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {laggingTableData.map((row, idx) => {
                                        const isTri = row.isHighlight;
                                        return (
                                            <tr
                                                key={row.no}
                                                style={{
                                                    backgroundColor: isTri ? "#fefce8" : idx % 2 === 0 ? "#ffffff" : "#fcfdfd",
                                                    borderBottom: "1px solid #e2e8f0",
                                                    fontWeight: isTri ? "800" : "500",
                                                }}
                                            >
                                                <td style={{ ...tdStyle, textAlign: "center", fontWeight: "700", color: isTri ? "#854d0e" : colors.text }}>
                                                    {row.no}
                                                </td>
                                                <td style={{ ...tdStyle, color: isTri ? "#854d0e" : colors.text }}>
                                                    {row.name}
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: "center", color: colors.muted }}>
                                                    {row.unit}
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: "center", color: colors.muted }}>
                                                    {row.target}
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: "center", fontWeight: "800", color: row.actual > 0 ? colors.red : colors.green }}>
                                                    {row.actual}
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: "center", fontFamily: "monospace", fontWeight: "700" }}>
                                                    {row.fr}
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                                    <span
                                                        style={{
                                                            padding: "3px 8px",
                                                            borderRadius: "4px",
                                                            fontSize: "11px",
                                                            fontWeight: "800",
                                                            backgroundColor: row.status === "COMPLY" ? "#dcfce7" : "#fee2e2",
                                                            color: row.status === "COMPLY" ? "#166534" : "#991b1b",
                                                            border: `1px solid ${row.status === "COMPLY" ? "#86efac" : "#fca5a5"}`,
                                                        }}
                                                    >
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* SUMMARY INSIDEN DARI DATA LAPORAN (REPORT) */}
                    <section style={cardStyle}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "14px",
                                flexWrap: "wrap",
                                gap: "10px",
                            }}
                        >
                            <div>
                                <h2 style={sectionTitleStyle}>Summary Insiden</h2>
                                <span style={{ fontSize: "12px", color: colors.muted }}>
                                    Rangkuman kejadian insiden yang dilaporkan pada periode ini.
                                </span>
                            </div>

                            <button type="button" onClick={handleExport} style={exportButtonStyle}>
                                📑 Export Log to Excel
                            </button>
                        </div>

                        {incidentLogs.length === 0 ? (
                            <div
                                style={{
                                    padding: "24px",
                                    backgroundColor: "#ecfdf5",
                                    border: "1.5px solid #10b981",
                                    borderRadius: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "16px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "44px",
                                        height: "44px",
                                        borderRadius: "50%",
                                        backgroundColor: "#10b981",
                                        color: "#ffffff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "22px",
                                        fontWeight: "900",
                                        flexShrink: 0,
                                    }}
                                >
                                    ✓
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#065f46" }}>
                                        Zero Incident Record (Operasi 100% Aman)
                                    </h3>
                                    <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#047857" }}>
                                        Tidak ada insiden kecelakaan kerja tercatat pada laporan operasional tahun {activeYear} (Fatality, LTI, RWC, MTC, MVC, Spill, Fire = 0). Seluruh operasional berjalan dengan kepatuhan penuh terhadap standar keselamatan (Comply).
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* TABLE */}
                                <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                        <thead>
                                            <tr>
                                                <th style={thStyle}>Date</th>
                                                <th style={thStyle}>Rig / Location</th>
                                                <th style={thStyle}>Incident Category</th>
                                                <th style={thStyle}>Severity</th>
                                                <th style={thStyle}>Deskripsi / Kronologi Kejadian</th>
                                                <th style={thStyle}>Submitter</th>
                                                <th style={thStyle}>Status</th>
                                                <th style={{ ...thStyle, textAlign: "center" }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentData.map((row, index) => (
                                                <tr
                                                    key={row.id || index}
                                                    style={{
                                                        borderBottom: "1px solid #f1f5f9",
                                                        backgroundColor: index % 2 === 0 ? "#ffffff" : "#fcfdfd",
                                                    }}
                                                >
                                                    <td style={tdStyle}>{row.date}</td>
                                                    <td style={{ ...tdStyle, fontWeight: "700", color: colors.green }}>{row.location}</td>
                                                    <td style={{ ...tdStyle, fontWeight: "700", color: colors.red }}>{row.event}</td>
                                                    <td style={tdStyle}>
                                                        <SeverityBadge severity={row.severity} />
                                                    </td>
                                                    <td style={{ ...tdStyle, maxWidth: "320px", color: "#334155" }}>
                                                        {row.notes}
                                                    </td>
                                                    <td style={tdStyle}>{row.submitter}</td>
                                                    <td style={tdStyle}>
                                                        <span
                                                            style={{
                                                                padding: "3px 8px",
                                                                borderRadius: "4px",
                                                                fontSize: "11px",
                                                                fontWeight: "700",
                                                                backgroundColor: row.status.includes("Verified") || row.status.includes("Completed") ? "#dcfce7" : "#fef3c7",
                                                                color: row.status.includes("Verified") || row.status.includes("Completed") ? "#166534" : "#92400e",
                                                            }}
                                                        >
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ ...tdStyle, textAlign: "center" }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedLog(row)}
                                                            style={tableButtonStyle}
                                                            title="Lihat Detail Insiden"
                                                        >
                                                            👁
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* PAGINATION */}
                                {incidentLogs.length > rowsPerPage && (
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginTop: "14px",
                                        }}
                                    >
                                        <span style={{ fontSize: "12px", color: colors.muted, fontWeight: "600" }}>
                                            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, incidentLogs.length)} of {incidentLogs.length} entries
                                        </span>

                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button
                                                type="button"
                                                onClick={handlePrevious}
                                                disabled={currentPage === 1}
                                                style={paginationButtonStyle(currentPage === 1)}
                                            >
                                                &larr; Prev
                                            </button>
                                            <span style={{ padding: "6px 12px", fontSize: "12px", fontWeight: "700", color: colors.green }}>
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleNext}
                                                disabled={currentPage >= totalPages}
                                                style={paginationButtonStyle(currentPage >= totalPages)}
                                            >
                                                Next &rarr;
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>
            </main>

            {/* DETAIL MODAL */}
            {selectedLog && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        padding: "20px",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "12px",
                            padding: "24px",
                            maxWidth: "500px",
                            width: "100%",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
                            <h3 style={{ margin: 0, color: colors.green, fontSize: "18px", fontWeight: "800" }}>
                                HSE Record Details
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                style={{ border: "none", background: "none", fontSize: "18px", cursor: "pointer", color: colors.muted }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <DetailRow label="Event / Indicator" value={selectedLog.event} />
                            <DetailRow label="Date" value={selectedLog.date} />
                            <DetailRow label="Rig / Location" value={selectedLog.location} />
                            <DetailRow label="Contract / Project" value={selectedLog.contract} />
                            <DetailRow label="Category" value={selectedLog.category} />
                            <DetailRow label="Severity Level" value={selectedLog.severity} />
                            <DetailRow label="Man Hours" value={selectedLog.manHours} />
                            <DetailRow label="Submitter" value={selectedLog.submitter} />
                            <DetailRow label="Status" value={selectedLog.status} />
                            <div style={{ marginTop: "8px", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                <small style={{ color: colors.muted, fontWeight: "700" }}>Program & Reference:</small>
                                <div style={{ fontSize: "12.5px", color: "#1e293b", marginTop: "4px" }}>{selectedLog.notes}</div>
                            </div>
                        </div>

                        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: colors.green,
                                    color: "#ffffff",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontWeight: "700",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ============================================================
   SUB-COMPONENTS FOR HSE PERFORMANCE
============================================================ */

function KpiCard({ title, value, subtitle, change, icon, isGood }) {
    return (
        <div
            style={{
                backgroundColor: "#ffffff",
                border: "1px solid #d9e1e8",
                borderRadius: "10px",
                padding: "16px",
                boxShadow: "0 2px 4px rgba(0, 77, 50, 0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {title}
                    </span>
                    <div style={{ fontSize: "22px", fontWeight: "900", color: "#004d32", marginTop: "4px", letterSpacing: "-0.02em" }}>
                        {value}
                    </div>
                </div>
                <div
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        backgroundColor: "#e8f1ed",
                        color: "#004d32",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "17px",
                    }}
                >
                    {icon}
                </div>
            </div>
            <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "500" }}>{subtitle}</span>
                <span
                    style={{
                        fontSize: "10.5px",
                        fontWeight: "700",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: isGood ? "#dcfce7" : "#fee2e2",
                        color: isGood ? "#166534" : "#991b1b",
                    }}
                >
                    {change}
                </span>
            </div>
        </div>
    );
}

function FormulaBadge({ label, formula, value }) {
    return (
        <div
            style={{
                backgroundColor: "#ffffff",
                border: "1px solid #d9e1e8",
                borderRadius: "8px",
                padding: "12px 14px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
        >
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#004d32", marginBottom: "2px" }}>
                {label}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                {formula}
            </div>
            <div style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>
                {value}
            </div>
        </div>
    );
}


function SeverityBadge({ severity }) {
    const isHigh = severity === "High";
    const isMedium = severity === "Medium";
    const isLow = severity === "Low";
    return (
        <span
            style={{
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: "700",
                backgroundColor: isHigh ? "#fee2e2" : isMedium ? "#fef3c7" : isLow ? "#dbeafe" : "#f1f5f9",
                color: isHigh ? "#991b1b" : isMedium ? "#92400e" : isLow ? "#1e40af" : "#475569",
            }}
        >
            {severity}
        </span>
    );
}

function DetailRow({ label, value }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ color: "#64748b", fontWeight: "600" }}>{label}</span>
            <span style={{ color: "#0f172a", fontWeight: "700", textAlign: "right" }}>{value || "-"}</span>
        </div>
    );
}
