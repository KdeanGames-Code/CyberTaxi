CyberTaxi Tiles Routes
Version: 0.1.3 Last Updated: August 19, 2025
Overview
This directory contains the Express route handler for map tile and font serving in the CyberTaxi backend. The tiles.js file manages API endpoints for proxying map tile requests to TileServer GL and serving font glyph PBF files, aligning with GDD Version 1.1 (July 24, 2025).
File

tiles.js (@version 0.2.2): Handles tile and font endpoints (/api/tiles/:style/:z/:x/:y.:format, /api/fonts/:fontstack/:range.pbf).

Endpoints

GET /api/tiles/:style/:z/:x/:y.:format
Description: Proxies map tile requests to TileServer GL.
Parameters:
style: Map style (e.g., basic, dark).
z: Zoom level (number).
x: X coordinate (number).
y: Y coordinate (number).
format: Tile format (e.g., png).

Response: Tile image buffer (200) or error (404, 500).

GET /api/fonts/:fontstack/:range.pbf
Description: Serves font glyph PBF files for map styles.
Parameters:
fontstack: Font stack name (e.g., Open Sans Regular).
range: Glyph range (e.g., 0-255).

Response: PBF file buffer (200) or error (404, 500).

Dependencies

express: Routing framework.
path: File path utilities.
http-proxy-middleware: Proxy for TileServer GL requests.
../../config.js: Provides TILE_SERVER_URL for proxy target and CORS_ORIGINS for CORS headers.

Gotchas

TileServer GL: Must be running on the port specified in config.TILE_SERVER_URL (default: http://localhost:8080), started via app.js.
Font Path: Fonts must exist in server/fonts/<fontstack>/<range>.pbf.
CORS: Endpoints use config.CORS_ORIGINS (default: http://localhost:5173) for frontend compatibility.
Server Restart: After updating tiles.js, app.js, or config.js, restart the server (npm start) to ensure routes and config are loaded.
PWA: Endpoints return binary data for map rendering, suitable for caching in service workers.

Team Notes

Frontend: Use in map rendering components (e.g., TeslaPage.tsx) via MapService.ts (pending). Cache tiles/fonts for offline PWA support.
Testing: Test with valid/invalid style, z, x, y, format, and fontstack/range. Example:Invoke-WebRequest -Uri http://localhost:3000/api/tiles/basic/0/0/0.png -Method GET
Invoke-WebRequest -Uri http://localhost:3000/api/fonts/Open%20Sans%20Regular/0-255.pbf -Method GET

Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
