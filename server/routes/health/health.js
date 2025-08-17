/**
 * @file server/routes/health/health.js
 * @description Health check endpoints for CyberTaxi to verify system components.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.2.3
 * @note Provides endpoints to check database, web server, JWT configuration, and connection pool status. Responses are PWA-friendly for frontend integration with LoginService.ts.
 * @see https://kdeangames.net/CyberTaxi/MockUp/Docs/GDD.html
 */
const express = require("express");
const router = express.Router();
const pool = require("../../models/db");
const config = require("../../config");

/**
 * Check basic system health (database, JWT, connection pool).
 * @route GET /api/health
 * @returns {Object} JSON response with system status or error
 * @throws {Error} If database connection, JWT configuration, or pool status fails
 */
router.get("/health", async (req, res) => {
    try {
        const healthDetails = {};

        // Check database connectivity
        const startQuery = Date.now();
        await pool.execute("SELECT 1 AS test").catch((err) => {
            console.error("Database connectivity check failed:", err.message);
            throw new Error(`Database connection failed: ${err.message}`);
        });
        console.log(`Database health query took ${Date.now() - startQuery}ms`); // Debug log
        healthDetails.db = "Connected";

        // Check players table access
        await pool.execute("SELECT 1 FROM players LIMIT 1").catch((err) => {
            console.error("Players table access failed:", err.message);
            throw new Error(`Players table access failed: ${err.message}`);
        });
        healthDetails.players_table = "Accessible";

        // Check JWT secret
        if (!process.env.JWT_SECRET) {
            console.error("JWT configuration error: JWT_SECRET not set");
            throw new Error("JWT configuration error: JWT_SECRET not set");
        }
        healthDetails.jwt = "Configured";

        // Check connection pool status
        const [stats] = await pool.query("SHOW SESSION STATUS LIKE 'Threads_%'").catch((err) => {
            console.error("Pool stats query failed:", err.message);
            throw new Error(`Pool stats query failed: ${err.message}`);
        });
        const poolStatus = {
            totalConnections: stats.find(row => row.Variable_name === 'Threads_connected')?.Value || 0,
            activeConnections: stats.find(row => row.Variable_name === 'Threads_running')?.Value || 0,
            idleConnections: (stats.find(row => row.Variable_name === 'Threads_connected')?.Value || 0) -
                             (stats.find(row => row.Variable_name === 'Threads_running')?.Value || 0)
        };
        if (poolStatus.totalConnections === 0) {
            console.error("Connection pool error: No connections available");
            throw new Error("Connection pool error: No connections available");
        }
        healthDetails.pool = poolStatus;

        console.log("Health check passed:", healthDetails); // Success log
        res.status(200).json({ status: "OK", details: healthDetails });
    } catch (error) {
        console.error("Health check failed:", err.message);
        res.status(500).json({
            status: "Error",
            message: "System health check failed",
            details: error.message
        });
    }
});

/**
 * Check comprehensive system health (web server, database, vehicle count, JWT, pool).
 * @route GET /api/system-health
 * @returns {Object} JSON response with detailed system status or error
 * @throws {Error} If any system component check fails
 */
router.get("/system-health", async (req, res) => {
    try {
        const healthDetails = {};

        // Check web server (implicit via response)
        healthDetails.web_server = "Running";

        // Check database connectivity
        const startQuery = Date.now();
        await pool.execute("SELECT 1 AS test").catch((err) => {
            console.error("Database connectivity check failed:", err.message);
            throw new Error(`Database connection failed: ${err.message}`);
        });
        console.log(`Database health query took ${Date.now() - startQuery}ms`); // Debug log
        healthDetails.db = "Connected";

        // Check players table access
        await pool.execute("SELECT 1 FROM players LIMIT 1").catch((err) => {
            console.error("Players table access failed:", err.message);
            throw new Error(`Players table access failed: ${err.message}`);
        });
        healthDetails.players_table = "Accessible";

        // Check vehicle count
        const [rows] = await pool.execute(
            "SELECT COUNT(*) AS vehicle_count FROM vehicles"
        ).catch((err) => {
            console.error("Vehicle count query failed:", err.message);
            throw new Error(`Vehicle count query failed: ${err.message}`);
        });
        healthDetails.vehicle_count = rows[0].vehicle_count;

        // Check JWT secret
        if (!process.env.JWT_SECRET) {
            console.error("JWT configuration error: JWT_SECRET not set");
            throw new Error("JWT configuration error: JWT_SECRET not set");
        }
        healthDetails.jwt = "Configured";

        // Check connection pool status
        const [stats] = await pool.query("SHOW SESSION STATUS LIKE 'Threads_%'").catch((err) => {
            console.error("Pool stats query failed:", err.message);
            throw new Error(`Pool stats query failed: ${err.message}`);
        });
        const poolStatus = {
            totalConnections: stats.find(row => row.Variable_name === 'Threads_connected')?.Value || 0,
            activeConnections: stats.find(row => row.Variable_name === 'Threads_running')?.Value || 0,
            idleConnections: (stats.find(row => row.Variable_name === 'Threads_connected')?.Value || 0) -
                             (stats.find(row => row.Variable_name === 'Threads_running')?.Value || 0)
        };
        if (poolStatus.totalConnections === 0) {
            console.error("Connection pool error: No connections available");
            throw new Error("Connection pool error: No connections available");
        }
        healthDetails.pool = poolStatus;

        console.log("System health check passed:", healthDetails); // Success log
        res.status(200).json({ status: "OK", details: healthDetails });
    } catch (error) {
        console.error("System health check failed:", err.message);
        res.status(500).json({
            status: "Error",
            message: "System health check failed",
            details: error.message
        });
    }
});

module.exports = router;