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
 * @route GET /api/tiles/*
 * @returns {Buffer} Tile image or error response
 */
router.use(
    "/tiles/*",
    createProxyMiddleware({
        target: "http://localhost:8080",
        pathRewrite: (path, req) => {
            console.log("Path received in pathRewrite: " + path);
            const parts = path.split("/");
            const style = parts[1];
            const z = parts[2];
            const x = parts[3];
            const y = parts[4].split(".")[0];
            const newPath = `/styles/${style}/512/${z}/${x}/${y}.png`;
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
