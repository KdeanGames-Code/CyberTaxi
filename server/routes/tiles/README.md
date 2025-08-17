Tiles Routes
Version: 0.1.1Last Updated: August 17, 2025
Overview
Serves map tiles and font glyph PBF files for CyberTaxi’s map integration with TileServer GL and Leaflet.
Endpoints

GET /api/fonts/:fontstack/:range.pbf: Serve font glyph PBF files.
GET /api/tiles/:style/:z/:x/:y.:format: Proxy map tile requests to TileServer GL.

Dependencies

express: Routing framework.
http-proxy-middleware: Proxy for TileServer GL.
../../../config.js: TILE_SERVER_URL and CORS_ORIGINS.

Gotchas

Ensure TileServer GL is running on TILE_SERVER_URL (default: http://localhost:8080).
Font files must exist in server/fonts/.
CORS_ORIGINS environment variable must be set for frontend access.

Team Notes

Frontend uses src/components/Map.tsx (pending) to render tiles via Leaflet.
Responses are PWA-friendly for offline sync support.
Align with Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
