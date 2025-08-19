CyberTaxi UI Windows
Version: 0.2.23 Last Updated: August 19, 2025
Overview
This directory contains React components for window-based UI elements in the CyberTaxi frontend, providing modal dialogs and forms. Aligns with GDD v1.1 (July 24, 2025) for PWA compatibility and cyberpunk styling.
Files

baseWindow.tsx (@version 0.1.6): Base component for draggable/resizable windows, used by other window components.
LoginForm.tsx (@version 0.2.38): Form for login, registration, and password reset, interacting with LoginService for API calls. Buttons styled with stacked text and width set to 200px with dynamic height.
AboutWindow.tsx (@version 0.2.6): About window displaying game credits, rendered via AboutPortal, triggered by MenuBar help button, using BaseWindow.
AboutPortal.tsx (@version 0.3.10): Portal for rendering AboutWindow below top menu, toggled globally via MenuBar.

Dependencies

react: For component rendering and state management.
react-dom: For portal rendering in AboutPortal.
../../services/LoginService.ts: For authentication API calls in LoginForm.
../../styles/ui/baseWindow.css: Styles for baseWindow.
../../styles/ui/LoginForm.css: Styles for LoginForm with stacked button layout and dynamic sizing (200px width, 270px login, 330px register/reset).
../../styles/ui/About.css: Styles for AboutWindow with cyberpunk-themed content.

Gotchas

Ensure jwt*token and username are in localStorage for LoginForm state persistence.
Validate email with regex ([a-z0-9.*%+-]+@[a-z0-9.-]+\.[a-z]{2,}) in LoginForm.
AboutWindow uses BaseWindow with fixed sizing (300px width, 290px height set by AboutPortal).
Ensure #about-portal div exists in index.html and AboutPortal is mounted in CyberMain.tsx for toggleAboutWindow.
AboutPortal uses named import { AboutWindow } from AboutWindow.tsx.
AboutWindow uses type-only import type { BaseWindowProps } for verbatimModuleSyntax.

Team Notes

Frontend: Use LoginForm and AboutPortal in CyberMain.tsx for auth and info displays, baseWindow for modal dialogs.
Testing: Test login, signup, reset modes, button styling, AboutPortal toggle, and dynamic form sizing.
Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
