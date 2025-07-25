/**
 * @file app.js
 * @description Main Express application for CyberTaxi backend server
 * @author CyberTaxi Team
 * @version 0.1.0
 */

const express = require("express");
const app = express();
const port = 3000;

/**
 * Health check endpoint to verify server status
 * @route GET /api/health
 * @returns {Object} JSON response with status and message
 */
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "CyberTaxi server is healthy",
    });
});

/**
 * Start the Express server and log the port
 * @function
 * @listens port 3000
 * @returns {void}
 */
app.listen(port, () => {
    console.log(`CyberTaxi server running on port ${port}`);
});

module.exports = app; // For potential testing
