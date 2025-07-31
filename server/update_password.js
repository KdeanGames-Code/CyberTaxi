const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

(async () => {
    try {
        // Generate bcrypt hash for 'test123'
        const hash = await bcrypt.hash("test123", 10);
        console.log("Hash for test123:", hash);

        // Connect to MySQL and update player_id=1
        const pool = mysql.createPool({
            host: "localhost",
            user: "cybertaxi_user",
            password: "secure_password",
            database: "cybertaxi_db",
        });

        const connection = await pool.getConnection();
        await connection.execute(
            "UPDATE players SET password_hash = ? WHERE player_id = 1",
            [hash]
        );
        console.log("Updated password_hash for player_id=1");

        connection.release();
        await pool.end();
    } catch (err) {
        console.error("Error:", err.message);
    }
})();
