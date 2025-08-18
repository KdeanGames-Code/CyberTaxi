Routes Directory
Version: 0.2.6Last Updated: August 18, 2025
Overview
Contains API route handlers for CyberTaxi, organized into subdirectories for authentication, player management, health checks, and general routes. Other routes (vehicles, tiles, garages) are pending refactor.
Subdirectories

auth/: Authentication routes (signup, login, password reset).
player/: Player data and balance/slot queries.
health/: System health check endpoints.
main/: General-purpose routes (currently empty).

Dependencies

express: Routing framework.
../config.js: API_BASE_URL, TILE_SERVER_URL, CORS_ORIGINS.
../middleware/authMiddleware.js: JWT verification.
../models/db.js: MySQL connection pool.
../utils/query-utils.js: Utility for balance queries.
../utils/error-utils.js: Error handling middleware.

Gotchas

Ensure subdirectories (auth/, player/, health/, main/) exist.
Routes rely on config.js for dynamic URLs.
Ensure MySQL server and TileServer GL are running before requests.
JWT_SECRET environment variable must be set for authentication routes.

Team Notes

Frontend calls routes via src/services/LoginService.ts, src/services/PlayerService.ts (pending).
Check GET /api/health before critical requests to avoid 500 errors.
See subdirectory READMEs for specific endpoints.
Align with Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
