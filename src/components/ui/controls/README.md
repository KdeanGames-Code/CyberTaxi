CyberTaxi UI Controls
Version: 0.2.5 Last Updated: August 18, 2025
Overview
This directory contains React components for UI controls in the CyberTaxi frontend, providing navigation and interaction elements. Aligns with GDD v1.1 (July 24, 2025) for PWA compatibility and cyberpunk styling.
Files

MenuBar.tsx (@version 0.2.4): Renders the top navigation bar with taxi click handler.
TaxiMenu.tsx (@version 0.2.20): Context menu with dynamic items based on login state (Logout, Settings when logged in, Login, Register, Settings when not). Includes Settings sub-menu with "Reset Password" aligned at top of Settings item, shifted 3px right, with 3D sunken styling.

Dependencies

react: For component rendering and state management.
../../styles/ui/PopupMenu.css: Styles for TaxiMenu with 3D sunken look and rounded corners.
../../styles/ui/MenuBar.css: Styles for MenuBar.

Gotchas

Ensure jwt_token and username are in localStorage for TaxiMenu login state.
TaxiMenu uses isLoggedIn prop from CyberMain.tsx; verify state consistency.
Sub-menu (Reset Password) aligns with top of Settings item using top: 0 and left: calc(100% + 3px) (responsive: left: calc(80% + 3px)).
Styles use Orbitron font and cyberpunk colors (#d4a017, #e8b923).

Team Notes

Frontend: Use MenuBar and TaxiMenu in CyberMain.tsx for navigation.
Testing: Test menu item toggling, sub-menu hover/click alignment, login state persistence, and 3D styling.
Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
