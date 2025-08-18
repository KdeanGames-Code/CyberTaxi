CyberTaxi Player Routes
Version: 0.1.1Last Updated: August 18, 2025
Overview
Contains API route handlers for player management in CyberTaxi, including player details, balance, and parking slot queries, aligning with GDD Version 1.1 (July 24, 2025).
Files

player.js (@version 0.4.1): Handles player-related endpoints (/api/player/:player_id, /api/player/:username/balance, /api/player/:username/slots).

Endpoints

GET /api/player/:player_id
Description: Fetches player details (username, email, bank_balance, score) by numeric player_id.
Parameters: player_id (BIGINT UNSIGNED, UNIQUE, matches players.player_id).
Response: JSON with player details or error (200, 400, 403, 404, 500).

GET /api/player/:username/balance
Description: Fetches bank balance by username.
Parameters: username (VARCHAR(50), UNIQUE, matches players.username).
Response: JSON with bank balance or error (200, 403, 404, 500).

GET /api/player/:username/slots
Description: Fetches parking slot data (total_slots, used_slots, available_slots) by username.
Parameters: username (VARCHAR(50), UNIQUE, matches players.username).
Response: JSON with slot data or error (200, 403, 404, 500).

Dependencies

express: Routing framework.
../../middleware/authMiddleware.js: JWT verification.
../../models/db.js: MySQL connection pool.
../../utils/query-utils.js: Utility for balance queries.

Schema Details

Players Table:
id: BIGINT UNSIGNED, PRIMARY KEY, used as foreign key in garages and vehicles.
player_id: BIGINT UNSIGNED, UNIQUE, used in JWT and API input for /api/player/:player_id.
username: VARCHAR(50), UNIQUE, used for login and /api/player/:username/\* routes.
Other fields: email, bank_balance, score, etc.

Garages Table:
player_id: BIGINT UNSIGNED, FOREIGN KEY to players.id, used for slot queries.

Vehicles Table:
player_id: BIGINT UNSIGNED, FOREIGN KEY to players.id, used for slot counts.

Gotchas

Username vs. Player ID:
Use :username for /balance and /slots routes to avoid schema mismatches. These routes map username to player_id for JWT validation and players.id for garages/vehicles queries.
Use :player_id only for /api/player/:player_id to fetch player details, matching players.player_id.

JWT Validation: JWT includes player_id (matches players.player_id). Ensure req.user.player_id matches the queried player_id or resolved player_id from username.
Schema Nuances: garages and vehicles reference players.id, not players.player_id. Username routes handle this mapping internally.
Error Logging: Errors are logged with detailed messages (e.g., Player not found for username: <username>). Check server logs for debugging.
JWT_SECRET: Ensure JWT_SECRET environment variable is set.
Database: players table must exist with required columns (id, player_id, username, etc.).
Frontend Update: Update frontend (e.g., TeslaPage.tsx) to use /api/player/:username/balance and /api/player/:username/slots.

Team Notes

Frontend: Update src/services/PlayerService.ts to use username-based routes.
Testing: Test with valid/invalid username and player_id, and invalid JWT.
Alignment: Follows Code Complete Chapters 7 (defensive programming, reduce redundancy), 10 (collaboration), 20 (testing).
