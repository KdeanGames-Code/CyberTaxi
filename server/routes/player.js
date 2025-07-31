/**
 * @file player.js
 * @description API routes for player management in CyberTaxi
 * @author CyberTaxi Team
 * @version 0.1.0
 */

const express = require("express");
const router = express.Router();
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
            return res
                .status(403)
                .json({
                    status: "Error",
                    message: "Unauthorized access to player data",
                });
        }

        const balance = await getUserBalance(player_id);
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

module.exports = router;
