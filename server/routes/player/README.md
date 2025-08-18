Player Routes Directory
Version: 0.1.0Last Updated: August 18, 2025
Overview
Contains API route handlers for player management in CyberTaxi, including player details, balance, and parking slot queries.
Files

player.js: Handles player-related endpoints (/player/:player_id, /player/:player_id/balance, /player/:username/balance, /player/:player_id/slots, /player/:username/slots).

Dependencies

express: Routing framework.
../../middleware/authMiddleware.js: JWT verification.
../../models/db.js: MySQL connection pool.
../../utils/query-utils.js: Utility for balance queries.

Gotchas

Ensure players table exists with columns player_id, username, email, bank_balance, score, id.
Routes require JWT authentication via Authorization header.
Ensure JWT_SECRET environment variable is set.

Team Notes

Frontend calls routes via src/services/PlayerService.ts (pending).
Align with Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
