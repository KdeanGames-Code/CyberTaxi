/**
 * @file index.js
 * @description Main router for CyberTaxi API routes
 * @author CyberTaxi Team
 * @version 0.1.0
 */

const express = require("express");
const router = express.Router();

/**
 * Health check endpoint to verify server status
 * @route GET /api/health
 * @returns {Object} JSON response with status and message
 */
router.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "CyberTaxi server is healthy",
    });
});

module.exports = router;
