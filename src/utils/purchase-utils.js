// src/utils/purchase-utils.js

/**
 * Handles vehicle purchase by deducting cost from bank balance and updating fleet.
 * @param {string} playerId - Unique player identifier.
 * @param {string} vehicleType - Vehicle type (e.g., 'Model Y').
 * @returns {Object} Result with success status, message, and updated balance/fleet.
 */
export function purchaseVehicle(playerId, vehicleType) {
    // Load current state from localStorage (PWA offline support)
    const playerKey = `player_${playerId}`;
    const playerData = JSON.parse(localStorage.getItem(playerKey)) || {
        bank_balance: 60000.0, // GDD starting balance
        fleet: [], // Array of purchased vehicles { id, type, purchase_date }
    };

    // Define vehicle costs (GDD-based, expandable via Backend API)
    const vehicleCosts = {
        "Model Y": 50000.0,
        RoboCab: 75000.0, // Placeholder for future type
    };

    const cost = vehicleCosts[vehicleType];
    if (!cost) {
        return { success: false, message: "Invalid vehicle type" };
    }

    // Check balance
    if (playerData.bank_balance < cost) {
        return { success: false, message: "Insufficient funds" };
    }

    // Perform purchase
    playerData.bank_balance -= cost;
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

// Test function (for manual execution, e.g., via console)
function testPurchase() {
    const result = purchaseVehicle("1", "Model Y");
    console.log("Purchase Result:", result);
    return result;
}

// Execute test (uncomment to run in browser console)
testPurchase();
