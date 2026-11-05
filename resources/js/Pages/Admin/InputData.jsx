import AdminSidebar from "../../Components/AdminSidebar";
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
    CONTRACT_RIG_GROUPS,
    getRigsByContract,
    getContractInfoByRig,
    getHseCoordByArea,
    getAreaByHseCoord,
    getPicsByArea,
    getDefaultPicByArea,
    getRigGroupsByArea,
    findRigInfo,
} from "../../Utils/rigContracts";
import {
    getDefaultKpiTargets,
    getRigMonthPlanTargets,
    getDefaultLaggingState,
    getDefaultLeadingState,
} from "../../Utils/kpiMasterTargets";
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

const initialMo = "01";
const initialYr = String(CURRENT_YEAR);

const INITIAL_FORM = {
    date: `${initialYr}-${initialMo}-01`,
    contractNo: "SPHR01095C",
    rigNo: "BMS # 02",
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
    manHoursPremisesActual: "",
    manHoursNonPremisesActual: "",

    // =========================
    // EXPOSURE
    // =========================
    employees: 72,
    totalVehicles: 9,

    // =========================
    // KILOMETER
    // =========================
    kilometerPremisesPlan: 0,
    kilometerNonPremisesPlan: 0,
    kilometerPremisesActual: "",
    kilometerNonPremisesActual: "",

    lagging: {},
    leading: {},
    remarks: "",
};

export default function AdminInputData({ masterKpiTargets = [], year: initialYearProp = 2027 }) {
    const { auth, masterKpiTargets: pageMasterTargets = [] } = usePage().props;
    const currentUser = auth?.user;
    const masterTargets = (masterKpiTargets && masterKpiTargets.length > 0) ? masterKpiTargets : pageMasterTargets;

    const [form, setForm] = useState({
        ...INITIAL_FORM,
        submitterName: currentUser?.name || "Teddy",
        submitterEmail: currentUser?.email || "teddy@besmindo.com",
        lagging: getDefaultLaggingState(),
        leading: getDefaultLeadingState(),
    });

    useEffect(() => {
        if (currentUser) {
            setForm((prev) => {
                const userName = currentUser.name || "";
                const userEmail = currentUser.email || "";
                const userArea = currentUser.area || getAreaByHseCoord(userName) || getAreaByHseCoord(userEmail);

                const areaRigs = userArea
                    ? RIG_CONTRACT_MASTER.filter((m) => m.area.toLowerCase() === userArea.toLowerCase())
                    : [];
                const firstContract = areaRigs[0]?.contractNo || prev.contractNo;
                const matchingRigs = areaRigs.filter((m) => m.contractNo === firstContract);
                const defaultSingleRig = matchingRigs[0]?.rig || prev.rigNo || "BMS # 02";

                return {
                    ...prev,
                    submitterName: userName || prev.submitterName,
                    submitterEmail: userEmail || prev.submitterEmail,
                    locationDistrict: userArea || prev.locationDistrict,
                    contractNo: firstContract || prev.contractNo,
                    rigNo: defaultSingleRig,
                };
            });
        }
    }, [currentUser]);

    // Sinkronisasi target plan master per Rig & Bulan
    const monthIndex = Math.max(0, parseInt(form.period, 10) - 1 || 0);

    useEffect(() => {
        const targets = getRigMonthPlanTargets({
            masterKpiTargets: masterTargets,
            rigNo: form.rigNo,
            contractNo: form.contractNo,
            monthIndex,
        });

        setForm((prev) => {
            const nextLagging = { ...prev.lagging };
            Object.keys(nextLagging).forEach((k) => {
                const item = nextLagging[k];
                const dbPlan = targets.findDbTarget("lagging", item.name || item.customName || k);
                const isCombo = Boolean(item.isCaseFrCombo) || k === "lag_5" || k === "lag_6" || item.no === 5 || item.no === 6 || item.indicatorNo === "1.5" || item.indicatorNo === "1.6";
                nextLagging[k] = {
                    ...item,
                    isCaseFrCombo: isCombo,
                    plan: dbPlan !== null && dbPlan !== undefined ? String(dbPlan) : (item.plan || "0"),
                    targetMonth: dbPlan !== null && dbPlan !== undefined ? String(dbPlan) : (item.targetMonth || "0"),
                    targetFr: item.targetFr ?? (isCombo ? "0.00" : null),
                    planFr: item.planFr ?? (isCombo ? "0.00" : null),
                };
            });

            const nextLeading = { ...prev.leading };
            Object.keys(nextLeading).forEach((k) => {
                const item = nextLeading[k];
                const dbPlan = targets.findDbTarget("leading", item.name || item.customName || k);
                if (dbPlan !== null && dbPlan !== undefined) {
                    nextLeading[k] = { ...item, plan: String(dbPlan), targetMonth: String(dbPlan) };
                }
            });

            return {
                ...prev,
                manHoursPremisesPlan: targets.manHoursPremisesPlan,
                manHoursNonPremisesPlan: targets.manHoursNonPremisesPlan,
                kilometerPremisesPlan: targets.kilometerPremisesPlan,
                kilometerNonPremisesPlan: targets.kilometerNonPremisesPlan,
                employees: prev.employees || targets.employees,
                totalVehicles: prev.totalVehicles || targets.totalVehicles,
                lagging: nextLagging,
                leading: nextLeading,
            };
        });
    }, [form.rigNo, form.contractNo, form.period, form.year, masterTargets]);

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

    const [isManualContract, setIsManualContract] = useState(false);
    const [isManualArea, setIsManualArea] = useState(false);
    const [isManualPic, setIsManualPic] = useState(false);
    const [isManualRig, setIsManualRig] = useState(false);

    const availableRigsForContract = useMemo(() => {
        const rigs = getRigsByContract(form.contractNo);
        if (rigs && rigs.length > 0) return rigs;
        return [form.rigNo || "BMS # 02"];
    }, [form.contractNo, form.rigNo]);

    const handleResetRigToPic = () => {
        setIsManualRig(false);
        const contractRigs = getRigsByContract(form.contractNo);
        if (contractRigs.length > 0) {
            setForm((prev) => ({ ...prev, rigNo: contractRigs[0] }));
        }
    };

    const availablePicsForArea = useMemo(() => {
        return getPicsByArea(form.locationDistrict);
    }, [form.locationDistrict]);

    const activeAreaConfig = useMemo(() => {
        return AREA_CONFIG[form.locationDistrict] || null;
    }, [form.locationDistrict]);

    const activeContractRigs = useMemo(() => {
        return CONTRACT_RIG_GROUPS[form.contractNo] || null;
    }, [form.contractNo]);

    const selectedMonthLabel = useMemo(() => {
        const match = MONTHS.find((m) => m.value === form.period);
        return match ? match.label : "Bulan " + form.period;
    }, [form.period]);

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
                const contractRigs = getRigsByContract(value);
                const firstRig = contractRigs[0] || "";
                const info = getContractInfoByRig(firstRig);
                updated.contractNo = value;
                if (!isManualRig && firstRig) {
                    updated.rigNo = firstRig;
                }
                if (info?.area) {
                    updated.locationDistrict = info.area;
                    const areaPics = getPicsByArea(info.area);
                    if (areaPics.length > 0 && !areaPics.includes(updated.submitterName)) {
                        updated.submitterName = areaPics[0];
                        const picInfo = INDIVIDUAL_PICS.find((p) => p.name === areaPics[0]);
                        if (picInfo) updated.submitterEmail = picInfo.emailHint;
                    }
                }
            } else if (name === "rigNo") {
                const info = getContractInfoByRig(value);
                if (info) {
                    updated.contractNo = info.contractNo;
                    updated.locationDistrict = info.area;
                    const areaPics = getPicsByArea(info.area);
                    if (areaPics.length > 0 && !areaPics.includes(updated.submitterName)) {
                        updated.submitterName = areaPics[0];
                        const picInfo = INDIVIDUAL_PICS.find((p) => p.name === areaPics[0]);
                        if (picInfo) updated.submitterEmail = picInfo.emailHint;
                    }
                }
            } else if (name === "locationDistrict") {
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
                    const contractRigs = getRigsByContract(firstContract);
                    if (!isManualRig && contractRigs[0]) {
                        updated.rigNo = contractRigs[0];
                    }
                }
            } else if (name === "submitterName") {
                const targetArea = getAreaByHseCoord(value);
                if (targetArea) {
                    updated.locationDistrict = targetArea;
                    const areaRigs = RIG_CONTRACT_MASTER.filter(
                        (m) => m.area.toLowerCase() === targetArea.toLowerCase()
                    );
                    if (areaRigs.length > 0) {
                        const firstContract = areaRigs[0].contractNo;
                        updated.contractNo = firstContract;
                        const contractRigs = getRigsByContract(firstContract);
                        if (!isManualRig && contractRigs[0]) {
                            updated.rigNo = contractRigs[0];
                        }
                    }
                }
                const picInfo = INDIVIDUAL_PICS.find(
                    (p) => p.name.toLowerCase() === value.toLowerCase()
                );
                if (picInfo) {
                    updated.submitterEmail = picInfo.emailHint;
                }
            }

            return updated;
        });
    };

    const handleIndicatorChange = (type, key, field, value) => {
        setForm((previous) => {
            const nextTypeState = {
                ...previous[type],
                [key]: {
                    ...previous[type][key],
                    [field]: value,
                },
            };

            if (field === "targetMonth") {
                nextTypeState[key].plan = value;
            }

            // Auto-calculate TRI
            if (type === "lagging" && (field === "actual" || field === "targetMonth" || field === "plan")) {
                let fat = 0, lti = 0, rwc = 0, mtc = 0;
                let triKey = null;

                Object.entries(nextTypeState).forEach(([k, item]) => {
                    const itemName = (item.name || item.customName || "").toUpperCase();
                    const numVal = parseFloat(item[field]) || 0;
                    if (itemName.includes("FATALITY") && !itemName.includes("ILLNESS")) {
                        fat = numVal;
                    } else if (itemName.includes("SERIOUS LOST TIME INJURY") || itemName.includes("LTI")) {
                        lti = numVal;
                    } else if (itemName.includes("RESTRICTED WORK CASE") || itemName.includes("RWC")) {
                        rwc = numVal;
                    } else if (itemName.includes("MEDICAL TREATMENT CASE") || itemName.includes("MTC")) {
                        mtc = numVal;
                    } else if (itemName.includes("TOTAL RECORDABLE INJURY") || itemName.includes("TRI")) {
                        triKey = k;
                    }
                });

                if (triKey && nextTypeState[triKey]) {
                    const triSum = calcTRI(fat, lti, rwc, mtc);
                    nextTypeState[triKey] = {
                        ...nextTypeState[triKey],
                        [field]: String(triSum),
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
                    id,
                    no: `+${customCount}`,
                    subNo: "",
                    name: defaultName,
                    customName: defaultName,
                    definition: "",
                    unit: type === "lagging" ? "Case" : "Activity",
                    targetMonth: "0",
                    targetYear: "0",
                    plan: "0",
                    actual: "",
                    isParent: false,
                    isSubItem: false,
                    parentId: null,
                    isCustom: true,
                },
            },
        }));
    };

    const handleRequestRemoveIndicator = (type, key, name, isParent = false) => {
        setDeleteTarget({
            type,
            key,
            name: name || key,
            isParent: Boolean(isParent),
        });
    };

    const handleConfirmRemoveIndicator = () => {
        if (!deleteTarget) return;
        const { type, key, isParent } = deleteTarget;
        setForm((prev) => {
            const nextTypeState = { ...prev[type] };
            if (isParent) {
                delete nextTypeState[key];
                Object.keys(nextTypeState).forEach((k) => {
                    if (nextTypeState[k].parentId === key) {
                        delete nextTypeState[k];
                    }
                });
            } else {
                delete nextTypeState[key];
            }
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

        const resolveActual = (actualVal, planVal) => {
            if (actualVal !== "" && actualVal !== null && actualVal !== undefined) {
                return Number(actualVal);
            }
            return Number(planVal) || 0;
        };

        try {
            const payload = {
                date: form.date,
                contractNo: form.contractNo,
                rigNo: form.rigNo,
                locationDistrict: form.locationDistrict,
                period: form.period,
                year: form.year,
                submitterName: form.submitterName,
                submitterEmail: form.submitterEmail,

                manHoursPremisesPlan: Number(form.manHoursPremisesPlan) || 0,
                manHoursNonPremisesPlan: Number(form.manHoursNonPremisesPlan) || 0,
                manHoursPremisesActual: resolveActual(form.manHoursPremisesActual, form.manHoursPremisesPlan),
                manHoursNonPremisesActual: resolveActual(form.manHoursNonPremisesActual, form.manHoursNonPremisesPlan),

                totalEmployees: Number(form.employees) || 0,
                totalVehicles: Number(form.totalVehicles) || 0,

                kilometerPremisesPlan: Number(form.kilometerPremisesPlan) || 0,
                kilometerNonPremisesPlan: Number(form.kilometerNonPremisesPlan) || 0,
                kilometerPremisesActual: resolveActual(form.kilometerPremisesActual, form.kilometerPremisesPlan),
                kilometerNonPremisesActual: resolveActual(form.kilometerNonPremisesActual, form.kilometerNonPremisesPlan),

                lagging: Object.values(form.lagging).map((item, index) => {
                    const planVal = item.targetMonth !== undefined && item.targetMonth !== "" ? item.targetMonth : (item.plan || "0");
                    const isTri = item.no === 5 || item.indicatorNo === "1.5" || (item.name && item.name.includes("TOTAL RECORDABLE INJURY"));
                    const isMvc = item.no === 6 || item.indicatorNo === "1.6" || (item.name && item.name.includes("MOTOR VEHICLE CRASH"));

                    const sumTri = (
                        (Number(form.lagging?.["lag_1"]?.actual) || 0) +
                        (Number(form.lagging?.["lag_2"]?.actual) || 0) +
                        (Number(form.lagging?.["lag_3"]?.actual) || 0) +
                        (Number(form.lagging?.["lag_4"]?.actual) || 0)
                    );

                    let actVal = item.actual;
                    if (actVal === "" || actVal === null || actVal === undefined) {
                        if (isTri && sumTri > 0) {
                            actVal = String(sumTri);
                        } else {
                            actVal = planVal;
                        }
                    }

                    const planFrVal = item.targetFr !== undefined && item.targetFr !== "" ? item.targetFr : (item.planFr || "0.00");
                    let frVal = item.frequencyRate;
                    if (frVal === "" || frVal === null || frVal === undefined) {
                        if (isCaseFr) {
                            const totalHours = resolveActual(form.manHoursPremisesActual, form.manHoursPremisesPlan) + resolveActual(form.manHoursNonPremisesActual, form.manHoursNonPremisesPlan);
                            const totalKm = resolveActual(form.kilometerPremisesActual, form.kilometerPremisesPlan) + resolveActual(form.kilometerNonPremisesActual, form.kilometerNonPremisesPlan);
                            const c = Number(actVal) || 0;

                            if (isMvc) {
                                frVal = totalKm > 0 ? ((c * 1000000) / totalKm).toFixed(2) : planFrVal;
                            } else if (isTri || ["1.1", "1.2", "1.3", "1.4"].includes(String(item.indicator_no)) || [1, 2, 3, 4].includes(Number(item.indicator_no))) {
                                frVal = totalHours > 0 ? ((c * 200000) / totalHours).toFixed(2) : planFrVal;
                            } else {
                                frVal = planFrVal;
                            }
                        } else {
                            frVal = null;
                        }
                    }

                    return {
                        name: item.name || item.customName || `lag_${index + 1}`,
                        indicator_name: item.customName || item.name || `lag_${index + 1}`,
                        indicator_no: item.no || index + 1,
                        target_month: item.targetMonth ?? planVal,
                        target_year: item.targetYear ?? "0",
                        plan: planVal,
                        actual: actVal,
                        frequency_rate: frVal,
                        definition: item.definition || "",
                        notes: item.notes || item.keterangan || "",
                        keterangan: item.keterangan || item.notes || "",
                        unit: item.unit || "Case",
                    };
                }),

                leading: Object.values(form.leading).map((item, index) => {
                    const targetMonth = item.targetMonth !== undefined && item.targetMonth !== null ? String(item.targetMonth) : "";
                    const targetYear = item.targetYear !== undefined && item.targetYear !== null ? String(item.targetYear) : "";
                    const planVal = targetMonth !== "" ? targetMonth : (item.plan !== undefined && item.plan !== null ? String(item.plan) : "");
                    const actVal = (item.actual !== "" && item.actual !== null && item.actual !== undefined) ? String(item.actual) : planVal;
                    return {
                        name: item.name || item.customName || `lead_${index + 1}`,
                        indicator_name: item.customName || item.name || `lead_${index + 1}`,
                        indicator_no: item.no || "",
                        is_parent: !!item.isParent,
                        parent_name: item.parentId ? (form.leading[item.parentId]?.customName || form.leading[item.parentId]?.name || "") : null,
                        sub_label: item.subNo || "",
                        target_month: targetMonth,
                        target_year: targetYear,
                        plan: planVal,
                        actual: item.isParent ? "" : actVal,
                        definition: item.definition || "",
                        notes: item.definition || "",
                        unit: item.unit || "Activity",
                    };
                }),

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
            const currentMoLabel = MONTHS.find((m) => m.value === form.period)?.label || form.period;
            alert(`Data HSE periode ${currentMoLabel} ${form.year} berhasil disimpan!`);
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
                lagging: getDefaultLaggingState(),
                leading: getDefaultLeadingState(),
            });
            setEvidenceFile(null);
            const fileEl = document.getElementById("evidence-file-input");
            if (fileEl) fileEl.value = "";
            setSubmitSuccess(false);
        }
    };

    return (
        <div
            className="app-layout-root"
            style={{
                display: "flex",
                minHeight: "100vh",
                backgroundColor: "#f8fafc",
                fontFamily:
                    "'Instrument Sans', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                color: "#1e293b",
                width: "100%",
                maxWidth: "100vw",
                overflowX: "hidden",
                position: "relative",
            }}
        >
            <style>{`
                :root {
                    --admin-sidebar-width: 215px;
                }
                .app-main-content {
                    flex: 1;
                    margin-left: var(--admin-sidebar-width, 215px);
                    width: calc(100% - var(--admin-sidebar-width, 215px));
                    max-width: calc(100% - var(--admin-sidebar-width, 215px));
                    min-width: 0;
                    box-sizing: border-box;
                    transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                                width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                                max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .section-ident-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 16px 20px;
                }
                .table-responsive {
                    width: 100%;
                    max-width: 100%;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    box-sizing: border-box;
                }
                .table-responsive::-webkit-scrollbar {
                    height: 6px;
                }
                .table-responsive::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }
                .table-responsive::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .table-responsive::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                @media (max-width: 900px) {
                    .section-ident-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    }
                    .app-main-content main {
                        padding: 24px 20px 40px !important;
                    }
                }
                @media (max-width: 600px) {
                    .section-ident-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .app-main-content main {
                        padding: 16px 12px 36px !important;
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
                    color: #334155;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .ident-action-btn {
                    background: transparent;
                    border: none;
                    font-size: 11px;
                    font-weight: 700;
                    color: #004d32;
                    cursor: pointer;
                    padding: 0;
                    white-space: nowrap;
                    flex-shrink: 0;
                }
                .ident-action-btn:hover {
                    text-decoration: underline;
                }
            `}</style>

            <AdminSidebar />

            <div className="app-main-content">
                <main
                    style={{
                        padding: "32px 36px",
                        maxWidth: "1280px",
                        margin: "0 auto",
                        width: "100%",
                        boxSizing: "border-box",
                        minWidth: 0,
                    }}
                >
                    <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: "16px",
                                marginBottom: "28px",
                                paddingBottom: "20px",
                                borderBottom: "1.5px solid #e2e8f0",
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "5px 12px",
                                        backgroundColor: "#ecfdf5",
                                        border: "1px solid #a7f3d0",
                                        borderRadius: "20px",
                                        marginBottom: "10px",
                                    }}
                                >
                                    <ClipboardList size={14} color="#004d32" />
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: "800",
                                            color: "#004d32",
                                            letterSpacing: "0.04em",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        Form BMSD/03/FO/HSE/02/17 Rev #12
                                    </span>
                                </div>
                                <h1
                                    style={{
                                        fontSize: "24px",
                                        fontWeight: "800",
                                        color: "#004d32",
                                        margin: "0 0 6px",
                                        letterSpacing: "-0.02em",
                                    }}
                                >
                                    Input KPI & HSE Performance (Admin)
                                </h1>
                                <p
                                    style={{
                                        fontSize: "13.5px",
                                        color: "#64748b",
                                        margin: 0,
                                    }}
                                >
                                    Penginputan realisasi metrik Keselamatan, Kesehatan Kerja & Lindung Lingkungan (HSE) per Rig & Kontrak.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* KONTEKS PERIODE PENGINPUTAN BANNER */}
                            <div
                                style={{
                                    backgroundColor: "#ecfdf5",
                                    border: "1.5px solid #a7f3d0",
                                    borderRadius: "10px",
                                    padding: "12px 18px",
                                    marginBottom: "20px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    flexWrap: "wrap",
                                    gap: "12px",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div
                                        style={{
                                            backgroundColor: "#004d32",
                                            color: "#efff00",
                                            width: "38px",
                                            height: "38px",
                                            borderRadius: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: "800",
                                            fontSize: "18px",
                                            boxShadow: "0 2px 4px rgba(0, 77, 50, 0.15)",
                                        }}
                                    >
                                        📅
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "11px", fontWeight: "800", color: "#065f46", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                            Konteks Periode Penginputan
                                        </div>
                                        <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                                            Pengisian Aktual — {MONTHS.find((m) => m.value === form.period)?.label || "Bulan"} {form.year}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "700", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", padding: "4px 10px", borderRadius: "6px", color: "#0f172a" }}>
                                        Rig: <strong style={{ color: "#004d32" }}>{form.rigNo}</strong>
                                    </span>
                                    <span style={{ fontSize: "12px", fontWeight: "700", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", padding: "4px 10px", borderRadius: "6px", color: "#0f172a" }}>
                                        Kontrak: <strong style={{ color: "#004d32" }}>{form.contractNo}</strong>
                                    </span>
                                    <span style={{ fontSize: "12px", fontWeight: "700", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", padding: "4px 10px", borderRadius: "6px", color: "#0f172a" }}>
                                        Area: <strong style={{ color: "#004d32" }}>{form.locationDistrict}</strong>
                                    </span>
                                </div>
                            </div>

                            {/* 1. IDENTIFIKASI RIG & KONTRAK */}
                            <Section title="1. Identifikasi Rig & Kontrak Kerja">
                                <div className="section-ident-grid">
                                    <div className="ident-field-col">
                                        <div className="ident-label-header">
                                            <label className="ident-label">
                                                Tanggal Laporan <span style={{ color: "#dc2626" }}>*</span>
                                            </label>
                                        </div>
                                        <input
                                            type="date"
                                            name="date"
                                            value={form.date}
                                            onChange={handleChange}
                                            required
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
                                        />
                                    </div>

                                    <div className="ident-field-col">
                                        <div className="ident-label-header">
                                            <label className="ident-label">
                                                Periode Bulan <span style={{ color: "#dc2626" }}>*</span>
                                            </label>
                                        </div>
                                        <select
                                            name="period"
                                            value={form.period}
                                            onChange={handleChange}
                                            required
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
                                            {MONTHS.map((m) => (
                                                <option key={m.value} value={m.value}>
                                                    {m.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="ident-field-col">
                                        <div className="ident-label-header">
                                            <label className="ident-label">
                                                Tahun Kinerja <span style={{ color: "#dc2626" }}>*</span>
                                            </label>
                                        </div>
                                        <select
                                            name="year"
                                            value={form.year}
                                            onChange={handleChange}
                                            required
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
                                            {YEARS.map((y) => (
                                                <option key={y} value={y}>
                                                    Tahun {y}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="ident-field-col">
                                        <div className="ident-label-header">
                                            <label className="ident-label">
                                                Nomor Kontrak <span style={{ color: "#dc2626" }}>*</span>
                                            </label>
                                        </div>
                                        <select
                                            name="contractNo"
                                            value={form.contractNo}
                                            onChange={handleChange}
                                            required
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
                                            {ALL_CONTRACTS.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="ident-field-col">
                                        <div className="ident-label-header">
                                            <label className="ident-label">
                                                Nama / Nomor Rig <span style={{ color: "#dc2626" }}>*</span>
                                            </label>
                                        </div>
                                        <select
                                            name="rigNo"
                                            value={form.rigNo}
                                            onChange={handleChange}
                                            required
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
                                            {availableRigsForContract.map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="ident-field-col">
                                        <div className="ident-label-header">
                                            <label className="ident-label">
                                                Wilayah Operasi / Area <span style={{ color: "#dc2626" }}>*</span>
                                            </label>
                                        </div>
                                        <select
                                            name="locationDistrict"
                                            value={form.locationDistrict}
                                            onChange={handleChange}
                                            required
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
                                            {ALL_AREAS.map((a) => (
                                                <option key={a} value={a}>
                                                    {a}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </Section>

                            {/* 2. EXPOSURE METRICS */}
                            <Section title="2. Metrik Exposure & Jam Kerja (Man Hours)">
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                        gap: "16px",
                                    }}
                                >
                                    <NumberField
                                        label="Man Hours Premises - Plan"
                                        name="manHoursPremisesPlan"
                                        value={form.manHoursPremisesPlan}
                                        onChange={handleChange}
                                        unit="Jam"
                                    />

                                    <NumberField
                                        label="Man Hours Non-Premises - Plan"
                                        name="manHoursNonPremisesPlan"
                                        value={form.manHoursNonPremisesPlan}
                                        onChange={handleChange}
                                        unit="Jam"
                                    />

                                    <NumberField
                                        label="Man Hours Premises - Actual"
                                        name="manHoursPremisesActual"
                                        value={form.manHoursPremisesActual}
                                        placeholder={form.manHoursPremisesPlan}
                                        onChange={handleChange}
                                        unit="Jam"
                                    />

                                    <NumberField
                                        label="Man Hours Non-Premises - Actual"
                                        name="manHoursNonPremisesActual"
                                        value={form.manHoursNonPremisesActual}
                                        placeholder={form.manHoursNonPremisesPlan}
                                        onChange={handleChange}
                                        unit="Jam"
                                    />

                                    <NumberField
                                        label="Total Karyawan (Employees)"
                                        name="employees"
                                        value={form.employees}
                                        placeholder="72"
                                        onChange={handleChange}
                                        unit="Orang"
                                    />

                                    <NumberField
                                        label="Total Kendaraan (Vehicles)"
                                        name="totalVehicles"
                                        value={form.totalVehicles}
                                        placeholder="9"
                                        onChange={handleChange}
                                        unit="Unit"
                                    />

                                    <NumberField
                                        label="KM Driven Premises - Plan"
                                        name="kilometerPremisesPlan"
                                        value={form.kilometerPremisesPlan}
                                        onChange={handleChange}
                                        unit="KM"
                                    />

                                    <NumberField
                                        label="KM Driven Non-Premises - Plan"
                                        name="kilometerNonPremisesPlan"
                                        value={form.kilometerNonPremisesPlan}
                                        onChange={handleChange}
                                        unit="KM"
                                    />

                                    <NumberField
                                        label="KM Driven Premises - Actual"
                                        name="kilometerPremisesActual"
                                        value={form.kilometerPremisesActual}
                                        placeholder={form.kilometerPremisesPlan}
                                        onChange={handleChange}
                                        unit="KM"
                                    />

                                    <NumberField
                                        label="KM Driven Non-Premises - Actual"
                                        name="kilometerNonPremisesActual"
                                        value={form.kilometerNonPremisesActual}
                                        placeholder={form.kilometerNonPremisesPlan}
                                        onChange={handleChange}
                                        unit="KM"
                                    />
                                </div>
                            </Section>

                            {/* 3. LAGGING INDICATORS */}
                            <IndicatorSection
                                title={`3. ⚠ Lagging Indicators (Insiden Keselamatan) — Periode: ${MONTHS.find((m) => m.value === form.period)?.label || ""} ${form.year}`}
                                type="lagging"
                                values={form.lagging}
                                onChange={handleIndicatorChange}
                                onAddCustom={handleAddCustomIndicator}
                                onRemoveCustom={handleRequestRemoveIndicator}
                                totalManHours={
                                    (Number(form.manHoursPremisesActual) || Number(form.manHoursPremisesPlan) || 0) +
                                    (Number(form.manHoursNonPremisesActual) || Number(form.manHoursNonPremisesPlan) || 0)
                                }
                                totalKm={
                                    (Number(form.kilometerPremisesActual) || Number(form.kilometerPremisesPlan) || 0) +
                                    (Number(form.kilometerNonPremisesActual) || Number(form.kilometerNonPremisesPlan) || 0)
                                }
                            />

                            {/* 4. LEADING INDICATORS */}
                            <IndicatorSection
                                title={`4. ↗ Leading Indicators (Aktivitas Pencegahan) — Periode: ${MONTHS.find((m) => m.value === form.period)?.label || ""} ${form.year}`}
                                type="leading"
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
                                    flexWrap: "wrap",
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
            </div>

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
                    maxWidth: "480px",
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
                            {deleteTarget.isParent ? "Hapus Kelompok Indikator & Sub-item?" : "Hapus Indikator Ini?"}
                        </h3>
                        <p
                            style={{
                                margin: "0 0 12px",
                                fontSize: "13px",
                                color: "#64748b",
                                lineHeight: "1.5",
                            }}
                        >
                            {deleteTarget.isParent
                                ? "Peringatan: Baris ini merupakan poin induk. Menghapus poin ini akan menghapus seluruh sub-item di bawahnya dari laporan periode ini."
                                : "Peringatan: Baris indikator berikut akan dihapus dan tidak disertakan pada laporan periode ini."}
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
                                marginBottom: deleteTarget.isParent ? "10px" : "20px",
                            }}
                        >
                            📌 {deleteTarget.name}
                        </div>
                        {deleteTarget.isParent && (
                            <div
                                style={{
                                    padding: "8px 12px",
                                    backgroundColor: "#fef2f2",
                                    border: "1px solid #fecaca",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    color: "#991b1b",
                                    fontWeight: "700",
                                    marginBottom: "20px",
                                }}
                            >
                                ⚠️ Semua sub-baris turunan akan ikut dihapus.
                            </div>
                        )}
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
                        Ya, Hapus {deleteTarget.isParent ? "Semua" : "Indikator"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function IndicatorRow({ item, index, type, onChange, onRemove, totalManHours = 0, totalKm = 0, allValues = {} }) {
    const isCustom = Boolean(item.isCustom);
    const isParent = Boolean(item.isParent);
    const isSubItem = Boolean(item.isSubItem);
    const isLagging = type === "lagging";

    const isTri = isLagging && (
        item.indicatorNo === "1.5" ||
        item.no === 5 ||
        item.no === "5" ||
        item.no === "1.5" ||
        (item.name && item.name.includes("TOTAL RECORDABLE INJURY")) ||
        (item.customName && item.customName.includes("TOTAL RECORDABLE INJURY"))
    );
    const isMvc = isLagging && (
        item.indicatorNo === "1.6" ||
        item.no === 6 ||
        item.no === "6" ||
        item.no === "1.6" ||
        (item.name && item.name.includes("MOTOR VEHICLE CRASH")) ||
        (item.customName && item.customName.includes("MOTOR VEHICLE CRASH"))
    );
    // Seluruh indikator pada 1. HES Performance (1.1 s/d 1.12) menggunakan metrik ganda (Case & FR)
    const isCaseFr = isLagging || Boolean(item.isCaseFrCombo);

    const planCase = (item.targetMonth !== undefined && item.targetMonth !== "")
        ? String(item.targetMonth)
        : (item.plan !== undefined && item.plan !== "" ? String(item.plan) : "0");

    const planFr = (item.targetFr !== undefined && item.targetFr !== "")
        ? String(item.targetFr)
        : (item.planFr !== undefined && item.planFr !== "" ? String(item.planFr) : "0.00");

    // Auto-sum TRI cases from 1.1 + 1.2 + 1.3 + 1.4
    const sumTriCases = (
        (Number(allValues?.["lag_1"]?.actual) || 0) +
        (Number(allValues?.["lag_2"]?.actual) || 0) +
        (Number(allValues?.["lag_3"]?.actual) || 0) +
        (Number(allValues?.["lag_4"]?.actual) || 0)
    );

    // Case placeholder: if TRI and 1.1-1.4 entered, show sum
    let casePlaceholder = planCase;
    if (isTri && sumTriCases > 0) {
        casePlaceholder = String(sumTriCases);
    }

    // Effective cases for FR calculation
    const typedCases = item.actual !== "" && item.actual !== null && item.actual !== undefined ? Number(item.actual) : null;
    const effectiveCases = typedCases !== null ? typedCases : (isTri && sumTriCases > 0 ? sumTriCases : (Number(planCase) || 0));

    let calcFrPreview = planFr;
    if (isCaseFr) {
        if (isMvc) {
            calcFrPreview = totalKm > 0 ? ((effectiveCases * 1000000) / totalKm).toFixed(2) : planFr;
        } else if (isTri || ["1.1", "1.2", "1.3", "1.4"].includes(String(item.indicatorNo)) || [1, 2, 3, 4].includes(Number(item.no))) {
            calcFrPreview = totalManHours > 0 ? ((effectiveCases * 200000) / totalManHours).toFixed(2) : planFr;
        } else {
            calcFrPreview = planFr;
        }
    }

    const customName = item.customName !== undefined ? item.customName : (item.name || "");
    const definition = item.definition !== undefined ? item.definition : "";
    const key = item.id || item.name;

    const rowBg = isParent
        ? "#f8fafc"
        : isCustom
        ? "#f0fdf4"
        : index % 2 === 0
        ? "#ffffff"
        : "#fafbfc";

    return (
        <tr
            style={{
                backgroundColor: rowBg,
                borderBottom: isParent
                    ? "1.5px solid #cbd5e1"
                    : isCustom
                    ? "1.5px solid #86efac"
                    : "1px solid #f1f5f9",
            }}
        >
            {/* 1. NO COLUMN */}
            <td
                style={{
                    ...tableCellStyle,
                    fontWeight: isParent ? "800" : "700",
                    color: isParent ? "#004d32" : isCustom ? "#166534" : "#475569",
                    width: "4%",
                    minWidth: "36px",
                    fontSize: isParent ? "13px" : "12px",
                }}
            >
                {isSubItem ? (
                    <span style={{ color: "#94a3b8", fontSize: "13px" }}>↳</span>
                ) : (
                    item.indicatorNo || item.no || (index + 1)
                )}
            </td>

            {/* 2. POINT YANG DIUKUR / INDIKATOR (READ-ONLY FOR MASTER) */}
            <td
                style={{
                    ...tableCellStyle,
                    textAlign: "left",
                    padding: "8px 10px",
                    paddingLeft: isSubItem ? "24px" : "10px",
                    width: isLagging ? "26%" : "32%",
                    minWidth: isLagging ? "180px" : "200px",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                }}
            >
                {isCustom ? (
                    <input
                        type="text"
                        value={customName}
                        onChange={(event) =>
                            onChange(type, key, "customName", event.target.value)
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
                ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        {isSubItem && (
                            <span style={{ color: "#059669", fontWeight: "800", fontSize: "13px" }}>↳</span>
                        )}
                        {item.subNo && (
                            <span
                                style={{
                                    display: "inline-block",
                                    minWidth: "18px",
                                    padding: "1px 5px",
                                    backgroundColor: "#ecfdf5",
                                    border: "1px solid #a7f3d0",
                                    color: "#065f46",
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    borderRadius: "4px",
                                    textAlign: "center",
                                }}
                            >
                                {item.subNo}
                            </span>
                        )}
                        <span
                            style={{
                                fontSize: isParent ? "13px" : "12.5px",
                                fontWeight: isParent ? "800" : "600",
                                color: isParent ? "#004d32" : "#1e293b",
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                overflowWrap: "anywhere",
                                lineHeight: "1.35",
                            }}
                        >
                            {customName}
                        </span>
                        {isParent && (
                            <span
                                style={{
                                    fontSize: "10px",
                                    fontWeight: "800",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    backgroundColor: "#dbeafe",
                                    color: "#1e40af",
                                    border: "1px solid #bfdbfe",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                Parent Group
                            </span>
                        )}
                    </div>
                )}
            </td>

            {/* 3. DEFINISI / FORMULA / KETERANGAN (READ-ONLY FOR MASTER) */}
            <td
                style={{
                    ...tableCellStyle,
                    textAlign: "left",
                    padding: "8px 10px",
                    width: isLagging ? "22%" : "26%",
                    minWidth: isLagging ? "150px" : "160px",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                }}
            >
                {isCustom ? (
                    <input
                        type="text"
                        value={definition}
                        onChange={(event) =>
                            onChange(type, key, "definition", event.target.value)
                        }
                        placeholder="Ketik definisi / formula / keterangan..."
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
                ) : (
                    <span
                        style={{
                            fontSize: "12px",
                            color: definition ? "#475569" : "#94a3b8",
                            fontStyle: definition ? "normal" : "italic",
                            display: "block",
                            lineHeight: "1.35",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                        }}
                    >
                        {definition || "—"}
                    </span>
                )}
            </td>

            {/* 4. TARGET (month) / TARGET ESTIMASI MONTH */}
            <td style={{ ...tableCellStyle, width: isLagging ? "16%" : "10%", minWidth: isLagging ? "130px" : "80px" }}>
                {isCaseFr ? (
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "10px", fontWeight: "800", color: "#004d32", marginBottom: "2px", textAlign: "center" }}>
                                Plan Case
                            </div>
                            <TextTableField
                                value={item.targetMonth !== undefined && item.targetMonth !== "" ? item.targetMonth : (item.plan || "")}
                                placeholder="0"
                                onChange={(event) => {
                                    onChange(type, key, "targetMonth", event.target.value);
                                    onChange(type, key, "plan", event.target.value);
                                }}
                                style={{ textAlign: "center" }}
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "10px", fontWeight: "800", color: "#004d32", marginBottom: "2px", textAlign: "center" }}>
                                Plan FR
                            </div>
                            <TextTableField
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.targetFr !== undefined && item.targetFr !== "" ? item.targetFr : (item.planFr || "")}
                                placeholder="0.00"
                                onChange={(event) => {
                                    onChange(type, key, "targetFr", event.target.value);
                                    onChange(type, key, "planFr", event.target.value);
                                }}
                                style={{ textAlign: "center" }}
                            />
                        </div>
                    </div>
                ) : (
                    <span
                        style={{
                            fontSize: "12.5px",
                            fontWeight: "800",
                            color: "#004d32",
                        }}
                    >
                        {item.targetMonth || "0"}
                    </span>
                )}
            </td>

            {/* 5. KETERANGAN (LAGGING) atau TARGET YEAR (LEADING) (READ-ONLY FOR MASTER) */}
            {isLagging ? (
                <td style={{ ...tableCellStyle, width: "12%", minWidth: "95px", padding: "6px 8px" }}>
                    {isCustom ? (
                        <input
                            type="text"
                            value={item.notes !== undefined ? item.notes : (item.keterangan || "")}
                            onChange={(event) => {
                                onChange(type, key, "notes", event.target.value);
                                onChange(type, key, "keterangan", event.target.value);
                            }}
                            placeholder="Keterangan..."
                            style={{
                                width: "100%",
                                height: "34px",
                                boxSizing: "border-box",
                                border: "1px solid #cbd5e1",
                                borderRadius: "6px",
                                padding: "0 8px",
                                outline: "none",
                                fontSize: "12px",
                                color: "#1e293b",
                                backgroundColor: "#ffffff",
                            }}
                        />
                    ) : item.notes === "Recordable" || item.keterangan === "Recordable" ? (
                        <span
                            style={{
                                display: "inline-block",
                                padding: "3px 8px",
                                backgroundColor: "#fef3c7",
                                color: "#92400e",
                                border: "1px solid #fde68a",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "800",
                            }}
                        >
                            Recordable
                        </span>
                    ) : item.notes === "Reportable case" || item.keterangan === "Reportable case" ? (
                        <span
                            style={{
                                display: "inline-block",
                                padding: "3px 8px",
                                backgroundColor: "#e0f2fe",
                                color: "#0369a1",
                                border: "1px solid #bae6fd",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "800",
                            }}
                        >
                            Reportable case
                        </span>
                    ) : (
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                            {item.notes || item.keterangan || "—"}
                        </span>
                    )}
                </td>
            ) : (
                <td style={{ ...tableCellStyle, width: "10%", minWidth: "80px" }}>
                    <span
                        style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#475569",
                        }}
                    >
                        {item.targetYear || "0"}
                    </span>
                </td>
            )}

            {/* 6. REALISASI / ACTUAL (DATA ENTRY COLUMN WITH PLACEHOLDER TARGET) */}
            <td style={{ ...tableCellStyle, width: isLagging ? "18%" : "11%", minWidth: isLagging ? "140px" : "90px" }}>
                {isParent ? (
                    <span
                        style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#64748b",
                            backgroundColor: "#e2e8f0",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            display: "inline-block",
                            whiteSpace: "nowrap",
                        }}
                    >
                        — (Sub-item)
                    </span>
                ) : isCaseFr ? (
                    /* DUAL FIELD: CASE & FR UNTUK 1.5 & 1.6 */
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "10px", fontWeight: "800", color: "#004d32", marginBottom: "2px", textAlign: "center" }}>
                                Actual Case
                            </div>
                            <TextTableField
                                value={item.actual}
                                placeholder={casePlaceholder}
                                onChange={(event) =>
                                    onChange(type, key, "actual", event.target.value)
                                }
                                style={{ textAlign: "center" }}
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "10px", fontWeight: "800", color: "#004d32", marginBottom: "2px", textAlign: "center" }}>
                                Actual FR
                            </div>
                            <TextTableField
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.frequencyRate}
                                placeholder={calcFrPreview}
                                onChange={(event) =>
                                    onChange(type, key, "frequencyRate", event.target.value)
                                }
                                style={{ textAlign: "center" }}
                            />
                        </div>
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <TextTableField
                            value={item.actual}
                            placeholder={item.targetMonth || item.plan || "0"}
                            onChange={(event) =>
                                onChange(type, key, "actual", event.target.value)
                            }
                            style={{ textAlign: "center" }}
                        />
                        {(item.targetMonth === "100%" || String(item.actual).endsWith("%")) && (
                            <span style={{ fontSize: "11px", fontWeight: "800", color: "#004d32" }}>%</span>
                        )}
                    </div>
                )}
            </td>

            {/* 7. AKSI (PROTECT MASTER FROM ACCIDENTAL DELETION) */}
            <td style={{ ...tableCellStyle, width: "6%", minWidth: "50px", textAlign: "center" }}>
                {isCustom ? (
                    <button
                        type="button"
                        onClick={() => onRemove(type, key)}
                        title="Hapus baris kustom ini"
                        style={{
                            padding: "4px 8px",
                            backgroundColor: "#fee2e2",
                            color: "#991b1b",
                            border: "1px solid #fca5a5",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "11px",
                            fontWeight: "700",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                        }}
                    >
                        🗑️ Hapus
                    </button>
                ) : (
                    <span
                        style={{
                            fontSize: "10.5px",
                            fontWeight: "700",
                            color: "#94a3b8",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            display: "inline-block",
                        }}
                    >
                        Master
                    </span>
                )}
            </td>
        </tr>
    );
}

function IndicatorSection({
    title,
    type,
    values,
    onChange,
    onAddCustom,
    onRemoveCustom,
    totalManHours = 0,
    totalKm = 0,
}) {
    const items = Object.values(values || {});
    const isLagging = type === "lagging";

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
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "9px 12px",
                    marginBottom: "12px",
                    fontSize: "12px",
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "15px" }}>ℹ️</span>
                    <span>
                        <strong>Acuan Target (Placeholder):</strong> Kolom <strong>Realisasi / Actual</strong> otomatis menggunakan nilai Target sebagai acuan default jika dibiarkan kosong. Definisi dan Keterangan standar bersifat Read-Only untuk mencegah kesalahan input.
                    </span>
                </div>
                <span
                    style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        backgroundColor: "#ecfdf5",
                        color: "#065f46",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        border: "1px solid #a7f3d0",
                    }}
                >
                    Auto-fallback Aktif
                </span>
            </div>

            <div
                className="table-responsive"
                style={{
                    width: "100%",
                    overflowX: "auto",
                    WebkitOverflowScrolling: "touch",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        backgroundColor: "#ffffff",
                        tableLayout: "auto",
                    }}
                >
                    <thead>
                        <tr style={{ backgroundColor: "#004d32", color: "#efff00" }}>
                            <th style={{ ...tableHeaderStyle, width: "4%", minWidth: "36px" }}>No</th>
                            <th
                                style={{
                                    ...tableHeaderStyle,
                                    textAlign: "left",
                                    width: isLagging ? "26%" : "32%",
                                    minWidth: isLagging ? "180px" : "200px",
                                }}
                            >
                                {isLagging ? "POINT YANG DIUKUR" : "Point yang Diukur / Indikator"}
                            </th>
                            <th
                                style={{
                                    ...tableHeaderStyle,
                                    textAlign: "left",
                                    width: isLagging ? "22%" : "26%",
                                    minWidth: isLagging ? "150px" : "160px",
                                }}
                            >
                                {isLagging ? "DEFINISI (FREQUENCY RATE / UNIT)" : "Definisi / Formula / Keterangan"}
                            </th>
                            <th style={{ ...tableHeaderStyle, width: isLagging ? "16%" : "10%", minWidth: isLagging ? "130px" : "80px" }}>
                                {isLagging ? "TARGET / ESTIMASI / MONTH" : "TARGET (month)"}
                            </th>
                            {isLagging ? (
                                <th style={{ ...tableHeaderStyle, width: "10%", minWidth: "85px" }}>
                                    KETERANGAN
                                </th>
                            ) : (
                                <th style={{ ...tableHeaderStyle, width: "10%", minWidth: "80px" }}>
                                    TARGET (Year)
                                </th>
                            )}
                            <th style={{ ...tableHeaderStyle, width: isLagging ? "18%" : "11%", minWidth: isLagging ? "140px" : "90px" }}>
                                Realisasi / Actual
                            </th>
                            <th style={{ ...tableHeaderStyle, width: "6%", minWidth: "50px", textAlign: "center" }}>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {items.map((item, index) => (
                            <IndicatorRow
                                key={item.id || item.name || index}
                                item={item}
                                index={index}
                                type={type}
                                onChange={onChange}
                                onRemove={onRemoveCustom}
                                totalManHours={totalManHours}
                                totalKm={totalKm}
                                allValues={values}
                            />
                        ))}
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
                    Target bulanan dan tahunan merujuk pada form standar Excel KPI. Kolom <strong>Realisasi / Actual</strong> otomatis terisi nilai Plan/Target (abu-abu) jika tidak diisi manual. Ingin menambah indikator baru? Klik tombol <strong>+ Add Table</strong>.
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
                width: "100%",
                maxWidth: "100%",
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

function NumberField({ label, name, value, placeholder, onChange, required = false, unit = "" }) {
    const displayValue = (value === null || value === undefined) ? "" : value;

    return (
        <div>
            <label
                style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "700",
                    marginBottom: "6px",
                    color: "#334155",
                }}
            >
                {label}
                {required && <span style={{ color: "#dc2626", marginLeft: "4px" }}>*</span>}
            </label>

            <div style={{ position: "relative" }}>
                <input
                    type="number"
                    min="0"
                    step="any"
                    name={name}
                    value={displayValue}
                    placeholder={placeholder !== undefined && placeholder !== null ? String(placeholder) : "0"}
                    onFocus={(e) => e.target.select()}
                    onChange={onChange}
                    required={required}
                    style={{
                        width: "100%",
                        height: "38px",
                        boxSizing: "border-box",
                        border: "1.5px solid #cbd5e1",
                        borderRadius: "8px",
                        padding: unit ? "0 34px 0 12px" : "0 12px",
                        outline: "none",
                        backgroundColor: displayValue !== "" ? "#ffffff" : "#f8fafc",
                        textAlign: "right",
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#0f172a",
                    }}
                />
                {unit && (
                    <span
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "10px",
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#64748b",
                        }}
                    >
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
}

function TextTableField({
    value,
    placeholder,
    onChange,
    required = false,
    isReadonly = false,
    style = {},
    type = "text",
    step,
    min,
}) {
    const displayValue = (value === null || value === undefined) ? "" : String(value);
    const displayPlaceholder = (placeholder === null || placeholder === undefined || placeholder === "") ? "0" : String(placeholder);

    return (
        <input
            type={type}
            step={step}
            min={min}
            required={required}
            readOnly={isReadonly}
            value={displayValue}
            placeholder={displayPlaceholder}
            onFocus={(e) => e.target.select()}
            onChange={onChange}
            className="placeholder:text-slate-400 placeholder:italic placeholder:font-normal placeholder:opacity-60"
            style={{
                width: "100%",
                minWidth: "60px",
                height: "32px",
                boxSizing: "border-box",
                border: "1.5px solid #cbd5e1",
                borderRadius: "6px",
                padding: "0 6px",
                outline: "none",
                backgroundColor: isReadonly ? "#f1f5f9" : (displayValue !== "" ? "#ffffff" : "#f8fafc"),
                textAlign: "center",
                fontSize: "12px",
                fontWeight: "700",
                color: isReadonly ? "#475569" : "#0f172a",
                transition: "all 0.15s ease",
                ...style,
            }}
        />
    );
}

const tableHeaderStyle = {
    padding: "10px 8px",
    fontSize: "11.5px",
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    whiteSpace: "normal",
    wordBreak: "break-word",
    lineHeight: "1.3",
};

const tableCellStyle = {
    padding: "8px 8px",
    border: "1px solid #f1f5f9",
    fontSize: "12px",
    textAlign: "center",
    color: "#334155",
    verticalAlign: "middle",
};
