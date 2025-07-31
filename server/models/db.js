/**
 * @file db.js
 * @description Database connection pool for CyberTaxi
 * @author CyberTaxi Team
 * @version 0.1.0
 */

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "cybertaxi_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000, // 10 seconds timeout
    acquireTimeoutMillis: 10000, // 10 seconds to acquire connection
    idleTimeout: 60000, // 60 seconds before releasing idle connections
});

pool.getConnection()
    .then(() => console.log("DB Pool Connected Successfully"))
    .catch((err) => console.error("DB Pool Connection Failed:", err.message));

module.exports = pool;
