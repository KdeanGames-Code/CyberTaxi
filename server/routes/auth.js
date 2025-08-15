/**
 * @file auth.js
 * @description API routes for authentication in CyberTaxi, handling player signup, login, and password reset.
 * @author CyberTaxi Team
 * @version 0.4.0
 * @note Uses JWT for secure authentication and bcrypt for password hashing. All endpoints are PWA-friendly with lightweight JSON responses.
 * @see https://kdeangames.net/CyberTaxi/MockUp/Docs/GDD.html
 */
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../models/db");

/**
 * Register a new player
 * @route POST /api/auth/signup
 * @param {Object} req.body - Player data
 * @param {string} req.body.username - Unique username (required)
 * @param {string} req.body.email - Unique email address (required)
 * @param {string} req.body.password - Password (required)
 * @param {number} [req.body.bank_balance=60000.0] - Initial bank balance
 * @returns {Object} JSON response with JWT token or error
 * @throws {Error} If username/email exists, email format is invalid, or database query fails
 */
router.post("/signup", async (req, res) => {
    try {
        const { username, email, password, bank_balance = 60000.0 } = req.body;
        console.log(`Received signup request for username: ${username}`); // Debug log
        if (!username || !email || !password) {
            console.log("Signup failed: Missing username, email, or password");
            return res.status(400).json({
                status: "Error",
                message: "Missing username, email, or password",
                details: "All fields are required"
            });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log("Signup failed: Invalid email format");
            return res.status(400).json({
                status: "Error",
                message: "Invalid email format",
                details: "Email must be a valid format (e.g., user@domain.com)"
            });
        }
        // Check for existing username or email
        const [existing] = await pool.execute(
            "SELECT username, email FROM players WHERE username = ? OR email = ?",
            [username, email]
        ).catch((err) => {
            console.error("Database query failed:", err.message);
            throw new Error(`Database query failed: ${err.message}`);
        });
        if (existing.length > 0) {
            console.log("Signup failed: Username or email already exists");
            return res.status(409).json({
                status: "Error",
                message: "Username or email already exists",
                details: "Choose a different username or email"
            });
        }
        // Generate player_id (increment max player_id)
        const [maxId] = await pool.execute(
            "SELECT COALESCE(MAX(player_id), 0) + 1 AS new_id FROM players"
        ).catch((err) => {
            console.error("Database query failed:", err.message);
            throw new Error(`Database query failed: ${err.message}`);
        });
        const player_id = maxId[0].new_id;
        // Hash password
        const password_hash = await bcrypt.hash(password, 10).catch((err) => {
            console.error("Password hashing failed:", err.message);
            throw new Error(`Password hashing failed: ${err.message}`);
        });
        // Insert new player with score default
        await pool.execute(
            "INSERT INTO players (player_id, username, email, password_hash, bank_balance, score, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
            [player_id, username, email, password_hash, parseFloat(bank_balance), 0.0]
        ).catch((err) => {
            console.error("Database insert failed:", err.message);
            throw new Error(`Database insert failed: ${err.message}`);
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
            details: error.message
        });
    }
});

/**
 * Generate JWT token for a player by player_id
 * @route POST /api/auth/login
 * @param {Object} req.body - Player credentials
 * @param {number} req.body.player_id - Player ID (required)
 * @param {string} req.body.password - Password (required)
 * @returns {Object} JSON response with JWT token or error
 * @throws {Error} If credentials are invalid, database query fails, or bcrypt comparison fails
 */
router.post("/login", async (req, res) => {
    try {
        const { player_id, password } = req.body;
        console.log(
            `Received login request for player_id: ${player_id}, password: ${password ? "provided" : "missing"}`
        ); // Debug log
        if (!player_id || !password) {
            console.log("Login failed: Missing player_id or password");
            return res.status(400).json({
                status: "Error",
                message: "Missing player_id or password",
                details: "Both player_id and password are required"
            });
        }
        // Check database connectivity
        await pool.execute("SELECT 1 AS test").catch((err) => {
            console.error("Database connectivity check failed:", err.message);
            throw new Error(`Database connection failed: ${err.message}`);
        });
        // Verify credentials against players table
        const startQuery = Date.now();
        const [rows] = await pool.execute(
            "SELECT player_id, password_hash FROM players WHERE player_id = ?",
            [player_id]
        ).catch((err) => {
            console.error("Database query failed:", err.message);
            throw new Error(`Database query failed: ${err.message}`);
        });
        console.log(`Player query took ${Date.now() - startQuery}ms`); // Timing log
        if (rows.length === 0) {
            console.log(`Login failed: No player found for player_id: ${player_id}`);
            return res.status(401).json({
                status: "Error",
                message: "Invalid credentials",
                details: "Player not found"
            });
        }
        const player = rows[0];
        console.log(
            `Comparing password for player_id: ${player_id}, stored hash: ${player.password_hash}`
        ); // Debug log
        const startBcrypt = Date.now();
        const isMatch = await bcrypt.compare(password, player.password_hash).catch((err) => {
            console.error(`Bcrypt compare failed for player_id: ${player_id}:`, err.message);
            throw new Error(`Bcrypt compare failed: ${err.message}`);
        });
        console.log(`Bcrypt compare took ${Date.now() - startBcrypt}ms`); // Timing log
        if (!isMatch) {
            console.log(`Login failed: Password mismatch for player_id: ${player_id}`);
            return res.status(401).json({
                status: "Error",
                message: "Invalid credentials",
                details: "Password mismatch"
            });
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
            details: error.message
        });
    }
});

/**
 * Generate JWT token for a player by username
 * @route POST /api/auth/login/username
 * @param {Object} req.body - Player credentials
 * @param {string} req.body.username - Username (required)
 * @param {string} req.body.password - Password (required)
 * @returns {Object} JSON response with JWT token, player_id, or error
 * @throws {Error} If credentials are invalid, database query fails, or bcrypt comparison fails
 */
router.post("/login/username", async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(
            `Received login request for username: ${username}, password: ${password ? "provided" : "missing"}`
        ); // Debug log
        if (!username || !password) {
            console.log("Login failed: Missing username or password");
            return res.status(400).json({
                status: "Error",
                message: "Missing username or password",
                details: "Both username and password are required"
            });
        }
        // Check database connectivity
        await pool.execute("SELECT 1 AS test").catch((err) => {
            console.error("Database connectivity check failed:", err.message);
            throw new Error(`Database connection failed: ${err.message}`);
        });
        // Verify credentials against players table
        const startQuery = Date.now();
        const [rows] = await pool.execute(
            "SELECT player_id, password_hash FROM players WHERE username = ?",
            [username]
        ).catch((err) => {
            console.error("Database query failed:", err.message);
            throw new Error(`Database query failed: ${err.message}`);
        });
        console.log(`Player query took ${Date.now() - startQuery}ms`); // Timing log
        if (rows.length === 0) {
            console.log(`Login failed: No player found for username: ${username}`);
            return res.status(401).json({
                status: "Error",
                message: "Invalid credentials",
                details: "Player not found"
            });
        }
        const player = rows[0];
        console.log(
            `Comparing password for player_id: ${player.player_id}, stored hash: ${player.password_hash}`
        ); // Debug log
        const startBcrypt = Date.now();
        const isMatch = await bcrypt.compare(password, player.password_hash).catch((err) => {
            console.error(`Bcrypt compare failed for player_id: ${player.player_id}:`, err.message);
            throw new Error(`Bcrypt compare failed: ${err.message}`);
        });
        console.log(`Bcrypt compare took ${Date.now() - startBcrypt}ms`); // Timing log
        if (!isMatch) {
            console.log(`Login failed: Password mismatch for username: ${username}`);
            return res.status(401).json({
                status: "Error",
                message: "Invalid credentials",
                details: "Password mismatch"
            });
        }
        // Generate JWT token
        const token = jwt.sign(
            { player_id: player.player_id },
            process.env.JWT_SECRET || "your_jwt_secret",
            { expiresIn: "1h" }
        );
        console.log("User authenticated"); // Success log
        res.status(200).json({ status: "Success", token, player_id: player.player_id });
    } catch (error) {
        console.error("Auth failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to authenticate",
            details: error.message
        });
    }
});

/**
 * Reset a player's password
 * @route POST /api/auth/reset-password
 * @param {Object} req.body - Player credentials
 * @param {string} req.body.username - Username (required)
 * @param {string} req.body.new_password - New password (required)
 * @param {string} req.header.Authorization - JWT token as Bearer (required)
 * @returns {Object} JSON response with success message or error
 * @throws {Error} If JWT is invalid, credentials are invalid, or database query fails
 */
router.post("/reset-password", async (req, res) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            console.log("Password reset failed: No token provided");
            return res.status(401).json({
                status: "Error",
                message: "No token provided",
                details: "JWT token required in Authorization header"
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
        const { username, new_password } = req.body;
        console.log(`Received password reset request for username: ${username}`); // Debug log
        if (!username || !new_password) {
            console.log("Password reset failed: Missing username or new_password");
            return res.status(400).json({
                status: "Error",
                message: "Missing username or new_password",
                details: "Both username and new_password are required"
            });
        }
        // Check database connectivity
        await pool.execute("SELECT 1 AS test").catch((err) => {
            console.error("Database connectivity check failed:", err.message);
            throw new Error(`Database connection failed: ${err.message}`);
        });
        // Verify player exists and matches JWT
        const [playerRows] = await pool.execute(
            "SELECT player_id FROM players WHERE username = ?",
            [username]
        ).catch((err) => {
            console.error("Database query failed:", err.message);
            throw new Error(`Database query failed: ${err.message}`);
        });
        if (playerRows.length === 0) {
            console.log(`Password reset failed: No player found for username: ${username}`);
            return res.status(404).json({
                status: "Error",
                message: "Player not found",
                details: `No player found for username: ${username}`
            });
        }
        const player = playerRows[0];
        if (player.player_id !== decoded.player_id) {
            console.log(`Password reset failed: Unauthorized access for player_id: ${decoded.player_id}`);
            return res.status(403).json({
                status: "Error",
                message: "Unauthorized access",
                details: "Token does not match requested username"
            });
        }
        // Hash new password
        const password_hash = await bcrypt.hash(new_password, 10).catch((err) => {
            console.error("Password hashing failed:", err.message);
            throw new Error(`Password hashing failed: ${err.message}`);
        });
        // Update password
        await pool.execute(
            "UPDATE players SET password_hash = ?, updated_at = NOW() WHERE player_id = ?",
            [password_hash, player.player_id]
        ).catch((err) => {
            console.error("Database update failed:", err.message);
            throw new Error(`Database update failed: ${err.message}`);
        });
        console.log(`Password reset successful for username: ${username}`); // Success log
        res.status(200).json({ status: "Success", message: "Password updated" });
    } catch (error) {
        console.error("Password reset failed:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Failed to reset password",
            details: error.message
        });
    }
});

console.log("Auth route loaded"); // Debug to confirm route file is loaded
module.exports = router;