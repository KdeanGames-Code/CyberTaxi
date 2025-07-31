/**
 * @file error-utils.js
 * @description Error handling middleware for CyberTaxi
 * @author CyberTaxi Team
 * @version 0.1.0
 */

/**
 * Middleware to handle errors and return JSON responses
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const errorHandler = (err, req, res, next) => {
    console.error(`Error in ${req.method} ${req.originalUrl}:`, err.message); // Debug log

    // Handle specific error cases
    if (err.message.includes("Missing") || err.message.includes("Invalid")) {
        return res.status(400).json({
            error: "Invalid data",
            details: err.message,
        });
    }

    // Default server error
    res.status(500).json({
        error: "Server error",
        details: err.message,
    });
};

module.exports = errorHandler;
