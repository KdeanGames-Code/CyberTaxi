CyberTaxi API Documentation
Overview
The CyberTaxi backend API provides endpoints for managing players, vehicles, garages/lots, and health checks, supporting the CyberTaxi game’s PWA. Built with Node.js, Express, and MySQL, it uses JWT authentication and prepared statements for security. All endpoints return JSON responses and are designed for offline sync compatibility.
Base URL
http://localhost:3000/api
Authentication
Protected endpoints require a JWT token in the Authorization header as Bearer <token>. Obtain tokens via POST /api/auth/signup, POST /api/auth/login, or POST /api/auth/login/username.
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
"message": "Missing username, email, or password",
"details": "All fields are required"
}

400 Bad Request:{
"status": "Error",
"message": "Invalid email format",
"details": "Email must be a valid format (e.g., user@domain.com)"
}

409 Conflict:{
"status": "Error",
"message": "Username or email already exists",
"details": "Choose a different username or email"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to register player",
"details": "string (e.g., Database query failed: ... | Password hashing failed: ...)"
}

Authentication: None
Notes: Validates email format, checks for duplicates, hashes password with bcrypt, assigns a unique player_id.

2. POST /api/auth/login

Description: Authenticates a player by player_id and returns a JWT token.
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
"message": "Missing player_id or password",
"details": "Both player_id and password are required"
}

401 Unauthorized:{
"status": "Error",
"message": "Invalid credentials",
"details": "Player not found | Password mismatch"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to authenticate",
"details": "string (e.g., Database connection failed: ... | Bcrypt compare failed: ...)"
}

Authentication: None
Notes: Uses bcrypt to compare passwords, generates a 1-hour JWT token.

3. POST /api/auth/login/username

Description: Authenticates a player by username and returns a JWT token and player_id.
Method: POST
Path: /api/auth/login/username
Version: 0.4.0
Request Body:{
"username": "string",
"password": "string"
}

Response:
200 OK:{
"status": "Success",
"token": "string",
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
"details": "Player not found | Password mismatch"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to authenticate",
"details": "string (e.g., Database connection failed: ... | Bcrypt compare failed: ...)"
}

Authentication: None
Notes: Maps username to player_id, uses bcrypt to compare passwords, generates a 1-hour JWT token.

4. POST /api/auth/reset-password

Description: Resets a player’s password, requiring JWT authentication.
Method: POST
Path: /api/auth/reset-password
Version: 0.4.0
Request Body:{
"username": "string",
"new_password": "string"
}

Request Header:
Authorization: Bearer <token>

Response:
200 OK:{
"status": "Success",
"message": "Password updated"
}

400 Bad Request:{
"status": "Error",
"message": "Missing username or new_password",
"details": "Both username and new_password are required"
}

401 Unauthorized:{
"status": "Error",
"message": "No token provided",
"details": "JWT token required in Authorization header"
}

403 Forbidden:{
"status": "Error",
"message": "Unauthorized access",
"details": "Token does not match requested username"
}

404 Not Found:{
"status": "Error",
"message": "Player not found",
"details": "string (e.g., No player found for username: ...)"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to reset password",
"details": "string (e.g., Database connection failed: ... | Password hashing failed: ...)"
}

Authentication: JWT required
Notes: Updates password_hash for the authenticated player, requires username to match JWT player_id.

5. GET /api/health

Description: Checks MySQL database connectivity.
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

6. GET /api/db-status

Description: Checks database status with vehicle count.
Method: GET
Path: /api/db-status
Version: 0.1.0
Response:
200 OK:{
"status": "Connected",
"message": "DB health check successful",
"vehicle_count": "number"
}

500 Internal Server Error:{
"status": "Failed",
"message": "string (e.g., Database query failed: ...)"
}

Authentication: None
Notes: Returns count of vehicles in the vehicles table.

7. GET /api/player/:player_id

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

8. GET /api/player/:player_id/balance

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

9. GET /api/player/:username/balance

Description: Fetches a player’s bank balance by username.
Method: GET
Path: /api/player/:username/balance
Version: 0.2.0
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
Notes: Maps username to player_id, uses getUserBalance.

10. GET /api/player/:player_id/slots

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
Notes: Sums capacity from garages table (includes lots) and counts vehicles in vehicles table. Confirmed for player_id=2: 35 total slots (2x5, 1x10, 1x15, all type=lot), 1 used slot.

11. GET /api/player/:username/slots

Description: Fetches a player’s total, used, and available parking slots by username.
Method: GET
Path: /api/player/:username/slots
Version: 0.2.0
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
Notes: Maps username to player_id, sums capacity from garages and counts vehicles.

12. POST /api/vehicles/purchase

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
"message": "Missing required fields",
"details": "string (e.g., player_id, type, cost, status, coords required)"
}

400 Bad Request:{
"status": "Error",
"message": "Insufficient funds",
"details": "string (e.g., Balance too low for purchase)"
}

404 Not Found:{
"status": "Error",
"message": "Player not found",
"details": "string (e.g., No player with given ID)"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to purchase vehicle",
"details": "string (e.g., Database query failed: ...)"
}

Authentication: JWT required
Notes: Validates type, status, coords, checks funds, updates bank_balance.

13. GET /api/vehicles/:player_id

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
Notes: Serializes coords/dest as arrays, clears delivery_timestamp for active vehicles. Confirmed for player_id=1: 2 Model Y vehicles.

14. GET /api/player/:username/vehicles

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
Notes: Maps username to player_id, ensures authenticated user matches. Confirmed for username=Kevin-Dean: 2 Model Y vehicles.

15. GET /api/vehicles/others

Description: Fetches all vehicles except those of the authenticated player, optionally filtered by status.
Method: GET
Path: /api/vehicles/others?status=active
Version: 0.3.0
Response:
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

401 Unauthorized:{
"status": "Error",
"message": "No token provided"
}

403 Forbidden:{
"status": "Error",
"message": "Invalid token"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to fetch other vehicles",
"details": "string"
}

Authentication: JWT required
Notes: Excludes player_id for privacy, supports status filter for map display.

16. GET /api/garages/:player_id

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

17. GET /api/player/:username/garages

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
Notes: Maps username to player_id, ensures authenticated user matches. Confirmed for username=Kevin-Dean: 1 garage.

18. POST /api/garages

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
"message": "Missing required fields",
"details": "string (e.g., player_id, name, coords, capacity, type, cost_monthly required)"
}

400 Bad Request:{
"status": "Error",
"message": "Insufficient funds for monthly cost",
"details": "string (e.g., Balance too low for purchase)"
}

404 Not Found:{
"status": "Error",
"message": "Player not found",
"details": "string (e.g., No player with given ID)"
}

500 Internal Server Error:{
"status": "Error",
"message": "Failed to create garage",
"details": "string (e.g., Database query failed: ...)"
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

Query times: ~1-20ms per endpoint (except login with bcrypt: ~60ms).
Connection pool: 10 connections, 1 active, 9 idle, 0 queued.

Notes

All endpoints are PWA-friendly with lightweight JSON responses.
Use http://localhost:3000/api for local testing; prod URL TBD.
JWT tokens expire in 1 hour.
Confirmed data: player_id=2 has bank_balance=$10,000, 4 lots (2x5, 1x10, 1x15, total=35 slots); player_id=1 has 2 Model Y vehicles, 1 garage.
