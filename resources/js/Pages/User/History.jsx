import React, { useMemo, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import UserSidebar from "../../Components/UserSidebar";
import UserHeaderProfile from "../../Components/UserHeaderProfile";
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Eye,
    FileEdit,
    FileText,
    History,
    Layers,
    MapPin,
    Plus,
    RotateCcw,
    Search,
    ShieldAlert,
    UserCheck,
    X,
} from "lucide-react";

export default function UserHistory({
    reports: initialReports = [],
    assignedRigs = [],
}) {
    const pageProps = usePage().props;
    const currentUser = pageProps.auth?.user;
    const [reports, setReports] = useState(initialReports);
    const [selectedTab, setSelectedTab] = useState("all"); // 'all' | 'pending' | 'approved' | 'rejected'
    const [searchTerm, setSearchTerm] = useState("");
    const [historyModalReport, setHistoryModalReport] = useState(null);

    const MONTH_NAMES = {
        "01": "Januari",
        "02": "Februari",
        "03": "Maret",
        "04": "April",
        "05": "Mei",
        "06": "Juni",
        "07": "Juli",
        "08": "Agustus",
        "09": "September",
        "10": "Oktober",
        "11": "November",
        "12": "Desember",
    };

    const formatPeriod = (period, year) => {
        const padded = String(period).padStart(2, "0");
        const month = MONTH_NAMES[padded] || `Bulan ${padded}`;
        return `${month} ${year}`;
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "-";
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    // Filter reports
    const filteredReports = useMemo(() => {
        return reports.filter((r) => {
            // Tab filter
            if (selectedTab === "pending" && r.status !== "pending") return false;
            if (selectedTab === "approved" && r.status !== "approved") return false;
            if (selectedTab === "rejected" && r.status !== "rejected") return false;

            // Search filter
            if (searchTerm.trim() !== "") {
                const term = searchTerm.toLowerCase();
                const rig = (r.rig_no || "").toLowerCase();
                const contract = (r.contract_no || "").toLowerCase();
                const submitter = (r.submitter_name || "").toLowerCase();
                const creator = (r.creator?.name || "").toLowerCase();
                const period = formatPeriod(r.period, r.year).toLowerCase();
                return (
                    rig.includes(term) ||
                    contract.includes(term) ||
                    submitter.includes(term) ||
                    creator.includes(term) ||
                    period.includes(term)
                );
            }

            return true;
        });
    }, [reports, selectedTab, searchTerm]);

    const counts = useMemo(() => {
        return {
            all: reports.length,
            pending: reports.filter((r) => r.status === "pending").length,
            approved: reports.filter((r) => r.status === "approved").length,
            rejected: reports.filter((r) => r.status === "rejected").length,
        };
    }, [reports]);

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                backgroundColor: "#f8fafc",
                fontFamily: "'Instrument Sans', 'Plus Jakarta Sans', -apple-system, sans-serif",
            }}
        >
            <UserSidebar />

            <div
                style={{
                    flex: 1,
                    marginLeft: "var(--admin-sidebar-width, 215px)",
                    transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                }}
            >
                <main style={{ padding: "32px 36px", flex: 1 }}>
                    {/* HEADER SECTION */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "16px",
                            marginBottom: "26px",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    color: "#004d32",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    backgroundColor: "#dcfce7",
                                    padding: "3px 10px",
                                    borderRadius: "12px",
                                    marginBottom: "8px",
                                }}
                            >
                                <History size={12} />
                                Portal Field PIC & Operator
                            </div>
                            <h1
                                style={{
                                    fontSize: "24px",
                                    fontWeight: "800",
                                    color: "#0f172a",
                                    margin: "0 0 6px",
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                Status & Riwayat Laporan HSE
                            </h1>
                            <p
                                style={{
                                    fontSize: "13.5px",
                                    color: "#64748b",
                                    margin: 0,
                                }}
                            >
                                Pantau verifikasi laporan yang telah dikirim, pelajari catatan perbaikan admin, dan lakukan edit resubmit untuk laporan yang ditolak.
                            </p>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                            <UserHeaderProfile user={currentUser} assignedRigs={assignedRigs} />

                            <Link
                                href="/user/input-data"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    backgroundColor: "#004d32",
                                    color: "#efff00",
                                    border: "1px solid #efff00",
                                    padding: "10px 20px",
                                    borderRadius: "8px",
                                    textDecoration: "none",
                                    fontSize: "13px",
                                    fontWeight: "800",
                                    boxShadow: "0 2px 8px rgba(0, 77, 50, 0.2)",
                                }}
                            >
                                <Plus size={16} strokeWidth={2.6} />
                                Input Laporan Baru
                            </Link>
                        </div>
                    </div>

                    {/* ASSIGNED RIGS INFO */}
                    {assignedRigs && assignedRigs.length > 0 && (
                        <div
                            style={{
                                backgroundColor: "#ffffff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "10px",
                                padding: "12px 18px",
                                marginBottom: "24px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: "10px",
                                fontSize: "12.5px",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569" }}>
                                <MapPin size={16} color="#004d32" />
                                <span>Rig Penugasan Anda:</span>
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                    {assignedRigs.map((rig) => (
                                        <span
                                            key={rig}
                                            style={{
                                                backgroundColor: "#f1f5f9",
                                                border: "1px solid #cbd5e1",
                                                color: "#004d32",
                                                fontWeight: "800",
                                                padding: "2px 8px",
                                                borderRadius: "4px",
                                                fontSize: "11.5px",
                                            }}
                                        >
                                            {rig}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <span style={{ color: "#64748b", fontWeight: "600", fontSize: "12px" }}>
                                Total {reports.length} Laporan Diajukan
                            </span>
                        </div>
                    )}

                    {/* FILTER TABS & SEARCH */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "14px",
                            marginBottom: "18px",
                        }}
                    >
                        {/* Tabs */}
                        <div
                            style={{
                                display: "flex",
                                backgroundColor: "#ffffff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "10px",
                                padding: "4px",
                                gap: "4px",
                            }}
                        >
                            {[
                                { key: "all", label: "Semua", count: counts.all },
                                { key: "pending", label: "Pending", count: counts.pending, color: "#d97706" },
                                { key: "approved", label: "Approved", count: counts.approved, color: "#16a34a" },
                                { key: "rejected", label: "Rejected (Perlu Revisi)", count: counts.rejected, color: "#dc2626" },
                            ].map((tab) => {
                                const active = selectedTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setSelectedTab(tab.key)}
                                        style={{
                                            padding: "8px 14px",
                                            borderRadius: "7px",
                                            border: "none",
                                            backgroundColor: active ? "#004d32" : "transparent",
                                            color: active ? "#efff00" : "#475569",
                                            fontSize: "12.5px",
                                            fontWeight: active ? "800" : "600",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            transition: "all 0.15s",
                                        }}
                                    >
                                        <span>{tab.label}</span>
                                        <span
                                            style={{
                                                backgroundColor: active ? "rgba(239, 255, 0, 0.2)" : "#f1f5f9",
                                                color: active ? "#efff00" : tab.color || "#64748b",
                                                fontSize: "11px",
                                                fontWeight: "800",
                                                padding: "1px 6px",
                                                borderRadius: "10px",
                                            }}
                                        >
                                            {tab.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search Input */}
                        <div
                            style={{
                                position: "relative",
                                minWidth: "260px",
                            }}
                        >
                            <Search
                                size={16}
                                color="#94a3b8"
                                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                            />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari Rig, Kontrak, atau Kru..."
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "8px 14px 8px 36px",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1",
                                    backgroundColor: "#ffffff",
                                    fontSize: "12.5px",
                                    color: "#0f172a",
                                    outline: "none",
                                }}
                            />
                        </div>
                    </div>

                    {/* TABLE CARD */}
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            overflow: "hidden",
                        }}
                    >
                        {filteredReports.length === 0 ? (
                            <div
                                style={{
                                    padding: "60px 20px",
                                    textAlign: "center",
                                    color: "#64748b",
                                }}
                            >
                                <div
                                    style={{
                                        width: "56px",
                                        height: "56px",
                                        backgroundColor: "#f1f5f9",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 14px",
                                        color: "#94a3b8",
                                    }}
                                >
                                    <FileText size={26} />
                                </div>
                                <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#1e293b", margin: "0 0 6px" }}>
                                    Tidak Ada Laporan yang Sesuai
                                </h3>
                                <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0 }}>
                                    Belum ada data laporan dengan filter tab atau kata kunci pencarian yang dipilih.
                                </p>
                            </div>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                    <thead>
                                        <tr
                                            style={{
                                                backgroundColor: "#004d32",
                                                color: "#ffffff",
                                                textAlign: "left",
                                                fontSize: "12px",
                                                fontWeight: "800",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.5px",
                                            }}
                                        >
                                            <th style={{ padding: "14px 18px", width: "45px" }}>No</th>
                                            <th style={{ padding: "14px 18px" }}>Rig & Kontrak</th>
                                            <th style={{ padding: "14px 18px" }}>Periode</th>
                                            <th style={{ padding: "14px 18px" }}>Audit Trail (PIC)</th>
                                            <th style={{ padding: "14px 18px", textAlign: "center" }}>Status Approval</th>
                                            <th style={{ padding: "14px 18px" }}>Catatan Admin Terbaru</th>
                                            <th style={{ padding: "14px 18px", textAlign: "right" }}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReports.map((report, idx) => {
                                            const periodLabel = formatPeriod(report.period, report.year);
                                            const creatorName = report.creator?.name || report.submitter_name || "PIC Lapangan";
                                            const updaterName = report.updater?.name || creatorName;
                                            const latestNote =
                                                report.latest_admin_note ||
                                                report.rejection_logs?.[0]?.rejection_reason ||
                                                report.rejection_reason;

                                            const hasRejectionLogs =
                                                (report.rejection_logs && report.rejection_logs.length > 0) ||
                                                Boolean(report.rejection_reason);

                                            return (
                                                <tr
                                                    key={report.id}
                                                    style={{
                                                        borderBottom: "1px solid #f1f5f9",
                                                        transition: "background-color 0.15s",
                                                    }}
                                                    onMouseEnter={(e) =>
                                                        (e.currentTarget.style.backgroundColor = "#f8fafc")
                                                    }
                                                    onMouseLeave={(e) =>
                                                        (e.currentTarget.style.backgroundColor = "transparent")
                                                    }
                                                >
                                                    <td style={{ padding: "14px 18px", color: "#64748b", fontWeight: "700" }}>
                                                        {idx + 1}
                                                    </td>
                                                    <td style={{ padding: "14px 18px" }}>
                                                        <div style={{ fontWeight: "800", color: "#004d32", fontSize: "13.5px" }}>
                                                            {report.rig_no}
                                                        </div>
                                                        <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                                                            {report.contract_no} ({report.location_district || "RH-1"})
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "14px 18px", fontWeight: "700", color: "#0f172a" }}>
                                                        {periodLabel}
                                                    </td>
                                                    <td style={{ padding: "14px 18px" }}>
                                                        <div style={{ fontSize: "12px", color: "#1e293b", fontWeight: "700" }}>
                                                            Dibuat: <strong>{creatorName}</strong>
                                                        </div>
                                                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                                                            Update: {updaterName} ({formatDateTime(report.updated_at)})
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "14px 18px", textAlign: "center" }}>
                                                        {report.status === "approved" ? (
                                                            <span
                                                                style={{
                                                                    backgroundColor: "#dcfce7",
                                                                    color: "#166534",
                                                                    border: "1px solid #86efac",
                                                                    padding: "4px 12px",
                                                                    borderRadius: "6px",
                                                                    fontSize: "11px",
                                                                    fontWeight: "800",
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    gap: "4px",
                                                                }}
                                                            >
                                                                <CheckCircle2 size={12} />
                                                                APPROVED
                                                            </span>
                                                        ) : report.status === "rejected" ? (
                                                            <span
                                                                style={{
                                                                    backgroundColor: "#fee2e2",
                                                                    color: "#991b1b",
                                                                    border: "1px solid #f87171",
                                                                    padding: "4px 12px",
                                                                    borderRadius: "6px",
                                                                    fontSize: "11px",
                                                                    fontWeight: "800",
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    gap: "4px",
                                                                }}
                                                            >
                                                                <AlertTriangle size={12} />
                                                                REJECTED
                                                            </span>
                                                        ) : (
                                                            <span
                                                                style={{
                                                                    backgroundColor: "#fef3c7",
                                                                    color: "#92400e",
                                                                    border: "1px solid #fde68a",
                                                                    padding: "4px 12px",
                                                                    borderRadius: "6px",
                                                                    fontSize: "11px",
                                                                    fontWeight: "800",
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    gap: "4px",
                                                                }}
                                                            >
                                                                <Clock size={12} />
                                                                PENDING
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: "14px 18px", maxWidth: "260px" }}>
                                                        {report.status === "rejected" ? (
                                                            <div>
                                                                <div
                                                                    style={{
                                                                        fontSize: "12px",
                                                                        color: "#991b1b",
                                                                        fontWeight: "700",
                                                                        backgroundColor: "#fff1f2",
                                                                        padding: "6px 10px",
                                                                        borderRadius: "6px",
                                                                        border: "1px dashed #fca5a5",
                                                                        lineHeight: "1.4",
                                                                    }}
                                                                >
                                                                    "{latestNote || "Perlu revisi data dari kru lapangan."}"
                                                                </div>
                                                                {hasRejectionLogs && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setHistoryModalReport(report)}
                                                                        style={{
                                                                            background: "none",
                                                                            border: "none",
                                                                            color: "#b45309",
                                                                            fontSize: "11px",
                                                                            fontWeight: "800",
                                                                            padding: "4px 0 0",
                                                                            cursor: "pointer",
                                                                            textDecoration: "underline",
                                                                            display: "inline-flex",
                                                                            alignItems: "center",
                                                                            gap: "4px",
                                                                        }}
                                                                    >
                                                                        <History size={11} />
                                                                        Lihat Riwayat Penolakan ({report.rejection_logs?.length || 1}x)
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : report.status === "approved" ? (
                                                            <span style={{ fontSize: "11.5px", color: "#166534", fontWeight: "600" }}>
                                                                Disetujui oleh Administrator ({formatDateTime(report.approved_at)})
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontSize: "11.5px", color: "#64748b", fontStyle: "italic" }}>
                                                                Menunggu pemeriksaan verifikasi admin...
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                                                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                                            {report.status === "rejected" && (
                                                                <Link
                                                                    href={`/user/input-data?report_id=${report.id}&mode=resubmit`}
                                                                    style={{
                                                                        display: "inline-flex",
                                                                        alignItems: "center",
                                                                        gap: "5px",
                                                                        backgroundColor: "#b45309",
                                                                        color: "#ffffff",
                                                                        border: "1px solid #f59e0b",
                                                                        padding: "6px 14px",
                                                                        borderRadius: "6px",
                                                                        fontSize: "12px",
                                                                        fontWeight: "800",
                                                                        textDecoration: "none",
                                                                        boxShadow: "0 2px 6px rgba(180, 83, 9, 0.25)",
                                                                    }}
                                                                >
                                                                    <FileEdit size={13} />
                                                                    Perbaiki / Edit
                                                                </Link>
                                                            )}

                                                            {hasRejectionLogs && report.status !== "rejected" && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setHistoryModalReport(report)}
                                                                    title="Lihat Riwayat Log"
                                                                    style={{
                                                                        backgroundColor: "#f1f5f9",
                                                                        border: "1px solid #cbd5e1",
                                                                        color: "#475569",
                                                                        padding: "6px 10px",
                                                                        borderRadius: "6px",
                                                                        fontSize: "11.5px",
                                                                        fontWeight: "700",
                                                                        cursor: "pointer",
                                                                        display: "inline-flex",
                                                                        alignItems: "center",
                                                                        gap: "4px",
                                                                    }}
                                                                >
                                                                    <History size={13} />
                                                                    Log
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* REJECTION HISTORY LOG MODAL */}
            {historyModalReport && (
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
                    onClick={() => setHistoryModalReport(null)}
                >
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "14px",
                            maxWidth: "560px",
                            width: "100%",
                            boxShadow: "0 20px 45px rgba(0, 0, 0, 0.25)",
                            border: "1px solid #e2e8f0",
                            overflow: "hidden",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div
                            style={{
                                padding: "18px 24px",
                                backgroundColor: "#92400e",
                                color: "#fef3c7",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <History size={20} strokeWidth={2.4} color="#fef3c7" />
                                <div>
                                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>
                                        Riwayat Catatan Penolakan (Rejection Log)
                                    </h3>
                                    <p style={{ margin: 0, fontSize: "11.5px", color: "#fde68a", fontWeight: "600" }}>
                                        Rig {historyModalReport.rig_no} — {formatPeriod(historyModalReport.period, historyModalReport.year)}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setHistoryModalReport(null)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#fef3c7",
                                    cursor: "pointer",
                                    padding: "4px",
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: "20px 24px", maxHeight: "420px", overflowY: "auto" }}>
                            {historyModalReport.rejection_logs && historyModalReport.rejection_logs.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                    {historyModalReport.rejection_logs.map((log, lIdx) => (
                                        <div
                                            key={log.id || lIdx}
                                            style={{
                                                backgroundColor: "#fffbeb",
                                                border: "1px solid #fde68a",
                                                borderLeft: "4px solid #d97706",
                                                borderRadius: "8px",
                                                padding: "12px 16px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    marginBottom: "6px",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        backgroundColor: "#fef3c7",
                                                        color: "#b45309",
                                                        fontSize: "11px",
                                                        fontWeight: "800",
                                                        padding: "2px 8px",
                                                        borderRadius: "4px",
                                                    }}
                                                >
                                                    Revisi #{log.revision_number || (historyModalReport.rejection_logs.length - lIdx)}
                                                </span>
                                                <span style={{ fontSize: "11px", color: "#78350f", fontWeight: "600" }}>
                                                    {formatDateTime(log.created_at)}
                                                </span>
                                            </div>

                                            <div style={{ fontSize: "13px", color: "#92400e", fontWeight: "700", lineHeight: "1.45" }}>
                                                "{log.rejection_reason}"
                                            </div>

                                            <div style={{ fontSize: "11px", color: "#b45309", marginTop: "6px", fontWeight: "600" }}>
                                                Ditolak oleh: <strong>{log.admin_name || "Administrator HSE"}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div
                                    style={{
                                        backgroundColor: "#fffbeb",
                                        border: "1px solid #fde68a",
                                        borderLeft: "4px solid #d97706",
                                        borderRadius: "8px",
                                        padding: "14px 16px",
                                    }}
                                >
                                    <div style={{ fontSize: "11.5px", color: "#78350f", marginBottom: "4px", fontWeight: "700" }}>
                                        Catatan Penolakan Terakhir:
                                    </div>
                                    <div style={{ fontSize: "13.5px", color: "#92400e", fontWeight: "700" }}>
                                        "{historyModalReport.rejection_reason || "Tidak ada catatan tertulis."}"
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div
                            style={{
                                padding: "14px 24px",
                                backgroundColor: "#f8fafc",
                                borderTop: "1px solid #e2e8f0",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            {historyModalReport.status === "rejected" ? (
                                <Link
                                    href={`/user/input-data?report_id=${historyModalReport.id}&mode=resubmit`}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        backgroundColor: "#b45309",
                                        color: "#ffffff",
                                        padding: "8px 18px",
                                        borderRadius: "7px",
                                        fontSize: "12.5px",
                                        fontWeight: "800",
                                        textDecoration: "none",
                                    }}
                                >
                                    <FileEdit size={14} />
                                    Buka Form Perbaikan
                                </Link>
                            ) : (
                                <div />
                            )}

                            <button
                                type="button"
                                onClick={() => setHistoryModalReport(null)}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "7px",
                                    border: "1px solid #cbd5e1",
                                    backgroundColor: "#ffffff",
                                    color: "#475569",
                                    fontSize: "12.5px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                }}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
