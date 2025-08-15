Routes Directory
Purpose
Contains API route handlers for CyberTaxi, organized into subdirectories for authentication, health checks, player data, vehicles, garages, tiles, and general routes.
Dependencies

express: Routing framework.
../config.js: API, TileServer, CORS URLs.
../middleware/auth.js (future): JWT verification.
../models/db.js: MySQL connection pool.

Gotchas

Ensure subdirectories (auth/, health/, etc.) are created during refactor.
Routes rely on config.js for dynamic URLs.
Ensure MySQL server and TileServer GL are running before requests.

Team Notes

Frontend calls routes via src/services/LoginService.ts (e.g., POST /api/auth/login/username).
Check GET /api/health before critical requests to avoid 500 errors.
See subdirectories for specific endpoints.
Align with Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
