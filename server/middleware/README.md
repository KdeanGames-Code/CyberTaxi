Middleware Directory
Version: 0.1.0Last Updated: August 17, 2025
Overview
Contains middleware functions for CyberTaxi, handling authentication and other cross-cutting concerns for API routes.
Files

authMiddleware.js: JWT verification and token generation for protected routes.

Dependencies

jsonwebtoken: JWT authentication.
../../config.js: API_BASE_URL (future use).

Gotchas

Ensure JWT_SECRET environment variable is set for token verification.

Team Notes

Used by routes like authRoutes.js, player.js, vehicles.js, and garages.js for authentication.
Align with Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
