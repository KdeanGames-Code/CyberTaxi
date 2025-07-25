// routes/health.js - Health check endpoints
const express = require("express");
const pool = require("../models/db"); // Adjust path if needed

const router = express.Router();

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
    } catch (err) {
        console.error("DB Health Check Failed:", err.message);
        res.status(500).json({
            status: "Failed",
            message: err.message,
        });
    }
});

module.exports = router;
