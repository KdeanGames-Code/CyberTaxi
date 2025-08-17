Garages Routes
Version: 0.2.1Last Updated: August 17, 2025
Overview
Handles garage and lot management for CyberTaxi, including creation and retrieval of garage data. Uses JWT for authentication.
Endpoints

POST /api/garages: Create a new garage or lot.
GET /api/garages/:player_id: Fetch garages for a specific player.
GET /api/player/:username/garages: Fetch garages by username.

Dependencies

express: Routing framework.
../../../models/db.js: MySQL connection pool (mysql2/promise).
../../../middleware/authMiddleware.js: JWT authentication.
../../../utils/query-utils.js: Utility for balance queries.

Gotchas

Ensure MySQL server is running with correct credentials.
JWT_SECRET environment variable must be set.
players and garages tables must exist in the database.
Garage coordinates must be in [lat, lng] format.

Team Notes

Frontend uses src/services/GarageService.ts (pending) to call garage endpoints.
Responses are PWA-friendly for offline sync support.
Align with Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
