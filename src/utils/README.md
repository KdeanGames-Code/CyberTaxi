CyberTaxi Utils
Version: 0.1.0 Last Updated: August 18, 2025
Overview
This directory contains utility modules for the CyberTaxi frontend, providing reusable functionality for error handling and UI interactions. Aligns with GDD v1.1 (July 24, 2025).
Files

errorhandling/: Error handling utilities (CyberError.ts, errorHandler.ts).
ui/: UI utilities (e.g., windowUtils.ts for drag/resize logic).

Dependencies

react: For error handling in components.

Gotchas

Ensure CyberError is used for consistent error logging.
Verify windowUtils.ts dependencies for drag/resize functionality.

Team Notes

Frontend: Use CyberError in components (CyberMain.tsx) and services (LoginService).
Testing: Test error logging and UI interactions.
Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
