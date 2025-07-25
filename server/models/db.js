// server/models/db.js - MySQL connection pool for CyberTaxi
const mysql = require("mysql2/promise"); // npm i mysql2 if needed

const pool = mysql.createPool({
    host: "localhost",
    user: "cybertaxi_user",
    password: "secure_password",
    database: "cybertaxi_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Init test log
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("DB Pool Connected Successfully");
        connection.release();
    } catch (err) {
        console.error("DB Pool Connection Failed:", err.message);
    }
})();

module.exports = pool;
