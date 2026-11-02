import UserSidebar from "../../Components/UserSidebar";
import React, { useMemo, useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { calcTRI } from "../../Utils/hseCalculations";
import {
    ALL_AREAS,
    ALL_HSE_COORDS,
    ALL_CONTRACTS,
    ALL_RIG_NAMES,
    INDIVIDUAL_PICS,
    ALL_INDIVIDUAL_PICS,
    AREA_CONFIG,
    RIG_CONTRACT_MASTER,
    getHseCoordByArea,
    getAreaByHseCoord,
    getPicsByArea,
    getDefaultPicByArea,
    getRigGroupsByArea,
    findRigInfo,
} from "../../Utils/rigContracts";
import {
    ClipboardList,
    CheckCircle2,
    RotateCcw,
    ShieldAlert,
    TrendingUp,
    Info,
    Calendar,
    FileSpreadsheet,
    User,
    ShieldCheck,
    MapPin,
    Layers,
    Upload,
    FileText,
} from "lucide-react";

const MONTHS = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
];

const CURRENT_YEAR = 2027;
const YEARS = Array.from({ length: 10 }, (_, i) => String(2027 + i));

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
    "OBSERVASI PERILAKU (PEKA) *)",
    "IDENTIFIKASI BAHAYA (HAZID/ 5 MNT RISK ASSESSMENT)",
    "SWA REPORT",
    "INSPEKSI SAFETY EQUIPMENT & APD *) (Eye wash, Shower, Fire, P3K, Tandu, FBH, SCBA)",
    "EKSTERNAL INSPEKSI LR COLOR CODE",
    "INSPEKSI BENDA JATUH / DROPS **)",
    "INTERNAL INSPEKSI / V&V OLEH TEAM",
    "INSPEKSI / AUDIT SMK3L: PERALATAN, DATA PERSONAL MILIK SUBKONTRAKTOR",
    "SPOT CHECK KENDARAAN *) **)",
    "AUDIT INTERNAL & EKSTERNAL (Sistem manajemen *)",
    "MONITORING KEPATUHAN PENGEMUDI (Mencakup speed / IVMS report / fatigue *)",
    "Laporan Inspeksi Kendaraan (PTI)",
    "SPESIFIK MCU RANDOM : NAPZA & MIRAS TEST *)",
    "Medical Check Up : 1. Pra Pekerjaan (Karyawan Baru)",
    "Medical Check Up : 2. Periodik (Tahunan)",
    "Medical Check Up : 3. Pra MCU (histori konsul pada tahun sebelumnya)",
    "TOP MANAGEMENT VISIT / MWT (Level General Manager / Dir. Operasi / Direktur Utama ***)",
    "MANAGEMENT VISIT / MWT (Level Coord level s/d Manager *)",
    "RAPAT RUTIN KESELAMATAN (TGM PER SHIFT/PJM)",
    "PRE HITCH MEETING",
    "RAPAT/FORUM BERSAMA LEADER BMS DAN PHR.",
    "SAFETY TALK MONTHLY MEETING : 20.1 SUPPORT YARD",
    "SAFETY TALK MONTHLY MEETING : 20.2 SUPPORT RIG",
    "LEADERSHIP FORUM ***)",
    "KAMPANYE KESELAMATAN (PIN/POSTER/STIKER/ SPANDUK) *)",
    "REVIEW, TINJAUAN MANAJEMEN *)",
    "HYGIENE MONITORING : NOISE & LUX MONITORING **)",
    "HYGIENE MONITORING : Mess, Catering, DAM*)",
    "INSPEKSI \"HOUSEKEEPING RIG\"",
    "PENGHARGAAN: KONTES \"HOUSEKEEPING RIG\" *)",
    "PELAPORAN LINGKUNGAN KE DINAS LH",
    "PENGHARGAAN: RIG OF THE MONTH INTERNAL / EXTERNAL **)",
    "PENGHARGAAN THE BEST BBS / PEKA",
    "PENGHARGAAN THE BEST DRIVER",
    "PENGHARGAAN: PENCAPAIAN KERJA SELAMAT TAHUNAN",
    "PENGHARGAAN HES REFRESHING",
    "\"ON SITE TRAINING\" DI LOKASI *)",
    "ERP DRILL RIG : H2S&SCBA / FIRE / MEDIVAC/ PENYELAMATAN KERJA DI KETINGGIAN / TUMPAHAN. **)",
    "ERP DRILL YARD : FIRE / MEDIVAC / TUMPAHAN *)",
];

const initialMo = "01";
const initialYr = String(CURRENT_YEAR);

const INITIAL_FORM = {
    date: `${initialYr}-${initialMo}-01`,
    contractNo: "SPHR01095C",
    rigNo: "BMS # 02, BMS # 03, BMS # 08",
    locationDistrict: "South",
    period: initialMo,
    year: initialYr,
    submitterName: "Teddy",
    submitterEmail: "teddy@besmindo.com",

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

const DEFAULT_LAGGING_DEFINITIONS = {
    "FATALITY": "",
    "SERIOUS LOST TIME INJURY (>21 LOST DAY)": "",
    "RESTRICTED WORK CASE": "",
    "MEDICAL TREATMENT CASE (MTC)": "",
    "TOTAL RECORDABLE INJURY": "Frequency rate = (kasus cedera × 200.000) / Jam Kerja",
    "MOTOR VEHICLE CRASH (MVC)": "MVC FR = (kasus × 1.000.000) / KM perjalanan",
    "TUMPAHAN / OIL SPILL": "Record case > 1 barrel",
    "FIRE": "Record case > Rp. 100 Jt",
    "PROPERTY DAMAGE": "Record case > Rp. 100 Jt",
    "SECURITY CASE": "Record case",
    "ILLNESS FATALITY": "Record case",
    "REPORTABLE CASE": "Reportable case (Nearmiss / FAC / ETA)",
};

const DEFAULT_LEADING_DEFINITIONS = {
    "OBSERVASI PERILAKU (PEKA) *)": "Kru Operasi (Min 4x / bulan)",
    "IDENTIFIKASI BAHAYA (HAZID/ 5 MNT RISK ASSESSMENT)": "Kru Operasi",
    "SWA REPORT": "Stop Work Authority",
    "INSPEKSI SAFETY EQUIPMENT & APD *) (Eye wash, Shower, Fire, P3K, Tandu, FBH, SCBA)": "Inspeksi APD & Peralatan Keselamatan",
    "EKSTERNAL INSPEKSI LR COLOR CODE": "Inspeksi Color Code",
    "INSPEKSI BENDA JATUH / DROPS **)": "Inspeksi Benda Jatuh",
    "INTERNAL INSPEKSI / V&V OLEH TEAM": "Mencakup pelaksanaan V&V SIFP's",
    "INSPEKSI / AUDIT SMK3L: PERALATAN, DATA PERSONAL MILIK SUBKONTRAKTOR": "Subkontraktor",
    "SPOT CHECK KENDARAAN *) **)": "Spot Check Kendaraan",
    "AUDIT INTERNAL & EKSTERNAL (Sistem manajemen *)": "Audit Sistem Manajemen",
    "MONITORING KEPATUHAN PENGEMUDI (Mencakup speed / IVMS report / fatigue *)": "PIC Transport",
    "Laporan Inspeksi Kendaraan (PTI)": "1 laporan / Hari / unit",
    "SPESIFIK MCU RANDOM : NAPZA & MIRAS TEST *)": "1x / semester / kontrak",
    "Medical Check Up : 1. Pra Pekerjaan (Karyawan Baru)": "Bilamana ada karyawan baru",
    "Medical Check Up : 2. Periodik (Tahunan)": "1x/tahun/karyawan",
    "Medical Check Up : 3. Pra MCU (histori konsul pada tahun sebelumnya)": "Sesuai histori MCU",
    "TOP MANAGEMENT VISIT / MWT (Level General Manager / Dir. Operasi / Direktur Utama ***)": "1x / Caturwulan (Level GM / Dir. Ops / Dirut)",
    "MANAGEMENT VISIT / MWT (Level Coord level s/d Manager *)": "4x / Rig / bulan",
    "RAPAT RUTIN KESELAMATAN (TGM PER SHIFT/PJM)": "380 / 546 / 372 (1x / shift / hari)",
    "PRE HITCH MEETING": "1 atau 2 hari sebelum kru masuk kerja",
    "RAPAT/FORUM BERSAMA LEADER BMS DAN PHR.": "HMM, HES Council Meeting bulanan",
    "SAFETY TALK MONTHLY MEETING : 20.1 SUPPORT YARD": "1x / caturwulan (Support Yard)",
    "SAFETY TALK MONTHLY MEETING : 20.2 SUPPORT RIG": "1x / caturwulan (Support Rig)",
    "LEADERSHIP FORUM ***)": "Leadership Forum",
    "KAMPANYE KESELAMATAN (PIN/POSTER/STIKER/ SPANDUK) *)": "Pin / Poster / Stiker / Spanduk",
    "REVIEW, TINJAUAN MANAJEMEN *)": "Tinjauan Manajemen",
    "HYGIENE MONITORING : NOISE & LUX MONITORING **)": "Pengukuran Bising & Pencahayaan",
    "HYGIENE MONITORING : Mess, Catering, DAM*)": "Mess, Catering, DAM (Min 1x / tahun)",
    "INSPEKSI \"HOUSEKEEPING RIG\"": "Min 1x / bulan / Rig",
    "PENGHARGAAN: KONTES \"HOUSEKEEPING RIG\" *)": "Kontes Housekeeping",
    "PELAPORAN LINGKUNGAN KE DINAS LH": "1x / semester",
    "PENGHARGAAN: RIG OF THE MONTH INTERNAL / EXTERNAL **)": "Rig of the Month",
    "PENGHARGAAN THE BEST BBS / PEKA": "Penghargaan PEKA",
    "PENGHARGAAN THE BEST DRIVER": "Penghargaan Driver",
    "PENGHARGAAN: PENCAPAIAN KERJA SELAMAT TAHUNAN": "Voucher Belanja / Insentif",
    "PENGHARGAAN HES REFRESHING": "HES Refreshing",
    "\"ON SITE TRAINING\" DI LOKASI *)": "Training di lokasi",
    "ERP DRILL RIG : H2S&SCBA / FIRE / MEDIVAC/ PENYELAMATAN KERJA DI KETINGGIAN / TUMPAHAN. **)": "ERP Drill Rig",
    "ERP DRILL YARD : FIRE / MEDIVAC / TUMPAHAN *)": "1x / Semester (Yard)",
};

function createIndicatorValues(names, defaultDefs = {}) {
    return names.reduce((result, name) => {
        result[name] = {
            actual: 0,
            plan: 0,
            customName: name,
            definition: defaultDefs[name] || "",
        };
        return result;
    }, {});
}

const DEFAULT_LAGGING = createIndicatorValues(LAGGING_INDICATORS, DEFAULT_LAGGING_DEFINITIONS);
const DEFAULT_LEADING = createIndicatorValues(LEADING_INDICATORS, DEFAULT_LEADING_DEFINITIONS);

export default function UserInputData() {
    const { auth } = usePage().props;
    const currentUser = auth?.user;

    const [form, setForm] = useState({
        ...INITIAL_FORM,
        submitterName: currentUser?.name || "",
        submitterEmail: currentUser?.email || "",
        lagging: DEFAULT_LAGGING,
        leading: DEFAULT_LEADING,
    });

    useEffect(() => {
        if (currentUser) {
            setForm((prev) => {
                const userName = currentUser.name || "";
                const userEmail = currentUser.email || "";
                const userArea = currentUser.area || getAreaByHseCoord(userName) || getAreaByHseCoord(userEmail);

                // Auto-sync area, kontrak, dan rig sesuai akun PIC yang login
                const areaRigs = userArea
                    ? RIG_CONTRACT_MASTER.filter((m) => m.area.toLowerCase() === userArea.toLowerCase())
                    : [];
                const firstContract = areaRigs[0]?.contractNo || prev.contractNo;
                const matchingRigs = areaRigs.filter((m) => m.contractNo === firstContract);
                const defaultRigStr = matchingRigs.length > 0
                    ? matchingRigs.map((m) => m.rig).join(", ")
                    : prev.rigNo;

                return {
                    ...prev,
                    submitterName: userName || prev.submitterName,
                    submitterEmail: userEmail || prev.submitterEmail,
                    locationDistrict: userArea || prev.locationDistrict,
                    contractNo: firstContract || prev.contractNo,
                    rigNo: defaultRigStr,
                };
            });
        }
    }, [currentUser]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [evidenceFile, setEvidenceFile] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 20 * 1024 * 1024) {
                alert("Ukuran file bukti maksimal 20 MB.");
                e.target.value = "";
                return;
            }
            setEvidenceFile(file);
        }
    };

    const handleRemoveFile = () => {
        setEvidenceFile(null);
        const fileInput = document.getElementById("evidence-file-input");
        if (fileInput) fileInput.value = "";
    };

    // Mode input manual jika sewaktu-waktu data kontrak, area, PIC, atau rig berubah
    const [isManualContract, setIsManualContract] = useState(false);
    const [isManualArea, setIsManualArea] = useState(false);
    const [isManualPic, setIsManualPic] = useState(false);
    const [isManualRig, setIsManualRig] = useState(false);

    const handleResetRigToPic = () => {
        setIsManualRig(false);
        const matchingRigs = RIG_CONTRACT_MASTER.filter(
            (m) => m.contractNo.toLowerCase() === form.contractNo.toLowerCase()
        );
        if (matchingRigs.length > 0) {
            setForm((prev) => ({
                ...prev,
                rigNo: matchingRigs.map((m) => m.rig).join(", "),
            }));
        }
    };

    const selectedMonthLabel = useMemo(() => {
        const month = MONTHS.find((item) => item.value === form.period);
        return month ? month.label : "Bulan belum dipilih";
    }, [form.period]);

    const handleAutoFill = ({ rigs, contractNo, area, hseCoord, pic }) => {
        setForm((prev) => {
            const selectedPic = pic || (area ? getDefaultPicByArea(area) : "") || hseCoord || prev.submitterName;
            const picObj = INDIVIDUAL_PICS.find((p) => p.name.toLowerCase() === selectedPic.toLowerCase());
            return {
                ...prev,
                rigNo: rigs.join(", "),
                contractNo: contractNo || prev.contractNo,
                locationDistrict: area || prev.locationDistrict,
                submitterName: selectedPic,
                submitterEmail: picObj?.emailHint || prev.submitterEmail,
            };
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((previous) => {
            const updated = {
                ...previous,
                [name]: value,
            };

            if (name === "period") {
                const yr = previous.year || String(CURRENT_YEAR);
                updated.date = `${yr}-${value}-01`;
            } else if (name === "year") {
                const mo = previous.period || "01";
                updated.date = `${value}-${mo}-01`;
            } else if (name === "date" && value) {
                const parts = value.split("-");
                if (parts.length >= 2) {
                    updated.year = parts[0];
                    updated.period = parts[1];
                }
            } else if (name === "contractNo") {
                // Auto-fill rig, area, dan PIC berdasarkan no kontrak jika ada di master
                const matchingRigs = RIG_CONTRACT_MASTER.filter(
                    (m) => m.contractNo.toLowerCase() === value.toLowerCase()
                );
                if (matchingRigs.length > 0) {
                    if (!isManualRig) {
                        updated.rigNo = matchingRigs.map((m) => m.rig).join(", ");
                    }
                    const targetArea = matchingRigs[0].area;
                    updated.locationDistrict = targetArea;

                    // Pilih PIC individual default dari area tersebut jika belum sesuai
                    const areaPics = getPicsByArea(targetArea);
                    if (!areaPics.includes(updated.submitterName)) {
                        updated.submitterName = areaPics[0] || "";
                        const picInfo = INDIVIDUAL_PICS.find((p) => p.name === areaPics[0]);
                        if (picInfo) updated.submitterEmail = picInfo.emailHint;
                    }
                }
            } else if (name === "locationDistrict") {
                // Area berubah -> sesuaikan pilihan PIC individual ke area tersebut
                const areaPics = getPicsByArea(value);
                if (areaPics.length > 0 && !areaPics.includes(updated.submitterName)) {
                    updated.submitterName = areaPics[0];
                    const picInfo = INDIVIDUAL_PICS.find((p) => p.name === areaPics[0]);
                    if (picInfo) updated.submitterEmail = picInfo.emailHint;
                }
                const areaRigs = RIG_CONTRACT_MASTER.filter(
                    (m) => m.area.toLowerCase() === value.toLowerCase()
                );
                if (areaRigs.length > 0) {
                    const firstContract = areaRigs[0].contractNo;
                    updated.contractNo = firstContract;
                    if (!isManualRig) {
                        const contractRigs = areaRigs.filter((m) => m.contractNo === firstContract);
                        updated.rigNo = contractRigs.map((m) => m.rig).join(", ");
                    }
                }
            } else if (name === "submitterName") {
                // PIC (HSE Coord) berubah -> sesuaikan Area, Kontrak, Rig, dan Email secara otomatis
                const targetArea = getAreaByHseCoord(value);
                if (targetArea) {
                    updated.locationDistrict = targetArea;
                    const areaRigs = RIG_CONTRACT_MASTER.filter(
                        (m) => m.area.toLowerCase() === targetArea.toLowerCase()
                    );
                    if (areaRigs.length > 0) {
                        const firstContract = areaRigs[0].contractNo;
                        updated.contractNo = firstContract;
                        if (!isManualRig) {
                            const contractRigs = areaRigs.filter((m) => m.contractNo === firstContract);
                            updated.rigNo = contractRigs.map((m) => m.rig).join(", ");
                        }
                    }
                }
                const picInfo = INDIVIDUAL_PICS.find(
                    (p) => p.name.toLowerCase() === value.toLowerCase()
                );
                if (picInfo) {
                    updated.submitterEmail = picInfo.emailHint;
                }
            } else if (name === "rigNo") {
                // Pengguna mengetik atau mengubah rig secara manual
                setIsManualRig(true);
            }

            return updated;
        });
    };

    const handleIndicatorChange = (type, indicator, field, value) => {
        setForm((previous) => {
            const nextTypeState = {
                ...previous[type],
                [indicator]: {
                    ...previous[type][indicator],
                    [field]: value,
                },
            };

            // Auto-calculate TRI (Total Recordable Injury = Fatality + Serious LTI + RWC + MTC)
            if (type === "lagging" && (field === "actual" || field === "plan")) {
                const getVal = (name) => Number(nextTypeState[name]?.[field]) || 0;
                const fat = getVal("FATALITY");
                const lti = getVal("SERIOUS LOST TIME INJURY (>21 LOST DAY)");
                const rwc = getVal("RESTRICTED WORK CASE");
                const mtc = getVal("MEDICAL TREATMENT CASE (MTC)");
                const triSum = calcTRI(fat, lti, rwc, mtc);

                if (nextTypeState["TOTAL RECORDABLE INJURY"]) {
                    nextTypeState["TOTAL RECORDABLE INJURY"] = {
                        ...nextTypeState["TOTAL RECORDABLE INJURY"],
                        [field]: triSum,
                    };
                }
            }

            return {
                ...previous,
                [type]: nextTypeState,
            };
        });
    };

    const [deleteTarget, setDeleteTarget] = useState(null);

    const handleAddCustomIndicator = (type) => {
        const id = `custom_${type}_${Date.now()}`;
        const currentValues = form[type] || {};
        const customCount = Object.values(currentValues).filter((v) => v.isCustom).length + 1;
        const defaultName = `Indikator Tambahan #${customCount}`;

        setForm((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                [id]: {
                    actual: 0,
                    plan: 0,
                    customName: defaultName,
                    definition: "",
                    isCustom: true,
                },
            },
        }));
    };

    const handleRequestRemoveIndicator = (type, key, name) => {
        setDeleteTarget({
            type,
            key,
            name: name || key,
        });
    };

    const handleConfirmRemoveIndicator = () => {
        if (!deleteTarget) return;
        const { type, key } = deleteTarget;
        setForm((prev) => {
            const nextTypeState = { ...prev[type] };
            delete nextTypeState[key];
            return {
                ...prev,
                [type]: nextTypeState,
            };
        });
        setDeleteTarget(null);
    };

    const handleCancelRemoveIndicator = () => {
        setDeleteTarget(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // VALIDASI WAJIB FILE BUKTI PENGINPUTAN
        if (!evidenceFile) {
            alert("File dokumen bukti penginputan (Evidence File) WAJIB dilampirkan sebelum mengirim laporan!");
            const uploadSection = document.getElementById("evidence-file-container");
            if (uploadSection) {
                uploadSection.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        setIsSubmitting(true);
        setSubmitSuccess(false);

        try {
            const payload = {
                date: form.date,
                contractNo: form.contractNo,
                rigNo: form.rigNo,
                locationDistrict: form.locationDistrict,
                period: form.period,
                submitterName: form.submitterName,
                submitterEmail: form.submitterEmail,

                manHoursPremisesPlan: Number(form.manHoursPremisesPlan) || 0,
                manHoursNonPremisesPlan: Number(form.manHoursNonPremisesPlan) || 0,
                manHoursPremisesActual: Number(form.manHoursPremisesActual) || 0,
                manHoursNonPremisesActual: Number(form.manHoursNonPremisesActual) || 0,

                totalEmployees: Number(form.employees) || 0,
                totalVehicles: Number(form.totalVehicles) || 0,

                kilometerPremisesPlan: Number(form.kilometerPremisesPlan) || 0,
                kilometerNonPremisesPlan: Number(form.kilometerNonPremisesPlan) || 0,
                kilometerPremisesActual: Number(form.kilometerPremisesActual) || 0,
                kilometerNonPremisesActual: Number(form.kilometerNonPremisesActual) || 0,

                lagging: Object.entries(form.lagging).map(
                    ([name, values], index) => ({
                        name: name,
                        indicator_name: values.customName || name,
                        indicator_no: index + 1,
                        plan: Number(values.plan) || 0,
                        actual: Number(values.actual) || 0,
                        definition: values.definition || "",
                        notes: values.definition || "",
                    }),
                ),

                leading: Object.entries(form.leading).map(
                    ([name, values], index) => ({
                        name: name,
                        indicator_name: values.customName || name,
                        indicator_no: index + 1,
                        plan: Number(values.plan) || 0,
                        actual: Number(values.actual) || 0,
                        definition: values.definition || "",
                        notes: values.definition || "",
                    }),
                ),

                remarks: form.remarks,
            };

            const formData = new FormData();
            formData.append("data", JSON.stringify(payload));
            if (evidenceFile) {
                formData.append("evidence_file", evidenceFile);
            }

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            const response = await fetch("/hse-report", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken || "",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
                body: formData,
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                let errorMsg = (result && result.message) ? result.message : "Data HSE gagal disimpan. Periksa kembali form input Anda.";
                if (result && result.errors) {
                    const firstError = Object.values(result.errors)[0];
                    if (firstError && firstError.length > 0) {
                        errorMsg = firstError[0];
                    }
                }
                alert(errorMsg);
                setIsSubmitting(false);
                return;
            }

            setSubmitSuccess(true);
            setEvidenceFile(null);
            const fileEl = document.getElementById("evidence-file-input");
            if (fileEl) fileEl.value = "";
            alert(`Data HSE periode ${selectedMonthLabel} berhasil dikirim! Status saat ini: PENDING (Menunggu Persetujuan / Approval dari Admin via Email atau Menu Approval).`);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            console.error("ERROR SUBMIT HSE:", error);
            alert("Terjadi kendala saat mengirim data HSE: " + (error?.message || "Silakan periksa koneksi."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        if (window.confirm("Apakah Anda yakin ingin mengosongkan seluruh isian formulir?")) {
            setForm({
                ...INITIAL_FORM,
                lagging: createIndicatorValues(LAGGING_INDICATORS),
                leading: createIndicatorValues(LEADING_INDICATORS),
            });
            setEvidenceFile(null);
            const fileEl = document.getElementById("evidence-file-input");
            if (fileEl) fileEl.value = "";
            setSubmitSuccess(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f8fafc",
                fontFamily:
                    "'Instrument Sans', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                color: "#1e293b",
            }}
        >
            <style>{`
                .section-ident-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 16px 20px;
                }
                @media (max-width: 900px) {
                    .section-ident-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    }
                }
                @media (max-width: 600px) {
                    .section-ident-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                .ident-field-col {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }
                .ident-label-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 22px;
                    margin-bottom: 6px;
                    gap: 6px;
                }
                .ident-label {
                    font-size: 12px;
                    font-weight: 700;
                    color: #1e293b;
                    white-space: nowrap;
                    display: inline-flex;
                    align-items: center;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .ident-req {
                    color: #dc2626;
                    margin-left: 3px;
                    font-weight: 800;
                }
                .ident-btn-toggle {
                    font-size: 11px;
                    font-weight: 700;
                    color: #004d32;
                    background-color: #f1f5f9;
                    border: 1px solid #cbd5e1;
                    border-radius: 4px;
                    padding: 1px 7px;
                    cursor: pointer;
                    white-space: nowrap;
                    flex-shrink: 0;
                    line-height: 1.3;
                    transition: all 0.15s ease;
                }
                .ident-btn-toggle:hover {
                    background-color: #e2e8f0;
                }
                .ident-control {
                    width: 100%;
                    height: 40px;
                    box-sizing: border-box;
                    border: 1.5px solid #cbd5e1;
                    border-radius: 8px;
                    padding: 0 10px;
                    outline: none;
                    background-color: #ffffff;
                    font-size: 13px;
                    font-weight: 600;
                    color: #0f172a;
                    transition: border-color 0.15s ease, box-shadow 0.15s ease;
                }
                .ident-control:focus {
                    border-color: #004d32 !important;
                    box-shadow: 0 0 0 3px rgba(0, 77, 50, 0.12) !important;
                }
                .ident-control-manual {
                    border-color: #d97706 !important;
                    background-color: #fffbeb !important;
                }
            `}</style>

            <UserSidebar />

            <main
                style={{
                    marginLeft: "var(--admin-sidebar-width, 215px)",
                    width: "calc(100% - var(--admin-sidebar-width, 215px))",
                    transition:
                        "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    minHeight: "100vh",
                }}
            >
                {/* =====================================================
                    TOPBAR
                ===================================================== */}
                <header
                    style={{
                        height: "64px",
                        backgroundColor: "#ffffff",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 32px",
                        boxSizing: "border-box",
                        position: "sticky",
                        top: 0,
                        zIndex: 90,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
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
                                boxShadow: "0 0 8px rgba(239, 255, 0, 0.25)",
                            }}
                        >
                            <ClipboardList size={18} strokeWidth={2.5} />
                        </div>
                        <span
                            style={{
                                fontSize: "16px",
                                fontWeight: "800",
                                color: "#004d32",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            HSE Field Data Input
                        </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "5px 12px",
                                borderRadius: "20px",
                                backgroundColor: "#ecfdf5",
                                border: "1px solid #a7f3d0",
                                color: "#004d32",
                                fontSize: "11.5px",
                                fontWeight: "700",
                            }}
                        >
                            <span
                                style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    backgroundColor: "#10b981",
                                    boxShadow: "0 0 6px #10b981",
                                }}
                            />
                            Field User Mode
                        </div>
                    </div>
                </header>

                {/* =====================================================
                    PAGE BODY
                ===================================================== */}
                <div style={{ padding: "28px 32px 60px", maxWidth: "1400px", margin: "0 auto" }}>
                    {/* HERO BANNER */}
                    <div
                        style={{
                            backgroundColor: "#004d32",
                            borderRadius: "16px",
                            padding: "24px 28px",
                            color: "#ffffff",
                            marginBottom: "24px",
                            position: "relative",
                            overflow: "hidden",
                            boxShadow: "0 10px 25px rgba(0, 77, 50, 0.15)",
                            border: "1px solid rgba(239, 255, 0, 0.3)",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: "-40px",
                                right: "-40px",
                                width: "160px",
                                height: "160px",
                                borderRadius: "50%",
                                backgroundColor: "rgba(239, 255, 0, 0.08)",
                                pointerEvents: "none",
                            }}
                        />

                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <span
                                style={{
                                    padding: "3px 8px",
                                    borderRadius: "4px",
                                    backgroundColor: "rgba(239, 255, 0, 0.2)",
                                    border: "1px solid #efff00",
                                    color: "#efff00",
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase",
                                }}
                            >
                                Field Portal
                            </span>
                            <span style={{ color: "#a7f3d0", fontSize: "12px", fontWeight: "600" }}>
                                PT Besmindo HSE Operations
                            </span>
                        </div>

                        <h1 style={{ margin: "0 0 6px", fontSize: "24px", fontWeight: "900", letterSpacing: "-0.02em" }}>
                            Formulir Penginputan Data HSE
                        </h1>
                        <p style={{ margin: "0 0 16px", color: "#d1fae5", fontSize: "13.5px", maxWidth: "720px", lineHeight: "1.5" }}>
                            Silakan input realisasi kinerja keselamatan kerja (HSE) untuk rig dan periode yang bersangkutan. Data yang Anda simpan akan secara otomatis terintegrasi ke seluruh laporan dan matriks KPI per Rig.
                        </p>

                        {/* SUBMITTER IDENTITY CARD */}
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "12px",
                                backgroundColor: "rgba(0, 0, 0, 0.3)",
                                border: "1.5px solid #efff00",
                                borderRadius: "10px",
                                padding: "8px 16px",
                                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                            }}
                        >
                            <div
                                style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "50%",
                                    backgroundColor: "#efff00",
                                    color: "#004d32",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "900",
                                    fontSize: "13px",
                                    boxShadow: "0 0 10px rgba(239, 255, 0, 0.6)",
                                    flexShrink: 0,
                                }}
                            >
                                {(form.submitterName || currentUser?.name || "P").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: "11px", color: "#a7f3d0", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                    PIC Lapangan (HSE Coord {form.locationDistrict ? `Area ${form.locationDistrict}` : ""}):
                                </div>
                                <div style={{ fontSize: "13.5px", fontWeight: "800", color: "#ffffff", marginTop: "1px" }}>
                                    {form.submitterName || "Pilih HSE Coord"}{" "}
                                    {form.contractNo && (
                                        <span style={{ color: "#efff00", fontWeight: "700", fontSize: "12px" }}>
                                            • Kontrak: {form.contractNo}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SUCCESS NOTIFICATION */}
                    {submitSuccess && (
                        <div
                            style={{
                                backgroundColor: "#ecfdf5",
                                border: "1px solid #34d399",
                                borderRadius: "12px",
                                padding: "14px 18px",
                                marginBottom: "20px",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                color: "#065f46",
                                fontSize: "13.5px",
                                fontWeight: "700",
                            }}
                        >
                            <CheckCircle2 size={20} color="#059669" />
                            <span>Data HSE berhasil disimpan dan disinkronkan ke database sistem!</span>
                        </div>
                    )}



                    {/* FORM CONTAINER */}
                    <form onSubmit={handleSubmit}>
                        {/* 1. IDENTIFICATION */}
                        <Section title="1. Data Identifikasi Rig, Area & PIC (HSE Coord)">
                            <div className="section-ident-grid">
                                {/* ROW 1, COL 1: TANGGAL & PERIODE LAPORAN (GABUNGAN KALENDER LANGSUNG) */}
                                <div className="ident-field-col">
                                    <div className="ident-label-header">
                                        <label className="ident-label">
                                            Tanggal & Periode Laporan <span className="ident-req">*</span>
                                        </label>
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: "800",
                                                color: "#004d32",
                                                backgroundColor: "#ecfdf5",
                                                border: "1px solid #a7f3d0",
                                                borderRadius: "4px",
                                                padding: "1px 6px",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            📅 {selectedMonthLabel} {form.year}
                                        </span>
                                    </div>
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        value={form.date}
                                        onChange={handleChange}
                                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                        className="ident-control"
                                        style={{ cursor: "pointer", fontWeight: "700" }}
                                        title="Klik untuk memilih tanggal & periode di kalender"
                                    />
                                    <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "600", marginTop: "3px" }}>
                                        Pilih di kalender (Bulan & Tahun otomatis terisi)
                                    </span>
                                </div>

                                {/* ROW 1, COL 2: NOMOR KONTRAK */}
                                <div className="ident-field-col">
                                    <div className="ident-label-header">
                                        <label className="ident-label">
                                            Nomor Kontrak <span className="ident-req">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsManualContract(!isManualContract)}
                                            className="ident-btn-toggle"
                                        >
                                            {isManualContract ? "📋 List" : "✏️ Manual"}
                                        </button>
                                    </div>
                                    {isManualContract ? (
                                        <input
                                            type="text"
                                            name="contractNo"
                                            value={form.contractNo}
                                            onChange={handleChange}
                                            placeholder="Nomor kontrak..."
                                            className="ident-control"
                                            required
                                        />
                                    ) : (
                                        <select
                                            name="contractNo"
                                            value={form.contractNo}
                                            onChange={(e) => {
                                                if (e.target.value === "__custom__") {
                                                    setIsManualContract(true);
                                                } else {
                                                    handleChange(e);
                                                }
                                            }}
                                            className="ident-control"
                                            required
                                        >
                                            <option value="">-- Pilih Nomor Kontrak --</option>
                                            {ALL_CONTRACTS.map((c) => {
                                                const rigs = RIG_CONTRACT_MASTER.filter((m) => m.contractNo === c);
                                                const area = rigs[0]?.area || "";
                                                const rigNames = rigs.map((r) => r.rig).join(", ");
                                                return (
                                                    <option key={c} value={c}>
                                                        {c} — Area {area} ({rigNames})
                                                    </option>
                                                );
                                            })}
                                            <option value="__custom__">✏️ Ketik Kontrak Lainnya...</option>
                                        </select>
                                    )}
                                </div>

                                {/* ROW 1, COL 3: PETUGAS PIC (HSE COORD) */}
                                <div className="ident-field-col">
                                    <div className="ident-label-header">
                                        <label className="ident-label">
                                            Petugas PIC (HSE Coord) <span className="ident-req">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsManualPic(!isManualPic)}
                                            className="ident-btn-toggle"
                                        >
                                            {isManualPic ? "📋 List" : "✏️ Manual"}
                                        </button>
                                    </div>
                                    {isManualPic ? (
                                        <input
                                            type="text"
                                            name="submitterName"
                                            value={form.submitterName}
                                            onChange={handleChange}
                                            placeholder="Nama petugas PIC..."
                                            className="ident-control"
                                            required
                                        />
                                    ) : (
                                        <select
                                            name="submitterName"
                                            value={form.submitterName}
                                            onChange={(e) => {
                                                if (e.target.value === "__custom__") {
                                                    setIsManualPic(true);
                                                } else {
                                                    handleChange(e);
                                                }
                                            }}
                                            className="ident-control"
                                            required
                                        >
                                            <option value="">-- Pilih Petugas PIC (HSE Coord) --</option>
                                            {form.locationDistrict && (
                                                <optgroup label={`PIC Area ${form.locationDistrict} (Sesuai Area Terpilih)`}>
                                                    {getPicsByArea(form.locationDistrict).map((pic) => (
                                                        <option key={pic} value={pic}>
                                                            👤 {pic} (Area {form.locationDistrict})
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            )}
                                            <optgroup label="Semua Petugas PIC Lapangan">
                                                {INDIVIDUAL_PICS.map((p) => (
                                                    <option key={p.name} value={p.name}>
                                                        👤 {p.name} — Area {p.area}
                                                    </option>
                                                ))}
                                            </optgroup>
                                            <option value="__custom__">✏️ Ketik Nama PIC Lainnya...</option>
                                        </select>
                                    )}
                                </div>

                                {/* ROW 2, COL 1: LOKASI / AREA DISTRIK */}
                                <div className="ident-field-col">
                                    <div className="ident-label-header">
                                        <label className="ident-label">
                                            Lokasi / Area Distrik <span className="ident-req">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsManualArea(!isManualArea)}
                                            className="ident-btn-toggle"
                                        >
                                            {isManualArea ? "📋 List" : "✏️ Manual"}
                                        </button>
                                    </div>
                                    {isManualArea ? (
                                        <input
                                            type="text"
                                            name="locationDistrict"
                                            value={form.locationDistrict}
                                            onChange={handleChange}
                                            placeholder="Area kerja..."
                                            className="ident-control"
                                            required
                                        />
                                    ) : (
                                        <select
                                            name="locationDistrict"
                                            value={form.locationDistrict}
                                            onChange={(e) => {
                                                if (e.target.value === "__custom__") {
                                                    setIsManualArea(true);
                                                } else {
                                                    handleChange(e);
                                                }
                                            }}
                                            className="ident-control"
                                            required
                                        >
                                            <option value="">-- Pilih Area Kerja --</option>
                                            {ALL_AREAS.map((a) => (
                                                <option key={a} value={a}>
                                                    Area {a} (PIC: {getPicsByArea(a).join(" / ")})
                                                </option>
                                            ))}
                                            <option value="__custom__">✏️ Ketik Area Lainnya...</option>
                                        </select>
                                    )}
                                </div>

                                {/* ROW 2, COL 2: NOMOR RIG */}
                                <div className="ident-field-col">
                                    <div className="ident-label-header">
                                        <label className="ident-label">
                                            Nomor Rig <span className="ident-req">*</span>
                                        </label>
                                        {isManualRig ? (
                                            <button
                                                type="button"
                                                onClick={handleResetRigToPic}
                                                className="ident-btn-toggle"
                                                style={{ color: "#b45309", backgroundColor: "#fef3c7", borderColor: "#fde68a" }}
                                            >
                                                🔒 Reset
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setIsManualRig(true)}
                                                className="ident-btn-toggle"
                                            >
                                                ✏️ Ubah
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        name="rigNo"
                                        value={form.rigNo}
                                        onChange={handleChange}
                                        placeholder="Nomor rig..."
                                        className={`ident-control ${isManualRig ? "ident-control-manual" : ""}`}
                                        required
                                    />
                                    <span style={{ fontSize: "10.5px", color: isManualRig ? "#b45309" : "#059669", fontWeight: "600", marginTop: "3px" }}>
                                        {isManualRig ? "Mode ubah manual aktif" : "⚡ Otomatis mengikuti PIC & Area"}
                                    </span>
                                </div>

                                {/* ROW 2, COL 3: EMAIL PETUGAS PENGINPUT (PIC) */}
                                <div className="ident-field-col">
                                    <div className="ident-label-header">
                                        <label className="ident-label">
                                            Email Petugas Penginput <span className="ident-req">*</span>
                                        </label>
                                    </div>
                                    <input
                                        type="email"
                                        name="submitterEmail"
                                        placeholder="nama@besmindo.com"
                                        value={form.submitterEmail}
                                        onChange={handleChange}
                                        required
                                        className="ident-control"
                                    />
                                    <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "600", marginTop: "3px" }}>
                                        Email notifikasi & verifikasi laporan
                                    </span>
                                </div>
                            </div>
                        </Section>

                        {/* 2. EXPOSURE METRICS */}
                        <Section title="2. Metrik Exposure & Jam Kerja (Man Hours)">
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                    gap: "16px",
                                }}
                            >
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

                                <NumberField
                                    label="Total Karyawan (Employees)"
                                    name="employees"
                                    value={form.employees}
                                    onChange={handleChange}
                                    required
                                />

                                <NumberField
                                    label="Total Kendaraan (Vehicles)"
                                    name="totalVehicles"
                                    value={form.totalVehicles}
                                    onChange={handleChange}
                                    required
                                />

                                <NumberField
                                    label="KM Driven Premises - Plan"
                                    name="kilometerPremisesPlan"
                                    value={form.kilometerPremisesPlan}
                                    onChange={handleChange}
                                    required
                                />

                                <NumberField
                                    label="KM Driven Non-Premises - Plan"
                                    name="kilometerNonPremisesPlan"
                                    value={form.kilometerNonPremisesPlan}
                                    onChange={handleChange}
                                    required
                                />

                                <NumberField
                                    label="KM Driven Premises - Actual"
                                    name="kilometerPremisesActual"
                                    value={form.kilometerPremisesActual}
                                    onChange={handleChange}
                                    required
                                />

                                <NumberField
                                    label="KM Driven Non-Premises - Actual"
                                    name="kilometerNonPremisesActual"
                                    value={form.kilometerNonPremisesActual}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </Section>


                        {/* 3. LAGGING INDICATORS */}
                        <IndicatorSection
                            title="3. ⚠ Lagging Indicators (Insiden Keselamatan)"
                            type="lagging"
                            indicators={LAGGING_INDICATORS}
                            values={form.lagging}
                            onChange={handleIndicatorChange}
                            onAddCustom={handleAddCustomIndicator}
                            onRemoveCustom={handleRequestRemoveIndicator}
                        />

                        {/* 4. LEADING INDICATORS */}
                        <IndicatorSection
                            title="4. ↗ Leading Indicators (Aktivitas Pencegahan)"
                            type="leading"
                            indicators={LEADING_INDICATORS}
                            values={form.leading}
                            onChange={handleIndicatorChange}
                            onAddCustom={handleAddCustomIndicator}
                            onRemoveCustom={handleRequestRemoveIndicator}
                        />

                        {/* 5. DOCUMENTATION / REMARKS & BUKTI PENGINPUTAN */}
                        <Section title="5. Catatan & Bukti Dokumen Penginputan">
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "12.5px",
                                    fontWeight: "700",
                                    marginBottom: "8px",
                                    color: "#334155",
                                }}
                            >
                                Catatan Tambahan / Ringkasan Realisasi Lapangan <span style={{ color: "#64748b", fontWeight: "normal" }}>(Opsional)</span>
                            </label>

                            <textarea
                                name="remarks"
                                value={form.remarks}
                                onChange={handleChange}
                                placeholder="Tuliskan catatan penting operasional atau penjelasan kendala lapangan pada periode ini (jika ada)..."
                                rows={4}
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "8px",
                                    padding: "12px",
                                    resize: "vertical",
                                    outline: "none",
                                    fontSize: "13.5px",
                                    color: "#1e293b",
                                }}
                            />

                            {/* UPLOAD FORM / CHOOSE FILE SEBAGAI BUKTI PENGINPUTAN */}
                            <div
                                style={{
                                    marginTop: "20px",
                                    paddingTop: "18px",
                                    borderTop: "1px dashed #cbd5e1",
                                }}
                            >
                                <label
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        fontSize: "13px",
                                        fontWeight: "800",
                                        marginBottom: "6px",
                                        color: "#004d32",
                                    }}
                                >
                                    <Upload size={16} color="#004d32" />
                                    <span>Upload File Bukti Penginputan (Evidence File)</span>
                                    <span style={{ color: "#dc2626", fontWeight: "900", fontSize: "12px" }}>* (WAJIB DILAMPIRKAN)</span>
                                </label>
                                <p
                                    style={{
                                        margin: "0 0 12px",
                                        fontSize: "12px",
                                        color: "#64748b",
                                        lineHeight: "1.45",
                                    }}
                                >
                                    Wajib melampirkan file dokumen pendukung sah sebagai bukti (scan logsheet fisik, formulir bertandatangan, file Excel rekap, atau foto bukti lapangan). Format: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Maksimal 20 MB).
                                </p>

                                <div
                                    id="evidence-file-container"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        flexWrap: "wrap",
                                        padding: "14px 16px",
                                        backgroundColor: evidenceFile ? "#f0fdf4" : "#fef2f2",
                                        borderRadius: "10px",
                                        border: evidenceFile ? "1.5px solid #10b981" : "1.5px dashed #f87171",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    <input
                                        type="file"
                                        id="evidence-file-input"
                                        required
                                        onChange={handleFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                                        style={{ display: "none" }}
                                    />

                                    <label
                                        htmlFor="evidence-file-input"
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            padding: "9px 20px",
                                            backgroundColor: evidenceFile ? "#004d32" : "#b91c1c",
                                            color: evidenceFile ? "#efff00" : "#ffffff",
                                            border: evidenceFile ? "1.5px solid #efff00" : "1.5px solid #ef4444",
                                            borderRadius: "8px",
                                            fontSize: "13px",
                                            fontWeight: "800",
                                            cursor: "pointer",
                                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
                                            transition: "all 0.15s ease",
                                        }}
                                    >
                                        <Upload size={16} strokeWidth={2.4} />
                                        <span>{evidenceFile ? "Ganti File (Choose File)" : "📁 Choose File (Pilih File Bukti *)"}</span>
                                    </label>

                                    {evidenceFile ? (
                                        <div
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                padding: "7px 14px",
                                                backgroundColor: "#ecfdf5",
                                                border: "1px solid #a7f3d0",
                                                borderRadius: "8px",
                                                fontSize: "12.5px",
                                                color: "#065f46",
                                                fontWeight: "700",
                                            }}
                                        >
                                            <FileText size={17} color="#059669" />
                                            <span>
                                                {evidenceFile.name} ({(evidenceFile.size / 1024 / 1024).toFixed(2)} MB)
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                title="Hapus file terpilih"
                                                style={{
                                                    background: "#fee2e2",
                                                    border: "1px solid #fca5a5",
                                                    borderRadius: "50%",
                                                    color: "#dc2626",
                                                    cursor: "pointer",
                                                    width: "20px",
                                                    height: "20px",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: "800",
                                                    fontSize: "11px",
                                                    marginLeft: "4px",
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: "12.5px", color: "#b91c1c", fontWeight: "700" }}>
                                            ⚠️ Belum ada file bukti yang dipilih. Wajib lampirkan 1 file sebelum submit!
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Section>

                        {/* ACTIONS BAR */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                gap: "12px",
                                marginTop: "24px",
                                paddingBottom: "30px",
                            }}
                        >
                            <button
                                type="button"
                                onClick={handleReset}
                                style={{
                                    height: "42px",
                                    padding: "0 22px",
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #004d32",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    color: "#004d32",
                                    fontWeight: "700",
                                    fontSize: "13px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    transition: "all 0.2s",
                                }}
                            >
                                <RotateCcw size={15} />
                                Reset Form
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    height: "42px",
                                    padding: "0 26px",
                                    backgroundColor: "#004d32",
                                    color: "#efff00",
                                    border: "1px solid #efff00",
                                    borderRadius: "8px",
                                    cursor: isSubmitting ? "not-allowed" : "pointer",
                                    fontWeight: "800",
                                    fontSize: "13.5px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    boxShadow: "0 0 12px rgba(239, 255, 0, 0.25)",
                                    opacity: isSubmitting ? 0.7 : 1,
                                    transition: "all 0.2s",
                                }}
                            >
                                <CheckCircle2 size={16} strokeWidth={2.6} />
                                {isSubmitting ? "Menyimpan Data..." : "Simpan Data HSE Lapangan"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <ConfirmDeleteModal
                deleteTarget={deleteTarget}
                onConfirm={handleConfirmRemoveIndicator}
                onCancel={handleCancelRemoveIndicator}
            />
        </div>
    );
}

/* ============================================================
   SUB-COMPONENTS
============================================================ */

function ConfirmDeleteModal({ deleteTarget, onConfirm, onCancel }) {
    if (!deleteTarget) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(15, 23, 42, 0.65)",
                backdropFilter: "blur(3px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: "20px",
                boxSizing: "border-box",
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    maxWidth: "460px",
                    width: "100%",
                    padding: "26px",
                    boxShadow: "0 20px 45px rgba(0, 0, 0, 0.25)",
                    border: "1px solid #e2e8f0",
                    position: "relative",
                    boxSizing: "border-box",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <div
                        style={{
                            width: "46px",
                            height: "46px",
                            borderRadius: "12px",
                            backgroundColor: "#fee2e2",
                            border: "1px solid #fca5a5",
                            color: "#dc2626",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <ShieldAlert size={26} strokeWidth={2.3} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <h3
                            style={{
                                margin: "0 0 6px",
                                fontSize: "16.5px",
                                fontWeight: "800",
                                color: "#0f172a",
                            }}
                        >
                            Hapus Indikator Ini?
                        </h3>
                        <p
                            style={{
                                margin: "0 0 12px",
                                fontSize: "13px",
                                color: "#64748b",
                                lineHeight: "1.5",
                            }}
                        >
                            Peringatan: Baris indikator berikut akan dihapus dan tidak disertakan pada laporan periode ini.
                        </p>
                        <div
                            style={{
                                padding: "10px 14px",
                                backgroundColor: "#f8fafc",
                                borderRadius: "8px",
                                border: "1.5px solid #e2e8f0",
                                fontSize: "12.5px",
                                fontWeight: "700",
                                color: "#004d32",
                                wordBreak: "break-word",
                                marginBottom: "20px",
                            }}
                        >
                            📌 {deleteTarget.name}
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            height: "38px",
                            padding: "0 18px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#475569",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                        }}
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        style={{
                            height: "38px",
                            padding: "0 20px",
                            backgroundColor: "#dc2626",
                            border: "1px solid #b91c1c",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "800",
                            color: "#ffffff",
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(220, 38, 38, 0.25)",
                            transition: "all 0.15s ease",
                        }}
                    >
                        Ya, Hapus Indikator
                    </button>
                </div>
            </div>
        </div>
    );
}

function IndicatorRow({ indicator, index, type, value, onChange, onRemove }) {
    const [editingName, setEditingName] = useState(false);
    const [editingDef, setEditingDef] = useState(false);
    const isCustom = Boolean(value.isCustom);
    const customName = value.customName !== undefined ? value.customName : indicator;
    const isNameEdited = !isCustom && customName !== indicator && customName.trim() !== "";

    const definition = value.definition !== undefined ? value.definition : "";

    return (
        <tr
            style={{
                backgroundColor: isCustom
                    ? "#f0fdf4"
                    : index % 2 === 0
                    ? "#ffffff"
                    : "#fcfdfd",
                borderBottom: isCustom ? "1.5px solid #86efac" : "1px solid #f1f5f9",
            }}
        >
            <td
                style={{
                    ...tableCellStyle,
                    fontWeight: "700",
                    color: isCustom ? "#166534" : "#004d32",
                    width: "45px",
                }}
            >
                {index + 1}
            </td>

            {/* POINT YANG DIUKUR / INDIKATOR */}
            <td
                style={{
                    ...tableCellStyle,
                    textAlign: "left",
                    padding: "8px 12px",
                    minWidth: "260px",
                }}
            >
                {isCustom ? (
                    <input
                        type="text"
                        value={customName}
                        onChange={(event) =>
                            onChange(type, indicator, "customName", event.target.value)
                        }
                        placeholder="Ketik nama indikator..."
                        style={{
                            width: "100%",
                            height: "34px",
                            boxSizing: "border-box",
                            border: "1.5px solid #004d32",
                            borderRadius: "6px",
                            padding: "0 10px",
                            outline: "none",
                            fontSize: "12.5px",
                            fontWeight: "700",
                            color: "#0f172a",
                            backgroundColor: "#ffffff",
                        }}
                    />
                ) : editingName ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <input
                            type="text"
                            autoFocus
                            value={customName}
                            onChange={(event) =>
                                onChange(type, indicator, "customName", event.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") setEditingName(false);
                            }}
                            style={{
                                flex: 1,
                                height: "34px",
                                boxSizing: "border-box",
                                border: "1.5px solid #004d32",
                                borderRadius: "6px",
                                padding: "0 8px",
                                outline: "none",
                                fontSize: "12.5px",
                                color: "#1e293b",
                                fontWeight: "600",
                                backgroundColor: "#ffffff",
                            }}
                            placeholder="Ketik poin yang diukur..."
                        />
                        <button
                            type="button"
                            onClick={() => setEditingName(false)}
                            style={{
                                padding: "4px 10px",
                                height: "34px",
                                backgroundColor: "#004d32",
                                color: "#efff00",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "11.5px",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                flexShrink: 0,
                            }}
                        >
                            ✓ Simpan
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "12.5px", fontWeight: isNameEdited ? "700" : "500", color: isNameEdited ? "#004d32" : "#1e293b" }}>
                                {customName}
                            </span>
                            {isNameEdited && (
                                <span
                                    style={{
                                        fontSize: "10px",
                                        fontWeight: "800",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        backgroundColor: "#fef3c7",
                                        color: "#92400e",
                                        border: "1px solid #fde68a",
                                    }}
                                >
                                    ✏️ Edited
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setEditingName(true)}
                            title="Edit nama poin indikator ini"
                            style={{
                                padding: "3px 7px",
                                backgroundColor: isNameEdited ? "#e0f2fe" : "#f8fafc",
                                color: isNameEdited ? "#0369a1" : "#475569",
                                border: isNameEdited ? "1px solid #bae6fd" : "1px solid #cbd5e1",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: "700",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                                flexShrink: 0,
                            }}
                        >
                            ✏️ Edit Poin
                        </button>
                    </div>
                )}
            </td>

            {/* DEFINISI / FORMULA / KETERANGAN */}
            <td
                style={{
                    ...tableCellStyle,
                    textAlign: "left",
                    padding: "8px 12px",
                    minWidth: "260px",
                }}
            >
                {isCustom ? (
                    <input
                        type="text"
                        value={definition}
                        onChange={(event) =>
                            onChange(type, indicator, "definition", event.target.value)
                        }
                        placeholder="Ketik definisi, standar, atau formula khusus..."
                        style={{
                            width: "100%",
                            height: "34px",
                            boxSizing: "border-box",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                            padding: "0 10px",
                            outline: "none",
                            fontSize: "12px",
                            color: "#1e293b",
                            backgroundColor: "#ffffff",
                        }}
                    />
                ) : editingDef ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <input
                            type="text"
                            autoFocus
                            value={definition}
                            onChange={(event) =>
                                onChange(type, indicator, "definition", event.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") setEditingDef(false);
                            }}
                            style={{
                                flex: 1,
                                height: "34px",
                                boxSizing: "border-box",
                                border: "1.5px solid #004d32",
                                borderRadius: "6px",
                                padding: "0 8px",
                                outline: "none",
                                fontSize: "12.5px",
                                color: "#1e293b",
                                fontWeight: "500",
                                backgroundColor: "#ffffff",
                            }}
                            placeholder="Ketik definisi / formula / keterangan..."
                        />
                        <button
                            type="button"
                            onClick={() => setEditingDef(false)}
                            style={{
                                padding: "4px 10px",
                                height: "34px",
                                backgroundColor: "#004d32",
                                color: "#efff00",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "11.5px",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                flexShrink: 0,
                            }}
                        >
                            ✓ Simpan
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <span style={{ fontSize: "12px", color: definition ? "#475569" : "#94a3b8", fontStyle: definition ? "normal" : "italic" }}>
                            {definition || "— Belum ada definisi (Klik Edit) —"}
                        </span>
                        <button
                            type="button"
                            onClick={() => setEditingDef(true)}
                            title="Edit definisi / formula indikator ini"
                            style={{
                                padding: "3px 7px",
                                backgroundColor: definition ? "#f0fdf4" : "#f8fafc",
                                color: definition ? "#166534" : "#475569",
                                border: definition ? "1px solid #bbf7d0" : "1px solid #cbd5e1",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: "700",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                                flexShrink: 0,
                            }}
                        >
                            ✏️ Edit Definisi
                        </button>
                    </div>
                )}
            </td>

            {/* TARGET / PLAN */}
            <td style={{ ...tableCellStyle, width: "140px" }}>
                {type === "lagging" && (indicator === "TOTAL RECORDABLE INJURY" || indicator === "MOTOR VEHICLE CRASH (MVC)") ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "10px", fontWeight: "800", color: "#475569", borderBottom: "1px solid #cbd5e1", paddingBottom: "2px" }}>
                            <span style={{ flex: 1, textAlign: "center" }}>CASE</span>
                            <span style={{ flex: 1, textAlign: "center" }}>FR</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <div style={{ flex: 1 }}>
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
                            </div>
                            <div style={{ flex: 1 }}>
                                <NumberTableField
                                    value={value.planFr !== undefined ? value.planFr : 0}
                                    onChange={(event) =>
                                        onChange(
                                            type,
                                            indicator,
                                            "planFr",
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
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
                        {type === "leading" && (indicator === "Laporan Inspeksi Kendaraan (PTI)" || Number(value.plan) === 100) && (
                            <span style={{ fontSize: "11px", fontWeight: "800", color: "#004d32" }}>%</span>
                        )}
                    </div>
                )}
            </td>

            {/* REALISASI / ACTUAL */}
            <td style={{ ...tableCellStyle, width: "140px" }}>
                {type === "lagging" && (indicator === "TOTAL RECORDABLE INJURY" || indicator === "MOTOR VEHICLE CRASH (MVC)") ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "10px", fontWeight: "800", color: "#475569", borderBottom: "1px solid #cbd5e1", paddingBottom: "2px" }}>
                            <span style={{ flex: 1, textAlign: "center" }}>CASE</span>
                            <span style={{ flex: 1, textAlign: "center" }}>FR</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <div style={{ flex: 1 }}>
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
                            </div>
                            <div style={{ flex: 1 }}>
                                <NumberTableField
                                    value={value.actualFr !== undefined ? value.actualFr : 0}
                                    onChange={(event) =>
                                        onChange(
                                            type,
                                            indicator,
                                            "actualFr",
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
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
                        {type === "leading" && (indicator === "Laporan Inspeksi Kendaraan (PTI)" || Number(value.actual) === 100) && (
                            <span style={{ fontSize: "11px", fontWeight: "800", color: "#004d32" }}>%</span>
                        )}
                    </div>
                )}
            </td>

            {/* AKSI / HAPUS */}
            <td style={{ ...tableCellStyle, width: "70px", textAlign: "center" }}>
                <button
                    type="button"
                    onClick={() => onRemove(type, indicator, customName)}
                    title="Hapus baris indikator ini"
                    style={{
                        padding: "5px 10px",
                        backgroundColor: "#fee2e2",
                        color: "#dc2626",
                        border: "1px solid #fca5a5",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "800",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                        transition: "all 0.15s ease",
                    }}
                >
                    🗑️ Hapus
                </button>
            </td>
        </tr>
    );
}

function IndicatorSection({
    title,
    type,
    indicators,
    values,
    onChange,
    onAddCustom,
    onRemoveCustom,
}) {
    const allIndicators = Object.keys(values || {});

    return (
        <Section
            title={title}
            headerAction={
                <button
                    type="button"
                    onClick={() => onAddCustom(type)}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        backgroundColor: "#ecfdf5",
                        color: "#004d32",
                        border: "1.5px solid #059669",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "800",
                        cursor: "pointer",
                        boxShadow: "0 1px 3px rgba(0, 77, 50, 0.08)",
                        transition: "all 0.15s ease",
                    }}
                >
                    <span style={{ fontSize: "16px", fontWeight: "900", lineHeight: 1 }}>+</span>
                    <span>Add Table</span>
                </button>
            }
        >
            <div
                style={{
                    overflowX: "auto",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: "960px",
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                backgroundColor: "#004d32",
                                color: "#ffffff",
                                borderBottom: "2px solid #efff00",
                            }}
                        >
                            <th style={{ ...tableHeaderStyle, width: "45px" }}>No</th>
                            <th
                                style={{
                                    ...tableHeaderStyle,
                                    textAlign: "left",
                                    minWidth: "260px",
                                }}
                            >
                                Point yang Diukur / Indikator
                            </th>
                            <th
                                style={{
                                    ...tableHeaderStyle,
                                    textAlign: "left",
                                    minWidth: "260px",
                                }}
                            >
                                Definisi / Formula / Keterangan
                            </th>
                            <th style={{ ...tableHeaderStyle, width: "140px" }}>Target / Plan</th>
                            <th style={{ ...tableHeaderStyle, width: "140px" }}>Realisasi / Actual</th>
                            <th style={{ ...tableHeaderStyle, width: "65px", textAlign: "center" }}>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {allIndicators.map((indicator, index) => {
                            const value = values[indicator] || {
                                plan: 0,
                                actual: 0,
                                customName: indicator,
                                definition: "",
                            };

                            return (
                                <IndicatorRow
                                    key={indicator}
                                    indicator={indicator}
                                    index={index}
                                    type={type}
                                    value={value}
                                    onChange={onChange}
                                    onRemove={onRemoveCustom}
                                />
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div
                style={{
                    marginTop: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    padding: "10px 14px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                    border: "1px dashed #cbd5e1",
                }}
            >
                <p
                    style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#64748b",
                    }}
                >
                    Isi nilai <strong>Plan</strong> sesuai target yang ditentukan, lalu isi <strong>Actual</strong> sesuai realisasi pada bulan berjalan. Butuh baris indikator tambahan? Klik tombol <strong>+ Add Table</strong>.
                </p>

                <button
                    type="button"
                    onClick={() => onAddCustom(type)}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 15px",
                        backgroundColor: "#004d32",
                        color: "#efff00",
                        border: "1px solid #efff00",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        fontWeight: "800",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0, 77, 50, 0.18)",
                        transition: "all 0.15s ease",
                    }}
                >
                    <span style={{ fontSize: "16px", fontWeight: "900", lineHeight: 1 }}>+</span>
                    <span>Add Table</span>
                </button>
            </div>
        </Section>
    );
}



function Section({ title, headerAction, children }) {
    return (
        <section
            style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                boxShadow: "0 4px 18px rgba(0, 77, 50, 0.04)",
                padding: "24px",
                marginBottom: "20px",
                boxSizing: "border-box",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: "linear-gradient(90deg, #004d32 0%, #efff00 100%)",
                }}
            />

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "10px",
                    margin: "0 0 18px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #f1f5f9",
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: "15.5px",
                        fontWeight: "800",
                        color: "#004d32",
                    }}
                >
                    {title}
                </h2>
                {headerAction}
            </div>

            {children}
        </section>
    );
}

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
                    fontSize: "12.5px",
                    fontWeight: "700",
                    marginBottom: "6px",
                    color: "#334155",
                }}
            >
                {label}
                {required && <span style={{ color: "#dc2626", marginLeft: "4px" }}>*</span>}
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
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "0 12px",
                    outline: "none",
                    backgroundColor: "#ffffff",
                    fontSize: "13px",
                    color: "#1e293b",
                }}
            />
        </div>
    );
}

function NumberField({ label, name, value, onChange, required }) {
    const displayValue = (value === 0 || value === "0") ? "" : value;

    return (
        <div>
            <label
                style={{
                    display: "block",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    marginBottom: "6px",
                    color: "#334155",
                }}
            >
                {label}
                {required && <span style={{ color: "#dc2626", marginLeft: "4px" }}>*</span>}
            </label>

            <input
                type="number"
                min="0"
                step="any"
                name={name}
                value={displayValue}
                placeholder="0"
                onFocus={(e) => e.target.select()}
                onChange={onChange}
                required={required}
                style={{
                    width: "100%",
                    height: "38px",
                    boxSizing: "border-box",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "0 12px",
                    outline: "none",
                    backgroundColor: "#ffffff",
                    textAlign: "right",
                    fontSize: "13px",
                    color: "#1e293b",
                }}
            />
        </div>
    );
}

function NumberTableField({ value, onChange }) {
    const displayValue = (value === 0 || value === "0") ? "" : value;

    return (
        <input
            type="number"
            min="0"
            step="any"
            required
            value={displayValue}
            placeholder="0"
            onFocus={(e) => e.target.select()}
            onChange={onChange}
            style={{
                width: "100%",
                minWidth: "90px",
                height: "32px",
                boxSizing: "border-box",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "0 8px",
                outline: "none",
                backgroundColor: "#f8fafc",
                textAlign: "right",
                fontSize: "13px",
                color: "#1e293b",
            }}
        />
    );
}

function SelectField({
    label,
    name,
    value,
    onChange,
    options = [],
    optionLabels = {},
    required = false,
    placeholder,
}) {
    return (
        <div>
            <label
                style={{
                    display: "block",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    marginBottom: "6px",
                    color: "#334155",
                }}
            >
                {label}
                {required && <span style={{ color: "#dc2626", marginLeft: "4px" }}>*</span>}
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
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "0 10px",
                    outline: "none",
                    backgroundColor: "#ffffff",
                    fontSize: "13px",
                    color: "#1e293b",
                }}
            >
                <option value="">
                    {placeholder || (name === "period" ? "Pilih Periode (Bulan)" : name === "year" ? "Pilih Tahun" : name === "rigNo" ? "Pilih Rig" : `-- Pilih ${label || "Pilihan"} --`)}
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

const tableHeaderStyle = {
    padding: "10px 12px",
    fontSize: "12px",
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
};

const tableCellStyle = {
    padding: "8px 12px",
    border: "1px solid #f1f5f9",
    fontSize: "12.5px",
    textAlign: "center",
    color: "#334155",
};
