/**
 * @file vehicles.js
 * @description API routes for vehicle management in CyberTaxi
 * @author CyberTaxi Team
 * @version 0.1.0
 */

const express = require("express");
const router = express.Router();
const pool = require("../models/db");

/**
 * Create a new vehicle for a player
 * @route POST /api/vehicles
 * @param {Object} req.body - Vehicle data (player_id, type, status, cost)
 * @returns {Object} JSON response with inserted vehicle ID or error
 */
router.post("/vehicles", async (req, res) => {
    try {
        const { player_id, type, status, cost } = req.body;
        if (!player_id || !type || !status || !cost) {
            return res
                .status(400)
                .json({ status: "Error", message: "Missing required fields" });
        }
        const [result] = await pool.execute(
            "INSERT INTO vehicles (player_id, type, status, cost) VALUES (?, ?, ?, ?)",
            [player_id, type, status, cost]
        );
        res.status(201).json({
            status: "Success",
            vehicle_id: result.insertId,
        });
    } catch (error) {
        console.error("Vehicle insert failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to create vehicle",
        });
    }
});

module.exports = router;
