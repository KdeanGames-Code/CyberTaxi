/**
 * @file server/models/db.js
 * @description Database connection pool for CyberTaxi using MySQL.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.1
 * @note Configures a MySQL connection pool with mysql2/promise for async queries. Supports PWA-friendly APIs with reliable database access.
 * @see https://kdeangames.net/CyberTaxi/MockUp/Docs/GDD.html
 */
const mysql = require("mysql2/promise");

/**
 * MySQL connection pool configuration
 * @type {Object}
 * @property {string} host - Database host (default: localhost)
 * @property {string} user - Database user (default: root)
 * @property {string} password - Database password (default: empty)
 * @property {string} database - Database name (default: cybertaxi_db)
 * @property {boolean} waitForConnections - Wait for available connections
 * @property {number} connectionLimit - Maximum number of connections (default: 10)
 * @property {number} queueLimit - Maximum queued connections (0 = unlimited)
 * @property {number} connectTimeout - Connection timeout in milliseconds (default: 10000)
 * @property {number} idleTimeout - Idle connection timeout in milliseconds (default: 60000)
 */
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "cybertaxi_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000, // 10 seconds timeout
    idleTimeout: 60000 // 60 seconds before releasing idle connections
});

/**
 * Initialize and test pool connection
 * @async
 * @function
 * @throws {Error} If pool connection fails
 */
pool.getConnection()
    .then(() => console.log("DB Pool Connected Successfully"))
    .catch((err) => console.error("DB Pool Connection Failed:", err.message));

module.exports = pool;