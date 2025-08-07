/**
 * CyberBrowser.tsx - Renders a resizable, draggable browser window for vehicle purchases.
 * Displays Tesla-inspired UI with vehicle images, purchase options, slot availability, and funds checks, per GDD v1.1.
 * @module CyberBrowser
 * @version 0.2.9
 */

import React, { useState, useEffect } from "react";
import { Window } from "./Window";
import { purchaseVehicle } from "../../utils/purchase-utils";
import "../../styles/browser.css";

/**
 * Props for the CyberBrowser component.
 * @interface CyberBrowserProps
 * @property {() => void} onClose - Callback to close the browser window.
 * @property {string} playerId - Player ID for purchase and slot operations.
 */
interface CyberBrowserProps {
    onClose: () => void;
    playerId: string;
}

/**
 * CyberBrowser component renders a cyberpunk-styled browser window with purchase UI.
 * Displays slot availability (e.g., "Slots Available: 2/5"), vehicle purchase options, and funds checks.
 * @param {CyberBrowserProps} props - Component props.
 * @returns {JSX.Element} Resizable, draggable window with purchase UI and slots.
 */
export const CyberBrowser: React.FC<CyberBrowserProps> = ({
    onClose,
    playerId,
}) => {
    const [url] = useState("https://Tesla.ct");
    const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);
    const [slots, setSlots] = useState<{ total: number; used: number } | null>(
        null
    );
    const [balance, setBalance] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Vehicle configurations
    const vehicles = [
        {
            type: "Model Y",
            cost: 50000,
            image: "src/assets/showroom/ModelY-Showroom.png",
        },
        {
            type: "RoboCab",
            cost: 35000,
            image: "src/assets/showroom/RoboCab-Showroom.jpg",
        },
    ];

    // Refresh JWT token
    const refreshToken = async () => {
        const username = localStorage.getItem("username") || "Kevin-Dean";
        console.log(
            `Attempting to refresh token for player_id: ${playerId}, username: ${username}`
        );
        try {
            const response = await fetch(
                "http://localhost:3000/api/auth/login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        player_id: parseInt(playerId, 10),
                        password: "test123",
                    }),
                }
            );
            const data = await response.json();
            console.log("Token refresh response:", data);
            if (data.status === "Success") {
                console.log(
                    `Token refresh successful, new token: ${data.token}`
                );
                localStorage.setItem("jwt_token", data.token);
                localStorage.setItem("player_id", data.player_id.toString());
                localStorage.setItem("username", username);
                return data.token;
            } else {
                console.error("Token refresh failed:", data.message);
                setError("Failed to refresh session. Please log in again.");
                localStorage.removeItem("jwt_token");
                localStorage.removeItem("username");
                localStorage.removeItem("player_id");
                return null;
            }
        } catch (error) {
            console.error("Token refresh error:", error);
            setError("Failed to refresh session. Please log in again.");
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("username");
            localStorage.removeItem("player_id");
            return null;
        }
    };

    // Fetch slots from API
    useEffect(() => {
        const fetchSlots = async (retries = 3, delay = 1000) => {
            const token = localStorage.getItem("jwt_token");
            console.log(`Fetching slots from /api/player/${playerId}/slots`, {
                token: token ? `${token.slice(0, 10)}...` : "No token",
            });
            if (!token) {
                console.error("No JWT token found");
                setError("Authentication required. Please log in again.");
                return;
            }
            try {
                const response = await fetch(
                    `http://localhost:3000/api/player/${playerId}/slots`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (!response.ok) {
                    const errorText = await response.text();
                    if (response.status === 401 || response.status === 403) {
                        console.error(
                            "Token invalid or unauthorized:",
                            errorText
                        );
                        setError(
                            "Session expired. Attempting to refresh token..."
                        );
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
                            setSlots({
                                total: retryData.total_slots,
                                used: retryData.used_slots,
                            });
                            console.log(
                                `Rendering slots: ${retryData.used_slots}/${retryData.total_slots}`
                            );
                        } else {
                            console.warn(
                                "Invalid slots retry data:",
                                retryData
                            );
                            setError("No valid slot data found");
                        }
                        return;
                    }
                    throw new Error(
                        `HTTP ${response.status}: Failed to fetch slots - ${errorText}`
                    );
                }
                const data = await response.json();
                console.log("Slots response:", JSON.stringify(data, null, 2));
                if (
                    data.status === "Success" &&
                    typeof data.total_slots === "number" &&
                    typeof data.used_slots === "number"
                ) {
                    setSlots({
                        total: data.total_slots,
                        used: data.used_slots,
                    });
                    console.log(
                        `Rendering slots: ${data.used_slots}/${data.total_slots}`
                    );
                } else {
                    console.warn("Invalid slots data:", data);
                    setError("No valid slot data found");
                }
            } catch (error) {
                if (retries > 0) {
                    console.warn(
                        `Retrying fetch (/api/player/${playerId}/slots), ${retries} attempts left`
                    );
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    return fetchSlots(retries - 1, delay * 2);
                }
                console.error(
                    `Failed to fetch slots from /api/player/${playerId}/slots:`,
                    error
                );
                setError(
                    `Failed to fetch slots: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`
                );
            }
        };

        const fetchBalance = async (retries = 3, delay = 1000) => {
            const token = localStorage.getItem("jwt_token");
            console.log(
                `Fetching balance from /api/player/${playerId}/balance`,
                { token: token ? `${token.slice(0, 10)}...` : "No token" }
            );
            if (!token) {
                console.error("No JWT token found");
                setError("Authentication required. Please log in again.");
                return;
            }
            try {
                const response = await fetch(
                    `http://localhost:3000/api/player/${playerId}/balance`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (!response.ok) {
                    const errorText = await response.text();
                    if (response.status === 401 || response.status === 403) {
                        console.error(
                            "Token invalid or unauthorized:",
                            errorText
                        );
                        setError(
                            "Session expired. Attempting to refresh token..."
                        );
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
                            console.log(
                                `Balance fetched: ${retryData.bank_balance}`
                            );
                        } else {
                            console.warn(
                                "Invalid balance retry data:",
                                retryData
                            );
                            setError("No valid balance data found");
                        }
                        return;
                    }
                    throw new Error(
                        `HTTP ${response.status}: Failed to fetch balance - ${errorText}`
                    );
                }
                const data = await response.json();
                console.log("Balance response:", JSON.stringify(data, null, 2));
                if (
                    data.status === "Success" &&
                    typeof data.bank_balance === "number"
                ) {
                    setBalance(data.bank_balance);
                    console.log(`Balance fetched: ${data.bank_balance}`);
                } else {
                    console.warn("Invalid balance data:", data);
                    setError("No valid balance data found");
                }
            } catch (error) {
                if (retries > 0) {
                    console.warn(
                        `Retrying fetch (/api/player/${playerId}/balance), ${retries} attempts left`
                    );
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    return fetchBalance(retries - 1, delay * 2);
                }
                console.error(
                    `Failed to fetch balance from /api/player/${playerId}/balance:`,
                    error
                );
                setError(
                    `Failed to fetch balance: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`
                );
            }
        };

        fetchSlots();
        fetchBalance();
    }, [playerId]);

    // Handle vehicle purchase
    const handlePurchase = (vehicleType: string) => {
        const result = purchaseVehicle(playerId, vehicleType);
        setPurchaseStatus(result.message);
        console.log(`Purchase attempted for ${vehicleType}:`, result);
        setTimeout(() => setPurchaseStatus(null), 3000); // Clear status after 3s
    };

    return (
        <Window
            id="cyber-browser"
            title="CyberBrowser V1.0 - Tesla: New Vehicle's"
            onClose={() => {
                console.log("CyberBrowser onClose triggered");
                onClose();
            }}
            isResizable={true}
            initialPosition={{ top: 100, left: 100 }}
        >
            <div
                className="browser-content"
                role="region"
                aria-label="CyberBrowser interface"
            >
                {error && <div className="error-message">{error}</div>}
                <div className="url-bar">
                    <input
                        type="text"
                        value={url}
                        readOnly
                        aria-label="Browser URL"
                    />
                </div>
                <div className="purchase-section">
                    <h3>Purchase Vehicles</h3>
                    <div className="vehicle-options">
                        {vehicles.map((vehicle) => {
                            const canPurchase =
                                slots &&
                                balance !== null &&
                                slots.used < slots.total &&
                                balance >= vehicle.cost;
                            console.log(
                                `Checking funds for ${vehicle.type}: ${balance} vs ${vehicle.cost}`
                            );
                            return (
                                <div
                                    key={vehicle.type}
                                    className="vehicle-card"
                                >
                                    <img
                                        src={vehicle.image}
                                        alt={`${vehicle.type} vehicle`}
                                        className="vehicle-image"
                                    />
                                    <h4>{vehicle.type}</h4>
                                    <p>
                                        Cost: ${vehicle.cost.toLocaleString()}
                                    </p>
                                    {slots && balance !== null && (
                                        <>
                                            <p>
                                                Slots: {slots.used}/
                                                {slots.total}
                                            </p>
                                            {!canPurchase && (
                                                <p className="insufficient-message">
                                                    {slots.used >= slots.total
                                                        ? "No slots available"
                                                        : "Insufficient Funds"}
                                                </p>
                                            )}
                                        </>
                                    )}
                                    <button
                                        className="purchase-btn"
                                        onClick={() =>
                                            handlePurchase(vehicle.type)
                                        }
                                        aria-label={`Purchase ${vehicle.type}`}
                                        disabled={!canPurchase}
                                    >
                                        Buy Now
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    {slots && (
                        <div
                            className="slots-display"
                            aria-label="Vehicle slots status"
                        >
                            <span>
                                Slots Available: {slots.used}/{slots.total}
                            </span>
                        </div>
                    )}
                    {purchaseStatus && (
                        <p className="purchase-status">{purchaseStatus}</p>
                    )}
                </div>
            </div>
        </Window>
    );
};
