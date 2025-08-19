/**
 * @file server/app.js
 * @description Main entry point for CyberTaxi backend
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.16
 * @note Initializes Express server, middleware, and routes
 * @see https://kdeangames.net/CyberTaxi/MockUp/Docs/GDD.html
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { spawn } = require("child_process");
const errorHandler = require("./utils/error-utils");
const config = require("./config");

// Initialize database connection
require("./models/db");

// Start TileServer GL as subprocess using config.TILE_SERVER_URL
const tileServerPort = new URL(config.TILE_SERVER_URL).port || "8080";
const tileServer = spawn("cmd", [
    "/c",
    "npx",
    "tileserver-gl",
    "--config",
    "config.json",
    "--port",
    tileServerPort,
    "--no-cors",
]);
tileServer.on("error", (err) =>
    console.error("TileServer GL failed to start:", err.message)
);
tileServer.on("close", (code) =>
    console.log(`TileServer GL exited with code ${code}`)
);
tileServer.stdout.on("data", (data) => console.log(`TileServer GL: ${data}`));
console.log(`Started TileServer GL on port ${tileServerPort}`);

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
    app.use("/api/auth", require("./routes/auth/authRoutes"));
    console.log("Auth route mounted at /api/auth");
    app.use("/api", require("./routes/player/player"));
    console.log("Player route mounted at /api");
    app.use("/api", require("./routes/tiles/tiles"));
    console.log("Tiles route mounted at /api");
    app.use("/api", require("./routes/health/health"));
    console.log("Health route mounted at /api");
    app.use("/api", require("./routes/main/main"));
    console.log("Main route mounted at /api");
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