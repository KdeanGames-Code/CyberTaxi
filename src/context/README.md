CyberTaxi Context
Version: 0.1.1 Last Updated: August 18, 2025
Overview
This directory contains React context files for managing global state in the CyberTaxi frontend. Aligns with GDD v1.1 (July 24, 2025) for state consistency.
Files

CyberContext.ts (@version 0.1.11): Provides CyberProvider and useCyber for managing login state (isLoggedIn, username).

Dependencies

react: For context and state management.

Gotchas

Ensure CyberProvider wraps the app in index.tsx for useCyber to work.
Sync jwt_token and username with localStorage for persistence.

Team Notes

Frontend: Use CyberContext in CyberMain.tsx for centralized state (pending refactor).
Testing: Test state persistence and context access.
Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
