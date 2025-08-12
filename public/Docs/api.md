CyberTaxi API Documentation
Overview
The CyberTaxi backend API provides endpoints for managing players, vehicles, garages/lots, and health checks, supporting the CyberTaxi game’s PWA. Built with Node.js, Express, and MySQL, it uses JWT authentication and prepared statements for security. All endpoints return JSON responses and are designed for offline sync compatibility.
Base URL
http://localhost:3000/api
Authentication
Protected endpoints require a JWT token in the Authorization header as Bearer <token>. Obtain tokens via POST /api/auth/signup or POST /api/auth/login.
Endpoints

1. POST /api/auth/signup

Description: Registers a new player in the players table.
Method: POST
Path: /api/auth/signup
Version: 0.1.0
Request Body:{
"username": "string",
"email": "string",
"password": "string",
"bank_balance": "number" (optional, default: 60000.00)
}

Response:
201 Created:{
"status": "Success",
"token": "string"
}

400 Bad Request:{
"status": "Error",
"message": "Missing username, email, or password"
}

409 Conflict:{
"status": "Error",
"message": "Username or email already exists"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to register player",
"details": "string"
}

Authentication: None
Notes: Validates email format, checks for duplicates, hashes password with bcrypt, assigns a unique player_id.

2. POST /api/auth/login

Description: Authenticates a player and returns a JWT token.
Method: POST
Path: /api/auth/login
Version: 0.1.1
Request Body:{
"player_id": "number",
"password": "string"
}

Response:
200 OK:{
"status": "Success",
"token": "string"
}

400 Bad Request:{
"status": "Error",
"message": "Missing player_id or password"
}

401 Unauthorized:{
"status": "Error",
"message": "Invalid credentials"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to authenticate",
"details": "string"
}

Authentication: None
Notes: Uses bcrypt to compare passwords, generates a 1-hour JWT token.

3. GET /api/health

Description: Checks MySQL connectivity.
Method: GET
Path: /api/health
Version: 0.1.0
Response:
200 OK:{
"status": "OK"
}

500 Internal Server Error:{
"status": "Error",
"message": "Database connectivity failed",
"details": "string"
}

Authentication: None
Notes: Executes SELECT 1 AS test to verify database pool.

4. GET /api/player/:player_id

Description: Fetches player details (username, email, bank_balance, score).
Method: GET
Path: /api/player/:player_id
Version: 0.1.0
Response:
200 OK:{
"status": "Success",
"player": {
"username": "string",
"email": "string",
"bank_balance": "number",
"score": "number"
}
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

Authentication: JWT required
Notes: Ensures the authenticated user matches the requested player_id.

5. GET /api/player/:player_id/balance

Description: Fetches a player’s bank balance.
Method: GET
Path: /api/player/:player_id/balance
Version: 0.1.0
Response:
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

Authentication: JWT required
Notes: Uses getUserBalance from query-utils.js.

6. GET /api/player/:player_id/slots

Description: Fetches a player’s total, used, and available parking slots (garages and lots).
Method: GET
Path: /api/player/:player_id/slots
Version: 0.1.1
Response:
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

Authentication: JWT required
Notes: Sums capacity from garages table (includes lots) and counts vehicles in vehicles table.

7. POST /api/vehicles/purchase

Description: Purchases a new vehicle, deducting cost from bank_balance.
Method: POST
Path: /api/vehicles/purchase
Version: 0.1.1
Request Body:{
"player_id": "number",
"type": "string" (Model Y, Model X, Model S, Cybertruck),
"cost": "number",
"status": "string" (active, inactive, maintenance),
"coords": ["number", "number"],
"wear": "number" (optional, default: 0),
"battery": "number" (optional, default: 100),
"mileage": "number" (optional, default: 0)
}

Response:
201 Created:{
"success": true,
"vehicle_id": "string" (e.g., CT-004)
}

400 Bad Request:{
"status": "Error",
"message": "Missing required fields"
}

400 Bad Request:{
"status": "Error",
"message": "Insufficient funds"
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

Authentication: JWT required
Notes: Validates type, status, coords, checks funds, updates bank_balance.

8. GET /api/vehicles/:player_id

Description: Fetches vehicles for a player, optionally filtered by status.
Method: GET
Path: /api/vehicles/:player_id?status=active
Version: 0.1.1
Response:
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

404 Not Found:{
"status": "Error",
"message": "Player not found"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to fetch vehicles",
"details": "string"
}

Authentication: JWT required
Notes: Serializes coords/dest as arrays, clears delivery_timestamp for active vehicles.

9. GET /api/player/:username/vehicles

Description: Fetches vehicles for a player by username, optionally filtered by status.
Method: GET
Path: /api/player/:username/vehicles?status=active
Version: 0.2.0
Response:
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

Authentication: JWT required
Notes: Maps username to player_id, ensures authenticated user matches.

10. GET /api/garages/:player_id

Description: Fetches garages and lots for a player.
Method: GET
Path: /api/garages/:player_id
Version: 0.1.1
Response:
200 OK:{
"status": "Success",
"garages": [
{
"id": "number",
"player_id": "number",
"name": "string",
"coords": ["number", "number"],
"capacity": "number",
"type": "string" (garage, lot),
"cost_monthly": "number"
}
]
}

404 Not Found:{
"status": "Error",
"message": "Player not found"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to fetch garages",
"details": "string"
}

Authentication: JWT required
Notes: Parses JSON coords, supports type=garage (parking, charging, repair, cleaning) and type=lot (parking, charging).

11. GET /api/player/:username/garages

Description: Fetches garages and lots for a player by username.
Method: GET
Path: /api/player/:username/garages
Version: 0.2.0
Response:
200 OK:{
"status": "Success",
"garages": [
{
"id": "number",
"player_id": "number",
"name": "string",
"coords": ["number", "number"],
"capacity": "number",
"type": "string" (garage, lot),
"cost_monthly": "number"
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
"message": "Failed to fetch garages",
"details": "string"
}

Authentication: JWT required
Notes: Maps username to player_id, ensures authenticated user matches.

12. POST /api/garages

Description: Creates a new garage or lot for a player, deducting cost_monthly from bank_balance.
Method: POST
Path: /api/garages
Version: 0.1.1
Request Body:{
"player_id": "number",
"name": "string",
"coords": ["number", "number"],
"capacity": "number",
"type": "string" (garage, lot),
"cost_monthly": "number"
}

Response:
201 Created:{
"status": "Success",
"garage_id": "number"
}

400 Bad Request:{
"status": "Error",
"message": "Missing required fields"
}

400 Bad Request:{
"status": "Error",
"message": "Insufficient funds for monthly cost"
}

404 Not Found:{
"status": "Error",
"message": "Player not found"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to create garage",
"details": "string"
}

Authentication: JWT required
Notes: Validates type, coords, checks funds, updates bank_balance.

Error Handling

All endpoints use a global error handler (utils/error-utils.js) returning:{
"error": "Invalid data|Server error",
"details": "string"
}

Common errors: 400 (invalid input), 401 (no token), 403 (invalid token), 404 (not found), 500 (server error).

Performance Metrics

Query times: ~5-20ms per endpoint.
Connection pool: 10 connections, 1 active, 9 idle, 0 queued.

Notes

All endpoints are PWA-friendly with lightweight JSON responses.
Use http://localhost:3000/api for local testing; prod URL TBD.
JWT tokens expire in 1 hour.
