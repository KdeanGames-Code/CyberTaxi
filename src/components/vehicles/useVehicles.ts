/**
 * useVehicles.ts - Custom React hook for managing vehicle data in CyberTaxi.
 * Fetches and stores player vehicles, handling errors and loading states, per GDD v1.1.
 * @module useVehicles
 * @version 0.1.0
 */

import { useState, useEffect } from "react";
import type { Vehicle } from "../map/vehicle-markers";

/**
 * Interface for vehicles hook return value.
 * @interface VehicleState
 * @property {Vehicle[]} vehicles - Array of player vehicles.
 * @property {string | null} errorMessage - Error message for UI display.
 * @property {boolean} isLoadingVehicles - Whether vehicles are being fetched.
 */
interface VehicleState {
    vehicles: Vehicle[];
    errorMessage: string | null;
    isLoadingVehicles: boolean;
}

/**
 * Custom hook to fetch and manage vehicle data.
 * Triggers vehicle fetch when user is logged in, handles token refresh on 401/403 errors.
 * @param {boolean} isLoggedIn - Whether the user is logged in.
 * @returns {VehicleState} Vehicle state and status.
 */
export const useVehicles = (isLoggedIn: boolean): VehicleState => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

    /**
     * Decodes JWT token for debugging claims.
     * @param {string} token - JWT token to decode.
     * @returns {object | null} Decoded token claims or null if invalid.
     */
    const decodeToken = (token: string) => {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map(
                        (c) =>
                            "%" +
                            ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                    )
                    .join("")
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Failed to decode JWT token:", e);
            return null;
        }
    };

    /**
     * Refreshes JWT token on 401/403 errors.
     * Updates localStorage with new token and player data.
     * @returns {Promise<string | null>} New token or null if refresh fails.
     */
    const refreshToken = async () => {
        const playerId = localStorage.getItem("player_id") || "1";
        const username = localStorage.getItem("username") || "Kevin-Dean";
        const playerIdNum = parseInt(playerId, 10);
        console.log(
            `Attempting to refresh token for player_id: ${playerIdNum}, username: ${username}`
        );
        try {
            const response = await fetch(
                "http://localhost:3000/api/auth/login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        player_id: playerIdNum,
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
                const tokenClaims = decodeToken(data.token);
                console.log("New token claims:", tokenClaims);
                localStorage.setItem("jwt_token", data.token);
                localStorage.setItem("player_id", data.player_id.toString());
                localStorage.setItem("username", username);
                return data.token;
            } else {
                console.error("Token refresh failed:", data.message);
                setErrorMessage(
                    "Failed to refresh session. Please log in again."
                );
                localStorage.removeItem("jwt_token");
                localStorage.removeItem("username");
                localStorage.removeItem("player_id");
                return null;
            }
        } catch (error: unknown) {
            console.error("Token refresh error:", error);
            setErrorMessage("Failed to refresh session. Please log in again.");
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("username");
            localStorage.removeItem("player_id");
            return null;
        }
    };

    /**
     * Fetches player vehicles from the backend API.
     * Handles retries and token refresh on 401/403 errors.
     * @param {number} [retries=3] - Number of retry attempts.
     * @param {number} [delay=1000] - Delay between retries in milliseconds.
     * @returns {Promise<Vehicle[]>} Array of validated vehicle data.
     */
    const fetchVehicles = async (
        retries = 3,
        delay = 1000
    ): Promise<Vehicle[]> => {
        let token = localStorage.getItem("jwt_token");
        const username = localStorage.getItem("username") || "Kevin-Dean";
        console.log(`Initiating fetch from /api/player/${username}/vehicles`, {
            token: token ? `${token.slice(0, 10)}...` : "No token",
        });
        if (!token) {
            console.error("No JWT token found");
            setErrorMessage("Authentication required. Please log in again.");
            return [];
        }
        const tokenClaims = decodeToken(token);
        console.log("Token claims:", tokenClaims);
        try {
            const response = await fetch(
                `http://localhost:3000/api/player/${username}/vehicles`,
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
                    console.error("Token invalid or unauthorized:", errorText);
                    setErrorMessage(
                        "Session expired. Attempting to refresh token..."
                    );
                    token = await refreshToken();
                    if (!token) {
                        return [];
                    }
                    console.log(
                        `Retrying fetch with new token: ${token.slice(
                            0,
                            10
                        )}...`
                    );
                    const retryResponse = await fetch(
                        `http://localhost:3000/api/player/${username}/vehicles`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    if (!retryResponse.ok) {
                        const retryErrorText = await retryResponse.text();
                        throw new Error(
                            `HTTP ${retryResponse.status}: Failed to fetch vehicles after token refresh - ${retryErrorText}`
                        );
                    }
                    const retryData = await retryResponse.json();
                    console.log(
                        "Retry API vehicles response:",
                        JSON.stringify(retryData, null, 2)
                    );
                    if (!Array.isArray(retryData.vehicles)) {
                        console.warn(
                            "Retry API returned invalid vehicles array:",
                            retryData
                        );
                        setErrorMessage("No vehicles found in database");
                        return [];
                    }
                    const vehicles = retryData.vehicles
                        .filter((v: any) => {
                            const isValid =
                                v.id &&
                                v.player_id &&
                                v.type &&
                                v.status &&
                                ["active", "parked", "garage", "new"].includes(
                                    v.status
                                ) &&
                                Array.isArray(v.coords) &&
                                v.coords.length === 2 &&
                                typeof v.coords[0] === "number" &&
                                typeof v.coords[1] === "number";
                            if (!isValid) {
                                console.warn("Invalid vehicle data:", v);
                            }
                            return isValid;
                        })
                        .map((v: any) => ({
                            id: v.id.toString(),
                            player_id: v.player_id,
                            type: v.type,
                            status: v.status as
                                | "active"
                                | "parked"
                                | "garage"
                                | "new",
                            coords: [v.coords[0], v.coords[1]] as [
                                number,
                                number
                            ],
                            dest: v.dest
                                ? ([v.dest[0], v.dest[1]] as [number, number])
                                : null,
                            wear: v.wear,
                            battery: v.battery,
                            mileage: v.mileage,
                            tire_mileage: v.tire_mileage,
                            purchase_date: v.purchase_date,
                            delivery_timestamp: v.delivery_timestamp,
                            cost: v.cost,
                            created_at: v.created_at,
                            updated_at: v.updated_at,
                        }));
                    console.log(
                        "Fetched",
                        vehicles.length,
                        "valid vehicles from retry API:",
                        vehicles
                    );
                    if (vehicles.length === 0) {
                        setErrorMessage("No vehicles found in database");
                    }
                    return vehicles;
                }
                throw new Error(
                    `HTTP ${response.status}: Failed to fetch vehicles - ${errorText}`
                );
            }
            const data = await response.json();
            console.log(
                "API vehicles response:",
                JSON.stringify(data, null, 2)
            );
            if (!Array.isArray(data.vehicles)) {
                console.warn("API returned invalid vehicles array:", data);
                setErrorMessage("No vehicles found in database");
                return [];
            }
            const vehicles = data.vehicles
                .filter((v: any) => {
                    const isValid =
                        v.id &&
                        v.player_id &&
                        v.type &&
                        v.status &&
                        ["active", "parked", "garage", "new"].includes(
                            v.status
                        ) &&
                        Array.isArray(v.coords) &&
                        v.coords.length === 2 &&
                        typeof v.coords[0] === "number" &&
                        typeof v.coords[1] === "number";
                    if (!isValid) {
                        console.warn("Invalid vehicle data:", v);
                    }
                    return isValid;
                })
                .map((v: any) => ({
                    id: v.id.toString(),
                    player_id: v.player_id,
                    type: v.type,
                    status: v.status as "active" | "parked" | "garage" | "new",
                    coords: [v.coords[0], v.coords[1]] as [number, number],
                    dest: v.dest
                        ? ([v.dest[0], v.dest[1]] as [number, number])
                        : null,
                    wear: v.wear,
                    battery: v.battery,
                    mileage: v.mileage,
                    tire_mileage: v.tire_mileage,
                    purchase_date: v.purchase_date,
                    delivery_timestamp: v.delivery_timestamp,
                    cost: v.cost,
                    created_at: v.created_at,
                    updated_at: v.updated_at,
                }));
            console.log(
                "Fetched",
                vehicles.length,
                "valid vehicles from API:",
                vehicles
            );
            if (vehicles.length === 0) {
                setErrorMessage("No vehicles found in database");
            }
            return vehicles;
        } catch (error: unknown) {
            const errorMsg =
                error instanceof Error ? error.message : "Unknown error";
            if (retries > 0) {
                console.warn(
                    `Retrying fetch (/api/player/${username}/vehicles), ${retries} attempts left`
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                return fetchVehicles(retries - 1, delay * 2);
            }
            console.error(
                `Failed to fetch vehicles from /api/player/${username}/vehicles:`,
                error
            );
            setErrorMessage(`Failed to fetch vehicles: ${errorMsg}`);
            return [];
        }
    };

    /**
     * Fetches vehicles when logged in and updates state.
     * Stores fetched vehicles in localStorage for persistence.
     */
    useEffect(() => {
        console.log("Vehicles hook initialized");
        if (!isLoggedIn) {
            console.log("No vehicles rendered pre-login");
            setVehicles([]);
            setIsLoadingVehicles(false);
            setErrorMessage(null);
            return;
        }

        const loadVehicles = async () => {
            setIsLoadingVehicles(true);
            console.log("Triggering vehicle fetch on login state change");
            const fetchedVehicles = await fetchVehicles();
            console.log(`Vehicles fetched: ${fetchedVehicles.length}`);
            setVehicles(fetchedVehicles);
            let playerData: any;
            try {
                playerData = JSON.parse(
                    localStorage.getItem("player_1") || "{}"
                );
            } catch (error: unknown) {
                console.error("Failed to parse player_1 data:", error);
                setErrorMessage("Failed to load player data");
                playerData = {
                    fleet: [],
                    bank_balance: 10000.0,
                    garages: [],
                };
            }
            playerData.fleet = fetchedVehicles;
            localStorage.setItem("player_1", JSON.stringify(playerData));
            console.log(
                "Stored",
                fetchedVehicles.length,
                "vehicles in localStorage"
            );
            setIsLoadingVehicles(false);
        };

        loadVehicles();
    }, [isLoggedIn]);

    return {
        vehicles,
        errorMessage,
        isLoadingVehicles,
    };
};
