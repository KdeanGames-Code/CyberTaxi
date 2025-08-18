/**
 * @file server/routes/player/player.js
 * @description API routes for player management in CyberTaxi
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.2.1
 * @note Handles player data retrieval and balance/slot queries. Uses JWT for authentication.
 * @see https://kdeangames.net/CyberTaxi/MockUp/Docs/GDD.html
 */
const express = require("express");
const router = express.Router();
const pool = require("../../models/db");
const { authenticateJWT } = require("../../middleware/authMiddleware");
const { getUserBalance } = require("../../utils/query-utils");

/**
 * Fetch a player's details
 * @route GET /api/player/:player_id
 * @param {number} req.params.player_id - The player's ID
 * @returns {Object} JSON response with player details or error
 */
router.get("/player/:player_id", authenticateJWT, async (req, res) => {
    try {
        const { player_id } = req.params;
        console.log(`Fetching player details for player_id: ${player_id}`); // Debug log
        if (req.user.player_id !== parseInt(player_id)) {
            return res.status(403).json({
                status: "Error",
                message: "Unauthorized access to player data",
            });
        }
        const [rows] = await pool.execute(
            "SELECT username, email, bank_balance, score FROM players WHERE player_id = ?",
            [player_id]
        );
        if (rows.length === 0) {
            return res
                .status(404)
                .json({ status: "Error", message: "Player not found" });
        }
        const player = {
            username: rows[0].username,
            email: rows[0].email,
            bank_balance: parseFloat(rows[0].bank_balance),
            score: parseFloat(rows[0].score),
        };
        console.log("Player details fetched successfully:", player_id); // Success log
        res.status(200).json({ status: "Success", player });
    } catch (error) {
        console.error("Player fetch failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch player details",
            details: error.message,
        });
    }
});

/**
 * Fetch a player's bank balance
 * @route GET /api/player/:player_id/balance
 * @param {number} req.params.player_id - The player's ID
 * @returns {Object} JSON response with bank balance or error
 */
router.get("/player/:player_id/balance", authenticateJWT, async (req, res) => {
    try {
        const { player_id } = req.params;
        console.log(`Fetching balance for player_id: ${player_id}`); // Debug log
        if (req.user.player_id !== parseInt(player_id)) {
            return res.status(403).json({
                status: "Error",
                message: "Unauthorized access to player data",
            });
        }
        const balance = await getUserBalance(player_id);
        console.log(`Balance fetch successful: ${balance}`); // Success log
        res.status(200).json({ status: "Success", bank_balance: balance });
    } catch (error) {
        console.error("Balance fetch failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch balance",
            details: error.message,
        });
    }
});

/**
 * Fetch a player's bank balance by username
 * @route GET /api/player/:username/balance
 * @param {string} req.params.username - The player's username
 * @returns {Object} JSON response with bank balance or error
 */
router.get("/player/:username/balance", authenticateJWT, async (req, res) => {
    try {
        const { username } = req.params;
        console.log(`Fetching balance for username: ${username}`); // Debug log
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
            return res.status(403).json({
                status: "Error",
                message: "Unauthorized access to player data",
            });
        }
        const balance = await getUserBalance(player_id);
        console.log(`Balance fetch successful: ${balance}`); // Success log
        res.status(200).json({ status: "Success", bank_balance: balance });
    } catch (error) {
        console.error("Balance fetch failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch balance",
            details: error.message,
        });
    }
});

/**
 * Fetch a player's available parking slots
 * @route GET /api/player/:player_id/slots
 * @param {number} req.params.player_id - The player's ID
 * @returns {Object} JSON response with total, used, and available slots or error
 */
router.get("/player/:player_id/slots", authenticateJWT, async (req, res) => {
    try {
        const { player_id } = req.params;
        console.log(`Fetching slots for player_id: ${player_id}`); // Debug log
        if (req.user.player_id !== parseInt(player_id)) {
            return res
                .status(403)
                .json({
                    status: "Error",
                    message: "Unauthorized access to player data",
                });
        }
        // Verify player exists
        const [playerRows] = await pool.execute(
            "SELECT id FROM players WHERE player_id = ?",
            [player_id]
        );
        console.log(`Player query result: ${JSON.stringify(playerRows)}`); // Debug log
        if (playerRows.length === 0) {
            return res
                .status(404)
                .json({ status: "Error", message: "Player not found" });
        }
        const playerTableId = playerRows[0].id;
        console.log(`Using playerTableId: ${playerTableId}`); // Debug log
        // Get total slots from garages (includes lots)
        const [garageRows] = await pool.execute(
            "SELECT SUM(capacity) AS total_slots FROM garages WHERE player_id = ?",
            [playerTableId]
        );
        console.log(`Garage query result: ${JSON.stringify(garageRows)}`); // Debug log
        const total_slots = parseInt(garageRows[0].total_slots) || 0;
        // Count used slots (vehicles)
        const [vehicleRows] = await pool.execute(
            "SELECT COUNT(*) AS used_slots FROM vehicles WHERE player_id = ?",
            [playerTableId]
        );
        console.log(`Vehicle query result: ${JSON.stringify(vehicleRows)}`); // Debug log
        const used_slots = parseInt(vehicleRows[0].used_slots) || 0;
        const available_slots = total_slots - used_slots;
        console.log(
            `Slots fetch successful: total_slots=${total_slots}, used_slots=${used_slots}, available_slots=${available_slots}`
        ); // Success log
        res.status(200).json({
            status: "Success",
            total_slots,
            used_slots,
            available_slots,
        });
    } catch (error) {
        console.error("Slots fetch failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch slots",
            details: error.message,
        });
    }
});

/**
 * Fetch a player's available parking slots by username
 * @route GET /api/player/:username/slots
 * @param {string} req.params.username - The player's username
 * @returns {Object} JSON response with total, used, and available slots or error
 */
router.get("/player/:username/slots", authenticateJWT, async (req, res) => {
    try {
        const { username } = req.params;
        console.log(`Fetching slots for username: ${username}`); // Debug log
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
            return res.status(403).json({
                status: "Error",
                message: "Unauthorized access to player data",
            });
        }
        // Get total slots from garages (includes lots)
        const [garageRows] = await pool.execute(
            "SELECT SUM(capacity) AS total_slots FROM garages WHERE player_id = ?",
            [playerTableId]
        );
        console.log(`Garage query result: ${JSON.stringify(garageRows)}`); // Debug log
        const total_slots = parseInt(garageRows[0].total_slots) || 0;
        // Count used slots (vehicles)
        const [vehicleRows] = await pool.execute(
            "SELECT COUNT(*) AS used_slots FROM vehicles WHERE player_id = ?",
            [playerTableId]
        );
        console.log(`Vehicle query result: ${JSON.stringify(vehicleRows)}`); // Debug log
        const used_slots = parseInt(vehicleRows[0].used_slots) || 0;
        const available_slots = total_slots - used_slots;
        console.log(
            `Slots fetch successful: total_slots=${total_slots}, used_slots=${used_slots}, available_slots=${available_slots}`
        ); // Success log
        res.status(200).json({
            status: "Success",
            total_slots,
            used_slots,
            available_slots,
        });
    } catch (error) {
        console.error("Slots fetch failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch slots",
            details: error.message,
        });
    }
});

module.exports = router;