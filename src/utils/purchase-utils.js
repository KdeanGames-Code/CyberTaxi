// src/utils/purchase-utils.js
async function getJwtToken() {
    try {
        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ player_id: 1, password: "test123" }),
        });
        if (!response.ok) {
            throw new Error(`Auth error: ${response.status}`);
        }
        const data = await response.json();
        console.log("JWT token response:", data);
        return data.token;
    } catch (error) {
        console.error("JWT token fetch failed:", error);
        throw error;
    }
}

async function getPlayerBalance(playerId) {
    try {
        const token = await getJwtToken();
        const response = await fetch(
            `http://localhost:3000/api/player/${playerId}/balance`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        if (!response.ok) {
            throw new Error(`Balance fetch error: ${response.status}`);
        }
        const data = await response.json();
        console.log("Balance response:", data);
        console.log(
            "Raw bank_balance:",
            data.bank_balance,
            typeof data.bank_balance
        );
        return Number(data.bank_balance);
    } catch (error) {
        console.error("Failed to fetch balance:", error);
        return 0;
    }
}

async function purchaseVehicle(playerId, vehicleData) {
    try {
        const token = await getJwtToken();
        const balance = await getPlayerBalance(playerId);
        console.log("Current balance:", balance, typeof balance);
        console.log("Purchase payload:", vehicleData);

        const cost = Number(vehicleData.cost) || 0;
        console.log("Cost comparison:", {
            balance,
            cost,
            balanceType: typeof balance,
            costType: typeof cost,
        });

        if (balance < cost) {
            console.error("Insufficient funds:", { balance, cost });
            return { success: false, message: "Insufficient funds" };
        }

        // Mock API call (since /api/vehicles/purchase returns 404)
        const mockResponse = {
            success: true,
            message: "Purchase successful",
            data: {
                ...vehicleData,
                id: "CT-" + Math.random().toString(36).substr(2, 9),
            },
        };
        console.log("Mock purchase response:", mockResponse);
        return mockResponse;

        // Uncomment when /api/vehicles/purchase is available
        /*
    const response = await fetch(`http://localhost:3000/api/vehicles/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(vehicleData),
    });
    if (!response.ok) {
      throw new Error(`Purchase error: ${response.status}`);
    }
    const data = await response.json();
    console.log('Purchase response:', data);
    return data;
    */
    } catch (error) {
        console.error("Purchase failed:", error);
        return { success: false, message: "Purchase failed" };
    }
}

export { purchaseVehicle };
