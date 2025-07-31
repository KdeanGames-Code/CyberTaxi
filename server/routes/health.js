/**
 * @file health.js
 * @description Health check endpoints for CyberTaxi
 * @author CyberTaxi Team
 * @version 0.1.0
 */

const express = require("express");
const router = express.Router();
const pool = require("../models/db");

/**
 * Check MySQL database connectivity
 * @route GET /api/health
 * @returns {Object} JSON response with status OK or error
 */
router.get("/health", async (req, res) => {
    try {
        // Simple query to check connectivity
        await pool.execute("SELECT 1 AS test");
        console.log("Health check passed"); // Success log
        res.status(200).json({ status: "OK" });
    } catch (error) {
        console.error("Health check failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Database connectivity failed",
            details: error.message,
        });
    }
});

/**
 * Check database status with vehicle count
 * @route GET /api/db-status
 * @returns {Object} JSON response with database status and vehicle count
 */
router.get("/db-status", async (req, res) => {
    try {
        const [rows] = await pool.execute(
            "SELECT COUNT(*) AS vehicle_count FROM vehicles"
        );
        res.json({
            status: "Connected",
            message: "DB health check successful",
            vehicle_count: rows[0].vehicle_count,
        });
    } catch (error) {
        console.error("DB Health Check Failed:", error.message);
        res.status(500).json({
            status: "Failed",
            message: error.message,
        });
    }
});

module.exports = router;
