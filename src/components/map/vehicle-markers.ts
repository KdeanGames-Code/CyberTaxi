// src/components/map/vehicle-markers.ts - Modular Vehicle Markers with CSS Classes
import L from "leaflet";

interface Vehicle {
    id: string;
    status: "active" | "parked" | "garage" | "new";
    coords: [number, number];
    dest?: [number, number];
    wear: number;
    battery: number;
}

// Mock data for testing (from mockup RouteMapping.js)
const mockVehicles: Vehicle[] = [
    {
        id: "CT-001",
        status: "active",
        coords: [30.226232, -97.815155],
        dest: [30.284593, -97.734812],
        wear: 15,
        battery: 80,
    },
    {
        id: "CT-002",
        status: "active",
        coords: [30.267153, -97.74306],
        dest: [30.194528, -97.669872],
        wear: 20,
        battery: 60,
    },
    {
        id: "CT-003",
        status: "garage",
        coords: [30.2672, -97.7431],
        wear: 30,
        battery: 40,
    },
    {
        id: "CT-004",
        status: "new",
        coords: [30.2673, -97.743],
        wear: 0,
        battery: 100,
    },
    {
        id: "CT-005",
        status: "active",
        coords: [30.2668, -97.7665],
        dest: [30.2723, -97.7457],
        wear: 10,
        battery: 90,
    },
    {
        id: "CT-006",
        status: "active",
        coords: [30.2496, -97.7474],
        dest: [30.2711, -97.7409],
        wear: 12,
        battery: 35,
    },
    {
        id: "CT-007",
        status: "parked",
        coords: [30.2478, -97.7495],
        wear: 12,
        battery: 85,
    },
    {
        id: "CT-008",
        status: "active",
        coords: [30.2671, -97.7432],
        dest: [30.2668, -97.7665],
        wear: 47,
        battery: 80.9,
    },
    {
        id: "CT-009",
        status: "garage",
        coords: [30.267, -97.7433],
        wear: 65,
        battery: 25,
    },
];

export function createVehicleMarker(vehicle: Vehicle): L.Marker {
    const statusClass = `${vehicle.status}-marker`; // Dynamic class based on status

    const iconHtml = `<div class="custom-marker ${statusClass}"></div>`;

    const marker = L.marker(vehicle.coords, {
        icon: L.divIcon({
            html: iconHtml,
            iconSize: [15, 15],
            iconAnchor: [7.5, 7.5],
            popupAnchor: [0, -7.5],
            className: "custom-marker",
        }),
    }).bindPopup(`CyberTaxi ${vehicle.id}<br>Status: ${vehicle.status}`, {
        className: "custom-popup",
    });

    return marker;
}

// Export mock data for testing
export { mockVehicles };
