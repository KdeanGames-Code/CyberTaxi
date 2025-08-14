// src/utils/errorhandling/CyberError.ts
/**
 * @file CyberError.ts
 * @description Custom error class for CyberTaxi, providing structured error handling with status codes.
 * @author Kevin-Dean Livingstone & CyberTaxi Team
 * @version 0.1.2
 * @note Extends native Error to include a status property for HTTP-like error codes; adds log method for debugging.
 */
export class CyberError extends Error {
    status: number;

    /**
     * Constructs a new CyberError instance.
     * @param {string} message - The error message describing the issue.
     * @param {number} [status=500] - The HTTP status code (e.g., 400 for client errors, 500 for server issues).
     * @throws {Error} If message is invalid or empty (future enhancement).
     */
    constructor(message: string, status: number = 500) {
        super(message);
        this.name = "CyberError";
        this.status = status;
        this.log(); // Log on creation
    }

    /**
     * Logs the error to the console.
     */
    log(): void {
        console.error(`CyberError [${this.status}]: ${this.message}`);
    }
}