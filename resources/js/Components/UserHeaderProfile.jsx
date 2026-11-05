import React, { useEffect, useState, useRef } from "react";
import { usePage } from "@inertiajs/react";
import {
    User,
    Shield,
    MapPin,
    LogOut,
    ChevronDown,
    CheckCircle2,
    HardHat,
} from "lucide-react";
import { clearTabAuth } from "../Services/authService";

/**
 * Komponen Topbar Profile Header
 * Menampilkan identitas akun yang sedang login di pojok kanan atas halaman
 * dengan pill badge, avatar inisial, role, dan rig penugasan.
 */
export default function UserHeaderProfile({ user: propUser, assignedRigs: propAssignedRigs }) {
    const pageProps = usePage().props;
    const currentUser = propUser || pageProps.auth?.user || pageProps.user;
    const assignedRigs =
        propAssignedRigs || currentUser?.assigned_rigs || pageProps.assignedRigs || [];

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Dapatkan inisial nama pengguna (misal "Ahmad Afandi" -> "AA")
    const getInitials = (name) => {
        if (!name) return "PIC";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // Label Role & Rig
    const roleLabel =
        currentUser?.role === "admin"
            ? "Administrator HSE"
            : "Field PIC / Operator";

    const rigBadge =
        currentUser?.role === "admin"
            ? "Akses Seluruh Rig"
            : assignedRigs && assignedRigs.length > 0
            ? assignedRigs.length === 1
                ? `Rig ${assignedRigs[0]}`
                : `Rig ${assignedRigs[0]} (+${assignedRigs.length - 1})`
            : "Field Crew";

    // Close dropdown saat klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!currentUser) return null;

    return (
        <div style={{ position: "relative" }} ref={dropdownRef}>
            {/* USER PILL BADGE UTAMA DI HEADER */}
            <div
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "12px",
                    backgroundColor: "#ffffff",
                    border: "1.5px solid #cbd5e1",
                    borderRadius: "14px",
                    padding: "6px 14px 6px 8px",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                    transition: "all 0.2s ease",
                    userSelect: "none",
                }}
                title="Klik untuk melihat rincian profil & akun login"
            >
                {/* Avatar Lingkaran Inisial dengan Online Indicator */}
                <div style={{ position: "relative" }}>
                    <div
                        style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "10px",
                            backgroundColor: "#004d32",
                            color: "#efff00",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "800",
                            fontSize: "14px",
                            letterSpacing: "0.5px",
                            boxShadow: "0 2px 6px rgba(0, 77, 50, 0.25)",
                        }}
                    >
                        {getInitials(currentUser.name)}
                    </div>
                    {/* Status Dot Aktif */}
                    <span
                        style={{
                            position: "absolute",
                            bottom: "-2px",
                            right: "-2px",
                            width: "11px",
                            height: "11px",
                            backgroundColor: "#10b981",
                            border: "2px solid #ffffff",
                            borderRadius: "50%",
                        }}
                    />
                </div>

                {/* Info Teks Identitas Pengguna */}
                <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "10.5px",
                            fontWeight: "700",
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.4px",
                            lineHeight: "1.2",
                        }}
                    >
                        <span>Logged in as</span>
                    </div>

                    <div
                        style={{
                            fontSize: "13.5px",
                            fontWeight: "800",
                            color: "#0f172a",
                            lineHeight: "1.3",
                            maxWidth: "180px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {currentUser.name}
                    </div>

                    {/* Role & Rig Badges */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                        <span
                            style={{
                                fontSize: "10.5px",
                                fontWeight: "800",
                                color: "#004d32",
                                backgroundColor: "#ecfdf5",
                                border: "1px solid #a7f3d0",
                                padding: "1px 7px",
                                borderRadius: "4px",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {roleLabel}
                        </span>

                        <span
                            style={{
                                fontSize: "10.5px",
                                fontWeight: "800",
                                color: "#1e3a8a",
                                backgroundColor: "#eff6ff",
                                border: "1px solid #bfdbfe",
                                padding: "1px 7px",
                                borderRadius: "4px",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {rigBadge}
                        </span>
                    </div>
                </div>

                <ChevronDown
                    size={16}
                    color="#94a3b8"
                    style={{
                        marginLeft: "2px",
                        transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                    }}
                />
            </div>

            {/* DROPDOWN MENU DETAIL AKUN & LOGOUT */}
            {isDropdownOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        right: 0,
                        width: "300px",
                        backgroundColor: "#ffffff",
                        borderRadius: "14px",
                        boxShadow: "0 15px 35px rgba(0, 0, 0, 0.15)",
                        border: "1px solid #e2e8f0",
                        padding: "16px",
                        zIndex: 9999,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                        <div
                            style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "10px",
                                backgroundColor: "#004d32",
                                color: "#efff00",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "800",
                                fontSize: "16px",
                            }}
                        >
                            {getInitials(currentUser.name)}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {currentUser.name}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {currentUser.email}
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "10px 12px",
                            fontSize: "12px",
                            marginBottom: "14px",
                        }}
                    >
                        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: "6px", marginBottom: "6px" }}>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>Hak Role:</span>
                            <span style={{ color: "#004d32", fontWeight: "800" }}>{roleLabel}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: "6px", marginBottom: "6px" }}>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>Area Operasi:</span>
                            <span style={{ color: "#0f172a", fontWeight: "700" }}>{currentUser.area || "RH-1"}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: "6px" }}>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>Rig Terdaftar:</span>
                            <span style={{ color: "#0f172a", fontWeight: "700" }}>
                                {assignedRigs && assignedRigs.length > 0 ? assignedRigs.join(", ") : "Semua Rig"}
                            </span>
                        </div>
                    </div>

                    <a
                        href="/logout"
                        onClick={() => clearTabAuth()}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            width: "100%",
                            padding: "9px 0",
                            backgroundColor: "#fee2e2",
                            border: "1px solid #fecaca",
                            borderRadius: "8px",
                            color: "#b91c1c",
                            fontWeight: "800",
                            fontSize: "12.5px",
                            textDecoration: "none",
                            transition: "all 0.15s ease",
                        }}
                    >
                        <LogOut size={14} />
                        Keluar Akun (Logout)
                    </a>
                </div>
            )}
        </div>
    );
}
