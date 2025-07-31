// src/components/map/garage-markers.ts
import L from "leaflet";

export interface Garage {
    id: string;
    name: string;
    coords: [number, number];
    capacity: number;
    type: "garage" | "lot";
}

const mockGarages: Garage[] = [
    {
        id: "G-001",
        name: "Kevin-Dean Garage",
        coords: [30.2672, -97.7431],
        capacity: 5,
        type: "garage",
    },
];

export function createGarageMarker(garage: Garage): L.Marker {
    const iconHtml = `<div style="background: #00A3E0; width: 20px; height: 20px; border: 2px solid #005566; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);"></div>`;

    const marker = L.marker(garage.coords, {
        icon: L.divIcon({
            html: iconHtml,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10],
            className: "garage-marker",
        }),
    }).bindPopup(
        `${garage.type === "garage" ? "Garage" : "Lot"}: ${
            garage.name
        }<br>Capacity: ${garage.capacity}`,
        { className: "custom-popup" }
    );

    return marker;
}

export { mockGarages };
