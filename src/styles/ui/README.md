CyberTaxi UI Styles
Version: 0.1.0 Last Updated: August 18, 2025
Overview
This directory contains component-specific styles for the CyberTaxi frontend, defining cyberpunk-themed UI elements. Aligns with GDD v1.1 (July 24, 2025) for PWA compatibility.
Files

baseWindow.css (@version 0.1.3): Styles for baseWindow component (draggable/resizable windows).
LoginForm.css (@version 0.2.4): Styles for LoginForm component (login/register form).
PopupMenu.css (@version 0.1.3): Styles for TaxiMenu component with 3D sunken look and sub-menu alignment.

Dependencies

None, but uses Orbitron font via CDN or local import.

Gotchas

Ensure Orbitron font is loaded for consistent styling.
Use cyberpunk colors (#d4a017, #e8b923, #ff4d4f) across components.
PopupMenu.css sub-menu aligns at top: 40px (responsive: 30px) with min-width: 150px.

Team Notes

Frontend: Import styles in LoginForm.tsx, TaxiMenu.tsx, baseWindow.tsx.
Testing: Verify sub-menu positioning, 3D styling, and responsive design.
Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
