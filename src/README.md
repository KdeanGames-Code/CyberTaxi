CyberTaxi Root
Version: 0.2.7Last Updated: August 18, 2025
Overview
CyberTaxi is an immersive web-based game where players manage a fleet of autonomous taxis in a cyberpunk city. Built with React, Vite, and Leaflet, it features real-time vehicle tracking, a dynamic browser UI, and economic management. Aligns with GDD v1.1 (July 24, 2025) for PWA compatibility.
Features

Manage a fleet of autonomous taxis (Model Y, RoboCab).
Real-time map with clustering via Leaflet.
In-game browser for purchasing vehicles and managing assets.
Responsive, accessible UI with PWA support.
Persistent login state via localStorage for TaxiMenu consistency.

Installation

Clone the repo: git clone https://github.com/KdeanGames-Code/CyberTaxi.git
Navigate to the project folder: cd CyberTaxi
Install dependencies: npm install
Start the development server: npm run dev
Start the backend server: cd server && npm start
Open http://localhost:5173/ in your browser.

Usage

Log in with username: "Kevin-Dean", password: "test123" or "newpass123" (after signup).
Use the globe icon to open the TaxiMenu for navigation.
Purchase vehicles and monitor balance/slots.

Development

Frontend: React 19, TypeScript, Vite.
Mapping: Leaflet 1.9.4, Leaflet.MarkerCluster 1.5.3.
Icons: FontAwesome 6.5.1.
PWA: vite-plugin-pwa 1.0.0.

Directory Structure

src/:
CyberMain.tsx (@version 0.2.14): Main entry point, rendering MenuBar, MapArea, BottomMenu, TaxiMenu, and LoginForm. Persists login state.
CyberGlobal.css: Base stylesheet for global layout and cyberpunk theme.
context/: CyberContext.ts for global state management (login status, username).
components/: UI components for controls (MenuBar, TaxiMenu) and windows (LoginForm, baseWindow).
services/: Service classes for API calls (LoginService).
utils/: Utility modules for error handling (CyberError, errorHandler).

Gotchas

Ensure jwt_token in localStorage for persistent login state in CyberMain.tsx.
Run server (npm start in server/) and DB to avoid 500 errors.
Clear Vite cache (npm run dev -- --force) if issues persist.
Styles use Orbitron font and cyberpunk colors (#d4a017, #e8b923).

Team Notes

Frontend: Use CyberMain.tsx as the entry point, integrate with LoginService for auth.
Testing: Test login state persistence, menu toggling, and API calls.
Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).

Contributing

Fork the repo and submit PRs.
Contact [your email] for collaboration.

Credits

Lead Developer: Kevin-Dean Livingstone
Team: CyberTaxi Team
Inspired by: xAI’s Grok and cyberpunk aesthetics.

License
MIT - TBD
