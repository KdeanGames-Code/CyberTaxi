/**
 * @file vehicles.js
 * @description API routes for vehicle management in CyberTaxi
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
 * Purchase a new vehicle for a player
 * @route POST /api/vehicles/purchase
 * @param {Object} req.body - Vehicle data (player_id, type, cost, status, coords, wear, battery, mileage)
 * @returns {Object} JSON response with vehicle ID or error
 */
router.post("/vehicles/purchase", authenticateJWT, async (req, res) => {
    try {
        const {
            player_id,
            type,
            cost,
            status,
            coords,
            wear = 0,
            battery = 100,
            mileage = 0,
        } = req.body;
        console.log(`Received purchase request for player_id: ${player_id}`); // Debug log
        if (!player_id || !type || !cost || !status || !coords) {
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

        // Validate status
        const validStatuses = ["active", "inactive", "maintenance"];
        if (!validStatuses.includes(status)) {
            return res
                .status(400)
                .json({
                    status: "Error",
                    message:
                        "Invalid status, must be active, inactive, or maintenance",
                });
        }

        // Validate type
        const validTypes = ["Model Y", "Model X", "Model S", "Cybertruck"];
        if (!validTypes.includes(type)) {
            return res
                .status(400)
                .json({
                    status: "Error",
                    message:
                        "Invalid vehicle type, must be Model Y, Model X, Model S, or Cybertruck",
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
        const playerTableId = playerRows[0].id; // Use players.id for foreign key

        // Check sufficient funds
        const balance = await getUserBalance(player_id);
        if (balance < parseFloat(cost)) {
            return res
                .status(400)
                .json({ status: "Error", message: "Insufficient funds" });
        }

        // Generate vehicle_id
        const [maxId] = await pool.execute(
            "SELECT COALESCE(MAX(id), 0) + 1 AS new_id FROM vehicles"
        );
        const vehicle_id = `CT-${String(maxId[0].new_id).padStart(3, "0")}`;

        // Insert new vehicle
        const [result] = await pool
            .execute(
                "INSERT INTO vehicles (id, player_id, type, status, wear, battery, mileage, cost, lat, lng, purchase_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())",
                [
                    vehicle_id,
                    playerTableId,
                    type,
                    status,
                    wear,
                    battery,
                    mileage,
                    parseFloat(cost),
                    coords[0],
                    coords[1],
                ]
            )
            .catch((err) => {
                console.error("Insert failed:", err.message);
                throw err;
            });

        // Update player balance
        await pool.execute(
            "UPDATE players SET bank_balance = bank_balance - ? WHERE player_id = ?",
            [parseFloat(cost), player_id]
        );

        console.log("Vehicle purchased:", vehicle_id); // Success log
        res.status(201).json({ success: true, vehicle_id });
    } catch (error) {
        console.error("Vehicle purchase failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to purchase vehicle",
            details: error.message,
        });
    }
});

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
        const playerTableId = playerRows[0].id; // Use players.id for foreign key

        const [result] = await pool.execute(
            "INSERT INTO vehicles (player_id, type, status, cost, lat, lng, dest_lat, dest_lng, purchase_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())",
            [
                playerTableId,
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
        const [playerRows] = await pool
            .execute("SELECT id FROM players WHERE player_id = ?", [player_id])
            .catch((err) => {
                console.error("Player check failed:", err.message);
                throw err;
            });
        if (playerRows.length === 0) {
            return res
                .status(404)
                .json({ status: "Error", message: "Player not found" });
        }
        const playerTableId = playerRows[0].id;

        // Update delivery_timestamp to NULL for active vehicles
        console.log("Updating delivery_timestamp for active vehicles"); // Debug log
        await pool
            .execute(
                "UPDATE vehicles SET delivery_timestamp = NULL WHERE player_id = ? AND status = ?",
                [playerTableId, "active"]
            )
            .catch((err) => {
                console.error("Update delivery_timestamp failed:", err.message);
                throw err;
            });

        let query =
            "SELECT id, player_id, type, status, wear, battery, mileage, tire_mileage, purchase_date, delivery_timestamp, cost, created_at, updated_at, lat, lng, dest_lat, dest_lng FROM vehicles WHERE player_id = ?";
        const params = [playerTableId];

        if (status) {
            query += " AND status = ?";
            params.push(status);
        }

        console.log("Executing query:", query, "with params:", params); // Debug log
        const [rows] = await pool.execute(query, params).catch((err) => {
            console.error("Query execution failed:", err.message);
            throw err;
        });

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

/**
 * Fetch vehicles for a specific player by username
 * @route GET /api/player/:username/vehicles
 * @param {string} req.params.username - The player's username
 * @param {string} [req.query.status] - Optional status filter (e.g., 'active')
 * @returns {Object} JSON response with array of vehicles or error
 */
router.get("/player/:username/vehicles", authenticateJWT, async (req, res) => {
    try {
        const { username } = req.params;
        const { status } = req.query;
        console.log(`Fetching vehicles for username: ${username}`); // Debug log

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

        let query =
            "SELECT id, player_id, type, status, wear, battery, mileage, tire_mileage, purchase_date, delivery_timestamp, cost, created_at, updated_at, lat, lng, dest_lat, dest_lng FROM vehicles WHERE player_id = ?";
        const params = [playerTableId];

        if (status) {
            query += " AND status = ?";
            params.push(status);
        }

        console.log("Executing query:", query, "with params:", params); // Debug log
        const [rows] = await pool.execute(query, params).catch((err) => {
            console.error("Query execution failed:", err.message);
            throw err;
        });

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
