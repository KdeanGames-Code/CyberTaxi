CyberTaxi Mapping Components
Version: 0.1.8Last Updated: August 20, 2025
Overview
CyberTaxi’s mapping components power the interactive map, displaying a cyberpunk-themed cityscape with player vehicle markers. Built with Leaflet for real-time rendering, these components align with GDD v1.1 for PWA compatibility and accessibility.
Features

Displays a Leaflet map centered on Austin, TX (lat: 30.2672, lng: -97.7431, zoom: 12).
Renders player vehicle markers with status-based styles (active/fare, parked/maintenance/cleaning, new).
Zooms to Austin on login, no zoom controls for clean UI.
Uses backend tiles with OpenStreetMap fallback.
Handles vehicle fetch errors (e.g., 404) with user-friendly messages.

Components

MapArea.tsx (@version 0.1.5): Renders the Leaflet map with player vehicle markers, centered on Austin, with login zoom and no zoom controls.
mapping-tiles.ts (@version 0.1.2): Creates a tile layer with backend tiles (/api/tiles/dark/{z}/{x}/{y}.png) and OpenStreetMap fallback.
VehicleMarkers.ts (@version 0.3.3): Generates vehicle markers with cyberpunk styles based on status.
usePlayerVehicles.ts (@version 0.1.4): Hook to fetch player vehicles from /api/player/:username/vehicles, maps statuses to marker styles.

Dependencies

leaflet: Map rendering and tile layers.
leaflet.markercluster: Vehicle clustering.
leaflet/dist/leaflet.css: Leaflet map styling.
leaflet.markercluster/dist/MarkerCluster.css: Cluster styling.
../../config/apiConfig.ts: API_CONFIG.BASE_URL for tile and vehicle endpoints.
../../services/PlayerService.ts: Token refresh for vehicle fetch.
../../services/LoginService.ts: Token refresh for vehicle fetch.
../../styles/mapping/MapArea.css: Cyberpunk map layout.
../../styles/mapping/VehicleMarkers.css: Vehicle marker styles.

Setup

Ensure backend server is running: npm start in server/.
Install dependencies: npm install leaflet leaflet.markercluster.
Start frontend: npm run dev -- --force.
Verify jwt_token and username in localStorage for API calls.

Gotchas

Backend server must run for /api/tiles/dark/{z}/{x}/{y}.png and /api/player/:username/vehicles to avoid fallbacks or empty vehicles.
Map centers on Austin (lat: 30.2672, lng: -97.7431, zoom: 12); adjust in MapArea.tsx for HQ garage zoom later.
MapArea zooms on isLoggedIn change, disables zoom controls.
usePlayerVehicles maps statuses: active, fare → .active-marker (#d4a017, making $$); parked, maintenance, cleaning → .parked-marker (#ff0000, #8b0000 border, costing $$); new → .new-marker (#ffffff, #808080 border); logged out → .vehicle-marker-others (#4b0082).
Map uses width: calc(100% - 6px), height: calc(100vh - 80px), top: 47px to fit between MenuBar and BottomMenu.
Old src/components/map files are deprecated; use src/components/mapping.
Handles 404 errors on /api/player/:username/vehicles with user-friendly message.
Ensure leaflet.markercluster is installed to avoid L.markerClusterGroup is not a function.

Testing

Verify map renders with dark tiles, no zoom controls, and zooms to Austin on login.
Check player vehicle markers display with correct styles (.active-marker, .parked-marker, .new-marker, .vehicle-marker-others when logged out) or error message on 404.
Confirm console logs for map init, vehicle fetch, and stats.
Run npx tsc --noEmit to check TypeScript errors.

Team Notes

Frontend: Use MapArea in CyberMain.tsx, pass isLoggedIn for zoom and vehicle fetch.
Backend: Implement /api/player/:username/vehicles endpoint in VehicleRoutes.
Alignment: Follows Code Complete Chapters 5 (design), 7 (defensive programming), 10 (collaboration), 20 (testing).

Credits

Lead Developer: Kevin-Dean Livingstone
Team: CyberTaxi Team, Grok (created by xAI)
