/**
 * @file server/routes/player/player.js
 * @description API routes for player management in CyberTaxi
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.4.1
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
router.get("/player/:player_id(\\d+)", authenticateJWT, async (req, res) => {
    try {
        const { player_id } = req.params;
        console.log(`Fetching player details for player_id: ${player_id}`); // Debug log
        const parsedPlayerId = parseInt(player_id);
        const [rows] = await pool.execute(
            "SELECT username, email, bank_balance, score, player_id, id FROM players WHERE player_id = ?",
            [parsedPlayerId]
        );
        if (rows.length === 0) {
            console.log(`Player not found for player_id: ${player_id}`);
            return res
                .status(404)
                .json({ status: "Error", message: "Player not found" });
        }
        if (req.user.player_id !== rows[0].player_id) {
            console.log(`Unauthorized access for player_id: ${player_id}, JWT player_id: ${req.user.player_id}`);
            return res.status(403).json({
                status: "Error",
                message: "Unauthorized access to player data",
            });
        }
        const player = {
            username: rows[0].username,
            email: rows[0].email,
            bank_balance: parseFloat(rows[0].bank_balance),
            score: parseFloat(rows[0].score),
        };
        console.log(`Player details fetched successfully for player_id: ${player_id}`);
        res.status(200).json({ status: "Success", player });
    } catch (error) {
        console.error(`Player fetch failed for player_id: ${player_id}:`, error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch player details",
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
router.get("/player/:username([a-zA-Z0-9_-]+)/balance", authenticateJWT, async (req, res) => {
    try {
        const { username } = req.params;
        console.log(`Fetching balance for username: ${username}`); // Debug log
        const [playerRows] = await pool.execute(
            "SELECT id, player_id FROM players WHERE username = ?",
            [username]
        );
        if (playerRows.length === 0) {
            console.log(`Player not found for username: ${username}`);
            return res
                .status(404)
                .json({ status: "Error", message: "Player not found" });
        }
        const player_id = playerRows[0].player_id;
        if (req.user.player_id !== player_id) {
            console.log(`Unauthorized access for username: ${username}, JWT player_id: ${req.user.player_id}`);
            return res.status(403).json({
                status: "Error",
                message: "Unauthorized access to player data",
            });
        }
        const balance = await getUserBalance(player_id);
        console.log(`Balance fetch successful for username: ${username}, balance: ${balance}`);
        res.status(200).json({ status: "Success", bank_balance: balance });
    } catch (error) {
        console.error(`Balance fetch failed for username: ${username}:`, error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch balance",
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
router.get("/player/:username([a-zA-Z0-9_-]+)/slots", authenticateJWT, async (req, res) => {
    try {
        const { username } = req.params;
        console.log(`Fetching slots for username: ${username}`); // Debug log
        const [playerRows] = await pool.execute(
            "SELECT id, player_id FROM players WHERE username = ?",
            [username]
        );
        if (playerRows.length === 0) {
            console.log(`Player not found for username: ${username}`);
            return res
                .status(404)
                .json({ status: "Error", message: "Player not found" });
        }
        const playerTableId = playerRows[0].id;
        const player_id = playerRows[0].player_id;
        if (req.user.player_id !== player_id) {
            console.log(`Unauthorized access for username: ${username}, JWT player_id: ${req.user.player_id}`);
            return res.status(403).json({
                status: "Error",
                message: "Unauthorized access to player data",
            });
        }
        const [garageRows] = await pool.execute(
            "SELECT SUM(capacity) AS total_slots FROM garages WHERE player_id = ?",
            [playerTableId]
        );
        console.log(`Garage query result for username: ${username}: ${JSON.stringify(garageRows)}`);
        const total_slots = parseInt(garageRows[0].total_slots) || 0;
        const [vehicleRows] = await pool.execute(
            "SELECT COUNT(*) AS used_slots FROM vehicles WHERE player_id = ?",
            [playerTableId]
        );
        console.log(`Vehicle query result for username: ${username}: ${JSON.stringify(vehicleRows)}`);
        const used_slots = parseInt(vehicleRows[0].used_slots) || 0;
        const available_slots = total_slots - used_slots;
        console.log(
            `Slots fetch successful for username: ${username}: total_slots=${total_slots}, used_slots=${used_slots}, available_slots=${available_slots}`
        );
        res.status(200).json({
            status: "Success",
            total_slots,
            used_slots,
            available_slots,
        });
    } catch (error) {
        console.error(`Slots fetch failed for username: ${username}:`, error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch slots",
            details: error.message,
        });
    }
});

module.exports = router;