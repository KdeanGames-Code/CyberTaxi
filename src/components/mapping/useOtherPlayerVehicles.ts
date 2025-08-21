// src/components/mapping/useOtherPlayerVehicles.ts
/**
 * @file useOtherPlayerVehicles.ts
 * @description React hook for managing other player vehicle data in CyberTaxi.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.0
 * @note Fetches other players' vehicles from /api/vehicles/others when logged in, per GDD v1.1.
 * @detail Uses the current jwt_token, aligns with PlayerService pattern.
 */
import { useState, useEffect } from "react";
import { API_CONFIG } from "../../config/apiConfig";
import type { Vehicle } from "./VehicleMarkers";

/**
 * Interface for vehicle state.
 * @interface OtherVehicleState
 */
interface OtherVehicleState {
    vehicles: Vehicle[]; // Other player vehicles
    errorMessage: string | null; // Error message for UI
    isLoadingVehicles: boolean; // Loading state
}

/**
 * Custom hook to fetch and manage other player vehicle data.
 * @param isLoggedIn - Whether the user is logged in.
 * @returns {OtherVehicleState} Other vehicle state and status.
 */
export const useOtherPlayerVehicles = (isLoggedIn: boolean): OtherVehicleState => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

    /**
     * Fetches other players' vehicles.
     * @returns {Promise<Vehicle[]>} Array of validated vehicles.
     */
    const fetchOtherVehicles = async (): Promise<Vehicle[]> => {
        const token = localStorage.getItem("jwt_token");
        if (!isLoggedIn || !token) {
            console.log("useOtherPlayerVehicles: Skipping fetch, not logged in or no token");
            return [];
        }
        try {
            console.log("useOtherPlayerVehicles: Fetching other vehicles");
            const response = await fetch(`${API_CONFIG.BASE_URL}/vehicles/others?status=active`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            return await processVehicleResponse(response);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Unknown error";
            console.error(`useOtherPlayerVehicles: Failed to fetch vehicles:`, errorMsg);
            setErrorMessage(`Failed to fetch other vehicles: ${errorMsg}`);
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
        console.log("useOtherPlayerVehicles: API response:", JSON.stringify(data, null, 2));
        if (!Array.isArray(data.vehicles)) {
            console.warn("useOtherPlayerVehicles: Invalid vehicles array:", data);
            setErrorMessage("No other vehicles found in database");
            return [];
        }
        const playerId = localStorage.getItem("player_id") ? parseInt(localStorage.getItem("player_id")!) : null;
        const validVehicles = data.vehicles
            .filter((v: any) => {
                const isValid =
                    v.id &&
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
                if (!isValid) console.warn("useOtherPlayerVehicles: Invalid vehicle data:", v);
                return isValid && (v.player_id === undefined || v.player_id !== playerId); // Exclude player's own vehicles
            })
            .map((v: any) => ({
                id: v.id.toString(),
                player_id: v.player_id !== undefined ? (typeof v.player_id === "number" ? v.player_id : parseInt(v.player_id)) : null,
                type: v.type,
                status: mapVehicleStatus(v.status),
                coords: [v.coords[0], v.coords[1]] as [number, number],
                dest: v.dest ? ([v.dest[0], v.dest[1]] as [number, number]) : null,
                wear: v.wear || 0,
                battery: v.battery || 0,
                mileage: v.mileage || 0,
                tire_mileage: v.tire_mileage || 0,
                purchase_date: v.purchase_date,
                delivery_timestamp: v.delivery_timestamp,
                cost: v.cost || 0,
                created_at: v.created_at,
                updated_at: v.updated_at,
            }));
        console.log(`useOtherPlayerVehicles: Fetched ${validVehicles.length} valid vehicles`);
        if (validVehicles.length > 0) setErrorMessage(null); // Clear error on successful fetch
        return validVehicles;
    };

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
                console.warn(`useOtherPlayerVehicles: Unknown vehicle status: ${status}, defaulting to parked`);
                return "parked";
        }
    };

    useEffect(() => {
        setIsLoadingVehicles(true);
        console.log("useOtherPlayerVehicles: Triggering vehicle fetch");
        fetchOtherVehicles().then((fetchedVehicles) => {
            setVehicles(fetchedVehicles);
            setIsLoadingVehicles(false);
            console.log(`useOtherPlayerVehicles: Loaded ${fetchedVehicles.length} other vehicles`);
        });
    }, [isLoggedIn]);

    return { vehicles, errorMessage, isLoadingVehicles };
};