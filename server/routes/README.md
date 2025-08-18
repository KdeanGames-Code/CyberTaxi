CyberTaxi Backend Routes
Version: 0.2.1Last Updated: August 18, 2025
Overview
This directory contains the Express route handlers for the CyberTaxi backend, organized by resource. Each route file handles specific API endpoints, ensuring modularity and scalability.
Directory Structure

auth/authRoutes.js (@version 0.4.1): Handles authentication routes (/api/auth/_).
player/player.js (@version 0.4.1): Manages player data retrieval (/api/player/_).
health/health.js (@version 0.2.3): Provides health check endpoints (/api/health).
main/main.js (@version 0.2.0): Handles miscellaneous API routes.

Player Routes Details

File: player/player.js
Endpoints:
GET /api/player/:player_id: Fetches player details by numeric player_id (BIGINT UNSIGNED, UNIQUE).
GET /api/player/:username/balance: Fetches bank balance by username (VARCHAR(50), UNIQUE).
GET /api/player/:username/slots: Fetches parking slot data by username.

Notes:
Username routes map username to player*id for JWT validation and use players.id for garages/vehicles queries.
player_id route is limited to /api/player/:player_id for fetching player details.
Routes use regex: :player_id(\\d+) for numeric IDs, :username([a-zA-Z0-9*-]+) for usernames.
Schema: players table has id (PRIMARY KEY), player_id (UNIQUE), username (UNIQUE). garages references players.id.

Gotchas

Use username for /balance and /slots endpoints to avoid schema mismatches.
Ensure JWT includes player_id matching players.player_id.
Check server logs for detailed error messages (e.g., Player not found for username: <username>).

Team Notes

Frontend should update to use /api/player/:username/balance and /api/player/:username/slots.
Align with Code Complete Chapters 7 (defensive programming, reduce redundancy), 10 (collaboration), 20 (testing).
