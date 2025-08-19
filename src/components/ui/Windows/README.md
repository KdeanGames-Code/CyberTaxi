CyberTaxi UI Windows
Version: 0.2.11Last Updated: August 19, 2025
Overview
This directory contains React components for window-based UI elements in the CyberTaxi frontend, providing modal dialogs and forms. Aligns with GDD v1.1 (July 24, 2025) for PWA compatibility and cyberpunk styling.
Files

baseWindow.tsx (@version 0.1.3): Base component for draggable/resizable windows, used by other window components.
LoginForm.tsx (@version 0.2.38): Form for login, registration, and password reset, interacting with LoginService for API calls. Buttons styled with stacked text and width set to 200px with dynamic height.
About.tsx (@version 0.1.0): About window displaying game information, triggered by MenuBar help button, using BaseWindow.

Dependencies

react: For component rendering and state management.
../../services/LoginService.ts: For authentication API calls in LoginForm.
../../styles/ui/baseWindow.css: Styles for baseWindow.
../../styles/ui/LoginForm.css: Styles for LoginForm with stacked button layout and dynamic sizing (200px width, 270px login, 330px register/reset).
../../styles/ui/About.css: Styles for About with cyberpunk-themed content.

Gotchas

Ensure jwt*token and username are in localStorage for LoginForm state persistence.
Validate email with regex ([a-z0-9.*%+-]+@[a-z0-9.-]+\.[a-z]{2,}) in LoginForm.
About window uses BaseWindow with fixed sizing (300px width, 200px height).

Team Notes

Frontend: Use LoginForm and About in CyberMain.tsx for auth and info displays, baseWindow for modal dialogs.
Testing: Test login, signup, reset modes, button styling, About window toggle, and dynamic form sizing.
Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
