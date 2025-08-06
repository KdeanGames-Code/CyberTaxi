/**
 * @file purchase-utils.js
 * @description Utility functions for vehicle purchase logic in CyberTaxi
 * @author CyberTaxi Game Mechanics Team
 * @version 0.2.2
 * @since 2025-08-03
 */

/**
 * Handles vehicle purchase by deducting cost from bank balance and updating fleet in localStorage.
 * Returns {success: false, message: "X/Y slots remaining", canPurchase: false} when fleet limit is reached.
 * @param {string} playerId - Unique player identifier.
 * @param {string} vehicleType - Vehicle type (e.g., 'Model Y', 'RoboCab').
 * @returns {Object} Result with success status, message, canPurchase flag, and updated balance/fleet.
 */
export function purchaseVehicle(playerId, vehicleType) {
    // Input validation to ensure valid player and vehicle type
    if (!playerId || typeof playerId !== "string") {
        return { success: false, message: "Invalid player ID" };
    }
    if (!vehicleType || typeof vehicleType !== "string") {
        return { success: false, message: "Invalid vehicle type" };
    }

    // Load current state from localStorage for PWA offline support
    const playerKey = `player_${playerId}`;
    let playerData = JSON.parse(localStorage.getItem(playerKey));
    if (!playerData) {
        playerData = { bank_balance: 10000.0, fleet: [], garages: [] }; // GDD starting state
        localStorage.setItem(playerKey, JSON.stringify(playerData)); // Initialize storage
    }

    // Calculate total and available spots from garages/lots
    const mockGarages = playerData.garages || [
        { id: "G-001", spots: 3 }, // Example garage with 3 spots
        { id: "L-001", spots: 2 }, // Example lot with 2 spots
    ];
    const totalSpots = mockGarages.reduce(
        (sum, garage) => sum + garage.spots,
        0
    ); // Sum of all spots
    const availableSpots = totalSpots - playerData.fleet.length; // Calculate remaining spots
    if (availableSpots <= 0) {
        return {
            success: false,
            message: `${totalSpots}/${totalSpots} slots remaining`,
            canPurchase: false,
        };
    }

    // Define vehicle costs based on GDD (RoboCab at $35,000)
    const vehicleCosts = {
        "Model Y": 50000.0,
        RoboCab: 35000.0,
    };
    const cost = vehicleCosts[vehicleType];
    if (!cost) {
        return { success: false, message: "Invalid vehicle type" };
    }

    // Check and update bank balance from playerData
    if (playerData.bank_balance < cost) {
        return { success: false, message: "Insufficient funds" };
    }
    playerData.bank_balance = Number(
        (playerData.bank_balance - cost).toFixed(2)
    ); // Ensure two decimal places
}
