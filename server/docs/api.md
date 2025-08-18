CyberTaxi Backend API Documentation
Version: 0.2.0 Last Updated: August 18, 2025
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

Dependencies

express: Routing framework.
bcrypt: Password hashing.
jsonwebtoken: JWT generation and verification.
mysql2: MySQL database connection pool.
cors: CORS middleware for PWA compatibility.

Gotchas

Ensure JWT_SECRET environment variable is set.
Database players table must exist with required columns.
All endpoints return JSON responses optimized for PWA offline sync.
Use GET /api/health to verify server status before critical requests.

Team Notes

Frontend consumes these endpoints via src/services/LoginService.ts.
Align with Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
