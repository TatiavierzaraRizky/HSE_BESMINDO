import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

export default function CuteLoading() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("Memuat...");

    useEffect(() => {
        let startTime = 0;
        let finishTimeout = null;

        // Listen to Inertia router events across ALL pages
        const cleanupStart = router.on("start", () => {
            startTime = Date.now();
            if (finishTimeout) clearTimeout(finishTimeout);
            setMessage("Memuat...");
            setIsLoading(true);
        });

        const cleanupFinish = router.on("finish", () => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 350 - elapsed);
            finishTimeout = setTimeout(() => {
                setIsLoading(false);
            }, remaining);
        });

        // Custom window events for manual triggers
        const handleCustomStart = (e) => {
            if (e?.detail?.message) {
                setMessage(e.detail.message);
            } else {
                setMessage("Memuat...");
            }
            setIsLoading(true);
        };

        const handleCustomEnd = () => {
            setIsLoading(false);
        };

        window.addEventListener("show-cute-loading", handleCustomStart);
        window.addEventListener("hide-cute-loading", handleCustomEnd);

        return () => {
            if (typeof cleanupStart === "function") cleanupStart();
            if (typeof cleanupFinish === "function") cleanupFinish();
            window.removeEventListener("show-cute-loading", handleCustomStart);
            window.removeEventListener("hide-cute-loading", handleCustomEnd);
            if (finishTimeout) clearTimeout(finishTimeout);
        };
    }, []);

    if (!isLoading) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 999999,
                backgroundColor: "rgba(0, 24, 16, 0.4)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "cuteBackdropFade 0.2s ease-out",
            }}
        >
            <style>{`
                @keyframes cuteBackdropFade {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes cuteCardPop {
                    0% {
                        opacity: 0;
                        transform: scale(0.88) translateY(10px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                @keyframes cuteOrbitSpin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }

                @keyframes cuteFloat {
                    0%, 100% {
                        transform: translateY(0px) scale(1);
                    }
                    50% {
                        transform: translateY(-5px) scale(1.03);
                    }
                }

                @keyframes cuteEyeBlink {
                    0%, 90%, 100% {
                        transform: scaleY(1);
                    }
                    95% {
                        transform: scaleY(0.1);
                    }
                }

                @keyframes cuteDotHop {
                    0%, 80%, 100% {
                        transform: translateY(0);
                        opacity: 0.5;
                    }
                    40% {
                        transform: translateY(-5px);
                        opacity: 1;
                    }
                }

                @keyframes cuteShimmerBar {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(200%);
                    }
                }

                @keyframes cuteStarTwinkle {
                    0%, 100% {
                        transform: scale(0.7) rotate(0deg);
                        opacity: 0.4;
                    }
                    50% {
                        transform: scale(1.2) rotate(45deg);
                        opacity: 1;
                    }
                }
            `}</style>

            {/* ELEGANT COMPACT GLASS CARD */}
            <div
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.96)",
                    borderRadius: "26px",
                    padding: "30px 38px 24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    border: "2px solid rgba(239, 255, 0, 0.55)",
                    outline: "2.5px solid rgba(0, 77, 50, 0.15)",
                    boxShadow:
                        "0 25px 55px -10px rgba(0, 30, 20, 0.38), 0 0 30px rgba(239, 255, 0, 0.3)",
                    animation: "cuteCardPop 0.25s cubic-bezier(0.34, 1.4, 0.64, 1)",
                    minWidth: "240px",
                    boxSizing: "border-box",
                }}
            >
                {/* CUTE SPARKLE ACCENT */}
                <span
                    style={{
                        position: "absolute",
                        top: "14px",
                        right: "16px",
                        fontSize: "18px",
                        animation: "cuteStarTwinkle 1.6s infinite ease-in-out",
                        pointerEvents: "none",
                    }}
                >
                    ✨
                </span>
                <span
                    style={{
                        position: "absolute",
                        bottom: "16px",
                        left: "16px",
                        fontSize: "15px",
                        animation: "cuteStarTwinkle 1.6s infinite ease-in-out 0.8s",
                        pointerEvents: "none",
                    }}
                >
                    🌟
                </span>

                {/* ELEGANT ORBITAL SPINNER WITH LARGER COMEL MASCOT IN CENTER */}
                <div
                    style={{
                        position: "relative",
                        width: "120px",
                        height: "120px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "16px",
                    }}
                >
                    {/* ROTATING ORBITAL GLOW RING */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "50%",
                            border: "3.5px solid transparent",
                            borderTopColor: "#004d32",
                            borderRightColor: "#efff00",
                            borderBottomColor: "#10b981",
                            animation: "cuteOrbitSpin 1.2s linear infinite",
                            boxShadow: "0 0 16px rgba(239, 255, 0, 0.35)",
                        }}
                    />

                    {/* INNER SOFT PULSE RING */}
                    <div
                        style={{
                            position: "absolute",
                            inset: "7px",
                            borderRadius: "50%",
                            border: "1px dashed rgba(0, 77, 50, 0.22)",
                        }}
                    />

                    {/* COMEL FLOATING SAFETY MASCOT (ENLARGED) */}
                    <div
                        style={{
                            animation: "cuteFloat 1.8s infinite ease-in-out",
                            transformOrigin: "center center",
                            zIndex: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <svg
                            width="90"
                            height="90"
                            viewBox="0 0 100 100"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* SAFETY HARDHAT DOME */}
                            <path
                                d="M 22 56 C 22 28, 78 28, 78 56 Z"
                                fill="#efff00"
                                stroke="#004d32"
                                strokeWidth="3.5"
                                strokeLinejoin="round"
                            />

                            {/* HELMET TOP RIDGE */}
                            <path
                                d="M 46 23 C 46 19, 54 19, 54 23 L 54 42 L 46 42 Z"
                                fill="#004d32"
                            />

                            {/* HELMET HIGHLIGHT SHINE */}
                            <path
                                d="M 30 38 Q 48 31 66 35"
                                stroke="#ffffff"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                opacity="0.8"
                            />

                            {/* HELMET BRIM */}
                            <path
                                d="M 12 56 Q 50 67 88 56 Q 50 50 12 56 Z"
                                fill="#efff00"
                                stroke="#004d32"
                                strokeWidth="3.2"
                                strokeLinejoin="round"
                            />

                            {/* K3 SAFETY CROSS BADGE */}
                            <circle cx="50" cy="38" r="6.5" fill="#ffffff" stroke="#004d32" strokeWidth="1.8" />
                            <path
                                d="M 50 34 L 50 42 M 46 38 L 54 38"
                                stroke="#004d32"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                            />

                            {/* CUTE BLINKING EYES */}
                            <g style={{ transformOrigin: "50px 48px", animation: "cuteEyeBlink 3s infinite" }}>
                                <circle cx="38" cy="48" r="4" fill="#004d32" />
                                <circle cx="36.5" cy="46.5" r="1.6" fill="#ffffff" />
                                <circle cx="39.2" cy="48.8" r="0.7" fill="#ffffff" />

                                <circle cx="62" cy="48" r="4" fill="#004d32" />
                                <circle cx="60.5" cy="46.5" r="1.6" fill="#ffffff" />
                                <circle cx="63.2" cy="48.8" r="0.7" fill="#ffffff" />
                            </g>

                            {/* BLUSH CHEEKS */}
                            <ellipse cx="29" cy="51" rx="4.5" ry="2.6" fill="#ff708f" opacity="0.9" />
                            <ellipse cx="71" cy="51" rx="4.5" ry="2.6" fill="#ff708f" opacity="0.9" />

                            {/* CUTE HAPPY SMILE */}
                            <path
                                d="M 46 49.5 Q 50 54.5 54 49.5"
                                stroke="#004d32"
                                strokeWidth="2.8"
                                strokeLinecap="round"
                                fill="none"
                            />

                            {/* CUTE LITTLE HANDS */}
                            <circle
                                cx="16"
                                cy="59"
                                r="4"
                                fill="#efff00"
                                stroke="#004d32"
                                strokeWidth="2.4"
                            />
                            <circle
                                cx="84"
                                cy="59"
                                r="4"
                                fill="#efff00"
                                stroke="#004d32"
                                strokeWidth="2.4"
                            />
                        </svg>
                    </div>
                </div>

                {/* SIMPLE CONCISE TEXT */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                    }}
                >
                    <span
                        style={{
                            color: "#004d32",
                            fontSize: "15px",
                            fontWeight: "800",
                            letterSpacing: "0.02em",
                        }}
                    >
                        {message}
                    </span>

                    {/* 3 CLEAN HOPPING DOTS */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "3.5px",
                            marginTop: "2px",
                        }}
                    >
                        <div
                            style={{
                                width: "4.5px",
                                height: "4.5px",
                                borderRadius: "50%",
                                backgroundColor: "#004d32",
                                animation: "cuteDotHop 1s infinite ease-in-out",
                            }}
                        />
                        <div
                            style={{
                                width: "4.5px",
                                height: "4.5px",
                                borderRadius: "50%",
                                backgroundColor: "#10b981",
                                animation: "cuteDotHop 1s infinite ease-in-out 0.2s",
                            }}
                        />
                        <div
                            style={{
                                width: "4.5px",
                                height: "4.5px",
                                borderRadius: "50%",
                                backgroundColor: "#004d32",
                                animation: "cuteDotHop 1s infinite ease-in-out 0.4s",
                            }}
                        />
                    </div>
                </div>

                {/* THIN SHIMMER PROGRESS BAR UNDERNEATH */}
                <div
                    style={{
                        width: "100px",
                        height: "3.5px",
                        backgroundColor: "rgba(0, 77, 50, 0.12)",
                        borderRadius: "999px",
                        marginTop: "12px",
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            width: "50%",
                            background:
                                "linear-gradient(90deg, transparent, #004d32, #efff00, transparent)",
                            animation: "cuteShimmerBar 1.2s infinite ease-in-out",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
