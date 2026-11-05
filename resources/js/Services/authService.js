/**
 * Tab-Isolated Authentication & Token Persistence Service for Besmindo HSE.
 *
 * Mengelola identitas sesi yang terisolasi per browser tab menggunakan sessionStorage,
 * backup persisten di localStorage, dan sinkronisasi otomatis ke cookie & Inertia header
 * agar F5 / refresh tidak menyebabkan logout mendadak atau salah role (path crossing).
 */

const STORAGE_TAB_ID = "besmindo_tab_id";
const STORAGE_TAB_TOKEN = "besmindo_tab_token";
const STORAGE_TAB_USER = "besmindo_tab_user";
const STORAGE_ADMIN_BACKUP = "besmindo_admin_token";
const STORAGE_USER_BACKUP = "besmindo_user_token";
const COOKIE_TAB_TOKEN = "besmindo_tab_token";

/**
 * Dapatkan atau buat Tab ID unik untuk tab browser saat ini.
 */
export function getTabId() {
    if (typeof window === "undefined") return "server";
    try {
        let tabId = sessionStorage.getItem(STORAGE_TAB_ID);
        if (!tabId) {
            tabId = "tab_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now();
            sessionStorage.setItem(STORAGE_TAB_ID, tabId);
        }
        return tabId;
    } catch (e) {
        return "tab_fallback";
    }
}

/**
 * Simpan token dan data user ke sessionStorage tab saat ini dan backup ke localStorage.
 */
export function setTabAuth(token, user) {
    if (typeof window === "undefined" || !token) return;

    try {
        sessionStorage.setItem(STORAGE_TAB_TOKEN, token);
        if (user) {
            sessionStorage.setItem(STORAGE_TAB_USER, JSON.stringify(user));
            // Backup berdasarkan role di localStorage untuk pemulihan darurat jika tab baru dibuka
            if (user.role === "admin") {
                localStorage.setItem(STORAGE_ADMIN_BACKUP, token);
            } else {
                localStorage.setItem(STORAGE_USER_BACKUP, token);
            }
        }
        syncTabCookie(token);
    } catch (e) {
        console.warn("Gagal menyimpan tab auth:", e);
    }
}

/**
 * Ambil token autentikasi khusus untuk tab saat ini.
 */
export function getTabToken() {
    if (typeof window === "undefined") return null;
    try {
        return sessionStorage.getItem(STORAGE_TAB_TOKEN) || null;
    } catch (e) {
        return null;
    }
}

/**
 * Ambil data user yang tersimpan di sessionStorage tab saat ini.
 */
export function getTabUser() {
    if (typeof window === "undefined") return null;
    try {
        const raw = sessionStorage.getItem(STORAGE_TAB_USER);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

/**
 * Sinkronkan token tab ke cookie 'besmindo_tab_token' agar request F5 (Refresh)
 * membawa identitas user tab yang sedang aktif ke backend Laravel.
 */
export function syncTabCookie(explicitToken = null) {
    if (typeof document === "undefined") return;

    const token = explicitToken || getTabToken();
    if (!token) return;

    try {
        const maxAge = 60 * 60 * 24 * 14; // 14 hari
        document.cookie = `${COOKIE_TAB_TOKEN}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    } catch (e) {
        console.warn("Gagal sinkronisasi cookie tab:", e);
    }
}

/**
 * Hapus sesi otentikasi tab saat logout.
 */
export function clearTabAuth() {
    if (typeof window === "undefined") return;

    try {
        sessionStorage.removeItem(STORAGE_TAB_TOKEN);
        sessionStorage.removeItem(STORAGE_TAB_USER);
        document.cookie = `${COOKIE_TAB_TOKEN}=; path=/; max-age=0; SameSite=Lax`;
    } catch (e) {
        console.warn("Gagal membersihkan tab auth:", e);
    }
}

/**
 * Inisialisasi pendengar event tab (focus, visibility change, click)
 * agar setiap kali user beralih ke tab ini, cookie otomatis disetel ke user tab ini.
 */
export function initTabAuthSync() {
    if (typeof window === "undefined") return;

    const onActive = () => {
        syncTabCookie();
    };

    window.addEventListener("focus", onActive);
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            onActive();
        }
    });
    window.addEventListener("click", onActive, { passive: true });

    // Sinkronkan segera saat script dimuat
    syncTabCookie();
}
