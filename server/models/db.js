/**
 * @file db.js
 * @description Database connection module for CyberTaxi backend
 * @author CyberTaxi Team
 * @version 0.1.0
 */

const mysql = require("mysql2/promise"); // Using promise wrapper for async/await

// MySQL connection pool with test connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Test connection function with error handling
async function testConnection() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log("MySQL connection established successfully");
    } catch (error) {
        console.error("MySQL connection failed:", error.message);
    } finally {
        if (connection) connection.release();
    }
}

// Initial test
testConnection().catch(console.error);

module.exports = pool.promise(); // For async/await support
