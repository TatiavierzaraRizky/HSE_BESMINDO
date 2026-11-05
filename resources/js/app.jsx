import "../css/app.css";

import { createInertiaApp, router } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import CuteLoading from "./Components/CuteLoading";
import {
    initTabAuthSync,
    setTabAuth,
    getTabToken,
    syncTabCookie,
} from "./Services/authService";

const appName =
    import.meta.env.VITE_APP_NAME || "Besmindo HSE";

// Inisialisasi isolasi otentikasi antar tab
if (typeof window !== "undefined") {
    initTabAuthSync();

    // Pastikan setiap request navigasi Inertia menyertakan token tab di Header & Cookie
    router.on("before", (event) => {
        const token = getTabToken();
        if (token && event?.detail?.visit) {
            event.detail.visit.headers = {
                ...(event.detail.visit.headers || {}),
                "X-Besmindo-Tab-Token": token,
            };
            syncTabCookie(token);
        }
    });

    // Perbarui token tab jika backend mengirim token terbaru
    router.on("success", (event) => {
        const pageProps = event?.detail?.page?.props;
        if (pageProps?.authToken) {
            setTabAuth(pageProps.authToken, pageProps.auth?.user);
        }
    });
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,

    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx")
        ),

    setup({ el, App, props }) {
        // Simpan auth token dari initial props ke tab storage saat aplikasi pertama kali di-mount
        if (props?.initialPage?.props?.authToken) {
            setTabAuth(
                props.initialPage.props.authToken,
                props.initialPage.props.auth?.user
            );
        }

        createRoot(el).render(
            <>
                <App {...props} />
                <CuteLoading />
            </>
        );
    },

    progress: {
        color: "#efff00",
    },
});
