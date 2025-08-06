/**
 * vehicle-markers.ts - Creates vehicle markers for CyberTaxi map.
 * Applies grey filter to markers until player is logged in, per GDD v1.1.
 * Uses .custom-marker, .active-marker, .new-marker, .parked-marker, .vehicle-marker-greyed from vehicles.css.
 * @module VehicleMarkers
 * @version 0.2.8
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
 * Creates a vehicle marker with grey filter if not logged in.
 * Uses .custom-marker, .active-marker (fare), .new-marker (new), .parked-marker (parked/charging), .vehicle-marker-greyed (other players) from vehicles.css.
 * @param {Vehicle} vehicle - Vehicle data.
 * @returns {L.Marker} Leaflet marker.
 */
export function createVehicleMarker(vehicle: Vehicle): L.Marker {
    const isLoggedIn = !!localStorage.getItem("jwt_token");
    console.log(
        `Applying ${isLoggedIn ? "normal" : "grey"} filter to vehicle ${
            vehicle.id
        }`
    );
    const statusClass = `${vehicle.status}-marker`;
    const greyClass = isLoggedIn ? "" : " vehicle-marker-greyed";
    const iconHtml = `<div class="custom-marker ${statusClass}${greyClass}"></div>`;
    const marker = L.marker(vehicle.coords, {
        icon: L.divIcon({
            html: iconHtml,
            iconSize: [15, 15],
            iconAnchor: [7.5, 7.5],
            popupAnchor: [0, -7.5],
            className: "",
        }),
        zIndexOffset: 1000, // Ensure above tiles
        pane: "markerPane", // Explicitly use marker pane
    }).bindPopup(
        `CyberTaxi ${vehicle.id}<br>Type: ${vehicle.type}<br>Status: ${
            vehicle.status
        }<br>Wear: ${vehicle.wear.toFixed(
            2
        )}%<br>Battery: ${vehicle.battery.toFixed(2)}%`,
        { className: "custom-popup" }
    );
    console.log(
        `Marker created for ${vehicle.id} with classes: custom-marker ${statusClass}${greyClass}`
    );
    return marker;
}
