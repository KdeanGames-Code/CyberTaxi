CyberTaxi Tiles Routes
Version: 0.1.10 Last Updated: August 19, 2025
Overview
This directory contains the Express route handler for map tile and font serving in the CyberTaxi backend. The tiles.js file, located in server/routes/tiles/, manages API endpoints for proxying map tile requests to TileServer GL and serving font glyph PBF files, aligning with GDD Version 1.1 (July 24, 2025).
File

tiles.js (@version 0.2.7): Located in server/routes/tiles/, handles tile and font endpoints (/api/tiles/:style/:z/:x/:y.:format, /api/tiles/:style/512/:z/:x/:y.:format, /api/fonts/:fontstack/:range.pbf).

Endpoints

GET /api/tiles/:style/:z/:x/:y.:format | /api/tiles/:style/512/:z/:x/:y.:format
Description: Proxies map tile requests to TileServer GL, using dark style for map visibility. Supports optional /512/ resolution.
Parameters:
style: Map style (dark preferred, basic supported).
z: Zoom level (number, e.g., 10, 12).
x: X coordinate (number, e.g., 233, 933).
y: Y coordinate (number, e.g., 421, 1685).
format: Tile format (e.g., png).

Response: Tile image buffer (200) or error (404, 500).

GET /api/fonts/:fontstack/:range.pbf
Description: Serves font glyph PBF files for map styles.
Parameters:
fontstack: Font stack name (e.g., Open Sans Regular).
range: Glyph range (e.g., 0-255, 8192-8447).

Response: PBF file buffer (200) or error (400, 404, 500).

Dependencies

express: Routing framework.
path: File path utilities.
fs.promises: File system utilities for checking font existence.
http-proxy-middleware: Proxy for TileServer GL requests.
../../config.js: Provides TILE_SERVER_URL for proxy target and CORS_ORIGINS for CORS headers.

Gotchas

TileServer GL: Must be running on config.TILE_SERVER_URL (default: http://localhost:8080), started via app.js. Check logs for TileServer GL failed to start or TileServer GL exited.
Font Path: Fonts in server/fonts/<fontstack>/<range>.pbf. Path in tiles.js is ../../fonts relative to server/routes/tiles/. Includes 0-255.pbf, 8192-8447.pbf.
Font Range Validation: Range must be start-end (e.g., 0-255). Invalid ranges return 400.
CORS: Uses config.CORS_ORIGINS (default: http://localhost:5173) for Vite compatibility.
Path Rewrite: Maps /api/tiles/:style/:z/:x/:y.:format or /api/tiles/:style/512/:z/:x/:y.:format to /styles/:style/[512/]z/x/y.format, preserving optional /512/ for TileServer GL.
MBTiles: Uses server/tiles/osm-2020-02-10-v3.11_texas_austin.mbtiles.
Server Restart: Restart server (npm start) after updating tiles.js, app.js, or config.json.
PWA: Binary data for map rendering, suitable for caching in service workers.
Debugging TileServer GL Issues:
Verify TileServer GL: curl http://localhost:8080.
Check server/tiles/osm-2020-02-10-v3.11_texas_austin.mbtiles for tile data.
Verify server/fonts/Open Sans Regular/<range>.pbf (e.g., 0-255.pbf, 8192-8447.pbf).
Check server/config.json for styles.dark and fonts.Open Sans Regular.
Review logs for Tile proxy error or Font serving failed.

Team Notes

Frontend: Use in map rendering (e.g., TeslaPage.tsx) via MapService.ts (pending). Cache tiles/fonts for PWA. Test /api/tiles/dark/10/233/421.png and /api/tiles/dark/512/12/933/1685.png for road names (e.g., "6th St") and POIs (e.g., "Downtown Austin").
Testing: Test with valid/invalid style, z, x, y, format, and fontstack/range. Example:Invoke-WebRequest -Uri http://localhost:3000/api/tiles/dark/10/233/421.png -Method GET
Invoke-WebRequest -Uri http://localhost:3000/api/tiles/dark/512/12/933/1685.png -Method GET
Invoke-WebRequest -Uri http://localhost:3000/api/fonts/Open%20Sans%20Regular/0-255.pbf -Method GET
Invoke-WebRequest -Uri http://localhost:3000/api/fonts/Open%20Sans%20Regular/8192-8447.pbf -Method GET

Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
