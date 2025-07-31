// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    base: "/CyberTaxi/Game/", // Matches web root for asset paths
    plugins: [
        react(), // Enable React support
        VitePWA({
            registerType: "autoUpdate", // Auto-register service worker
            includeAssets: [
                "font-awesome/**",
                "img/**",
                "*.png",
                "*.jpg",
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
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, "/api"),
                configure: (proxy) => {
                    proxy.on("proxyRes", (proxyRes) => {
                        console.log(
                            "Proxy response headers:",
                            proxyRes.headers
                        );
                    });
                    proxy.on("error", (err) => {
                        console.error("Proxy error:", err);
                    });
                },
            },
        },
    },
});
