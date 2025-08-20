// src/components/mapping/usePlayerVehicles.ts
/**
 * @file usePlayerVehicles.ts
 * @description React hook for managing player vehicle data in CyberTaxi.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.4
 * @note Fetches player vehicles from /api/player/:username/vehicles, maps statuses, handles errors, per GDD v1.1.
 * @detail Uses LoginService for token refresh, handles 404 errors gracefully.
 */
import { useState, useEffect } from "react";
import { API_CONFIG } from "../../config/apiConfig";
import { LoginService } from "../../services/LoginService";
import type { Vehicle } from "./VehicleMarkers";

/**
 * Interface for vehicle state.
 * @interface VehicleState
 */
interface VehicleState {
    vehicles: Vehicle[]; // Player vehicles
    errorMessage: string | null; // Error message for UI
    isLoadingVehicles: boolean; // Loading state
}

/**
 * Maps backend status to marker style.
 * @param status - Backend vehicle status.
 * @returns {string} Mapped status for marker style.
 */
const mapVehicleStatus = (status: string): Vehicle["status"] => {
    switch (status.toLowerCase()) {
        case "active":
        case "fare":
            return "active";
        case "parked":
        case "maintenance":
        case "cleaning":
            return "parked";
        case "new":
            return "new";
        default:
            console.warn(`usePlayerVehicles: Unknown vehicle status: ${status}, defaulting to parked`);
            return "parked";
    }
};

/**
 * Custom hook to fetch and manage player vehicle data.
 * @param isLoggedIn - Whether the user is logged in.
 * @returns {VehicleState} Vehicle state and status.
 */
export const usePlayerVehicles = (isLoggedIn: boolean): VehicleState => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

    /**
     * Fetches player vehicles with retries and token refresh.
     * @param retries - Number of retry attempts.
     * @param delay - Delay between retries in milliseconds.
     * @returns {Promise<Vehicle[]>} Array of validated vehicles.
     */
    const fetchVehicles = async (retries = 3, delay = 1000): Promise<Vehicle[]> => {
        const token = localStorage.getItem("jwt_token");
        const username = localStorage.getItem("username") || "Kevin-Dean";
        if (!token) {
            console.error("usePlayerVehicles: No JWT token found");
            setErrorMessage("Authentication required. Please log in.");
            return [];
        }
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/player/${username}/vehicles`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn("usePlayerVehicles: Vehicle endpoint not found");
                    setErrorMessage("Vehicle data not available yet. Contact support.");
                    return [];
                }
                if (response.status === 401 || response.status === 403) {
                    console.error("usePlayerVehicles: Token invalid or unauthorized");
                    setErrorMessage("Session expired. Attempting to refresh token...");
                    const loginResponse = await LoginService.login(username, "newpass123");
                    if (!loginResponse || !loginResponse.token || !loginResponse.player_id) {
                        setErrorMessage("Failed to refresh session. Please log in again.");
                        localStorage.removeItem("jwt_token");
                        localStorage.removeItem("username");
                        localStorage.removeItem("player_id");
                        return [];
                    }
                    localStorage.setItem("jwt_token", loginResponse.token);
                    localStorage.setItem("player_id", loginResponse.player_id.toString());
                    console.log(`usePlayerVehicles: Token refreshed: ${loginResponse.token.slice(0, 10)}...`);
                    const retryResponse = await fetch(`${API_CONFIG.BASE_URL}/player/${username}/vehicles`, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${loginResponse.token}`,
                            "Content-Type": "application/json",
                        },
                    });
                    if (!retryResponse.ok) {
                        if (retryResponse.status === 404) {
                            console.warn("usePlayerVehicles: Vehicle endpoint not found on retry");
                            setErrorMessage("Vehicle data not available yet. Contact support.");
                            return [];
                        }
                        const errorText = await retryResponse.text();
                        throw new Error(`HTTP ${retryResponse.status}: ${errorText}`);
                    }
                    return await processVehicleResponse(retryResponse);
                }
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            return await processVehicleResponse(response);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Unknown error";
            if (retries > 0) {
                console.warn(`usePlayerVehicles: Retrying fetch, ${retries} attempts left`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                return fetchVehicles(retries - 1, delay * 2);
            }
            console.error(`usePlayerVehicles: Failed to fetch vehicles:`, errorMsg);
            setErrorMessage(`Failed to fetch vehicles: ${errorMsg}`);
            return [];
        }
    };

    /**
     * Processes API response and validates vehicle data.
     * @param response - Fetch response.
     * @returns {Promise<Vehicle[]>} Validated vehicles.
     */
    const processVehicleResponse = async (response: Response): Promise<Vehicle[]> => {
        const data = await response.json();
        console.log("usePlayerVehicles: API response:", JSON.stringify(data, null, 2));
        if (!Array.isArray(data.vehicles)) {
            console.warn("usePlayerVehicles: Invalid vehicles array:", data);
            setErrorMessage("No vehicles found in database");
            return [];
        }
        const validVehicles = data.vehicles
            .filter((v: any) => {
                const isValid =
                    v.id &&
                    v.player_id &&
                    v.type &&
                    v.status &&
                    ["active", "fare", "parked", "maintenance", "cleaning", "new"].includes(v.status.toLowerCase()) &&
                    Array.isArray(v.coords) &&
                    v.coords.length === 2 &&
                    typeof v.coords[0] === "number" &&
                    typeof v.coords[1] === "number" &&
                    v.coords[0] >= -90 &&
                    v.coords[0] <= 90 &&
                    v.coords[1] >= -180 &&
                    v.coords[1] <= 180;
                if (!isValid) console.warn("usePlayerVehicles: Invalid vehicle data:", v);
                return isValid;
            })
            .map((v: any) => ({
                id: v.id.toString(),
                player_id: v.player_id,
                type: v.type,
                status: mapVehicleStatus(v.status),
                coords: [v.coords[0], v.coords[1]] as [number, number],
                dest: v.dest ? ([v.dest[0], v.dest[1]] as [number, number]) : null,
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
        console.log(`usePlayerVehicles: Fetched ${validVehicles.length} valid vehicles`);
        if (validVehicles.length === 0) setErrorMessage("No vehicles found in database");
        return validVehicles;
    };

    useEffect(() => {
        if (!isLoggedIn) {
            console.log("usePlayerVehicles: Clearing vehicles pre-login");
            setVehicles([]);
            setIsLoadingVehicles(false);
            setErrorMessage(null);
            return;
        }
        const loadVehicles = async () => {
            setIsLoadingVehicles(true);
            console.log("usePlayerVehicles: Triggering vehicle fetch");
            const playerVehicles = await fetchVehicles();
            setVehicles(playerVehicles);
            setIsLoadingVehicles(false);
            console.log(`usePlayerVehicles: Loaded ${playerVehicles.length} player vehicles`);
        };
        loadVehicles();
    }, [isLoggedIn]);

    return { vehicles, errorMessage, isLoadingVehicles };
};