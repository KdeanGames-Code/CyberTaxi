/**
 * @file garages.js
 * @description API routes for garage and lot management in CyberTaxi
 * @author CyberTaxi Team
 * @version 0.2.0
 */

const express = require("express");
const router = express.Router();
const pool = require("../models/db");
const jwt = require("jsonwebtoken");
const { getUserBalance } = require("../shared/utils/query-utils");

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
 * Create a new garage or lot for a player
 * @route POST /api/garages
 * @param {Object} req.body - Garage data (player_id, name, coords, capacity, type, cost_monthly)
 * @returns {Object} JSON response with inserted garage ID or error
 */
router.post("/garages", authenticateJWT, async (req, res) => {
    try {
        const { player_id, name, coords, capacity, type, cost_monthly } =
            req.body;
        console.log(
            `Received create garage request for player_id: ${player_id}`
        ); // Debug log
        if (
            !player_id ||
            !name ||
            !coords ||
            !capacity ||
            !type ||
            !cost_monthly
        ) {
            return res
                .status(400)
                .json({ status: "Error", message: "Missing required fields" });
        }

        // Validate coords format
        if (
            !Array.isArray(coords) ||
            coords.length !== 2 ||
            typeof coords[0] !== "number" ||
            typeof coords[1] !== "number"
        ) {
            return res
                .status(400)
                .json({
                    status: "Error",
                    message: "Invalid coords format, must be [lat, lng]",
                });
        }

        // Validate type
        const validTypes = ["garage", "lot"];
        if (!validTypes.includes(type)) {
            return res
                .status(400)
                .json({
                    status: "Error",
                    message: "Invalid type, must be garage or lot",
                });
        }

        // Verify player exists and get players.id
        const [playerRows] = await pool.execute(
            "SELECT id FROM players WHERE player_id = ?",
            [player_id]
        );
        if (playerRows.length === 0) {
            return res
                .status(404)
                .json({ status: "Error", message: "Player not found" });
        }
        const playerTableId = playerRows[0].id;

        // Check sufficient funds
        const balance = await getUserBalance(player_id);
        if (balance < parseFloat(cost_monthly)) {
            return res
                .status(400)
                .json({
                    status: "Error",
                    message: "Insufficient funds for monthly cost",
                });
        }

        // Insert new garage
        const [result] = await pool
            .execute(
                "INSERT INTO garages (player_id, name, coords, capacity, type, cost_monthly) VALUES (?, ?, ?, ?, ?, ?)",
                [
                    playerTableId,
                    name,
                    JSON.stringify(coords),
                    capacity,
                    type,
                    parseFloat(cost_monthly),
                ]
            )
            .catch((err) => {
                console.error("Insert failed:", err.message);
                throw err;
            });

        // Update player balance
        await pool.execute(
            "UPDATE players SET bank_balance = bank_balance - ? WHERE player_id = ?",
            [parseFloat(cost_monthly), player_id]
        );

        console.log("Garage created:", name); // Success log
        res.status(201).json({ status: "Success", garage_id: result.insertId });
    } catch (error) {
        console.error("Garage creation failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to create garage",
            details: error.message,
        });
    }
});

/**
 * Fetch garages for a specific player
 * @route GET /api/garages/:player_id
 * @param {number} req.params.player_id - The player's ID
 * @returns {Object} JSON response with array of garages or error
 */
router.get("/garages/:player_id", authenticateJWT, async (req, res) => {
    try {
        console.log(
            "Starting garage fetch for player_id:",
            req.params.player_id
        ); // Debug log
        const { player_id } = req.params;

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

        const query =
            "SELECT g.id, g.player_id, g.name, g.coords, g.capacity, g.type, g.cost_monthly FROM garages g JOIN players p ON g.player_id = p.id WHERE p.player_id = ?";
        const params = [player_id];

        console.log("Executing query:", query, "with params:", params); // Debug log
        const startQuery = Date.now();
        const [rows] = await pool.execute(query, params).catch((err) => {
            console.error("Query execution failed:", err.message);
            throw err;
        });
        console.log(`Garage query took ${Date.now() - startQuery}ms`); // Timing log

        // Serialize coords as array, convert DECIMAL fields to numbers
        const serializedRows = rows.map((row) => ({
            id: row.id,
            player_id: row.player_id,
            name: row.name,
            coords: row.coords ? JSON.parse(row.coords) : null,
            capacity: row.capacity,
            type: row.type,
            cost_monthly: parseFloat(row.cost_monthly) || 0.0,
        }));

        console.log("Garage fetch successful, rows:", serializedRows.length); // Debug log
        res.status(200).json({ status: "Success", garages: serializedRows });
    } catch (error) {
        console.error("Garage fetch failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch garages",
            details: error.message,
        });
    }
});

/**
 * Fetch garages for a specific player by username
 * @route GET /api/player/:username/garages
 * @param {string} req.params.username - The player's username
 * @returns {Object} JSON response with array of garages or error
 */
router.get("/player/:username/garages", authenticateJWT, async (req, res) => {
    try {
        const { username } = req.params;
        console.log(`Fetching garages for username: ${username}`); // Debug log

        // Map username to player_id
        const [playerRows] = await pool.execute(
            "SELECT id, player_id FROM players WHERE username = ?",
            [username]
        );
        if (playerRows.length === 0) {
            return res
                .status(404)
                .json({ status: "Error", message: "Player not found" });
        }
        const playerTableId = playerRows[0].id;
        const player_id = playerRows[0].player_id;

        // Verify authenticated user
        if (req.user.player_id !== player_id) {
            return res
                .status(403)
                .json({
                    status: "Error",
                    message: "Unauthorized access to player data",
                });
        }

        const query =
            "SELECT id, player_id, name, coords, capacity, type, cost_monthly FROM garages WHERE player_id = ?";
        const params = [playerTableId];

        console.log("Executing query:", query, "with params:", params); // Debug log
        const startQuery = Date.now();
        const [rows] = await pool.execute(query, params).catch((err) => {
            console.error("Query execution failed:", err.message);
            throw err;
        });
        console.log(`Garage query took ${Date.now() - startQuery}ms`); // Timing log

        // Serialize coords as array, convert DECIMAL fields to numbers
        const serializedRows = rows.map((row) => ({
            id: row.id,
            player_id: row.player_id,
            name: row.name,
            coords: row.coords ? JSON.parse(row.coords) : null,
            capacity: row.capacity,
            type: row.type,
            cost_monthly: parseFloat(row.cost_monthly) || 0.0,
        }));

        console.log("Garage fetch successful, rows:", serializedRows.length); // Debug log
        res.status(200).json({ status: "Success", garages: serializedRows });
    } catch (error) {
        console.error("Garage fetch failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch garages",
            details: error.message,
        });
    }
});

module.exports = router;
