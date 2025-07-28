// src/components/map/map-tiles.ts - Modular Tile Layer with Error Handling
import L from "leaflet";

export function createTileLayer(style = "dark"): L.TileLayer {
    const customUrl = `http://localhost:3000/api/tiles/${style}/{z}/{x}/{y}.png`;
    const fallbackUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"; // Fallback if custom fails

    try {
        // Attempt custom tile layer
        const tileLayer = L.tileLayer(customUrl, {
            attribution: "Custom Tiles © CyberTaxi Team",
            maxZoom: 18,
            errorTileUrl: "", // Empty to handle errors without broken images
        });

        tileLayer.on("tileerror", (error) => {
            console.error("Custom tile load error:", error);
            // Switch to fallback on error
            tileLayer.setUrl(fallbackUrl);
            tileLayer.options.attribution =
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
        });

        return tileLayer;
    } catch (error) {
        console.error("Tile layer creation error:", error);
        // Fallback layer on init error
        return L.tileLayer(fallbackUrl, {
            attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
        });
    }
}
