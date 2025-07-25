import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    base: "/CyberTaxi/Game/", // Matches web root for asset paths
    plugins: [
        VitePWA({
            registerType: "autoUpdate", // Auto-register service worker
            includeAssets: [
                "favicon.ico",
                "apple-touch-icon.png",
                "masked-icon.svg",
            ], // Placeholder assets
            manifest: {
                name: "CyberTaxi",
                short_name: "CyberTaxi",
                description: "Manage a fleet of autonomous taxis",
                theme_color: "#2f2f2f", // GDD dark theme
                icons: [
                    {
                        src: "pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                ],
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg}"], // Cache essentials
            },
        }),
    ],
    build: {
        minify: "esbuild", // Performance optimization
        sourcemap: true, // Debugging
    },
    server: {
        port: 5173, // Consistent with your setup
    },
});
