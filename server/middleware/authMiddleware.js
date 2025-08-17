/**
 * @file server/middleware/authMiddleware.js
 * @description JWT authentication middleware for CyberTaxi protected routes.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.0
 * @note Verifies JWT tokens and generates new ones for authenticated routes.
 * @see https://kdeangames.net/CyberTaxi/MockUp/Docs/GDD.html
 */
const jwt = require("jsonwebtoken");

/**
 * JWT authentication middleware for protected routes
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * @throws {Error} If token is missing or invalid
 */
function authenticateJWT(req, res, next) {
    console.log(`Authenticating request: ${req.method} ${req.originalUrl}`); // Debug log
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        console.log("Authentication failed: No token provided");
        return res.status(401).json({
            status: "Error",
            message: "No token provided",
            details: "JWT token required in Authorization header"
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
        req.user = decoded; // Attach user data (player_id) for filtering
        next();
    } catch (error) {
        console.error("JWT verification failed:", error.message);
        return res.status(403).json({
            status: "Error",
            message: "Invalid token",
            details: error.message
        });
    }
}

/**
 * Generate JWT token for a player
 * @function
 * @param {Object} payload - Token payload (e.g., { player_id })
 * @returns {string} JWT token
 */
function generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "1h" });
}

module.exports = { authenticateJWT, generateToken };