/**
 * @file auth.js
 * @description API routes for authentication in CyberTaxi
 * @author CyberTaxi Team
 * @version 0.1.0
 */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../models/db");

/**
 * Register a new player
 * @route POST /api/auth/signup
 * @param {Object} req.body - Player data (username, email, password, bank_balance)
 * @returns {Object} JSON response with JWT token or error
 */
router.post("/signup", async (req, res) => {
    try {
        const { username, email, password, bank_balance = 60000.0 } = req.body;
        console.log(`Received signup request for username: ${username}`); // Debug log
        if (!username || !email || !password) {
            return res
                .status(400)
                .json({
                    status: "Error",
                    message: "Missing username, email, or password",
                });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res
                .status(400)
                .json({ status: "Error", message: "Invalid email format" });
        }

        // Check for existing username or email
        const [existing] = await pool.execute(
            "SELECT username, email FROM players WHERE username = ? OR email = ?",
            [username, email]
        );
        if (existing.length > 0) {
            return res
                .status(409)
                .json({
                    status: "Error",
                    message: "Username or email already exists",
                });
        }

        // Generate player_id (increment max player_id)
        const [maxId] = await pool.execute(
            "SELECT COALESCE(MAX(player_id), 0) + 1 AS new_id FROM players"
        );
        const player_id = maxId[0].new_id;

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert new player with score default
        const [result] = await pool
            .execute(
                "INSERT INTO players (player_id, username, email, password_hash, bank_balance, score, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
                [
                    player_id,
                    username,
                    email,
                    password_hash,
                    parseFloat(bank_balance),
                    0.0,
                ]
            )
            .catch((err) => {
                console.error("Insert failed:", err.message);
                throw err;
            });

        // Generate JWT token
        const token = jwt.sign(
            { player_id },
            process.env.JWT_SECRET || "your_jwt_secret",
            { expiresIn: "1h" }
        );
        console.log("User registered:", username); // Success log
        res.status(201).json({ status: "Success", token });
    } catch (error) {
        console.error("Signup failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to register player",
            details: error.message,
        });
    }
});

/**
 * Generate JWT token for a player
 * @route POST /api/auth/login
 * @param {Object} req.body - Player credentials (player_id, password)
 * @returns {Object} JSON response with JWT token or error
 */
router.post("/login", async (req, res) => {
    try {
        const { player_id, password } = req.body;
        console.log(`Received login request for player_id: ${player_id}`); // Debug log
        if (!player_id || !password) {
            return res
                .status(400)
                .json({
                    status: "Error",
                    message: "Missing player_id or password",
                });
        }

        // Verify credentials against players table
        const [rows] = await pool.execute(
            "SELECT player_id, password_hash FROM players WHERE player_id = ?",
            [player_id]
        );
        if (rows.length === 0) {
            return res
                .status(401)
                .json({ status: "Error", message: "Invalid credentials" });
        }

        const player = rows[0];
        const isMatch = await bcrypt.compare(password, player.password_hash);
        if (!isMatch) {
            return res
                .status(401)
                .json({ status: "Error", message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { player_id },
            process.env.JWT_SECRET || "your_jwt_secret",
            { expiresIn: "1h" }
        );
        console.log("User authenticated"); // Success log
        res.status(200).json({ status: "Success", token });
    } catch (error) {
        console.error("Auth failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to authenticate",
            details: error.message,
        });
    }
});

console.log("Auth route loaded"); // Debug to confirm route file is loaded

module.exports = router;
