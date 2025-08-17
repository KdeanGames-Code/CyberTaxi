Routes Directory
Version: 0.2.0Last Updated: August 17, 2025
Overview
Contains API route handlers for CyberTaxi, organized into subdirectories for authentication, health checks, player data, vehicles, garages, tiles, and general routes.
Subdirectories

auth/: Authentication routes (signup, login, password reset).
health/: System health check endpoints.
player/: Player data and balance/slot queries.
vehicles/: Vehicle management (purchase, retrieval).
garages/: Garage and lot management.
tiles/: Map tile and font serving.
main/: General-purpose routes (currently empty).

Dependencies

express: Routing framework.
../config.js: API_BASE_URL, TILE_SERVER_URL, CORS_ORIGINS.
../middleware/authMiddleware.js: JWT verification.
../models/db.js: MySQL connection pool.
../utils/query-utils.js: Utility for balance queries.
../utils/error-utils.js: Error handling middleware.

Gotchas

Ensure all subdirectories (auth/, health/, player/, vehicles/, garages/, tiles/, main/) exist.
Routes rely on config.js for dynamic URLs.
Ensure MySQL server and TileServer GL are running before requests.
JWT_SECRET environment variable must be set for authentication routes.

Team Notes

Frontend calls routes via src/services/LoginService.ts, src/services/PlayerService.ts, src/services/VehicleService.ts, src/services/GarageService.ts (pending).
Check GET /api/health before critical requests to avoid 500 errors.
See subdirectory READMEs for specific endpoints.
Align with Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
