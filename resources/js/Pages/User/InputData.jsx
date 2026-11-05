import UserSidebar from "../../Components/UserSidebar";
import UserHeaderProfile from "../../Components/UserHeaderProfile";
import React, { useMemo, useState, useEffect, useCallback } from "react";
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
    BookmarkCheck,
    Send,
    Trash2,
    AlertCircle,
    AlertTriangle,
    Check,
    Lock,
    Unlock,
    FileEdit,
    ChevronDown,
    ChevronUp,
    Clock,
    Sparkles,
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

export default function UserInputData({
    masterKpiTargets = [],
    year: initialYearProp = 2027,
    userDrafts: initialUserDrafts = [],
    existingSubmissions: initialExistingSubmissions = [],
    assignedRigs: initialAssignedRigs = [],
}) {
    const pageProps = usePage().props;
    const auth = pageProps.auth;
    const currentUser = auth?.user;
    const masterTargets =
        masterKpiTargets && masterKpiTargets.length > 0
            ? masterKpiTargets
            : pageProps.masterKpiTargets || [];

    const assignedRigs =
        initialAssignedRigs && initialAssignedRigs.length > 0
            ? initialAssignedRigs
            : pageProps.assignedRigs || currentUser?.assigned_rigs || [];

    const [userDrafts, setUserDrafts] = useState(
        initialUserDrafts && initialUserDrafts.length > 0
            ? initialUserDrafts
            : pageProps.userDrafts || []
    );
    const [existingSubmissions, setExistingSubmissions] = useState(
        initialExistingSubmissions && initialExistingSubmissions.length > 0
            ? initialExistingSubmissions
            : pageProps.existingSubmissions || []
    );

    const [currentDraftId, setCurrentDraftId] = useState(null);
    const [draftSavedEvidenceName, setDraftSavedEvidenceName] = useState(null);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [lastAutoSavedAt, setLastAutoSavedAt] = useState(null);
    const [autoSaveStatus, setAutoSaveStatus] = useState("idle"); // 'idle' | 'saving' | 'saved' | 'error'
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [lockedSubmission, setLockedSubmission] = useState(null);
    const [rejectedSubmission, setRejectedSubmission] = useState(null);
    const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState(false);
    const [showSubmittedWarningModal, setShowSubmittedWarningModal] = useState(false);
    const [showRejectionHistoryModal, setShowRejectionHistoryModal] = useState(false);
    const [draftPromptModal, setDraftPromptModal] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);
    const dismissedDraftsRef = React.useRef({});

    const showToast = (message, type = "success") => {
        setToastMessage({ message, type, time: Date.now() });
        setTimeout(() => {
            setToastMessage((prev) => (prev?.time && Date.now() - prev.time >= 4500 ? null : prev));
        }, 5000);
    };

    const [form, setForm] = useState({
        ...INITIAL_FORM,
        submitterName: currentUser?.name || "Teddy",
        submitterEmail: currentUser?.email || "teddy@besmindo.com",
        lagging: getDefaultLaggingState(),
        leading: getDefaultLeadingState(),
    });

    // Refs untuk auto-save background timer agar tidak terpengaruh stale closures
    const formRef = React.useRef(form);
    formRef.current = form;
    const hasUnsavedChangesRef = React.useRef(hasUnsavedChanges);
    hasUnsavedChangesRef.current = hasUnsavedChanges;
    const isSavingDraftRef = React.useRef(isSavingDraft);
    isSavingDraftRef.current = isSavingDraft;
    const isSubmittingRef = React.useRef(false);
    const currentDraftIdRef = React.useRef(currentDraftId);
    currentDraftIdRef.current = currentDraftId;
    const isLockedRef = React.useRef(isLocked);
    isLockedRef.current = isLocked;

    useEffect(() => {
        if (currentUser) {
            setForm((prev) => {
                const userName = currentUser.name || "";
                const userEmail = currentUser.email || "";
                const userArea =
                    currentUser.area ||
                    getAreaByHseCoord(userName) ||
                    getAreaByHseCoord(userEmail);

                let defaultSingleRig = prev.rigNo || "BMS # 02";
                let firstContract = prev.contractNo;

                // Prioritaskan assigned_rigs pengguna jika bukan admin
                if (currentUser.role !== "admin" && assignedRigs && assignedRigs.length > 0) {
                    defaultSingleRig = assignedRigs[0];
                    const matchedMaster = RIG_CONTRACT_MASTER.find((m) => m.rig === defaultSingleRig);
                    if (matchedMaster) {
                        firstContract = matchedMaster.contractNo;
                    }
                } else {
                    const areaRigs = userArea
                        ? RIG_CONTRACT_MASTER.filter(
                              (m) => m.area.toLowerCase() === userArea.toLowerCase()
                          )
                        : [];
                    firstContract = areaRigs[0]?.contractNo || prev.contractNo;
                    const matchingRigs = areaRigs.filter((m) => m.contractNo === firstContract);
                    defaultSingleRig = matchingRigs[0]?.rig || prev.rigNo || "BMS # 02";
                }

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
    }, [currentUser, assignedRigs]);

    // Sinkronisasi target plan master & Draf Auto-Restore per Rig & Bulan
    const monthIndex = Math.max(0, parseInt(form.period, 10) - 1 || 0);

    const resetFormToDefaults = useCallback((targets) => {
        setForm((prev) => {
            const nextLagging = { ...prev.lagging };
            Object.keys(nextLagging).forEach((k) => {
                const item = nextLagging[k];
                const dbPlan = targets.findDbTarget(
                    "lagging",
                    item.name || item.customName || k
                );
                const isCombo =
                    Boolean(item.isCaseFrCombo) ||
                    k === "lag_5" ||
                    k === "lag_6" ||
                    item.no === 5 ||
                    item.no === 6 ||
                    item.indicatorNo === "1.5" ||
                    item.indicatorNo === "1.6";
                nextLagging[k] = {
                    ...item,
                    isCaseFrCombo: isCombo,
                    plan: dbPlan !== null && dbPlan !== undefined ? String(dbPlan) : item.plan || "0",
                    targetMonth: dbPlan !== null && dbPlan !== undefined ? String(dbPlan) : item.targetMonth || "0",
                    targetFr: item.targetFr ?? (isCombo ? "0.00" : null),
                    planFr: item.planFr ?? (isCombo ? "0.00" : null),
                    actual: "",
                    frequencyRate: "",
                };
            });

            const nextLeading = { ...prev.leading };
            Object.keys(nextLeading).forEach((k) => {
                const item = nextLeading[k];
                const dbPlan = targets.findDbTarget(
                    "leading",
                    item.name || item.customName || k
                );
                nextLeading[k] = {
                    ...item,
                    plan: dbPlan !== null && dbPlan !== undefined ? String(dbPlan) : item.plan || "0",
                    targetMonth: dbPlan !== null && dbPlan !== undefined ? String(dbPlan) : item.targetMonth || "0",
                    actual: "",
                };
            });

            return {
                ...prev,
                manHoursPremisesPlan: targets.manHoursPremisesPlan,
                manHoursNonPremisesPlan: targets.manHoursNonPremisesPlan,
                kilometerPremisesPlan: targets.kilometerPremisesPlan,
                kilometerNonPremisesPlan: targets.kilometerNonPremisesPlan,
                employees: prev.employees || targets.employees,
                totalVehicles: prev.totalVehicles || targets.totalVehicles,
                manHoursPremisesActual: "",
                manHoursNonPremisesActual: "",
                kilometerPremisesActual: "",
                kilometerNonPremisesActual: "",
                remarks: "",
                lagging: nextLagging,
                leading: nextLeading,
            };
        });
    }, []);

    const loadDraftIntoForm = useCallback((draft) => {
        if (!draft) return;
        const moVal = String(draft.period).padStart(2, "0");
        const yrVal = String(draft.year);
        const moIndex = parseInt(moVal, 10) - 1;

        const targets = getRigMonthPlanTargets({
            masterKpiTargets: masterTargets,
            rigNo: draft.rig_no,
            contractNo: draft.contract_no,
            monthIndex: moIndex >= 0 && moIndex <= 11 ? moIndex : 0,
        });

        const comboKey = `${draft.rig_no}_${draft.contract_no}_${yrVal}_${moVal}`;
        if (dismissedDraftsRef.current) {
            delete dismissedDraftsRef.current[comboKey];
        }

        setCurrentDraftId(draft.id && !String(draft.id).startsWith("local_") ? draft.id : null);
        setDraftSavedEvidenceName(draft.evidence_file_name || draft.evidenceName || null);
        if (draft.updated_at || draft.savedAt) {
            const formattedTime = new Date(draft.updated_at || draft.savedAt).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
            });
            setLastAutoSavedAt(formattedTime);
        }
        setAutoSaveStatus("saved");
        setDraftPromptModal(null);

        if (draft.isLocal && draft.localData?.form) {
            setForm((prev) => ({
                ...prev,
                ...draft.localData.form,
                contractNo: draft.contract_no,
                rigNo: draft.rig_no,
                year: yrVal,
                period: moVal,
                manHoursPremisesPlan: targets.manHoursPremisesPlan,
                manHoursNonPremisesPlan: targets.manHoursNonPremisesPlan,
                kilometerPremisesPlan: targets.kilometerPremisesPlan,
                kilometerNonPremisesPlan: targets.kilometerNonPremisesPlan,
            }));
        } else {
            setForm((prev) => {
                const nextLagging = { ...getDefaultLaggingState() };
                Object.keys(nextLagging).forEach((k) => {
                    const item = nextLagging[k];
                    const dbPlan = targets.findDbTarget(
                        "lagging",
                        item.name || item.customName || k
                    );
                    const isCombo =
                        Boolean(item.isCaseFrCombo) ||
                        k === "lag_5" ||
                        k === "lag_6" ||
                        item.no === 5 ||
                        item.no === 6;

                    const matchInd = (
                        draft.lagging_indicators ||
                        draft.laggingIndicators ||
                        []
                    ).find(
                        (li) =>
                            String(li.indicator_no) === String(item.no) ||
                            (li.indicator_name &&
                                item.name &&
                                li.indicator_name.toLowerCase() === item.name.toLowerCase())
                    );

                    nextLagging[k] = {
                        ...item,
                        isCaseFrCombo: isCombo,
                        plan: dbPlan !== null && dbPlan !== undefined ? String(dbPlan) : item.plan || "0",
                        targetMonth: dbPlan !== null && dbPlan !== undefined ? String(dbPlan) : item.targetMonth || "0",
                        targetFr: item.targetFr ?? (isCombo ? "0.00" : null),
                        planFr: item.planFr ?? (isCombo ? "0.00" : null),
                        actual: matchInd ? String(matchInd.actual ?? "") : "",
                        frequencyRate: matchInd && matchInd.frequency_rate !== null ? String(matchInd.frequency_rate) : "",
                        notes: matchInd ? matchInd.notes || "" : item.notes || "",
                    };
                });

                // Masukkan juga custom indicators yang pernah disimpan di draf
                (draft.lagging_indicators || draft.laggingIndicators || []).forEach((li) => {
                    if (li.is_custom || String(li.indicator_no).startsWith("+") || (li.indicator_name && !Object.values(nextLagging).some((m) => m.name === li.indicator_name))) {
                        const cid = `custom_lagging_${li.id || Date.now()}`;
                        nextLagging[cid] = {
                            id: cid,
                            isCustom: true,
                            no: li.indicator_no || "+",
                            subNo: "",
                            name: li.indicator_name,
                            customName: li.indicator_name,
                            definition: li.definition || "",
                            unit: li.unit || "Case",
                            targetMonth: String(li.target_month ?? li.plan ?? "0"),
                            targetYear: String(li.target_year ?? "0"),
                            plan: String(li.plan ?? "0"),
                            actual: String(li.actual ?? ""),
                            frequencyRate: String(li.frequency_rate ?? ""),
                            notes: li.notes || "",
                        };
                    }
                });

                const nextLeading = { ...getDefaultLeadingState() };
                Object.keys(nextLeading).forEach((k) => {
                    const item = nextLeading[k];
                    const dbPlan = targets.findDbTarget(
                        "leading",
                        item.name || item.customName || k
                    );
                    const matchInd = (
                        draft.leading_indicators ||
                        draft.leadingIndicators ||
                        []
                    ).find(
                        (li) =>
                            String(li.indicator_no) === String(item.no) ||
                            (li.indicator_name &&
                                item.name &&
                                li.indicator_name.toLowerCase() === item.name.toLowerCase())
                    );

                    nextLeading[k] = {
                        ...item,
                        plan: dbPlan !== null && dbPlan !== undefined ? String(dbPlan) : item.plan || "0",
                        targetMonth: dbPlan !== null && dbPlan !== undefined ? String(dbPlan) : item.targetMonth || "0",
                        actual: matchInd ? String(matchInd.actual ?? "") : "",
                        notes: matchInd ? matchInd.notes || "" : item.notes || "",
                    };
                });

                (draft.leading_indicators || draft.leadingIndicators || []).forEach((li) => {
                    if (li.is_custom || String(li.indicator_no).startsWith("+") || (li.indicator_name && !Object.values(nextLeading).some((m) => m.name === li.indicator_name))) {
                        const cid = `custom_leading_${li.id || Date.now()}`;
                        nextLeading[cid] = {
                            id: cid,
                            isCustom: true,
                            no: li.indicator_no || "+",
                            subNo: "",
                            name: li.indicator_name,
                            customName: li.indicator_name,
                            definition: li.definition || "",
                            unit: li.unit || "Activity",
                            targetMonth: String(li.target_month ?? li.plan ?? "0"),
                            targetYear: String(li.target_year ?? "0"),
                            plan: String(li.plan ?? "0"),
                            actual: String(li.actual ?? ""),
                            notes: li.notes || "",
                        };
                    }
                });

                const mh = draft.man_hours || draft.manHours || {};

                return {
                    ...prev,
                    contractNo: draft.contract_no,
                    rigNo: draft.rig_no,
                    locationDistrict: draft.location_district || prev.locationDistrict,
                    year: yrVal,
                    period: moVal,
                    date: draft.report_date ? draft.report_date.substring(0, 10) : `${yrVal}-${moVal}-01`,
                    manHoursPremisesPlan: targets.manHoursPremisesPlan,
                    manHoursNonPremisesPlan: targets.manHoursNonPremisesPlan,
                    kilometerPremisesPlan: targets.kilometerPremisesPlan,
                    kilometerNonPremisesPlan: targets.kilometerNonPremisesPlan,
                    employees: mh.total_employees ?? targets.employees,
                    totalVehicles: mh.total_vehicles ?? targets.totalVehicles,
                    manHoursPremisesActual:
                        mh.premises_actual !== undefined && mh.premises_actual !== null
                            ? String(mh.premises_actual)
                            : "",
                    manHoursNonPremisesActual:
                        mh.non_premises_actual !== undefined && mh.non_premises_actual !== null
                            ? String(mh.non_premises_actual)
                            : "",
                    kilometerPremisesActual:
                        mh.kilometer_premises_actual !== undefined &&
                        mh.kilometer_premises_actual !== null
                            ? String(mh.kilometer_premises_actual)
                            : "",
                    kilometerNonPremisesActual:
                        mh.kilometer_non_premises_actual !== undefined &&
                        mh.kilometer_non_premises_actual !== null
                            ? String(mh.kilometer_non_premises_actual)
                            : "",
                    remarks: draft.remarks || "",
                    lagging: nextLagging,
                    leading: nextLeading,
                };
            });
        }

        const moLabel = MONTHS.find((m) => m.value === moVal)?.label || `Bulan ${moVal}`;
        if (draft.status === "rejected" || draft.status === "needs_revision") {
            showToast(
                `Data revisi untuk Rig ${draft.rig_no} periode ${moLabel} ${yrVal} dimuat. Silakan sesuaikan data perbaikan!`,
                "info"
            );
        } else {
            showToast(
                `Draf untuk Rig ${draft.rig_no} periode ${moLabel} ${yrVal} berhasil dimuat ke formulir!`,
                "success"
            );
        }
    }, [masterTargets]);

    // Baca query param draft_id & report_id dari URL (misalnya dari tombol 'Lanjutkan' di /user/drafts atau 'Perbaiki / Edit' di /user/history)
    useEffect(() => {
        if (typeof window === "undefined") return;
        const searchParams = new URLSearchParams(window.location.search);
        const draftIdParam = searchParams.get("draft_id");
        const reportIdParam = searchParams.get("report_id");

        if (draftIdParam) {
            const foundDraft = userDrafts.find((d) => String(d.id) === String(draftIdParam));
            if (foundDraft) {
                loadDraftIntoForm(foundDraft);
            }
        } else if (reportIdParam) {
            const foundSub = existingSubmissions.find((s) => String(s.id) === String(reportIdParam));
            if (foundSub) {
                loadDraftIntoForm(foundSub);
            }
        }
    }, [userDrafts, existingSubmissions, loadDraftIntoForm]);

    const handleDismissDraftPrompt = () => {
        if (draftPromptModal) {
            const key = `${draftPromptModal.rig_no}_${draftPromptModal.contract_no}_${draftPromptModal.year}_${String(draftPromptModal.period).padStart(2, "0")}`;
            dismissedDraftsRef.current[key] = true;
        }
        setDraftPromptModal(null);
    };

    useEffect(() => {
        const targets = getRigMonthPlanTargets({
            masterKpiTargets: masterTargets,
            rigNo: form.rigNo,
            contractNo: form.contractNo,
            monthIndex,
        });

        // 1. Cek SKENARIO: Apakah kombinasi ini sudah pernah di-submit secara resmi
        const submitted = existingSubmissions.find(
            (s) =>
                s.rig_no === form.rigNo &&
                s.contract_no === form.contractNo &&
                String(s.year) === String(form.year) &&
                String(s.period).padStart(2, "0") === String(form.period).padStart(2, "0")
        );

        const isStatusRejected =
            submitted &&
            (submitted.status === "rejected" || submitted.status === "needs_revision");
        const isStatusSubmittedOrApproved = submitted && !isStatusRejected;

        if (isStatusSubmittedOrApproved) {
            // Skenario A (Submitted / Approved): Kunci form secara ketat & munculkan modal dialog peringatan duplikasi
            setIsLocked(true);
            setLockedSubmission(submitted);
            setRejectedSubmission(null);
            setCurrentDraftId(null);
            setDraftSavedEvidenceName(null);
            setDraftPromptModal(null);
            setShowSubmittedWarningModal(true);
            return;
        }

        setShowSubmittedWarningModal(false);

        if (isStatusRejected) {
            // Skenario REJECTED (Perlu Revisi): JANGAN kunci form! Izinkan PIC untuk mengedit & resubmit
            setIsLocked(false);
            setLockedSubmission(null);
            setRejectedSubmission(submitted);
            setDraftPromptModal(null);

            // Jika form belum memuat data dari laporan rejected ini, otomatis muat ke form
            if (currentDraftId !== submitted.id) {
                loadDraftIntoForm(submitted);
            }
            return;
        }

        // Jika bukan submitted/approved maupun rejected:
        setIsLocked(false);
        setLockedSubmission(null);
        setRejectedSubmission(null);

        // 2. Cek SKENARIO B: Apakah ada draft tersimpan untuk kombinasi ini
        const serverDraft = userDrafts.find(
            (d) =>
                d.rig_no === form.rigNo &&
                d.contract_no === form.contractNo &&
                String(d.year) === String(form.year) &&
                String(d.period).padStart(2, "0") === String(form.period).padStart(2, "0")
        );

        const localKey = currentUser
            ? `hse_draft_${currentUser.id}_${form.contractNo}_${form.rigNo}_${form.year}_${form.period}`
            : null;
        let localDraft = null;
        if (localKey) {
            try {
                const raw = localStorage.getItem(localKey);
                if (raw) localDraft = JSON.parse(raw);
            } catch (e) {}
        }

        const foundDraft = serverDraft || (localDraft?.form ? {
            id: localDraft.currentDraftId || `local_${Date.now()}`,
            rig_no: form.rigNo,
            contract_no: form.contractNo,
            year: form.year,
            period: form.period,
            isLocal: true,
            updated_at: localDraft.savedAt,
            remarks: localDraft.form.remarks,
            evidence_file_name: localDraft.draftSavedEvidenceName,
            localData: localDraft,
        } : null);

        const comboKey = `${form.rigNo}_${form.contractNo}_${form.year}_${String(form.period).padStart(2, "0")}`;

        if (foundDraft) {
            if (currentDraftId && currentDraftId === foundDraft.id) {
                // Draft ini sudah aktif sedang diedit di form
                return;
            }

            if (dismissedDraftsRef.current[comboKey]) {
                // Pengguna sudah memilih untuk tidak memuat draf ini untuk kombinasi saat ini
                resetFormToDefaults(targets);
                return;
            }

            // Tampilkan pop-up dialog konfirmasi / informasi Skenario B
            setDraftPromptModal(foundDraft);
            resetFormToDefaults(targets);
        } else {
            setCurrentDraftId(null);
            setDraftSavedEvidenceName(null);
            setDraftPromptModal(null);
            setAutoSaveStatus("idle");
            resetFormToDefaults(targets);
        }
    }, [form.rigNo, form.contractNo, form.period, form.year, masterTargets, userDrafts, existingSubmissions, resetFormToDefaults]);

    // Local Storage Debounced Backup
    useEffect(() => {
        if (!currentUser || isLocked) return;
        const key = `hse_draft_${currentUser.id}_${form.contractNo}_${form.rigNo}_${form.year}_${form.period}`;
        const timeout = setTimeout(() => {
            try {
                localStorage.setItem(
                    key,
                    JSON.stringify({
                        form,
                        currentDraftId,
                        draftSavedEvidenceName,
                        savedAt: new Date().toISOString(),
                        savedTimeLabel: new Date().toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                    })
                );
            } catch (e) {
                console.warn("Could not save to localStorage", e);
            }
        }, 800);

        return () => clearTimeout(timeout);
    }, [form, currentDraftId, draftSavedEvidenceName, currentUser, isLocked]);

    // Auto-Save interval (tiap 25 detik jika ada perubahan input)
    useEffect(() => {
        if (!currentUser || isLocked) return;

        const interval = setInterval(() => {
            if (
                hasUnsavedChangesRef.current &&
                !isSavingDraftRef.current &&
                !isSubmittingRef.current &&
                !isLockedRef.current
            ) {
                handleSaveDraft({ isAutoSave: true });
            }
        }, 25000);

        return () => clearInterval(interval);
    }, [currentUser, isLocked]);

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
        let candidateRigs = rigs && rigs.length > 0 ? rigs : [form.rigNo || "BMS # 02"];
        if (currentUser?.role !== "admin" && assignedRigs && assignedRigs.length > 0) {
            const filtered = candidateRigs.filter((r) => assignedRigs.includes(r));
            if (filtered.length > 0) return filtered;
            return assignedRigs;
        }
        return candidateRigs;
    }, [form.contractNo, form.rigNo, assignedRigs, currentUser]);

    // Audit Trail: Informasi Pembuat & Pengedit Terakhir (Transparansi Form)
    const activeReportObj = useMemo(() => {
        if (rejectedSubmission) return rejectedSubmission;
        if (currentDraftId) {
            return userDrafts.find((d) => d.id === currentDraftId) || null;
        }
        if (lockedSubmission) return lockedSubmission;
        return null;
    }, [rejectedSubmission, currentDraftId, lockedSubmission, userDrafts]);

    const auditTrailInfo = useMemo(() => {
        if (!activeReportObj) return null;
        const creatorName =
            activeReportObj.creator?.name ||
            activeReportObj.submitter_name ||
            activeReportObj.submitterName ||
            currentUser?.name ||
            "PIC Kru Lapangan";
        const updaterName =
            activeReportObj.updater?.name ||
            creatorName;
        const rawDate = activeReportObj.updated_at || activeReportObj.created_at;
        const formattedDate = rawDate
            ? new Date(rawDate).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : "Baru saja";

        return {
            creatorName,
            updaterName,
            formattedDate,
        };
    }, [activeReportObj, currentUser]);

    // Dynamic Rejection Note per Revisi: Selalu ambil catatan penolakan paling terbaru
    const latestAdminRejectionNote = useMemo(() => {
        if (!rejectedSubmission) return "";
        if (rejectedSubmission.latest_admin_note) {
            return rejectedSubmission.latest_admin_note;
        }
        if (rejectedSubmission.rejection_logs && rejectedSubmission.rejection_logs.length > 0) {
            const sortedLogs = [...rejectedSubmission.rejection_logs].sort(
                (a, b) => (b.revision_number || 0) - (a.revision_number || 0)
            );
            return sortedLogs[0]?.rejection_reason || rejectedSubmission.rejection_reason;
        }
        return (
            rejectedSubmission.rejection_reason ||
            "Tidak ada catatan spesifik dari admin. Mohon tinjau kembali seluruh metrik dan indikator keselamatan."
        );
    }, [rejectedSubmission]);

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
        setHasUnsavedChanges(true);
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
        setHasUnsavedChanges(true);
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
        setHasUnsavedChanges(true);
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
        setHasUnsavedChanges(true);
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

    /* ============================================================
       MEKANISME SIMPAN SEBAGAI DRAFT & AUTO-SAVE
    ============================================================ */
    const handleSaveDraft = async ({ isAutoSave = false } = {}) => {
        if (isLockedRef.current || isSubmittingRef.current || isSavingDraftRef.current) {
            return;
        }

        const currentForm = formRef.current;
        if (!currentForm.rigNo || !currentForm.contractNo) return;

        if (!isAutoSave) {
            setIsSavingDraft(true);
        } else {
            setAutoSaveStatus("saving");
        }

        try {
            const payload = {
                is_draft: true,
                status: "draft",
                draft_id: currentDraftIdRef.current,
                date: currentForm.date,
                contractNo: currentForm.contractNo,
                rigNo: currentForm.rigNo,
                locationDistrict: currentForm.locationDistrict,
                period: currentForm.period,
                year: currentForm.year,
                submitterName: currentForm.submitterName,
                submitterEmail: currentForm.submitterEmail,

                manHoursPremisesPlan: Number(currentForm.manHoursPremisesPlan) || 0,
                manHoursNonPremisesPlan: Number(currentForm.manHoursNonPremisesPlan) || 0,
                manHoursPremisesActual:
                    currentForm.manHoursPremisesActual !== "" && currentForm.manHoursPremisesActual !== null
                        ? Number(currentForm.manHoursPremisesActual)
                        : null,
                manHoursNonPremisesActual:
                    currentForm.manHoursNonPremisesActual !== "" && currentForm.manHoursNonPremisesActual !== null
                        ? Number(currentForm.manHoursNonPremisesActual)
                        : null,

                totalEmployees: Number(currentForm.employees) || 72,
                totalVehicles: Number(currentForm.totalVehicles) || 9,

                kilometerPremisesPlan: Number(currentForm.kilometerPremisesPlan) || 0,
                kilometerNonPremisesPlan: Number(currentForm.kilometerNonPremisesPlan) || 0,
                kilometerPremisesActual:
                    currentForm.kilometerPremisesActual !== "" && currentForm.kilometerPremisesActual !== null
                        ? Number(currentForm.kilometerPremisesActual)
                        : null,
                kilometerNonPremisesActual:
                    currentForm.kilometerNonPremisesActual !== "" && currentForm.kilometerNonPremisesActual !== null
                        ? Number(currentForm.kilometerNonPremisesActual)
                        : null,

                lagging: Object.values(currentForm.lagging || {}).map((item, index) => {
                    const planVal =
                        item.targetMonth !== undefined && item.targetMonth !== ""
                            ? item.targetMonth
                            : item.plan || "0";
                    return {
                        name: item.name || item.customName || `lag_${index + 1}`,
                        indicator_name: item.customName || item.name || `lag_${index + 1}`,
                        indicator_no: item.no || index + 1,
                        target_month: item.targetMonth ?? planVal,
                        target_year: item.targetYear ?? "0",
                        plan: planVal,
                        actual:
                            item.actual !== "" && item.actual !== null && item.actual !== undefined
                                ? item.actual
                                : null,
                        frequency_rate: item.frequencyRate || null,
                        definition: item.definition || "",
                        notes: item.notes || item.keterangan || "",
                        keterangan: item.keterangan || item.notes || "",
                        unit: item.unit || "Case",
                    };
                }),

                leading: Object.values(currentForm.leading || {}).map((item, index) => {
                    const targetMonth =
                        item.targetMonth !== undefined && item.targetMonth !== null
                            ? String(item.targetMonth)
                            : "";
                    const targetYear =
                        item.targetYear !== undefined && item.targetYear !== null
                            ? String(item.targetYear)
                            : "";
                    const planVal =
                        targetMonth !== ""
                            ? targetMonth
                            : item.plan !== undefined && item.plan !== null
                            ? String(item.plan)
                            : "";
                    return {
                        name: item.name || item.customName || `lead_${index + 1}`,
                        indicator_name: item.customName || item.name || `lead_${index + 1}`,
                        indicator_no: item.no || "",
                        is_parent: !item.isParent,
                        parent_name: item.parentId
                            ? currentForm.leading[item.parentId]?.customName ||
                              currentForm.leading[item.parentId]?.name ||
                              ""
                            : null,
                        sub_label: item.subNo || "",
                        target_month: targetMonth,
                        target_year: targetYear,
                        plan: planVal,
                        actual: item.isParent
                            ? ""
                            : item.actual !== "" && item.actual !== null && item.actual !== undefined
                            ? item.actual
                            : null,
                        definition: item.definition || "",
                        notes: item.definition || "",
                        unit: item.unit || "Activity",
                    };
                }),

                remarks: currentForm.remarks || "",
            };

            const formData = new FormData();
            formData.append("data", JSON.stringify(payload));
            formData.append("is_draft", "1");
            formData.append("status", "draft");
            if (currentDraftIdRef.current) {
                formData.append("draft_id", String(currentDraftIdRef.current));
            }
            if (evidenceFile) {
                formData.append("evidence_file", evidenceFile);
            }

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

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
                const errorMsg = result?.message || "Gagal menyimpan draft laporan.";
                if (!isAutoSave) {
                    alert(errorMsg);
                }
                setAutoSaveStatus("error");
                return;
            }

            const newDraftId = result.draft_id || result.data?.id;
            if (newDraftId) {
                setCurrentDraftId(newDraftId);
            }

            const savedTime =
                result.saved_at ||
                new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
            setLastAutoSavedAt(savedTime);
            setAutoSaveStatus("saved");
            setHasUnsavedChanges(false);

            if (evidenceFile) {
                setDraftSavedEvidenceName(evidenceFile.name);
                setEvidenceFile(null);
                const el = document.getElementById("evidence-file-input");
                if (el) el.value = "";
            }

            if (result.data) {
                setUserDrafts((prev) => {
                    const filtered = prev.filter((d) => d.id !== result.data.id);
                    return [result.data, ...filtered];
                });
            }

            if (!isAutoSave) {
                showToast(`Draft berhasil disimpan pada ${savedTime}! Data tersimpan aman di akun Anda.`, "success");
            }
        } catch (error) {
            console.error("Save draft error:", error);
            setAutoSaveStatus("error");
            if (!isAutoSave) {
                alert("Terjadi kendala saat menyimpan draft: " + (error?.message || "Periksa koneksi jaringan."));
            }
        } finally {
            setIsSavingDraft(false);
        }
    };

    /* ============================================================
       SUBMIT DATA KPI RESMI DENGAN POP-UP KONFIRMASI
    ============================================================ */
    const handleOpenSubmitModal = (e) => {
        if (e) e.preventDefault();

        // 1. Cek duplikasi jika data sudah pernah disubmit / diapprove resmi
        const activeSubmission = existingSubmissions.find(
            (s) =>
                s.rig_no === form.rigNo &&
                s.contract_no === form.contractNo &&
                String(s.year) === String(form.year) &&
                String(s.period).padStart(2, "0") === String(form.period).padStart(2, "0") &&
                (s.status === "pending" || s.status === "approved" || s.status === "submitted")
        );

        if (activeSubmission || isLocked) {
            showToast(
                `Data untuk Rig ${form.rigNo} periode ${selectedMonthLabel} ${form.year} sudah pernah dikirim (Submitted). Tidak dapat melakukan penginputan ulang untuk mencegah duplikasi data.`,
                "error"
            );
            setIsLocked(true);
            setLockedSubmission(activeSubmission || lockedSubmission);
            return;
        }

        if (!evidenceFile && !draftSavedEvidenceName) {
            alert("File dokumen bukti penginputan (Evidence File) WAJIB dilampirkan sebelum mengirim laporan KPI!");
            const uploadSection = document.getElementById("evidence-file-container");
            if (uploadSection) {
                uploadSection.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        setShowConfirmSubmitModal(true);
    };

    const executeSubmit = async () => {
        setShowConfirmSubmitModal(false);
        setIsSubmitting(true);
        isSubmittingRef.current = true;

        const resolveActual = (actualVal, planVal) => {
            if (actualVal !== "" && actualVal !== null && actualVal !== undefined) {
                return Number(actualVal);
            }
            return Number(planVal) || 0;
        };

        try {
            const payload = {
                is_draft: false,
                status: "pending",
                draft_id: currentDraftId || rejectedSubmission?.id || null,
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

                totalEmployees: Number(form.employees) || 72,
                totalVehicles: Number(form.totalVehicles) || 9,

                kilometerPremisesPlan: Number(form.kilometerPremisesPlan) || 0,
                kilometerNonPremisesPlan: Number(form.kilometerNonPremisesPlan) || 0,
                kilometerPremisesActual: resolveActual(form.kilometerPremisesActual, form.kilometerPremisesPlan),
                kilometerNonPremisesActual: resolveActual(form.kilometerNonPremisesActual, form.kilometerNonPremisesPlan),

                lagging: Object.values(form.lagging || {}).map((item, index) => {
                    const planVal =
                        item.targetMonth !== undefined && item.targetMonth !== ""
                            ? item.targetMonth
                            : item.plan || "0";
                    const isTri =
                        item.no === 5 ||
                        item.indicatorNo === "1.5" ||
                        (item.name && item.name.includes("TOTAL RECORDABLE INJURY"));
                    const isMvc =
                        item.no === 6 ||
                        item.indicatorNo === "1.6" ||
                        (item.name && item.name.includes("MOTOR VEHICLE CRASH"));
                    const isCaseFr = Boolean(item.isCaseFrCombo) || isTri || isMvc;

                    const sumTri =
                        (Number(form.lagging?.["lag_1"]?.actual) || 0) +
                        (Number(form.lagging?.["lag_2"]?.actual) || 0) +
                        (Number(form.lagging?.["lag_3"]?.actual) || 0) +
                        (Number(form.lagging?.["lag_4"]?.actual) || 0);

                    let actVal = item.actual;
                    if (actVal === "" || actVal === null || actVal === undefined) {
                        if (isTri && sumTri > 0) {
                            actVal = String(sumTri);
                        } else {
                            actVal = planVal;
                        }
                    }

                    const planFrVal =
                        item.targetFr !== undefined && item.targetFr !== ""
                            ? item.targetFr
                            : item.planFr || "0.00";
                    let frVal = item.frequencyRate;
                    if (frVal === "" || frVal === null || frVal === undefined) {
                        if (isCaseFr) {
                            const totalHours =
                                resolveActual(form.manHoursPremisesActual, form.manHoursPremisesPlan) +
                                resolveActual(form.manHoursNonPremisesActual, form.manHoursNonPremisesPlan);
                            const totalKm =
                                resolveActual(form.kilometerPremisesActual, form.kilometerPremisesPlan) +
                                resolveActual(form.kilometerNonPremisesActual, form.kilometerNonPremisesPlan);
                            const c = Number(actVal) || 0;

                            if (isMvc) {
                                frVal = totalKm > 0 ? ((c * 1000000) / totalKm).toFixed(2) : planFrVal;
                            } else if (
                                isTri ||
                                ["1.1", "1.2", "1.3", "1.4"].includes(String(item.indicator_no)) ||
                                [1, 2, 3, 4].includes(Number(item.indicator_no))
                            ) {
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

                leading: Object.values(form.leading || {}).map((item, index) => {
                    const targetMonth =
                        item.targetMonth !== undefined && item.targetMonth !== null
                            ? String(item.targetMonth)
                            : "";
                    const targetYear =
                        item.targetYear !== undefined && item.targetYear !== null
                            ? String(item.targetYear)
                            : "";
                    const planVal =
                        targetMonth !== ""
                            ? targetMonth
                            : item.plan !== undefined && item.plan !== null
                            ? String(item.plan)
                            : "";
                    const actVal =
                        item.actual !== "" && item.actual !== null && item.actual !== undefined
                            ? String(item.actual)
                            : planVal;
                    return {
                        name: item.name || item.customName || `lead_${index + 1}`,
                        indicator_name: item.customName || item.name || `lead_${index + 1}`,
                        indicator_no: item.no || "",
                        is_parent: !item.isParent,
                        parent_name: item.parentId
                            ? form.leading[item.parentId]?.customName || form.leading[item.parentId]?.name || ""
                            : null,
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

                remarks: form.remarks || "",
            };

            const formData = new FormData();
            formData.append("data", JSON.stringify(payload));
            formData.append("is_draft", "0");
            formData.append("status", "pending");
            if (currentDraftId) {
                formData.append("draft_id", String(currentDraftId));
            }
            if (evidenceFile) {
                formData.append("evidence_file", evidenceFile);
            }

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

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
                let errorMsg = result?.message || "Data HSE gagal disubmit. Periksa kembali form input Anda.";
                if (result?.errors) {
                    const firstError = Object.values(result.errors)[0];
                    if (firstError?.length > 0) errorMsg = firstError[0];
                }
                showToast(errorMsg, "error");
                if (result?.is_duplicate) {
                    setIsLocked(true);
                    setLockedSubmission({
                        rig_no: form.rigNo,
                        contract_no: form.contractNo,
                        year: form.year,
                        period: form.period,
                        status: "submitted",
                    });
                }
                alert(errorMsg);
                setIsSubmitting(false);
                isSubmittingRef.current = false;
                return;
            }

            // Hapus localStorage draft untuk rig & periode ini
            if (currentUser) {
                const storageKey = `hse_draft_${currentUser.id}_${form.contractNo}_${form.rigNo}_${form.year}_${form.period}`;
                try {
                    localStorage.removeItem(storageKey);
                } catch (e) {}
            }

            // Hapus dari list userDrafts
            if (currentDraftId) {
                setUserDrafts((prev) => prev.filter((d) => d.id !== currentDraftId));
            }

            const isResubmission = Boolean(rejectedSubmission);

            // Tambahkan / perbarui existingSubmissions & kunci form
            const newSubmission = {
                id: result.data?.id || currentDraftId || rejectedSubmission?.id,
                rig_no: form.rigNo,
                contract_no: form.contractNo,
                year: form.year,
                period: form.period,
                status: "submitted",
                created_at: new Date().toISOString(),
                ...result.data,
            };
            setExistingSubmissions((prev) => [
                newSubmission,
                ...prev.filter((s) => s.id !== newSubmission.id),
            ]);
            setIsLocked(true);
            setLockedSubmission(newSubmission);
            setRejectedSubmission(null);
            setCurrentDraftId(null);
            setEvidenceFile(null);
            setDraftSavedEvidenceName(null);

            const currentMoLabel = MONTHS.find((m) => m.value === form.period)?.label || form.period;
            if (isResubmission) {
                showToast(
                    `Laporan perbaikan untuk Rig ${form.rigNo} periode ${currentMoLabel} ${form.year} berhasil disubmit ulang (Status: SUBMITTED)!`,
                    "success"
                );
                alert(
                    `✅ Data HSE Rig ${form.rigNo} periode ${currentMoLabel} ${form.year} BERHASIL DISUBMIT ULANG!\n\nLaporan perbaikan telah resmi diteruskan kembali ke Admin & Supervisor untuk proses approval ulang. Formulir kini dikunci.`
                );
            } else {
                showToast(
                    `Data KPI untuk Rig ${form.rigNo} periode ${currentMoLabel} ${form.year} berhasil disubmit (Status: SUBMITTED)!`,
                    "success"
                );
                alert(
                    `✅ Data HSE Rig ${form.rigNo} periode ${currentMoLabel} ${form.year} BERHASIL DISUBMIT!\n\nLaporan telah resmi diteruskan ke Admin & Supervisor untuk proses approval. Formulir kini dikunci.`
                );
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            console.error("ERROR SUBMIT HSE:", error);
            alert("Terjadi kendala saat mengirim data HSE: " + (error?.message || "Silakan periksa koneksi."));
        } finally {
            setIsSubmitting(false);
            isSubmittingRef.current = false;
        }
    };

    /* ============================================================
       HAPUS DRAFT
    ============================================================ */
    const handleDeleteDraft = async (draft) => {
        const moLabel =
            MONTHS.find((m) => m.value === String(draft.period).padStart(2, "0"))?.label ||
            draft.period;
        if (
            !window.confirm(
                `Apakah Anda yakin ingin menghapus Draf Laporan untuk Rig ${draft.rig_no} Periode ${moLabel} ${draft.year}? Tindakan ini permanen.`
            )
        ) {
            return;
        }

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
            const response = await fetch(`/hse-report/draft/${draft.id}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken || "",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
            });

            if (!response.ok) {
                const res = await response.json().catch(() => null);
                alert(res?.message || "Gagal menghapus draf laporan.");
                return;
            }

            // Hapus dari state
            setUserDrafts((prev) => prev.filter((d) => d.id !== draft.id));

            // Hapus dari localStorage
            if (currentUser) {
                const key = `hse_draft_${currentUser.id}_${draft.contract_no}_${draft.rig_no}_${draft.year}_${String(
                    draft.period
                ).padStart(2, "0")}`;
                try {
                    localStorage.removeItem(key);
                } catch (e) {}
            }

            if (currentDraftId === draft.id) {
                setCurrentDraftId(null);
                setDraftSavedEvidenceName(null);
                setLastAutoSavedAt(null);
                showToast("Draf yang sedang aktif telah dihapus. Formulir direset.", "info");
            } else {
                showToast("Draf laporan berhasil dihapus.", "success");
            }
        } catch (error) {
            console.error("Delete draft error:", error);
            alert("Gagal menghapus draf: " + (error?.message || "Periksa koneksi jaringan."));
        }
    };

    /* ============================================================
       LANJUTKAN EDIT DRAFT
    ============================================================ */
    const handleContinueDraft = (draft) => {
        loadDraftIntoForm(draft);
        const formEl = document.getElementById("main-input-form");
        if (formEl) {
            formEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handleReset = () => {
        if (isLocked) {
            alert("Formulir terkunci karena laporan sudah disubmit.");
            return;
        }

        if (window.confirm("Apakah Anda yakin ingin mengosongkan seluruh isian formulir?")) {
            setForm({
                ...INITIAL_FORM,
                lagging: getDefaultLaggingState(),
                leading: getDefaultLeadingState(),
            });
            setEvidenceFile(null);
            setDraftSavedEvidenceName(null);
            setCurrentDraftId(null);
            const fileEl = document.getElementById("evidence-file-input");
            if (fileEl) fileEl.value = "";
            setSubmitSuccess(false);
            setHasUnsavedChanges(false);
            showToast("Formulir telah direset.", "info");
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

            <UserSidebar />

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
                                    Input KPI & HSE Performance (PIC)
                                </h1>
                                <p
                                    style={{
                                        fontSize: "13.5px",
                                        color: "#64748b",
                                        margin: 0,
                                    }}
                                >
                                    Form resmi penginputan realisasi HSE lapangan oleh Person in Charge (PIC) / HSE Coordinator.
                                </p>
                            </div>

                            {/* PROFIL PENGGUNA DI TOPBAR / HEADER (MULTI-TAB SAFE) */}
                            <UserHeaderProfile user={currentUser} assignedRigs={assignedRigs} />
                        </div>

                        {/* FLOATING TOAST NOTIFICATION */}
                        {toastMessage && (
                            <div
                                style={{
                                    backgroundColor: toastMessage.type === "success" ? "#065f46" : toastMessage.type === "info" ? "#0284c7" : "#b91c1c",
                                    color: "#ffffff",
                                    padding: "10px 18px",
                                    borderRadius: "8px",
                                    marginBottom: "16px",
                                    fontSize: "13px",
                                    fontWeight: "700",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
                                    transition: "all 0.3s ease",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <Sparkles size={16} />
                                    <span>{toastMessage.message}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setToastMessage(null)}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "#ffffff",
                                        cursor: "pointer",
                                        fontSize: "15px",
                                        fontWeight: "800",
                                        padding: "0 4px",
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {/* NOTIFIKASI DRAF TERSIMPAN RINGKAS */}
                        {userDrafts.length > 0 && !currentDraftId && !rejectedSubmission && (
                            <div
                                style={{
                                    backgroundColor: "#f0fdf4",
                                    border: "1px solid #86efac",
                                    borderRadius: "10px",
                                    padding: "10px 18px",
                                    marginBottom: "18px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    flexWrap: "wrap",
                                    gap: "10px",
                                    boxShadow: "0 1px 3px rgba(0, 77, 50, 0.05)",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <FileEdit size={18} color="#16a34a" />
                                    <span style={{ fontSize: "13px", color: "#166534", fontWeight: "600" }}>
                                        Anda memiliki <strong>{userDrafts.length} draf laporan tersimpan</strong> yang belum dikirim.
                                    </span>
                                </div>
                                <a
                                    href="/user/drafts"
                                    style={{
                                        color: "#004d32",
                                        fontWeight: "800",
                                        fontSize: "12.5px",
                                        textDecoration: "underline",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}
                                >
                                    Buka Menu Draf Laporan &rarr;
                                </a>
                            </div>
                        )}

                        {/* AUDIT TRAIL & TRANSPARANSI LOG BAR */}
                        {auditTrailInfo && (
                            <div
                                style={{
                                    backgroundColor: "#f8fafc",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "9px",
                                    padding: "10px 16px",
                                    marginBottom: "18px",
                                    fontSize: "12.5px",
                                    color: "#334155",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                                }}
                            >
                                <Info size={16} color="#0284c7" style={{ flexShrink: 0 }} />
                                <span style={{ lineHeight: "1.5" }}>
                                    <strong>Laporan ini dibuat oleh:</strong> {auditTrailInfo.creatorName} |{" "}
                                    <strong>Terakhir diperbarui oleh:</strong> {auditTrailInfo.updaterName} pada{" "}
                                    {auditTrailInfo.formattedDate}
                                </span>
                            </div>
                        )}

                        <form id="main-input-form" onSubmit={handleOpenSubmitModal}>
                            {/* BANNER FORMLIR TERKUNCI (JIKA SUDAH DISUBMIT / APPROVED - SKENARIO A) */}
                            {isLocked && lockedSubmission && (
                                lockedSubmission.status === "approved" ? (
                                    <div
                                        style={{
                                            backgroundColor: "#f0fdf4",
                                            border: "1.5px solid #86efac",
                                            borderRadius: "10px",
                                            padding: "16px 20px",
                                            marginBottom: "20px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            flexWrap: "wrap",
                                            gap: "14px",
                                            boxShadow: "0 2px 8px rgba(22, 101, 52, 0.08)",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                            <div
                                                style={{
                                                    backgroundColor: "#16a34a",
                                                    color: "#ffffff",
                                                    width: "40px",
                                                    height: "40px",
                                                    borderRadius: "8px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <CheckCircle2 size={22} color="#ffffff" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "14.5px", fontWeight: "800", color: "#166534", marginBottom: "3px" }}>
                                                    Laporan Ini Telah Disetujui (Approved)
                                                </div>
                                                <div style={{ fontSize: "12.5px", color: "#15803d", lineHeight: "1.4" }}>
                                                    Laporan Ini Telah Disetujui (Approved). Data telah terkunci dan secara resmi masuk ke dalam Laporan Performance KPI untuk Rig <strong>{form.rigNo}</strong> periode <strong>{selectedMonthLabel} {form.year}</strong>.
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            style={{
                                                backgroundColor: "#dcfce7",
                                                color: "#15803d",
                                                border: "1px solid #86efac",
                                                padding: "5px 14px",
                                                borderRadius: "6px",
                                                fontSize: "12px",
                                                fontWeight: "800",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            STATUS: APPROVED
                                        </span>
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            backgroundColor: "#fef2f2",
                                            border: "1.5px solid #fca5a5",
                                            borderRadius: "10px",
                                            padding: "16px 20px",
                                            marginBottom: "20px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            flexWrap: "wrap",
                                            gap: "14px",
                                            boxShadow: "0 2px 8px rgba(185, 28, 28, 0.08)",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                            <div
                                                style={{
                                                    backgroundColor: "#b91c1c",
                                                    color: "#ffffff",
                                                    width: "40px",
                                                    height: "40px",
                                                    borderRadius: "8px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Lock size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "14.5px", fontWeight: "800", color: "#991b1b", marginBottom: "3px" }}>
                                                    Peringatan: Data Sudah Berstatus Submitted
                                                </div>
                                                <div style={{ fontSize: "12.5px", color: "#7f1d1d", lineHeight: "1.4" }}>
                                                    Data untuk Rig <strong>{form.rigNo}</strong> periode <strong>{selectedMonthLabel} {form.year}</strong> sudah pernah dikirim (Submitted). Tidak dapat melakukan penginputan ulang untuk mencegah duplikasi data.
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            style={{
                                                backgroundColor: "#fee2e2",
                                                color: "#991b1b",
                                                border: "1px solid #f87171",
                                                padding: "5px 14px",
                                                borderRadius: "6px",
                                                fontSize: "12px",
                                                fontWeight: "800",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            STATUS: {lockedSubmission.status ? lockedSubmission.status.toUpperCase() : "SUBMITTED"}
                                        </span>
                                    </div>
                                )
                            )}

                            {/* BANNER KHUSUS STATUS REJECTED / REVISI */}
                            {!isLocked && rejectedSubmission && (
                                <div
                                    style={{
                                        backgroundColor: "#fffbeb",
                                        border: "1.5px solid #f59e0b",
                                        borderRadius: "10px",
                                        padding: "16px 20px",
                                        marginBottom: "20px",
                                        boxShadow: "0 2px 10px rgba(245, 158, 11, 0.12)",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            justifyContent: "space-between",
                                            flexWrap: "wrap",
                                            gap: "14px",
                                            marginBottom: "12px",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                                            <div
                                                style={{
                                                    backgroundColor: "#d97706",
                                                    color: "#ffffff",
                                                    width: "42px",
                                                    height: "42px",
                                                    borderRadius: "8px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                    boxShadow: "0 2px 6px rgba(217, 119, 6, 0.25)",
                                                }}
                                            >
                                                <AlertTriangle size={22} strokeWidth={2.4} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "15px", fontWeight: "800", color: "#92400e", marginBottom: "4px" }}>
                                                    Laporan Ini Dikembalikan oleh Admin untuk Diperbaiki. Silakan periksa catatan revisi di bawah dan lakukan submit ulang setelah data disesuaikan.
                                                </div>
                                                <div style={{ fontSize: "12.5px", color: "#b45309", lineHeight: "1.4" }}>
                                                    Formulir telah <strong>dibuka kembali (Editable)</strong> agar Anda dapat merevisi data untuk Rig <strong>{form.rigNo}</strong> periode <strong>{selectedMonthLabel} {form.year}</strong>.
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            style={{
                                                backgroundColor: "#fef3c7",
                                                color: "#b45309",
                                                border: "1px solid #f59e0b",
                                                padding: "6px 14px",
                                                borderRadius: "6px",
                                                fontSize: "12px",
                                                fontWeight: "800",
                                                whiteSpace: "nowrap",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px",
                                            }}
                                        >
                                            STATUS: REJECTED
                                        </span>
                                    </div>

                                    {/* Catatan Admin (Admin Notes) - Dynamic Rejection Note */}
                                    <div
                                        style={{
                                            backgroundColor: "#ffffff",
                                            border: "1.5px dashed #f59e0b",
                                            borderRadius: "8px",
                                            padding: "12px 16px",
                                            marginTop: "6px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                marginBottom: "6px",
                                                flexWrap: "wrap",
                                                gap: "6px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    fontSize: "12px",
                                                    fontWeight: "800",
                                                    color: "#b45309",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px",
                                                }}
                                            >
                                                <FileText size={15} />
                                                Catatan Revisi Terbaru dari Admin:
                                            </div>

                                            {rejectedSubmission.rejection_logs && rejectedSubmission.rejection_logs.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowRejectionHistoryModal(true)}
                                                    style={{
                                                        backgroundColor: "#fef3c7",
                                                        border: "1px solid #d97706",
                                                        borderRadius: "6px",
                                                        padding: "3px 10px",
                                                        fontSize: "11.5px",
                                                        fontWeight: "700",
                                                        color: "#92400e",
                                                        cursor: "pointer",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "5px",
                                                    }}
                                                >
                                                    <Clock size={13} />
                                                    Lihat Riwayat Penolakan ({rejectedSubmission.rejection_logs.length} Catatan)
                                                </button>
                                            )}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "13.5px",
                                                color: "#78350f",
                                                fontWeight: "600",
                                                lineHeight: "1.5",
                                                backgroundColor: "#fffbeb",
                                                padding: "10px 14px",
                                                borderRadius: "6px",
                                                borderLeft: "4px solid #d97706",
                                            }}
                                        >
                                            {latestAdminRejectionNote}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* BANNER DRAFT AKTIF */}
                            {!isLocked && currentDraftId && (
                                <div
                                    style={{
                                        backgroundColor: "#f0fdf4",
                                        border: "1.5px solid #86efac",
                                        borderRadius: "10px",
                                        padding: "12px 18px",
                                        marginBottom: "20px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        flexWrap: "wrap",
                                        gap: "10px",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#166534" }}>
                                        <BookmarkCheck size={18} color="#16a34a" />
                                        <span>
                                            Mode Pengisian Draf Aktif untuk Rig <strong>{form.rigNo}</strong> ({selectedMonthLabel} {form.year}). Data tersimpan aman dan belum dipublikasikan ke Admin.
                                        </span>
                                    </div>
                                    <span
                                        style={{
                                            backgroundColor: "#dcfce7",
                                            color: "#15803d",
                                            border: "1px solid #bbf7d0",
                                            padding: "3px 10px",
                                            borderRadius: "6px",
                                            fontSize: "11.5px",
                                            fontWeight: "800",
                                        }}
                                    >
                                        DRAFT AKTIF
                                    </span>
                                </div>
                            )}

                            {/* KONTEKS PERIODE PENGINPUTAN BANNER */}
                            <div
                                style={{
                                    backgroundColor: isLocked ? "#f8fafc" : "#ecfdf5",
                                    border: isLocked ? "1.5px solid #cbd5e1" : "1.5px solid #a7f3d0",
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
                                            backgroundColor: isLocked ? "#475569" : "#004d32",
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
                                        <div style={{ fontSize: "11px", fontWeight: "800", color: isLocked ? "#475569" : "#065f46", textTransform: "uppercase", letterSpacing: "0.5px" }}>
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

                                    {/* Indikator Draft Aktif / Terkunci / Revisi */}
                                    {isLocked ? (
                                        lockedSubmission?.status === "approved" ? (
                                            <span style={{ fontSize: "11.5px", fontWeight: "800", backgroundColor: "#dcfce7", border: "1px solid #86efac", padding: "4px 10px", borderRadius: "6px", color: "#166534", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                <CheckCircle2 size={12} /> Status: Disetujui (Approved)
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: "11.5px", fontWeight: "800", backgroundColor: "#fee2e2", border: "1px solid #f87171", padding: "4px 10px", borderRadius: "6px", color: "#991b1b", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                <Lock size={12} /> Formulir Dikunci
                                            </span>
                                        )
                                    ) : rejectedSubmission ? (
                                        <span style={{ fontSize: "11.5px", fontWeight: "800", backgroundColor: "#fef3c7", border: "1.5px solid #f59e0b", padding: "4px 10px", borderRadius: "6px", color: "#b45309", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                            <AlertTriangle size={12} /> Perlu Perbaikan (Revisi)
                                        </span>
                                    ) : currentDraftId ? (
                                        <span style={{ fontSize: "11.5px", fontWeight: "800", backgroundColor: "#f0fdf4", border: "1px solid #86efac", padding: "4px 10px", borderRadius: "6px", color: "#166534", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                            <BookmarkCheck size={12} /> Status: DRAFT (Aktif #{currentDraftId})
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: "11.5px", fontWeight: "700", backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0", padding: "4px 10px", borderRadius: "6px", color: "#64748b" }}>
                                            Status: Baru (Belum Disimpan)
                                        </span>
                                    )}
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
                                        disabled={isLocked}
                                        unit="Jam"
                                    />

                                    <NumberField
                                        label="Man Hours Non-Premises - Plan"
                                        name="manHoursNonPremisesPlan"
                                        value={form.manHoursNonPremisesPlan}
                                        onChange={handleChange}
                                        disabled={isLocked}
                                        unit="Jam"
                                    />

                                    <NumberField
                                        label="Man Hours Premises - Actual"
                                        name="manHoursPremisesActual"
                                        value={form.manHoursPremisesActual}
                                        placeholder={form.manHoursPremisesPlan}
                                        onChange={handleChange}
                                        disabled={isLocked}
                                        unit="Jam"
                                    />

                                    <NumberField
                                        label="Man Hours Non-Premises - Actual"
                                        name="manHoursNonPremisesActual"
                                        value={form.manHoursNonPremisesActual}
                                        placeholder={form.manHoursNonPremisesPlan}
                                        onChange={handleChange}
                                        disabled={isLocked}
                                        unit="Jam"
                                    />

                                    <NumberField
                                        label="Total Karyawan (Employees)"
                                        name="employees"
                                        value={form.employees}
                                        placeholder="72"
                                        onChange={handleChange}
                                        disabled={isLocked}
                                        unit="Orang"
                                    />

                                    <NumberField
                                        label="Total Kendaraan (Vehicles)"
                                        name="totalVehicles"
                                        value={form.totalVehicles}
                                        placeholder="9"
                                        onChange={handleChange}
                                        disabled={isLocked}
                                        unit="Unit"
                                    />

                                    <NumberField
                                        label="KM Driven Premises - Plan"
                                        name="kilometerPremisesPlan"
                                        value={form.kilometerPremisesPlan}
                                        onChange={handleChange}
                                        disabled={isLocked}
                                        unit="KM"
                                    />

                                    <NumberField
                                        label="KM Driven Non-Premises - Plan"
                                        name="kilometerNonPremisesPlan"
                                        value={form.kilometerNonPremisesPlan}
                                        onChange={handleChange}
                                        disabled={isLocked}
                                        unit="KM"
                                    />

                                    <NumberField
                                        label="KM Driven Premises - Actual"
                                        name="kilometerPremisesActual"
                                        value={form.kilometerPremisesActual}
                                        placeholder={form.kilometerPremisesPlan}
                                        onChange={handleChange}
                                        disabled={isLocked}
                                        unit="KM"
                                    />

                                    <NumberField
                                        label="KM Driven Non-Premises - Actual"
                                        name="kilometerNonPremisesActual"
                                        value={form.kilometerNonPremisesActual}
                                        placeholder={form.kilometerNonPremisesPlan}
                                        onChange={handleChange}
                                        disabled={isLocked}
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
                                isLocked={isLocked}
                            />

                            {/* 4. LEADING INDICATORS */}
                            <IndicatorSection
                                title={`4. ↗ Leading Indicators (Aktivitas Pencegahan) — Periode: ${MONTHS.find((m) => m.value === form.period)?.label || ""} ${form.year}`}
                                type="leading"
                                values={form.leading}
                                onChange={handleIndicatorChange}
                                onAddCustom={handleAddCustomIndicator}
                                onRemoveCustom={handleRequestRemoveIndicator}
                                isLocked={isLocked}
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
                                    disabled={isLocked}
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
                                        color: isLocked ? "#64748b" : "#1e293b",
                                        backgroundColor: isLocked ? "#f1f5f9" : "#ffffff",
                                        cursor: isLocked ? "not-allowed" : "text",
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
                                        <span style={{ color: "#dc2626", fontWeight: "900", fontSize: "12px" }}>* (WAJIB SAAT SUBMIT)</span>
                                    </label>
                                    <p
                                        style={{
                                            margin: "0 0 12px",
                                            fontSize: "12px",
                                            color: "#64748b",
                                            lineHeight: "1.45",
                                        }}
                                    >
                                        Wajib melampirkan file dokumen pendukung sah sebagai bukti (scan logsheet fisik, formulir bertandatangan, file Excel rekap, atau foto bukti lapangan). Format: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Maksimal 20 MB). Saat menyimpan draf, lampiran bukti bersifat opsional.
                                    </p>

                                    <div
                                        id="evidence-file-container"
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            flexWrap: "wrap",
                                            padding: "14px 16px",
                                            backgroundColor: evidenceFile || draftSavedEvidenceName ? "#f0fdf4" : "#fef2f2",
                                            borderRadius: "10px",
                                            border: evidenceFile || draftSavedEvidenceName ? "1.5px solid #10b981" : "1.5px dashed #f87171",
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        <input
                                            type="file"
                                            id="evidence-file-input"
                                            disabled={isLocked}
                                            onChange={handleFileChange}
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                                            style={{ display: "none" }}
                                        />

                                        <label
                                            htmlFor={isLocked ? undefined : "evidence-file-input"}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                padding: "9px 20px",
                                                backgroundColor: isLocked ? "#94a3b8" : (evidenceFile || draftSavedEvidenceName ? "#004d32" : "#b91c1c"),
                                                color: isLocked ? "#ffffff" : (evidenceFile || draftSavedEvidenceName ? "#efff00" : "#ffffff"),
                                                border: isLocked ? "1px solid #94a3b8" : (evidenceFile || draftSavedEvidenceName ? "1.5px solid #efff00" : "1.5px solid #ef4444"),
                                                borderRadius: "8px",
                                                fontSize: "13px",
                                                fontWeight: "800",
                                                cursor: isLocked ? "not-allowed" : "pointer",
                                                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
                                                transition: "all 0.15s ease",
                                            }}
                                        >
                                            <Upload size={16} strokeWidth={2.4} />
                                            <span>
                                                {evidenceFile || draftSavedEvidenceName
                                                    ? "Ganti File Bukti (Choose File)"
                                                    : "📁 Choose File (Pilih File Bukti *)"}
                                            </span>
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
                                                {!isLocked && (
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
                                                )}
                                            </div>
                                        ) : draftSavedEvidenceName ? (
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
                                                    📁 {draftSavedEvidenceName} <span style={{ color: "#047857", fontWeight: "normal" }}>(Tersimpan di Draf)</span>
                                                </span>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: "12.5px", color: "#b91c1c", fontWeight: "700" }}>
                                                ⚠️ Belum ada file bukti. Wajib lampirkan bukti sebelum Submit resmi!
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Section>

                            {/* ACTIONS BAR (RESET, SIMPAN SEBAGAI DRAFT, SUBMIT DATA KPI) */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: "12px",
                                    marginTop: "24px",
                                    paddingBottom: "30px",
                                }}
                            >
                                {!isLocked && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        style={{
                                            height: "42px",
                                            padding: "0 22px",
                                            backgroundColor: "#ffffff",
                                            border: "1px solid #cbd5e1",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            color: "#475569",
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
                                )}

                                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                    {/* Indikator Status Auto-Save */}
                                    {lastAutoSavedAt && !isLocked && (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                fontSize: "12px",
                                                fontWeight: "700",
                                                color: autoSaveStatus === "error" ? "#b91c1c" : "#065f46",
                                                backgroundColor: autoSaveStatus === "error" ? "#fef2f2" : "#ecfdf5",
                                                border: `1px solid ${autoSaveStatus === "error" ? "#fca5a5" : "#a7f3d0"}`,
                                                padding: "6px 14px",
                                                borderRadius: "8px",
                                            }}
                                        >
                                            {autoSaveStatus === "saving" ? (
                                                <>
                                                    <Clock size={14} className="animate-spin" />
                                                    <span>Menyimpan draf otomatis...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <BookmarkCheck size={14} color="#059669" />
                                                    <span>Draf tersimpan otomatis ({lastAutoSavedAt})</span>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Tombol 1: Simpan sebagai Draft (Secondary) */}
                                    {!isLocked && (
                                        <button
                                            type="button"
                                            onClick={() => handleSaveDraft({ isAutoSave: false })}
                                            disabled={isSavingDraft || isSubmitting}
                                            style={{
                                                height: "42px",
                                                padding: "0 22px",
                                                backgroundColor: "#ffffff",
                                                border: "1.5px solid #004d32",
                                                borderRadius: "8px",
                                                cursor: isSavingDraft || isSubmitting ? "not-allowed" : "pointer",
                                                color: "#004d32",
                                                fontWeight: "800",
                                                fontSize: "13px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                boxShadow: "0 2px 6px rgba(0, 77, 50, 0.08)",
                                                opacity: isSavingDraft || isSubmitting ? 0.7 : 1,
                                                transition: "all 0.2s",
                                            }}
                                        >
                                            <BookmarkCheck size={16} strokeWidth={2.4} />
                                            {isSavingDraft ? "Menyimpan Draf..." : "Simpan sebagai Draft"}
                                        </button>
                                    )}

                                    {/* Tombol 2: Submit Data KPI / Submit Ulang (Resubmit) */}
                                    {!isLocked ? (
                                        rejectedSubmission ? (
                                            <button
                                                type="button"
                                                onClick={handleOpenSubmitModal}
                                                disabled={isSubmitting || isSavingDraft}
                                                style={{
                                                    height: "42px",
                                                    padding: "0 26px",
                                                    backgroundColor: "#d97706",
                                                    color: "#ffffff",
                                                    border: "1.5px solid #b45309",
                                                    borderRadius: "8px",
                                                    cursor: isSubmitting || isSavingDraft ? "not-allowed" : "pointer",
                                                    fontWeight: "800",
                                                    fontSize: "13.5px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    boxShadow: "0 4px 14px rgba(217, 119, 6, 0.35)",
                                                    opacity: isSubmitting || isSavingDraft ? 0.7 : 1,
                                                    transition: "all 0.2s",
                                                }}
                                            >
                                                <RotateCcw size={16} strokeWidth={2.4} />
                                                {isSubmitting ? "Mengirim Ulang..." : "Submit Ulang (Resubmit)"}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleOpenSubmitModal}
                                                disabled={isSubmitting || isSavingDraft}
                                                style={{
                                                    height: "42px",
                                                    padding: "0 26px",
                                                    backgroundColor: "#004d32",
                                                    color: "#efff00",
                                                    border: "1px solid #efff00",
                                                    borderRadius: "8px",
                                                    cursor: isSubmitting || isSavingDraft ? "not-allowed" : "pointer",
                                                    fontWeight: "800",
                                                    fontSize: "13.5px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    boxShadow: "0 0 12px rgba(239, 255, 0, 0.25)",
                                                    opacity: isSubmitting || isSavingDraft ? 0.7 : 1,
                                                    transition: "all 0.2s",
                                                }}
                                            >
                                                <Send size={16} strokeWidth={2.4} />
                                                {isSubmitting ? "Memproses..." : "Submit Data KPI"}
                                            </button>
                                        )
                                    ) : (
                                        <div
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                padding: "10px 18px",
                                                backgroundColor: lockedSubmission?.status === "approved" ? "#f0fdf4" : "#fef2f2",
                                                border: lockedSubmission?.status === "approved" ? "1.5px solid #86efac" : "1.5px solid #fca5a5",
                                                borderRadius: "8px",
                                                color: lockedSubmission?.status === "approved" ? "#166534" : "#991b1b",
                                                fontSize: "12.5px",
                                                fontWeight: "800",
                                            }}
                                        >
                                            {lockedSubmission?.status === "approved" ? (
                                                <>
                                                    <CheckCircle2 size={16} />
                                                    <span>Formulir Terkunci (Laporan Sudah Disetujui)</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Lock size={16} />
                                                    <span>Formulir Terkunci (Sudah Disubmit)</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </main>
            </div>

            {/* MODAL KONFIRMASI SUBMIT DATA KPI */}
            <ConfirmSubmitModal
                isOpen={showConfirmSubmitModal}
                onClose={() => setShowConfirmSubmitModal(false)}
                onConfirm={executeSubmit}
                rigNo={form.rigNo}
                contractNo={form.contractNo}
                monthLabel={selectedMonthLabel}
                year={form.year}
                evidenceName={evidenceFile?.name || draftSavedEvidenceName}
                isSubmitting={isSubmitting}
                isResubmit={Boolean(rejectedSubmission)}
            />

            {/* MODAL SKENARIO B: DRAF TERSIMPAN DITEMUKAN */}
            <DraftFoundPromptModal
                isOpen={Boolean(draftPromptModal)}
                draft={draftPromptModal}
                onClose={handleDismissDraftPrompt}
                onConfirm={loadDraftIntoForm}
            />

            {/* MODAL SKENARIO A: PERINGATAN DUPLIKASI DATA SUDAH SUBMITTED */}
            <SubmittedWarningModal
                isOpen={showSubmittedWarningModal}
                onClose={() => setShowSubmittedWarningModal(false)}
                submission={lockedSubmission}
                rigNo={form.rigNo}
                monthLabel={selectedMonthLabel}
                year={form.year}
            />

            {/* MODAL RIWAYAT PENOLAKAN ADMIN (REJECTION LOG HISTORY) */}
            <RejectionHistoryModal
                isOpen={showRejectionHistoryModal}
                onClose={() => setShowRejectionHistoryModal(false)}
                report={rejectedSubmission}
            />

            {/* MODAL KONFIRMASI HAPUS INDIKATOR CUSTOM */}
            <ConfirmDeleteModal
                deleteTarget={deleteTarget}
                onConfirm={handleConfirmRemoveIndicator}
                onCancel={handleCancelRemoveIndicator}
            />
        </div>
    );
}

/* ============================================================
   SUB-COMPONENTS: CONFIRM SUBMIT MODAL, DRAFT PROMPT & DRAFTS LIST CARD
============================================================ */

function ConfirmSubmitModal({
    isOpen,
    onClose,
    onConfirm,
    rigNo,
    contractNo,
    monthLabel,
    year,
    evidenceName,
    isSubmitting,
    isResubmit = false,
}) {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(15, 23, 42, 0.65)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: "20px",
                boxSizing: "border-box",
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    maxWidth: "520px",
                    width: "100%",
                    boxShadow: "0 20px 45px rgba(0, 0, 0, 0.25)",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "18px 24px",
                        backgroundColor: isResubmit ? "#92400e" : "#004d32",
                        color: isResubmit ? "#fef3c7" : "#efff00",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    {isResubmit ? (
                        <RotateCcw size={20} strokeWidth={2.4} color="#fef3c7" />
                    ) : (
                        <Send size={20} strokeWidth={2.4} color="#efff00" />
                    )}
                    <div>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", letterSpacing: "-0.01em" }}>
                            {isResubmit ? "Konfirmasi Submit Ulang Data Perbaikan" : "Konfirmasi Submit Laporan KPI"}
                        </h3>
                        <p style={{ margin: 0, fontSize: "11.5px", color: isResubmit ? "#fde68a" : "#a7f3d0", fontWeight: "600" }}>
                            {isResubmit
                                ? "Pengiriman Ulang Laporan Revisi ke Supervisor & Admin"
                                : "Pemeriksaan Akhir Sebelum Approval Supervisor / Admin"}
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: "22px 24px" }}>
                    <p style={{ fontSize: "14px", color: "#1e293b", margin: "0 0 8px", lineHeight: "1.5", fontWeight: "700" }}>
                        {isResubmit
                            ? "Apakah Anda yakin ingin mengirimkan ulang data perbaikan ini?"
                            : `Apakah Anda yakin data realisasi untuk ${rigNo} periode ${monthLabel} ${year} sudah sesuai dan ingin dikirim?`}
                    </p>
                    <p style={{ fontSize: "12.5px", color: "#64748b", margin: "0 0 16px", lineHeight: "1.4" }}>
                        {isResubmit
                            ? "Data hasil perbaikan akan dikirim kembali ke antrean Approval Admin & Supervisor untuk ditinjau ulang."
                            : "Data yang disubmit akan diteruskan ke Supervisor & Admin HSE untuk proses approval resmi."}
                    </p>

                    <div
                        style={{
                            backgroundColor: "#f8fafc",
                            border: "1.5px solid #e2e8f0",
                            borderRadius: "10px",
                            padding: "14px 18px",
                            marginBottom: "16px",
                            fontSize: "12.5px",
                        }}
                    >
                        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "8px", marginBottom: "6px" }}>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>Nama / Nomor Rig:</span>
                            <span style={{ color: "#004d32", fontWeight: "800" }}>{rigNo}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "8px", marginBottom: "6px" }}>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>Nomor Kontrak:</span>
                            <span style={{ color: "#0f172a", fontWeight: "700" }}>{contractNo}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "8px", marginBottom: "6px" }}>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>Periode Laporan:</span>
                            <span style={{ color: "#0f172a", fontWeight: "700" }}>{monthLabel} {year}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "8px" }}>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>Dokumen Bukti:</span>
                            <span style={{ color: "#059669", fontWeight: "700" }}>📁 {evidenceName || "File Terlampir"}</span>
                        </div>
                    </div>

                    <div
                        style={{
                            backgroundColor: "#fef3c7",
                            border: "1px solid #fde68a",
                            borderRadius: "8px",
                            padding: "10px 14px",
                            fontSize: "12px",
                            color: "#92400e",
                            lineHeight: "1.45",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "8px",
                        }}
                    >
                        <AlertCircle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <span>
                            <strong>Perhatian:</strong> Setelah disubmit, formulir untuk periode ini akan <strong>dikunci</strong> dan statusnya kembali menjadi SUBMITTED menunggu persetujuan Admin/Supervisor.
                        </span>
                    </div>
                </div>

                {/* Footer Actions */}
                <div
                    style={{
                        padding: "14px 24px",
                        backgroundColor: "#f1f5f9",
                        borderTop: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        style={{
                            height: "38px",
                            padding: "0 18px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #cbd5e1",
                            borderRadius: "7px",
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#475569",
                            cursor: "pointer",
                        }}
                    >
                        Batal / Cek Kembali
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        style={{
                            height: "38px",
                            padding: "0 22px",
                            backgroundColor: isResubmit ? "#d97706" : "#004d32",
                            border: isResubmit ? "1px solid #b45309" : "1px solid #efff00",
                            borderRadius: "7px",
                            fontSize: "13px",
                            fontWeight: "800",
                            color: isResubmit ? "#ffffff" : "#efff00",
                            cursor: isSubmitting ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: isResubmit ? "0 2px 8px rgba(217, 119, 6, 0.3)" : "0 2px 8px rgba(0, 77, 50, 0.25)",
                        }}
                    >
                        {isResubmit ? <RotateCcw size={15} /> : <Send size={15} />}
                        {isSubmitting ? "Mengirim Laporan..." : isResubmit ? "Ya, Submit Ulang" : "Ya, Submit Data"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DraftFoundPromptModal({ isOpen, draft, onClose, onConfirm }) {
    if (!isOpen || !draft) return null;

    const moVal = String(draft.period).padStart(2, "0");
    const moLabel = MONTHS.find((m) => m.value === moVal)?.label || `Bulan ${moVal}`;
    const dateStr = draft.updated_at || draft.savedAt
        ? new Date(draft.updated_at || draft.savedAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "-";

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(15, 23, 42, 0.65)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: "20px",
                boxSizing: "border-box",
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    maxWidth: "500px",
                    width: "100%",
                    boxShadow: "0 20px 45px rgba(0, 0, 0, 0.25)",
                    border: "1.5px solid #a7f3d0",
                    overflow: "hidden",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "16px 22px",
                        backgroundColor: "#004d32",
                        color: "#efff00",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    <FileEdit size={20} strokeWidth={2.4} color="#efff00" />
                    <div>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", letterSpacing: "-0.01em" }}>
                            Draf Laporan Ditemukan
                        </h3>
                        <p style={{ margin: 0, fontSize: "11.5px", color: "#a7f3d0", fontWeight: "600" }}>
                            Tersimpan pada sistem untuk Rig {draft.rig_no}
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: "20px 22px" }}>
                    <div
                        style={{
                            backgroundColor: "#ecfdf5",
                            border: "1px solid #a7f3d0",
                            borderRadius: "8px",
                            padding: "14px 16px",
                            marginBottom: "16px",
                        }}
                    >
                        <p style={{ fontSize: "14px", color: "#065f46", margin: 0, lineHeight: "1.5", fontWeight: "700" }}>
                            Draf laporan untuk periode ini sudah ada. Apakah Anda ingin melanjutkan pengisian draf tersebut?
                        </p>
                    </div>

                    <div
                        style={{
                            backgroundColor: "#f8fafc",
                            border: "1.5px solid #e2e8f0",
                            borderRadius: "10px",
                            padding: "14px 16px",
                            fontSize: "12.5px",
                        }}
                    >
                        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "6px", marginBottom: "6px" }}>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>Nama / No Rig:</span>
                            <span style={{ color: "#004d32", fontWeight: "800" }}>{draft.rig_no}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "6px", marginBottom: "6px" }}>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>Nomor Kontrak:</span>
                            <span style={{ color: "#0f172a", fontWeight: "700" }}>{draft.contract_no}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "6px", marginBottom: "6px" }}>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>Periode:</span>
                            <span style={{ color: "#0f172a", fontWeight: "700" }}>{moLabel} {draft.year}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "6px" }}>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>Terakhir Disimpan:</span>
                            <span style={{ color: "#059669", fontWeight: "700" }}>🕒 {dateStr}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div
                    style={{
                        padding: "14px 22px",
                        backgroundColor: "#f1f5f9",
                        borderTop: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            height: "38px",
                            padding: "0 18px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #cbd5e1",
                            borderRadius: "7px",
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#475569",
                            cursor: "pointer",
                        }}
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        onClick={() => onConfirm(draft)}
                        style={{
                            height: "38px",
                            padding: "0 22px",
                            backgroundColor: "#004d32",
                            border: "1px solid #efff00",
                            borderRadius: "7px",
                            fontSize: "13px",
                            fontWeight: "800",
                            color: "#efff00",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 2px 8px rgba(0, 77, 50, 0.25)",
                        }}
                    >
                        <FileEdit size={15} />
                        Lanjutkan Pengisian Draf
                    </button>
                </div>
            </div>
        </div>
    );
}

function SubmittedWarningModal({ isOpen, onClose, submission, rigNo, monthLabel, year }) {
    if (!isOpen) return null;

    const displayRig = submission?.rig_no || rigNo;
    const displayYear = submission?.year || year;
    const isApproved = submission?.status === "approved";

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(15, 23, 42, 0.65)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: "20px",
                boxSizing: "border-box",
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    maxWidth: "500px",
                    width: "100%",
                    boxShadow: "0 20px 45px rgba(0, 0, 0, 0.25)",
                    border: isApproved ? "1.5px solid #86efac" : "1.5px solid #fca5a5",
                    overflow: "hidden",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "16px 22px",
                        backgroundColor: isApproved ? "#15803d" : "#991b1b",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    {isApproved ? (
                        <CheckCircle2 size={20} strokeWidth={2.4} color="#dcfce7" />
                    ) : (
                        <Lock size={20} strokeWidth={2.4} color="#fee2e2" />
                    )}
                    <div>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>
                            {isApproved ? "Laporan Ini Telah Disetujui (Approved)" : "Peringatan: Data Sudah Berstatus Submitted"}
                        </h3>
                        <p style={{ margin: 0, fontSize: "11.5px", color: isApproved ? "#bbf7d0" : "#fca5a5", fontWeight: "600" }}>
                            {isApproved ? "Data Terkunci Resmi di Laporan Performance KPI" : "Pemeriksaan Duplikasi Laporan HSE"}
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: "20px 22px" }}>
                    <div
                        style={{
                            backgroundColor: isApproved ? "#f0fdf4" : "#fef2f2",
                            border: isApproved ? "1px solid #86efac" : "1px solid #fecaca",
                            borderRadius: "8px",
                            padding: "14px 16px",
                            marginBottom: "16px",
                        }}
                    >
                        <p style={{ fontSize: "13.5px", color: isApproved ? "#166534" : "#7f1d1d", margin: 0, lineHeight: "1.5", fontWeight: "600" }}>
                            {isApproved ? (
                                <>
                                    Laporan untuk Rig <strong>{displayRig}</strong> periode <strong>{monthLabel} {displayYear}</strong> telah disetujui resmi oleh Administrator HSE. Data masuk secara resmi ke dalam Laporan Performance KPI dan terkunci permanen.
                                </>
                            ) : (
                                <>
                                    Laporan untuk Rig <strong>{displayRig}</strong> periode <strong>{monthLabel} {displayYear}</strong> sudah pernah disubmit/disetujui. Penginputan ulang tidak diperbolehkan untuk mencegah duplikasi.
                                </>
                            )}
                        </p>
                    </div>

                    <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0, lineHeight: "1.5" }}>
                        {isApproved ? (
                            <>
                                Formulir dialihkan ke status <strong>Terkunci (Read-Only)</strong> sebagai arsip resmi.
                            </>
                        ) : (
                            <>
                                Formulir otomatis dialihkan ke status <strong>Terkunci (Read-Only)</strong>. Jika diperlukan revisi, mohon hubungi Administrator atau tunggu hingga laporan ditinjau.
                            </>
                        )}
                    </p>
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: "12px 22px",
                        backgroundColor: "#f8fafc",
                        borderTop: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            height: "38px",
                            padding: "0 22px",
                            backgroundColor: isApproved ? "#16a34a" : "#991b1b",
                            border: "none",
                            borderRadius: "7px",
                            fontSize: "13px",
                            fontWeight: "800",
                            color: "#ffffff",
                            cursor: "pointer",
                        }}
                    >
                        Saya Mengerti, Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

function RejectionHistoryModal({ isOpen, onClose, report }) {
    if (!isOpen || !report) return null;

    const logs = report.rejection_logs || [];
    const moVal = String(report.period).padStart(2, "0");
    const moLabel = MONTHS.find((m) => m.value === moVal)?.label || `Bulan ${moVal}`;

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "-";
        try {
            return new Date(dateStr).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(15, 23, 42, 0.65)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: "20px",
                boxSizing: "border-box",
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    maxWidth: "560px",
                    width: "100%",
                    boxShadow: "0 20px 45px rgba(0, 0, 0, 0.25)",
                    border: "1px solid #fde68a",
                    overflow: "hidden",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "16px 22px",
                        backgroundColor: "#d97706",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Clock size={20} color="#ffffff" />
                        <div>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>
                                Riwayat Catatan Penolakan (Rejection Log)
                            </h3>
                            <p style={{ margin: 0, fontSize: "12px", color: "#fef3c7" }}>
                                Rig {report.rig_no} &bull; Periode {moLabel} {report.year}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "#ffffff",
                            fontSize: "18px",
                            cursor: "pointer",
                            fontWeight: "800",
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Timeline Body */}
                <div style={{ padding: "20px 22px", maxHeight: "400px", overflowY: "auto" }}>
                    {logs.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                            Belum ada riwayat penolakan tercatat di sistem.
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            {logs.map((log, idx) => (
                                <div
                                    key={log.id || idx}
                                    style={{
                                        backgroundColor: "#fffbeb",
                                        border: "1px solid #fde68a",
                                        borderRadius: "8px",
                                        padding: "12px 14px",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: "6px",
                                        }}
                                    >
                                        <span style={{ fontWeight: "800", color: "#92400e", fontSize: "13px" }}>
                                            Revisi #{log.revision_number || idx + 1} ({formatDateTime(log.created_at)} - {log.admin_name || "Admin HSE"})
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "13px",
                                            color: "#78350f",
                                            fontWeight: "600",
                                            lineHeight: "1.5",
                                            backgroundColor: "#ffffff",
                                            padding: "8px 12px",
                                            borderRadius: "6px",
                                            borderLeft: "3px solid #d97706",
                                        }}
                                    >
                                        "{log.rejection_reason}"
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: "12px 22px",
                        backgroundColor: "#f8fafc",
                        borderTop: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "flex-end",
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            height: "36px",
                            padding: "0 18px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#475569",
                            cursor: "pointer",
                        }}
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

function DraftsListCard({
    drafts = [],
    currentDraftId,
    onContinue,
    onDelete,
    isOpen,
    onToggle,
}) {
    if (!drafts || drafts.length === 0) return null;

    return (
        <div
            style={{
                backgroundColor: "#ffffff",
                border: "1.5px solid #a7f3d0",
                borderRadius: "12px",
                marginBottom: "20px",
                overflow: "hidden",
                boxShadow: "0 3px 12px rgba(0, 77, 50, 0.05)",
            }}
        >
            <div
                onClick={onToggle}
                style={{
                    backgroundColor: "#ecfdf5",
                    padding: "12px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    userSelect: "none",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                        style={{
                            backgroundColor: "#004d32",
                            color: "#efff00",
                            width: "30px",
                            height: "30px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <FileText size={16} />
                    </div>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "14px", fontWeight: "800", color: "#004d32" }}>
                                Draf Laporan Belum Disubmit
                            </span>
                            <span
                                style={{
                                    backgroundColor: "#fef3c7",
                                    color: "#92400e",
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                    border: "1px solid #fde68a",
                                }}
                            >
                                {drafts.length} Draf Tersimpan
                            </span>
                        </div>
                        <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                            Draf ini tersimpan di akun Anda dan tidak tampil di Report/Approval Admin.
                        </span>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#065f46", fontSize: "12px", fontWeight: "700" }}>
                    <span>{isOpen ? "Sembunyikan" : "Tampilkan"}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </div>

            {isOpen && (
                <div style={{ padding: "14px 18px", backgroundColor: "#ffffff" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f8fafc", color: "#475569", borderBottom: "1.5px solid #e2e8f0" }}>
                                    <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: "800" }}>Rig</th>
                                    <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: "800" }}>Kontrak & Area</th>
                                    <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: "800" }}>Periode</th>
                                    <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: "800" }}>Terakhir Disimpan</th>
                                    <th style={{ padding: "8px 10px", textAlign: "center", fontWeight: "800" }}>Status</th>
                                    <th style={{ padding: "8px 10px", textAlign: "center", fontWeight: "800" }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drafts.map((d) => {
                                    const isCurrent = currentDraftId === d.id;
                                    const moMatch = MONTHS.find((m) => m.value === String(d.period).padStart(2, "0"));
                                    const moLabel = moMatch ? moMatch.label : `Bulan ${d.period}`;
                                    const dateStr = d.updated_at
                                        ? new Date(d.updated_at).toLocaleDateString("id-ID", {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                          })
                                        : "-";

                                    return (
                                        <tr
                                            key={d.id}
                                            style={{
                                                borderBottom: "1px solid #f1f5f9",
                                                backgroundColor: isCurrent ? "#f0fdf4" : "transparent",
                                            }}
                                        >
                                            <td style={{ padding: "10px", fontWeight: "800", color: "#004d32" }}>
                                                {d.rig_no}
                                                {isCurrent && (
                                                    <span style={{ marginLeft: "6px", fontSize: "10.5px", color: "#059669", backgroundColor: "#dcfce7", padding: "2px 6px", borderRadius: "4px" }}>
                                                        Aktif di Form
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: "10px", color: "#334155" }}>
                                                {d.contract_no} <span style={{ color: "#64748b" }}>({d.location_district})</span>
                                            </td>
                                            <td style={{ padding: "10px", fontWeight: "700", color: "#0f172a" }}>
                                                {moLabel} {d.year}
                                            </td>
                                            <td style={{ padding: "10px", color: "#64748b", fontSize: "12px" }}>
                                                {dateStr}
                                            </td>
                                            <td style={{ padding: "10px", textAlign: "center" }}>
                                                <span
                                                    style={{
                                                        backgroundColor: "#fef3c7",
                                                        color: "#92400e",
                                                        fontSize: "11px",
                                                        fontWeight: "800",
                                                        padding: "3px 8px",
                                                        borderRadius: "4px",
                                                        border: "1px solid #fde68a",
                                                    }}
                                                >
                                                    DRAFT
                                                </span>
                                            </td>
                                            <td style={{ padding: "10px", textAlign: "center" }}>
                                                <div style={{ display: "inline-flex", gap: "6px" }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => onContinue(d)}
                                                        style={{
                                                            padding: "5px 12px",
                                                            backgroundColor: isCurrent ? "#004d32" : "#ffffff",
                                                            color: isCurrent ? "#efff00" : "#004d32",
                                                            border: "1px solid #004d32",
                                                            borderRadius: "6px",
                                                            fontSize: "11.5px",
                                                            fontWeight: "700",
                                                            cursor: "pointer",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "4px",
                                                        }}
                                                    >
                                                        <FileEdit size={13} />
                                                        <span>{isCurrent ? "Sedang Diedit" : "Lanjutkan"}</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDelete(d)}
                                                        title="Hapus draft ini"
                                                        style={{
                                                            padding: "5px 9px",
                                                            backgroundColor: "#fee2e2",
                                                            color: "#b91c1c",
                                                            border: "1px solid #fca5a5",
                                                            borderRadius: "6px",
                                                            fontSize: "11.5px",
                                                            cursor: "pointer",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
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

function IndicatorRow({ item, index, type, onChange, onRemove, totalManHours = 0, totalKm = 0, allValues = {}, isLocked = false }) {
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
                        disabled={isLocked}
                        readOnly={isLocked}
                        onChange={(event) =>
                            onChange(type, key, "customName", event.target.value)
                        }
                        placeholder="Ketik nama indikator..."
                        style={{
                            width: "100%",
                            height: "34px",
                            boxSizing: "border-box",
                            border: isLocked ? "1px solid #cbd5e1" : "1.5px solid #004d32",
                            borderRadius: "6px",
                            padding: "0 10px",
                            outline: "none",
                            fontSize: "12.5px",
                            fontWeight: "700",
                            color: isLocked ? "#64748b" : "#0f172a",
                            backgroundColor: isLocked ? "#f1f5f9" : "#ffffff",
                            cursor: isLocked ? "not-allowed" : "text",
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
                        disabled={isLocked}
                        readOnly={isLocked}
                        onChange={(event) =>
                            onChange(type, key, "definition", event.target.value)
                        }
                        placeholder="Ketik definisi / formula / keterangan..."
                        style={{
                            width: "100%",
                            height: "34px",
                            boxSizing: "border-box",
                            border: isLocked ? "1px solid #cbd5e1" : "1px solid #cbd5e1",
                            borderRadius: "6px",
                            padding: "0 10px",
                            outline: "none",
                            fontSize: "12px",
                            color: isLocked ? "#64748b" : "#1e293b",
                            backgroundColor: isLocked ? "#f1f5f9" : "#ffffff",
                            cursor: isLocked ? "not-allowed" : "text",
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
                        <div
                            style={{
                                flex: 1,
                                minWidth: 0,
                                backgroundColor: "#f8fafc",
                                border: "1.5px solid #cbd5e1",
                                borderRadius: "6px",
                                padding: "4px 2px",
                                textAlign: "center",
                            }}
                        >
                            <div style={{ fontSize: "10px", fontWeight: "800", color: "#64748b", marginBottom: "2px" }}>
                                Plan Case
                            </div>
                            <span style={{ fontSize: "12.5px", fontWeight: "800", color: "#004d32" }}>
                                {planCase}
                            </span>
                        </div>
                        <div
                            style={{
                                flex: 1,
                                minWidth: 0,
                                backgroundColor: "#f8fafc",
                                border: "1.5px solid #cbd5e1",
                                borderRadius: "6px",
                                padding: "4px 2px",
                                textAlign: "center",
                            }}
                        >
                            <div style={{ fontSize: "10px", fontWeight: "800", color: "#64748b", marginBottom: "2px" }}>
                                Plan FR
                            </div>
                            <span style={{ fontSize: "12.5px", fontWeight: "800", color: "#004d32" }}>
                                {planFr}
                            </span>
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
                            disabled={isLocked}
                            readOnly={isLocked}
                            onChange={(event) => {
                                onChange(type, key, "notes", event.target.value);
                                onChange(type, key, "keterangan", event.target.value);
                            }}
                            placeholder="Keterangan..."
                            style={{
                                width: "100%",
                                height: "34px",
                                boxSizing: "border-box",
                                border: isLocked ? "1px solid #cbd5e1" : "1px solid #cbd5e1",
                                borderRadius: "6px",
                                padding: "0 8px",
                                outline: "none",
                                fontSize: "12px",
                                color: isLocked ? "#64748b" : "#1e293b",
                                backgroundColor: isLocked ? "#f1f5f9" : "#ffffff",
                                cursor: isLocked ? "not-allowed" : "text",
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
                                isReadonly={isLocked}
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
                                isReadonly={isLocked}
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
                            isReadonly={isLocked}
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
                    !isLocked ? (
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
                                color: "#64748b",
                                backgroundColor: "#f1f5f9",
                                border: "1px solid #cbd5e1",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                display: "inline-block",
                            }}
                        >
                            Kustom
                        </span>
                    )
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
    isLocked = false,
}) {
    const items = Object.values(values || {});
    const isLagging = type === "lagging";

    return (
        <Section
            title={title}
            headerAction={
                !isLocked ? (
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
                ) : (
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "4px 10px",
                            backgroundColor: "#f1f5f9",
                            color: "#64748b",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "700",
                        }}
                    >
                        🔒 Read-Only
                    </span>
                )
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
                                isLocked={isLocked}
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

function NumberField({ label, name, value, placeholder, onChange, required = false, unit = "", disabled = false }) {
    const displayValue = (value === null || value === undefined) ? "" : value;

    return (
        <div>
            <label
                style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "700",
                    marginBottom: "6px",
                    color: disabled ? "#64748b" : "#334155",
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
                    disabled={disabled}
                    readOnly={disabled}
                    style={{
                        width: "100%",
                        height: "38px",
                        boxSizing: "border-box",
                        border: "1.5px solid #cbd5e1",
                        borderRadius: "8px",
                        padding: unit ? "0 34px 0 12px" : "0 12px",
                        outline: "none",
                        backgroundColor: disabled ? "#f1f5f9" : (displayValue !== "" ? "#ffffff" : "#f8fafc"),
                        textAlign: "right",
                        fontSize: "13px",
                        fontWeight: "700",
                        color: disabled ? "#64748b" : "#0f172a",
                        cursor: disabled ? "not-allowed" : "text",
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
                            color: disabled ? "#94a3b8" : "#64748b",
                            pointerEvents: "none",
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
            disabled={isReadonly}
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
                color: isReadonly ? "#64748b" : "#0f172a",
                cursor: isReadonly ? "not-allowed" : "text",
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
