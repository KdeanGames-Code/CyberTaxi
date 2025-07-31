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
    console.log(`Authenticating request: ${req.method} ${req.originalUrl}`); // Debug log
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res
            .status(401)
            .json({ status: "Error", message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "your_jwt_secret"
        );
        req.user = decoded; // Attach user ID for filtering
        next();
    } catch (error) {
        console.error("JWT verification failed:", error.message);
        return res
            .status(403)
            .json({
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
        const [result] = await pool.execute(
            "INSERT INTO vehicles (player_id, type, status, cost, lat, lng, dest_lat, dest_lng, purchase_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())",
            [
                player_id,
                type,
                status,
                cost,
                lat || null,
                lng || null,
                dest_lat || null,
                dest_lng || null,
            ]
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
        console.log(
            "Starting vehicle fetch for player_id:",
            req.params.player_id
        ); // Debug log
        const { player_id } = req.params;
        const { status } = req.query;

        // Verify player exists to respect FOREIGN KEY
        const startPlayerCheck = Date.now();
        const [playerRows] = await pool
            .execute("SELECT id FROM players WHERE player_id = ?", [player_id])
            .catch((err) => {
                console.error("Player check failed:", err.message);
                throw err;
            });
        console.log(`Player check took ${Date.now() - startPlayerCheck}ms`); // Timing log
        if (playerRows.length === 0) {
            return res
                .status(404)
                .json({ status: "Error", message: "Player not found" });
        }

        // Update delivery_timestamp to NULL for active vehicles
        console.log("Updating delivery_timestamp for active vehicles"); // Debug log
        const startUpdate = Date.now();
        await pool
            .execute(
                "UPDATE vehicles SET delivery_timestamp = NULL WHERE player_id = ? AND status = ?",
                [playerRows[0].id, "active"]
            )
            .catch((err) => {
                console.error("Update delivery_timestamp failed:", err.message);
                throw err;
            });
        console.log(`Update query took ${Date.now() - startUpdate}ms`); // Timing log

        let query =
            "SELECT id, player_id, type, status, wear, battery, mileage, tire_mileage, purchase_date, delivery_timestamp, cost, created_at, updated_at, lat, lng, dest_lat, dest_lng FROM vehicles WHERE player_id = ?";
        const params = [playerRows[0].id];

        if (status) {
            query += " AND status = ?";
            params.push(status);
        }

        console.log("Executing query:", query, "with params:", params); // Debug log
        const startQuery = Date.now();
        const [rows] = await pool.execute(query, params).catch((err) => {
            console.error("Query execution failed:", err.message);
            throw err;
        });
        console.log(`Vehicle query took ${Date.now() - startQuery}ms`); // Timing log

        // Serialize coords and dest as arrays, convert DECIMAL fields to numbers
        const serializedRows = rows.map((row) => ({
            id: row.id,
            player_id: row.player_id,
            type: row.type,
            status: row.status,
            wear: parseFloat(row.wear) || 0.0,
            battery: parseFloat(row.battery) || 100.0,
            mileage: parseFloat(row.mileage) || 0.0,
            tire_mileage: parseFloat(row.tire_mileage) || 0.0,
            purchase_date: row.purchase_date,
            delivery_timestamp: row.delivery_timestamp,
            cost: parseFloat(row.cost) || 0.0,
            created_at: row.created_at,
            updated_at: row.updated_at,
            coords:
                row.lat && row.lng
                    ? [parseFloat(row.lat), parseFloat(row.lng)]
                    : null,
            dest:
                row.dest_lat && row.dest_lng
                    ? [parseFloat(row.dest_lat), parseFloat(row.dest_lng)]
                    : null,
        }));

        console.log("Vehicle fetch successful, rows:", serializedRows.length); // Debug log
        res.status(200).json({ status: "Success", vehicles: serializedRows });
    } catch (error) {
        console.error("Vehicle fetch failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch vehicles",
            details: error.message,
        });
    }
});

module.exports = router;
