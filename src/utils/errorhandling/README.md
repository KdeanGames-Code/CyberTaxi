CyberTaxi Error Handling Utilities
Version: 0.1.1 Last Updated: August 18, 2025
Overview
This directory contains utilities for error handling in the CyberTaxi frontend, ensuring consistent error management. Aligns with GDD v1.1 (July 24, 2025).
Files

CyberError.ts (@version 0.1.2): Custom error class with status codes and logging.
errorHandler.ts (@version 0.1.1): Utility for processing errors and updating UI state.

Dependencies

react: For error handling in components.

Gotchas

Use CyberError for all error logging to ensure consistent output.
errorHandler.ts requires a setError callback for UI updates.

Team Notes

Frontend: Use CyberError in CyberMain.tsx and LoginService.ts for robust error handling.
Testing: Test error logging with various error scenarios.
Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
