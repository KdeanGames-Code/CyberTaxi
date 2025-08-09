/**
 * vehicle-markers.ts - Creates vehicle markers for CyberTaxi map.
 * Applies styles for player and non-player vehicles, per GDD v1.1.
 * Uses .custom-marker, .active-marker, .new-marker, .parked-marker, .vehicle-marker-others from vehicles.css.
 * @module VehicleMarkers
 * @version 0.3.1
 */
import L from "leaflet";

/**
 * Vehicle data structure.
 * @interface Vehicle
 */
export interface Vehicle {
    id: string;
    player_id: number;
    type: string;
    status: "active" | "parked" | "garage" | "new";
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
 * Applies grey filter (.vehicle-marker-others) for non-player vehicles when logged in.
 * @param vehicle - Vehicle data.
 * @param type - Marker type ("player" or "other").
 * @returns L.Marker - Configured marker.
 */
export function createVehicleMarker(
    vehicle: Vehicle,
    type: "player" | "other"
): L.Marker {
    console.log(`Applying ${type} filter to vehicle ${vehicle.id}`);
    const statusClass = `${vehicle.status}-marker`;
    const typeClass =
        type === "player" ? "vehicle-marker" : "vehicle-marker-others";
    const iconHtml = `<div class="custom-marker ${statusClass} ${typeClass}"></div>`;
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
        `Marker created for ${vehicle.id} with classes: custom-marker ${statusClass} ${typeClass}`
    );
    return marker;
}
