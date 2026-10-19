import React, { useState } from "react";
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
} from "lucide-react";

export default function Login({ status }) {
    const [selectedRole, setSelectedRole] = useState("admin"); // "admin" | "user"
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: "admin@besmindo.com",
        password: "password",
        role: "admin",
        remember: true,
    });

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        if (role === "admin") {
            setData({
                email: "admin@besmindo.com",
                password: "password",
                role: "admin",
                remember: true,
            });
        } else {
            setData({
                email: "user@besmindo.com",
                password: "password",
                role: "user",
                remember: true,
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/login", {
            onFinish: () => reset("password"),
        });
    };

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
            `}</style>

            {/* FULLSCREEN WRAPPER WITH VISIBLE OILFIELD BACKGROUND PHOTO */}
            <div
                style={{
                    minHeight: "100vh",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "28px 16px",
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

                {/* SOFT TRANSLUCENT OVERLAY - TIDAK MENGGELAPKAN FOTO SECARA BERLEBIHAN */}
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                            "linear-gradient(135deg, rgba(0, 24, 16, 0.38) 0%, rgba(0, 15, 10, 0.48) 100%)",
                        zIndex: 1,
                    }}
                />

                {/* MAIN CLEAN GLASS CARD */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        width: "100%",
                        maxWidth: "460px",
                        borderRadius: "24px",
                        backgroundColor: "rgba(255, 255, 255, 0.94)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        border: "1.5px solid rgba(255, 255, 255, 0.8)",
                        boxShadow:
                            "0 25px 60px -10px rgba(0, 0, 0, 0.45), 0 0 35px rgba(0, 77, 50, 0.25)",
                        padding: "36px 32px 30px",
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
                    <div style={{ textAlign: "center", marginBottom: "22px" }}>
                        {/* ANIMATED FLOATING LOGO (ALA GIF) */}
                        <div
                            style={{
                                position: "relative",
                                display: "inline-block",
                                maxWidth: "340px",
                                width: "100%",
                                marginBottom: "14px",
                            }}
                        >
                            {/* CUTE SPARKLE STARS */}
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
                                    padding: "14px 22px",
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
                                {/* SHIMMER LIGHT BEAM PASSING ACROSS */}
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
                                        maxHeight: "78px",
                                        width: "100%",
                                        maxWidth: "290px",
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
                                marginBottom: "8px",
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
                                margin: "0 0 4px",
                                fontSize: "20px",
                                fontWeight: "900",
                                color: "#0f172a",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Selamat Datang Kembali
                        </h2>
                        <p
                            style={{
                                margin: 0,
                                fontSize: "12.5px",
                                color: "#64748b",
                            }}
                        >
                            Pilih peran dan masukkan kredensial untuk masuk.
                        </p>
                    </div>

                    {/* ROLE SELECTOR (CLEAN SEGMENTED PILL) */}
                    <div style={{ marginBottom: "18px" }}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "6px",
                                backgroundColor: "#f1f5f9",
                                padding: "4px",
                                borderRadius: "14px",
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            {/* TAB 1: HSE ADMIN */}
                            <button
                                type="button"
                                onClick={() => handleRoleSelect("admin")}
                                style={{
                                    padding: "9px 12px",
                                    borderRadius: "10px",
                                    border: "none",
                                    backgroundColor:
                                        selectedRole === "admin"
                                            ? "#004d32"
                                            : "transparent",
                                    color:
                                        selectedRole === "admin"
                                            ? "#efff00"
                                            : "#475569",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                    fontWeight: "800",
                                    fontSize: "12.5px",
                                    boxShadow:
                                        selectedRole === "admin"
                                            ? "0 2px 8px rgba(0, 77, 50, 0.25)"
                                            : "none",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <ShieldCheck size={15} strokeWidth={2.4} />
                                <span>HSE Admin</span>
                            </button>

                            {/* TAB 2: FIELD USER */}
                            <button
                                type="button"
                                onClick={() => handleRoleSelect("user")}
                                style={{
                                    padding: "9px 12px",
                                    borderRadius: "10px",
                                    border: "none",
                                    backgroundColor:
                                        selectedRole === "user"
                                            ? "#004d32"
                                            : "transparent",
                                    color:
                                        selectedRole === "user"
                                            ? "#efff00"
                                            : "#475569",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                    fontWeight: "800",
                                    fontSize: "12.5px",
                                    boxShadow:
                                        selectedRole === "user"
                                            ? "0 2px 8px rgba(0, 77, 50, 0.25)"
                                            : "none",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <ClipboardList size={15} strokeWidth={2.4} />
                                <span>Field User</span>
                            </button>
                        </div>
                    </div>

                    {/* STATUS ALERT */}
                    {status && (
                        <div
                            style={{
                                backgroundColor: "#ecfdf5",
                                border: "1px solid #34d399",
                                borderRadius: "10px",
                                padding: "9px 12px",
                                marginBottom: "14px",
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
                                padding: "9px 12px",
                                marginBottom: "14px",
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
                        <div style={{ marginBottom: "14px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    color: "#334155",
                                    marginBottom: "5px",
                                }}
                            >
                                Alamat Email / Username
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
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
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
                                        fontWeight: "500",
                                    }}
                                />
                            </div>
                        </div>

                        {/* PASSWORD INPUT */}
                        <div style={{ marginBottom: "16px" }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "5px",
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
                                        fontWeight: "500",
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
                                marginBottom: "20px",
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
                                    color: "#004d32",
                                    backgroundColor: "rgba(0, 77, 50, 0.08)",
                                    padding: "2px 7px",
                                    borderRadius: "5px",
                                    fontWeight: "800",
                                }}
                            >
                                {selectedRole === "admin"
                                    ? "👑 Admin Dashboard"
                                    : "👷 Input Lapangan"}
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
                            {/* HOVER SHEEN EFFECT */}
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
                                    : selectedRole === "admin"
                                    ? "Masuk ke Dashboard Admin"
                                    : "Masuk ke Form Input User"}
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
                            marginTop: "20px",
                            paddingTop: "16px",
                            borderTop: "1px solid #f1f5f9",
                            textAlign: "center",
                        }}
                    >
                        <p
                            style={{
                                margin: "0 0 10px",
                                fontSize: "12.5px",
                                color: "#64748b",
                            }}
                        >
                            Belum memiliki akun?{" "}
                            <Link
                                href="/register"
                                style={{
                                    color: "#004d32",
                                    fontWeight: "800",
                                    textDecoration: "none",
                                    marginLeft: "3px",
                                }}
                            >
                                Daftar Akun Baru
                            </Link>
                        </p>

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
