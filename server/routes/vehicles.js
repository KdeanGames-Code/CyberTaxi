/**
 * @file vehicles.js
 * @description API routes for vehicle management in CyberTaxi
 * @author CyberTaxi Team
 * @version 0.1.0
 */

const express = require("express");
const router = express.Router();
const pool = require("../models/db");
const jwt = require("jsonwebtoken");

/**
 * JWT auth middleware for protected routes
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const authenticateJWT = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
        return res
            .status(401)
            .json({ status: "Error", message: "No token provided" });

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "your_jwt_secret"
        ); // Use same fallback as auth.js
        req.user = decoded; // Attach user ID for filtering
        next();
    } catch (error) {
        console.error("JWT verification failed:", error.message);
        res.status(403).json({
            status: "Error",
            message: "Invalid token",
            details: error.message,
        });
    }
};

/**
 * Create a new vehicle for a player
 * @route POST /api/vehicles
 * @param {Object} req.body - Vehicle data (player_id, type, status, cost, lat, lng, dest_lat, dest_lng)
 * @returns {Object} JSON response with inserted vehicle ID or error
 */
router.post("/vehicles", authenticateJWT, async (req, res) => {
    try {
        const { player_id, type, status, cost, lat, lng, dest_lat, dest_lng } =
            req.body;
        if (!player_id || !type || !status || !cost) {
            return res
                .status(400)
                .json({ status: "Error", message: "Missing required fields" });
        }
        const coords = lat && lng ? JSON.stringify([lat, lng]) : null;
        const dest =
            dest_lat && dest_lng ? JSON.stringify([dest_lat, dest_lng]) : null;
        const [result] = await pool.execute(
            "INSERT INTO vehicles (player_id, type, status, cost, coords, dest) VALUES (?, ?, ?, ?, ?, ?)",
            [player_id, type, status, cost, coords, dest]
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

/**
 * Fetch vehicles for a specific player, optionally filtered by status
 * @route GET /api/vehicles/:player_id
 * @param {number} req.params.player_id - The player's ID
 * @param {string} [req.query.status] - Optional status filter (e.g., 'active')
 * @returns {Object} JSON response with array of vehicles or error
 */
router.get("/vehicles/:player_id", authenticateJWT, async (req, res) => {
    try {
        const { player_id } = req.params;
        const { status } = req.query;

        let query = "SELECT * FROM vehicles WHERE player_id = ?";
        const params = [player_id];

        if (status) {
            query += " AND status = ?";
            params.push(status);
        }

        const [rows] = await pool.execute(query, params);

        // Serialize coords and dest as arrays
        const serializedRows = rows.map((row) => ({
            ...row,
            coords: row.coords ? JSON.parse(row.coords) : null,
            dest: row.dest ? JSON.parse(row.dest) : null,
        }));

        res.status(200).json({ status: "Success", vehicles: serializedRows });
    } catch (error) {
        console.error("Vehicle fetch failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch vehicles",
        });
    }
});

module.exports = router;
