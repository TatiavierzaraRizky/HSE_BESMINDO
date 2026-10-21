import React, { useState, useEffect } from "react";
import {
    X,
    BookOpen,
    Maximize2,
    Minimize2,
    LayoutDashboard,
    ClipboardList,
    CheckCircle2,
    FileBarChart,
    CalendarDays,
    TrendingUp,
    ShieldCheck,
    Target,
    Settings,
    ArrowRight,
    HelpCircle,
    Activity,
    Users,
    AlertTriangle,
    Layers,
    Check,
    Sparkles,
} from "lucide-react";

export default function FeatureGuideModal({
    isOpen,
    onClose,
    onOpen,
    initialTab = "features",
}) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isMaximized, setIsMaximized] = useState(false);

    // Sinkronisasi tab saat dibuka dengan initialTab tertentu
    useEffect(() => {
        if (isOpen && initialTab) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    // Tutup dengan tombol ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Handle buka dari tombol floating
    const handleLaunch = () => {
        if (onOpen) {
            onOpen();
        } else {
            window.dispatchEvent(
                new CustomEvent("open-feature-guide", {
                    detail: { tab: "features" },
                })
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | JIKA WIDGET TERTUTUP: TAMPILKAN TOMBOL FLOATING SEPERTI WIDGET WA
    |--------------------------------------------------------------------------
    */
    if (!isOpen) {
        return (
            <div
                style={{
                    position: "fixed",
                    bottom: "22px",
                    right: "22px",
                    zIndex: 99990,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                }}
            >
                {/* TOOLTIP BADGE (OPSIONAL) */}
                <button
                    type="button"
                    onClick={handleLaunch}
                    title="Buka Panduan Fitur & Alur Sistem (Pojok Kanan Bawah)"
                    style={{
                        backgroundColor: "#004d32",
                        color: "#efff00",
                        border: "2px solid #efff00",
                        borderRadius: "50px",
                        padding: "10px 18px",
                        boxShadow:
                            "0 8px 24px rgba(0, 77, 50, 0.4), 0 2px 6px rgba(0,0,0,0.15)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        fontSize: "12.5px",
                        fontWeight: "800",
                        letterSpacing: "-0.01em",
                        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                        outline: "none",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.backgroundColor = "#006642";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.backgroundColor = "#004d32";
                    }}
                >
                    <span
                        style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(239, 255, 0, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            flexShrink: 0,
                        }}
                    >
                        💡
                    </span>
                    <span style={{ whiteSpace: "nowrap" }}>Panduan Fitur</span>
                </button>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | JIKA WIDGET TERBUKA: TAMPILKAN POP-UP DI SUDUT KANAN BAWAH (SEPERTI WA)
    |--------------------------------------------------------------------------
    */
    return (
        <>
            {/* BACKDROP GELAP HANYA SAAT DIMAKSIMALKAN (FULLSCREEN) */}
            {isMaximized && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(15, 23, 42, 0.55)",
                        backdropFilter: "blur(4px)",
                        zIndex: 99998,
                        animation: "fadeIn 0.2s ease-out",
                    }}
                    onClick={() => setIsMaximized(false)}
                />
            )}

            {/* KONTEN WIDGET POP-UP */}
            <div
                style={
                    isMaximized
                        ? {
                              position: "fixed",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              width: "960px",
                              maxWidth: "calc(100vw - 32px)",
                              height: "88vh",
                              maxHeight: "88vh",
                              backgroundColor: "#ffffff",
                              borderRadius: "16px",
                              boxShadow:
                                  "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
                              display: "flex",
                              flexDirection: "column",
                              overflow: "hidden",
                              border: "1px solid #cbd5e1",
                              boxSizing: "border-box",
                              zIndex: 99999,
                              animation: "popCenter 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                          }
                        : {
                              position: "fixed",
                              bottom: "22px",
                              right: "22px",
                              width: "480px",
                              maxWidth: "calc(100vw - 32px)",
                              height: "620px",
                              maxHeight: "calc(100vh - 44px)",
                              backgroundColor: "#ffffff",
                              borderRadius: "16px",
                              boxShadow:
                                  "0 18px 45px rgba(0, 0, 0, 0.25), 0 2px 10px rgba(0, 0, 0, 0.1)",
                              display: "flex",
                              flexDirection: "column",
                              overflow: "hidden",
                              border: "1.5px solid #004d32",
                              boxSizing: "border-box",
                              zIndex: 99999,
                              animation: "slideUpCorner 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                          }
                }
                onClick={(e) => e.stopPropagation()}
            >
                {/* ============================================================
                    HEADER WIDGET (HIJAU BESMINDO, TETAP & TIDAK MENYUSUT)
                ============================================================ */}
                <div
                    style={{
                        padding: "14px 18px",
                        backgroundColor: "#004d32",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #003623",
                        boxSizing: "border-box",
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            minWidth: 0,
                        }}
                    >
                        <div
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "10px",
                                backgroundColor: "rgba(239, 255, 0, 0.15)",
                                border: "1px solid #efff00",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#efff00",
                                flexShrink: 0,
                            }}
                        >
                            <BookOpen size={18} strokeWidth={2.4} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    flexWrap: "nowrap",
                                }}
                            >
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: "15.5px",
                                        fontWeight: "800",
                                        letterSpacing: "-0.01em",
                                        color: "#ffffff",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    Panduan Fitur & Alur HSE
                                </h2>
                                <span
                                    style={{
                                        fontSize: "10px",
                                        fontWeight: "750",
                                        backgroundColor: "#efff00",
                                        color: "#004d32",
                                        padding: "1px 6px",
                                        borderRadius: "10px",
                                        letterSpacing: "0.02em",
                                        whiteSpace: "nowrap",
                                        flexShrink: 0,
                                    }}
                                >
                                    Mentor & Kru
                                </span>
                            </div>
                            <p
                                style={{
                                    margin: "2px 0 0 0",
                                    fontSize: "11.5px",
                                    color: "#cbd5e1",
                                    fontWeight: "400",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                PT Besmindo Materi Sewatama &bull; Panduan Interaktif
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                        {/* TOMBOL MAXIMIZE / RESTORE */}
                        <button
                            type="button"
                            onClick={() => setIsMaximized(!isMaximized)}
                            title={isMaximized ? "Kecilkan ke pojok" : "Perbesar layar"}
                            style={{
                                background: "rgba(255, 255, 255, 0.12)",
                                border: "none",
                                borderRadius: "6px",
                                padding: "6px",
                                cursor: "pointer",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background 0.2s ease",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(255, 255, 255, 0.25)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(255, 255, 255, 0.12)")
                            }
                        >
                            {isMaximized ? (
                                <Minimize2 size={16} />
                            ) : (
                                <Maximize2 size={16} />
                            )}
                        </button>

                        {/* TOMBOL CLOSE (X) */}
                        <button
                            type="button"
                            onClick={onClose}
                            title="Tutup (ESC)"
                            style={{
                                background: "rgba(255, 255, 255, 0.12)",
                                border: "none",
                                borderRadius: "6px",
                                padding: "6px",
                                cursor: "pointer",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background 0.2s ease",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(255, 255, 255, 0.25)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(255, 255, 255, 0.12)")
                            }
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* ============================================================
                    TABS NAVIGATION (TETAP DI ATAS, TIDAK MENYUSUT)
                ============================================================ */}
                <div
                    style={{
                        display: "flex",
                        borderBottom: "1px solid #e2e8f0",
                        backgroundColor: "#f8fafc",
                        padding: "0 12px",
                        gap: "6px",
                        boxSizing: "border-box",
                        overflowX: "auto",
                        flexShrink: 0,
                        minHeight: "46px",
                        alignItems: "stretch",
                        scrollbarWidth: "none",
                    }}
                >
                    {[
                        { id: "workflow", label: "🧭 Alur Kerja", count: "5 Tahap" },
                        { id: "features", label: "📋 Fitur & Menu", count: "7 Modul" },
                        { id: "metrics", label: "📐 Indikator HSE", count: "Metrik" },
                        { id: "roles", label: "👥 Hak Akses", count: "Roles" },
                    ].map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: "10px 12px",
                                    border: "none",
                                    background: "transparent",
                                    borderBottom: isActive
                                        ? "3px solid #004d32"
                                        : "3px solid transparent",
                                    color: isActive ? "#004d32" : "#64748b",
                                    fontWeight: isActive ? "800" : "600",
                                    fontSize: "12.5px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    flexShrink: 0,
                                    transition: "all 0.15s ease",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <span>{tab.label}</span>
                                <span
                                    style={{
                                        fontSize: "10px",
                                        padding: "1px 5px",
                                        borderRadius: "6px",
                                        backgroundColor: isActive
                                            ? "#e2e8f0"
                                            : "#f1f5f9",
                                        color: isActive ? "#0f172a" : "#94a3b8",
                                        fontWeight: "600",
                                    }}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* ============================================================
                    BODY CONTENT (HANYA AREA INI YANG DAPAT DIGULIR/SCROLL)
                ============================================================ */}
                <div
                    style={{
                        padding: "18px",
                        overflowY: "auto",
                        flex: "1 1 0%",
                        minHeight: 0,
                        boxSizing: "border-box",
                        backgroundColor: "#ffffff",
                    }}
                >
                    {/* TAB 1: ALUR KERJA SISTEM */}
                    {activeTab === "workflow" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div
                                style={{
                                    padding: "12px 14px",
                                    backgroundColor: "#f0fdf4",
                                    border: "1px solid #bbf7d0",
                                    borderRadius: "10px",
                                    color: "#166534",
                                    fontSize: "12.5px",
                                    lineHeight: "1.55",
                                }}
                            >
                                <strong>💡 Bagaimana Data Bergerak di Aplikasi Ini?</strong>
                                <br />
                                Seluruh pencatatan keselamatan kerja berjalan secara berjenjang dari lapangan hingga evaluasi pimpinan.
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {[
                                    {
                                        step: "1",
                                        title: "Input Data Lapangan (Raw Data)",
                                        actor: "Petugas HSE Rig",
                                        page: "Menu: Input Data HSE",
                                        desc: "Petugas di rig (BMS#02, BMS#03, BMS#08) menginput data realisasi bulanan: Jam kerja aman (Safe Manhours), rapat keselamatan (Tool Box Meeting), inspeksi, hingga laporan insiden.",
                                        color: "#0284c7",
                                        bg: "#f0f9ff",
                                        border: "#bae6fd",
                                    },
                                    {
                                        step: "2",
                                        title: "Verifikasi & Quality Gate (Approval)",
                                        actor: "Admin HSE",
                                        page: "Menu: Approval",
                                        desc: "Data mentah diperiksa oleh Admin di menu Approval. Jika valid di-Approved, jika ada kesalahan ditolak (Rejected) dengan catatan revisi sebelum masuk ke perhitungan resmi.",
                                        color: "#d97706",
                                        bg: "#fffbeb",
                                        border: "#fde68a",
                                    },
                                    {
                                        step: "3",
                                        title: "Kalkulasi Otomatis KPI Migas",
                                        actor: "Sistem Otomatis",
                                        page: "Mesin Kalkulasi",
                                        desc: "Sistem mengolah data approved: Menghitung akumulasi Safe Manhours, Safe Days (Hari Tanpa Kecelakaan), rumus internasional LTIFR, TRIFR, dan rasio kepatuhan target.",
                                        color: "#7c3aed",
                                        bg: "#f5f3ff",
                                        border: "#ddd6fe",
                                    },
                                    {
                                        step: "4",
                                        title: "Pencatatan Laporan Terpadu",
                                        actor: "Admin & Tim HSE",
                                        page: "Menu: Reports",
                                        desc: "Plan Report memuat target perencanaan tahunan/bulanan, sementara Actual Report memuat realisasi nyata lapangan untuk disandingkan.",
                                        color: "#059669",
                                        bg: "#ecfdf5",
                                        border: "#a7f3d0",
                                    },
                                    {
                                        step: "5",
                                        title: "Monitoring Eksekutif & Evaluasi",
                                        actor: "Mentor & Pimpinan",
                                        page: "Dashboard & HSE Performance",
                                        desc: "Pimpinan dan mentor memantau performa melalui grafik tren bulanan, status Zero LTI, serta evaluasi pada formulir resmi BMSD/03/FO/HSE/02/17 untuk audit.",
                                        color: "#004d32",
                                        bg: "#e8f1ed",
                                        border: "#a3c7b7",
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.step}
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "12px",
                                            padding: "12px 14px",
                                            backgroundColor: item.bg,
                                            border: `1px solid ${item.border}`,
                                            borderRadius: "10px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "28px",
                                                height: "28px",
                                                borderRadius: "50%",
                                                backgroundColor: item.color,
                                                color: "#ffffff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: "800",
                                                fontSize: "14px",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {item.step}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    flexWrap: "wrap",
                                                    gap: "6px",
                                                    marginBottom: "4px",
                                                }}
                                            >
                                                <h3
                                                    style={{
                                                        margin: 0,
                                                        fontSize: "13.5px",
                                                        fontWeight: "750",
                                                        color: "#0f172a",
                                                    }}
                                                >
                                                    {item.title}
                                                </h3>
                                                <span
                                                    style={{
                                                        fontSize: "10.5px",
                                                        padding: "1px 6px",
                                                        borderRadius: "4px",
                                                        backgroundColor: "#ffffff",
                                                        color: item.color,
                                                        fontWeight: "700",
                                                        border: `1px solid ${item.border}`,
                                                    }}
                                                >
                                                    {item.page}
                                                </span>
                                            </div>
                                            <p
                                                style={{
                                                    margin: 0,
                                                    fontSize: "12px",
                                                    color: "#334155",
                                                    lineHeight: "1.5",
                                                }}
                                            >
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: PENJELASAN FITUR & MENU */}
                    {activeTab === "features" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "#475569",
                                    lineHeight: "1.55",
                                    backgroundColor: "#f8fafc",
                                    padding: "10px 14px",
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                }}
                            >
                                ℹ️ <strong>Rangkuman Fungsi Setiap Halaman:</strong> Panduan tujuan operasional tiap modul sehingga mentor dapat mengevaluasi kelengkapan sistem dengan mudah.
                            </div>

                            {[
                                {
                                    name: "Dashboard",
                                    route: "/admin/dashboard",
                                    icon: LayoutDashboard,
                                    badge: "Executive Summary",
                                    badgeColor: "#004d32",
                                    purpose:
                                        "Memberikan gambaran umum (helicopter view) performa keselamatan kerja seluruh rig secara real-time untuk pimpinan dan mentor tanpa harus membaca lembar teknis yang rumit.",
                                    keyContents: [
                                        "Total Safe Manhours & status Zero LTI (Zero Accident)",
                                        "Notifikasi laporan masuk menunggu Approval",
                                        "Grafik tren keselamatan gabungan seluruh rig",
                                    ],
                                    whyMentorCares:
                                        "Mengecek status aman (Zero Accident) dan kelancaran pelaporan dalam 5 detik.",
                                },
                                {
                                    name: "Input Data HSE",
                                    route: "/admin/input-data",
                                    icon: ClipboardList,
                                    badge: "Formulir Bulanan",
                                    badgeColor: "#0284c7",
                                    purpose:
                                        "Formulir entri data mentah (raw data) aktivitas keselamatan kerja bulanan per rig yang diisi oleh kru/petugas lapangan.",
                                    keyContents: [
                                        "Indikator Proaktif (Leading): Tool Box Meeting, Safety Induction, Inspeksi, KTA/TKA",
                                        "Indikator Reaktif (Lagging): Fatality, LTI, First Aid, Nearmiss, Spill",
                                        "Pencatatan Jam Kerja (Manhours) Aktual",
                                    ],
                                    whyMentorCares:
                                        "Sumber data utama (single source of truth) untuk seluruh perhitungan KPI.",
                                },
                                {
                                    name: "Approval",
                                    route: "/admin/approval",
                                    icon: CheckCircle2,
                                    badge: "Quality Gate",
                                    badgeColor: "#d97706",
                                    purpose:
                                        "Pintu gerbang verifikasi dan validasi data sebelum diakui secara sah di statistik resmi perusahaan.",
                                    keyContents: [
                                        "Status Pengajuan: Pending, Approved, atau Rejected",
                                        "Review rincian angka sebelum disetujui",
                                        "Riwayat audit trail agar data tidak dimanipulasi",
                                    ],
                                    whyMentorCares:
                                        "Menjamin integritas data agar laporan tidak ada yang fiktif atau salah input.",
                                },
                                {
                                    name: "Reports (Plan & Actual)",
                                    route: "/admin/reports",
                                    icon: FileBarChart,
                                    badge: "Pusat Laporan",
                                    badgeColor: "#059669",
                                    purpose:
                                        "Pusat dokumentasi dan rekapitulasi data dengan dua submenu untuk membedakan Target dan Realisasi.",
                                    keyContents: [
                                        "📅 Plan Report: Target tahunan yang diturunkan per bulan per rig",
                                        "📈 Actual Report: Realisasi lapangan aktual bulanan yang telah diapprove",
                                        "Fitur ekspor laporan spreadsheet / Excel",
                                    ],
                                    whyMentorCares:
                                        "Membandingkan: 'Apakah pencapaian aktual (Actual) sudah memenuhi rencana awal (Plan)?'",
                                },
                                {
                                    name: "HSE Performance",
                                    route: "/admin/hse-performance",
                                    icon: ShieldCheck,
                                    badge: "Standar Form Migas",
                                    badgeColor: "#004d32",
                                    purpose:
                                        "Halaman analisis statistik formal performa keselamatan kerja sesuai standar formulir resmi PT Besmindo (Form BMSD/03/FO/HSE/02/17 Rev: #12).",
                                    keyContents: [
                                        "Kumulatif Safe Man Hours tanpa insiden LTI",
                                        "Rumus Migas Internasional: LTIFR, TRIFR, Severity Rate",
                                        "Perbandingan performa Rig BMS#02, BMS#03, BMS#08",
                                        "Grafik Proaktif (pencegahan) vs Reaktif (insiden)",
                                    ],
                                    whyMentorCares:
                                        "Halaman inti yang diaudit oleh klien migas (Pertamina/PHR) dan sertifikasi ISO 45001.",
                                },
                                {
                                    name: "Target KPI Management",
                                    route: "/admin/target-kpi",
                                    icon: Target,
                                    badge: "Konfigurasi Target",
                                    badgeColor: "#7c3aed",
                                    purpose:
                                        "Menetapkan target kinerja keselamatan kerja dan bobot evaluasi (weighting) tahunan untuk seluruh rig.",
                                    keyContents: [
                                        "Target Sasaran: Zero LTI, target jam kerja, kepatuhan inspeksi 100%",
                                        "Ambang batas status (Hijau = Tercapai, Merah = Waspada)",
                                    ],
                                    whyMentorCares:
                                        "Dasar objektif bagi mentor untuk menilai keberhasilan program HSE.",
                                },
                                {
                                    name: "Settings",
                                    route: "/admin/settings",
                                    icon: Settings,
                                    badge: "Konfigurasi Akun",
                                    badgeColor: "#475569",
                                    purpose:
                                        "Mengatur profil pengguna, data rig operasional, dan preferensi aplikasi.",
                                    keyContents: [
                                        "Profil Admin & Manajemen Password",
                                        "Daftar Rig Operasional aktif",
                                    ],
                                    whyMentorCares:
                                        "Memastikan keamanan hak akses sistem.",
                                },
                            ].map((mod) => {
                                const Icon = mod.icon;
                                return (
                                    <div
                                        key={mod.name}
                                        style={{
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "10px",
                                            padding: "14px",
                                            backgroundColor: "#ffffff",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                marginBottom: "8px",
                                                flexWrap: "wrap",
                                                gap: "6px",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <div
                                                    style={{
                                                        width: "30px",
                                                        height: "30px",
                                                        borderRadius: "6px",
                                                        backgroundColor: "#f1f5f9",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        color: mod.badgeColor,
                                                    }}
                                                >
                                                    <Icon size={17} strokeWidth={2.2} />
                                                </div>
                                                <div>
                                                    <h3
                                                        style={{
                                                            margin: 0,
                                                            fontSize: "14px",
                                                            fontWeight: "750",
                                                            color: "#0f172a",
                                                        }}
                                                    >
                                                        {mod.name}
                                                    </h3>
                                                    <span style={{ fontSize: "10.5px", color: "#64748b", fontFamily: "monospace" }}>
                                                        {mod.route}
                                                    </span>
                                                </div>
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: "10px",
                                                    fontWeight: "750",
                                                    backgroundColor: `${mod.badgeColor}15`,
                                                    color: mod.badgeColor,
                                                    padding: "2px 8px",
                                                    borderRadius: "10px",
                                                    border: `1px solid ${mod.badgeColor}30`,
                                                }}
                                            >
                                                {mod.badge}
                                            </span>
                                        </div>

                                        <p
                                            style={{
                                                margin: "0 0 10px 0",
                                                fontSize: "12px",
                                                color: "#334155",
                                                lineHeight: "1.5",
                                            }}
                                        >
                                            {mod.purpose}
                                        </p>

                                        <div
                                            style={{
                                                backgroundColor: "#f8fafc",
                                                padding: "10px 12px",
                                                borderRadius: "6px",
                                                border: "1px solid #e2e8f0",
                                                fontSize: "11.5px",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "6px",
                                            }}
                                        >
                                            <div>
                                                <strong style={{ color: "#004d32" }}>Isi Kunci:</strong>
                                                <ul style={{ margin: "3px 0 0", paddingLeft: "16px", color: "#475569" }}>
                                                    {mod.keyContents.map((kc, idx) => (
                                                        <li key={idx} style={{ marginBottom: "2px" }}>
                                                            {kc}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "5px" }}>
                                                <strong style={{ color: "#004d32" }}>Nilai Bagi Mentor:</strong>{" "}
                                                <span style={{ color: "#334155" }}>{mod.whyMentorCares}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* TAB 3: ISTILAH & METRIK HSE */}
                    {activeTab === "metrics" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div
                                style={{
                                    fontSize: "12.5px",
                                    color: "#334155",
                                    lineHeight: "1.55",
                                    backgroundColor: "#f0fdf4",
                                    padding: "12px 14px",
                                    borderRadius: "8px",
                                    border: "1px solid #bbf7d0",
                                }}
                            >
                                <strong>💡 Standar Hulu Migas (IADC & OGP):</strong>
                                <br />
                                Metrik dibagi menjadi <strong>Leading (Proaktif)</strong> dan <strong>Lagging (Reaktif)</strong>.
                            </div>

                            {/* LEADING */}
                            <div
                                style={{
                                    border: "1px solid #bbf7d0",
                                    borderRadius: "10px",
                                    padding: "14px",
                                    backgroundColor: "#f0fdf4",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        color: "#166534",
                                        fontWeight: "800",
                                        fontSize: "13.5px",
                                        marginBottom: "6px",
                                    }}
                                >
                                    <TrendingUp size={16} /> Leading Indicators (Proaktif)
                                </div>
                                <div style={{ fontSize: "11.5px", color: "#15803d", marginBottom: "8px" }}>
                                    Aktivitas pencegahan sebelum insiden. <strong>Semakin tinggi nilainya, semakin baik!</strong>
                                </div>
                                <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "#166534", lineHeight: "1.55" }}>
                                    <li><strong>Tool Box Meeting:</strong> Rapat keselamatan kru sebelum mulai kerja.</li>
                                    <li><strong>Safety Induction:</strong> Pengenalan K3 bagi personil baru/tamu.</li>
                                    <li><strong>Management Visit:</strong> Kunjungan pimpinan langsung ke rig.</li>
                                    <li><strong>Hazard Observation (KTA/TKA):</strong> Kartu temuan bahaya lapangan.</li>
                                    <li><strong>Audit / Inspeksi:</strong> Pemeriksaan berkala alat, rig, dan APD.</li>
                                </ul>
                            </div>

                            {/* LAGGING */}
                            <div
                                style={{
                                    border: "1px solid #fecaca",
                                    borderRadius: "10px",
                                    padding: "14px",
                                    backgroundColor: "#fef2f2",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        color: "#991b1b",
                                        fontWeight: "800",
                                        fontSize: "13.5px",
                                        marginBottom: "6px",
                                    }}
                                >
                                    <AlertTriangle size={16} /> Lagging Indicators (Reaktif)
                                </div>
                                <div style={{ fontSize: "11.5px", color: "#b91c1c", marginBottom: "8px" }}>
                                    Kejadian setelah insiden terjadi. <strong>Target perusahaan adalah 0 (NOL / Zero Accident).</strong>
                                </div>
                                <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "#991b1b", lineHeight: "1.55" }}>
                                    <li><strong>Fatality:</strong> Kecelakaan fatal kematian (Target: 0).</li>
                                    <li><strong>Lost Time Injury (LTI):</strong> Cedera hilang hari kerja (Target: 0).</li>
                                    <li><strong>Medical Treatment (MTC):</strong> Perawatan medis klinik/dokter.</li>
                                    <li><strong>First Aid (FAC):</strong> Pertolongan pertama luka ringan.</li>
                                    <li><strong>Nearmiss:</strong> Kejadian hampir celaka.</li>
                                    <li><strong>Spill:</strong> Tumpahan minyak / limbah kimia ke lingkungan.</li>
                                </ul>
                            </div>

                            {/* RUMUS UTAMA */}
                            <div
                                style={{
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "10px",
                                    padding: "14px",
                                    backgroundColor: "#ffffff",
                                }}
                            >
                                <h4
                                    style={{
                                        margin: "0 0 10px 0",
                                        fontSize: "13.5px",
                                        fontWeight: "750",
                                        color: "#0f172a",
                                    }}
                                >
                                    📊 Rumus Perhitungan Sistem:
                                </h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {[
                                        {
                                            name: "Safe Man Hours",
                                            formula: "Jumlah Pekerja × Jam Harian × Hari Tanpa LTI",
                                            desc: "Akumulasi jam kerja aman tanpa ada kecelakaan fatal atau LTI.",
                                        },
                                        {
                                            name: "LTIFR",
                                            formula: "(Kasus LTI × 1.000.000) / Total Manhours",
                                            desc: "Frekuensi cedera LTI per 1 juta jam kerja (Nilai terbaik: 0.00).",
                                        },
                                        {
                                            name: "TRIFR",
                                            formula: "(Total Recordable Cases × 1.000.000) / Total Manhours",
                                            desc: "Standar industri migas untuk seluruh keparahan insiden tercatat.",
                                        },
                                    ].map((metric) => (
                                        <div
                                            key={metric.name}
                                            style={{
                                                padding: "8px 10px",
                                                backgroundColor: "#f8fafc",
                                                borderRadius: "6px",
                                                border: "1px solid #e2e8f0",
                                                fontSize: "12px",
                                            }}
                                        >
                                            <div style={{ fontWeight: "750", color: "#004d32" }}>
                                                {metric.name}
                                            </div>
                                            <div
                                                style={{
                                                    fontFamily: "monospace",
                                                    color: "#0284c7",
                                                    fontSize: "11px",
                                                    margin: "2px 0",
                                                }}
                                            >
                                                {metric.formula}
                                            </div>
                                            <div style={{ color: "#64748b", fontSize: "11.5px" }}>
                                                {metric.desc}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: PERAN PENGGUNA (ROLES) */}
                    {activeTab === "roles" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "#334155",
                                    lineHeight: "1.55",
                                    backgroundColor: "#f8fafc",
                                    padding: "10px 14px",
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                }}
                            >
                                👥 <strong>Pembagian Hak Akses Pengguna:</strong>
                            </div>

                            {[
                                {
                                    role: "Admin HSE / Koordinator",
                                    badge: "Full Access",
                                    badgeBg: "#dcfce7",
                                    badgeColor: "#15803d",
                                    duties: [
                                        "Menyetujui (Approval) atau menolak input data dari rig.",
                                        "Mengelola target sasaran di Target KPI Management.",
                                        "Mencetak dan mengekspor Plan & Actual Report.",
                                        "Memantau seluruh grafik performa dan anomali tren.",
                                    ],
                                },
                                {
                                    role: "Inspector / Petugas Lapangan Rig",
                                    badge: "Input & Review",
                                    badgeBg: "#e0f2fe",
                                    badgeColor: "#0369a1",
                                    duties: [
                                        "Menginput data jam kerja dan insiden bulanan sesuai kondisi lapangan.",
                                        "Melihat status persetujuan data (Pending / Approved / Rejected).",
                                        "Melakukan revisi jika laporan ditolak oleh Admin HSE.",
                                    ],
                                },
                                {
                                    role: "Mentor / Pimpinan / Auditor",
                                    badge: "Executive Viewer",
                                    badgeBg: "#fef3c7",
                                    badgeColor: "#b45309",
                                    duties: [
                                        "Mengevaluasi efektivitas program keselamatan kerja PT Besmindo.",
                                        "Memantau kepatuhan target Zero Accident melalui Dashboard & HSE Performance.",
                                        "Mengecek apakah rasio Plan vs Actual tercapai sesuai sasaran tahunan.",
                                    ],
                                },
                            ].map((role) => (
                                <div
                                    key={role.role}
                                    style={{
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "10px",
                                        padding: "12px 14px",
                                        backgroundColor: "#ffffff",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        <h4
                                            style={{
                                                margin: 0,
                                                fontSize: "13.5px",
                                                fontWeight: "750",
                                                color: "#0f172a",
                                            }}
                                        >
                                            {role.role}
                                        </h4>
                                        <span
                                            style={{
                                                fontSize: "10.5px",
                                                fontWeight: "700",
                                                backgroundColor: role.badgeBg,
                                                color: role.badgeColor,
                                                padding: "1px 7px",
                                                borderRadius: "8px",
                                            }}
                                        >
                                            {role.badge}
                                        </span>
                                    </div>
                                    <ul
                                        style={{
                                            margin: 0,
                                            paddingLeft: "16px",
                                            fontSize: "11.5px",
                                            color: "#475569",
                                            lineHeight: "1.55",
                                        }}
                                    >
                                        {role.duties.map((duty, idx) => (
                                            <li key={idx} style={{ marginBottom: "2px" }}>
                                                {duty}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ============================================================
                    FOOTER (TETAP DI BAWAH, TIDAK MENYUSUT)
                ============================================================ */}
                <div
                    style={{
                        padding: "10px 18px",
                        backgroundColor: "#f8fafc",
                        borderTop: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxSizing: "border-box",
                        gap: "10px",
                        flexShrink: 0,
                    }}
                >
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                        📌 Letak di sudut kanan bawah agar tidak menghalangi halaman kerja.
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            backgroundColor: "#004d32",
                            color: "#efff00",
                            border: "1px solid #efff00",
                            padding: "6px 16px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "750",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#006642";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#004d32";
                        }}
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </>
    );
}
