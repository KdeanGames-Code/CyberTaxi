/**
 * @file app.js
 * @description Main Express application for CyberTaxi backend server
 * @author CyberTaxi Team
 * @version 0.1.0
 */

const express = require("express");
const app = express();
const port = 3000;
const { spawn } = require("child_process");

// Initialize database connection (triggers testConnection in db.js)
require("./models/db");

// Start TileServer GL as subprocess on port 8080
const tileServer = spawn("cmd", [
    "/c",
    "npx",
    "tileserver-gl",
    "--config",
    "config.json",
    "--port",
    "8080",
    "--no-cors",
]);
tileServer.on("error", (err) =>
    console.error("TileServer GL failed to start:", err.message)
);
tileServer.on("close", (code) =>
    console.log(`TileServer GL exited with code ${code}`)
);
tileServer.stdout.on("data", (data) => console.log(`TileServer GL: ${data}`));
console.log("Started TileServer GL on port 8080");

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
