Models Directory
Version: 0.1.1Last Updated: August 17, 2025
Overview
Contains database configuration and connection logic for CyberTaxi, managing MySQL connections for player, vehicle, and garage data.
Files

db.js: Configures MySQL connection pool with mysql2/promise.

Dependencies

mysql2/promise: Async MySQL connection pool.
dotenv: Environment variable management.

Gotchas

Ensure MySQL server is running with correct credentials (host, user, password, database).
Configure environment variables in .env (see .env.example).

Team Notes

Used by all API routes (e.g., auth.js, player.js) for database queries.
Align with Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
