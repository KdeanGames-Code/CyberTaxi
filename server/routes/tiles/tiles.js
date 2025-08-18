/**
 * @file server/routes/tiles/tiles.js
 * @description API routes for serving map tiles and fonts in CyberTaxi
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.1
 * @note Proxies tile requests to TileServer GL and serves font glyph PBF files.
 * @see https://kdeangames.net/CyberTaxi/MockUp/Docs/GDD.html
 */
const express = require("express");
const router = express.Router();
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");
const config = require("../../config");

/**
 * Serve font glyph PBF files for TileServer GL styles
 * @route GET /api/fonts/:fontstack/:range.pbf
 * @param {string} req.params.fontstack - Font stack name (e.g., 'Open Sans Regular')
 * @param {string} req.params.range - Glyph range (e.g., '0-255')
 * @returns {Buffer} PBF file or error response
 */
router.get("/fonts/:fontstack/:range.pbf", (req, res) => {
    res.set("Access-Control-Allow-Origin", config.CORS_ORIGINS);
    const { fontstack, range } = req.params;
    const fontPath = path.join(
        __dirname,
        "../../../fonts",
        fontstack,
        `${range}.pbf`
    );
    console.log(`Serving font: ${fontPath}`);
    res.sendFile(fontPath, (err) => {
        if (err) {
            console.error("Font serving failed:", err.message);
            res.status(404).json({
                status: "Error",
                message: "Font PBF not found",
                details: err.message,
            });
        }
    });
});

/**
 * Proxy map tile requests to TileServer GL subprocess
 * @route GET /api/tiles/:style/:z/:x/:y.:format
 * @param {string} req.params.style - Map style (e.g., 'basic', 'dark')
 * @param {number} req.params.z - Zoom level
 * @param {number} req.params.x - X coordinate
 * @param {number} req.params.y - Y coordinate
 * @param {string} req.params.format - Tile format (e.g., 'png')
 * @returns {Buffer} Tile image or error response
 */
router.get(
    "/tiles/:style/:z/:x/:y.:format",
    createProxyMiddleware({
        target: config.TILE_SERVER_URL || "http://localhost:8080",
        pathRewrite: (path, req) => {
            console.log("Path received in pathRewrite: " + path);
            const { style, z, x, y, format } = req.params;
            const newPath = `/styles/${style}/${z}/${x}/${y}.${format}`;
            console.log("Reconstructed path: " + newPath);
            return newPath;
        },
        timeout: 0,
        proxyTimeout: 0,
        onProxyReq: (proxyReq, req) => {
            console.log(
                `Proxying request: ${req.method} ${req.url} to ${proxyReq.path}`
            );
        },
        onProxyRes: (proxyRes, req, res) => {
            console.log(
                `Proxy response: ${proxyRes.statusCode} for ${req.url}`
            );
            res.set("Access-Control-Allow-Origin", config.CORS_ORIGINS);
            res.set("Access-Control-Allow-Methods", "GET");
            res.set("Access-Control-Allow-Headers", "Content-Type");
        },
        onError: (err, req, res) => {
            console.error("Tile proxy error:", err.message);
            res.status(500).json({
                status: "Error",
                message: "Failed to proxy tile request",
                details: err.message,
            });
        },
        changeOrigin: true,
    })
);

module.exports = router;