import React, { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import UserSidebar from "../../Components/UserSidebar";
import UserHeaderProfile from "../../Components/UserHeaderProfile";
import {
    BookmarkCheck,
    Calendar,
    ChevronRight,
    ClipboardList,
    Clock,
    FileText,
    Layers,
    MapPin,
    Plus,
    Sparkles,
    Trash2,
    UserCheck,
} from "lucide-react";

export default function UserDrafts({
    drafts: initialDrafts = [],
    assignedRigs = [],
}) {
    const pageProps = usePage().props;
    const currentUser = pageProps.auth?.user;
    const [drafts, setDrafts] = useState(initialDrafts);
    const [isDeletingId, setIsDeletingId] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    const showToast = (message, type = "success") => {
        setToastMessage({ message, type, time: Date.now() });
        setTimeout(() => {
            setToastMessage((prev) =>
                prev?.time && Date.now() - prev.time >= 4000 ? null : prev
            );
        }, 4500);
    };

    const handleDeleteDraft = async (draftId, rigNo, periodLabel) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus draf Rig ${rigNo} periode ${periodLabel}? Tindakan ini tidak dapat dibatalkan.`)) {
            return;
        }

        setIsDeletingId(draftId);
        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            const res = await fetch(`/user/hse-report/draft/${draftId}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken || "",
                },
            });

            const result = await res.json();
            if (result?.success) {
                setDrafts((prev) => prev.filter((d) => d.id !== draftId));
                showToast("Draf laporan berhasil dihapus dari sistem.", "success");
            } else {
                alert(result?.message || "Gagal menghapus draf.");
            }
        } catch (error) {
            console.error("Delete draft error:", error);
            alert("Terjadi kendala jaringan saat menghapus draf.");
        } finally {
            setIsDeletingId(null);
        }
    };

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
                {/* TOAST NOTIFIKASI */}
                {toastMessage && (
                    <div
                        style={{
                            position: "fixed",
                            top: "24px",
                            right: "24px",
                            zIndex: 9999,
                            backgroundColor:
                                toastMessage.type === "error" ? "#dc2626" : "#004d32",
                            color: "#ffffff",
                            padding: "12px 20px",
                            borderRadius: "10px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            fontSize: "13.5px",
                            fontWeight: "700",
                        }}
                    >
                        <Sparkles size={16} />
                        <span>{toastMessage.message}</span>
                    </div>
                )}

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
                                <BookmarkCheck size={12} />
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
                                Draf Laporan HSE Lapangan
                            </h1>
                            <p
                                style={{
                                    fontSize: "13.5px",
                                    color: "#64748b",
                                    margin: 0,
                                }}
                            >
                                Kelola dan lanjutkan pengisian laporan yang belum disubmit resmi. Draf dapat diakses bersama oleh PIC pada Rig yang sama.
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
                                    transition: "all 0.2s",
                                }}
                            >
                                <Plus size={16} strokeWidth={2.6} />
                                Buat Laporan Baru
                            </Link>
                        </div>
                    </div>

                    {/* RIG ASSIGNED INFO BAR */}
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
                                Total: {drafts.length} Draf Aktif
                            </span>
                        </div>
                    )}

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
                        {drafts.length === 0 ? (
                            <div
                                style={{
                                    padding: "60px 20px",
                                    textAlign: "center",
                                    color: "#64748b",
                                }}
                            >
                                <div
                                    style={{
                                        width: "60px",
                                        height: "60px",
                                        backgroundColor: "#f1f5f9",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 16px",
                                        color: "#94a3b8",
                                    }}
                                >
                                    <BookmarkCheck size={28} />
                                </div>
                                <h3
                                    style={{
                                        fontSize: "16px",
                                        fontWeight: "800",
                                        color: "#1e293b",
                                        margin: "0 0 6px",
                                    }}
                                >
                                    Tidak Ada Draf Tersimpan
                                </h3>
                                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px" }}>
                                    Saat ini belum ada pengisian laporan yang tersimpan sebagai draf untuk rig penugasan Anda.
                                </p>
                                <Link
                                    href="/user/input-data"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        backgroundColor: "#004d32",
                                        color: "#efff00",
                                        border: "1px solid #efff00",
                                        padding: "8px 18px",
                                        borderRadius: "7px",
                                        textDecoration: "none",
                                        fontSize: "12.5px",
                                        fontWeight: "800",
                                    }}
                                >
                                    <Plus size={15} />
                                    Mulai Input Data Baru
                                </Link>
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
                                            <th style={{ padding: "14px 18px", width: "50px" }}>No</th>
                                            <th style={{ padding: "14px 18px" }}>Rig & Kontrak</th>
                                            <th style={{ padding: "14px 18px" }}>Periode</th>
                                            <th style={{ padding: "14px 18px" }}>Dibuat Oleh</th>
                                            <th style={{ padding: "14px 18px" }}>Terakhir Diperbarui</th>
                                            <th style={{ padding: "14px 18px", textAlign: "center" }}>Status</th>
                                            <th style={{ padding: "14px 18px", textAlign: "right" }}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {drafts.map((draft, idx) => {
                                            const periodLabel = formatPeriod(draft.period, draft.year);
                                            const creatorName = draft.creator?.name || draft.submitter_name || "PIC Lapangan";
                                            const updaterName = draft.updater?.name || creatorName;

                                            return (
                                                <tr
                                                    key={draft.id}
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
                                                            {draft.rig_no}
                                                        </div>
                                                        <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                                                            {draft.contract_no} ({draft.location_district || "RH-1"})
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "14px 18px", fontWeight: "700", color: "#0f172a" }}>
                                                        {periodLabel}
                                                    </td>
                                                    <td style={{ padding: "14px 18px" }}>
                                                        <div style={{ fontWeight: "700", color: "#1e293b" }}>
                                                            {creatorName}
                                                        </div>
                                                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                                                            {formatDateTime(draft.created_at)}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "14px 18px" }}>
                                                        <div style={{ fontWeight: "700", color: "#1e293b" }}>
                                                            {updaterName}
                                                        </div>
                                                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                                                            {formatDateTime(draft.updated_at)}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "14px 18px", textAlign: "center" }}>
                                                        <span
                                                            style={{
                                                                backgroundColor: "#fef3c7",
                                                                color: "#92400e",
                                                                border: "1px solid #fde68a",
                                                                padding: "3px 10px",
                                                                borderRadius: "6px",
                                                                fontSize: "11px",
                                                                fontWeight: "800",
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: "4px",
                                                            }}
                                                        >
                                                            <BookmarkCheck size={11} />
                                                            DRAFT
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                                                        <div
                                                            style={{
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: "8px",
                                                            }}
                                                        >
                                                            <Link
                                                                href={`/user/input-data?draft_id=${draft.id}`}
                                                                style={{
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    gap: "5px",
                                                                    backgroundColor: "#004d32",
                                                                    color: "#efff00",
                                                                    border: "1px solid #efff00",
                                                                    padding: "6px 14px",
                                                                    borderRadius: "6px",
                                                                    fontSize: "12px",
                                                                    fontWeight: "800",
                                                                    textDecoration: "none",
                                                                    boxShadow: "0 1px 4px rgba(0, 77, 50, 0.15)",
                                                                }}
                                                            >
                                                                Lanjutkan
                                                                <ChevronRight size={13} strokeWidth={2.8} />
                                                            </Link>

                                                            <button
                                                                type="button"
                                                                disabled={isDeletingId === draft.id}
                                                                onClick={() =>
                                                                    handleDeleteDraft(
                                                                        draft.id,
                                                                        draft.rig_no,
                                                                        periodLabel
                                                                    )
                                                                }
                                                                title="Hapus Draf"
                                                                style={{
                                                                    backgroundColor: "#fef2f2",
                                                                    border: "1px solid #fca5a5",
                                                                    color: "#dc2626",
                                                                    width: "32px",
                                                                    height: "32px",
                                                                    borderRadius: "6px",
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    cursor: isDeletingId === draft.id ? "not-allowed" : "pointer",
                                                                }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
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
        </div>
    );
}
