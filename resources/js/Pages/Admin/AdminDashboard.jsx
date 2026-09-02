import { useMemo, useState } from "react";
import AdminSidebar from "../../Components/AdminSidebar";

import {
    Search,
    Bell,
    CircleHelp,
    UserCircle,
    CalendarDays,
    ChevronDown,
    MoreVertical,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

const responsiveStyle = `
    html, body, #app {
        max-width: 100%;
        width: 100%;
        margin: 0;
        overflow-x: hidden;
    }

    .admin-main-content {
        margin-left: 100px !important;
        width: calc(100% - 100px) !important;
        max-width: calc(100% - 100px) !important;
        min-width: 0 !important;
        box-sizing: border-box;
        overflow-x: hidden;
        transition: margin-left 0.25s ease, width 0.25s ease;
    }

    .admin-topbar {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box;
        overflow: hidden;
    }

    .admin-topbar > div:first-child {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .admin-topbar > div:last-child {
        min-width: 0;
        flex-shrink: 1;
    }

    .admin-main {
        margin-left: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box;
        overflow-x: hidden;
    }

    .dashboard-kpi-grid > *,
    .dashboard-chart-grid > * {
        min-width: 0;
        max-width: 100%;
    }

    @media (max-width: 900px) {
        .admin-main-content {
            margin-left: 68px !important;
            width: calc(100% - 68px) !important;
            max-width: calc(100% - 68px) !important;
        }

        .admin-topbar {
            padding-left: 18px !important;
            padding-right: 18px !important;
        }

        .dashboard-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }

        .dashboard-chart-grid {
            grid-template-columns: minmax(0, 1fr) !important;
        }

        .admin-main {
            padding-left: 18px !important;
            padding-right: 18px !important;
        }
    }

    @media (max-width: 600px) {
        .admin-topbar {
            height: 60px !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
            gap: 8px;
        }

        .admin-topbar > div:first-child {
            font-size: 20px !important;
        }

        .admin-topbar > div:last-child {
            gap: 8px !important;
        }

        .admin-topbar input {
            min-width: 0 !important;
        }

        .dashboard-kpi-grid {
            grid-template-columns: minmax(0, 1fr) !important;
        }

        .admin-main {
            padding: 16px 12px 35px !important;
        }

        .dashboard-title-filter {
            flex-direction: column !important;
            align-items: stretch !important;
        }
    }
`;

export default function Dashboard() {
    /* =========================
       STATE
    ========================= */

    const [year, setYear] = useState("2024");
    const [month, setMonth] = useState("All Months");
    const [rig, setRig] = useState("All Rigs");
    const [contract, setContract] = useState("All Contracts");

    const [search, setSearch] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);
    const [showAll, setShowAll] = useState(false);

    /* =========================
       DATA
    ========================= */

    const kpiData = [
        {
            indicator: "Total Recordable Incident Rate (TRIR)",
            target: "< 0.50",
            actual: "0.12",
            achievement: 100,
            status: "ACHIEVED",
        },
        {
            indicator: "Lost Time Injury Frequency (LTIF)",
            target: "0.80",
            actual: "0.00",
            achievement: 100,
            status: "ACHIEVED",
        },
        {
            indicator: "Safety Observations (STOP Cards)",
            target: "150 / mo",
            actual: "110",
            achievement: 73,
            status: "NOT ACHIEVED",
        },
        {
            indicator: "Management Facility Audits",
            target: "4 / yr",
            actual: "2",
            achievement: 50,
            status: "PENDING",
        },
        {
            indicator: "Environmental Spills (Volume > 1 bbl)",
            target: "0",
            actual: "0",
            achievement: 100,
            status: "ACHIEVED",
        },
        {
            indicator: "Hazard Observations",
            target: "100 / mo",
            actual: "92",
            achievement: 92,
            status: "ACHIEVED",
        },
        {
            indicator: "Safety Meetings Held",
            target: "20 / mo",
            actual: "18",
            achievement: 90,
            status: "ACHIEVED",
        },
    ];

    const monthlyData = {
        "All Months": [62, 66, 76, 72, 88, 84, 103, 94, 112, 108, 118],
        January: [62],
        February: [66],
        March: [76],
        April: [72],
        May: [88],
        June: [84],
        July: [103],
        August: [94],
        September: [112],
        October: [108],
        November: [118],
        December: [121],
    };

    const chartValues = monthlyData[month] || monthlyData["All Months"];

    /* =========================
       FILTER DATA
    ========================= */

    const filteredKpi = useMemo(() => {
        let data = [...kpiData];

        if (search.trim() !== "") {
            data = data.filter((item) =>
                item.indicator.toLowerCase().includes(search.toLowerCase()),
            );
        }

        return data;
    }, [search]);

    const displayedKpi = showAll ? filteredKpi : filteredKpi.slice(0, 5);

    /* =========================
       EXPORT CSV
    ========================= */

    const exportReport = () => {
        const headers = [
            "Indicator",
            "Target",
            "Actual",
            "Achievement",
            "Status",
        ];

        const rows = filteredKpi.map((item) => [
            item.indicator,
            item.target,
            item.actual,
            `${item.achievement}%`,
            item.status,
        ]);

        const csv = [
            headers.join(","),
            ...rows.map((row) => row.map((value) => `"${value}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "Besmindo-HSE-Report.csv";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    return (
        <>
            <style>{responsiveStyle}</style>

            <div
                style={{
                    minHeight: "100vh",
                backgroundColor: "#F5F8F5",
                fontFamily: "Arial, Helvetica, sans-serif",
                color: "#123C30",
            }}
        >
            {/* =================================
                SIDEBAR
            ================================= */}

            <AdminSidebar />

            {/* =================================
                MAIN AREA
            ================================= */}

            <div
                className="admin-main-content"
                style={{
                    marginLeft: "100px",
                    minHeight: "100vh",
                    width: "calc(100% - 100px)",
                    maxWidth: "calc(100% - 100px)",
                    minWidth: 0,
                    boxSizing: "border-box",
                    overflowX: "hidden",
                    transition: "margin-left 0.25s ease, width 0.25s ease",
                }}
            >
                {/* =================================
                    TOP BAR
                ================================= */}

                <header
                    className="admin-topbar"
                    style={{
                        height: "68px",
                        width: "100%",
                        backgroundColor: "#ffffff",
                        borderBottom: "1px solid #dfe7e3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 24px",
                        boxSizing: "border-box",
                    }}
                >
                    {/* BRAND */}

                    <div
                        style={{
                            fontSize: "25px",
                            fontWeight: "700",
                            color: "#064E3B",
                        }}
                    >
                        RigOps HSE Manager
                    </div>

                    {/* RIGHT TOPBAR */}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "18px",
                        }}
                    >
                        {/* SEARCH */}

                        <div
                            style={{
                                width: "215px",
                                height: "34px",
                                border: "1px solid #d2dbd7",
                                borderRadius: "7px",
                                display: "flex",
                                alignItems: "center",
                                padding: "0 10px",
                                backgroundColor: "#FAFCFA",
                            }}
                        >
                            <Search size={16} color="#36564A" />

                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search records..."
                                style={{
                                    width: "100%",
                                    border: "none",
                                    outline: "none",
                                    background: "transparent",
                                    paddingLeft: "8px",
                                    fontSize: "14px",
                                }}
                            />
                        </div>

                        {/* NOTIFICATION */}

                        <div
                            style={{
                                position: "relative",
                            }}
                        >
                            <button
                                onClick={() =>
                                    setShowNotifications(!showNotifications)
                                }
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    padding: "4px",
                                }}
                            >
                                <Bell size={20} color="#064E3B" />
                            </button>

                            {showNotifications && (
                                <div
                                    style={{
                                        position: "absolute",
                                        right: 0,
                                        top: "38px",
                                        width: "270px",
                                        background: "white",
                                        border: "1px solid #d8e1dd",
                                        borderRadius: "8px",
                                        boxShadow:
                                            "0 8px 25px rgba(0,0,0,0.12)",
                                        padding: "14px",
                                        zIndex: 50,
                                    }}
                                >
                                    <strong
                                        style={{
                                            display: "block",
                                            marginBottom: "10px",
                                            fontSize: "15px",
                                        }}
                                    >
                                        Notifications
                                    </strong>

                                    <div
                                        style={{
                                            fontSize: "14px",
                                            padding: "10px",
                                            backgroundColor: "#F4FFD0",
                                            borderRadius: "5px",
                                            marginBottom: "7px",
                                        }}
                                    >
                                        ⚠ Safety observation below target.
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "14px",
                                            padding: "10px",
                                            backgroundColor: "#F4FFD0",
                                            borderRadius: "5px",
                                        }}
                                    >
                                        ✓ Monthly HSE report ready.
                                    </div>
                                </div>
                            )}
                        </div>

                        <CircleHelp size={20} color="#064E3B" />

                        <UserCircle size={21} color="#064E3B" />
                    </div>
                </header>

                {/* =================================
                    PAGE CONTENT
                ================================= */}

                <main
                    className="admin-main"
                    style={{
                        marginLeft: 0,
                        width: "100%",
                        maxWidth: "100%",
                        minWidth: 0,
                        minHeight: "100vh",
                        boxSizing: "border-box",
                    }}
                >
                    {/* BREADCRUMB */}

                    <div
                        style={{
                            fontSize: "15px",
                            color: "#61786D",
                            marginBottom: "20px",
                        }}
                    >
                        ▣ &nbsp; Admin Dashboard
                    </div>

                    {/* =================================
                        TITLE + FILTER
                    ================================= */}

                    <div
                        className="dashboard-title-filter"
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            gap: "20px",
                            marginBottom: "20px",
                            width: "100%",
                            maxWidth: "100%",
                            boxSizing: "border-box",
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: "30px",
                                    color: "#111827",
                                }}
                            >
                                Executive Overview
                            </h1>

                            <p
                                style={{
                                    margin: "6px 0 0",
                                    color: "#526B60",
                                    fontSize: "15px",
                                }}
                            >
                                Real-time safety and operational performance
                                metrics.
                            </p>
                        </div>

                        {/* FILTERS */}

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                background: "white",
                                border: "1px solid #d4ded9",
                                borderRadius: "5px",
                                overflow: "hidden",
                            }}
                        >
                            <FilterSelect
                                icon={<CalendarDays size={15} />}
                                value={year}
                                onChange={setYear}
                                options={["2024", "2025", "2026"]}
                            />

                            <FilterSelect
                                value={month}
                                onChange={setMonth}
                                options={[
                                    "All Months",
                                    "January",
                                    "February",
                                    "March",
                                    "April",
                                    "May",
                                    "June",
                                    "July",
                                    "August",
                                    "September",
                                    "October",
                                    "November",
                                    "December",
                                ]}
                            />

                            <FilterSelect
                                value={rig}
                                onChange={setRig}
                                options={[
                                    "All Rigs",
                                    "Rig-01",
                                    "Rig-02",
                                    "Rig-03",
                                    "Rig-04",
                                ]}
                            />

                            <FilterSelect
                                value={contract}
                                onChange={setContract}
                                options={[
                                    "All Contracts",
                                    "Contract 01",
                                    "Contract 02",
                                    "Contract 03",
                                    "Contract 04",
                                ]}
                            />
                        </div>
                    </div>

                    {/* =================================
                        KPI CARDS
                    ================================= */}

                    <div
                        className="dashboard-kpi-grid"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                            gap: "12px",
                            marginBottom: "20px",
                            width: "100%",
                            maxWidth: "100%",
                            boxSizing: "border-box",
                        }}
                    >
                        <MetricCard
                            title="TOTAL ACTIVE RIG"
                            value="12"
                            change="↑ 2"
                        />

                        <MetricCard
                            title="TOTAL NO. KONTRAK"
                            value="45"
                            change="— 0"
                        />

                        <MetricCard
                            title="TOTAL MAN HOURS"
                            value="1.2M"
                            change="↑ 5%"
                        />

                        <MetricCard
                            title="TOTAL KM DRIVEN"
                            value="845K"
                            change="↑ 2%"
                        />

                        <MetricCard
                            title="HSE PERFORMANCE"
                            value="98.5%"
                            badge="EXCELLENT"
                        />

                        <MetricCard
                            title="KPI PERFORMANCE"
                            value="92.0%"
                            badge="ON TRACK"
                        />
                    </div>

                    {/* =================================
                        CHARTS
                    ================================= */}

                    <div
                        className="dashboard-chart-grid"
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "minmax(0, 1fr) minmax(0, 1fr)",
                            gap: "14px",
                            marginBottom: "20px",
                            width: "100%",
                            maxWidth: "100%",
                            boxSizing: "border-box",
                        }}
                    >
                        {/* MONTHLY CHART */}

                        <ChartCard title="HSE Performance Monthly" menu>
                            <LineChart values={chartValues} />
                        </ChartCard>

                        {/* TARGET VS ACTUAL */}

                        <ChartCard title="KPI Target vs Actual">
                            <BarChart />
                        </ChartCard>
                    </div>

                    {/* =================================
                        KPI TABLE
                    ================================= */}

                    <div
                        style={{
                            backgroundColor: "white",
                            border: "1px solid #d4ded9",
                            borderRadius: "5px",
                            overflow: "hidden",
                        }}
                    >
                        {/* TABLE HEADER */}

                        <div
                            style={{
                                padding: "16px 14px",
                                borderBottom: "1px solid #dce4e1",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: "20px",
                                }}
                            >
                                KPI Summary Details
                            </h2>

                            <button
                                onClick={() => setShowAll(!showAll)}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "#075E45",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                }}
                            >
                                {showAll ? "Show Less" : "View All"}

                                <ArrowRight size={14} />
                            </button>
                        </div>

                        {/* TABLE */}

                        <div
                            style={{
                                overflowX: "auto",
                            }}
                        >
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: "13px",
                                }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            backgroundColor: "#f1f5f7",
                                        }}
                                    >
                                        <TableHead>INDICATOR</TableHead>

                                        <TableHead>TARGET</TableHead>

                                        <TableHead>ACTUAL</TableHead>

                                        <TableHead>ACHIEVEMENT</TableHead>

                                        <TableHead>STATUS</TableHead>
                                    </tr>
                                </thead>

                                <tbody>
                                    {displayedKpi.length > 0 ? (
                                        displayedKpi.map((item, index) => (
                                            <tr
                                                key={index}
                                                style={{
                                                    borderBottom:
                                                        "1px solid #dce4e1",
                                                }}
                                            >
                                                <TableCell left>
                                                    {item.indicator}
                                                </TableCell>

                                                <TableCell>
                                                    {item.target}
                                                </TableCell>

                                                <TableCell>
                                                    {item.actual}
                                                </TableCell>

                                                <TableCell>
                                                    <span
                                                        style={{
                                                            color:
                                                                item.achievement >=
                                                                90
                                                                    ? "#0A6B50"
                                                                    : item.achievement >=
                                                                        70
                                                                      ? "#b45309"
                                                                      : "#dc2626",
                                                            fontWeight: "600",
                                                            fontSize: "13px",
                                                        }}
                                                    >
                                                        {item.achievement}%
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    <StatusBadge
                                                        status={item.status}
                                                    />
                                                </TableCell>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                style={{
                                                    padding: "30px",
                                                    textAlign: "center",
                                                    color: "#61786D",
                                                    fontSize: "14px",
                                                }}
                                            >
                                                Data tidak ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
            </div>
        </>
    );
}

/* =====================================================
   FILTER
===================================================== */

function FilterSelect({ icon, value, onChange, options }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "0 10px",
                height: "34px",
                borderRight: "1px solid #dce4e1",
            }}
        >
            {icon && (
                <span
                    style={{
                        color: "#36564A",
                    }}
                >
                    {icon}
                </span>
            )}

            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: "13px",
                    color: "#294B3E",
                    cursor: "pointer",
                }}
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>

            <ChevronDown size={13} color="#61726c" />
        </div>
    );
}

/* =====================================================
   METRIC CARD
===================================================== */

function MetricCard({ title, value, change, badge }) {
    return (
        <div
            style={{
                backgroundColor: "white",
                border: "1px solid #d4ded9",
                borderRadius: "4px",
                minHeight: "82px",
                padding: "14px",
                boxSizing: "border-box",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    fontSize: "11px",
                    letterSpacing: "1px",
                    color: "#355449",
                    marginBottom: "10px",
                    fontWeight: "700",
                }}
            >
                {title}
            </div>

            <div
                style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "10px",
                }}
            >
                <strong
                    style={{
                        fontSize: "27px",
                        color: "#075E45",
                    }}
                >
                    {value}
                </strong>

                {change && (
                    <span
                        style={{
                            fontSize: "12px",
                            color: "#0A6B50",
                            marginBottom: "3px",
                        }}
                    >
                        {change}
                    </span>
                )}
            </div>

            {badge && (
                <span
                    style={{
                        position: "absolute",
                        right: "0",
                        bottom: "0",
                        backgroundColor: "#EFFF00",
                        color: "#064E3B",
                        padding: "4px 6px",
                        fontSize: "10px",
                        fontWeight: "700",
                    }}
                >
                    {badge}
                </span>
            )}
        </div>
    );
}

/* =====================================================
   CHART CARD
===================================================== */

function ChartCard({ title, children, menu = false }) {
    return (
        <div
            style={{
                backgroundColor: "white",
                border: "1px solid #d4ded9",
                borderRadius: "5px",
                padding: "14px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: "18px",
                        color: "#C94F3D",
                    }}
                >
                    {title}
                </h2>

                {menu && <MoreVertical size={17} color="#4f625b" />}
            </div>

            {children}
        </div>
    );
}

/* =====================================================
   LINE CHART
===================================================== */

function LineChart({ values }) {
    const width = 600;
    const height = 220;

    const max = Math.max(...values, 120);

    const points = values
        .map((value, index) => {
            const x =
                values.length === 1
                    ? width / 2
                    : (index / (values.length - 1)) * width;

            const y = height - (value / max) * 180 - 10;

            return `${x},${y}`;
        })
        .join(" ");

    const areaPoints = `0,${height} ${points} ${width},${height}`;

    return (
        <div
            style={{
                width: "100%",
                height: "230px",
                backgroundColor: "#F7F9F2",
                padding: "10px",
                boxSizing: "border-box",
            }}
        >
            <svg
                viewBox={`0 0 ${width} ${height}`}
                width="100%"
                height="100%"
                preserveAspectRatio="none"
            >
                <polygon points={areaPoints} fill="#E8FF33" />

                <polyline
                    points={points}
                    fill="none"
                    stroke="#075E45"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {values.map((value, index) => {
                    const x =
                        values.length === 1
                            ? width / 2
                            : (index / (values.length - 1)) * width;

                    const y = height - (value / max) * 180 - 10;

                    return (
                        <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="3"
                            fill="#C94F3D"
                        />
                    );
                })}
            </svg>

            {/* MONTH LABELS */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#61786D",
                    fontSize: "11px",
                    padding: "0 8px",
                }}
            >
                {[
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                ].map((item) => (
                    <span key={item}>{item}</span>
                ))}
            </div>
        </div>
    );
}

/* =====================================================
   BAR CHART
===================================================== */

function BarChart() {
    const data = [
        {
            label: "Q1",
            target: 85,
            actual: 75,
        },
        {
            label: "Q2",
            target: 78,
            actual: 65,
        },
        {
            label: "Q3",
            target: 95,
            actual: 88,
        },
        {
            label: "Q4",
            target: 70,
            actual: 45,
        },
        {
            label: "YTD",
            target: 92,
            actual: 88,
        },
    ];

    return (
        <div>
            {/* LEGEND */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    fontSize: "12px",
                    marginBottom: "8px",
                    color: "#53655e",
                }}
            >
                <span>
                    <span
                        style={{
                            display: "inline-block",
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            backgroundColor: "#EFFF00",
                            marginRight: "4px",
                        }}
                    />
                    Target
                </span>

                <span>
                    <span
                        style={{
                            display: "inline-block",
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            backgroundColor: "#075E45",
                            marginRight: "4px",
                        }}
                    />
                    Actual
                </span>
            </div>

            {/* BARS */}

            <div
                style={{
                    height: "210px",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-around",
                    borderBottom: "1px solid #dce4e1",
                    padding: "10px 10px 0",
                    boxSizing: "border-box",
                }}
            >
                {data.map((item) => (
                    <div
                        key={item.label}
                        style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "flex-end",
                            gap: "4px",
                        }}
                    >
                        {/* TARGET */}

                        <div
                            style={{
                                width: "13px",
                                height: `${item.target}%`,
                                backgroundColor: "#EFFF00",
                            }}
                        />

                        {/* ACTUAL */}

                        <div
                            style={{
                                width: "13px",
                                height: `${item.actual}%`,
                                backgroundColor: "#075E45",
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* LABELS */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-around",
                    fontSize: "11px",
                    color: "#61786D",
                    paddingTop: "6px",
                }}
            >
                {data.map((item) => (
                    <span key={item.label}>{item.label}</span>
                ))}
            </div>
        </div>
    );
}

/* =====================================================
   TABLE
===================================================== */

function TableHead({ children }) {
    return (
        <th
            style={{
                padding: "10px",
                textAlign: "center",
                fontSize: "11px",
                letterSpacing: "0.7px",
                color: "#3e514a",
                fontWeight: "700",
            }}
        >
            {children}
        </th>
    );
}

function TableCell({ children, left = false }) {
    return (
        <td
            style={{
                padding: "9px 10px",
                textAlign: left ? "left" : "center",
                color: "#233F35",
                fontSize: "13px",
            }}
        >
            {children}
        </td>
    );
}

/* =====================================================
   STATUS
===================================================== */

function StatusBadge({ status }) {
    let background = "#d6f8e6";
    let color = "#0A6B50";

    if (status === "NOT ACHIEVED") {
        background = "#ffe1df";
        color = "#dc2626";
    }

    if (status === "PENDING") {
        background = "#e2e7eb";
        color = "#52616b";
    }

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "78px",
                padding: "5px 8px",
                borderRadius: "2px",
                backgroundColor: background,
                color: color,
                fontSize: "10px",
                fontWeight: "700",
            }}
        >
            {status === "ACHIEVED" && (
                <CheckCircle2
                    size={10}
                    style={{
                        marginRight: "4px",
                    }}
                />
            )}

            {status === "NOT ACHIEVED" && (
                <AlertCircle
                    size={10}
                    style={{
                        marginRight: "4px",
                    }}
                />
            )}

            {status}
        </span>
    );
}
