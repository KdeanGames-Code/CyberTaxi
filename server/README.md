CyberTaxi Backend
Version: 0.1.0Last Updated: August 17, 2025
Overview
The CyberTaxi backend, built with Node.js, Express, and MySQL, powers the game's core functionality, including player authentication, vehicle management, garage operations, map tiles, and system health checks. It provides secure, scalable RESTful APIs for the React-based PWA frontend, supporting real-time fleet management in a cyberpunk city.
Features

Secure player authentication with JWT and bcrypt.
Vehicle management (purchase, retrieval) via MySQL database.
Garage and lot management for vehicle storage.
Map tile and font serving via TileServer GL.
System health checks for database, JWT, and connection pool.
PWA-friendly APIs with offline sync support.

Installation

Navigate to the server folder: cd CyberTaxi/Game/server
Install dependencies: npm install
Set up MySQL database:
Create cybertaxi_db database.
Configure credentials in environment variables (see .env.example).

Set environment variables:
JWT_SECRET: Secret for JWT signing.
API_BASE_URL: Backend URL (default: http://localhost:3000).
TILE_SERVER_URL: TileServer GL URL (default: http://localhost:8080).
CORS_ORIGINS: Frontend URL (default: http://localhost:5173).

Start the backend server: npm start
Ensure TileServer GL is running on port 8080.

Usage

Test health endpoints: GET http://localhost:3000/api/health, GET http://localhost:3000/api/system-health.
Authenticate via POST /api/auth/login/username (use username: "Kevin-Dean", password: "test123").
Access player, vehicle, and garage endpoints with JWT.

Development

Backend: Node.js 20.x, Express 4.x, MySQL 8.x.
Database: MySQL with mysql2/promise for async queries.
Dependencies: jsonwebtoken, bcrypt, http-proxy-middleware, dotenv.
Tools: PowerShell for testing (Invoke-WebRequest), Git for version control.

Contributing

Fork the repo and submit PRs to https://github.com/<username>/CyberTaxi.
Contact Kevin-Dean Livingstone for collaboration.

Credits

Lead Developer: Kevin-Dean Livingstone
Team: CyberTaxi Team, Grok (created by xAI)
Inspired by: xAI’s Grok and cyberpunk aesthetics.

License
MIT License - TBD
Gotchas

Ensure MySQL server is running before starting the backend (npm start).
Set JWT_SECRET in environment variables for authentication.
TileServer GL must be running on TILE_SERVER_URL (default: http://localhost:8080).
Run Get-ChildItem -Recurse in PowerShell to list files/directories.
See docs/api.md for API details.
Align with Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
