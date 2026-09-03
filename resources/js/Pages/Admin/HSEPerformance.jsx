import React, { useMemo, useState } from "react";
import AdminSidebar from "../../Components/AdminSidebar";

export default function HSEPerformance() {
    // =========================================================
    // STATE
    // =========================================================

    const [year, setYear] = useState("2024");
    const [month, setMonth] = useState("October");
    const [rig, setRig] = useState("All Rigs");
    const [contractor, setContractor] = useState("All Contractors");

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLog, setSelectedLog] = useState(null);

    const rowsPerPage = 5;

    // =========================================================
    // DATA
    // =========================================================

    const hseData = [
        {
            date: "2024-10-12",
            location: "Rig-04 Sector Alpha",
            event: "Equipment Failure",
            severity: "High",
            manHours: "12.5",
            status: "Under Investigation",
        },
        {
            date: "2024-10-10",
            location: "Rig-12 Sector Delta",
            event: "Near Miss (Dropped Object)",
            severity: "Medium",
            manHours: "0.0",
            status: "Closed",
        },
        {
            date: "2024-10-08",
            location: "Rig-04 Sector Alpha",
            event: "First Aid Incident",
            severity: "Low",
            manHours: "2.0",
            status: "Closed",
        },
        {
            date: "2024-10-05",
            location: "Camp Facility Beta",
            event: "Vehicle Collision",
            severity: "Medium",
            manHours: "4.5",
            status: "Review Pending",
        },
        {
            date: "2024-10-01",
            location: "Rig-04 Sector Alpha",
            event: "Safety Observation",
            severity: "Info",
            manHours: "0.0",
            status: "Actioned",
        },
        {
            date: "2024-09-28",
            location: "Rig-12 Sector Delta",
            event: "Safety Meeting",
            severity: "Info",
            manHours: "0.0",
            status: "Completed",
        },
        {
            date: "2024-09-24",
            location: "Rig-04 Sector Alpha",
            event: "Hazard Observation",
            severity: "Medium",
            manHours: "0.0",
            status: "Actioned",
        },
        {
            date: "2024-09-20",
            location: "Camp Facility Beta",
            event: "Environmental Spill",
            severity: "Low",
            manHours: "1.0",
            status: "Closed",
        },
        {
            date: "2024-09-15",
            location: "Rig-04 Sector Alpha",
            event: "Equipment Inspection",
            severity: "Info",
            manHours: "0.0",
            status: "Completed",
        },
        {
            date: "2024-09-10",
            location: "Rig-12 Sector Delta",
            event: "Near Miss",
            severity: "Medium",
            manHours: "0.0",
            status: "Under Review",
        },
        {
            date: "2024-09-06",
            location: "Rig-04 Sector Alpha",
            event: "First Aid Incident",
            severity: "Low",
            manHours: "3.0",
            status: "Closed",
        },
        {
            date: "2024-09-02",
            location: "Camp Facility Beta",
            event: "Safety Observation",
            severity: "Info",
            manHours: "0.0",
            status: "Actioned",
        },
    ];

    // =========================================================
    // FILTER
    // =========================================================

    const filteredData = useMemo(() => {
        return hseData.filter((item) => {
            const rigMatch =
                rig === "All Rigs" ||
                item.location.toLowerCase().includes(rig.toLowerCase());

            return rigMatch;
        });
    }, [rig]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const currentData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // =========================================================
    // HANDLER
    // =========================================================

    const handleFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1);
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
            `Export Report HSE\n\nTahun: ${year}\nBulan: ${month}\nRig: ${rig}\nContractor: ${contractor}`
        );
    };

    // =========================================================
    // STYLE
    // =========================================================

    const colors = {
        green: "#004d32",
        green2: "#00583b",
        lightGreen: "#e8f1ed",
        bg: "#f4f7fb",
        border: "#d9e1e8",
        text: "#102033",
        muted: "#64748b",
        red: "#c91f2c",
        yellow: "#efff00",
    };

    const cardStyle = {
        backgroundColor: "#ffffff",
        border: `1px solid ${colors.border}`,
        borderRadius: "7px",
        padding: "15px",
        boxSizing: "border-box",
    };

    const selectStyle = {
        width: "100%",
        height: "38px",
        padding: "0 10px",
        border: `1px solid ${colors.border}`,
        borderRadius: "4px",
        backgroundColor: "#ffffff",
        color: colors.text,
        fontSize: "14px",
        outline: "none",
        cursor: "pointer",
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: colors.bg,
                fontFamily: "Arial, sans-serif",
                color: colors.text,
            }}
        >
            {/* =====================================================
                SIDEBAR
            ====================================================== */}

            <AdminSidebar />

            {/* =====================================================
                MAIN CONTENT
            ====================================================== */}

            <main
                style={{
                    marginLeft: "var(--admin-sidebar-width, 215px)",
                    width: "calc(100% - var(--admin-sidebar-width, 215px))",
                    transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    minHeight: "100vh",
                    boxSizing: "border-box",
                }}
            >
                {/* =================================================
                    TOP HEADER
                ================================================== */}

                <header
                    style={{
                        height: "72px",
                        backgroundColor: "#ffffff",
                        borderBottom: `1px solid ${colors.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 28px",
                        boxSizing: "border-box",
                    }}
                >
                    <div
                        style={{
                            color: colors.green,
                            fontSize: "18px",
                            fontWeight: "700",
                        }}
                    >
                        RigOps HSE Manager
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "20px",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => alert("Tidak ada notifikasi baru.")}
                            style={headerButtonStyle}
                        >
                            🔔
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                alert(
                                    "HSE Performance digunakan untuk monitoring performa keselamatan dan operasional."
                                )
                            }
                            style={headerButtonStyle}
                        >
                            ?
                        </button>

                        <button
                            type="button"
                            onClick={() => alert("Profile Rig HSE Admin")}
                            style={headerButtonStyle}
                        >
                            ◎
                        </button>
                    </div>
                </header>

                {/* =================================================
                    PAGE CONTENT
                ================================================== */}

                <div
                    style={{
                        padding: "28px",
                        boxSizing: "border-box",
                    }}
                >
                    {/* TITLE + FILTER */}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            gap: "25px",
                            marginBottom: "18px",
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: "28px",
                                    color: "#111827",
                                    fontWeight: "700",
                                }}
                            >
                                HSE Performance Monitoring
                            </h1>

                            <p
                                style={{
                                    marginTop: "7px",
                                    marginBottom: 0,
                                    fontSize: "14px",
                                    lineHeight: "1.5",
                                    color: colors.muted,
                                }}
                            >
                                Track key safety metrics and compliance data
                                across active rigs.
                            </p>
                        </div>

                        {/* FILTER */}

                        <div
                            style={{
                                width: "430px",
                                backgroundColor: "#f1f5f9",
                                border: `1px solid ${colors.border}`,
                                borderRadius: "5px",
                                padding: "10px",
                                display: "grid",
                                gridTemplateColumns:
                                    "70px 85px 130px 120px",
                                gap: "8px",
                                boxSizing: "border-box",
                            }}
                        >
                            {/* YEAR */}

                            <div>
                                <label style={labelStyle}>Year</label>

                                <select
                                    value={year}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            setYear,
                                            e.target.value
                                        )
                                    }
                                    style={selectStyle}
                                >
                                    <option>2024</option>
                                    <option>2025</option>
                                    <option>2026</option>
                                </select>
                            </div>

                            {/* MONTH */}

                            <div>
                                <label style={labelStyle}>Month</label>

                                <select
                                    value={month}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            setMonth,
                                            e.target.value
                                        )
                                    }
                                    style={selectStyle}
                                >
                                    <option>January</option>
                                    <option>February</option>
                                    <option>March</option>
                                    <option>April</option>
                                    <option>May</option>
                                    <option>June</option>
                                    <option>July</option>
                                    <option>August</option>
                                    <option>September</option>
                                    <option>October</option>
                                    <option>November</option>
                                    <option>December</option>
                                </select>
                            </div>

                            {/* RIG */}

                            <div>
                                <label style={labelStyle}>Rig Location</label>

                                <select
                                    value={rig}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            setRig,
                                            e.target.value
                                        )
                                    }
                                    style={selectStyle}
                                >
                                    <option>All Rigs</option>
                                    <option>Rig-04</option>
                                    <option>Rig-12</option>
                                </select>
                            </div>

                            {/* CONTRACTOR */}

                            <div>
                                <label style={labelStyle}>Contractor</label>

                                <select
                                    value={contractor}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            setContractor,
                                            e.target.value
                                        )
                                    }
                                    style={selectStyle}
                                >
                                    <option>All Contractors</option>
                                    <option>Contractor A</option>
                                    <option>Contractor B</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        KPI CARDS
                    ================================================== */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(4, minmax(0, 1fr))",
                            gap: "10px",
                            marginBottom: "12px",
                        }}
                    >
                        <KpiCard
                            title="Total Man Hours"
                            value="142,500"
                            change="+5.2% vs last month"
                            icon="◷"
                        />

                        <KpiCard
                            title="KM Driven"
                            value="85,240"
                            change="-1.4% vs last month"
                            icon="▣"
                        />

                        <KpiCard
                            title="Active Employees"
                            value="842"
                            change="Stable"
                            icon="♙"
                        />

                        <KpiCard
                            title="Vehicles Deployed"
                            value="124"
                            change="+3 units added"
                            icon="▣"
                        />
                    </div>

                    {/* =================================================
                        CHART AREA
                    ================================================== */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1.8fr 0.9fr",
                            gap: "10px",
                            marginBottom: "12px",
                        }}
                    >
                        {/* HSE TREND */}

                        <section style={cardStyle}>
                            <div style={sectionHeaderStyle}>
                                <h2 style={sectionTitleStyle}>
                                    HSE Performance Trend
                                </h2>

                                <button
                                    type="button"
                                    onClick={() =>
                                        alert(
                                            "Trend HSE: Jan sampai Oct menunjukkan peningkatan performa."
                                        )
                                    }
                                    style={moreButtonStyle}
                                >
                                    ⋯
                                </button>
                            </div>

                            <div
                                style={{
                                    height: "210px",
                                    backgroundColor: "#f1f4f8",
                                    border: "1px solid #e2e8f0",
                                    padding: "20px 12px 10px",
                                    boxSizing: "border-box",
                                    display: "flex",
                                    alignItems: "flex-end",
                                    gap: "3px",
                                }}
                            >
                                {[
                                    55, 45, 67, 59, 77, 91, 84, 100,
                                ].map((height, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            flex: 1,
                                            height: `${height}%`,
                                            backgroundColor: "#d5dfdc",
                                            borderTop: "3px solid #006047",
                                            transition: "0.2s",
                                            cursor: "pointer",
                                        }}
                                        title={`Month ${index + 1}`}
                                        onClick={() =>
                                            alert(
                                                `Data trend bulan ke-${
                                                    index + 1
                                                }`
                                            )
                                        }
                                    />
                                ))}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: "11px",
                                    color: colors.muted,
                                    padding: "7px 12px 0",
                                }}
                            >
                                <span>Jan</span>
                                <span>Feb</span>
                                <span>Mar</span>
                                <span>Apr</span>
                                <span>May</span>
                                <span>Jun</span>
                                <span>Jul</span>
                                <span>Aug</span>
                            </div>
                        </section>

                        {/* TARGET VS ACTUAL */}

                        <section style={cardStyle}>
                            <h2 style={sectionTitleStyle}>
                                Target vs Actual HSE
                            </h2>

                            <div
                                style={{
                                    height: "210px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {/* DONUT */}

                                <div
                                    style={{
                                        width: "112px",
                                        height: "112px",
                                        borderRadius: "50%",
                                        background:
                                            "conic-gradient(#004d32 0deg 310deg, #e2e8f0 310deg 360deg)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "88px",
                                            height: "88px",
                                            borderRadius: "50%",
                                            backgroundColor: "#ffffff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexDirection: "column",
                                        }}
                                    >
                                        <strong
                                            style={{
                                                fontSize: "28px",
                                                color: "#111827",
                                            }}
                                        >
                                            86%
                                        </strong>

                                        <span
                                            style={{
                                                fontSize: "10px",
                                                color: colors.muted,
                                            }}
                                        >
                                            Compliance
                                        </span>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginTop: "10px",
                                    }}
                                >
                                    <div>
                                        <small
                                            style={{
                                                color: colors.muted,
                                                fontSize: "11px",
                                            }}
                                        >
                                            Target
                                        </small>

                                        <div
                                            style={{
                                                fontWeight: "700",
                                                fontSize: "13px",
                                            }}
                                        >
                                            95%
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            textAlign: "right",
                                        }}
                                    >
                                        <small
                                            style={{
                                                color: colors.muted,
                                                fontSize: "11px",
                                            }}
                                        >
                                            Variance
                                        </small>

                                        <div
                                            style={{
                                                fontWeight: "700",
                                                fontSize: "13px",
                                                color: colors.red,
                                            }}
                                        >
                                            -9%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* =================================================
                        LEADING + LAGGING
                    ================================================== */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "0.7fr 1.3fr",
                            gap: "10px",
                            marginBottom: "12px",
                        }}
                    >
                        {/* LEADING */}

                        <section style={cardStyle}>
                            <h2 style={sectionTitleStyle}>
                                Leading Indicators
                            </h2>

                            <IndicatorBars
                                data={[
                                    ["Audits", 80],
                                    ["Train", 60],
                                    ["BBS", 92],
                                    ["HazID", 40],
                                ]}
                            />
                        </section>

                        {/* LAGGING */}

                        <section style={cardStyle}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <h2 style={sectionTitleStyle}>
                                    Lagging Indicators
                                </h2>

                                <div
                                    style={{
                                        fontSize: "10px",
                                        color: colors.muted,
                                    }}
                                >
                                    <span
                                        style={{
                                            color: "#c91f2c",
                                            marginRight: "5px",
                                        }}
                                    >
                                        ●
                                    </span>
                                    Incidents
                                    <span
                                        style={{
                                            color: "#64748b",
                                            marginLeft: "10px",
                                            marginRight: "5px",
                                        }}
                                    >
                                        ●
                                    </span>
                                    Near Misses
                                </div>
                            </div>

                            <div
                                style={{
                                    height: "150px",
                                    display: "flex",
                                    alignItems: "flex-end",
                                    gap: "15px",
                                    padding: "15px",
                                    boxSizing: "border-box",
                                }}
                            >
                                {[30, 45, 20, 5].map((height, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            flex: 1,
                                            height: `${height + 30}%`,
                                            backgroundColor: "#dfe4ea",
                                            position: "relative",
                                            cursor: "pointer",
                                        }}
                                        onClick={() =>
                                            alert(
                                                `Detail Lagging Indicator Q${
                                                    index + 1
                                                }`
                                            )
                                        }
                                    >
                                        <div
                                            style={{
                                                position: "absolute",
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                height: `${height}%`,
                                                backgroundColor: "#c91f2c",
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-around",
                                    fontSize: "11px",
                                    color: colors.muted,
                                }}
                            >
                                <span>Q1</span>
                                <span>Q2</span>
                                <span>Q3</span>
                                <span>Q4</span>
                            </div>
                        </section>
                    </div>

                    {/* =================================================
                        DATA TABLE
                    ================================================== */}

                    <section style={cardStyle}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "12px",
                            }}
                        >
                            <h2 style={sectionTitleStyle}>
                                Detailed HSE Data Logs
                            </h2>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "6px",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        alert(
                                            "Filter tabel menggunakan filter di bagian atas."
                                        )
                                    }
                                    style={tableButtonStyle}
                                >
                                    ☷
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        alert(
                                            `${filteredData.length} data ditemukan.`
                                        )
                                    }
                                    style={tableButtonStyle}
                                >
                                    ⌕
                                </button>
                            </div>
                        </div>

                        {/* TABLE */}

                        <div
                            style={{
                                overflowX: "auto",
                                border: `1px solid ${colors.border}`,
                                borderRadius: "4px",
                            }}
                        >
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: "13px",
                                    minWidth: "850px",
                                }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            backgroundColor: "#e9eef4",
                                            color: "#334155",
                                        }}
                                    >
                                        <th style={thStyle}>Date</th>
                                        <th style={thStyle}>Location</th>
                                        <th style={thStyle}>Event Type</th>
                                        <th style={thStyle}>Severity</th>
                                        <th style={thStyle}>
                                            Man Hours Imp.
                                        </th>
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentData.length > 0 ? (
                                        currentData.map((row, index) => (
                                            <tr
                                                key={`${row.date}-${index}`}
                                                style={{
                                                    borderTop: `1px solid ${colors.border}`,
                                                }}
                                            >
                                                <td style={tdStyle}>
                                                    {row.date}
                                                </td>

                                                <td style={tdStyle}>
                                                    {row.location}
                                                </td>

                                                <td style={tdStyle}>
                                                    {row.event}
                                                </td>

                                                <td style={tdStyle}>
                                                    <SeverityBadge
                                                        severity={
                                                            row.severity
                                                        }
                                                    />
                                                </td>

                                                <td
                                                    style={{
                                                        ...tdStyle,
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {row.manHours}
                                                </td>

                                                <td style={tdStyle}>
                                                    {row.status}
                                                </td>

                                                <td
                                                    style={{
                                                        ...tdStyle,
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedLog(row)
                                                        }
                                                        style={{
                                                            border: "none",
                                                            background:
                                                                "transparent",
                                                            cursor: "pointer",
                                                            fontSize: "15px",
                                                        }}
                                                        title="Lihat detail"
                                                    >
                                                        ◉
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                style={{
                                                    padding: "30px",
                                                    textAlign: "center",
                                                    color: colors.muted,
                                                }}
                                            >
                                                Tidak ada data.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: "10px",
                                fontSize: "11px",
                                color: colors.muted,
                            }}
                        >
                            <span>
                                Showing{" "}
                                {filteredData.length === 0
                                    ? 0
                                    : (currentPage - 1) * rowsPerPage + 1}{" "}
                                to{" "}
                                {Math.min(
                                    currentPage * rowsPerPage,
                                    filteredData.length
                                )}{" "}
                                of {filteredData.length} entries
                            </span>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "4px",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    disabled={currentPage === 1}
                                    style={paginationButtonStyle(
                                        currentPage === 1
                                    )}
                                >
                                    Prev
                                </button>

                                {Array.from(
                                    { length: totalPages },
                                    (_, index) => index + 1
                                ).map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        style={{
                                            ...paginationButtonStyle(false),
                                            backgroundColor:
                                                currentPage === page
                                                    ? colors.green
                                                    : "#ffffff",
                                            color:
                                                currentPage === page
                                                    ? "#ffffff"
                                                    : colors.text,
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={currentPage === totalPages}
                                    style={paginationButtonStyle(
                                        currentPage === totalPages
                                    )}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* EXPORT BUTTON */}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: "15px",
                        }}
                    >
                        <button
                            type="button"
                            onClick={handleExport}
                            style={{
                                backgroundColor: colors.green,
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "5px",
                                padding: "11px 20px",
                                fontSize: "13px",
                                fontWeight: "700",
                                cursor: "pointer",
                            }}
                        >
                            ↓ Export HSE Report
                        </button>
                    </div>
                </div>
            </main>

            {/* =====================================================
                DETAIL MODAL
            ====================================================== */}

            {selectedLog && (
                <div
                    onClick={() => setSelectedLog(null)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2000,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "430px",
                            backgroundColor: "#ffffff",
                            borderRadius: "8px",
                            padding: "25px",
                            boxSizing: "border-box",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <h2
                                style={{
                                    margin: 0,
                                    color: colors.green,
                                    fontSize: "22px",
                                }}
                            >
                                HSE Log Detail
                            </h2>

                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    fontSize: "20px",
                                    cursor: "pointer",
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div
                            style={{
                                marginTop: "20px",
                                display: "grid",
                                gap: "12px",
                            }}
                        >
                            <DetailRow
                                label="Date"
                                value={selectedLog.date}
                            />

                            <DetailRow
                                label="Location"
                                value={selectedLog.location}
                            />

                            <DetailRow
                                label="Event Type"
                                value={selectedLog.event}
                            />

                            <DetailRow
                                label="Severity"
                                value={selectedLog.severity}
                            />

                            <DetailRow
                                label="Man Hours Impact"
                                value={selectedLog.manHours}
                            />

                            <DetailRow
                                label="Status"
                                value={selectedLog.status}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => setSelectedLog(null)}
                            style={{
                                width: "100%",
                                marginTop: "20px",
                                padding: "11px",
                                border: "none",
                                borderRadius: "5px",
                                backgroundColor: colors.green,
                                color: "#ffffff",
                                fontWeight: "700",
                                cursor: "pointer",
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

// =============================================================
// MODERN CLASSIC: KPI CARD (HIJAU BOTOL & KUNING NEON)
// =============================================================

function KpiCard({ title, value, change, icon }) {
    return (
        <div
            style={{
                backgroundColor: "#ffffff",
                border: "1px solid #004d32",
                borderRadius: "14px",
                padding: "20px",
                minHeight: "105px",
                boxSizing: "border-box",
                boxShadow: "0 4px 18px rgba(0, 77, 50, 0.08)",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.2s, box-shadow 0.2s",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: "linear-gradient(90deg, #004d32 0%, #efff00 100%)",
                }}
            />

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <span
                    style={{
                        fontSize: "11px",
                        color: "#004d32",
                        textTransform: "uppercase",
                        fontWeight: "800",
                        letterSpacing: "0.06em",
                    }}
                >
                    {title}
                </span>

                <span
                    style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        backgroundColor: "#004d32",
                        border: "1px solid #efff00",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#efff00",
                        fontSize: "15px",
                        boxShadow: "0 0 8px rgba(239, 255, 0, 0.25)",
                    }}
                >
                    {icon}
                </span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "10px" }}>
                <div
                    style={{
                        fontSize: "26px",
                        fontWeight: "900",
                        color: "#003824",
                        letterSpacing: "-0.02em",
                    }}
                >
                    {value}
                </div>

                <div
                    style={{
                        fontSize: "11px",
                        fontWeight: "800",
                        padding: "2px 7px",
                        borderRadius: "999px",
                        backgroundColor: "#004d32",
                        color: "#efff00",
                        border: "1px solid #efff00",
                        boxShadow: "0 0 6px rgba(239, 255, 0, 0.25)",
                    }}
                >
                    ↗ {change}
                </div>
            </div>
        </div>
    );
}

// =============================================================
// MODERN CLASSIC: INDICATOR BARS
// =============================================================

function IndicatorBars({ data }) {
    return (
        <div
            style={{
                height: "170px",
                background: "#fcfdfc",
                borderRadius: "10px",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-around",
                gap: "10px",
                padding: "16px 14px 10px",
                boxSizing: "border-box",
                border: "1px solid #e2e8f0",
            }}
        >
            {data.map(([label, value]) => (
                <div
                    key={label}
                    style={{
                        height: "100%",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        cursor: "pointer",
                    }}
                    onClick={() =>
                        alert(`${label}: ${value}% achievement`)
                    }
                >
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "flex-end",
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: `${value}%`,
                                background: "linear-gradient(180deg, #efff00 0%, #004d32 100%)",
                                borderRadius: "4px 4px 0 0",
                                boxShadow: "0 0 8px rgba(239, 255, 0, 0.35)",
                                border: "1px solid #004d32",
                                transition: "height 0.3s ease",
                            }}
                        />
                    </div>

                    <span
                        style={{
                            marginTop: "8px",
                            fontSize: "11px",
                            fontWeight: "800",
                            color: "#004d32",
                        }}
                    >
                        {label}
                    </span>
                </div>
            ))}
        </div>
    );
}

// =============================================================
// MODERN SEVERITY BADGE
// =============================================================

function SeverityBadge({ severity }) {
    const styles = {
        High: {
            backgroundColor: "#7f1d1d",
            color: "#fecaca",
            border: "1px solid #ef4444",
            dot: "#ef4444",
        },
        Medium: {
            backgroundColor: "#78350f",
            color: "#fef3c7",
            border: "1px solid #f59e0b",
            dot: "#f59e0b",
        },
        Low: {
            backgroundColor: "#004d32",
            color: "#efff00",
            border: "1px solid #efff00",
            dot: "#efff00",
        },
        Info: {
            backgroundColor: "#f8fafc",
            color: "#475569",
            border: "1px solid #e2e8f0",
            dot: "#94a3b8",
        },
    };

    const current = styles[severity] || styles.Info;

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 9px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: "800",
                backgroundColor: current.backgroundColor,
                color: current.color,
                border: current.border,
                boxShadow: severity === "Low" ? "0 0 6px rgba(239, 255, 0, 0.3)" : "none",
            }}
        >
            <span
                style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: current.dot,
                    boxShadow: severity === "Low" ? "0 0 6px #efff00" : "none",
                }}
            />
            {severity}
        </span>
    );
}

// =============================================================
// DETAIL ROW
// =============================================================

function DetailRow({ label, value }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
                paddingBottom: "10px",
                borderBottom: "1px solid #f1f5f9",
            }}
        >
            <span
                style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: "600",
                }}
            >
                {label}
            </span>

            <strong
                style={{
                    fontSize: "13px",
                    color: "#004d32",
                    textAlign: "right",
                    fontWeight: "800",
                }}
            >
                {value}
            </strong>
        </div>
    );
}

// =============================================================
// STYLES
// =============================================================

const headerButtonStyle = {
    width: "36px",
    height: "36px",
    border: "1px solid #004d32",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#004d32",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

const labelStyle = {
    display: "block",
    marginBottom: "5px",
    fontSize: "11px",
    color: "#004d32",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
};

const sectionHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
};

const sectionTitleStyle = {
    margin: 0,
    fontSize: "16px",
    fontWeight: "800",
    color: "#004d32",
    letterSpacing: "-0.01em",
};

const moreButtonStyle = {
    border: "none",
    background: "transparent",
    fontSize: "18px",
    cursor: "pointer",
    color: "#004d32",
};

const tableButtonStyle = {
    width: "30px",
    height: "30px",
    border: "1px solid #004d32",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    color: "#004d32",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

const thStyle = {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "11.5px",
    fontWeight: "800",
    color: "#ffffff",
    backgroundColor: "#004d32",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "2px solid #efff00",
};

const tdStyle = {
    padding: "14px 16px",
    color: "#1e293b",
    whiteSpace: "nowrap",
    fontSize: "13px",
    fontWeight: "500",
};

const paginationButtonStyle = (disabled) => ({
    minWidth: "32px",
    height: "32px",
    padding: "0 8px",
    border: "1px solid #004d32",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: disabled ? "#cbd5e1" : "#004d32",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "12px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
});
