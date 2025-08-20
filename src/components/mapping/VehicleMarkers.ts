// src/components/mapping/VehicleMarkers.ts
/**
 * @file VehicleMarkers.ts
 * @description Creates vehicle markers for CyberTaxi map.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.3.3
 * @note Applies styles for player vehicles based on status (active, fare, parked, maintenance, cleaning, new) and non-player vehicles when logged out, per GDD v1.1.
 * @detail Uses .custom-marker, .active-marker, .parked-marker, .new-marker, .vehicle-marker-others from VehicleMarkers.css.
 */
import L from "leaflet";
import "../../styles/mapping/VehicleMarkers.css";

/**
 * Vehicle data structure.
 * @interface Vehicle
 */
export interface Vehicle {
    id: string;
    player_id: number;
    type: string;
    status: "active" | "fare" | "parked" | "maintenance" | "cleaning" | "new";
    coords: [number, number];
    dest?: [number, number] | null;
    wear: number;
    battery: number;
    mileage?: number;
    tire_mileage?: number;
    purchase_date?: string;
    delivery_timestamp?: string | null;
    cost?: number;
    created_at?: string;
    updated_at?: string;
}

/**
 * Extended MarkerOptions interface to include vehicleId.
 * @interface CustomMarkerOptions
 */
interface CustomMarkerOptions extends L.MarkerOptions {
    vehicleId?: string;
}

/**
 * Creates a vehicle marker for player or non-player vehicles.
 * Applies grey filter (.vehicle-marker-others) when logged out, otherwise uses status-based styles.
 * @param vehicle - Vehicle data.
 * @param type - Marker type ("player" or "other").
 * @returns {L.Marker} Configured marker.
 */
export function createVehicleMarker(
    vehicle: Vehicle,
    type: "player" | "other"
): L.Marker {
    console.log(`VehicleMarkers: Applying ${type} filter to vehicle ${vehicle.id}`);
    const statusClass = type === "player" ? 
        (vehicle.status === "active" || vehicle.status === "fare" ? "active-marker" :
         vehicle.status === "parked" || vehicle.status === "maintenance" || vehicle.status === "cleaning" ? "parked-marker" :
         "new-marker") : "vehicle-marker-others";
    const iconHtml = `<div class="custom-marker ${statusClass}"></div>`;
    const marker = L.marker(vehicle.coords, {
        icon: L.divIcon({
            html: iconHtml,
            iconSize: [15, 15],
            iconAnchor: [7.5, 7.5],
            popupAnchor: [0, -7.5],
            className: "",
        }),
        zIndexOffset: 1000, // Above tiles
        pane: "markerPane", // Explicit marker pane
        vehicleId: vehicle.id, // Store vehicleId for click events
    } as CustomMarkerOptions).bindPopup(
        `<b>${vehicle.type} (${
            type === "player" ? "Your Vehicle" : "Other Player"
        })</b><br>
        ID: ${vehicle.id}<br>
        Status: ${vehicle.status}<br>
        Battery: ${vehicle.battery}%<br>
        Mileage: ${vehicle.mileage || 0}`,
        { className: "custom-popup" }
    );
    console.log(
        `VehicleMarkers: Created marker for ${vehicle.id} with classes: custom-marker ${statusClass}`
    );
    return marker;
}