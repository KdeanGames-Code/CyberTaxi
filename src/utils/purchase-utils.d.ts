/**
 * purchase-utils.d.ts - TypeScript declarations for purchase-utils.js.
 * Defines types for vehicle purchase functionality used in CyberBrowser.
 * @module purchase-utils
 */
/**
 * Result of a vehicle purchase operation.
 * @interface PurchaseResult
 */
interface PurchaseResult {
    success: boolean;
    message: string;
    bank_balance?: number;
    fleet?: Array<{ id: string; type: string; purchase_date: string }>;
    canPurchase?: boolean; // New field for UI control
}
/**
 * Handles vehicle purchase by deducting cost from bank balance and updating fleet in localStorage.
 * @param playerId - Unique player identifier.
 * @param vehicleType - Vehicle type (e.g., 'Model Y', 'RoboCab').
 * @returns Purchase result with success status, message, canPurchase flag, and updated balance/fleet.
 */
declare function purchaseVehicle(
    playerId: string,
    vehicleType: string
): PurchaseResult;
export { purchaseVehicle };
