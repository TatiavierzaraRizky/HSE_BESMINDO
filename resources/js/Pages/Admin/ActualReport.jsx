import React, { useMemo, useState } from "react";
import AdminSidebar from "../../Components/AdminSidebar";
import { Link, usePage } from "@inertiajs/react";

/*
|--------------------------------------------------------------------------
| CONSTANT
|--------------------------------------------------------------------------
*/

const MONTHS = [
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
    "Dec",
];

/*
|--------------------------------------------------------------------------
| HELPER
|--------------------------------------------------------------------------
*/

function number(value) {
    const result = Number(value);
    return Number.isFinite(result) ? result : 0;
}

function formatNumber(value) {
    const n = number(value);

    if (Number.isInteger(n)) {
        return n.toLocaleString("id-ID");
    }

    return n.toLocaleString("id-ID", {
        maximumFractionDigits: 4,
    });
}

function formatDate(date) {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return date;
    }

    return value.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function getReportYear(report) {
    if (report?.year) {
        return Number(report.year);
    }

    if (report?.report_date) {
        const date = new Date(report.report_date);

        if (!Number.isNaN(date.getTime())) {
            return date.getFullYear();
        }
    }

    return new Date().getFullYear();
}

function getMonthFromReport(report) {
    if (report?.report_date) {
        const date = new Date(report.report_date);

        if (!Number.isNaN(date.getTime())) {
            return date.getMonth();
        }
    }

    return 0;
}

function quarter(values, q) {
    const start = q * 3;

    return values
        .slice(start, start + 3)
        .reduce(
            (total, value) =>
                total + number(value),
            0
        );
}

function normalizeReport(report) {
    return {
        ...report,

        manHours: Array.isArray(report.man_hours)
            ? report.man_hours
            : Array.isArray(report.manHours)
              ? report.manHours
              : report.man_hours ||
                report.manHours ||
                null,

        laggingIndicators:
            Array.isArray(
                report.lagging_indicators
            )
                ? report.lagging_indicators
                : Array.isArray(
                      report.laggingIndicators
                  )
                  ? report.laggingIndicators
                  : [],

        leadingIndicators:
            Array.isArray(
                report.leading_indicators
            )
                ? report.leading_indicators
                : Array.isArray(
                      report.leadingIndicators
                  )
                  ? report.leadingIndicators
                  : [],
    };
}

/*
|--------------------------------------------------------------------------
| MAIN
|--------------------------------------------------------------------------
*/

export default function ActualReport() {
    const { reports: rawReports = [] } =
        usePage().props;

    const reports = useMemo(() => {
        return Array.isArray(rawReports)
            ? rawReports.map(normalizeReport)
            : [];
    }, [rawReports]);

    /*
    |--------------------------------------------------------------------------
    | FILTER OPTIONS
    |--------------------------------------------------------------------------
    */

    const availableYears = useMemo(() => {
        return [
            ...new Set(
                reports.map((report) =>
                    getReportYear(report)
                )
            ),
        ].sort((a, b) => b - a);
    }, [reports]);

    const availableRigs = useMemo(() => {
        return [
            ...new Set(
                reports
                    .map(
                        (report) =>
                            report.rig_no
                    )
                    .filter(Boolean)
            ),
        ];
    }, [reports]);

    const availableProjects = useMemo(() => {
        return [
            ...new Set(
                reports
                    .map(
                        (report) =>
                            report.contract_no
                    )
                    .filter(Boolean)
            ),
        ];
    }, [reports]);

    const availableLocations = useMemo(() => {
        return [
            ...new Set(
                reports
                    .map(
                        (report) =>
                            report.location_district
                    )
                    .filter(Boolean)
            ),
        ];
    }, [reports]);

    const defaultYear =
        availableYears.length > 0
            ? String(availableYears[0])
            : String(
                  new Date().getFullYear()
              );

    const [year, setYear] =
        useState(defaultYear);

    const [rig, setRig] =
        useState("All Rigs");

    const [project, setProject] =
        useState("All Projects");

    const [location, setLocation] =
        useState("All Locations");

    /*
    |--------------------------------------------------------------------------
    | FILTERED REPORT
    |--------------------------------------------------------------------------
    */

    const filteredReports = useMemo(() => {
        let result = reports.filter(
            (report) =>
                String(
                    getReportYear(report)
                ) === String(year)
        );

        if (rig !== "All Rigs") {
            result = result.filter(
                (report) =>
                    report.rig_no === rig
            );
        }

        if (
            project !==
            "All Projects"
        ) {
            result = result.filter(
                (report) =>
                    report.contract_no ===
                    project
            );
        }

        if (
            location !==
            "All Locations"
        ) {
            result = result.filter(
                (report) =>
                    report.location_district ===
                    location
            );
        }

        return result.sort((a, b) => {
            const dateA = new Date(
                a.report_date ||
                    a.issued_date ||
                    0
            );

            const dateB = new Date(
                b.report_date ||
                    b.issued_date ||
                    0
            );

            return (
                dateA.getTime() -
                dateB.getTime()
            );
        });
    }, [
        reports,
        year,
        rig,
        project,
        location,
    ]);

    /*
    |--------------------------------------------------------------------------
    | BUILD ACTUAL INDICATORS
    |--------------------------------------------------------------------------
    */

    const buildIndicators = (
        type
    ) => {
        const map = new Map();

        filteredReports.forEach(
            (report) => {
                const indicators =
                    type === "lagging"
                        ? report.laggingIndicators ||
                          []
                        : report.leadingIndicators ||
                          [];

                indicators.forEach(
                    (item) => {
                        const name =
                            item.indicator_name ||
                            item.name ||
                            `Indicator ${
                                item.indicator_no ||
                                ""
                            }`;

                        const key =
                            name
                                .trim()
                                .toLowerCase();

                        if (
                            !map.has(key)
                        ) {
                            map.set(key, {
                                no:
                                    item.indicator_no ||
                                    map.size +
                                        1,

                                indicator:
                                    name,

                                definition:
                                    item.definition ||
                                    "-",

                                unit:
                                    item.unit ||
                                    (type ===
                                    "lagging"
                                        ? "Case"
                                        : "Activity"),

                                monthlyTarget:
                                    type ===
                                    "leading"
                                        ? number(
                                              item.target_month ??
                                                  item.targetMonth ??
                                                  0
                                          )
                                        : 0,

                                annualTarget:
                                    type ===
                                    "leading"
                                        ? number(
                                              item.target_year ??
                                                  item.targetYear ??
                                                  0
                                          )
                                        : 0,

                                values: Array(
                                    12
                                ).fill(0),
                            });
                        }

                        const row =
                            map.get(key);

                        let month;

                        const itemMonth =
                            Number(
                                item.month
                            );

                        if (
                            itemMonth >=
                                1 &&
                            itemMonth <=
                                12
                        ) {
                            month =
                                itemMonth -
                                1;
                        } else {
                            month =
                                getMonthFromReport(
                                    report
                                );
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | ACTUAL
                        |--------------------------------------------------------------------------
                        */

                        const actualValue =
                            number(
                                item.actual
                            );

                        row.values[
                            month
                        ] +=
                            actualValue;

                        if (
                            type ===
                                "leading" &&
                            item.target_month !==
                                undefined &&
                            item.target_month !==
                                null
                        ) {
                            row.monthlyTarget =
                                number(
                                    item.target_month
                                );
                        }

                        if (
                            type ===
                                "leading" &&
                            item.target_year !==
                                undefined &&
                            item.target_year !==
                                null
                        ) {
                            row.annualTarget =
                                number(
                                    item.target_year
                                );
                        }

                        if (
                            item.definition
                        ) {
                            row.definition =
                                item.definition;
                        }

                        if (item.unit) {
                            row.unit =
                                item.unit;
                        }
                    }
                );
            }
        );

        return Array.from(
            map.values()
        ).map(
            (item, index) => ({
                ...item,

                no: index + 1,

                annualTarget:
                    item.annualTarget ||
                    item.monthlyTarget *
                        12,

                q1: quarter(
                    item.values,
                    0
                ),

                q2: quarter(
                    item.values,
                    1
                ),

                q3: quarter(
                    item.values,
                    2
                ),

                q4: quarter(
                    item.values,
                    3
                ),

                ytd: item.values.reduce(
                    (
                        total,
                        value
                    ) =>
                        total +
                        number(value),
                    0
                ),
            })
        );
    };

    const lagging = useMemo(
        () =>
            buildIndicators(
                "lagging"
            ),
        [filteredReports]
    );

    const leading = useMemo(
        () =>
            buildIndicators(
                "leading"
            ),
        [filteredReports]
    );

    /*
    |--------------------------------------------------------------------------
    | MAN HOURS ACTUAL
    |--------------------------------------------------------------------------
    */

    const manHours = useMemo(() => {
        const values = Array(
            12
        ).fill(0);

        filteredReports.forEach(
            (report) => {
                const month =
                    getMonthFromReport(
                        report
                    );

                const data =
                    Array.isArray(
                        report.manHours
                    )
                        ? report
                              .manHours[0]
                        : report.manHours;

                if (!data) return;

                const actual =
                    number(
                        data.premises_actual
                    ) +
                    number(
                        data.non_premises_actual
                    );

                values[month] +=
                    actual;
            }
        );

        return {
            indicator:
                "Man Hours",

            definition:
                "Total jam kerja personel pada periode pelaporan.",

            unit: "Hours",

            values,

            q1: quarter(
                values,
                0
            ),

            q2: quarter(
                values,
                1
            ),

            q3: quarter(
                values,
                2
            ),

            q4: quarter(
                values,
                3
            ),

            ytd: values.reduce(
                (
                    total,
                    value
                ) =>
                    total +
                    number(value),
                0
            ),
        };
    }, [filteredReports]);

    /*
    |--------------------------------------------------------------------------
    | KILOMETER ACTUAL
    |--------------------------------------------------------------------------
    */

    const kilometer = useMemo(() => {
        const values = Array(
            12
        ).fill(0);

        filteredReports.forEach(
            (report) => {
                const month =
                    getMonthFromReport(
                        report
                    );

                const data =
                    Array.isArray(
                        report.manHours
                    )
                        ? report
                              .manHours[0]
                        : report.manHours;

                if (!data) return;

                const actual =
                    number(
                        data.kilometer_premises_actual
                    ) +
                    number(
                        data.kilometer_non_premises_actual
                    );

                values[month] +=
                    actual;
            }
        );

        return {
            indicator:
                "Kilometer Driven",

            definition:
                "Total jarak tempuh kendaraan operasional.",

            unit: "KM",

            values,

            q1: quarter(
                values,
                0
            ),

            q2: quarter(
                values,
                1
            ),

            q3: quarter(
                values,
                2
            ),

            q4: quarter(
                values,
                3
            ),

            ytd: values.reduce(
                (
                    total,
                    value
                ) =>
                    total +
                    number(value),
                0
            ),
        };
    }, [filteredReports]);

    /*
    |--------------------------------------------------------------------------
    | LATEST REPORT
    |--------------------------------------------------------------------------
    */

    const latestReport =
        filteredReports.length >
        0
            ? filteredReports[
                  filteredReports.length -
                      1
              ]
            : null;

    /*
    |--------------------------------------------------------------------------
    | RESET
    |--------------------------------------------------------------------------
    */

    const handleReset = () => {
        setYear(defaultYear);
        setRig("All Rigs");
        setProject(
            "All Projects"
        );
        setLocation(
            "All Locations"
        );
    };

    /*
    |--------------------------------------------------------------------------
    | STYLE
    |--------------------------------------------------------------------------
    */

    const selectStyle = {
        width: "100%",
        marginTop: "6px",
        padding: "11px",
        border: "1px solid #c9d8d1",
        borderRadius: "5px",
        backgroundColor: "#f7faf8",
        fontSize: "14px",
        boxSizing: "border-box",
    };

    const labelStyle = {
        color: "#36564A",
        fontSize: "13px",
        fontWeight: "600",
    };

    const thStyle = {
        padding: "9px",
        border: "1px solid #b7c4be",
        textAlign: "center",
        whiteSpace:
            "nowrap",
    };

    const tdStyle = {
        padding: "8px",
        border: "1px solid #d5dfda",
    };

    const tdCenter = {
        ...tdStyle,
        textAlign: "center",
    };

    /*
    |--------------------------------------------------------------------------
    | TABLE
    |--------------------------------------------------------------------------
    */

    const renderTable = (
        title,
        data
    ) => {
        return (
            <div
                style={{
                    marginTop:
                        "20px",
                    overflowX:
                        "auto",
                }}
            >
                <div
                    style={{
                        minWidth:
                            "1450px",
                        border:
                            "1px solid #b7c4be",
                    }}
                >
                    <div
                        style={{
                            backgroundColor:
                                "#075E45",
                            color:
                                "white",
                            padding:
                                "11px",
                            fontWeight:
                                "700",
                            fontSize:
                                "15px",
                        }}
                    >
                        {title}
                    </div>

                    <table
                        style={{
                            width:
                                "100%",
                            borderCollapse:
                                "collapse",
                            fontSize:
                                "12px",
                        }}
                    >
                        <thead>
                            <tr
                                style={{
                                    backgroundColor:
                                        "#EFFF00",
                                    color:
                                        "#064E3B",
                                }}
                            >
                                <th
                                    style={
                                        thStyle
                                    }
                                >
                                    No
                                </th>

                                <th
                                    style={
                                        thStyle
                                    }
                                >
                                    Point yang
                                    Diukur
                                </th>

                                <th
                                    style={
                                        thStyle
                                    }
                                >
                                    Definisi
                                </th>

                                <th
                                    style={
                                        thStyle
                                    }
                                >
                                    Target /
                                    Month
                                </th>

                                <th
                                    style={
                                        thStyle
                                    }
                                >
                                    Target /
                                    Year
                                </th>

                                <th
                                    style={
                                        thStyle
                                    }
                                >
                                    Unit
                                </th>

                                <th
                                    style={
                                        thStyle
                                    }
                                >
                                    Q1
                                </th>

                                <th
                                    style={
                                        thStyle
                                    }
                                >
                                    Q2
                                </th>

                                <th
                                    style={
                                        thStyle
                                    }
                                >
                                    Q3
                                </th>

                                <th
                                    style={
                                        thStyle
                                    }
                                >
                                    Q4
                                </th>

                                <th
                                    style={
                                        thStyle
                                    }
                                >
                                    YTD
                                </th>

                                {MONTHS.map(
                                    (
                                        month
                                    ) => (
                                        <th
                                            key={
                                                month
                                            }
                                            style={
                                                thStyle
                                            }
                                        >
                                            {
                                                month
                                            }
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {data.length >
                            0 ? (
                                data.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <tr
                                            key={`${item.indicator}-${index}`}
                                        >
                                            <td
                                                style={
                                                    tdCenter
                                                }
                                            >
                                                {index +
                                                    1}
                                            </td>

                                            <td
                                                style={{
                                                    ...tdStyle,
                                                    fontWeight:
                                                        "700",
                                                }}
                                            >
                                                {
                                                    item.indicator
                                                }
                                            </td>

                                            <td
                                                style={
                                                    tdStyle
                                                }
                                            >
                                                {
                                                    item.definition
                                                }
                                            </td>

                                            <td
                                                style={
                                                    tdCenter
                                                }
                                            >
                                                {formatNumber(
                                                    item.monthlyTarget
                                                )}
                                            </td>

                                            <td
                                                style={
                                                    tdCenter
                                                }
                                            >
                                                {formatNumber(
                                                    item.annualTarget
                                                )}
                                            </td>

                                            <td
                                                style={
                                                    tdCenter
                                                }
                                            >
                                                {
                                                    item.unit
                                                }
                                            </td>

                                            <td
                                                style={
                                                    tdCenter
                                                }
                                            >
                                                {formatNumber(
                                                    item.q1
                                                )}
                                            </td>

                                            <td
                                                style={
                                                    tdCenter
                                                }
                                            >
                                                {formatNumber(
                                                    item.q2
                                                )}
                                            </td>

                                            <td
                                                style={
                                                    tdCenter
                                                }
                                            >
                                                {formatNumber(
                                                    item.q3
                                                )}
                                            </td>

                                            <td
                                                style={
                                                    tdCenter
                                                }
                                            >
                                                {formatNumber(
                                                    item.q4
                                                )}
                                            </td>

                                            <td
                                                style={
                                                    tdCenter
                                                }
                                            >
                                                {formatNumber(
                                                    item.ytd
                                                )}
                                            </td>

                                            {item.values.map(
                                                (
                                                    value,
                                                    monthIndex
                                                ) => (
                                                    <td
                                                        key={
                                                            monthIndex
                                                        }
                                                        style={
                                                            tdCenter
                                                        }
                                                    >
                                                        {formatNumber(
                                                            value
                                                        )}
                                                    </td>
                                                )
                                            )}
                                        </tr>
                                    )
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan={
                                            24
                                        }
                                        style={{
                                            padding:
                                                "25px",
                                            textAlign:
                                                "center",
                                            color:
                                                "#61786D",
                                        }}
                                    >
                                        Belum ada
                                        data pada
                                        filter yang
                                        dipilih.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <div
            style={{
                minHeight:
                    "100vh",
                backgroundColor:
                    "#f3f7f4",
                fontFamily:
                    "Arial, sans-serif",
            }}
        >
            <AdminSidebar />

            <main
                style={{
                    marginLeft:
                        "260px",
                    minHeight:
                        "100vh",
                    padding:
                        "35px",
                    boxSizing:
                        "border-box",
                }}
            >
                {/* HEADER */}

                <div
                    style={{
                        backgroundColor:
                            "white",
                        padding:
                            "18px 24px",
                        borderRadius:
                            "8px",
                        border:
                            "1px solid #d9e2de",
                        marginBottom:
                            "18px",
                        display:
                            "flex",
                        justifyContent:
                            "space-between",
                        alignItems:
                            "center",
                    }}
                >
                    <div>
                        <h1
                            style={{
                                margin: 0,
                                color:
                                    "#064E3B",
                                fontSize:
                                    "28px",
                            }}
                        >
                            Actual Report
                        </h1>

                        <p
                            style={{
                                margin:
                                    "6px 0 0",
                                color:
                                    "#526B60",
                                fontSize:
                                    "14px",
                            }}
                        >
                            Report Actual HSE
                            satu tahun
                            penuh dengan
                            Quarter 1
                            sampai Quarter
                            4.
                        </p>
                    </div>

                    <Link
                        href="/admin/reports"
                        style={{
                            backgroundColor:
                                "#064E3B",
                            color:
                                "white",
                            padding:
                                "11px 17px",
                            borderRadius:
                                "6px",
                            textDecoration:
                                "none",
                            fontSize:
                                "14px",
                            fontWeight:
                                "700",
                        }}
                    >
                        ← Kembali
                    </Link>
                </div>

                {/* FILTER */}

                <section
                    style={{
                        backgroundColor:
                            "white",
                        border:
                            "1px solid #d9e2de",
                        borderRadius:
                            "8px",
                        padding:
                            "20px",
                    }}
                >
                    <h2
                        style={{
                            margin:
                                "0 0 18px",
                            color:
                                "#064E3B",
                            fontSize:
                                "20px",
                        }}
                    >
                        Filter Actual
                        Report
                    </h2>

                    <div
                        style={{
                            display:
                                "grid",
                            gridTemplateColumns:
                                "repeat(4, minmax(0, 1fr))",
                            gap: "14px",
                        }}
                    >
                        <label
                            style={
                                labelStyle
                            }
                        >
                            Year

                            <select
                                value={year}
                                onChange={(e) =>
                                    setYear(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                style={
                                    selectStyle
                                }
                            >
                                {availableYears.length >
                                0 ? (
                                    availableYears.map(
                                        (
                                            item
                                        ) => (
                                            <option
                                                key={
                                                    item
                                                }
                                                value={
                                                    item
                                                }
                                            >
                                                {
                                                    item
                                                }
                                            </option>
                                        )
                                    )
                                ) : (
                                    <option
                                        value={
                                            year
                                        }
                                    >
                                        {year}
                                    </option>
                                )}
                            </select>
                        </label>

                        <label
                            style={
                                labelStyle
                            }
                        >
                            Rig / Location

                            <select
                                value={rig}
                                onChange={(e) =>
                                    setRig(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                style={
                                    selectStyle
                                }
                            >
                                <option>
                                    All Rigs
                                </option>

                                {availableRigs.map(
                                    (
                                        item
                                    ) => (
                                        <option
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
                                        >
                                            {
                                                item
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </label>

                        <label
                            style={
                                labelStyle
                            }
                        >
                            Fokus Corp /
                            Project

                            <select
                                value={
                                    project
                                }
                                onChange={(
                                    e
                                ) =>
                                    setProject(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                style={
                                    selectStyle
                                }
                            >
                                <option value="All Projects">
                                    All Focus
                                    Corp /
                                    Projects
                                </option>

                                {availableProjects.map(
                                    (
                                        item
                                    ) => (
                                        <option
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
                                        >
                                            {
                                                item
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </label>

                        <label
                            style={
                                labelStyle
                            }
                        >
                            Lokasi /
                            Distrik

                            <select
                                value={
                                    location
                                }
                                onChange={(
                                    e
                                ) =>
                                    setLocation(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                style={
                                    selectStyle
                                }
                            >
                                <option>
                                    All
                                    Locations
                                </option>

                                {availableLocations.map(
                                    (
                                        item
                                    ) => (
                                        <option
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
                                        >
                                            {
                                                item
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </label>
                    </div>

                    <div
                        style={{
                            marginTop:
                                "18px",
                            display:
                                "flex",
                            justifyContent:
                                "flex-end",
                        }}
                    >
                        <button
                            onClick={
                                handleReset
                            }
                            style={{
                                backgroundColor:
                                    "white",
                                color:
                                    "#064E3B",
                                border:
                                    "1px solid #064E3B",
                                borderRadius:
                                    "6px",
                                padding:
                                    "11px 18px",
                                fontSize:
                                    "14px",
                                cursor:
                                    "pointer",
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </section>

                {/* INFO */}

                <div
                    style={{
                        marginTop:
                            "18px",
                        padding:
                            "13px 17px",
                        backgroundColor:
                            "#E8F7EF",
                        border:
                            "1px solid #B8DEC8",
                        borderRadius:
                            "6px",
                        color:
                            "#075E45",
                        fontSize:
                            "13px",
                    }}
                >
                    Menampilkan{" "}
                    <strong>
                        ACTUAL
                    </strong>{" "}
                    tahun {year}. Data
                    dibagi berdasarkan
                    Januari–Desember dan
                    Quarter 1–4.
                </div>

                {/* DOCUMENT INFO */}

                <section
                    style={{
                        marginTop:
                            "20px",
                        backgroundColor:
                            "white",
                        border:
                            "1px solid #d9e2de",
                        borderRadius:
                            "8px",
                        overflow:
                            "hidden",
                    }}
                >
                    <div
                        style={{
                            backgroundColor:
                                "#075E45",
                            color:
                                "white",
                            padding:
                                "12px",
                            textAlign:
                                "center",
                            fontWeight:
                                "700",
                            fontSize:
                                "18px",
                        }}
                    >
                        KEY PERFORMANCE
                        INDICATOR BMS#03A -
                        ACTUAL
                    </div>

                    <div
                        style={{
                            display:
                                "grid",
                            gridTemplateColumns:
                                "repeat(3, 1fr)",
                        }}
                    >
                        <div
                            style={{
                                padding:
                                    "11px",
                                backgroundColor:
                                    "#F5FFD0",
                                borderRight:
                                    "1px solid #b7c4be",
                            }}
                        >
                            <strong>
                                Tahun Periode
                            </strong>

                            <div>
                                : {year}
                            </div>
                        </div>

                        <div
                            style={{
                                padding:
                                    "11px",
                                backgroundColor:
                                    "#F5FFD0",
                                borderRight:
                                    "1px solid #b7c4be",
                            }}
                        >
                            <strong>
                                Tgl Diterbitkan
                            </strong>

                            <div>
                                :{" "}
                                {latestReport?.report_date
                                    ? formatDate(
                                          latestReport.report_date
                                      )
                                    : "-"}
                            </div>
                        </div>

                        <div
                            style={{
                                padding:
                                    "11px",
                                backgroundColor:
                                    "#F5FFD0",
                            }}
                        >
                            <strong>
                                Fokus Corp /
                                Project
                            </strong>

                            <div>
                                :{" "}
                                {latestReport?.contract_no ||
                                    "-"}
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            display:
                                "grid",
                            gridTemplateColumns:
                                "repeat(2, 1fr)",
                        }}
                    >
                        <div
                            style={{
                                padding:
                                    "11px",
                                borderTop:
                                    "1px solid #b7c4be",
                                borderRight:
                                    "1px solid #b7c4be",
                            }}
                        >
                            <strong>
                                Rig / Location
                            </strong>

                            <div>
                                : {rig}
                            </div>
                        </div>

                        <div
                            style={{
                                padding:
                                    "11px",
                                borderTop:
                                    "1px solid #b7c4be",
                            }}
                        >
                            <strong>
                                Lokasi /
                                Distrik
                            </strong>

                            <div>
                                :{" "}
                                {latestReport?.location_district ||
                                    "-"}
                            </div>
                        </div>
                    </div>
                </section>

                {/* TABLES */}

                {renderTable(
                    "LAGGING INDICATOR - ACTUAL",
                    [
                        ...lagging,
                        ...(filteredReports.length >
                        0
                            ? [
                                  manHours,
                                  kilometer,
                              ]
                            : []),
                    ]
                )}

                {renderTable(
                    "LEADING INDICATOR - ACTUAL",
                    leading
                )}
            </main>
        </div>
    );
}