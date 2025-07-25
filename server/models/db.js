/**
 * @file db.js
 * @description Database connection module for CyberTaxi backend
 * @author CyberTaxi Team
 * @version 0.1.0
 */

const mysql = require("mysql2"); // Base mysql2 for promise pool support
require("dotenv").config(); // Load environment variables from .env file

// MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Promise-enabled pool for async/await
const promisePool = pool.promise();

// Error listener for pool events (e.g., fatal errors)
pool.on("error", (err) => {
    console.error("MySQL pool error:", err.message);
});

// Test connection function with error handling
async function testConnection() {
    let connection;
    try {
        connection = await promisePool.getConnection();
        console.log("MySQL connection established successfully");
    } catch (error) {
        console.error("MySQL connection failed:", error.message);
    } finally {
        if (connection) connection.release();
    }
}

// Initial test
testConnection().catch(console.error);

module.exports = promisePool; // Export promise pool for async/await support
