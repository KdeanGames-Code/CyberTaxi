Health Routes
Version: 0.2.3 Last Updated: August 17, 2025
Overview
Provides system health checks for CyberTaxi, verifying database connectivity, JWT configuration, connection pool status, and vehicle count to ensure backend reliability for the PWA frontend.
Endpoints

GET /api/health: Checks database connectivity, players table access, JWT secret, and connection pool status.
GET /api/system-health: Comprehensive check including web server, database, vehicle count, JWT, and pool status.

Dependencies

express: Routing framework.
../../models/db.js: MySQL connection pool (mysql2/promise).
../../config.js: API_BASE_URL.

Gotchas

Ensure MySQL server is running with correct credentials.
JWT*SECRET environment variable must be set.
players and vehicles tables must exist in the database.
Pool stats use SHOW SESSION STATUS LIKE 'Threads*%' due to mysql2/promise limitations.

Team Notes

Frontend should call GET /api/health before auth requests (e.g., via src/services/LoginService.ts) using src/utils/apiUtils.ts (pending creation).
Responses are PWA-friendly for offline sync support.
Align with Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
