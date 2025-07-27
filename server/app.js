/**
 * @file app.js
 * @description Main Express application for CyberTaxi backend server
 * @author CyberTaxi Team
 * @version 0.1.0
 */

const express = require("express");
const app = express();
const port = 3000;

// Initialize database connection (triggers testConnection in db.js)
require("./models/db");

/**
 * Middleware to parse JSON request bodies
 * @function
 */
app.use(express.json());

/**
 * Mount API routes from the routes directory
 * @type {express.Router}
 */
const healthRouter = require("./routes/health");
const vehiclesRouter = require("./routes/vehicles");
const tilesRouter = require("./routes/tiles");
app.use("/api", healthRouter);
app.use("/api", vehiclesRouter);
app.use("/api", tilesRouter);

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
