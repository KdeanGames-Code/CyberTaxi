CyberTaxi UI Windows
Version: 0.2.1Last Updated: August 18, 2025
Overview
This directory contains React components for window-based UI elements in the CyberTaxi frontend, providing modal dialogs and forms. Aligns with GDD v1.1 (July 24, 2025) for PWA compatibility and cyberpunk styling.
Files

baseWindow.tsx (@version 0.1.3): Base component for draggable/resizable windows, used by other window components.
LoginForm.tsx (@version 0.2.37): Form for login and registration, interacting with LoginService for API calls.

Dependencies

react: For component rendering and state management.
../../services/LoginService.ts: For authentication API calls in LoginForm.
../../styles/ui/baseWindow.css: Styles for baseWindow.
../../styles/ui/LoginForm.css: Styles for LoginForm.

Gotchas

Ensure jwt*token and username are in localStorage for LoginForm state persistence.
Validate email with regex ([a-z0-9.*%+-]+@[a-z0-9.-]+\.[a-z]{2,}) in LoginForm.
Styles use Orbitron font and cyberpunk colors (#d4a017, #e8b923, #ff4d4f).

Team Notes

Frontend: Use LoginForm in CyberMain.tsx for auth flows, baseWindow for modal dialogs.
Testing: Test login, signup, and menu state transitions.
Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
