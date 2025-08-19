CyberTaxi Frontend
Version: 0.3.4 Last Updated: August 19, 2025
Overview
This directory contains the frontend source code for the CyberTaxi web app, a game about managing a fleet of autonomous taxis in a cyberpunk world. Built with React, TypeScript, and Vite, following GDD v1.1 (July 24, 2025) for PWA compatibility and cyberpunk styling.
Files

index.html (@version 0.2.1): Entry point for the web app, includes #app and #about-portal divs for React rendering and AboutPortal.
CyberMain.tsx (@version 0.2.25): Main React component defining the UI layout with MenuBar, MapArea, BottomMenu, TaxiMenu, AboutPortal, and LoginForm.

Dependencies

react: For component rendering and state management.
react-dom: For rendering React components and portals.
leaflet: For map rendering in MapArea.
font-awesome: For icons (e.g., taxi, question mark) via /assets/font-awesome/css/all.min.css.
google-fonts: For Roboto and Orbitron fonts via CDN.

Gotchas

Ensure #app and #about-portal divs exist in index.html for CyberMain and AboutPortal rendering.
Run npm start in server/ and npm run dev -- --force in the frontend to avoid 500 errors.
MenuBar fetches stats via PlayerService on isLoggedIn change to reflect login/logout.
LoginForm sizes must be 250px width, 270px height for login, 330px for register/reset.
MapArea uses /api/tiles/dark/{z}/{x}/{y}.png with OpenStreetMap fallback, zooms to Austin (lat: 30.2672, lng: -97.7431, zoom: 12) on login.
Old map files in src/components/map are deprecated; use src/components/mapping instead.

Team Notes

Frontend: Use CyberMain.tsx as the main entry point, ensure index.html is configured correctly.
Testing: Test login/logout, stats updates, AboutPortal toggle, map rendering, login zoom, and window sizing.
Alignment: Follows Code Complete Chapters 5 (design), 7 (defensive programming), 10 (collaboration), 20 (testing).
