CyberTaxi Vehicles Routes
Version: 0.1.4Last Updated: August 20, 2025
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
Example Response:{
"status": "Success",
"vehicles": [
{
"id": "5",
"type": "Model Y",
"status": "active",
"wear": 0.0,
"battery": 100.0,
"mileage": 0.0,
"tire_mileage": 0.0,
"purchase_date": "2025-08-04T02:59:03.000Z",
"delivery_timestamp": null,
"cost": 50000.0,
"coords": [30.2672, -97.7431],
"dest": null
}
]
}

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
Example Response:{
"status": "Success",
"vehicle_id": "CT-001"
}

GET /api/vehicles/:player_id
Description: Fetches vehicles by numeric player_id for map rendering.
Parameters:
player_id: Numeric player ID (matches players.player_id).
status (query, optional): Filter by status (active, inactive).

Response: JSON with array of vehicles or error (200, 400, 403, 404, 500).
Example Response:{
"status": "Success",
"vehicles": [
{
"id": "1",
"player_id": 1,
"type": "Model Y",
"status": "active",
"wear": 0.0,
"battery": 100.0,
"mileage": 0.0,
"tire_mileage": 0.0,
"purchase_date": "2025-08-04T02:59:03.000Z",
"delivery_timestamp": null,
"cost": 50000.0,
"created_at": "2025-08-04T02:59:03.000Z",
"updated_at": "2025-08-04T02:59:03.000Z",
"coords": [30.2672, -97.7431],
"dest": null
}
]
}

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

Frontend Guidance
To render player and other players' vehicles on the map in MapService.ts, use the following endpoints:

1. Fetch Player Vehicles (GET /api/vehicles/:player_id)

Purpose: Display the authenticated player’s vehicles on the map.
Endpoint: GET http://localhost:3000/api/vehicles/:player_id
Headers:
Authorization: Bearer <jwt_token> (from /api/auth/login/username).

Parameters:
player_id: Numeric ID from JWT (player_id: 1 for Kevin-Dean).
status (optional query): Filter by active or inactive (e.g., ?status=active).

Response: Array of vehicles with coords and dest for map plotting.
Implementation:// src/services/MapService.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const fetchPlayerVehicles = async (playerId: number, token: string) => {
try {
const response = await axios.get(`${API_BASE_URL}/vehicles/${playerId}`, {
headers: { Authorization: `Bearer ${token}` },
params: { status: 'active' }, // Optional: filter active vehicles
});
return response.data.vehicles; // Array of vehicles
} catch (error) {
console.error('Failed to fetch player vehicles:', error.response?.data || error.message);
throw error;
}
};

// Usage in TeslaPage.tsx
import { fetchPlayerVehicles } from './MapService';

const renderPlayerVehicles = async () => {
const token = localStorage.getItem('jwt_token'); // From login
const playerId = 1; // From login response
const vehicles = await fetchPlayerVehicles(playerId, token);
vehicles.forEach((vehicle: { id: string, type: string, coords: [number, number], dest: [number, number] | null }) => {
if (vehicle.coords) {
// Plot vehicle on map (e.g., Leaflet or Mapbox)
console.log(`Rendering ${vehicle.type} (ID: ${vehicle.id}) at coords: ${vehicle.coords}`);
// Example: map.addMarker(vehicle.coords, { icon: 'player-vehicle', label: vehicle.type });
}
if (vehicle.dest) {
// Plot destination marker or route
console.log(`Destination for ${vehicle.id}: ${vehicle.dest}`);
}
});
};

Notes:
Use coords ([lat, lng]) for vehicle position on the map.
Use dest ([lat, lng], if not null) for destination markers or routes.
Cache response in service worker for PWA offline support:// src/service-worker.ts
self.addEventListener('fetch', (event) => {
if (event.request.url.includes('/api/vehicles/')) {
event.respondWith(
caches.match(event.request).then((cachedResponse) => {
return cachedResponse || fetch(event.request).then((response) => {
caches.open('cybertaxi-cache').then((cache) => {
cache.put(event.request, response.clone());
});
return response;
});
})
);
}
});

2. Fetch Other Players’ Vehicles (GET /api/vehicles/others)

Purpose: Display other players’ vehicles on the map for multiplayer visibility.
Endpoint: GET http://localhost:3000/api/vehicles/others
Headers:
Authorization: Bearer <jwt_token> (from /api/auth/login/username).

Parameters:
status (optional query): Filter by active or inactive (e.g., ?status=active).

Response: Array of vehicles with coords and dest for map plotting.
Implementation:// src/services/MapService.ts
export const fetchOtherVehicles = async (token: string) => {
try {
const response = await axios.get(`${API_BASE_URL}/vehicles/others`, {
headers: { Authorization: `Bearer ${token}` },
params: { status: 'active' }, // Optional: filter active vehicles
});
return response.data.vehicles; // Array of vehicles
} catch (error) {
console.error('Failed to fetch other vehicles:', error.response?.data || error.message);
throw error;
}
};

// Usage in TeslaPage.tsx
const renderOtherVehicles = async () => {
const token = localStorage.getItem('jwt_token'); // From login
const vehicles = await fetchOtherVehicles(token);
vehicles.forEach((vehicle: { id: string, type: string, coords: [number, number], dest: [number, number] | null }) => {
if (vehicle.coords) {
// Plot vehicle on map with distinct style
console.log(`Rendering other player's ${vehicle.type} (ID: ${vehicle.id}) at coords: ${vehicle.coords}`);
// Example: map.addMarker(vehicle.coords, { icon: 'other-vehicle', label: vehicle.type });
}
if (vehicle.dest) {
// Plot destination marker or route
console.log(`Destination for ${vehicle.id}: ${vehicle.dest}`);
}
});
};

Notes:
Use coords for vehicle position, styled differently from player vehicles (e.g., different icon/color).
Cache response in service worker for PWA offline support (same as above).

3. Additional Notes

Authentication: Get JWT from /api/auth/login/username (e.g., POST /api/auth/login/username with {"username":"Kevin-Dean","password":"newpass123"}).
Error Handling: Handle 403 (unauthorized), 404 (player not found), and 500 (server error) in MapService.ts.
Testing: Test with player_id: 1 and status=active to ensure vehicles render correctly.
PWA: Cache responses for offline map rendering. Use coords and dest to plot vehicles and routes in TeslaPage.tsx.

Database Debugging

If vehicles don’t appear, verify vehicles table:mysql -u <user> -p -e "SELECT id, player_id, type, status, cost, lat, lng, dest_lat, dest_lng FROM vehicles WHERE id LIKE 'CT-%'" cybertaxi_db

Check schema: Ensure vehicles.id is VARCHAR(10) (e.g., CT-001), not numeric.
If id is numeric (e.g., 1), update DB schema or adjust POST /api/vehicles to use numeric IDs.

Team Notes

Frontend: Implement fetchPlayerVehicles and fetchOtherVehicles in src/services/MapService.ts. Test rendering with coords and dest in TeslaPage.tsx. Cache responses for PWA offline sync.
Testing: Test endpoints with valid/invalid inputs. Example:Invoke-WebRequest -Uri http://localhost:3000/api/vehicles/1 -Method GET -Headers @{"Authorization"="Bearer <valid_jwt>"}
Invoke-WebRequest -Uri http://localhost:3000/api/vehicles/others -Method GET -Headers @{"Authorization"="Bearer <valid_jwt>"}

Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
