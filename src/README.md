CyberTaxi Frontend
Version: 0.3.9Last Updated: August 20, 2025
Overview
CyberTaxi is a web-based game where players manage a fleet of autonomous taxis in a cyberpunk city. Built with React, TypeScript, Vite, and Leaflet, it offers real-time map rendering, vehicle management, and a dynamic UI. Aligned with GDD v1.1 for PWA compatibility and accessibility.
Features

Manage autonomous taxi fleet with status-based vehicle markers.
Real-time Leaflet map centered on Austin, TX with cyberpunk styling.
Dynamic UI with login, stats, and About window.
PWA-ready with offline support via service workers.
Handles vehicle fetch errors with user-friendly messages.

Setup

Clone the repo: git clone https://github.com/KdeanGames-Code/CyberTaxi.git
Navigate to project: cd CyberTaxi
Install dependencies: npm install
Start backend server: npm start in server/
Start frontend: npm run dev -- --force
Open http://localhost:5173/ in your browser.

Usage

Log in with username: "Kevin-Dean", password: "test123".
Use the taxi icon in MenuBar to access the menu (login, logout, register).
View player vehicles on the map with status-based styles or error message on fetch failure.
Click the help button to open the About window.

Components

index.html (@version 0.2.1): Entry point with #app and #about-portal divs.
CyberMain.tsx (@version 0.2.26): Main component with MenuBar, MapArea, BottomMenu, TaxiMenu, AboutPortal, LoginForm.

Dependencies

react: Component rendering and state management.
react-dom: Rendering React components and portals.
leaflet: Map rendering in MapArea.
leaflet.markercluster: Vehicle clustering.
font-awesome: Icons via /assets/font-awesome/css/all.min.css.
google-fonts: Roboto and Orbitron fonts via CDN.

Gotchas

Ensure #app and #about-portal divs exist in index.html.
Run npm start in server/ and npm run dev -- --force to avoid 500 errors.
MenuBar fetches stats via PlayerService after jwt_token and username are set.
LoginForm sizes: 250px width, 270px height (login), 330px (register/reset).
MapArea uses /api/tiles/dark/{z}/{x}/{y}.png, zooms to Austin (lat: 30.2672, lng: -97.7431, zoom: 12) on login, no zoom controls.
usePlayerVehicles fetches from /api/player/:username/vehicles, maps statuses: active, fare → .active-marker (#d4a017); parked, maintenance, cleaning → .parked-marker (#ff0000, #8b0000 border); new → .new-marker (#ffffff, #808080 border); logged out → .vehicle-marker-others (#4b0082).
Old src/components/map files are deprecated; use src/components/mapping.
Handles 404 errors on /api/player/:username/vehicles with user-friendly message.
Ensure leaflet.markercluster is installed to avoid L.markerClusterGroup is not a function.

Testing

Verify login/logout, stats updates ($250,000/0 after login, $50,000/1000 after logout), and About window toggle.
Check map rendering, player vehicle markers (or error message on 404), login zoom, and no zoom controls.
Run npx tsc --noEmit to check TypeScript errors.

Team Notes

Frontend: Use CyberMain.tsx as the entry point, ensure index.html setup.
Backend: Implement /api/player/:username/vehicles endpoint in VehicleRoutes.
Alignment: Follows Code Complete Chapters 5 (design), 7 (defensive programming), 10 (collaboration), 20 (testing).

Credits

Lead Developer: Kevin-Dean Livingstone
Team: CyberTaxi Team, Grok (created by xAI)
