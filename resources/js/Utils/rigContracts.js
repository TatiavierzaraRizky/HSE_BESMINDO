/**
 * MASTER DATA LIST NO KONTRAK PER AREA & PIC RIG PT. BESMINDO MATERI SEWATAMA
 * Sumber: Form / Matriks Resmi Operasional
 */

export const RIG_CONTRACT_MASTER = [
    {
        no: 1,
        rig: "BMS # 19",
        area: "RH-1",
        contractNo: "SPHR00576A",
        remark: "On Going",
        hseCoord: "Ahmad Afandi / Edo Syahputra",
    },
    {
        no: 2,
        rig: "BMS # 20",
        area: "HO",
        contractNo: "SPHR01003C",
        remark: "On Going",
        hseCoord: "Mulya Fernando / Joko Nuryanto",
    },
    {
        no: 3,
        rig: "BMS # 05",
        area: "North",
        contractNo: "SPHR01002C",
        remark: "On Going",
        hseCoord: "Suryatno / Satrio",
    },
    {
        no: 4,
        rig: "BMS # 06",
        area: "HO",
        contractNo: "SPHR01067C",
        remark: "On Going",
        hseCoord: "Mulya Fernando / Joko Nuryanto",
    },
    {
        no: 5,
        rig: "BMS # 21",
        area: "HO",
        contractNo: "SPHR01071C",
        remark: "On Going",
        hseCoord: "Mulya Fernando / Joko Nuryanto",
    },
    {
        no: 6,
        rig: "BMS # 02",
        area: "South",
        contractNo: "SPHR01095C",
        remark: "On Going",
        hseCoord: "Teddy / Jejen",
    },
    {
        no: 7,
        rig: "BMS # 03",
        area: "South",
        contractNo: "SPHR01095C",
        remark: "On Going",
        hseCoord: "Teddy / Jejen",
    },
    {
        no: 8,
        rig: "BMS # 08",
        area: "South",
        contractNo: "SPHR01095C",
        remark: "On Going",
        hseCoord: "Teddy / Jejen",
    },
    {
        no: 9,
        rig: "BMS # 03a",
        area: "HO",
        contractNo: "SPHR01097C",
        remark: "On Going",
        hseCoord: "Mulya Fernando / Joko Nuryanto",
    },
    {
        no: 10,
        rig: "BMS # 17",
        area: "North",
        contractNo: "SPHR01096C",
        remark: "On Going",
        hseCoord: "Suryatno / Satrio",
    },
    {
        no: 11,
        rig: "BMS # 16",
        area: "RH-1",
        contractNo: "SPHR00797A",
        remark: "On Going",
        hseCoord: "Ahmad Afandi / Edo Syahputra",
    },
    {
        no: 12,
        rig: "BMS # 11",
        area: "RH-1",
        contractNo: "SPHR00797A",
        remark: "On Going",
        hseCoord: "Ahmad Afandi / Edo Syahputra",
    },
    {
        no: 13,
        rig: "BMS # 10",
        area: "RH-1",
        contractNo: "SPHR00797A",
        remark: "On Going",
        hseCoord: "Ahmad Afandi / Edo Syahputra",
    },
    {
        no: 14,
        rig: "BMS # 18",
        area: "North",
        contractNo: "SPHR01220A",
        remark: "On Going",
        hseCoord: "Suryatno / Satrio",
    },
    {
        no: 15,
        rig: "BMS # 15",
        area: "North",
        contractNo: "SPHR01220A",
        remark: "On Going",
        hseCoord: "Suryatno / Satrio",
    },
    {
        no: 16,
        rig: "BMS # 07",
        area: "South",
        contractNo: "SPHR01220A",
        remark: "waiting on going",
        hseCoord: "Teddy / Jejen",
    },
];

export const INDIVIDUAL_PICS = [
    { name: "Ahmad Afandi", area: "RH-1", emailHint: "ahmad.afandi@besmindo.com" },
    { name: "Edo Syahputra", area: "RH-1", emailHint: "edo.syahputra@besmindo.com" },
    { name: "Mulya Fernando", area: "HO", emailHint: "mulya.fernando@besmindo.com" },
    { name: "Joko Nuryanto", area: "HO", emailHint: "joko.nuryanto@besmindo.com" },
    { name: "Suryatno", area: "North", emailHint: "suryatno@besmindo.com" },
    { name: "Satrio", area: "North", emailHint: "satrio@besmindo.com" },
    { name: "Teddy", area: "South", emailHint: "teddy@besmindo.com" },
    { name: "Jejen", area: "South", emailHint: "jejen@besmindo.com" },
];

export const ALL_INDIVIDUAL_PICS = INDIVIDUAL_PICS.map((p) => p.name);

export const AREA_CONFIG = {
    "RH-1": {
        area: "RH-1",
        pics: ["Ahmad Afandi", "Edo Syahputra"],
        hseCoord: "Ahmad Afandi / Edo Syahputra",
        badgeBg: "#fee2e2",
        badgeColor: "#991b1b",
        borderColor: "#f87171",
        accent: "#ef4444",
        label: "RH-1",
    },
    "HO": {
        area: "HO",
        pics: ["Mulya Fernando", "Joko Nuryanto"],
        hseCoord: "Mulya Fernando / Joko Nuryanto",
        badgeBg: "#dcfce7",
        badgeColor: "#166534",
        borderColor: "#86efac",
        accent: "#22c55e",
        label: "HO",
    },
    "North": {
        area: "North",
        pics: ["Suryatno", "Satrio"],
        hseCoord: "Suryatno / Satrio",
        badgeBg: "#e0f2fe",
        badgeColor: "#075985",
        borderColor: "#7dd3fc",
        accent: "#0ea5e9",
        label: "North",
    },
    "South": {
        area: "South",
        pics: ["Teddy", "Jejen"],
        hseCoord: "Teddy / Jejen",
        badgeBg: "#f3e8ff",
        badgeColor: "#6b21a8",
        borderColor: "#d8b4fe",
        accent: "#a855f7",
        label: "South",
    },
};

export const ALL_AREAS = ["RH-1", "HO", "North", "South"];

// Kompatibilitas mundur jika diperlukan
export const ALL_HSE_COORDS = [
    "Ahmad Afandi / Edo Syahputra",
    "Mulya Fernando / Joko Nuryanto",
    "Suryatno / Satrio",
    "Teddy / Jejen",
];

export const ALL_CONTRACTS = [
    "SPHR00576A",
    "SPHR01003C",
    "SPHR01002C",
    "SPHR01067C",
    "SPHR01071C",
    "SPHR01095C",
    "SPHR01097C",
    "SPHR01096C",
    "SPHR00797A",
    "SPHR01220A",
];

export const ALL_RIG_NAMES = RIG_CONTRACT_MASTER.map((m) => m.rig);

/**
 * Normalisasi string nama rig agar cocok terlepas dari spasi, tanda pagar, atau huruf besar/kecil.
 * Contoh: "BMS # 02", "BMS#02", "bms02", "BMS # 2" -> "bms2"
 */
export function normalizeRigKey(name) {
    if (!name) return "";
    return String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .replace(/^bms0*/, "bms");
}

/**
 * Cari data master berdasarkan nama rig
 */
export function findRigInfo(rigName) {
    if (!rigName) return null;
    const targetKey = normalizeRigKey(rigName);
    return (
        RIG_CONTRACT_MASTER.find(
            (item) => normalizeRigKey(item.rig) === targetKey
        ) || null
    );
}

/**
 * Ambil daftar nama PIC individual berdasarkan Area
 */
export function getPicsByArea(area) {
    if (!area) return ALL_INDIVIDUAL_PICS;
    const clean = String(area).trim().toLowerCase();
    for (const [key, cfg] of Object.entries(AREA_CONFIG)) {
        if (key.toLowerCase() === clean) {
            return cfg.pics || [];
        }
    }
    return ALL_INDIVIDUAL_PICS;
}

/**
 * Ambil PIC individual default untuk suatu Area
 */
export function getDefaultPicByArea(area) {
    const pics = getPicsByArea(area);
    return pics.length > 0 ? pics[0] : "";
}

/**
 * Ambil HSE Coord string berdasarkan Area (untuk keperluan laporan / backward compat)
 */
export function getHseCoordByArea(area) {
    if (!area) return "";
    const clean = String(area).trim().toLowerCase();
    for (const [key, cfg] of Object.entries(AREA_CONFIG)) {
        if (key.toLowerCase() === clean || clean.includes(key.toLowerCase())) {
            return cfg.hseCoord;
        }
    }
    return "";
}

/**
 * Ambil Area berdasarkan nama PIC (baik individual maupun gabungan)
 */
export function getAreaByHseCoord(coord) {
    if (!coord) return "";
    const clean = String(coord).trim().toLowerCase();

    // 1. Cek langsung dari INDIVIDUAL_PICS
    const foundPic = INDIVIDUAL_PICS.find(
        (p) => p.name.toLowerCase() === clean || clean.includes(p.name.toLowerCase())
    );
    if (foundPic) return foundPic.area;

    // 2. Cek dari string gabungan atau kata kunci nama
    for (const [area, cfg] of Object.entries(AREA_CONFIG)) {
        if (cfg.pics?.some((p) => clean.includes(p.toLowerCase()))) {
            return area;
        }
    }

    if (clean.includes("afandi") || clean.includes("edo")) return "RH-1";
    if (clean.includes("mulya") || clean.includes("joko")) return "HO";
    if (clean.includes("suryatno") || clean.includes("satrio")) return "North";
    if (clean.includes("teddy") || clean.includes("jejen")) return "South";

    return "";
}

/**
 * Ambil daftar Rig yang dikelompokkan per Area dan Kontrak
 */
export function getRigGroupsByArea() {
    return ALL_AREAS.map((area) => {
        const cfg = AREA_CONFIG[area];
        const rigsInArea = RIG_CONTRACT_MASTER.filter((m) => m.area === area);

        // Kelompokkan per nomor kontrak
        const contractMap = {};
        rigsInArea.forEach((item) => {
            if (!contractMap[item.contractNo]) {
                contractMap[item.contractNo] = [];
            }
            contractMap[item.contractNo].push(item.rig);
        });

        const contractGroups = Object.entries(contractMap).map(
            ([contractNo, rigs]) => ({
                contractNo,
                isYellowHighlight: contractNo === "SPHR01095C",
                rigs,
            })
        );

        return {
            area,
            pics: cfg.pics,
            hseCoord: cfg.hseCoord,
            badgeBg: cfg.badgeBg,
            badgeColor: cfg.badgeColor,
            borderColor: cfg.borderColor,
            accent: cfg.accent,
            allRigs: rigsInArea.map((m) => m.rig),
            contractGroups,
        };
    });
}
