import AdminSidebar from "../../Components/AdminSidebar";
import { useMemo, useState } from "react";

const MONTHS = [
    { value: "01", label: "Jan-26" },
    { value: "02", label: "Feb-26" },
    { value: "03", label: "Mar-26" },
    { value: "04", label: "Apr-26" },
    { value: "05", label: "May-26" },
    { value: "06", label: "Jun-26" },
    { value: "07", label: "Jul-26" },
    { value: "08", label: "Aug-26" },
    { value: "09", label: "Sep-26" },
    { value: "10", label: "Oct-26" },
    { value: "11", label: "Nov-26" },
    { value: "12", label: "Dec-26" },
];

const LAGGING_INDICATORS = [
    "FATALITY",
    "SERIOUS LOST TIME INJURY (>21 LOST DAY)",
    "RESTRICTED WORK CASE",
    "MEDICAL TREATMENT CASE (MTC)",
    "TOTAL RECORDABLE INJURY",
    "MOTOR VEHICLE CRASH (MVC)",
    "TUMPAHAN / OIL SPILL",
    "FIRE",
    "PROPERTY DAMAGE",
    "SECURITY CASE",
    "ILLNESS FATALITY",
    "REPORTABLE CASE",
];

const LEADING_INDICATORS = [
    "OBSERVASI PERILAKU (PEKA)",
    "IDENTIFIKASI BAHAYA (HAZID / 5M NTRISK ASSESSMENT)",
    "SWA REPORT",
    "INSPEKSI SAFETY EQUIPMENT & APD",
    "EKSTERNAL INSPEKSI LR COLOR CODE",
    "INSPEKSI BENDA JATUH / DROPS",
    "INTERNAL INSPEKSI / V&V OLEH TEAM",
    "INSPEKSI / AUDIT SMK3L: PERALATAN, DATA PERSONAL MILIK SUBKONTRAKTOR",
    "SPOT CHECK KENDARAAN",
    "AUDIT INTERNAL & EKSTERNAL",
    "MONITORING KEPATUHAN PENGEMUDI",
    "LAPORAN INSPEKSI KENDARAAN (PTI)",
    "SPESIFIK MCU RANDOM",
    "PRA MCU",
    "TOP MANAGEMENT VISIT / MWT",
    "MANAGEMENT VISIT / MWT",
    "RAPAT RUTIN KESELAMATAN (TGM PER SHIFT/PJM)",
    "PRE HITCH MEETING",
    "RAPAT/FORUM BERSAMA LEADER BMS DAN PHR",
    "SAFETY TALK MONTHLY MEETING",
    "LEADERSHIP FORUM",
    "KAMPANYE KESELAMATAN",
    "REVIEW, TINJAUAN MANAJEMEN",
    "HYGIENE MONITORING: NOISE & LUX MONITORING",
    "HYGIENE MONITORING: MESS, CATERING, DAMP",
    "INSPEKSI HOUSEKEEPING RIG",
    "PENGHARGAAN: KONTES HOUSEKEEPING RIG",
    "PELAPORAN LINGKUNGAN KE DINAS LH",
    "PENGHARGAAN: RIG OF THE MONTH INTERNAL / EXTERNAL",
    "PENGHARGAAN THE BEST BBS / PEKA",
    "PENGHARGAAN THE BEST DRIVER",
    "PENGHARGAAN: PENCAPAIAN KERJA SELAMAT TAHUNAN",
    "PENGHARGAAN HES REFRESHING",
    "ON SITE TRAINING / DI LOKASI",
    "ERP DRILL RIG",
];

const INITIAL_FORM = {
    date: "",
    contractNo: "",
    rigNo: "",
    locationDistrict: "",
    period: "",

    // =========================
    // MAN HOURS
    // =========================
    manHoursPremisesPlan: 0,
    manHoursNonPremisesPlan: 0,
    manHoursPremisesActual: 0,
    manHoursNonPremisesActual: 0,

    // =========================
    // EXPOSURE
    // =========================
    employees: 0,
    totalVehicles: 0,

    // =========================
    // KILOMETER
    // =========================
    kilometerPremisesPlan: 0,
    kilometerNonPremisesPlan: 0,
    kilometerPremisesActual: 0,
    kilometerNonPremisesActual: 0,

    lagging: {},
    leading: {},
    remarks: "",
};

function createIndicatorValues(names) {
    return names.reduce((result, name) => {
        result[name] = {
            actual: 0,
            plan: 0,
        };
        return result;
    }, {});
}

const DEFAULT_LAGGING = createIndicatorValues(LAGGING_INDICATORS);
const DEFAULT_LEADING = createIndicatorValues(LEADING_INDICATORS);

export default function InputData() {
    const [form, setForm] = useState({
        ...INITIAL_FORM,
        lagging: DEFAULT_LAGGING,
        leading: DEFAULT_LEADING,
    });

    const selectedMonthLabel = useMemo(() => {
        const month = MONTHS.find((item) => item.value === form.period);

        return month ? month.label : "Bulan belum dipilih";
    }, [form.period]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleIndicatorChange = (type, indicator, field, value) => {
        setForm((previous) => ({
            ...previous,
            [type]: {
                ...previous[type],
                [indicator]: {
                    ...previous[type][indicator],
                    [field]: value,
                },
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // ==========================================
            // UBAH DATA REACT MENJADI DATA YANG
            // SESUAI DENGAN CONTROLLER LARAVEL
            // ==========================================

            const payload = {
                // =========================
                // IDENTIFICATION
                // =========================

                date: form.date,

                // Contract No
                contractNo: form.contractNo,

                // Rig
                rigNo: form.rigNo,

                // Location / Daerah
                locationDistrict: form.locationDistrict,

                // Periode
                period: form.period,

                // =========================
                // MAN HOURS
                // =========================

                manHoursPremisesPlan: Number(form.manHoursPremisesPlan) || 0,

                manHoursNonPremisesPlan:
                    Number(form.manHoursNonPremisesPlan) || 0,

                manHoursPremisesActual:
                    Number(form.manHoursPremisesActual) || 0,

                manHoursNonPremisesActual:
                    Number(form.manHoursNonPremisesActual) || 0,

                // =========================
                // EXPOSURE
                // =========================

                totalEmployees: Number(form.employees) || 0,

                totalVehicles: Number(form.totalVehicles) || 0,

                // =========================
                // KM DRIVEN
                // =========================

                kilometerPremisesPlan: Number(form.kilometerPremisesPlan) || 0,

                kilometerNonPremisesPlan:
                    Number(form.kilometerNonPremisesPlan) || 0,

                kilometerPremisesActual:
                    Number(form.kilometerPremisesActual) || 0,

                kilometerNonPremisesActual:
                    Number(form.kilometerNonPremisesActual) || 0,

                // =========================
                // LAGGING
                // =========================

                lagging: Object.entries(form.lagging).map(
                    ([name, values], index) => ({
                        name: name,
                        indicator_name: name,
                        indicator_no: index + 1,

                        plan: Number(values.plan) || 0,

                        actual: Number(values.actual) || 0,
                    }),
                ),

                // =========================
                // LEADING
                // =========================

                leading: Object.entries(form.leading).map(
                    ([name, values], index) => ({
                        name: name,
                        indicator_name: name,
                        indicator_no: index + 1,

                        plan: Number(values.plan) || 0,

                        actual: Number(values.actual) || 0,
                    }),
                ),

                // =========================
                // REMARKS
                // =========================

                remarks: form.remarks,
            };

            console.log("DATA YANG DIKIRIM:", payload);

            // ==========================================
            // CSRF TOKEN
            // ==========================================

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            if (!csrfToken) {
                alert("CSRF token tidak ditemukan. Silakan cek app.blade.php.");
                return;
            }

            // ==========================================
            // KIRIM KE LARAVEL
            // ==========================================

            const response = await fetch("/admin/hse-report", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                    "X-Requested-With": "XMLHttpRequest",
                },

                credentials: "same-origin",

                body: JSON.stringify(payload),
            });

            const result = await response.json();

            console.log("RESPONSE SERVER:", result);

            // ==========================================
            // JIKA GAGAL
            // ==========================================

            if (!response.ok) {
                console.error("ERROR SERVER:", result);

                if (result.errors) {
                    console.error("VALIDATION ERRORS:", result.errors);
                }

                alert(result.message || "Data HSE gagal disimpan.");

                return;
            }

            // ==========================================
            // JIKA BERHASIL
            // ==========================================

            alert(
                `Data HSE ${selectedMonthLabel} berhasil disimpan ke database.`,
            );

            console.log("REPORT BERHASIL DISIMPAN:", result.data);
        } catch (error) {
            console.error("ERROR SUBMIT HSE:", error);

            alert(
                "Terjadi kesalahan saat menyimpan data HSE. Silakan cek Console.",
            );
        }
    };

    const handleReset = () => {
        setForm({
            ...INITIAL_FORM,
            lagging: createIndicatorValues(LAGGING_INDICATORS),
            leading: createIndicatorValues(LEADING_INDICATORS),
        });
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f4f7f9",
                fontFamily: "Arial, Helvetica, sans-serif",
                color: "#12342b",
            }}
        >
            <AdminSidebar />

            <main
                style={{
                    marginLeft: "260px",
                    minHeight: "100vh",
                }}
            >
                <header
                    style={{
                        height: "64px",
                        backgroundColor: "#ffffff",
                        borderBottom: "1px solid #d9e2de",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 28px",
                    }}
                >
                    <strong
                        style={{
                            fontSize: "25px",
                            color: "#004f3d",
                        }}
                    >
                        RigOps HSE Manager
                    </strong>

                    <div
                        style={{
                            fontSize: "15px",
                            color: "#60716b",
                        }}
                    >
                        Input Data HSE
                    </div>
                </header>

                <div
                    style={{
                        padding: "25px 30px 50px",
                    }}
                >
                    <div
                        style={{
                            marginBottom: "22px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "15px",
                                color: "#71807a",
                                marginBottom: "10px",
                            }}
                        >
                            ▣ &nbsp; Input Data HSE (Admin)
                        </div>

                        <h1
                            style={{
                                margin: 0,
                                fontSize: "32px",
                                color: "#111827",
                            }}
                        >
                            Input HSE Data
                        </h1>

                        <p
                            style={{
                                marginTop: "7px",
                                color: "#60716b",
                                fontSize: "15px",
                            }}
                        >
                            Masukkan data HSE berdasarkan periode dan KPI pada
                            dokumen KPI.
                        </p>
                    </div>

                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #d4ded9",
                            borderRadius: "7px",
                            padding: "18px 25px",
                            marginBottom: "20px",
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "20px",
                        }}
                    >
                        <Step number="1" title="Draft" active />

                        <Step number="2" title="Validation" />

                        <Step number="3" title="Approved" />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Section title="Identification">
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(4, 1fr)",
                                    gap: "14px",
                                }}
                            >
                                <InputField
                                    label="Date"
                                    name="date"
                                    type="date"
                                    required
                                    value={form.date}
                                    onChange={handleChange}
                                />

                                <InputField
                                    label="Contract No"
                                    name="contractNo"
                                    placeholder="Contoh: SPHR01097C"
                                    value={form.contractNo}
                                    onChange={handleChange}
                                />

                                <InputField
                                    label="Location / Daerah"
                                    name="locationDistrict"
                                    placeholder="Contoh: AREA WK ROKAN - RIAU"
                                    value={form.locationDistrict}
                                    onChange={handleChange}
                                    required
                                />

                                <SelectField
                                    label="Rig No"
                                    name="rigNo"
                                    value={form.rigNo}
                                    onChange={handleChange}
                                    options={[
                                        "Rig-01",
                                        "Rig-02",
                                        "Rig-03",
                                        "Rig-04",
                                    ]}
                                />

                                <SelectField
                                    label="Periode Kinerja"
                                    name="period"
                                    value={form.period}
                                    onChange={handleChange}
                                    options={MONTHS.map((month) => month.value)}
                                    optionLabels={MONTHS.reduce(
                                        (result, month) => {
                                            result[month.value] = month.label;
                                            return result;
                                        },
                                        {},
                                    )}
                                    required
                                />
                            </div>
                        </Section>

                        <Section title="Exposure Metrics">
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(4, 1fr)",
                                    gap: "14px",
                                }}
                            >
                                {/* =========================
            MAN HOURS PLAN
        ========================= */}

                                <NumberField
                                    label="Man Hours Premises - Plan"
                                    name="manHoursPremisesPlan"
                                    value={form.manHoursPremisesPlan}
                                    onChange={handleChange}
                                    required
                                />

                                <NumberField
                                    label="Man Hours Non-Premises - Plan"
                                    name="manHoursNonPremisesPlan"
                                    value={form.manHoursNonPremisesPlan}
                                    onChange={handleChange}
                                    required
                                />

                                {/* =========================
            MAN HOURS ACTUAL
        ========================= */}

                                <NumberField
                                    label="Man Hours Premises - Actual"
                                    name="manHoursPremisesActual"
                                    value={form.manHoursPremisesActual}
                                    onChange={handleChange}
                                    required
                                />

                                <NumberField
                                    label="Man Hours Non-Premises - Actual"
                                    name="manHoursNonPremisesActual"
                                    value={form.manHoursNonPremisesActual}
                                    onChange={handleChange}
                                    required
                                />

                                {/* =========================
            EMPLOYEE & VEHICLE
        ========================= */}

                                <NumberField
                                    label="Total Employees"
                                    name="employees"
                                    value={form.employees}
                                    onChange={handleChange}
                                    required
                                />

                                <NumberField
                                    label="Total Vehicles"
                                    name="totalVehicles"
                                    value={form.totalVehicles}
                                    onChange={handleChange}
                                    required
                                />

                                {/* =========================
            KM DRIVEN PLAN
        ========================= */}

                                <NumberField
                                    label="KM Driven Premises - Plan"
                                    name="kilometerPremisesPlan"
                                    value={form.kilometerPremisesPlan}
                                    onChange={handleChange}
                                />

                                <NumberField
                                    label="KM Driven Non-Premises - Plan"
                                    name="kilometerNonPremisesPlan"
                                    value={form.kilometerNonPremisesPlan}
                                    onChange={handleChange}
                                />

                                {/* =========================
            KM DRIVEN ACTUAL
        ========================= */}

                                <NumberField
                                    label="KM Driven Premises - Actual"
                                    name="kilometerPremisesActual"
                                    value={form.kilometerPremisesActual}
                                    onChange={handleChange}
                                />

                                <NumberField
                                    label="KM Driven Non-Premises - Actual"
                                    name="kilometerNonPremisesActual"
                                    value={form.kilometerNonPremisesActual}
                                    onChange={handleChange}
                                />
                            </div>
                        </Section>

                        <IndicatorSection
                            title="⚠ Lagging Indicators"
                            type="lagging"
                            indicators={LAGGING_INDICATORS}
                            values={form.lagging}
                            onChange={handleIndicatorChange}
                        />

                        <IndicatorSection
                            title="↗ Leading Indicators"
                            type="leading"
                            indicators={LEADING_INDICATORS}
                            values={form.leading}
                            onChange={handleIndicatorChange}
                        />

                        <Section title="Documentation">
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    marginBottom: "7px",
                                    color: "#3f514b",
                                }}
                            >
                                Remarks / Executive Summary
                            </label>

                            <textarea
                                name="remarks"
                                value={form.remarks}
                                onChange={handleChange}
                                placeholder="Enter key notes or context for this period's data..."
                                rows={5}
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    border: "1px solid #ccd8d3",
                                    borderRadius: "5px",
                                    padding: "12px",
                                    resize: "vertical",
                                    outline: "none",
                                    fontFamily: "Arial",
                                    fontSize: "15px",
                                }}
                            />
                        </Section>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "10px",
                                marginTop: "20px",
                            }}
                        >
                            <button
                                type="button"
                                onClick={handleReset}
                                style={{
                                    padding: "11px 22px",
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #cbd7d2",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    color: "#395149",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                }}
                            >
                                Reset
                            </button>

                            <button
                                type="submit"
                                style={{
                                    padding: "11px 25px",
                                    backgroundColor: "#005b45",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                }}
                            >
                                Save HSE Data
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

/* =========================
   INDICATOR SECTION
========================= */

function IndicatorSection({ title, type, indicators, values, onChange }) {
    return (
        <Section title={title}>
            <div
                style={{
                    overflowX: "auto",
                    border: "1px solid #dbe4e0",
                    borderRadius: "6px",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: "850px",
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                backgroundColor: "#005b45",
                                color: "#ffffff",
                            }}
                        >
                            <th style={tableHeaderStyle}>No</th>

                            <th
                                style={{
                                    ...tableHeaderStyle,
                                    textAlign: "left",
                                    minWidth: "390px",
                                }}
                            >
                                Point yang Diukur
                            </th>

                            <th style={tableHeaderStyle}>Plan</th>

                            <th style={tableHeaderStyle}>Actual</th>
                        </tr>
                    </thead>

                    <tbody>
                        {indicators.map((indicator, index) => {
                            const value = values[indicator] || {
                                actual: 0,
                                plan: 0,
                            };

                            return (
                                <tr key={indicator}>
                                    <td style={tableCellStyle}>{index + 1}</td>

                                    <td
                                        style={{
                                            ...tableCellStyle,
                                            textAlign: "left",
                                            fontWeight: "600",
                                        }}
                                    >
                                        {indicator}
                                    </td>

                                    <td style={tableCellStyle}>
                                        <NumberTableField
                                            value={value.plan}
                                            onChange={(event) =>
                                                onChange(
                                                    type,
                                                    indicator,
                                                    "plan",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </td>

                                    <td style={tableCellStyle}>
                                        <NumberTableField
                                            value={value.actual}
                                            onChange={(event) =>
                                                onChange(
                                                    type,
                                                    indicator,
                                                    "actual",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <p
                style={{
                    margin: "10px 0 0",
                    fontSize: "12px",
                    color: "#71807a",
                }}
            >
                Isi nilai <strong>Plan</strong> sesuai target implementasi pada
                dokumen KPI, lalu isi <strong>Actual</strong> sesuai realisasi
                bulan yang dipilih.
            </p>
        </Section>
    );
}

/* =========================
   STEP
========================= */

function Step({ number, title, active }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
            }}
        >
            <div
                style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: active ? "#005b45" : "#e4e9e7",
                    color: active ? "white" : "#53635d",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "14px",
                }}
            >
                {number}
            </div>

            <div>
                <div
                    style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#52645e",
                        textTransform: "uppercase",
                    }}
                >
                    {title}
                </div>
            </div>
        </div>
    );
}

/* =========================
   SECTION
========================= */

function Section({ title, children }) {
    return (
        <section
            style={{
                backgroundColor: "#ffffff",
                border: "1px solid #d4ded9",
                borderRadius: "7px",
                padding: "18px",
                marginBottom: "14px",
            }}
        >
            <h2
                style={{
                    margin: "0 0 15px",
                    paddingBottom: "10px",
                    borderBottom: "1px solid #e3e9e6",
                    fontSize: "19px",
                    color: "#12342b",
                }}
            >
                {title}
            </h2>

            {children}
        </section>
    );
}

/* =========================
   INPUT
========================= */

function InputField({
    label,
    name,
    type = "text",
    placeholder,
    value,
    onChange,
    required,
}) {
    return (
        <div>
            <label
                style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "7px",
                    color: "#53645d",
                }}
            >
                {label}

                {required && (
                    <span
                        style={{
                            color: "#dc2626",
                            marginLeft: "3px",
                        }}
                    >
                        *
                    </span>
                )}
            </label>

            <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                style={{
                    width: "100%",
                    height: "38px",
                    boxSizing: "border-box",
                    border: "1px solid #ccd8d3",
                    borderRadius: "5px",
                    padding: "0 10px",
                    outline: "none",
                    backgroundColor: "#f8fafb",
                    fontSize: "14px",
                    color: "#263b34",
                }}
            />
        </div>
    );
}

/* =========================
   NUMBER
========================= */

function NumberField({ label, name, value, onChange, required }) {
    return (
        <div>
            <label
                style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "7px",
                    color: "#3f514b",
                }}
            >
                {label}

                {required && (
                    <span
                        style={{
                            color: "#dc2626",
                            marginLeft: "3px",
                        }}
                    >
                        *
                    </span>
                )}
            </label>

            <input
                type="number"
                min="0"
                step="any"
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                style={{
                    width: "100%",
                    height: "36px",
                    boxSizing: "border-box",
                    border: "1px solid #ccd8d3",
                    borderRadius: "4px",
                    padding: "0 10px",
                    outline: "none",
                    backgroundColor: "#f8fafb",
                    textAlign: "right",
                    fontSize: "14px",
                    color: "#263b34",
                }}
            />
        </div>
    );
}

/* =========================
   NUMBER TABLE
========================= */

function NumberTableField({ value, onChange }) {
    return (
        <input
            type="number"
            min="0"
            step="any"
            value={value}
            onChange={onChange}
            style={{
                width: "100%",
                minWidth: "90px",
                height: "32px",
                boxSizing: "border-box",
                border: "1px solid #ccd8d3",
                borderRadius: "4px",
                padding: "0 8px",
                outline: "none",
                backgroundColor: "#f8fafb",
                textAlign: "right",
                fontSize: "13px",
                color: "#263b34",
            }}
        />
    );
}

/* =========================
   SELECT
========================= */

function SelectField({
    label,
    name,
    value,
    onChange,
    options,
    optionLabels = {},
    required,
}) {
    return (
        <div>
            <label
                style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "7px",
                    color: "#53645d",
                }}
            >
                {label}

                {required && (
                    <span
                        style={{
                            color: "#dc2626",
                            marginLeft: "3px",
                        }}
                    >
                        *
                    </span>
                )}
            </label>

            <select
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                style={{
                    width: "100%",
                    height: "38px",
                    boxSizing: "border-box",
                    border: "1px solid #ccd8d3",
                    borderRadius: "5px",
                    padding: "0 10px",
                    outline: "none",
                    backgroundColor: "#f8fafb",
                    fontSize: "14px",
                    color: "#263b34",
                }}
            >
                <option value="">
                    {name === "period" ? "Pilih Periode" : "Select Rig"}
                </option>

                {options.map((option) => (
                    <option key={option} value={option}>
                        {optionLabels[option] || option}
                    </option>
                ))}
            </select>
        </div>
    );
}

/* =========================
   TABLE STYLE
========================= */

const tableHeaderStyle = {
    padding: "10px 8px",
    border: "1px solid rgba(255,255,255,0.2)",
    fontSize: "13px",
    textAlign: "center",
};

const tableCellStyle = {
    padding: "7px 8px",
    border: "1px solid #dbe4e0",
    fontSize: "13px",
    textAlign: "center",
    color: "#263b34",
};
