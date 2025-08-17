Auth Routes
Version: 0.4.1Last Updated: August 17, 2025
Overview
Handles authentication for CyberTaxi, including player signup, login, and password reset. Uses JWT for secure authentication and bcrypt for password hashing.
Endpoints

POST /api/auth/signup: Register a new player with username, email, and password.
POST /api/auth/login: Login with player_id and password, returns JWT.
POST /api/auth/login/username: Login with username and password, returns JWT and player_id.
POST /api/auth/reset-password: Reset password for authenticated player.

Dependencies

express: Routing framework.
jsonwebtoken: JWT authentication (via authMiddleware.js).
bcrypt: Password hashing.
../../../models/db.js: MySQL connection pool (mysql2/promise).
../../../middleware/authMiddleware.js: JWT verification and token generation.
../../../config.js: API_BASE_URL.

Gotchas

Ensure MySQL server is running with correct credentials.
JWT_SECRET environment variable must be set.
players table must exist in the database.
Passwords are hashed with bcrypt (10 rounds).

Team Notes

Frontend uses src/services/LoginService.ts to call auth endpoints.
Responses are PWA-friendly for offline sync support.
Align with Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
