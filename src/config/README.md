CyberTaxi Config
Version: 0.1.0 Last Updated: August 18, 2025
Overview
This directory contains configuration files for the CyberTaxi frontend, defining constants and settings for API interactions and app behavior. Aligns with GDD v1.1 (July 24, 2025).
Files

apiConfig.ts: Defines API_CONFIG.BASE_URL for API endpoints (e.g., http://localhost:3000).

Dependencies

None.

Gotchas

Ensure API_CONFIG.BASE_URL matches backend server (e.g., http://localhost:3000).
Update for production deployment (e.g., https://api.cybertaxi.com).

Team Notes

Frontend: Use apiConfig.ts in service files (LoginService) for endpoint consistency.
Testing: Verify endpoint URLs with backend team.
Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
