CyberTaxi UI Windows
Version: 0.2.10Last Updated: August 18, 2025
Overview
This directory contains React components for window-based UI elements in the CyberTaxi frontend, providing modal dialogs and forms. Aligns with GDD v1.1 (July 24, 2025) for PWA compatibility and cyberpunk styling.
Files

baseWindow.tsx (@version 0.1.3): Base component for draggable/resizable windows, used by other window components.
LoginForm.tsx (@version 0.2.38): Form for login, registration, and password reset, interacting with LoginService for API calls. Buttons styled with stacked text ("Login"/"Need to Register?", "Register"/"Already have an account?", "Reset Password"/"Back to Login") and width set to 200px with dynamic height.

Dependencies

react: For component rendering and state management.
../../services/LoginService.ts: For authentication API calls in LoginForm.
../../styles/ui/baseWindow.css: Styles for baseWindow.
../../styles/ui/LoginForm.css: Styles for LoginForm with stacked button layout and dynamic sizing (200px width, 270px login, 330px register/reset).

Gotchas

Ensure jwt*token and username are in localStorage for LoginForm state persistence.
Validate email with regex ([a-z0-9.*%+-]+@[a-z0-9.-]+\.[a-z]{2,}) in LoginForm.
LoginForm.css uses width: 200px (responsive: 160px) and min-height: 270px (login), 330px (register/reset) for dynamic sizing.
reset mode uses placeholder logic until LoginService.resetPassword is implemented.

Team Notes

Frontend: Use LoginForm in CyberMain.tsx for auth flows, baseWindow for modal dialogs.
Testing: Test login, signup, reset modes, button styling (stacked, sunken), and dynamic form sizing (200px width, 270px login, 330px register/reset).
Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
