CyberTaxi Player Routes
Version: 0.1.3Last Updated: August 18, 2025
Overview
This directory contains the Express route handler for player management in the CyberTaxi backend. The player.js file manages API endpoints for retrieving player details, bank balance, score, and parking slot data, aligning with GDD Version 1.1 (July 24, 2025).
File

player.js (@version 0.4.2): Handles player-related endpoints (/api/player/:player_id, /api/player/:username/balance, /api/player/:username/score, /api/player/:username/slots).

Endpoints

GET /api/player/:player_id
Description: Fetches player details (username, email, bank_balance, score) by numeric player_id.
Parameters: player_id (BIGINT UNSIGNED, UNIQUE, matches players.player_id).
Response: JSON with player details or error (200, 400, 403, 404, 500).

GET /api/player/:username/balance
Description: Fetches bank balance by username.
Parameters: username (VARCHAR(50), UNIQUE, matches players.username).
Response: JSON with bank balance or error (200, 403, 404, 500).

GET /api/player/:username/score
Description: Fetches score by username.
Parameters: username (VARCHAR(50), UNIQUE, matches players.username).
Response: JSON with score or error (200, 403, 404, 500).

GET /api/player/:username/slots
Description: Fetches parking slot data (total_slots, used_slots, available_slots) by username.
Parameters: username (VARCHAR(50), UNIQUE, matches players.username).
Response: JSON with slot data or error (200, 403, 404, 500).

Schema Details

Players Table:
id: BIGINT UNSIGNED, PRIMARY KEY, used as foreign key in garages and vehicles.
player_id: BIGINT UNSIGNED, UNIQUE, used in JWT and API input for /api/player/:player_id.
username: VARCHAR(50), UNIQUE, used for login and /api/player/:username/\* routes.
score: DECIMAL(10,2), INDEX idx_score, used for leaderboard data.
Other fields: email, bank_balance, etc.

Garages Table:
player_id: BIGINT UNSIGNED, FOREIGN KEY to players.id, used for slot queries.

Vehicles Table:
player_id: BIGINT UNSIGNED, FOREIGN KEY to players.id, used for slot counts.

Gotchas

Username vs. Player ID:
Use :username for /balance, /score, and /slots routes to avoid schema mismatches. These routes map username to player_id for JWT validation and players.id for garages/vehicles queries.
Use :player_id only for /api/player/:player_id to fetch player details, matching players.player_id.

JWT Validation: JWT includes player_id (matches players.player_id). Ensure req.user.player_id matches the queried player_id or resolved player_id from username.
Schema Nuances: garages and vehicles reference players.id, not players.player_id. Username routes handle this mapping internally.
Error Logging: Errors are logged with detailed messages (e.g., Player not found for username: <username>). Check server logs for debugging.
Server Restart: After updating player.js, restart the server (npm start) to ensure new routes (e.g., /score) are mounted correctly.
Frontend Update: Update frontend (e.g., TeslaPage.tsx) to use /api/player/:username/balance, /api/player/:username/score, and /api/player/:username/slots.

Team Notes

Frontend: Update src/services/PlayerService.ts to use username-based routes for balance, score, and slots.
Testing: Test with valid/invalid username and player_id, and invalid JWT.
Alignment: Follows Code Complete Chapters 7 (defensive programming, reduce redundancy), 10 (collaboration), 20 (testing).
