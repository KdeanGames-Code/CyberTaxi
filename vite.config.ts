// vite.config.ts
/**
 * @file vite.config.ts
 * @description Vite configuration for CyberTaxi frontend, orchestrating development server, plugins, and API proxying.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.2.4
 * @note Configures a seamless dev experience with PWA support and Backend API connectivity per GDD v1.1.
 *       Sets base path for deployment, enables modern JSX transform, and proxies /api using apiConfig.ts.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { API_CONFIG } from './src/config/apiConfig'; // Import API config

export default defineConfig({
    base: "/CyberTaxi/Game/", // Base path for deployed assets, aligning with project structure
    plugins: [
        react({
            jsxRuntime: "automatic", // Modern JSX transform for React 18 compatibility
        }),
        VitePWA({
            registerType: "autoUpdate", // Enables automatic PWA updates for users
            includeAssets: [
                "font-awesome/webfonts/**", // Include Font Awesome web fonts
                "img/**", // All images in img directory
                "*.png", // Root-level PNGs
                "*.jpg", // Root-level JPGs
                "favicon.ico", // Favicon for browser tab
                "apple-touch-icon.png", // Apple touch icon for PWA
                "masked-icon.svg", // Safari pinned tab icon
            ],
            manifest: {
                name: "CyberTaxi", // App name for PWA
                short_name: "CyberTaxi", // Short name for home screen
                description: "Manage a fleet of autonomous taxis", // App description
                theme_color: "#2f2f2f", // Cyberpunk dark theme
                icons: [
                    {
                        src: "pwa-192x192.png", // Icon for 192x192
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png", // Icon for 512x512
                        sizes: "512x512",
                        type: "image/png",
                    },
                ],
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"], // Files to cache for offline use
            },
        }),
    ],
    build: {
        minify: "esbuild", // Optimize build with esbuild
        sourcemap: true, // Enable sourcemaps for debugging
    },
    server: {
        port: 5173, // Development server port
        proxy: {
            "/api": {
                target: `${API_CONFIG.BASE_URL.split('/api')[0]}`, // Use apiConfig base without /api suffix
                changeOrigin: true, // Adjust origin for cross-domain
                rewrite: (path) => path.replace(/^\/api/, ""), // Remove /api prefix for target
                secure: false, // Allow non-HTTPS for local dev
                configure: (proxy) => {
                    proxy.on("proxyReq", (proxyReq, req) => {
                        console.log(
                            "Proxy request:",
                            req.method,
                            req.url,
                            "to",
                            proxyReq.getHeader("host") + proxyReq.path
                        ); // Log proxy requests
                    });
                    proxy.on("proxyRes", (proxyRes) => {
                        console.log(
                            "Proxy response headers:",
                            proxyRes.headers
                        ); // Log proxy responses
                    });
                    proxy.on("error", (err) => {
                        console.error("Proxy error:", err); // Log proxy errors
                    });
                },
            },
        },
    },
    esbuild: {
        jsx: "automatic", // Modern JSX transform for efficiency
    },
});