// src/utils/errorhandling/errorHandler.ts
/**
 * @file errorHandler.ts
 * @description Error handling utility for CyberTaxi, processing errors and updating UI state.
 * @author Kevin-Dean Livingstone & CyberTaxi Team
 * @version 0.1.1
 * @note Mirrors backend error handling, converting unknown errors to CyberError instances; tested with CyberMain.tsx.
 */
import { CyberError } from "./CyberError";

/**
 * Handles errors and updates the application state with an error message.
 * @param {unknown} err - The error to process, which can be any type.
 * @param {(msg: string) => void} setError - Callback to set the error message in the UI state.
 * @returns {CyberError} The processed CyberError instance for further use.
 * @example handleError(new CyberError("Invalid input", 400), setErrorMessage); // Verified in test.
 */
export const handleError = (
    err: unknown,
    setError: (msg: string) => void
): CyberError => {
    const error =
        err instanceof CyberError ? err : new CyberError(String(err), 500);
    console.error(`Handled Error [${error.status}]: ${error.message}`); // Confirmed logging in CyberMain test.
    setError(error.message);
    return error;
};
