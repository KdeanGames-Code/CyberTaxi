/**
 * @file tiles.js
 * @description API routes for serving map tiles in CyberTaxi
 * @author CyberTaxi Team
 * @version 0.1.0
 */

const express = require("express");
const router = express.Router();
const tileserver = require("tileserver-gl");

/**
 * Serve map tiles for Leaflet integration
 * @route GET /api/tiles/:style/:z/:x/:y.:format
 * @param {string} req.params.style - Map style (e.g., 'basic', 'dark')
 * @param {number} req.params.z - Zoom level
 * @param {number} req.params.x - X coordinate
 * @param {number} req.params.y - Y coordinate
 * @param {string} req.params.format - Tile format (e.g., 'png')
 * @returns {Buffer} Tile image or error response
 */
router.get("/tiles/:style/:z/:x/:y.:format", async (req, res) => {
    try {
        const { style, z, x, y, format } = req.params;
        // Initialize TileServer GL with config
        const server = tileserver({
            config: require("../../config.json"),
        });
        // Mock request for TileServer GL
        const mockReq = {
            method: "GET",
            url: `/${style}/${z}/${x}/${y}.${format}`,
            headers: {},
        };
        // Mock response to capture tile data
        const mockRes = {
            status: (code) => {
                res.status(code);
                return mockRes;
            },
            set: (headers) => {
                res.set(headers);
                return mockRes;
            },
            send: (data) => res.send(data),
            end: () => res.end(),
        };
        await server(mockReq, mockRes);
    } catch (error) {
        console.error("Tile serving failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to serve tile",
        });
    }
});

module.exports = router;
