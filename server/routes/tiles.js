/**
 * @file tiles.js
 * @description API routes for serving map tiles in CyberTaxi
 * @author CyberTaxi Team
 * @version 0.1.0
 */

const express = require("express");
const router = express.Router();
const { createProxyMiddleware } = require("http-proxy-middleware");

/**
 * Proxy map tile requests to TileServer GL subprocess
 * @route GET /api/tiles/:style/:z/:x/:y.:format
 * @returns {Buffer} Tile image or error response
 */
router.get(
    "/tiles/:style/:z/:x/:y.:format",
    createProxyMiddleware({
        target: "http://localhost:8080",
        pathRewrite: (path, req) => {
            console.log("Path received in pathRewrite: " + path);
            const { style, z, x, y, format } = req.params;
            const newPath = `/styles/${style}/512/${z}/${x}/${y}.${format}`;
            console.log("Reconstructed path: " + newPath);
            return newPath;
        },
        onProxyReq: (proxyReq, req) => {
            console.log(
                `Proxying request: ${req.method} ${req.url} to ${proxyReq.path}`
            );
        },
        onProxyRes: (proxyRes, req, res) => {
            console.log(
                `Proxy response: ${proxyRes.statusCode} for ${req.url}`
            );
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
