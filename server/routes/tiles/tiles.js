/**
 * @file routes/tiles/tiles.js
 * @description API routes for serving map tiles and fonts in CyberTaxi
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.2.7
 * @note Proxies tile requests to TileServer GL and serves font glyphs. Handles dark style with optional /512/ resolution.
 * @see https://kdeangames.net/CyberTaxi/MockUp/Docs/GDD.html
 */
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs").promises;
const { createProxyMiddleware } = require("http-proxy-middleware");
const config = require("../../config");

/**
 * Serve font glyph PBF files for TileServer GL styles
 * @route GET /api/fonts/:fontstack/:range.pbf
 * @param {string} req.params.fontstack - Font stack name (e.g., 'Open Sans Regular')
 * @param {string} req.params.range - Glyph range (e.g., '0-255', '8192-8447')
 * @returns {Buffer} PBF file or error response
 */
router.get("/fonts/:fontstack/:range.pbf", async (req, res) => {
    const { fontstack, range } = req.params;
    // Validate font range format (e.g., '0-255')
    if (!/^\d+-\d+$/.test(range)) {
        console.error(`Invalid font range format for ${fontstack}/${range}.pbf`);
        return res.status(400).json({
            status: "Error",
            message: "Invalid font range format",
            details: `Range must be in format 'start-end' (e.g., '0-255')`,
        });
    }
    const fontPath = path.join(
        __dirname,
        "../../fonts",
        fontstack,
        `${range}.pbf`
    );
    console.log(`Serving font: ${fontPath}`);
    try {
        await fs.access(fontPath); // Check if font file exists
        res.set("Access-Control-Allow-Origin", config.CORS_ORIGINS);
        res.sendFile(fontPath, (err) => {
            if (err) {
                console.error(`Font serving failed for ${fontstack}/${range}.pbf:`, err.message);
                res.status(404).json({
                    status: "Error",
                    message: "Font PBF not found",
                    details: err.message,
                });
            }
        });
    } catch (error) {
        console.error(`Font file not found for ${fontstack}/${range}.pbf:`, error.message);
        res.status(404).json({
            status: "Error",
            message: "Font PBF not found",
            details: error.message,
        });
    }
});

/**
 * Proxy map tile requests to TileServer GL subprocess
 * @route GET /api/tiles/:style/:z/:x/:y.:format
 * @route GET /api/tiles/:style/512/:z/:x/:y.:format
 * @param {string} req.params.style - Map style (e.g., 'dark', 'basic')
 * @param {number} req.params.z - Zoom level
 * @param {number} req.params.x - X coordinate
 * @param {number} req.params.y - Y coordinate
 * @param {string} req.params.format - Tile format (e.g., 'png')
 * @returns {Buffer} Tile image or error response
 * @note Handles optional /512/ resolution for TileServer GL dark style compatibility, using osm-2020-02-10-v3.11_texas_austin.mbtiles
 */
router.get(
    "/tiles/:style/:resolution(512)?/:z/:x/:y.:format",
    (req, res, next) => {
        console.log(`Attempting to proxy tile request to ${config.TILE_SERVER_URL}`);
        createProxyMiddleware({
            target: config.TILE_SERVER_URL,
            pathRewrite: (path, req) => {
                console.log(`Path received in pathRewrite: ${path}`);
                const { style, resolution, z, x, y, format } = req.params;
                // Construct TileServer GL path, preserving optional /512/ resolution
                const newPath = `/styles/${style}/${resolution ? resolution + '/' : ''}${z}/${x}/${y}.${format}`;
                console.log(`Reconstructed path: ${newPath}`);
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
                console.error(`Tile proxy error for ${req.url}:`, err.message);
                res.status(500).json({
                    status: "Error",
                    message: "Failed to proxy tile request",
                    details: err.message,
                });
            },
            changeOrigin: true,
        })(req, res, next);
    }
);

module.exports = router;