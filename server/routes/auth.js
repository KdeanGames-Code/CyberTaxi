/**
 * @file auth.js
 * @description API routes for authentication in CyberTaxi
 * @author CyberTaxi Team
 * @version 0.1.0
 */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

/**
 * Handle CORS preflight OPTIONS request for /api/auth/login
 * @route OPTIONS /api/auth/login
 */
router.options("/login", (req, res) => {
    res.set({
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    });
    res.status(204).send();
});

/**
 * Generate JWT token for a player
 * @route POST /api/auth/login
 * @param {Object} req.body - Player credentials (player_id, password)
 * @returns {Object} JSON response with JWT token or error
 */
router.post("/login", (req, res) => {
    try {
        res.set({
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        });
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

        // Mock password check (replace with DB query for production)
        if (password !== "test123") {
            return res
                .status(401)
                .json({ status: "Error", message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { player_id },
            process.env.JWT_SECRET || "your_jwt_secret",
            { expiresIn: "1h" }
        );
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
