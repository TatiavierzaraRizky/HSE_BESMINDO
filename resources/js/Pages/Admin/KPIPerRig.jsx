import React, { useMemo, useState } from "react";
import AdminSidebar from "../../Components/AdminSidebar";

export default function KPIPerRig() {
    // =====================================================
    // STATE
    // =====================================================

    const [rig, setRig] = useState("Rig-04 Sector Alpha");
    const [contract, setContract] = useState("CT-2023-XY");
    const [year, setYear] = useState("2024");
    const [period, setPeriod] = useState("Q3");

    const [performanceMode, setPerformanceMode] =
        useState("Monthly");

    const [currentPage, setCurrentPage] = useState(1);

    const [selectedKpi, setSelectedKpi] = useState(null);

    const rowsPerPage = 5;

    // =====================================================
    // DATA KPI
    // =====================================================

    const kpiData = [
        {
            indicator: "Lost Time Incidents (LTI)",
            target: 0,
            actual: 0,
            variance: 0,
            status: "Achieved",
        },
        {
            indicator: "Safety Audits Completed",
            target: 24,
            actual: 22,
            variance: -2,
            status: "Below Target",
        },
        {
            indicator: "Toolbox Talks",
            target: 90,
            actual: 95,
            variance: 5,
            status: "Achieved",
        },
        {
            indicator: "Near Miss Reporting",
            target: 15,
            actual: 14,
            variance: -1,
            status: "Below Target",
        },
        {
            indicator: "Safety Observations",
            target: 120,
            actual: 118,
            variance: -2,
            status: "Below Target",
        },
        {
            indicator: "HSE Training",
            target: 50,
            actual: 52,
            variance: 2,
            status: "Achieved",
        },
        {
            indicator: "Equipment Inspection",
            target: 40,
            actual: 40,
            variance: 0,
            status: "Achieved",
        },
        {
            indicator: "Hazard Identification",
            target: 30,
            actual: 28,
            variance: -2,
            status: "Below Target",
        },
    ];

    // =====================================================
    // FILTER DATA
    // =====================================================

    const filteredData = useMemo(() => {
        return kpiData;
    }, []);

    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages = Math.ceil(
        filteredData.length / rowsPerPage
    );

    const currentData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // =====================================================
    // HANDLER
    // =====================================================

    const handleFilter = () => {
        setCurrentPage(1);

        alert(
            `Filter KPI diterapkan\n\nRig: ${rig}\nContract: ${contract}\nYear: ${year}\nPeriod: ${period}`
        );
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleExport = () => {
        alert(
            `Export KPI Report\n\nRig: ${rig}\nContract: ${contract}\nYear: ${year}\nPeriod: ${period}`
        );
    };

    const handleChartClick = (label) => {
        alert(`Detail KPI: ${label}`);
    };

    // =====================================================
    // STYLE
    // =====================================================

    const green = "#004d32";
    const green2 = "#00583b";
    const background = "#f4f7fb";
    const border = "#d9e1e8";
    const text = "#102033";
    const muted = "#64748b";

    const selectStyle = {
        height: "35px",
        padding: "0 8px",
        border: `1px solid ${border}`,
        borderRadius: "3px",
        backgroundColor: "#ffffff",
        color: text,
        fontSize: "13px",
        outline: "none",
        cursor: "pointer",
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: background,
                fontFamily: "Arial, sans-serif",
                color: text,
            }}
        >
            {/* =================================================
                SIDEBAR
            ================================================= */}

            <AdminSidebar />

            {/* =================================================
                MAIN
            ================================================= */}

            <main
                style={{
                    marginLeft: "215px",
                    minHeight: "100vh",
                }}
            >
                {/* =================================================
                    HEADER
                ================================================= */}

                <header
                    style={{
                        height: "62px",
                        backgroundColor: "#ffffff",
                        borderBottom: `1px solid ${border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 25px",
                        boxSizing: "border-box",
                    }}
                >
                    <div>
                        <div
                            style={{
                                color: green,
                                fontSize: "18px",
                                fontWeight: "700",
                            }}
                        >
                            RigOps HSE Manager
                        </div>

                        <div
                            style={{
                                fontSize: "12px",
                                color: muted,
                                marginTop: "2px",
                            }}
                        >
                            Rig & Contract Performance Summary
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "18px",
                        }}
                    >
                        <button
                            onClick={() =>
                                alert(
                                    "Tidak ada notifikasi baru."
                                )
                            }
                            style={iconButton}
                        >
                            🔔
                        </button>

                        <button
                            onClick={() =>
                                alert(
                                    "Halaman KPI Per Rig digunakan untuk melihat pencapaian KPI berdasarkan Rig dan Contract."
                                )
                            }
                            style={iconButton}
                        >
                            ?
                        </button>

                        <button
                            onClick={() =>
                                alert("Rig HSE Admin")
                            }
                            style={iconButton}
                        >
                            ◎
                        </button>
                    </div>
                </header>

                {/* =================================================
                    CONTENT
                ================================================= */}

                <div
                    style={{
                        padding: "20px",
                    }}
                >
                    {/* =================================================
                        TITLE + FILTER
                    ================================================= */}

                    <section
                        style={{
                            backgroundColor: "#ffffff",
                            border: `1px solid ${border}`,
                            borderRadius: "5px",
                            padding: "15px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "20px",
                            marginBottom: "10px",
                        }}
                    >
                        <div>
                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: "21px",
                                    color: "#111827",
                                }}
                            >
                                Admin KPI per Rig
                            </h1>

                            <p
                                style={{
                                    margin: "4px 0 0",
                                    fontSize: "12px",
                                    color: muted,
                                }}
                            >
                                Rig & Contract Performance Summary
                            </p>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "105px 105px 55px 55px 70px",
                                gap: "7px",
                                alignItems: "end",
                            }}
                        >
                            {/* RIG */}

                            <div>
                                <label style={labelStyle}>
                                    Rig
                                </label>

                                <select
                                    value={rig}
                                    onChange={(e) =>
                                        setRig(e.target.value)
                                    }
                                    style={selectStyle}
                                >
                                    <option>
                                        Rig-04 Sector Alpha
                                    </option>

                                    <option>
                                        Rig-12 Sector Delta
                                    </option>

                                    <option>
                                        Rig-03 Sector Bravo
                                    </option>
                                </select>
                            </div>

                            {/* CONTRACT */}

                            <div>
                                <label style={labelStyle}>
                                    Contract
                                </label>

                                <select
                                    value={contract}
                                    onChange={(e) =>
                                        setContract(e.target.value)
                                    }
                                    style={selectStyle}
                                >
                                    <option>
                                        CT-2023-XY
                                    </option>

                                    <option>
                                        CT-2024-AB
                                    </option>

                                    <option>
                                        CT-2024-CD
                                    </option>
                                </select>
                            </div>

                            {/* YEAR */}

                            <div>
                                <label style={labelStyle}>
                                    Year
                                </label>

                                <select
                                    value={year}
                                    onChange={(e) =>
                                        setYear(e.target.value)
                                    }
                                    style={selectStyle}
                                >
                                    <option>2024</option>
                                    <option>2025</option>
                                    <option>2026</option>
                                </select>
                            </div>

                            {/* PERIOD */}

                            <div>
                                <label style={labelStyle}>
                                    Period
                                </label>

                                <select
                                    value={period}
                                    onChange={(e) =>
                                        setPeriod(e.target.value)
                                    }
                                    style={selectStyle}
                                >
                                    <option>Q1</option>
                                    <option>Q2</option>
                                    <option>Q3</option>
                                    <option>Q4</option>
                                </select>
                            </div>

                            {/* FILTER BUTTON */}

                            <button
                                onClick={handleFilter}
                                style={{
                                    height: "35px",
                                    border: "none",
                                    borderRadius: "3px",
                                    backgroundColor: green,
                                    color: "#ffffff",
                                    fontSize: "13px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                }}
                            >
                                Filter
                            </button>
                        </div>
                    </section>

                    {/* =================================================
                        KPI CARDS
                    ================================================= */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(4, 1fr)",
                            gap: "10px",
                            marginBottom: "10px",
                        }}
                    >
                        <KpiCard
                            title="Target (Total)"
                            value="1,200"
                            suffix="pts"
                            icon="⚑"
                        />

                        <KpiCard
                            title="Actual"
                            value="1,145"
                            suffix="pts"
                            icon="▥"
                        />

                        <KpiCard
                            title="Achievement"
                            value="95.4%"
                            suffix=""
                            icon="%"
                            change="↑ 2.1%"
                        />

                        <KpiCard
                            title="Status"
                            value="On Track"
                            suffix=""
                            icon="✓"
                            status
                        />
                    </div>

                    {/* =================================================
                        CHARTS
                    ================================================= */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "1fr 1fr",
                            gap: "10px",
                            marginBottom: "10px",
                        }}
                    >
                        {/* TARGET VS ACTUAL */}

                        <section
                            style={cardStyle}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "center",
                                    marginBottom: "10px",
                                }}
                            >
                                <h2
                                    style={
                                        sectionTitle
                                    }
                                >
                                    Target vs Actual
                                </h2>

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        fontSize: "12px",
                                        color: muted,
                                    }}
                                >
                                    <span>
                                        <span
                                            style={{
                                                display:
                                                    "inline-block",
                                                width:
                                                    "9px",
                                                height:
                                                    "9px",
                                                backgroundColor:
                                                    "#c2c9c5",
                                                marginRight:
                                                    "4px",
                                            }}
                                        />
                                        Target
                                    </span>

                                    <span>
                                        <span
                                            style={{
                                                display:
                                                    "inline-block",
                                                width:
                                                    "9px",
                                                height:
                                                    "9px",
                                                backgroundColor:
                                                    green,
                                                marginRight:
                                                    "4px",
                                            }}
                                        />
                                        Actual
                                    </span>
                                </div>
                            </div>

                            <div
                                style={{
                                    height: "325px",
                                    backgroundColor:
                                        "#f0f3f7",
                                    padding:
                                        "20px",
                                    boxSizing:
                                        "border-box",
                                    display: "flex",
                                    alignItems:
                                        "flex-end",
                                    justifyContent:
                                        "space-around",
                                    gap: "12px",
                                }}
                            >
                                {[
                                    {
                                        label: "Q1",
                                        target: 55,
                                        actual: 55,
                                    },
                                    {
                                        label: "Q2",
                                        target: 68,
                                        actual: 69,
                                    },
                                    {
                                        label: "Q3",
                                        target: 80,
                                        actual: 80,
                                    },
                                    {
                                        label: "Q4",
                                        target: 90,
                                        actual: 90,
                                    },
                                ].map((item) => (
                                    <div
                                        key={
                                            item.label
                                        }
                                        style={{
                                            flex: 1,
                                            height:
                                                "100%",
                                            display:
                                                "flex",
                                            flexDirection:
                                                "column",
                                            justifyContent:
                                                "flex-end",
                                            alignItems:
                                                "center",
                                            cursor:
                                                "pointer",
                                        }}
                                        onClick={() =>
                                            handleChartClick(
                                                item.label
                                            )
                                        }
                                    >
                                        <div
                                            style={{
                                                width:
                                                    "100%",
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "flex-end",
                                                justifyContent:
                                                    "center",
                                                gap:
                                                    "3px",
                                                height:
                                                    "100%",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width:
                                                        "40%",
                                                    height: `${item.target}%`,
                                                    backgroundColor:
                                                        "#c2c9c5",
                                                }}
                                                title={`Target ${item.target}`}
                                            />

                                            <div
                                                style={{
                                                    width:
                                                        "40%",
                                                    height: `${item.actual}%`,
                                                    backgroundColor:
                                                        green,
                                                }}
                                                title={`Actual ${item.actual}`}
                                            />
                                        </div>

                                        <span
                                            style={{
                                                marginTop:
                                                    "7px",
                                                fontSize: "12px",
                                                color:
                                                    muted,
                                            }}
                                        >
                                            {
                                                item.label
                                            }
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* MONTHLY PERFORMANCE */}

                        <section
                            style={cardStyle}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "center",
                                    marginBottom: "10px",
                                }}
                            >
                                <h2
                                    style={
                                        sectionTitle
                                    }
                                >
                                    Monthly Performance
                                </h2>

                                <div
                                    style={{
                                        display:
                                            "flex",
                                        backgroundColor:
                                            "#eef1f6",
                                        borderRadius:
                                            "2px",
                                        overflow:
                                            "hidden",
                                    }}
                                >
                                    {[
                                        "Monthly",
                                        "Quarterly",
                                        "YTD",
                                    ].map(
                                        (mode) => (
                                            <button
                                                key={
                                                    mode
                                                }
                                                onClick={() =>
                                                    setPerformanceMode(
                                                        mode
                                                    )
                                                }
                                                style={{
                                                    border:
                                                        "none",
                                                    padding:
                                                        "6px 9px",
                                                    fontSize: "11px",
                                                    backgroundColor:
                                                        performanceMode ===
                                                        mode
                                                            ? "#ffffff"
                                                            : "transparent",
                                                    color:
                                                        performanceMode ===
                                                        mode
                                                            ? green
                                                            : muted,
                                                    fontWeight:
                                                        performanceMode ===
                                                        mode
                                                            ? "700"
                                                            : "400",
                                                    cursor:
                                                        "pointer",
                                                }}
                                            >
                                                {
                                                    mode
                                                }
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            <div
                                style={{
                                    height: "325px",
                                    backgroundColor:
                                        "#f0f3f7",
                                    padding:
                                        "20px",
                                    boxSizing:
                                        "border-box",
                                    position:
                                        "relative",
                                    display:
                                        "flex",
                                    alignItems:
                                        "flex-end",
                                    gap: "8px",
                                }}
                            >
                                {[
                                    30,
                                    48,
                                    39,
                                    72,
                                    62,
                                    95,
                                ].map(
                                    (
                                        value,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                index
                                            }
                                            style={{
                                                flex: 1,
                                                height:
                                                    "100%",
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "flex-end",
                                                cursor:
                                                    "pointer",
                                            }}
                                            onClick={() =>
                                                handleChartClick(
                                                    `${performanceMode} ${
                                                        index +
                                                        1
                                                    }`
                                                )
                                            }
                                        >
                                            <div
                                                style={{
                                                    width:
                                                        "100%",
                                                    height: `${value}%`,
                                                    backgroundColor:
                                                        "#d5dfdc",
                                                    borderTop:
                                                        `2px solid ${green}`,
                                                    transition:
                                                        "0.2s",
                                                }}
                                                title={`${value}%`}
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        </section>
                    </div>

                    {/* =================================================
                        DETAILED TABLE
                    ================================================= */}

                    <section
                        style={cardStyle}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems:
                                    "center",
                                marginBottom:
                                    "10px",
                            }}
                        >
                            <h2
                                style={
                                    sectionTitle
                                }
                            >
                                Detailed KPI Table
                            </h2>

                            <button
                                onClick={handleFilter}
                                style={{
                                    backgroundColor:
                                        "#ffffff",
                                    border: `1px solid ${border}`,
                                    padding:
                                        "7px 12px",
                                    borderRadius:
                                        "3px",
                                    fontSize: "12px",
                                    cursor:
                                        "pointer",
                                    color:
                                        "#334155",
                                }}
                            >
                                ☷ Filter
                            </button>
                        </div>

                        <div
                            style={{
                                overflowX:
                                    "auto",
                            }}
                        >
                            <table
                                style={{
                                    width:
                                        "100%",
                                    borderCollapse:
                                        "collapse",
                                    fontSize: "13px",
                                }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            backgroundColor:
                                                "#e7ebf0",
                                        }}
                                    >
                                        <th
                                            style={
                                                thStyle
                                            }
                                        >
                                            Indicator
                                        </th>

                                        <th
                                            style={
                                                thStyle
                                            }
                                        >
                                            Target
                                        </th>

                                        <th
                                            style={
                                                thStyle
                                            }
                                        >
                                            Actual
                                        </th>

                                        <th
                                            style={
                                                thStyle
                                            }
                                        >
                                            Variance
                                        </th>

                                        <th
                                            style={
                                                thStyle
                                            }
                                        >
                                            Status
                                        </th>

                                        <th
                                            style={
                                                thStyle
                                            }
                                        >
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentData.map(
                                        (
                                            row,
                                            index
                                        ) => (
                                            <tr
                                                key={`${row.indicator}-${index}`}
                                                style={{
                                                    borderBottom:
                                                        `1px solid ${border}`,
                                                }}
                                            >
                                                <td
                                                    style={
                                                        tdStyle
                                                    }
                                                >
                                                    {
                                                        row.indicator
                                                    }
                                                </td>

                                                <td
                                                    style={{
                                                        ...tdStyle,
                                                        textAlign:
                                                            "center",
                                                    }}
                                                >
                                                    {
                                                        row.target
                                                    }
                                                </td>

                                                <td
                                                    style={{
                                                        ...tdStyle,
                                                        textAlign:
                                                            "center",
                                                    }}
                                                >
                                                    {
                                                        row.actual
                                                    }
                                                </td>

                                                <td
                                                    style={{
                                                        ...tdStyle,
                                                        textAlign:
                                                            "center",
                                                        color:
                                                            row.variance <
                                                            0
                                                                ? "#dc2626"
                                                                : row.variance >
                                                                  0
                                                                ? green
                                                                : "#334155",
                                                        fontWeight:
                                                            "700",
                                                    }}
                                                >
                                                    {row.variance >
                                                    0
                                                        ? `+${row.variance}`
                                                        : row.variance}
                                                </td>

                                                <td
                                                    style={
                                                        tdStyle
                                                    }
                                                >
                                                    <StatusBadge
                                                        status={
                                                            row.status
                                                        }
                                                    />
                                                </td>

                                                <td
                                                    style={{
                                                        ...tdStyle,
                                                        textAlign:
                                                            "center",
                                                    }}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            setSelectedKpi(
                                                                row
                                                            )
                                                        }
                                                        style={{
                                                            border:
                                                                "none",
                                                            background:
                                                                "transparent",
                                                            cursor:
                                                                "pointer",
                                                            fontSize: "16px",
                                                        }}
                                                        title="Lihat detail"
                                                    >
                                                        ◉
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}

                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "space-between",
                                alignItems:
                                    "center",
                                marginTop:
                                    "10px",
                                fontSize: "12px",
                                color:
                                    muted,
                            }}
                        >
                            <span>
                                Showing{" "}
                                {(currentPage -
                                    1) *
                                    rowsPerPage +
                                    1}{" "}
                                to{" "}
                                {Math.min(
                                    currentPage *
                                        rowsPerPage,
                                    filteredData.length
                                )}{" "}
                                of{" "}
                                {
                                    filteredData.length
                                }{" "}
                                entries
                            </span>

                            <div
                                style={{
                                    display:
                                        "flex",
                                    gap:
                                        "4px",
                                }}
                            >
                                <button
                                    onClick={
                                        handlePrevious
                                    }
                                    disabled={
                                        currentPage ===
                                        1
                                    }
                                    style={paginationStyle(
                                        currentPage ===
                                            1
                                    )}
                                >
                                    Prev
                                </button>

                                {Array.from(
                                    {
                                        length:
                                            totalPages,
                                    },
                                    (
                                        _,
                                        index
                                    ) =>
                                        index +
                                        1
                                ).map(
                                    (
                                        page
                                    ) => (
                                        <button
                                            key={
                                                page
                                            }
                                            onClick={() =>
                                                setCurrentPage(
                                                    page
                                                )
                                            }
                                            style={{
                                                ...paginationStyle(
                                                    false
                                                ),
                                                backgroundColor:
                                                    currentPage ===
                                                    page
                                                        ? green
                                                        : "#ffffff",
                                                color:
                                                    currentPage ===
                                                    page
                                                        ? "#ffffff"
                                                        : text,
                                            }}
                                        >
                                            {
                                                page
                                            }
                                        </button>
                                    )
                                )}

                                <button
                                    onClick={
                                        handleNext
                                    }
                                    disabled={
                                        currentPage ===
                                        totalPages
                                    }
                                    style={paginationStyle(
                                        currentPage ===
                                            totalPages
                                    )}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* EXPORT */}

                    <div
                        style={{
                            display:
                                "flex",
                            justifyContent:
                                "flex-end",
                            marginTop:
                                "12px",
                        }}
                    >
                        <button
                            onClick={
                                handleExport
                            }
                            style={{
                                backgroundColor:
                                    green,
                                color:
                                    "#ffffff",
                                border:
                                    "none",
                                borderRadius:
                                    "4px",
                                padding:
                                    "10px 18px",
                                fontSize: "13px",
                                fontWeight:
                                    "700",
                                cursor:
                                    "pointer",
                            }}
                        >
                            ↓ Export KPI Report
                        </button>
                    </div>
                </div>
            </main>

            {/* =================================================
                MODAL
            ================================================= */}

            {selectedKpi && (
                <div
                    onClick={() =>
                        setSelectedKpi(null)
                    }
                    style={{
                        position:
                            "fixed",
                        inset: 0,
                        backgroundColor:
                            "rgba(0,0,0,0.35)",
                        display:
                            "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        zIndex: 9999,
                    }}
                >
                    <div
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        style={{
                            width:
                                "420px",
                            backgroundColor:
                                "#ffffff",
                            borderRadius:
                                "8px",
                            padding:
                                "25px",
                            boxSizing:
                                "border-box",
                            boxShadow:
                                "0 10px 30px rgba(0,0,0,0.2)",
                        }}
                    >
                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "space-between",
                                alignItems:
                                    "center",
                            }}
                        >
                            <h2
                                style={{
                                    margin:
                                        0,
                                    color:
                                        green,
                                    fontSize: "21px",
                                }}
                            >
                                KPI Detail
                            </h2>

                            <button
                                onClick={() =>
                                    setSelectedKpi(
                                        null
                                    )
                                }
                                style={{
                                    border:
                                        "none",
                                    background:
                                        "transparent",
                                    fontSize: "23px",
                                    cursor:
                                        "pointer",
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div
                            style={{
                                marginTop:
                                    "20px",
                                display:
                                    "grid",
                                gap:
                                    "12px",
                            }}
                        >
                            <DetailRow
                                label="Indicator"
                                value={
                                    selectedKpi.indicator
                                }
                            />

                            <DetailRow
                                label="Target"
                                value={
                                    selectedKpi.target
                                }
                            />

                            <DetailRow
                                label="Actual"
                                value={
                                    selectedKpi.actual
                                }
                            />

                            <DetailRow
                                label="Variance"
                                value={
                                    selectedKpi.variance >
                                    0
                                        ? `+${selectedKpi.variance}`
                                        : selectedKpi.variance
                                }
                            />

                            <DetailRow
                                label="Status"
                                value={
                                    selectedKpi.status
                                }
                            />

                            <DetailRow
                                label="Rig"
                                value={
                                    rig
                                }
                            />

                            <DetailRow
                                label="Contract"
                                value={
                                    contract
                                }
                            />
                        </div>

                        <button
                            onClick={() =>
                                setSelectedKpi(
                                    null
                                )
                            }
                            style={{
                                width:
                                    "100%",
                                marginTop:
                                    "20px",
                                padding:
                                    "10px",
                                border:
                                    "none",
                                borderRadius:
                                    "4px",
                                backgroundColor:
                                    green,
                                color:
                                    "#ffffff",
                                cursor:
                                    "pointer",
                                fontWeight:
                                    "700",
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// =====================================================
// KPI CARD
// =====================================================

function KpiCard({
    title,
    value,
    suffix,
    icon,
    change,
    status,
}) {
    return (
        <div
            style={{
                backgroundColor:
                    "#ffffff",
                border:
                    "1px solid #d9e1e8",
                borderRadius:
                    "5px",
                padding:
                    "14px",
                minHeight:
                    "78px",
                boxSizing:
                    "border-box",
            }}
        >
            <div
                style={{
                    display:
                        "flex",
                    justifyContent:
                        "space-between",
                    alignItems:
                        "center",
                }}
            >
                <span
                    style={{
                        fontSize: "12px",
                        color:
                            "#475569",
                    }}
                >
                    {title}
                </span>

                <span
                    style={{
                        color:
                            "#008c65",
                        fontSize: "19px",
                        fontWeight:
                            "700",
                    }}
                >
                    {icon}
                </span>
            </div>

            {status ? (
                <div
                    style={{
                        marginTop:
                            "12px",
                    }}
                >
                    <span
                        style={{
                            display:
                                "inline-block",
                            backgroundColor:
                                "#b9f1d0",
                            color:
                                "#006b45",
                            padding:
                                "4px 9px",
                            borderRadius:
                                "12px",
                            fontSize: "12px",
                            fontWeight:
                                "700",
                        }}
                    >
                        ● {value}
                    </span>
                </div>
            ) : (
                <div
                    style={{
                        display:
                            "flex",
                        alignItems:
                            "baseline",
                        gap:
                            "5px",
                        marginTop:
                            "10px",
                    }}
                >
                    <strong
                        style={{
                            fontSize: "26px",
                            color:
                                "#111827",
                        }}
                    >
                        {value}
                    </strong>

                    {suffix && (
                        <span
                            style={{
                                fontSize: "12px",
                                color:
                                    "#64748b",
                            }}
                        >
                            {suffix}
                        </span>
                    )}

                    {change && (
                        <span
                            style={{
                                fontSize: "11px",
                                color:
                                    "#16a34a",
                            }}
                        >
                            {change}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({ status }) {
    const achieved =
        status === "Achieved";

    return (
        <span
            style={{
                display:
                    "inline-flex",
                alignItems:
                    "center",
                gap:
                    "5px",
                fontSize: "12px",
                color:
                    achieved
                        ? "#006b45"
                        : "#b91c1c",
            }}
        >
            <span
                style={{
                    width:
                        "8px",
                    height:
                        "8px",
                    borderRadius:
                        "50%",
                    backgroundColor:
                        achieved
                            ? "#006b45"
                            : "#c91f2c",
                }}
            />

            {status}
        </span>
    );
}

// =====================================================
// DETAIL ROW
// =====================================================

function DetailRow({
    label,
    value,
}) {
    return (
        <div
            style={{
                display:
                    "flex",
                justifyContent:
                    "space-between",
                gap:
                    "20px",
                paddingBottom:
                    "10px",
                borderBottom:
                    "1px solid #e2e8f0",
            }}
        >
            <span
                style={{
                    fontSize: "13px",
                    color:
                        "#64748b",
                }}
            >
                {label}
            </span>

            <strong
                style={{
                    fontSize: "13px",
                    color:
                        "#102033",
                    textAlign:
                        "right",
                }}
            >
                {value}
            </strong>
        </div>
    );
}

// =====================================================
// STYLES
// =====================================================

const cardStyle = {
    backgroundColor:
        "#ffffff",
    border:
        "1px solid #d9e1e8",
    borderRadius:
        "5px",
    padding:
        "12px",
    boxSizing:
        "border-box",
};

const sectionTitle = {
    margin: 0,
    fontSize: "16px",
    fontWeight:
        "700",
    color:
        "#111827",
};

const labelStyle = {
    display:
        "block",
    marginBottom:
        "4px",
    fontSize: "10px",
    color:
        "#475569",
    fontWeight:
        "700",
};

const thStyle = {
    padding:
        "8px",
    textAlign:
        "left",
    fontSize: "11px",
    color:
        "#475569",
};

const tdStyle = {
    padding:
        "8px",
    color:
        "#1e293b",
    whiteSpace:
        "nowrap",
};

const iconButton = {
    border:
        "none",
    background:
        "transparent",
    color:
        "#004d32",
    fontSize: "19px",
    cursor:
        "pointer",
};

const paginationStyle = (
    disabled
) => ({
    minWidth:
        "28px",
    height:
        "24px",
    border:
        "1px solid #d9e1e8",
    borderRadius:
        "3px",
    backgroundColor:
        "#ffffff",
    color:
        disabled
            ? "#cbd5e1"
            : "#334155",
    cursor:
        disabled
            ? "not-allowed"
            : "pointer",
    fontSize: "12px",
});