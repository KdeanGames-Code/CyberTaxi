CyberTaxi Backend
Purpose
The backend for CyberTaxi, built with Node.js, Express, and MySQL, manages player authentication, vehicle operations, garage management, map tiles, and system health checks. Supports the PWA frontend with secure, scalable APIs.
Dependencies

express: Web framework for routing and middleware.
jsonwebtoken: JWT authentication.
bcrypt: Password hashing.
mysql2: MySQL connection pool.
http-proxy-middleware: Proxy for TileServer GL.
Environment variables: JWT_SECRET, API_BASE_URL, TILE_SERVER_URL, CORS_ORIGINS.

Gotchas

Ensure MySQL server is running before starting the backend (npm start).
Set JWT_SECRET in environment variables for authentication.
TileServer GL must be running on TILE_SERVER_URL (default: http://localhost:8080).

Team Notes

Frontend uses src/services/LoginService.ts for auth calls, relying on API_CONFIG.BASE_URL.
Run Get-ChildItem -Recurse in PowerShell to list files/directories.
Clear Vite cache (npm run dev -- --force) if frontend issues persist.
See docs/api.md for API details.
Align with Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
