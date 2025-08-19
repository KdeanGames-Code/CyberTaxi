CyberTaxi Mapping Components
Version: 0.1.2 Last Updated: August 19, 2025
Overview
This directory contains React components and utilities for map-related functionality in the CyberTaxi frontend, using Leaflet for map rendering. Aligns with GDD v1.1 (July 24, 2025) for PWA compatibility and cyberpunk styling.
Files

MapArea.tsx (@version 0.1.2): Renders a Leaflet map centered on Austin, TX (lat: 30.2672, lng: -97.7431, zoom: 12) with dark tiles from /api/tiles/dark/{z}/{x}/{y}.png or OpenStreetMap fallback, zooms on login.
mapping-tiles.ts (@version 0.1.2): Provides a Leaflet tile layer with backend tiles and fallback, handling tile errors gracefully.

Dependencies

leaflet: For map rendering and tile layers.
leaflet/dist/leaflet.css: For Leaflet map styling.
../../config/apiConfig.ts: For API_CONFIG.BASE_URL in tile endpoint.
../../styles/mapping/MapArea.css: Styles for MapArea with cyberpunk-themed layout.

Gotchas

Ensure backend server (npm start in server/) is running for /api/tiles/dark/{z}/{x}/{y}.png to avoid fallback to OpenStreetMap.
MapArea uses a fixed center (Austin, TX, lat: 30.2672, lng: -97.7431, zoom: 12); adjust in MapArea.tsx for dynamic behavior (e.g., garage zoom).
MapArea zooms to Austin on isLoggedIn change to match initial load.
mapping-tiles.ts falls back to https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png on tile errors.
Map container uses width: calc(100% - 6px), height: calc(100vh - 80px), top: 47px to fit between MenuBar and BottomMenu.
Ensure leaflet and leaflet/dist/leaflet.css are installed (npm install leaflet).

Team Notes

Frontend: Use MapArea in CyberMain.tsx for map display, pass isLoggedIn for zoom behavior. Backend team provides /api/tiles endpoints.
Testing: Test map rendering, tile loading (custom and fallback), login zoom, and responsive sizing.
Alignment: Follows Code Complete Chapters 5 (design), 7 (defensive programming), 10 (collaboration), 20 (testing).
