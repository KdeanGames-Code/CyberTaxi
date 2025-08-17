Player Routes
Version: 0.2.1Last Updated: August 17, 2025
Overview
Handles player management for CyberTaxi, including retrieving player details, bank balance, and parking slots. Uses JWT for authentication.
Endpoints

GET /api/player/:player_id: Fetch player details (username, email, balance, score).
GET /api/player/:player_id/balance: Fetch player bank balance.
GET /api/player/:username/balance: Fetch balance by username.
GET /api/player/:player_id/slots: Fetch total, used, and available parking slots.
GET /api/player/:username/slots: Fetch slots by username.

Dependencies

express: Routing framework.
../../../models/db.js: MySQL connection pool (mysql2/promise).
../../../middleware/authMiddleware.js: JWT authentication.
../../../utils/query-utils.js: Utility for balance queries.

Gotchas

Ensure MySQL server is running with correct credentials.
JWT_SECRET environment variable must be set.
players, garages, and vehicles tables must exist in the database.

Team Notes

Frontend uses src/services/PlayerService.ts (pending) to call player endpoints.
Responses are PWA-friendly for offline sync support.
Align with Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
