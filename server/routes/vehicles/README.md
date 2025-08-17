Vehicles Routes
Version: 0.3.1Last Updated: August 17, 2025
Overview
Handles vehicle management for CyberTaxi, including purchasing and retrieving vehicle data. Uses JWT for authentication and supports map integration.
Endpoints

GET /api/vehicles/others: Fetch all vehicles except those of the authenticated player.
POST /api/vehicles/purchase: Purchase a new vehicle.
POST /api/vehicles: Create a new vehicle.
GET /api/vehicles/:player_id: Fetch vehicles for a specific player.
GET /api/player/:username/vehicles: Fetch vehicles by username.

Dependencies

express: Routing framework.
../../../models/db.js: MySQL connection pool (mysql2/promise).
../../../middleware/authMiddleware.js: JWT authentication.
../../../utils/query-utils.js: Utility for balance queries.

Gotchas

Ensure MySQL server is running with correct credentials.
JWT_SECRET environment variable must be set.
players and vehicles tables must exist in the database.
Vehicle coordinates must be in [lat, lng] format.

Team Notes

Frontend uses src/services/VehicleService.ts (pending) to call vehicle endpoints.
Responses are PWA-friendly for offline sync support.
Align with Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
