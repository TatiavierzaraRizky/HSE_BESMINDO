import React, { useEffect, useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";

import {
    LayoutDashboard,
    ClipboardList,
    ShieldCheck,
    BarChart3,
    Target,
    FileText,
    CheckCircle2,
    FileBarChart,
    CalendarDays,
    TrendingUp,
    Settings,
    CircleHelp,
    BookOpen,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ArrowUpRight,
} from "lucide-react";
import FeatureGuideModal from "./FeatureGuideModal";

function AdminSidebar({
    collapsed: collapsedProp,
    onToggle,
}) {
    const { url } = usePage();

    /*
    |--------------------------------------------------------------------------
    | FEATURE GUIDE MODAL
    |--------------------------------------------------------------------------
    */
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [guideTab, setGuideTab] = useState("features");

    useEffect(() => {
        const handleOpenGuide = (e) => {
            if (e?.detail?.tab) {
                setGuideTab(e.detail.tab);
            } else {
                setGuideTab("features");
            }
            setShowGuideModal(true);
        };
        window.addEventListener("open-feature-guide", handleOpenGuide);
        return () => window.removeEventListener("open-feature-guide", handleOpenGuide);
    }, []);

    /*
    |--------------------------------------------------------------------------
    | SIDEBAR STATE
    |--------------------------------------------------------------------------
    */
    const [internalCollapsed, setInternalCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("besmindo_admin_sidebar_collapsed");
            if (saved !== null) {
                return saved === "true";
            }
        }
        return false;
    });

    // Kalau dipakai bersama AdminLayout, state berasal dari parent.
    // Kalau belum ada AdminLayout, sidebar tetap bisa berjalan sendiri.
    const isControlled = typeof collapsedProp === "boolean";
    const collapsed = isControlled
        ? collapsedProp
        : internalCollapsed;

    /*
    |--------------------------------------------------------------------------
    | RESPONSIVE
    |--------------------------------------------------------------------------
    */
    useEffect(() => {
        if (isControlled) return;

        const handleResize = () => {
            if (window.innerWidth <= 900) {
                setInternalCollapsed(true);
            } else {
                const saved = localStorage.getItem("besmindo_admin_sidebar_collapsed");
                if (saved !== null) {
                    setInternalCollapsed(saved === "true");
                } else {
                    setInternalCollapsed(false);
                }
            }
        };

        handleResize();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [isControlled]);

    /*
    |--------------------------------------------------------------------------
    | MENU
    |--------------------------------------------------------------------------
    */
    const menuItems = [
        {
            name: "Dashboard",
            href: "/admin/dashboard",
            icon: LayoutDashboard,
        },

        {
            name: "Input Data HSE",
            href: "/admin/input-data",
            icon: ClipboardList,
        },

        {
            name: "Approval",
            href: "/admin/approval",
            icon: CheckCircle2,
        },

        {
            name: "Reports",
            href: "/admin/reports",
            icon: FileBarChart,
            hasSubmenu: true,
            submenus: [
                {
                    name: "Plan Report",
                    href: "/admin/reports/plan",
                    icon: CalendarDays,
                },
                {
                    name: "Actual Report",
                    href: "/admin/reports/actual",
                    icon: TrendingUp,
                },
            ],
        },

        {
            name: "HSE Performance",
            href: "/admin/hse-performance",
            icon: ShieldCheck,
        },

        {
            name: "Target KPI Management",
            href: "/admin/target-kpi",
            icon: Target,
        },

        {
            name: "Settings",
            href: "/admin/settings",
            icon: Settings,
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | REPORTS DROPDOWN STATE
    |--------------------------------------------------------------------------
    */
    const isReportsRoute = url === "/admin/reports" || url.startsWith("/admin/reports/");
    const [reportsOpen, setReportsOpen] = useState(isReportsRoute);

    useEffect(() => {
        if (url === "/admin/reports" || url.startsWith("/admin/reports/")) {
            setReportsOpen(true);
        } else {
            setReportsOpen(false);
        }
    }, [url]);

    /*
    |--------------------------------------------------------------------------
    | ACTIVE MENU
    |--------------------------------------------------------------------------
    */
    const isActive = (href) => {
        return url === href;
    };

    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */
    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        router.post("/logout");
    };

    /*
    |--------------------------------------------------------------------------
    | TOGGLE
    |--------------------------------------------------------------------------
    */
    const toggleSidebar = () => {
        if (typeof onToggle === "function") {
            onToggle();
            return;
        }

        setInternalCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== "undefined") {
                localStorage.setItem("besmindo_admin_sidebar_collapsed", String(next));
            }
            return next;
        });
    };

    // Beri tahu layout/global page lebar sidebar saat berubah.
    useEffect(() => {
        document.documentElement.style.setProperty(
            "--admin-sidebar-width",
            collapsed ? "68px" : "215px"
        );
        window.dispatchEvent(new CustomEvent("admin-sidebar-resize", { detail: { collapsed } }));
    }, [collapsed]);

    return (
        <>
            {/* =========================================================
                SIDEBAR
            ========================================================= */}
            <aside
                style={{
                    position: "fixed",
                    left: 0,
                    top: 0,

                    width: collapsed
                        ? "68px"
                        : "215px",

                    height: "100vh",

                    backgroundColor: "#ffffff",

                    borderRight:
                        "1px solid #e2e8f0",

                    display: "flex",

                    flexDirection: "column",

                    zIndex: 1000,

                    boxSizing: "border-box",

                    overflow: "visible",

                    transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                {/* =====================================================
                    SIDEBAR INNER
                ===================================================== */}
                <div
                    style={{
                        width: "100%",

                        height: "100%",

                        backgroundColor:
                            "#ffffff",

                        display: "flex",

                        flexDirection:
                            "column",

                        boxSizing:
                            "border-box",

                        transition:
                            "width 0.25s ease",

                        overflow: "hidden",

                        borderRight:
                            "1px solid #e2e8f0",
                    }}
                >
                    {/* =================================================
                        LOGO
                    ================================================= */}
                    <div
                        style={{
                            height: "90px",

                            display: "flex",

                            alignItems:
                                "center",

                            justifyContent:
                                "center",

                            padding:
                                collapsed
                                    ? "10px 8px"
                                    : "10px 18px",

                            borderBottom:
                                "1px solid #e2e8f0",

                            boxSizing:
                                "border-box",

                            flexShrink: 0,
                        }}
                    >
                        <img
                            src="/images/logo-besmindo.png"
                            alt="BESMINDO"
                            style={{
                                width:
                                    collapsed
                                        ? "42px"
                                        : "100%",

                                maxWidth:
                                    collapsed
                                        ? "42px"
                                        : "175px",

                                height: "auto",

                                maxHeight:
                                    collapsed
                                        ? "42px"
                                        : "70px",

                                objectFit:
                                    "contain",

                                display: "block",

                                transition:
                                    "all 0.25s ease",
                            }}
                        />
                    </div>

                    {/* =================================================
                        ADMIN PROFILE
                    ================================================= */}
                    <div
                        style={{
                            padding:
                                collapsed
                                    ? "16px 8px"
                                    : "16px",

                            borderBottom:
                                "1px solid #e2e8f0",

                            boxSizing:
                                "border-box",

                            flexShrink: 0,
                        }}
                    >
                        <div
                            style={{
                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    collapsed
                                        ? "center"
                                        : "flex-start",

                                gap: "12px",
                            }}
                        >
                            {/* CHECK ICON */}
                            <div
                                style={{
                                    width: "38px",
                                    height: "38px",

                                    borderRadius:
                                        "50%",

                                    backgroundColor:
                                        "#004d32",

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "center",

                                    color:
                                        "#efff00",

                                    fontSize:
                                        "18px",

                                    fontWeight:
                                        "bold",

                                    flexShrink: 0,
                                }}
                            >
                                ✓
                            </div>

                            {/* PROFILE TEXT */}
                            {!collapsed && (
                                <div>
                                    <div
                                        style={{
                                            fontSize:
                                                "13.5px",

                                            fontWeight:
                                                "700",

                                            color:
                                                "#004d32",

                                            whiteSpace:
                                                "nowrap",
                                        }}
                                    >
                                        Rig HSE Admin
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                "11px",

                                            color:
                                                "#64748b",

                                            marginTop:
                                                "2px",

                                            whiteSpace:
                                                "nowrap",

                                            fontWeight:
                                                "500",
                                        }}
                                    >
                                        Administrator
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* =================================================
                        MENU
                    ================================================= */}
                    <nav
                        style={{
                            flex: 1,

                            overflowY: "auto",

                            overflowX: "hidden",

                            padding:
                                collapsed
                                    ? "18px 8px"
                                    : "18px 12px",

                            boxSizing:
                                "border-box",
                        }}
                    >
                        {menuItems.map((item) => {
                            const isExactActive = isActive(item.href);
                            const isChildActive = item.hasSubmenu && item.submenus?.some((sub) => isActive(sub.href));
                            const active = isExactActive;
                            const Icon = item.icon;

                            if (item.hasSubmenu) {
                                return (
                                    <div key={item.name} style={{ marginBottom: "4px" }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                width: "100%",
                                                boxSizing: "border-box",
                                                borderRadius: "10px",
                                                background: active
                                                    ? "#004d32"
                                                    : isChildActive
                                                    ? "#f1f5f9"
                                                    : "transparent",
                                                border: active
                                                    ? "1px solid #efff00"
                                                    : isChildActive
                                                    ? "1px solid #cbd5e1"
                                                    : "1px solid transparent",
                                                boxShadow: active
                                                    ? "0 0 14px rgba(239, 255, 0, 0.35), inset 0 0 8px rgba(239, 255, 0, 0.15)"
                                                    : "none",
                                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                            }}
                                        >
                                            <Link
                                                href={item.href}
                                                onClick={() => setReportsOpen(true)}
                                                title={collapsed ? item.name : ""}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: collapsed ? "center" : "flex-start",
                                                    flex: 1,
                                                    boxSizing: "border-box",
                                                    padding: collapsed ? "10px 8px" : "10px 10px 10px 14px",
                                                    textDecoration: "none",
                                                    color: active
                                                        ? "#efff00"
                                                        : isChildActive
                                                        ? "#004d32"
                                                        : "#334155",
                                                    fontSize: "12.5px",
                                                    fontWeight: active || isChildActive ? "800" : "600",
                                                    letterSpacing: "-0.01em",
                                                    minHeight: "40px",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        width: "24px",
                                                        minWidth: "24px",
                                                        height: "24px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        marginRight: collapsed ? "0" : "10px",
                                                        color: active
                                                            ? "#efff00"
                                                            : isChildActive
                                                            ? "#004d32"
                                                            : "#004d32",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <Icon size={17} strokeWidth={active ? 2.6 : 2} />
                                                </span>
                                                {!collapsed && (
                                                    <span
                                                        style={{
                                                            whiteSpace: "nowrap",
                                                            textShadow: active
                                                                ? "0 0 10px rgba(239, 255, 0, 0.5)"
                                                                : "none",
                                                        }}
                                                    >
                                                        {item.name}
                                                    </span>
                                                )}
                                            </Link>

                                            {!collapsed && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setReportsOpen((prev) => !prev);
                                                    }}
                                                    title={reportsOpen ? "Tutup submenu" : "Buka submenu"}
                                                    style={{
                                                        background: "transparent",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        padding: "8px 10px 8px 4px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        color: active ? "#efff00" : isChildActive ? "#004d32" : "#64748b",
                                                        borderRadius: "4px",
                                                    }}
                                                >
                                                    {reportsOpen ? (
                                                        <ChevronDown size={15} strokeWidth={2.5} />
                                                    ) : (
                                                        <ChevronRight size={15} strokeWidth={2.5} />
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {/* Nested Submenus: Plan Report & Actual Report */}
                                        {reportsOpen && !collapsed && (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "3px",
                                                    marginTop: "4px",
                                                    marginBottom: "4px",
                                                    paddingLeft: "14px",
                                                    marginLeft: "18px",
                                                    borderLeft: "2px solid #cbd5e1",
                                                }}
                                            >
                                                {item.submenus.map((sub) => {
                                                    const subActive = isActive(sub.href);
                                                    const SubIcon = sub.icon;
                                                    return (
                                                        <Link
                                                            key={sub.href}
                                                            href={sub.href}
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                width: "100%",
                                                                boxSizing: "border-box",
                                                                padding: "8px 12px",
                                                                borderRadius: "8px",
                                                                textDecoration: "none",
                                                                background: subActive
                                                                    ? "#004d32"
                                                                    : "transparent",
                                                                color: subActive
                                                                    ? "#efff00"
                                                                    : "#475569",
                                                                border: subActive
                                                                    ? "1px solid #efff00"
                                                                    : "1px solid transparent",
                                                                fontSize: "12px",
                                                                fontWeight: subActive ? "750" : "550",
                                                                minHeight: "34px",
                                                                boxShadow: subActive
                                                                    ? "0 0 10px rgba(239, 255, 0, 0.25)"
                                                                    : "none",
                                                                transition: "all 0.15s ease",
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    width: "18px",
                                                                    height: "18px",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    marginRight: "8px",
                                                                    color: subActive ? "#efff00" : "#64748b",
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                <SubIcon size={14} strokeWidth={subActive ? 2.5 : 2} />
                                                            </span>
                                                            <span style={{ whiteSpace: "nowrap" }}>
                                                                {sub.name}
                                                            </span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={
                                        item.href
                                    }
                                    href={
                                        item.href
                                    }
                                    title={
                                        collapsed
                                            ? item.name
                                            : ""
                                    }
                                    style={{
                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        justifyContent:
                                            collapsed
                                                ? "center"
                                                : "flex-start",

                                        width:
                                            "100%",

                                        boxSizing:
                                            "border-box",

                                        padding:
                                            collapsed
                                                ? "10px 8px"
                                                : "10px 14px",

                                        marginBottom:
                                            "4px",

                                        borderRadius:
                                            "10px",

                                        textDecoration:
                                            "none",

                                        background:
                                            active
                                                ? "#004d32"
                                                : "transparent",

                                        color:
                                            active
                                                ? "#efff00"
                                                : "#334155",

                                        border:
                                            active
                                                ? "1px solid #efff00"
                                                : "1px solid transparent",

                                        fontSize:
                                            "12.5px",

                                        fontWeight:
                                            active ? "800" : "600",

                                        letterSpacing:
                                            "-0.01em",

                                        minHeight:
                                            "40px",

                                        overflow:
                                            "hidden",

                                        boxShadow:
                                            active
                                                ? "0 0 14px rgba(239, 255, 0, 0.35), inset 0 0 8px rgba(239, 255, 0, 0.15)"
                                                : "none",

                                        transition:
                                            "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                    }}
                                >
                                    {/* MENU ICON */}
                                    <span
                                        style={{
                                            width:
                                                "24px",

                                            minWidth:
                                                "24px",

                                            height:
                                                "24px",

                                            display:
                                                "flex",

                                            alignItems:
                                                "center",

                                            justifyContent:
                                                "center",

                                            marginRight:
                                                collapsed
                                                    ? "0"
                                                    : "10px",

                                            color:
                                                active
                                                    ? "#efff00"
                                                    : "#004d32",

                                            flexShrink:
                                                0,
                                        }}
                                    >
                                        <Icon
                                            size={17}
                                            strokeWidth={
                                                active ? 2.6 : 2
                                            }
                                        />
                                    </span>

                                    {/* MENU NAME */}
                                    {!collapsed && (
                                        <span
                                            style={{
                                                whiteSpace:
                                                    "nowrap",
                                                textShadow:
                                                    active
                                                        ? "0 0 10px rgba(239, 255, 0, 0.5)"
                                                        : "none",
                                            }}
                                        >
                                            {
                                                item.name
                                            }
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* =================================================
                        BOTTOM MENU
                    ================================================= */}
                    <div
                        style={{
                            borderTop:
                                "1px solid #e2e8f0",

                            padding:
                                collapsed
                                    ? "12px 8px"
                                    : "12px",

                            boxSizing:
                                "border-box",

                            flexShrink: 0,
                        }}
                    >
                        {/* =================================================
                            SUPPORT
                        ================================================= */}
                        <button
                            type="button"
                            onClick={() => {
                                setGuideTab("features");
                                setShowGuideModal(true);
                            }}
                            title={
                                collapsed
                                    ? "Support"
                                    : ""
                            }
                            style={{
                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    collapsed
                                        ? "center"
                                        : "flex-start",

                                width:
                                    "100%",

                                padding:
                                    collapsed
                                        ? "12px 8px"
                                        : "12px",

                                border: "none",

                                background:
                                    "transparent",

                                color:
                                    "#475569",

                                fontSize:
                                    "10px",

                                fontWeight:
                                    "700",

                                textTransform:
                                    "uppercase",

                                letterSpacing:
                                    "0.08em",

                                cursor:
                                    "pointer",

                                textAlign:
                                    "left",

                                boxSizing:
                                    "border-box",
                            }}
                        >
                            <span
                                style={{
                                    width:
                                        "24px",

                                    minWidth:
                                        "24px",

                                    height:
                                        "24px",

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "center",

                                    marginRight:
                                        collapsed
                                            ? "0"
                                            : "8px",

                                    color:
                                        "#006b45",
                                }}
                            >
                                <CircleHelp
                                    size={17}
                                    strokeWidth={
                                        2.2
                                    }
                                />
                            </span>

                            {!collapsed && (
                                <span>
                                    Support
                                </span>
                            )}
                        </button>

                        {/* =================================================
                            LOGOUT
                        ================================================= */}
                        <button
                            type="button"
                            onClick={
                                handleLogout
                            }
                            title={
                                collapsed
                                    ? "Logout"
                                    : ""
                            }
                            style={{
                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    collapsed
                                        ? "center"
                                        : "flex-start",

                                width:
                                    "100%",

                                padding:
                                    collapsed
                                        ? "12px 8px"
                                        : "12px",

                                border: "none",

                                background:
                                    "transparent",

                                color:
                                    "#475569",

                                fontSize:
                                    "10px",

                                fontWeight:
                                    "700",

                                textTransform:
                                    "uppercase",

                                letterSpacing:
                                    "0.08em",

                                cursor:
                                    "pointer",

                                textAlign:
                                    "left",

                                boxSizing:
                                    "border-box",
                            }}
                        >
                            <span
                                style={{
                                    width:
                                        "24px",

                                    minWidth:
                                        "24px",

                                    height:
                                        "24px",

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "center",

                                    marginRight:
                                        collapsed
                                            ? "0"
                                            : "8px",

                                    color:
                                        "#006b45",
                                }}
                            >
                                <LogOut
                                    size={17}
                                    strokeWidth={
                                        2.2
                                    }
                                />
                            </span>

                            {!collapsed && (
                                <span>
                                    Logout
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* =====================================================
                    TOMBOL COLLAPSE
                ===================================================== */}
                <button
                    type="button"
                    onClick={
                        toggleSidebar
                    }
                    title={
                        collapsed
                            ? "Buka Sidebar"
                            : "Sembunyikan Sidebar"
                    }
                    aria-label={
                        collapsed
                            ? "Buka Sidebar"
                            : "Sembunyikan Sidebar"
                    }
                    style={{
                        position:
                            "absolute",

                        left:
                            collapsed
                                ? "56px"
                                : "203px",

                        top: "174px",

                        width: "24px",

                        height: "24px",

                        borderRadius:
                            "50%",

                        border:
                            "1px solid #d1d5db",

                        backgroundColor:
                            "#ffffff",

                        color:
                            "#004d32",

                        display:
                            "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        cursor:
                            "pointer",

                        zIndex: 2000,

                        boxShadow:
                            "0 1px 4px rgba(0,0,0,0.15)",

                        padding: 0,

                        lineHeight: 1,
                    }}
                >
                    {collapsed ? (
                        <ChevronRight
                            size={15}
                            strokeWidth={2.5}
                        />
                    ) : (
                        <ChevronLeft
                            size={15}
                            strokeWidth={2.5}
                        />
                    )}
                </button>
            </aside>

            {/* WIDGET PANDUAN FITUR & SISTEM HSE (SEPERTI WIDGET WA DI SUDUT KANAN BAWAH) */}
            <FeatureGuideModal
                isOpen={showGuideModal}
                onClose={() => setShowGuideModal(false)}
                onOpen={() => setShowGuideModal(true)}
                initialTab={guideTab}
            />
        </>
    );
}

export default AdminSidebar;