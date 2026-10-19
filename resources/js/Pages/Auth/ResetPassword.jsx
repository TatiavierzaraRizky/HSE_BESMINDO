import React, { useState } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import {
    ShieldCheck,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    ArrowRight,
    KeyRound,
    Mail,
} from "lucide-react";

export default function ResetPassword({ token, email: initialEmail = "" }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: initialEmail,
        password: "",
        password_confirmation: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/reset-password", {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Atur Ulang Kata Sandi - PT Besmindo Materi Sewatama" />

            <style>{`
                @keyframes logoGifFloat {
                    0%, 100% {
                        transform: translateY(0) rotate(0deg) scale(1);
                    }
                    25% {
                        transform: translateY(-8px) rotate(-1.5deg) scale(1.02);
                    }
                    50% {
                        transform: translateY(-2px) rotate(1.5deg) scale(1.01);
                    }
                    75% {
                        transform: translateY(-9px) rotate(-0.8deg) scale(1.025);
                    }
                }

                @keyframes logoGlowPulse {
                    0%, 100% {
                        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4), 0 0 20px rgba(239, 255, 0, 0.35);
                        border-color: #efff00;
                    }
                    50% {
                        box-shadow: 0 16px 45px rgba(0, 0, 0, 0.5), 0 0 35px rgba(239, 255, 0, 0.6), 0 0 15px #10b981;
                        border-color: #ffffff;
                    }
                }

                @keyframes logoShimmerSwipe {
                    0% {
                        transform: translateX(-120%) skewX(-20deg);
                    }
                    35%, 100% {
                        transform: translateX(220%) skewX(-20deg);
                    }
                }

                @keyframes logoStarTwinkle {
                    0%, 100% {
                        transform: scale(0.6) rotate(0deg);
                        opacity: 0.3;
                    }
                    50% {
                        transform: scale(1.25) rotate(45deg);
                        opacity: 1;
                    }
                }
            `}</style>

            <div
                style={{
                    minHeight: "100vh",
                    backgroundColor: "#001f15",
                    backgroundImage: `
                        linear-gradient(135deg, rgba(0, 25, 16, 0.4) 0%, rgba(0, 15, 10, 0.5) 100%),
                        url('/images/auth-bg.jpg')
                    `,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundAttachment: "fixed",
                    fontFamily:
                        "'Instrument Sans', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px 16px",
                    boxSizing: "border-box",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* AMBIENT BACKGROUND GLOW */}
                <div
                    style={{
                        position: "absolute",
                        top: "-150px",
                        right: "-150px",
                        width: "450px",
                        height: "450px",
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(239, 255, 0, 0.12) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />

                <div
                    style={{
                        width: "100%",
                        maxWidth: "480px",
                        zIndex: 10,
                        position: "relative",
                    }}
                >
                    {/* BRANDING HEADER */}
                    <div style={{ textAlign: "center", marginBottom: "24px" }}>
                        <div
                            style={{
                                position: "relative",
                                display: "inline-block",
                                width: "100%",
                                maxWidth: "400px",
                                marginBottom: "16px",
                            }}
                        >
                            {/* CUTE FLOATING SPARKLE STARS */}
                            <span
                                style={{
                                    position: "absolute",
                                    top: "-10px",
                                    right: "-8px",
                                    fontSize: "20px",
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
                                    fontSize: "18px",
                                    zIndex: 15,
                                    pointerEvents: "none",
                                    animation: "logoStarTwinkle 1.8s infinite ease-in-out 0.9s",
                                }}
                            >
                                🌟
                            </span>

                            {/* ANIMATED LOGO CARD (ALA GIF) */}
                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "100%",
                                    padding: "16px 24px",
                                    borderRadius: "20px",
                                    backgroundColor: "#ffffff",
                                    border: "2.5px solid #efff00",
                                    boxSizing: "border-box",
                                    position: "relative",
                                    overflow: "hidden",
                                    animation:
                                        "logoGifFloat 3.2s infinite ease-in-out, logoGlowPulse 2.4s infinite ease-in-out",
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
                                            "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)",
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
                                        maxHeight: "85px",
                                        width: "100%",
                                        maxWidth: "330px",
                                        objectFit: "contain",
                                        display: "block",
                                        position: "relative",
                                        zIndex: 2,
                                    }}
                                />
                            </div>
                        </div>

                        <h1
                            style={{
                                margin: "0 0 4px",
                                fontSize: "22px",
                                fontWeight: "900",
                                color: "#ffffff",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Buat Kata Sandi Baru
                        </h1>
                        <p style={{ margin: 0, color: "#d1fae5", fontSize: "13px" }}>
                            PT Besmindo Materi Sewatama - HSE Portal
                        </p>
                    </div>

                    {/* CARD */}
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "20px",
                            padding: "32px 28px",
                            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
                            border: "1px solid rgba(239, 255, 0, 0.4)",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        {/* TOP ACCENT LINE */}
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

                        {/* ERROR ALERT */}
                        {(errors.email || errors.password || errors.token) && (
                            <div
                                style={{
                                    backgroundColor: "#fee2e2",
                                    border: "1px solid #f87171",
                                    borderRadius: "10px",
                                    padding: "10px 14px",
                                    marginBottom: "18px",
                                    color: "#991b1b",
                                    fontSize: "12.5px",
                                    fontWeight: "700",
                                }}
                            >
                                {errors.email || errors.password || errors.token}
                            </div>
                        )}

                        {/* FORM */}
                        <form onSubmit={handleSubmit}>
                            {/* EMAIL FIELD */}
                            <div style={{ marginBottom: "16px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "12.5px",
                                        fontWeight: "700",
                                        color: "#334155",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Alamat Email Akun
                                </label>
                                <div
                                    style={{
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: "12px",
                                            color: "#64748b",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        placeholder="nama@besmindo.com"
                                        style={{
                                            width: "100%",
                                            height: "42px",
                                            padding: "0 14px 0 38px",
                                            borderRadius: "10px",
                                            border: "1px solid #cbd5e1",
                                            outline: "none",
                                            fontSize: "13.5px",
                                            color: "#1e293b",
                                            backgroundColor: "#f8fafc",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* NEW PASSWORD */}
                            <div style={{ marginBottom: "16px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "12.5px",
                                        fontWeight: "700",
                                        color: "#334155",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Kata Sandi Baru
                                </label>
                                <div
                                    style={{
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: "12px",
                                            color: "#64748b",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        required
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        placeholder="Minimal 6 karakter..."
                                        style={{
                                            width: "100%",
                                            height: "42px",
                                            padding: "0 40px 0 38px",
                                            borderRadius: "10px",
                                            border: "1px solid #cbd5e1",
                                            outline: "none",
                                            fontSize: "13.5px",
                                            color: "#1e293b",
                                            backgroundColor: "#f8fafc",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        style={{
                                            position: "absolute",
                                            right: "12px",
                                            background: "none",
                                            border: "none",
                                            color: "#64748b",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* CONFIRM NEW PASSWORD */}
                            <div style={{ marginBottom: "24px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "12.5px",
                                        fontWeight: "700",
                                        color: "#334155",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Ulangi Kata Sandi Baru
                                </label>
                                <div
                                    style={{
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: "12px",
                                            color: "#64748b",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type={
                                            showConfirm ? "text" : "password"
                                        }
                                        required
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                "password_confirmation",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Ketik ulang kata sandi baru..."
                                        style={{
                                            width: "100%",
                                            height: "42px",
                                            padding: "0 40px 0 38px",
                                            borderRadius: "10px",
                                            border: "1px solid #cbd5e1",
                                            outline: "none",
                                            fontSize: "13.5px",
                                            color: "#1e293b",
                                            backgroundColor: "#f8fafc",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirm(!showConfirm)
                                        }
                                        style={{
                                            position: "absolute",
                                            right: "12px",
                                            background: "none",
                                            border: "none",
                                            color: "#64748b",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        {showConfirm ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <button
                                type="submit"
                                disabled={processing}
                                style={{
                                    width: "100%",
                                    height: "44px",
                                    borderRadius: "10px",
                                    backgroundColor: "#004d32",
                                    color: "#efff00",
                                    border: "1px solid #efff00",
                                    fontWeight: "900",
                                    fontSize: "14px",
                                    cursor: processing
                                        ? "not-allowed"
                                        : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    boxShadow:
                                        "0 0 14px rgba(239, 255, 0, 0.3)",
                                    opacity: processing ? 0.7 : 1,
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <span>
                                    {processing
                                        ? "Memperbarui Kata Sandi..."
                                        : "Simpan Kata Sandi Baru"}
                                </span>
                                <ArrowRight size={16} strokeWidth={2.8} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
