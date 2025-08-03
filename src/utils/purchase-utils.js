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

    // Perform the vehicle purchase
    const vehicleId = `CT-${Date.now()}-${Math.floor(Math.random() * 1000)}`; // Generate unique ID
    playerData.fleet.push({
        id: vehicleId,
        type: vehicleType,
        purchase_date: new Date().toISOString().split("T")[0],
    });

    // Persist updated state to localStorage
    localStorage.setItem(playerKey, JSON.stringify(playerData));

    return {
        success: true,
        message: `Purchased ${vehicleType} (ID: ${vehicleId}) - ${
            availableSpots - 1
        }/${totalSpots} spots remaining`,
        bank_balance: playerData.bank_balance,
        fleet: playerData.fleet,
        canPurchase: true,
    };
}

/**
 * Test function to simulate a single vehicle purchase in the console.
 * @param {string} playerId - Unique player identifier.
 * @param {string} vehicleType - Vehicle type (e.g., 'Model Y', 'RoboCab').
 * @returns {Object} Purchase result for verification.
 */
function testPurchase(playerId, vehicleType) {
    // Reset to a known state with sufficient funds and garage data
    localStorage.setItem(
        `player_${playerId}`,
        JSON.stringify({
            bank_balance: 60000.0,
            fleet: [],
            garages: [
                { id: "G-001", spots: 3 },
                { id: "L-001", spots: 2 },
            ],
        })
    );
    const result = purchaseVehicle(playerId, vehicleType);
    console.log("Purchase Result:", result); // Log the purchase outcome
    const updatedData = JSON.parse(localStorage.getItem(`player_${playerId}`));
    console.log("Updated Data:", updatedData); // Log the updated state
    return result;
}

/**
 * Test function to simulate a purchase attempt with a full fleet.
 * @param {string} playerId - Unique player identifier.
 * @returns {Object} Purchase result to verify fleet limit with new return format.
 */
function testFleetLimit(playerId) {
    // Set up a fleet at the limit (5 spots total)
    const fullFleet = Array(5)
        .fill()
        .map((_, i) => ({
            id: `CT-TEST-${i}`,
            type: "Model Y",
            purchase_date: "2025-08-03",
        }));
    localStorage.setItem(
        `player_${playerId}`,
        JSON.stringify({
            bank_balance: 60000.0,
            fleet: fullFleet,
            garages: [
                { id: "G-001", spots: 3 },
                { id: "L-001", spots: 2 },
            ],
        })
    );

    const result = purchaseVehicle(playerId, "Model Y");
    console.log("Purchase Result with Full Fleet:", result); // Log limit check result
    const updatedData = JSON.parse(localStorage.getItem(`player_${playerId}`));
    console.log("Updated Data After Attempt:", updatedData); // Log final state
    return result;
}

// Execute tests for verification
testPurchase("1", "Model Y");
testFleetLimit("1");
