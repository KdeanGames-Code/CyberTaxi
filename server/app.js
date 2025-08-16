/**
 * @file app.js
 * @description Main Express application for CyberTaxi backend server
 * @author CyberTaxi Team
 * @version 0.1.0
 * @note Initializes TileServer GL subprocess and mounts API routes with CORS and error handling.
 * @see https://kdeangames.net/CyberTaxi/MockUp/Docs/GDD.html
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const { spawn } = require("child_process");
const errorHandler = require("./utils/error-utils");
const config = require("./config");

// Initialize database connection
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
 * Middleware to parse JSON request bodies and handle CORS
 * @function
 */
app.use(express.json());
app.use(
    cors({
        origin: config.CORS_ORIGINS,
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: false,
    })
);
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.originalUrl}`); // Debug log
    next();
});

/**
 * Mount API routes from the routes directory
 * @type {express.Router}
 */
try {
    const authRouter = require("./routes/auth");
    app.use("/api/auth", authRouter);
    console.log("Auth route mounted at /api/auth");
    const playerRouter = require("./routes/player");
    app.use("/api", playerRouter);
    const healthRouter = require("./routes/health/health");
    app.use("/api", healthRouter);
    console.log("Health route mounted at /api");
    const vehiclesRouter = require("./routes/vehicles");
    app.use("/api", vehiclesRouter);
    const tilesRouter = require("./routes/tiles");
    app.use("/api", tilesRouter);
    const garagesRouter = require("./routes/garages");
    app.use("/api", garagesRouter);
    console.log("API routes mounted successfully");
} catch (error) {
    console.error("Failed to mount API routes:", error.message);
}

/**
 * Fallback route for debugging
 * @route ALL /api/*
 */
app.all("/api/*", (req, res) => {
    console.log(`Fallback route hit: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        status: "Error",
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

/**
 * Error handling middleware
 */
app.use(errorHandler);

/**
 * Start the Express server and log the port
 * @function
 * @listens port 3000
 * @returns {void}
 */
app.listen(port, () => {
    console.log(`CyberTaxi server running on port ${port}`);
});

module.exports = app;