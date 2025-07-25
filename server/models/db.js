/**
 * @file db.js
 * @description Database connection module for CyberTaxi backend
 * @author CyberTaxi Team
 * @version 0.1.0
 */

const mysql = require("mysql2");

// Placeholder for MySQL connection pool (to be configured with env vars later)
/*
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise(); // For async/await support
*/

module.exports = null; // Temporary null until connection is set up
