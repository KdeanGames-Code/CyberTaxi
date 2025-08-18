CyberTaxi Services
Version: 0.1.1 Last Updated: August 18, 2025
Overview
This directory contains service classes for handling API calls in the CyberTaxi frontend, isolating business logic from UI components. Aligns with GDD v1.1 (July 24, 2025) for PWA compatibility.
Files

LoginService.ts (@version 0.1.7): Handles authentication endpoints (/api/auth/login/username, /api/auth/signup).

Dependencies

../config/apiConfig.ts: Provides API_CONFIG.BASE_URL for dynamic endpoints.
react: For async API calls in TypeScript.

Gotchas

Ensure jwt_token and username are in localStorage for authenticated calls.
Run server (npm start in server/) and DB to avoid 500 errors.
Responses are cached for offline sync via service workers.

Team Notes

Frontend: Use LoginService in LoginForm.tsx for auth.
Testing: Test with valid/invalid credentials and server downtime.
Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
