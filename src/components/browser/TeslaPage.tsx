/**
 * TeslaPage.tsx - Renders the Tesla purchase page in CyberBrowser for CyberTaxi.
 * Displays vehicle options (Model Y, RoboCab) with images, checks player funds and slots, and handles purchases, per GDD v1.1.
 * @module TeslaPage
 * @version 0.2.6
 */
import React, { useEffect, useState } from "react";
import "../../styles/browser.css";

/**
 * Props for the TeslaPage component.
 * @interface TeslaPageProps
 */
interface TeslaPageProps {
    username: string; // Player username for API calls
}

/**
 * Renders the Tesla purchase page with vehicle options and purchase controls.
 * @param props - Component props.
 * @returns JSX.Element - Tesla page UI.
 */
export const TeslaPage: React.FC<TeslaPageProps> = ({ username }) => {
    const [balance, setBalance] = useState<number | null>(null);
    const [availableSlots, setAvailableSlots] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("jwt_token")
    );
    const [playerId, setPlayerId] = useState<string | null>(
        localStorage.getItem("player_id")
    );

    /**
     * Refreshes JWT token if invalid, using /api/auth/login/username.
     */
    const refreshToken = async (): Promise<string | null> => {
        try {
            console.log(
                `Attempting to refresh token for username: ${username}`
            );
            const response = await fetch(
                "http://localhost:3000/api/auth/login/username",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password: "test123" }),
                }
            );
            const result = await response.json();
            console.log("Token refresh response:", result);
            if (result.status === "Success" && result.token) {
                console.log(
                    "Token refresh successful, new token:",
                    result.token.slice(0, 10) + "..."
                );
                localStorage.setItem("jwt_token", result.token);
                setToken(result.token);
                if (result.player_id) {
                    localStorage.setItem("player_id", String(result.player_id));
                    setPlayerId(String(result.player_id));
                }
                localStorage.setItem("username", username);
                return result.token;
            } else {
                throw new Error(result.message || "Token refresh failed");
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            console.error("Token refresh error:", errorMessage);
            setError("Failed to refresh token: " + errorMessage);
            return null;
        }
    };

    /**
     * Fetches player slots from /api/player/:player_id/slots.
     */
    const fetchSlots = async () => {
        let currentToken = token || localStorage.getItem("jwt_token");
        if (!currentToken || !playerId || isNaN(parseInt(playerId))) {
            setError("No valid authentication token or player ID found");
            console.log("Invalid playerId:", playerId);
            return;
        }
        try {
            console.log(`Fetching slots from /api/player/${playerId}/slots`, {
                token: currentToken.slice(0, 10) + "...",
            });
            const response = await fetch(
                `http://localhost:3000/api/player/${playerId}/slots`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${currentToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!response.ok) {
                const errorText = await response.text();
                console.log("API error response:", errorText);
                if (response.status === 401 || response.status === 403) {
                    console.error("Token invalid or unauthorized:", errorText);
                    setError("Session expired. Attempting to refresh token...");
                    const newToken = await refreshToken();
                    if (!newToken) {
                        return;
                    }
                    console.log(
                        `Retrying fetch with new token: ${newToken.slice(
                            0,
                            10
                        )}...`
                    );
                    const retryResponse = await fetch(
                        `http://localhost:3000/api/player/${playerId}/slots`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${newToken}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    if (!retryResponse.ok) {
                        const retryErrorText = await retryResponse.text();
                        console.log(
                            "Retry API error response:",
                            retryErrorText
                        );
                        throw new Error(
                            `HTTP ${retryResponse.status}: Failed to fetch slots after token refresh - ${retryErrorText}`
                        );
                    }
                    const retryData = await retryResponse.json();
                    console.log(
                        "Slots retry response:",
                        JSON.stringify(retryData, null, 2)
                    );
                    if (
                        retryData.status === "Success" &&
                        typeof retryData.total_slots === "number" &&
                        typeof retryData.used_slots === "number"
                    ) {
                        setAvailableSlots(
                            retryData.total_slots - retryData.used_slots
                        );
                        console.log(
                            `Rendering slots: ${retryData.used_slots}/${retryData.total_slots}`
                        );
                    } else {
                        console.warn("Invalid slots retry data:", retryData);
                        setError("No valid slot data found");
                    }
                } else {
                    throw new Error(errorText);
                }
            } else {
                const data = await response.json();
                console.log("Slots response:", JSON.stringify(data, null, 2));
                if (
                    data.status === "Success" &&
                    typeof data.total_slots === "number" &&
                    typeof data.used_slots === "number"
                ) {
                    setAvailableSlots(data.total_slots - data.used_slots);
                } else {
                    throw new Error(data.message || "Failed to fetch slots");
                }
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            console.error("Slots fetch error:", errorMessage);
            setError("Failed to fetch slots: " + errorMessage);
        }
    };

    /**
     * Fetches player balance from /api/player/:player_id/balance.
     */
    const fetchBalance = async () => {
        let currentToken = token || localStorage.getItem("jwt_token");
        if (!currentToken || !playerId || isNaN(parseInt(playerId))) {
            setError("No valid authentication token or player ID found");
            console.log("Invalid playerId:", playerId);
            return;
        }
        try {
            console.log(
                `Fetching balance from /api/player/${playerId}/balance`,
                {
                    token: currentToken.slice(0, 10) + "...",
                }
            );
            const response = await fetch(
                `http://localhost:3000/api/player/${playerId}/balance`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${currentToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!response.ok) {
                const errorText = await response.text();
                console.log("API error response:", errorText);
                if (response.status === 401 || response.status === 403) {
                    console.error("Token invalid or unauthorized:", errorText);
                    setError("Session expired. Attempting to refresh token...");
                    const newToken = await refreshToken();
                    if (!newToken) {
                        return;
                    }
                    console.log(
                        `Retrying fetch with new token: ${newToken.slice(
                            0,
                            10
                        )}...`
                    );
                    const retryResponse = await fetch(
                        `http://localhost:3000/api/player/${playerId}/balance`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${newToken}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    if (!retryResponse.ok) {
                        const retryErrorText = await retryResponse.text();
                        console.log(
                            "Retry API error response:",
                            retryErrorText
                        );
                        throw new Error(
                            `HTTP ${retryResponse.status}: Failed to fetch balance after token refresh - ${retryErrorText}`
                        );
                    }
                    const retryData = await retryResponse.json();
                    console.log(
                        "Balance retry response:",
                        JSON.stringify(retryData, null, 2)
                    );
                    if (
                        retryData.status === "Success" &&
                        typeof retryData.bank_balance === "number"
                    ) {
                        setBalance(retryData.bank_balance);
                    } else {
                        console.warn("Invalid balance retry data:", retryData);
                        setError("No valid balance data found");
                    }
                } else {
                    throw new Error(errorText);
                }
            } else {
                const data = await response.json();
                console.log("Balance response:", JSON.stringify(data, null, 2));
                if (data.status === "Success") {
                    setBalance(data.bank_balance);
                } else {
                    throw new Error(data.message || "Failed to fetch balance");
                }
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            console.error("Balance fetch error:", errorMessage);
            setError("Failed to fetch balance: " + errorMessage);
        }
    };

    /**
     * Handles vehicle purchase via POST /api/vehicles/purchase.
     */
    const handlePurchase = async (type: "Model Y" | "RoboCab") => {
        const cost = type === "Model Y" ? 50000 : 35000;
        console.log(
            `Purchase ${type} clicked, slots: ${availableSlots}, balance: ${balance}`
        );
        if (!playerId) {
            setError("Player ID not found");
            return;
        }
        if (availableSlots === null || availableSlots <= 0) {
            setError("No available slots for vehicle purchase");
            return;
        }
        if (!canPurchase(cost)) {
            setError(`Insufficient funds for ${type} purchase`);
            return;
        }
        let currentToken = token || localStorage.getItem("jwt_token");
        if (!currentToken) {
            setError("No authentication token found");
            return;
        }
        try {
            const response = await fetch(
                "http://localhost:3000/api/vehicles/purchase",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${currentToken}`,
                    },
                    body: JSON.stringify({
                        player_id: parseInt(playerId),
                        type,
                        cost,
                        status: "active",
                        coords: [30.2672, -97.7431], // Default Austin coords
                    }),
                }
            );
            if (!response.ok) {
                if (response.status === 403) {
                    console.log(
                        "Token invalid or unauthorized, attempting refresh"
                    );
                    currentToken = await refreshToken();
                    if (currentToken) {
                        const retryResponse = await fetch(
                            "http://localhost:3000/api/vehicles/purchase",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${currentToken}`,
                                },
                                body: JSON.stringify({
                                    player_id: parseInt(playerId),
                                    type,
                                    cost,
                                    status: "active",
                                    coords: [30.2672, -97.7431],
                                }),
                            }
                        );
                        if (!retryResponse.ok) {
                            throw new Error(
                                "Retry failed: " + (await retryResponse.text())
                            );
                        }
                        const retryData = await retryResponse.json();
                        if (retryData.success) {
                            setSuccess(
                                `Successfully purchased ${type} (ID: ${retryData.vehicle_id})`
                            );
                            setError(null);
                            fetchSlots(); // Refresh slots
                            fetchBalance(); // Refresh balance
                        } else {
                            throw new Error(
                                retryData.message ||
                                    "Failed to purchase vehicle"
                            );
                        }
                    } else {
                        throw new Error("Token refresh failed");
                    }
                } else {
                    throw new Error(await response.text());
                }
            } else {
                const data = await response.json();
                if (data.success) {
                    setSuccess(
                        `Successfully purchased ${type} (ID: ${data.vehicle_id})`
                    );
                    setError(null);
                    fetchSlots(); // Refresh slots
                    fetchBalance(); // Refresh balance
                } else {
                    throw new Error(
                        data.message || "Failed to purchase vehicle"
                    );
                }
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            console.error("Purchase error:", errorMessage);
            setError(`Failed to purchase ${type}: ${errorMessage}`);
        }
    };

    /**
     * Checks if player has enough funds to purchase a vehicle.
     */
    const canPurchase = (cost: number): boolean => {
        console.log(
            `Checking funds for ${
                cost === 50000 ? "Model Y" : "RoboCab"
            }: ${balance} vs ${cost}`
        );
        return balance !== null && balance >= cost;
    };

    /**
     * Fetches slots and balance on mount or username/token change.
     */
    useEffect(() => {
        if (username && token) {
            fetchSlots();
            fetchBalance();
        }
    }, [username, token]);

    return (
        <div
            className="tesla-page"
            role="main"
            aria-label="Tesla purchase interface"
            style={{
                padding: "20px",
                fontFamily: '"Orbitron", sans-serif',
                color: "#f5f5f5",
            }}
        >
            {error && (
                <div
                    className="error-message"
                    style={{
                        color: "#ff4d4f",
                        textAlign: "center",
                        marginBottom: "10px",
                    }}
                >
                    {error}
                </div>
            )}
            {success && (
                <div
                    className="success-message"
                    style={{
                        color: "#4caf50",
                        textAlign: "center",
                        marginBottom: "10px",
                    }}
                >
                    {success}
                </div>
            )}
            <h2>Tesla Vehicle Purchase</h2>
            <p>
                Available Slots:{" "}
                {availableSlots !== null ? availableSlots : "Loading..."}
            </p>
            <p>Balance: {balance !== null ? `$${balance}` : "Loading..."}</p>
            <div className="vehicle-options">
                <div className="vehicle-card">
                    <h3>Model Y</h3>
                    <p>Cost: $50,000</p>
                    <img
                        src="src/assets/showroom/ModelY-Showroom.png"
                        alt="Model Y Vehicle"
                        className="vehicle-image"
                    />
                    <button
                        onClick={() => handlePurchase("Model Y")}
                        disabled={
                            !canPurchase(50000) ||
                            availableSlots === null ||
                            availableSlots <= 0
                        }
                        aria-label="Purchase Model Y"
                        style={{
                            padding: "8px",
                            background:
                                canPurchase(50000) &&
                                availableSlots &&
                                availableSlots > 0
                                    ? "#d4a017"
                                    : "#4a4a4a",
                            border: "none",
                            borderRadius: "4px",
                            color: "#1a1a1a",
                            cursor:
                                canPurchase(50000) &&
                                availableSlots &&
                                availableSlots > 0
                                    ? "pointer"
                                    : "not-allowed",
                        }}
                    >
                        Purchase
                    </button>
                </div>
                <div className="vehicle-card">
                    <h3>RoboCab</h3>
                    <p>Cost: $35,000</p>
                    <img
                        src="src/assets/showroom/RoboCab-Showroom.jpg"
                        alt="RoboCab Vehicle"
                        className="vehicle-image"
                    />
                    <button
                        onClick={() => handlePurchase("RoboCab")}
                        disabled={
                            !canPurchase(35000) ||
                            availableSlots === null ||
                            availableSlots <= 0
                        }
                        aria-label="Purchase RoboCab"
                        style={{
                            padding: "8px",
                            background:
                                canPurchase(35000) &&
                                availableSlots &&
                                availableSlots > 0
                                    ? "#d4a017"
                                    : "#4a4a4a",
                            border: "none",
                            borderRadius: "4px",
                            color: "#1a1a1a",
                            cursor:
                                canPurchase(35000) &&
                                availableSlots &&
                                availableSlots > 0
                                    ? "pointer"
                                    : "not-allowed",
                        }}
                    >
                        Purchase
                    </button>
                </div>
            </div>
        </div>
    );
};
