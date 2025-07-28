// src/components/map/vehicle-markers.ts - Modular Vehicle Markers with API Fetch
import L from "leaflet";

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

// Fallback data for testing (renamed from mockVehicles)
const fallbackVehicles: Vehicle[] = [
    {
        id: "CT-001",
        player_id: 1,
        status: "active",
        coords: [30.226232, -97.815155],
        dest: [30.284593, -97.734812],
        wear: 15,
        battery: 80,
        type: "Model Y",
    },
    {
        id: "CT-002",
        player_id: 1,
        status: "active",
        coords: [30.267153, -97.74306],
        dest: [30.194528, -97.669872],
        wear: 20,
        battery: 60,
        type: "Model Y",
    },
    {
        id: "CT-003",
        player_id: 1,
        status: "garage",
        coords: [30.2672, -97.7431],
        wear: 30,
        battery: 40,
        type: "Model X",
    },
    {
        id: "CT-004",
        player_id: 1,
        status: "new",
        coords: [30.2673, -97.743],
        wear: 0,
        battery: 100,
        type: "Model Y",
    },
    {
        id: "CT-005",
        player_id: 1,
        status: "active",
        coords: [30.2668, -97.7665],
        dest: [30.2723, -97.7457],
        wear: 10,
        battery: 90,
        type: "Model Y",
    },
    {
        id: "CT-006",
        player_id: 1,
        status: "active",
        coords: [30.2496, -97.7474],
        dest: [30.2711, -97.7409],
        wear: 12,
        battery: 35,
        type: "Model Y",
    },
    {
        id: "CT-007",
        player_id: 1,
        status: "parked",
        coords: [30.2478, -97.7495],
        wear: 12,
        battery: 85,
        type: "Model X",
    },
    {
        id: "CT-008",
        player_id: 1,
        status: "active",
        coords: [30.2671, -97.7432],
        dest: [30.2668, -97.7665],
        wear: 47,
        battery: 80.9,
        type: "Model Y",
    },
    {
        id: "CT-009",
        player_id: 1,
        status: "garage",
        coords: [30.267, -97.7433],
        wear: 65,
        battery: 25,
        type: "Model X",
    },
];

export function createVehicleMarker(vehicle: Vehicle): L.Marker {
    const statusClass = `${vehicle.status}-marker`;

    const iconHtml = `<div class="custom-marker ${statusClass}"></div>`;

    const marker = L.marker(vehicle.coords, {
        icon: L.divIcon({
            html: iconHtml,
            iconSize: [15, 15],
            iconAnchor: [7.5, 7.5],
            popupAnchor: [0, -7.5],
            className: "custom-marker",
        }),
    }).bindPopup(
        `CyberTaxi ${vehicle.id}<br>Status: ${
            vehicle.status
        }<br>Wear: ${vehicle.wear.toFixed(
            2
        )}%<br>Battery: ${vehicle.battery.toFixed(2)}%`,
        { className: "custom-popup" }
    );

    return marker;
}

export async function fetchVehicles(
    playerId: number,
    status?: string
): Promise<Vehicle[]> {
    try {
        const url = `/api/vehicles/${playerId}${
            status ? `?status=${status}` : ""
        }`;
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer your-jwt-token-here`, // Replace with actual token
            },
        });
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        return data.map((item: any) => ({
            id: item.id.toString(),
            player_id: item.player_id,
            type: item.type,
            status: item.status as "active" | "parked" | "garage" | "new",
            coords: [item.coords[0], item.coords[1]] as [number, number],
            dest: item.dest
                ? ([item.dest[0], item.dest[1]] as [number, number])
                : null,
            wear: item.wear,
            battery: item.battery,
            mileage: item.mileage,
            tire_mileage: item.tire_mileage,
            purchase_date: item.purchase_date,
            delivery_timestamp: item.delivery_timestamp,
            cost: item.cost,
            created_at: item.created_at,
            updated_at: item.updated_at,
        }));
    } catch (error) {
        console.error("Fetch /api/vehicles failed:", error);
        console.log("Using fallback data.");
        return fallbackVehicles;
    }
}

export { fallbackVehicles };
