CyberTaxi Auth Components
Version: 0.1.0 Last Updated: August 18, 2025
Overview
This directory contains React components for authentication-related UI in the CyberTaxi frontend. Aligns with GDD v1.1 (July 24, 2025) for PWA compatibility and cyberpunk styling.
Files

None currently: Placeholder for future auth-specific components (e.g., password reset form).

Dependencies

react: For component rendering and state management.
../../services/LoginService.ts: For authentication API calls (if components are added).
../../styles/ui/\*: Styles for auth components (to be defined).

Gotchas

Ensure jwt_token and username are in localStorage for auth flows.
Styles should use Orbitron font and cyberpunk colors (#d4a017, #e8b923, #ff4d4f).

Team Notes

Frontend: Plan for auth-specific components (e.g., reset password UI) post-refactor.
Testing: Test auth flows with LoginService when components are added.
Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
