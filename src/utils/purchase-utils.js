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

    // Load current state from localStorage
    const playerKey = `player_${playerId}`;
    let playerData = JSON.parse(localStorage.getItem(playerKey));
    if (!playerData) {
        playerData = { bank_balance: 10000.0, fleet: [], garages: [] }; // GDD starting state
        localStorage.setItem(playerKey, JSON.stringify(playerData));
    }

    // Mock garage data (to be replaced with Backend API call)
    const mockGarages = playerData.garages || [
        { id: "G-001", spots: 3 }, // Example garage with 3 spots
        { id: "L-001", spots: 2 }, // Example lot with 2 spots
    ];
    const totalSpots = mockGarages.reduce(
        (sum, garage) => sum + garage.spots,
        0
    );
    if (playerData.fleet.length >= totalSpots) {
        return {
            success: false,
            message: "Fleet limit reached based on garage/lot capacity",
        };
    }

    // Define vehicle costs
    const vehicleCosts = {
        "Model Y": 50000.0,
        RoboCab: 35000.0,
    };

    const cost = vehicleCosts[vehicleType];
    if (!cost) {
        return { success: false, message: "Invalid vehicle type" };
    }

    // Use actual bank_balance from playerData
    if (playerData.bank_balance < cost) {
        return { success: false, message: "Insufficient funds" };
    }
    playerData.bank_balance = Number(
        (playerData.bank_balance - cost).toFixed(2)
    );

    // Perform purchase
    const vehicleId = `CT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
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
    // Reset with dynamic state including garages
    localStorage.setItem(
        `player_${playerId}`,
        JSON.stringify({
            bank_balance: 60000.0, // Mock balance for now
            fleet: [],
            garages: [
                { id: "G-001", spots: 3 },
                { id: "L-001", spots: 2 },
            ],
        })
    );
    const result = purchaseVehicle(playerId, vehicleType);
    console.log("Purchase Result:", result);
    const updatedData = JSON.parse(localStorage.getItem(`player_${playerId}`));
    console.log("Updated Data:", updatedData);
    return result;
}

// Test function for fleet limit
function testFleetLimit(playerId) {
    // Set up a fleet at limit (5 spots total)
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
    console.log("Purchase Result with Full Fleet:", result);
    const updatedData = JSON.parse(localStorage.getItem(`player_${playerId}`));
    console.log("Updated Data After Attempt:", updatedData);
    return result;
}

// Run tests
testPurchase("1", "Model Y");
testFleetLimit("1");
