/**
 * @file config.js
 * @description Centralized configuration for CyberTaxi backend, defining API, TileServer, and CORS URLs.
 * @author CyberTaxi Team
 * @version 0.1.0
 * @note Uses environment variables for flexibility, supporting VPS migration and PWA compatibility. Aligns with frontend's API_CONFIG.
 * @see https://kdeangames.net/CyberTaxi/MockUp/Docs/GDD.html
 */
const config = {
    /**
     * Base URL for the CyberTaxi API (e.g., http://localhost:3000).
     * @type {string}
     */
    API_BASE_URL: process.env.API_BASE_URL || "http://localhost:3000",
    /**
     * URL for the TileServer GL instance (e.g., http://localhost:8080).
     * @type {string}
     */
    TILE_SERVER_URL: process.env.TILE_SERVER_URL || "http://localhost:8080",
    /**
     * Allowed CORS origins for frontend requests (e.g., http://localhost:5173).
     * @type {string}
     */
    CORS_ORIGINS: process.env.CORS_ORIGINS || "http://localhost:5173"
};

module.exports = config;