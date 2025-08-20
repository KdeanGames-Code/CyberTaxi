CyberTaxi Backend API Documentation
Version: 0.2.6Last Updated: August 20, 2025
Overview
This document outlines the RESTful API endpoints for the CyberTaxi backend, built with Node.js and Express. All endpoints are designed to be PWA-friendly with lightweight JSON responses and support offline sync via service workers. Authentication uses JWT tokens.
Base URL
http://localhost:3000/api
Authentication Routes
POST /api/auth/signup
Description: Register a new player.

Method: POST
Request Body:{
"username": "string (required, unique)",
"email": "string (required, valid email, unique)",
"password": "string (required)",
"bank_balance": "number (optional, default: 60000.0)"
}

Responses:
201 Created:{
"status": "Success",
"token": "string (JWT)"
}

400 Bad Request:{
"status": "Error",
"message": "Missing username, email, or password",
"details": "All fields are required"
}

409 Conflict:{
"status": "Error",
"message": "Username or email already exists",
"details": "Choose a different username or email"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to register player",
"details": "string"
}

POST /api/auth/login
Description: Authenticate a player by player_id and password, returning a JWT token.

Method: POST
Request Body:{
"player_id": "number (required)",
"password": "string (required)"
}

Responses:
200 OK:{
"status": "Success",
"token": "string (JWT)"
}

400 Bad Request:{
"status": "Error",
"message": "Missing player_id or password",
"details": "Both player_id and password are required"
}

401 Unauthorized:{
"status": "Error",
"message": "Invalid credentials",
"details": "Player not found or password mismatch"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to authenticate",
"details": "string"
}

POST /api/auth/login/username
Description: Authenticate a player by username and password, returning a JWT token and player_id.

Method: POST
Request Body:{
"username": "string (required)",
"password": "string (required)"
}

Responses:
200 OK:{
"status": "Success",
"token": "string (JWT)",
"player_id": "number"
}

400 Bad Request:{
"status": "Error",
"message": "Missing username or password",
"details": "Both username and password are required"
}

401 Unauthorized:{
"status": "Error",
"message": "Invalid credentials",
"details": "Player not found or password mismatch"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to authenticate",
"details": "string"
}

POST /api/auth/reset-password
Description: Reset a player’s password, requiring JWT authentication.

Method: POST
Headers:
Authorization: Bearer <JWT>

Request Body:{
"username": "string (required)",
"new_password": "string (required)"
}

Responses:
200 OK:{
"status": "Success",
"message": "Password updated"
}

400 Bad Request:{
"status": "Error",
"message": "Missing username or new_password",
"details": "Both username and new_password are required"
}

403 Forbidden:{
"status": "Error",
"message": "Unauthorized access",
"details": "Token does not match requested username"
}

404 Not Found:{
"status": "Error",
"message": "Player not found",
"details": "string"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to reset password",
"details": "string"
}

Player Routes
GET /api/player/:player_id
Description: Fetch a player’s details by player_id, requiring JWT authentication.

Method: GET
Headers:
Authorization: Bearer <JWT>

Parameters:
player_id: Player ID (number, required)

Responses:
200 OK:{
"status": "Success",
"player": {
"username": "string",
"email": "string",
"bank_balance": "number",
"score": "number"
}
}

400 Bad Request:{
"status": "Error",
"message": "Invalid player_id format"
}

403 Forbidden:{
"status": "Error",
"message": "Unauthorized access to player data"
}

404 Not Found:{
"status": "Error",
"message": "Player not found"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to fetch player details",
"details": "string"
}

GET /api/player/:username/balance
Description: Fetch a player’s bank balance by username, requiring JWT authentication.

Method: GET
Headers:
Authorization: Bearer <JWT>

Parameters:
username: Player username (string, required)

Responses:
200 OK:{
"status": "Success",
"bank_balance": "number"
}

403 Forbidden:{
"status": "Error",
"message": "Unauthorized access to player data"
}

404 Not Found:{
"status": "Error",
"message": "Player not found"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to fetch balance",
"details": "string"
}

GET /api/player/:username/score
Description: Fetch a player’s score by username, requiring JWT authentication.

Method: GET
Headers:
Authorization: Bearer <JWT>

Parameters:
username: Player username (string, required)

Responses:
200 OK:{
"status": "Success",
"score": "number"
}

403 Forbidden:{
"status": "Error",
"message": "Unauthorized access to player data"
}

404 Not Found:{
"status": "Error",
"message": "Player not found"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to fetch score",
"details": "string"
}

GET /api/player/:username/slots
Description: Fetch a player’s available parking slots by username, requiring JWT authentication.

Method: GET
Headers:
Authorization: Bearer <JWT>

Parameters:
username: Player username (string, required)

Responses:
200 OK:{
"status": "Success",
"total_slots": "number",
"used_slots": "number",
"available_slots": "number"
}

403 Forbidden:{
"status": "Error",
"message": "Unauthorized access to player data"
}

404 Not Found:{
"status": "Error",
"message": "Player not found"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to fetch slots",
"details": "string"
}

GET /api/player/:username/vehicles
Description: Fetch vehicles for a player by username, requiring JWT authentication.

Method: GET
Headers:
Authorization: Bearer <JWT>

Parameters:
username: Player username (string, required)
status (query, optional): Filter by status (active, inactive, maintenance)

Responses:
200 OK:{
"status": "Success",
"vehicles": [
{
"id": "string",
"player_id": "number",
"type": "string",
"status": "string",
"wear": "number",
"battery": "number",
"mileage": "number",
"tire_mileage": "number",
"purchase_date": "string",
"delivery_timestamp": "string|null",
"cost": "number",
"created_at": "string",
"updated_at": "string",
"coords": ["number", "number"]|null,
"dest": ["number", "number"]|null
}
]
}

403 Forbidden:{
"status": "Error",
"message": "Unauthorized access to player data"
}

404 Not Found:{
"status": "Error",
"message": "Player not found"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to fetch vehicles",
"details": "string"
}

Vehicles Routes
GET /api/vehicles/others
Description: Fetch all vehicles except those of the authenticated player, requiring JWT authentication.

Method: GET
Headers:
Authorization: Bearer <JWT>

Parameters:
status (query, optional): Filter by status (active, inactive, maintenance)

Responses:
200 OK:{
"status": "Success",
"vehicles": [
{
"id": "string",
"type": "string",
"status": "string",
"wear": "number",
"battery": "number",
"mileage": "number",
"tire_mileage": "number",
"purchase_date": "string",
"delivery_timestamp": "string|null",
"cost": "number",
"coords": ["number", "number"]|null,
"dest": ["number", "number"]|null
}
]
}

404 Not Found:{
"status": "Error",
"message": "Player not found"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to fetch other vehicles",
"details": "string"
}

POST /api/vehicles/purchase
Description: Purchase a vehicle, deducting cost from player balance, requiring JWT authentication.

Method: POST
Headers:
Authorization: Bearer <JWT>

Request Body:{
"player_id": "number (required)",
"type": "string (required, e.g., 'Model Y', 'Model X', 'Model S', 'Cybertruck')",
"cost": "number (required)",
"status": "string (required, e.g., 'active', 'inactive', 'maintenance')",
"coords": ["number", "number"] (required, [lat, lng])",
"wear": "number (optional, default: 0)",
"battery": "number (optional, default: 100)",
"mileage": "number (optional, default: 0)"
}

Responses:
201 Created:{
"success": true,
"vehicle_id": "string"
}

400 Bad Request:{
"status": "Error",
"message": "Missing required fields | Invalid coords format, must be [lat, lng] | Invalid status, must be active, inactive, or maintenance | Invalid vehicle type, must be Model Y, Model X, Model S, or Cybertruck | Insufficient funds"
}

404 Not Found:{
"status": "Error",
"message": "Player not found"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to purchase vehicle",
"details": "string"
}

POST /api/vehicles
Description: Create a vehicle without balance check, requiring JWT authentication.

Method: POST
Headers:
Authorization: Bearer <JWT>

Request Body:{
"player_id": "number (required)",
"type": "string (required)",
"status": "string (required)",
"cost": "number (required)",
"lat": "number (optional)",
"lng": "number (optional)",
"dest_lat": "number (optional)",
"dest_lng": "number (optional)"
}

Responses:
201 Created:{
"status": "Success",
"vehicle_id": "number"
}

400 Bad Request:{
"status": "Error",
"message": "Missing required fields"
}

404 Not Found:{
"status": "Error",
"message": "Player not found"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to create vehicle",
"details": "string"
}

GET /api/vehicles/:player_id
Description: Fetch vehicles for a player by numeric player_id, requiring JWT authentication.

Method: GET
Headers:
Authorization: Bearer <JWT>

Parameters:
player_id: Player ID (number, required)
status (query, optional): Filter by status (active, inactive, maintenance)

Responses:
200 OK:{
"status": "Success",
"vehicles": [
{
"id": "string",
"player_id": "number",
"type": "string",
"status": "string",
"wear": "number",
"battery": "number",
"mileage": "number",
"tire_mileage": "number",
"purchase_date": "string",
"delivery_timestamp": "string|null",
"cost": "number",
"created_at": "string",
"updated_at": "string",
"coords": ["number", "number"]|null,
"dest": ["number", "number"]|null
}
]
}

400 Bad Request:{
"status": "Error",
"message": "Invalid player_id format, must be numeric | Invalid status, must be active, inactive, or maintenance"
}

403 Forbidden:{
"status": "Error",
"message": "Unauthorized access to player vehicles"
}

404 Not Found:{
"status": "Error",
"message": "Player not found"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to fetch vehicles",
"details": "string"
}

Tiles Routes
GET /api/tiles/:style/:z/:x/:y.:format
Description: Proxy map tile requests to TileServer GL (port 8080).

Method: GET
Parameters:
style: Map style (string, e.g., basic, dark)
z: Zoom level (number)
x: X coordinate (number)
y: Y coordinate (number)
format: Tile format (string, e.g., png)

Responses:
200 OK: Tile image buffer (binary)
404 Not Found:{
"status": "Error",
"message": "Tile not found",
"details": "string"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to proxy tile request",
"details": "string"
}

GET /api/fonts/:fontstack/:range.pbf
Description: Serve font glyph PBF files for map styles.

Method: GET
Parameters:
fontstack: Font stack name (string, e.g., Open Sans Regular)
range: Glyph range (string, e.g., 0-255)

Responses:
200 OK: PBF file buffer (binary)
404 Not Found:{
"status": "Error",
"message": "Font PBF not found",
"details": "string"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to serve font",
"details": "string"
}

Dependencies

express: Routing framework.
bcrypt: Password hashing.
jsonwebtoken: JWT generation and verification.
mysql2: MySQL database connection pool.
cors: CORS middleware for PWA compatibility.
http-proxy-middleware: Proxy for TileServer GL requests.
path: File path utilities for font serving.

Gotchas

Username-Based Routes: Balance, score, slots, and vehicles endpoints (/api/player/:username/\*) use username (VARCHAR(50), UNIQUE) to map to player_id (BIGINT UNSIGNED, UNIQUE) for JWT validation. Use username from /api/auth/login/username response.
Player ID Route: /api/player/:player_id and /api/vehicles/:player_id use numeric player_id (BIGINT UNSIGNED). Ensure player_id matches JWT player_id.
Schema Nuances: vehicles and garages reference players.id, not players.player_id. Username routes handle this mapping internally.
TileServer GL: Must be running on port 8080 for tile proxying.
Font Path: Fonts must exist in server/fonts/<fontstack>/<range>.pbf.
JWT_SECRET: Ensure JWT_SECRET environment variable is set.
Database: players and vehicles tables must exist with required columns.
PWA: Endpoints return lightweight JSON or binary data for offline sync via service workers.
Error Logging: Errors are logged with detailed messages (e.g., Player not found for username: <username>). Check server logs for debugging.

Team Notes

Frontend consumes routes via src/services/LoginService.ts, src/services/PlayerService.ts (pending). Update frontend to use /api/player/:username/_ and /api/vehicles/:player_id. Use /api/tiles/_ and /api/fonts/\* for map rendering in MapService.ts (pending).
Align with Code Complete Chapters 7 (defensive programming, reduce redundancy), 10 (collaboration), 20 (testing).
