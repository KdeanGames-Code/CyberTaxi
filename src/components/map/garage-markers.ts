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
        coords: [30.2673, -97.7431],
        capacity: 5,
        type: "garage",
    }, // Offset lat by 0.0001
];

export function createGarageMarker(garage: Garage): L.Marker {
    const iconHtml = `<div style="background: #00A3E0; width: 20px; height: 20px; border: 2px solid #005566; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);"></div>`;

    const marker = L.marker(garage.coords, {
        icon: L.divIcon({
            html: iconHtml,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -15],
            className: "garage-marker",
        }),
        zIndexOffset: 1000, // Higher z-index to prioritize clicks
    }).bindPopup(
        `${garage.type === "garage" ? "Garage" : "Lot"}: ${
            garage.name
        }<br>Capacity: ${garage.capacity}`,
        { className: "custom-popup", offset: [0, -15], autoPan: true }
    );

    // Prioritize garage marker click
    marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e); // Prevent cluster click
        marker.openPopup();
        console.log(`Garage marker ${garage.id} clicked, opening popup`);
    });

    return marker;
}

export { mockGarages };
