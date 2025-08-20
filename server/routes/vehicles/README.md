CyberTaxi Vehicles Routes
Version: 0.1.3Last Updated: August 20, 2025
Overview
This directory contains the Express route handler for vehicle management in the CyberTaxi backend. The vehicles.js file manages API endpoints for retrieving and creating vehicles, aligning with GDD Version 1.1 (July 24, 2025) for frontend mapping of player and other players' vehicles.
File

vehicles.js (@version 0.3.4): Handles vehicle-related endpoints (/api/vehicles/others, /api/vehicles, /api/vehicles/:player_id, /api/player/:username/vehicles).

Endpoints

GET /api/vehicles/others
Description: Fetches all vehicles except those of the authenticated player, for map rendering.
Parameters:
status (query, optional): Filter by status (active, inactive).

Response: JSON with array of vehicles or error (200, 404, 500).

POST /api/vehicles
Description: Creates a vehicle, deducting cost from player balance.
Parameters (body):
player_id: Numeric player ID (required).
type: Vehicle type (Model Y, Model X, Model S, Cybertruck).
cost: Vehicle cost (numeric).
status: Vehicle status (active, inactive).
coords: [lat, lng] coordinates (array of numbers, required).
wear, battery, mileage (optional, defaults: 0, 100, 0).
dest: [lat, lng] destination coordinates (optional).

Response: JSON with vehicle ID or error (201, 400, 404, 500).

GET /api/vehicles/:player_id
Description: Fetches vehicles by numeric player_id for map rendering.
Parameters:
player_id: Numeric player ID (matches players.player_id).
status (query, optional): Filter by status (active, inactive).

Response: JSON with array of vehicles or error (200, 400, 403, 404, 500).

GET /api/player/:username/vehicles
Description: Fetches vehicles by username for map rendering.
Parameters:
username: Player username (VARCHAR(50), UNIQUE).
status (query, optional): Filter by status (active, inactive).

Response: JSON with array of vehicles or error (200, 403, 404, 500).

Schema Details

Vehicles Table:
id: VARCHAR(10), PRIMARY KEY (e.g., CT-001).
player_id: BIGINT UNSIGNED, FOREIGN KEY to players.id.
type: VARCHAR(50) (Model Y, Model X, Model S, Cybertruck).
status: VARCHAR(20) (active, inactive).
wear, battery, mileage, tire_mileage, cost: DECIMAL(10,2).
lat, lng, dest_lat, dest_lng: DECIMAL(9,6) for coordinates.
purchase_date, delivery_timestamp, created_at, updated_at: DATETIME.

Players Table:
id: BIGINT UNSIGNED, PRIMARY KEY, used as foreign key in vehicles.
player_id: BIGINT UNSIGNED, UNIQUE, used in JWT and API input.
username: VARCHAR(50), UNIQUE, used for /api/player/:username/vehicles.

Gotchas

Player ID vs. Table ID: player_id (API/JWT) maps to players.player_id, but vehicles.player_id references players.id. Endpoints handle this mapping.
JWT Validation: JWT includes player_id. Ensure req.user.player_id matches queried player_id or resolved player_id from username.
Input Validation: Validates numeric player_id, status (active, inactive), and coordinates.
Server Restart: Restart server (npm start) after updating vehicles.js.
Server Connectivity: If Unable to connect to the remote server occurs, check:
Server status: curl http://localhost:3000/api/health.
Port conflicts: netstat -a -n -o | find "3000" (Windows).
Node processes: Get-Process -Name "node" | Select-Object -Property Id, ProcessName, Path.
Restart server: Stop-Process -Name "node" -Force; npm start.

Database Debugging:
If Vehicle not found occurs, verify vehicles table:mysql -u <user> -p -e "SELECT id, player_id, type, status, cost, lat, lng, dest_lat, dest_lng FROM vehicles WHERE id LIKE 'CT-%'" cybertaxi_db

Check POST /api/vehicles insert: Ensure id (VARCHAR) is correctly generated (CT-XXX).
Verify foreign key: vehicles.player_id matches players.id.
Check schema: Ensure vehicles.id is VARCHAR(10) and vehicles.player_id is BIGINT UNSIGNED.

Team Notes

Frontend: Update src/services/MapService.ts to use /api/vehicles/:player_id and /api/vehicles/others for rendering player and other players' vehicles on the map. Use coords and dest for positioning. Cache responses for PWA offline sync.
Testing: Test endpoints with valid/invalid inputs. Example:Invoke-WebRequest -Uri http://localhost:3000/api/vehicles/1 -Method GET -Headers @{"Authorization"="Bearer <valid_jwt>"}
Invoke-WebRequest -Uri http://localhost:3000/api/vehicles/others -Method GET -Headers @{"Authorization"="Bearer <valid_jwt>"}
Invoke-WebRequest -Uri http://localhost:3000/api/vehicles -Method POST -Body '{"player_id":1,"type":"Model Y","cost":50000,"status":"active","coords":[30.2672,-97.7431],"dest":[30.276,-97.734]}' -ContentType "application/json" -Headers @{"Authorization"="Bearer <valid_jwt>"}

Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
