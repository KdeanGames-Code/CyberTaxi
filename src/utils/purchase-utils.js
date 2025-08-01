// src/utils/purchase-utils.js

/**
 * Handles vehicle purchase by deducting cost from bank balance and updating fleet in localStorage.
 * @param {string} playerId - Unique player identifier.
 * @param {string} vehicleType - Vehicle type (e.g., 'Model Y').
 * @returns {Object} Result with success status, message, and updated balance/fleet.
 */
export function purchaseVehicle(playerId, vehicleType) {
    // Input validation
    if (!playerId || typeof playerId !== "string") {
        return { success: false, message: "Invalid player ID" };
    }
    if (!vehicleType || typeof vehicleType !== "string") {
        return { success: false, message: "Invalid vehicle type" };
    }

    // Load current state from localStorage (PWA offline support)
    const playerKey = `player_${playerId}`;
    let playerData = JSON.parse(localStorage.getItem(playerKey));
    if (!playerData) {
        playerData = { bank_balance: 10000.0, fleet: [] }; // GDD starting balance
        localStorage.setItem(playerKey, JSON.stringify(playerData));
    }

    // Define vehicle costs (GDD-based, expandable via Backend API)
    const vehicleCosts = {
        "Model Y": 50000.0,
        RoboCab: 75000.0, // Placeholder for future type
    };

    const cost = vehicleCosts[vehicleType];
    if (!cost) {
        return { success: false, message: "Invalid vehicle type" };
    }

    // Check and update balance
    if (playerData.bank_balance < cost) {
        return { success: false, message: "Insufficient funds" };
    }
    playerData.bank_balance = Number(
        (playerData.bank_balance - cost).toFixed(2)
    );

    // Perform purchase
    const vehicleId = `CT-${Date.now()}-${Math.floor(Math.random() * 1000)}`; // Unique ID
    playerData.fleet.push({
        id: vehicleId,
        type: vehicleType,
        purchase_date: new Date().toISOString().split("T")[0],
    });

    // Save updated state to localStorage
    localStorage.setItem(playerKey, JSON.stringify(playerData));

    return {
        success: true,
        message: `Purchased ${vehicleType} (ID: ${vehicleId})`,
        bank_balance: playerData.bank_balance,
        fleet: playerData.fleet,
    };
}

// Test function for console execution
function testPurchase(playerId, vehicleType) {
    // Reset to test with sufficient funds
    localStorage.setItem(
        `player_${playerId}`,
        JSON.stringify({ bank_balance: 60000.0, fleet: [] })
    );
    const result = purchaseVehicle(playerId, vehicleType);
    console.log("Purchase Result:", result);
    const updatedData = JSON.parse(localStorage.getItem(`player_${playerId}`));
    console.log("Updated Data:", updatedData);
    return result;
}

// Optional test for sequential purchases
function testSequentialPurchases(playerId) {
    const result1 = purchaseVehicle(playerId, "Model Y");
    console.log("First Purchase Result:", result1);
    const updatedData1 = JSON.parse(localStorage.getItem(`player_${playerId}`));
    console.log("Updated Data After First:", updatedData1);

    const result2 = purchaseVehicle(playerId, "Model Y");
    console.log("Second Purchase Result:", result2);
    const updatedData2 = JSON.parse(localStorage.getItem(`player_${playerId}`));
    console.log("Updated Data After Second:", updatedData2);

    // src/utils/purchase-utils.js (add at the end)
    window.purchaseVehicle = purchaseVehicle;
    window.testPurchase = testPurchase;
    window.testSequentialPurchases = testSequentialPurchases;

    return { result1, result2 };
}
