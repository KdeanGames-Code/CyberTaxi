CyberTaxi UI Utilities
Version: 0.1.0 Last Updated: August 18, 2025
Overview
This directory contains utilities for UI interactions in the CyberTaxi frontend, such as window dragging and resizing. Aligns with GDD v1.1 (July 24, 2025).
Files

windowUtils.ts: Handles drag/resize logic for baseWindow component.

Dependencies

react: For UI event handling.

Gotchas

Ensure windowUtils.ts is imported in baseWindow.tsx for drag/resize functionality.
Test drag/resize with CyberError for robust error logging.

Team Notes

Frontend: Use windowUtils in baseWindow.tsx for window interactions.
Testing: Test drag/resize events and error logging.
Alignment: Follows Code Complete Chapters 7 (defensive programming), 10 (collaboration), 20 (testing).
