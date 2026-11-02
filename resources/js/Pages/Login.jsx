import React, { useState, useMemo } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import {
    ShieldCheck,
    ClipboardList,
    Lock,
    Mail,
    Eye,
    EyeOff,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    Layers,
    UserCheck,
    Filter,
    ChevronDown,
    MapPin,
    Fuel,
} from "lucide-react";

// DAFTAR AKUN PRESET RESMI TERHUBUNG DATABASE MYSQL
export const LOGIN_PRESET_ACCOUNTS = [
    // 1. Admin
    {
        id: "admin",
        name: "HSE Administrator",
        email: "admin@besmindo.com",
        password: "password",
        role: "admin",
        area: "Pusat / Admin",
        areaKey: "ADMIN",
        badge: "Admin Pusat",
        coordName: "Administrator Pusat",
        rigs: "Semua 16 Rig Operasional",
        contracts: "Seluruh Kontrak (SPHR)",
        color: "#004d32",
        bg: "#ecfdf5",
        borderColor: "#a7f3d0",
    },

    // 2. Area RH-1
    {
        id: "hse.rh1@besmindo.com",
        name: "HSE Coord RH-1",
        email: "hse.rh1@besmindo.com",
        password: "password",
        role: "user",
        area: "RH-1",
        areaKey: "RH-1",
        badge: "Koordinator Area RH-1",
        coordName: "Ahmad Afandi / Edo Syahputra",
        rigs: "BMS # 19, BMS # 16, BMS # 11, BMS # 10 (4 Rig)",
        contracts: "SPHR00576A, SPHR00797A",
        color: "#b91c1c",
        bg: "#fef2f2",
        borderColor: "#fecaca",
    },
    {
        id: "ahmad.afandi@besmindo.com",
        name: "Ahmad Afandi",
        email: "ahmad.afandi@besmindo.com",
        password: "password",
        role: "user",
        area: "RH-1",
        areaKey: "RH-1",
        badge: "PIC Area RH-1",
        coordName: "Ahmad Afandi / Edo Syahputra",
        rigs: "BMS # 19, BMS # 16, BMS # 11, BMS # 10 (4 Rig)",
        contracts: "SPHR00576A, SPHR00797A",
        color: "#b91c1c",
        bg: "#fef2f2",
        borderColor: "#fecaca",
    },
    {
        id: "edo.syahputra@besmindo.com",
        name: "Edo Syahputra",
        email: "edo.syahputra@besmindo.com",
        password: "password",
        role: "user",
        area: "RH-1",
        areaKey: "RH-1",
        badge: "PIC Area RH-1",
        coordName: "Ahmad Afandi / Edo Syahputra",
        rigs: "BMS # 19, BMS # 16, BMS # 11, BMS # 10 (4 Rig)",
        contracts: "SPHR00576A, SPHR00797A",
        color: "#b91c1c",
        bg: "#fef2f2",
        borderColor: "#fecaca",
    },

    // 3. Area HO
    {
        id: "hse.ho@besmindo.com",
        name: "HSE Coord HO",
        email: "hse.ho@besmindo.com",
        password: "password",
        role: "user",
        area: "HO",
        areaKey: "HO",
        badge: "Koordinator Area HO",
        coordName: "Mulya Fernando / Joko Nuryanto",
        rigs: "BMS # 20, BMS # 06, BMS # 21, BMS # 03a (4 Rig)",
        contracts: "SPHR01003C, SPHR01067C, SPHR01071C, SPHR01097C",
        color: "#15803d",
        bg: "#f0fdf4",
        borderColor: "#bbf7d0",
    },
    {
        id: "mulya.fernando@besmindo.com",
        name: "Mulya Fernando",
        email: "mulya.fernando@besmindo.com",
        password: "password",
        role: "user",
        area: "HO",
        areaKey: "HO",
        badge: "PIC Area HO",
        coordName: "Mulya Fernando / Joko Nuryanto",
        rigs: "BMS # 20, BMS # 06, BMS # 21, BMS # 03a (4 Rig)",
        contracts: "SPHR01003C, SPHR01067C, SPHR01071C, SPHR01097C",
        color: "#15803d",
        bg: "#f0fdf4",
        borderColor: "#bbf7d0",
    },
    {
        id: "joko.nuryanto@besmindo.com",
        name: "Joko Nuryanto",
        email: "joko.nuryanto@besmindo.com",
        password: "password",
        role: "user",
        area: "HO",
        areaKey: "HO",
        badge: "PIC Area HO",
        coordName: "Mulya Fernando / Joko Nuryanto",
        rigs: "BMS # 20, BMS # 06, BMS # 21, BMS # 03a (4 Rig)",
        contracts: "SPHR01003C, SPHR01067C, SPHR01071C, SPHR01097C",
        color: "#15803d",
        bg: "#f0fdf4",
        borderColor: "#bbf7d0",
    },

    // 4. Area South
    {
        id: "hse.south@besmindo.com",
        name: "HSE Coord South",
        email: "hse.south@besmindo.com",
        password: "password",
        role: "user",
        area: "South",
        areaKey: "South",
        badge: "Koordinator Area South",
        coordName: "Teddy / Jejen",
        rigs: "BMS # 02, BMS # 03, BMS # 08, BMS # 07 (4 Rig)",
        contracts: "SPHR01095C, SPHR01220A",
        color: "#7e22ce",
        bg: "#faf5ff",
        borderColor: "#e9d5ff",
    },
    {
        id: "teddy@besmindo.com",
        name: "Teddy",
        email: "teddy@besmindo.com",
        password: "password",
        role: "user",
        area: "South",
        areaKey: "South",
        badge: "PIC Area South",
        coordName: "Teddy / Jejen",
        rigs: "BMS # 02, BMS # 03, BMS # 08, BMS # 07 (4 Rig)",
        contracts: "SPHR01095C, SPHR01220A",
        color: "#7e22ce",
        bg: "#faf5ff",
        borderColor: "#e9d5ff",
    },
    {
        id: "jejen@besmindo.com",
        name: "Jejen",
        email: "jejen@besmindo.com",
        password: "password",
        role: "user",
        area: "South",
        areaKey: "South",
        badge: "PIC Area South",
        coordName: "Teddy / Jejen",
        rigs: "BMS # 02, BMS # 03, BMS # 08, BMS # 07 (4 Rig)",
        contracts: "SPHR01095C, SPHR01220A",
        color: "#7e22ce",
        bg: "#faf5ff",
        borderColor: "#e9d5ff",
    },

    // 5. Area North
    {
        id: "hse.north@besmindo.com",
        name: "HSE Coord North",
        email: "hse.north@besmindo.com",
        password: "password",
        role: "user",
        area: "North",
        areaKey: "North",
        badge: "Koordinator Area North",
        coordName: "Suryatno / Satrio",
        rigs: "BMS # 05, BMS # 17, BMS # 18, BMS # 15 (4 Rig)",
        contracts: "SPHR01002C, SPHR01096C, SPHR01220A",
        color: "#0369a1",
        bg: "#f0f9ff",
        borderColor: "#bae6fd",
    },
    {
        id: "suryatno@besmindo.com",
        name: "Suryatno",
        email: "suryatno@besmindo.com",
        password: "password",
        role: "user",
        area: "North",
        areaKey: "North",
        badge: "PIC Area North",
        coordName: "Suryatno / Satrio",
        rigs: "BMS # 05, BMS # 17, BMS # 18, BMS # 15 (4 Rig)",
        contracts: "SPHR01002C, SPHR01096C, SPHR01220A",
        color: "#0369a1",
        bg: "#f0f9ff",
        borderColor: "#bae6fd",
    },
    {
        id: "satrio@besmindo.com",
        name: "Satrio",
        email: "satrio@besmindo.com",
        password: "password",
        role: "user",
        area: "North",
        areaKey: "North",
        badge: "PIC Area North",
        coordName: "Suryatno / Satrio",
        rigs: "BMS # 05, BMS # 17, BMS # 18, BMS # 15 (4 Rig)",
        contracts: "SPHR01002C, SPHR01096C, SPHR01220A",
        color: "#0369a1",
        bg: "#f0f9ff",
        borderColor: "#bae6fd",
    },

    // 6. Akun Demo Umum
    {
        id: "user@besmindo.com",
        name: "Field PIC (General)",
        email: "user@besmindo.com",
        password: "password",
        role: "user",
        area: "Demo",
        areaKey: "DEMO",
        badge: "Demo Akun User",
        coordName: "General Operator",
        rigs: "Semua Rig Tersedia",
        contracts: "General Contract",
        color: "#475569",
        bg: "#f8fafc",
        borderColor: "#cbd5e1",
    },
];

const AREA_FILTER_TABS = [
    { key: "ALL", label: "Semua", badge: "14 Akun", dotColor: "#64748b" },
    { key: "ADMIN", label: "Admin", badge: "Pusat", dotColor: "#004d32" },
    { key: "RH-1", label: "RH-1", badge: "3 Akun", dotColor: "#dc2626" },
    { key: "HO", label: "HO", badge: "3 Akun", dotColor: "#16a34a" },
    { key: "South", label: "South", badge: "3 Akun", dotColor: "#9333ea" },
    { key: "North", label: "North", badge: "3 Akun", dotColor: "#0284c7" },
];

export default function Login({ status }) {
    const [activeAreaTab, setActiveAreaTab] = useState("ADMIN");
    const [selectedAccountId, setSelectedAccountId] = useState("admin");
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: "admin@besmindo.com",
        password: "password",
        role: "admin",
        remember: true,
    });

    // Cari info akun aktif saat ini
    const activeAccount = useMemo(() => {
        return (
            LOGIN_PRESET_ACCOUNTS.find(
                (acc) =>
                    acc.id === selectedAccountId ||
                    acc.email.toLowerCase() === (data.email || "").toLowerCase()
            ) || null
        );
    }, [selectedAccountId, data.email]);

    // Handle pemilihan akun dari dropdown / list filter
    const handleAccountSelect = (accountId) => {
        const found = LOGIN_PRESET_ACCOUNTS.find((acc) => acc.id === accountId);
        if (!found) return;

        setSelectedAccountId(found.id);
        if (found.areaKey && found.areaKey !== "DEMO") {
            setActiveAreaTab(found.areaKey);
        }

        setData({
            ...data,
            email: found.email,
            password: found.password || "password",
            role: found.role,
        });
    };

    // Handle klik tab filter area (Admin, RH-1, HO, South, North)
    const handleAreaTabClick = (tabKey) => {
        setActiveAreaTab(tabKey);

        if (tabKey === "ADMIN") {
            handleAccountSelect("admin");
        } else if (tabKey === "RH-1") {
            handleAccountSelect("hse.rh1@besmindo.com");
        } else if (tabKey === "HO") {
            handleAccountSelect("hse.ho@besmindo.com");
        } else if (tabKey === "South") {
            handleAccountSelect("hse.south@besmindo.com");
        } else if (tabKey === "North") {
            handleAccountSelect("hse.north@besmindo.com");
        } else if (tabKey === "ALL") {
            // Biarkan akun aktif saat ini atau default admin jika sebelumnya belum
            if (!activeAccount) {
                handleAccountSelect("admin");
            }
        }
    };

    // Handle perubahan manual pada input email
    const handleEmailChange = (e) => {
        const val = e.target.value;
        setData("email", val);

        const match = LOGIN_PRESET_ACCOUNTS.find(
            (acc) => acc.email.toLowerCase() === val.trim().toLowerCase()
        );
        if (match) {
            setSelectedAccountId(match.id);
            setActiveAreaTab(match.areaKey || "ALL");
            setData((prev) => ({
                ...prev,
                email: val,
                role: match.role,
                password: prev.password || match.password,
            }));
        } else {
            setSelectedAccountId("");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/login", {
            onFinish: () => reset("password"),
        });
    };

    // Filter daftar akun pada dropdown jika tab spesifik dipilih
    const filteredAccounts = useMemo(() => {
        if (activeAreaTab === "ALL") {
            return LOGIN_PRESET_ACCOUNTS;
        }
        return LOGIN_PRESET_ACCOUNTS.filter(
            (acc) => acc.areaKey === activeAreaTab
        );
    }, [activeAreaTab]);

    return (
        <>
            <Head title="Login Portal HSE - PT Besmindo Materi Sewatama" />

            <style>{`
                @keyframes logoGifFloat {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg) scale(1);
                    }
                    25% {
                        transform: translateY(-6px) rotate(-1deg) scale(1.015);
                    }
                    50% {
                        transform: translateY(-1px) rotate(1deg) scale(1.008);
                    }
                    75% {
                        transform: translateY(-5px) rotate(-0.5deg) scale(1.018);
                    }
                }

                @keyframes logoGlowPulse {
                    0%, 100% {
                        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12), 0 0 18px rgba(239, 255, 0, 0.25);
                        border-color: #efff00;
                    }
                    50% {
                        box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18), 0 0 28px rgba(239, 255, 0, 0.45);
                        border-color: #10b981;
                    }
                }

                @keyframes logoShimmerSwipe {
                    0% {
                        transform: translateX(-140%) skewX(-20deg);
                    }
                    35%, 100% {
                        transform: translateX(240%) skewX(-20deg);
                    }
                }

                @keyframes logoStarTwinkle {
                    0%, 100% {
                        transform: scale(0.65) rotate(0deg);
                        opacity: 0.4;
                    }
                    50% {
                        transform: scale(1.2) rotate(45deg);
                        opacity: 1;
                    }
                }

                @keyframes beaconPulse {
                    0% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                    }
                    70% {
                        transform: scale(1.1);
                        box-shadow: 0 0 0 7px rgba(16, 185, 129, 0);
                    }
                    100% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
                    }
                }

                @keyframes buttonSheen {
                    0% {
                        left: -100%;
                    }
                    100% {
                        left: 200%;
                    }
                }

                .clean-input-box:focus-within {
                    border-color: #004d32 !important;
                    background-color: #ffffff !important;
                    box-shadow: 0 0 0 3.5px rgba(0, 77, 50, 0.12), 0 1px 2px rgba(0, 0, 0, 0.05) !important;
                }

                .clean-input-box:focus-within .input-icon {
                    color: #004d32 !important;
                }

                .clean-login-btn:hover {
                    transform: translateY(-1.5px);
                    box-shadow: 0 8px 24px rgba(0, 77, 50, 0.35), 0 0 18px rgba(239, 255, 0, 0.25) !important;
                }

                .clean-login-btn:hover .btn-sheen {
                    animation: buttonSheen 1.2s infinite;
                }

                .clean-login-btn:hover .btn-arrow {
                    transform: translateX(4px);
                }

                .account-select:focus {
                    border-color: #004d32 !important;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(0, 77, 50, 0.15) !important;
                }
            `}</style>

            {/* FULLSCREEN WRAPPER WITH VISIBLE OILFIELD BACKGROUND PHOTO */}
            <div
                style={{
                    minHeight: "100vh",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px 14px",
                    boxSizing: "border-box",
                    fontFamily:
                        "'Instrument Sans', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
            >
                {/* BACKGROUND IMAGE - FOTO KEDUA RIG MINYAK TERLIHAT JELAS */}
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: "url('/images/auth-bg.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        zIndex: 0,
                    }}
                />

                {/* SOFT TRANSLUCENT OVERLAY */}
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                            "linear-gradient(135deg, rgba(0, 24, 16, 0.40) 0%, rgba(0, 15, 10, 0.50) 100%)",
                        zIndex: 1,
                    }}
                />

                {/* MAIN CLEAN GLASS CARD */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        width: "100%",
                        maxWidth: "490px",
                        borderRadius: "24px",
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        border: "1.5px solid rgba(255, 255, 255, 0.85)",
                        boxShadow:
                            "0 25px 60px -10px rgba(0, 0, 0, 0.45), 0 0 35px rgba(0, 77, 50, 0.25)",
                        padding: "32px 28px 26px",
                        boxSizing: "border-box",
                        overflow: "hidden",
                    }}
                >
                    {/* ACCENT LINE ON TOP */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            background:
                                "linear-gradient(90deg, #004d32 0%, #efff00 50%, #004d32 100%)",
                        }}
                    />

                    {/* HEADER / ANIMATED LOGO SECTION */}
                    <div style={{ textAlign: "center", marginBottom: "18px" }}>
                        {/* ANIMATED FLOATING LOGO */}
                        <div
                            style={{
                                position: "relative",
                                display: "inline-block",
                                maxWidth: "320px",
                                width: "100%",
                                marginBottom: "12px",
                            }}
                        >
                            <span
                                style={{
                                    position: "absolute",
                                    top: "-8px",
                                    right: "-6px",
                                    fontSize: "18px",
                                    zIndex: 15,
                                    pointerEvents: "none",
                                    animation: "logoStarTwinkle 1.8s infinite ease-in-out",
                                }}
                            >
                                ✨
                            </span>
                            <span
                                style={{
                                    position: "absolute",
                                    bottom: "-6px",
                                    left: "-6px",
                                    fontSize: "17px",
                                    zIndex: 15,
                                    pointerEvents: "none",
                                    animation:
                                        "logoStarTwinkle 1.8s infinite ease-in-out 0.9s",
                                }}
                            >
                                🌟
                            </span>

                            {/* LOGO PLATE */}
                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "100%",
                                    padding: "12px 20px",
                                    borderRadius: "18px",
                                    backgroundColor: "#ffffff",
                                    border: "2px solid #efff00",
                                    boxSizing: "border-box",
                                    position: "relative",
                                    overflow: "hidden",
                                    animation:
                                        "logoGifFloat 3s infinite ease-in-out, logoGlowPulse 2.4s infinite ease-in-out",
                                    transformOrigin: "center center",
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "60%",
                                        height: "100%",
                                        background:
                                            "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent)",
                                        pointerEvents: "none",
                                        animation:
                                            "logoShimmerSwipe 3.5s infinite ease-in-out",
                                    }}
                                />

                                <img
                                    src="/images/besmindo-logo.png"
                                    alt="PT BESMINDO MATERI SEWATAMA"
                                    style={{
                                        height: "auto",
                                        maxHeight: "72px",
                                        width: "100%",
                                        maxWidth: "270px",
                                        objectFit: "contain",
                                        display: "block",
                                        position: "relative",
                                        zIndex: 2,
                                    }}
                                />
                            </div>
                        </div>

                        {/* SYSTEM PILL BADGE */}
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "4px 12px",
                                borderRadius: "20px",
                                backgroundColor: "rgba(0, 77, 50, 0.08)",
                                border: "1px solid rgba(0, 77, 50, 0.15)",
                                color: "#004d32",
                                fontSize: "11px",
                                fontWeight: "800",
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                                marginBottom: "6px",
                            }}
                        >
                            <span
                                style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    backgroundColor: "#10b981",
                                    display: "inline-block",
                                    animation: "beaconPulse 1.8s infinite",
                                }}
                            />
                            <span>HSE Integrated Portal</span>
                        </div>

                        <h2
                            style={{
                                margin: 0,
                                fontSize: "19px",
                                fontWeight: "900",
                                color: "#0f172a",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Selamat Datang 
                        </h2>
                    </div>

                    {/* ======================================================== */}
                    {/* SECTION: LIST FILTER LOGIN PER AREA (RH1, HO, SOUTH, NORTH, ADMIN) */}
                    {/* ======================================================== */}
                    <div
                        style={{
                            backgroundColor: "#f8fafc",
                            border: "1.5px solid #e2e8f0",
                            borderRadius: "16px",
                            padding: "12px 14px",
                            marginBottom: "16px",
                        }}
                    >
                        {/* AREA TAB PILLS */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "8px",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    fontSize: "11.5px",
                                    fontWeight: "800",
                                    color: "#0f172a",
                                }}
                            >
                                <Filter size={13} color="#004d32" />
                                <span>Filter Area HSE Coord:</span>
                            </div>
                        </div>

                        {/* 5 AREA TABS */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(6, 1fr)",
                                gap: "4px",
                                marginBottom: "10px",
                            }}
                        >
                            {AREA_FILTER_TABS.map((tab) => {
                                const isActive = activeAreaTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => handleAreaTabClick(tab.key)}
                                        style={{
                                            padding: "6px 4px",
                                            borderRadius: "9px",
                                            border: isActive
                                                ? "1.5px solid #004d32"
                                                : "1px solid #cbd5e1",
                                            backgroundColor: isActive
                                                ? "#004d32"
                                                : "#ffffff",
                                            color: isActive ? "#efff00" : "#334155",
                                            fontSize: "11px",
                                            fontWeight: "800",
                                            cursor: "pointer",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "2px",
                                            transition: "all 0.18s ease",
                                            boxShadow: isActive
                                                ? "0 2px 6px rgba(0, 77, 50, 0.25)"
                                                : "none",
                                        }}
                                        title={`Filter Area ${tab.label}`}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: "6px",
                                                    height: "6px",
                                                    borderRadius: "50%",
                                                    backgroundColor: isActive
                                                        ? "#efff00"
                                                        : tab.dotColor,
                                                }}
                                            />
                                            <span>{tab.label}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* QUICK ACCOUNT SELECTOR (DROPDOWN) */}
                        <div>
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    color: "#475569",
                                    marginBottom: "4px",
                                }}
                            >
                                <Layers size={12} color="#004d32" />
                                <span>Pilih Akun HSE Coord / PIC:</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <select
                                    className="account-select"
                                    value={selectedAccountId || activeAccount?.id || ""}
                                    onChange={(e) => handleAccountSelect(e.target.value)}
                                    style={{
                                        width: "100%",
                                        height: "38px",
                                        padding: "0 30px 0 10px",
                                        borderRadius: "9px",
                                        border: "1.5px solid #cbd5e1",
                                        backgroundColor: "#ffffff",
                                        color: "#0f172a",
                                        fontSize: "12px",
                                        fontWeight: "700",
                                        cursor: "pointer",
                                        appearance: "none",
                                        WebkitAppearance: "none",
                                    }}
                                >
                                    {activeAreaTab === "ALL" ? (
                                        <>
                                            <optgroup label="👑 Administrator (Pusat)">
                                                <option value="admin">
                                                    HSE Administrator (admin@besmindo.com)
                                                </option>
                                            </optgroup>
                                            <optgroup label="🔴 Area RH-1 (Ahmad Afandi / Edo Syahputra)">
                                                <option value="hse.rh1@besmindo.com">
                                                    HSE Coord RH-1 (hse.rh1@besmindo.com)
                                                </option>
                                                <option value="ahmad.afandi@besmindo.com">
                                                    Ahmad Afandi — PIC RH-1 (ahmad.afandi@besmindo.com)
                                                </option>
                                                <option value="edo.syahputra@besmindo.com">
                                                    Edo Syahputra — PIC RH-1 (edo.syahputra@besmindo.com)
                                                </option>
                                            </optgroup>
                                            <optgroup label="🟢 Area HO (Mulya Fernando / Joko Nuryanto)">
                                                <option value="hse.ho@besmindo.com">
                                                    HSE Coord HO (hse.ho@besmindo.com)
                                                </option>
                                                <option value="mulya.fernando@besmindo.com">
                                                    Mulya Fernando — PIC HO (mulya.fernando@besmindo.com)
                                                </option>
                                                <option value="joko.nuryanto@besmindo.com">
                                                    Joko Nuryanto — PIC HO (joko.nuryanto@besmindo.com)
                                                </option>
                                            </optgroup>
                                            <optgroup label="🟣 Area South (Teddy / Jejen)">
                                                <option value="hse.south@besmindo.com">
                                                    HSE Coord South (hse.south@besmindo.com)
                                                </option>
                                                <option value="teddy@besmindo.com">
                                                    Teddy — PIC South (teddy@besmindo.com)
                                                </option>
                                                <option value="jejen@besmindo.com">
                                                    Jejen — PIC South (jejen@besmindo.com)
                                                </option>
                                            </optgroup>
                                            <optgroup label="🔵 Area North (Suryatno / Satrio)">
                                                <option value="hse.north@besmindo.com">
                                                    HSE Coord North (hse.north@besmindo.com)
                                                </option>
                                                <option value="suryatno@besmindo.com">
                                                    Suryatno — PIC North (suryatno@besmindo.com)
                                                </option>
                                                <option value="satrio@besmindo.com">
                                                    Satrio — PIC North (satrio@besmindo.com)
                                                </option>
                                            </optgroup>
                                            <optgroup label="⚙️ Demo Lainnya">
                                                <option value="user@besmindo.com">
                                                    Field PIC (General Demo)
                                                </option>
                                            </optgroup>
                                        </>
                                    ) : (
                                        filteredAccounts.map((acc) => (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.name} — ({acc.email})
                                            </option>
                                        ))
                                    )}
                                </select>
                                <ChevronDown
                                    size={15}
                                    color="#64748b"
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        top: "12px",
                                        pointerEvents: "none",
                                    }}
                                />
                            </div>
                        </div>

                        {/* PREVIEW KARTU INFO AKUN TERPILIH */}
                        {activeAccount && (
                            <div
                                style={{
                                    marginTop: "10px",
                                    padding: "8px 10px",
                                    borderRadius: "10px",
                                    backgroundColor: activeAccount.bg || "#f8fafc",
                                    border: `1px solid ${activeAccount.borderColor || "#e2e8f0"}`,
                                    fontSize: "11px",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: "4px",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: "800",
                                            color: activeAccount.color || "#0f172a",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "5px",
                                        }}
                                    >
                                        <UserCheck size={13} />
                                        <span>{activeAccount.name}</span>
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "9.5px",
                                            fontWeight: "800",
                                            padding: "2px 6px",
                                            borderRadius: "6px",
                                            backgroundColor: activeAccount.color || "#004d32",
                                            color: "#ffffff",
                                        }}
                                    >
                                        {activeAccount.badge}
                                    </span>
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr",
                                        gap: "2px",
                                        color: "#475569",
                                        lineHeight: 1.35,
                                    }}
                                >
                                    <div>
                                        <strong style={{ color: "#1e293b" }}>PIC Coord:</strong>{" "}
                                        {activeAccount.coordName}
                                    </div>
                                    <div>
                                        <strong style={{ color: "#1e293b" }}>Rig Terkait:</strong>{" "}
                                        {activeAccount.rigs}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* STATUS ALERT */}
                    {status && (
                        <div
                            style={{
                                backgroundColor: "#ecfdf5",
                                border: "1px solid #34d399",
                                borderRadius: "10px",
                                padding: "8px 12px",
                                marginBottom: "12px",
                                color: "#065f46",
                                fontSize: "12px",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                gap: "7px",
                            }}
                        >
                            <CheckCircle2 size={15} color="#059669" />
                            <span>{status}</span>
                        </div>
                    )}

                    {/* ERROR ALERT */}
                    {errors.email && (
                        <div
                            style={{
                                backgroundColor: "#fee2e2",
                                border: "1px solid #f87171",
                                borderRadius: "10px",
                                padding: "8px 12px",
                                marginBottom: "12px",
                                color: "#991b1b",
                                fontSize: "12px",
                                fontWeight: "700",
                            }}
                        >
                            {errors.email}
                        </div>
                    )}

                    {/* MAIN FORM */}
                    <form onSubmit={handleSubmit}>
                        {/* EMAIL INPUT */}
                        <div style={{ marginBottom: "12px" }}>
                            <label
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    color: "#334155",
                                    marginBottom: "4px",
                                }}
                            >
                                <span>Alamat Email / Username</span>
                                <span
                                    style={{
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        color: "#64748b",
                                    }}
                                >
                                    Bisa diedit manual
                                </span>
                            </label>
                            <div
                                className="clean-input-box"
                                style={{
                                    position: "relative",
                                    display: "flex",
                                    alignItems: "center",
                                    borderRadius: "11px",
                                    border: "1.5px solid #cbd5e1",
                                    backgroundColor: "#f8fafc",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <div
                                    className="input-icon"
                                    style={{
                                        position: "absolute",
                                        left: "11px",
                                        color: "#64748b",
                                        display: "flex",
                                        alignItems: "center",
                                        transition: "color 0.2s ease",
                                    }}
                                >
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={data.email}
                                    onChange={handleEmailChange}
                                    placeholder="nama@besmindo.com"
                                    style={{
                                        width: "100%",
                                        height: "40px",
                                        padding: "0 12px 0 36px",
                                        border: "none",
                                        outline: "none",
                                        fontSize: "13px",
                                        color: "#0f172a",
                                        backgroundColor: "transparent",
                                        boxSizing: "border-box",
                                        fontWeight: "600",
                                    }}
                                />
                            </div>
                        </div>

                        {/* PASSWORD INPUT */}
                        <div style={{ marginBottom: "14px" }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "4px",
                                }}
                            >
                                <label
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: "700",
                                        color: "#334155",
                                    }}
                                >
                                    Kata Sandi
                                </label>
                                <Link
                                    href="/forgot-password"
                                    style={{
                                        fontSize: "11.5px",
                                        color: "#004d32",
                                        fontWeight: "700",
                                        textDecoration: "none",
                                    }}
                                >
                                    Lupa kata sandi?
                                </Link>
                            </div>
                            <div
                                className="clean-input-box"
                                style={{
                                    position: "relative",
                                    display: "flex",
                                    alignItems: "center",
                                    borderRadius: "11px",
                                    border: "1.5px solid #cbd5e1",
                                    backgroundColor: "#f8fafc",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <div
                                    className="input-icon"
                                    style={{
                                        position: "absolute",
                                        left: "11px",
                                        color: "#64748b",
                                        display: "flex",
                                        alignItems: "center",
                                        transition: "color 0.2s ease",
                                    }}
                                >
                                    <Lock size={16} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    placeholder="Masukkan kata sandi..."
                                    style={{
                                        width: "100%",
                                        height: "40px",
                                        padding: "0 36px 0 36px",
                                        border: "none",
                                        outline: "none",
                                        fontSize: "13px",
                                        color: "#0f172a",
                                        backgroundColor: "transparent",
                                        boxSizing: "border-box",
                                        fontWeight: "600",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        background: "none",
                                        border: "none",
                                        color: "#64748b",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "4px",
                                    }}
                                    title={
                                        showPassword
                                            ? "Sembunyikan sandi"
                                            : "Tampilkan sandi"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* REMEMBER ME & ROLE BADGE */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "18px",
                                fontSize: "12px",
                            }}
                        >
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "7px",
                                    color: "#475569",
                                    cursor: "pointer",
                                    userSelect: "none",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.checked)
                                    }
                                    style={{
                                        accentColor: "#004d32",
                                        width: "14px",
                                        height: "14px",
                                        cursor: "pointer",
                                    }}
                                />
                                <span>Ingat sesi masuk</span>
                            </label>

                            <span
                                style={{
                                    fontSize: "11px",
                                    color: data.role === "admin" ? "#004d32" : "#991b1b",
                                    backgroundColor:
                                        data.role === "admin"
                                            ? "rgba(0, 77, 50, 0.08)"
                                            : "#fef2f2",
                                    border: `1px solid ${
                                        data.role === "admin"
                                            ? "rgba(0, 77, 50, 0.15)"
                                            : "#fecaca"
                                    }`,
                                    padding: "2px 7px",
                                    borderRadius: "5px",
                                    fontWeight: "800",
                                }}
                            >
                                {data.role === "admin"
                                    ? "👑 Dashboard Admin"
                                    : `👷 ${activeAccount?.area ? `HSE Coord ${activeAccount.area}` : "Input Lapangan"}`}
                            </span>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="clean-login-btn"
                            style={{
                                width: "100%",
                                height: "45px",
                                borderRadius: "11px",
                                backgroundColor: "#004d32",
                                color: "#efff00",
                                border: "1.5px solid #efff00",
                                fontWeight: "800",
                                fontSize: "13.5px",
                                letterSpacing: "0.02em",
                                cursor: processing ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                boxShadow: "0 4px 14px rgba(0, 77, 50, 0.3)",
                                opacity: processing ? 0.7 : 1,
                                position: "relative",
                                overflow: "hidden",
                                transition: "all 0.25s ease",
                            }}
                        >
                            <div
                                className="btn-sheen"
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    width: "40%",
                                    height: "100%",
                                    background:
                                        "linear-gradient(90deg, transparent, rgba(239, 255, 0, 0.3), transparent)",
                                    transform: "skewX(-20deg)",
                                }}
                            />

                            <span>
                                {processing
                                    ? "Memverifikasi..."
                                    : data.role === "admin"
                                    ? "Masuk ke Dashboard Admin"
                                    : `Masuk sebagai ${activeAccount?.name || "HSE Coord"}`}
                            </span>
                            <ArrowRight
                                size={16}
                                strokeWidth={2.8}
                                className="btn-arrow"
                                style={{ transition: "transform 0.2s ease" }}
                            />
                        </button>
                    </form>

                    {/* FOOTER SECTION */}
                    <div
                        style={{
                            marginTop: "16px",
                            paddingTop: "14px",
                            borderTop: "1px solid #f1f5f9",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "10.5px",
                                color: "#94a3b8",
                                fontWeight: "600",
                            }}
                        >
                            <Lock size={11} color="#10b981" />
                            <span>PT Besmindo Materi Sewatama • SSL 256-Bit</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
