/**
 * @file server/routes/vehicles/vehicles.js
 * @description API routes for vehicle management in CyberTaxi
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.3.4
 * @note Handles vehicle creation and retrieval for frontend mapping. Uses JWT for authentication.
 * @see https://kdeangames.net/CyberTaxi/MockUp/Docs/GDD.html
 */
const express = require("express");
const router = express.Router();
const pool = require("../../models/db");
const { authenticateJWT } = require("../../middleware/authMiddleware");
const { getUserBalance } = require("../../utils/query-utils");

/**
 * Fetch all vehicles except those of the authenticated player
 * @route GET /api/vehicles/others
 * @param {string} [req.query.status] - Optional status filter (e.g., 'active')
 * @returns {Object} JSON response with array of vehicles or error
 * @note Supports frontend mapping of other players' vehicles
 */
router.get("/vehicles/others", authenticateJWT, async (req, res) => {
    try {
        const { status } = req.query;
        console.log(
            `Fetching other players' vehicles for authenticated player_id: ${req.user.player_id}`
        ); // Debug log
        // Get playerTableId for authenticated player
        const [playerRows] = await pool.execute(
            "SELECT id FROM players WHERE player_id = ?",
            [req.user.player_id]
        );
        console.log(`Player query result: ${JSON.stringify(playerRows)}`); // Debug log
        if (playerRows.length === 0) {
            console.log(`No player found for player_id: ${req.user.player_id}`);
            return res
                .status(404)
                .json({ status: "Error", message: "Player not found" });
        }
        const playerTableId = playerRows[0].id;
        console.log(`Using playerTableId: ${playerTableId}`); // Debug log
        let query =
            "SELECT id, type, status, wear, battery, mileage, tire_mileage, purchase_date, delivery_timestamp, cost, lat, lng, dest_lat, dest_lng FROM vehicles WHERE player_id != ?";
        const params = [playerTableId];
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
        console.log(`Vehicle query took ${Date.now() - startQuery}ms`); // Debug log
        console.log(`Vehicle query result: ${JSON.stringify(rows)}`); // Debug log
        // Serialize coords and dest as arrays, convert DECIMAL fields to numbers
        const serializedRows = rows.map((row) => ({
            id: row.id,
            type: row.type,
            status: row.status,
            wear: parseFloat(row.wear) || 0.0,
            battery: parseFloat(row.battery) || 100.0,
            mileage: parseFloat(row.mileage) || 0.0,
            tire_mileage: parseFloat(row.tire_mileage) || 0.0,
            purchase_date: row.purchase_date,
            delivery_timestamp: row.delivery_timestamp,
            cost: parseFloat(row.cost) || 0.0,
            coords:
                row.lat && row.lng
                    ? [parseFloat(row.lat), parseFloat(row.lng)]
                    : null,
            dest:
                row.dest_lat && row.dest_lng
                    ? [parseFloat(row.dest_lat), parseFloat(row.dest_lng)]
                    : null,
        }));
        console.log(
            "Other vehicles fetch successful, rows:",
            serializedRows.length
        ); // Debug log
        res.status(200).json({ status: "Success", vehicles: serializedRows });
    } catch (error) {
        console.error("Other vehicles fetch failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch other vehicles",
            details: error.message,
        });
    }
});

/**
 * Create a new vehicle for a player with balance check
 * @route POST /api/vehicles
 * @param {Object} req.body - Vehicle data (player_id, type, cost, status, coords, wear, battery, mileage, dest)
 * @returns {Object} JSON response with vehicle ID or error
 * @note Combines purchase and creation logic, validates balance and input
 */
router.post("/vehicles", authenticateJWT, async (req, res) => {
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
            dest,
        } = req.body;
        console.log(`Received vehicle creation request for player_id: ${player_id}`); // Debug log
        // Validate required fields
        if (!player_id || !type || !cost || !status || !coords) {
            console.error(`Missing required fields: ${JSON.stringify(req.body)}`);
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
            console.error(`Invalid coords format: ${JSON.stringify(coords)}`);
            return res.status(400).json({
                status: "Error",
                message: "Invalid coords format, must be [lat, lng]",
            });
        }
        // Validate dest format if provided
        if (dest && (
            !Array.isArray(dest) ||
            dest.length !== 2 ||
            typeof dest[0] !== "number" ||
            typeof dest[1] !== "number"
        )) {
            console.error(`Invalid dest format: ${JSON.stringify(dest)}`);
            return res.status(400).json({
                status: "Error",
                message: "Invalid dest format, must be [lat, lng]",
            });
        }
        // Validate status
        const validStatuses = ["active", "inactive"];
        if (!validStatuses.includes(status)) {
            console.error(`Invalid status: ${status}`);
            return res.status(400).json({
                status: "Error",
                message: "Invalid status, must be active or inactive",
            });
        }
        // Validate type
        const validTypes = ["Model Y", "Model X", "Model S", "Cybertruck"];
        if (!validTypes.includes(type)) {
            console.error(`Invalid vehicle type: ${type}`);
            return res.status(400).json({
                status: "Error",
                message: "Invalid vehicle type, must be Model Y, Model X, Model S, or Cybertruck",
            });
        }
        // Verify player exists and get players.id
        const [playerRows] = await pool.execute(
            "SELECT id FROM players WHERE player_id = ?",
            [player_id]
        ).catch((err) => {
            console.error(`Player query failed for player_id: ${player_id}:`, err.message);
            throw err;
        });
        console.log(`Player query result for player_id ${player_id}: ${JSON.stringify(playerRows)}`); // Debug log
        if (playerRows.length === 0) {
            console.log(`No player found for player_id: ${player_id}`);
            return res
                .status(404)
                .json({ status: "Error", message: "Player not found" });
        }
        const playerTableId = playerRows[0].id;
        console.log(`Using playerTableId: ${playerTableId}`); // Debug log
        // Check sufficient funds
        const balance = await getUserBalance(player_id);
        if (balance < parseFloat(cost)) {
            console.log(`Insufficient funds for player_id: ${player_id}, balance: ${balance}, cost: ${cost}`);
            return res
                .status(400)
                .json({ status: "Error", message: "Insufficient funds" });
        }
        // Generate vehicle_id
        const [maxIdRows] = await pool.execute(
            "SELECT MAX(CAST(SUBSTRING(id, 4) AS UNSIGNED)) AS max_id FROM vehicles WHERE id LIKE 'CT-%'"
        );
        console.log(`Max vehicle ID query result: ${JSON.stringify(maxIdRows)}`); // Debug log
        const maxId = maxIdRows[0].max_id ? parseInt(maxIdRows[0].max_id) : 0;
        const vehicle_id = `CT-${String(maxId + 1).padStart(3, "0")}`;
        console.log(`Generated vehicle_id: ${vehicle_id}`); // Debug log
        // Insert new vehicle
        const query = `
            INSERT INTO vehicles (
                id, player_id, type, status, wear, battery, mileage, cost, 
                lat, lng, dest_lat, dest_lng, purchase_date, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
        `;
        const params = [
            vehicle_id,
            playerTableId,
            type,
            status,
            parseFloat(wear),
            parseFloat(battery),
            parseFloat(mileage),
            parseFloat(cost),
            coords[0],
            coords[1],
            dest ? dest[0] : null,
            dest ? dest[1] : null,
        ];
        console.log("Executing insert query:", query, "with params:", params); // Debug log
        const startQuery = Date.now();
        const [result] = await pool.execute(query, params).catch((err) => {
            console.error("Insert failed:", err.message);
            throw err;
        });
        console.log(`Vehicle insert took ${Date.now() - startQuery}ms, result: ${JSON.stringify(result)}`); // Debug log
        // Update player balance
        await pool.execute(
            "UPDATE players SET bank_balance = bank_balance - ? WHERE player_id = ?",
            [parseFloat(cost), player_id]
        ).catch((err) => {
            console.error(`Balance update failed for player_id: ${player_id}:`, err.message);
            throw err;
        });
        console.log(`Vehicle created: ${vehicle_id}`); // Success log
        res.status(201).json({ status: "Success", vehicle_id });
    } catch (error) {
        console.error("Vehicle creation failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to create vehicle",
            details: error.message,
        });
    }
});

/**
 * Fetch vehicles for a specific player, optionally filtered by status
 * @route GET /api/vehicles/:player_id
 * @param {number} req.params.player_id - The player's ID (numeric, matches players.player_id)
 * @param {string} [req.query.status] - Optional status filter (e.g., 'active')
 * @returns {Object} JSON response with array of vehicles or error
 * @note Validates numeric player_id, updates delivery_timestamp to NULL for active vehicles, and serializes coordinates for frontend mapping
 */
router.get("/vehicles/:player_id(\\d+)", authenticateJWT, async (req, res) => {
    try {
        const { player_id } = req.params;
        const { status } = req.query;
        console.log(`Fetching vehicles for player_id: ${player_id}`); // Debug log
        // Validate numeric player_id
        const parsedPlayerId = parseInt(player_id);
        if (isNaN(parsedPlayerId)) {
            console.error(`Invalid player_id format: ${player_id}`);
            return res.status(400).json({
                status: "Error",
                message: "Invalid player_id format, must be numeric",
            });
        }
        // Verify JWT matches player_id
        if (req.user.player_id !== parsedPlayerId) {
            console.log(`Unauthorized access for player_id: ${player_id}, JWT player_id: ${req.user.player_id}`);
            return res.status(403).json({
                status: "Error",
                message: "Unauthorized access to player vehicles",
            });
        }
        // Get players.id for foreign key
        const [playerRows] = await pool.execute(
            "SELECT id FROM players WHERE player_id = ?",
            [parsedPlayerId]
        ).catch((err) => {
            console.error(`Player query failed for player_id: ${player_id}:`, err.message);
            throw err;
        });
        console.log(`Player query result for player_id ${player_id}: ${JSON.stringify(playerRows)}`); // Debug log
        if (playerRows.length === 0) {
            console.log(`No player found for player_id: ${player_id}`);
            return res.status(404).json({
                status: "Error",
                message: "Player not found",
            });
        }
        const playerTableId = playerRows[0].id;
        console.log(`Using playerTableId: ${playerTableId}`); // Debug log
        // Update delivery_timestamp to NULL for active vehicles
        console.log(`Updating delivery_timestamp for active vehicles of playerTableId: ${playerTableId}`); // Debug log
        await pool.execute(
            "UPDATE vehicles SET delivery_timestamp = NULL WHERE player_id = ? AND status = ?",
            [playerTableId, "active"]
        ).catch((err) => {
            console.error(`Update delivery_timestamp failed for playerTableId: ${playerTableId}:`, err.message);
            throw err;
        });
        // Fetch vehicles with optional status filter
        let query =
            "SELECT id, player_id, type, status, wear, battery, mileage, tire_mileage, purchase_date, delivery_timestamp, cost, created_at, updated_at, lat, lng, dest_lat, dest_lng FROM vehicles WHERE player_id = ?";
        const params = [playerTableId];
        if (status) {
            // Validate status
            const validStatuses = ["active", "inactive"];
            if (!validStatuses.includes(status)) {
                console.error(`Invalid status filter: ${status}`);
                return res.status(400).json({
                    status: "Error",
                    message: "Invalid status, must be active or inactive",
                });
            }
            query += " AND status = ?";
            params.push(status);
        }
        console.log("Executing query:", query, "with params:", params); // Debug log
        const startQuery = Date.now();
        const [rows] = await pool.execute(query, params).catch((err) => {
            console.error(`Vehicle query failed for player_id: ${player_id}:`, err.message);
            throw err;
        });
        console.log(`Vehicle query took ${Date.now() - startQuery}ms`); // Debug log
        console.log(`Vehicle query result for player_id ${player_id}: ${JSON.stringify(rows)}`); // Debug log
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
        console.log(`Vehicle fetch successful for player_id: ${player_id}, rows: ${serializedRows.length}`); // Debug log
        res.status(200).json({ status: "Success", vehicles: serializedRows });
    } catch (error) {
        console.error(`Vehicle fetch failed for player_id: ${req.params.player_id}:`, error.message);
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
 * @note Supports frontend mapping of player's vehicles
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
        console.log(`Player query result for username ${username}: ${JSON.stringify(playerRows)}`); // Debug log
        if (playerRows.length === 0) {
            console.log(`No player found for username: ${username}`);
            return res
                .status(404)
                .json({ status: "Error", message: "Player not found" });
        }
        const playerTableId = playerRows[0].id;
        const player_id = playerRows[0].player_id;
        // Verify authenticated user
        if (req.user.player_id !== player_id) {
            console.log(`Unauthorized access for username: ${username}, JWT player_id: ${req.user.player_id}`);
            return res.status(403).json({
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
        const startQuery = Date.now();
        const [rows] = await pool.execute(query, params).catch((err) => {
            console.error(`Vehicle query failed for username: ${username}:`, err.message);
            throw err;
        });
        console.log(`Vehicle query took ${Date.now() - startQuery}ms`); // Debug log
        console.log(`Vehicle query result for username ${username}: ${JSON.stringify(rows)}`); // Debug log
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
        console.log(`Vehicle fetch successful for username: ${username}, rows: ${serializedRows.length}`); // Debug log
        res.status(200).json({ status: "Success", vehicles: serializedRows });
    } catch (error) {
        console.error(`Vehicle fetch failed for username: ${req.params.username}:`, error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch vehicles",
            details: error.message,
        });
    }
});

module.exports = router;