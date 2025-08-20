CyberTaxi Backend Routes
Version: 0.2.3Last Updated: August 20, 2025
Overview
This directory contains the Express route handlers for the CyberTaxi backend, organized by resource. Each route file handles specific API endpoints, ensuring modularity and scalability.
Directory Structure

auth/authRoutes.js (@version 0.4.1): Handles authentication routes (/api/auth/_).
player/player.js (@version 0.4.2): Manages player data retrieval (/api/player/_).
tiles/tiles.js (@version 0.2.7): Handles map tile and font serving (/api/tiles/_, /api/fonts/_).
vehicles/vehicles.js (@version 0.3.2): Manages vehicle data (/api/vehicles/\*, /api/player/:username/vehicles).
health/health.js (@version 0.2.3): Provides health check endpoints (/api/health).
main/main.js (@version 0.2.0): Handles miscellaneous API routes.

Player Routes Details

File: player/player.js
Endpoints:
GET /api/player/:player_id: Fetches player details by numeric player_id (BIGINT UNSIGNED, UNIQUE).
GET /api/player/:username/balance: Fetches bank balance by username (VARCHAR(50), UNIQUE).
GET /api/player/:username/score: Fetches score by username.
GET /api/player/:username/slots: Fetches parking slot data by username.
GET /api/player/:username/vehicles: Fetches vehicles by username.

Notes:
Username routes map username to player*id for JWT validation and use players.id for garages/vehicles queries.
player_id route is limited to /api/player/:player_id for fetching player details.
Routes use regex: :player_id(\\d+) for numeric IDs, :username([a-zA-Z0-9*-]+) for usernames.
Schema: players table has id (PRIMARY KEY), player_id (UNIQUE), username (UNIQUE). garages references players.id.

Tiles Routes Details

File: tiles/tiles.js
Endpoints:
GET /api/tiles/:style/:z/:x/:y.:format: Proxies map tile requests to TileServer GL (port 8080).
GET /api/tiles/:style/512/:z/:x/:y.:format: Proxies tiles with optional /512/ resolution.
GET /api/fonts/:fontstack/:range.pbf: Serves font glyph PBF files.

Notes:
Tile requests are proxied to http://localhost:8080/styles/:style/[512/]z/x/y.:format.
Fonts are served from server/fonts/<fontstack>/<range>.pbf.
CORS set to config.CORS_ORIGINS (default: http://localhost:5173).
Schema: No database interaction; relies on TileServer GL and file system.

Vehicles Routes Details

File: vehicles/vehicles.js
Endpoints:
GET /api/vehicles/others: Fetches vehicles of other players.
POST /api/vehicles/purchase: Purchases a vehicle, deducts balance.
POST /api/vehicles: Creates a vehicle without balance check.
GET /api/vehicles/:player_id: Fetches vehicles by numeric player_id.
GET /api/player/:username/vehicles: Fetches vehicles by username.

Notes:
Uses players.id for foreign key, mapped from player_id or username.
Validates numeric player_id, status, and coordinates.
JWT ensures req.user.player_id matches queried player_id or resolved player_id.

Gotchas

Use username for /api/player/:username/\* to avoid schema mismatches.
Use numeric player_id for /api/vehicles/:player_id and /api/player/:player_id.
Ensure JWT includes player_id matching players.player_id.
TileServer GL must run on port 8080; fonts must exist in server/fonts/.
Check server logs for detailed error messages (e.g., Player not found for username: <username>).
Restart server (npm start) after route updates.

Team Notes

Frontend should update to use /api/player/:username/_ and /api/vehicles/:player_id. Use /api/tiles/_ and /api/fonts/\* for map rendering.
Align with Code Complete Chapters 7 (defensive programming, reduce redundancy), 10 (collaboration), 20 (testing).
