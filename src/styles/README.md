CyberTaxi Styles
Version: 0.1.0 Last Updated: August 18, 2025
Overview
This directory contains global and UI-specific styles for the CyberTaxi frontend, defining the cyberpunk aesthetic. Aligns with GDD v1.1 (July 24, 2025) for PWA compatibility.
Files

CyberGlobal.css: Global stylesheet for layout and theme.
ui/: Directory for component-specific styles (baseWindow.css, LoginForm.css, PopupMenu.css).

Dependencies

None, but uses Orbitron font via CDN or local import.

Gotchas

Ensure Orbitron font is loaded for consistent styling.
Use cyberpunk colors (#d4a017, #e8b923, #ff4d4f) across components.
Styles optimized for responsive design (media queries for max-width: 768px).

Team Notes

Frontend: Import styles in components (CyberMain.tsx, LoginForm.tsx, TaxiMenu.tsx).
Testing: Verify responsive design and color consistency.
Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
