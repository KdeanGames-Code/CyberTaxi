// src/main.ts
import "./styles/global.css"; // Import global CSS
import { createTopMenu } from "./components/TopMenu.ts";
import L from "leaflet"; // Import Leaflet
import "leaflet/dist/leaflet.css"; // Leaflet CSS
import { createTileLayer } from "./components/map/map-tiles.ts"; // Custom tile layer
import {
    createVehicleMarker,
    fallbackVehicles,
} from "./components/map/vehicle-markers.ts"; // Markers and fallback data
import type { Vehicle } from "./components/map/vehicle-markers.ts"; // Type-only import for Vehicle
import "leaflet.markercluster/dist/MarkerCluster.css"; // Cluster CSS
import "leaflet.markercluster/dist/MarkerCluster.Default.css"; // Default cluster style
import "leaflet.markercluster"; // Side-effect import for cluster plugin

document.addEventListener("DOMContentLoaded", () => {
    const app = document.querySelector("#app");
    if (app) {
        app.innerHTML = `
      <div class="main-container" role="main" aria-label="Main game container">
        <div id="top-menu-container" aria-hidden="true"></div>
        <div id="map-area" aria-label="Map area placeholder"></div>
        <div class="bottom-header" aria-label="Footer">© 2025 CyberTaxi Team</div>
      </div>
    `;
        const mainContainer = app.querySelector(".main-container");
        if (mainContainer) {
            mainContainer.insertBefore(
                createTopMenu(),
                mainContainer.firstChild
            );
        }
        try {
            // Initialize Leaflet map
            const map = L.map("map-area", {
                zoomControl: false,
            }).setView([30.2672, -97.7431], 12); // Austin, TX
            createTileLayer("dark").addTo(map); // Custom dark style tiles
            map.invalidateSize(); // Size fix

            // Add vehicle markers with clustering
            const markerClusterGroup = L.markerClusterGroup({
                iconCreateFunction: function (cluster) {
                    const childCount = cluster.getChildCount();
                    return L.divIcon({
                        html: `<div style="background: #D4A017; color: #F5F5F5; border: 2px solid #E8B923; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">${childCount}</div>`,
                        className: "marker-cluster-custom",
                        iconSize: [30, 30],
                    });
                },
                maxClusterRadius: 50,
            });

            fallbackVehicles.forEach((vehicle: Vehicle) => {
                try {
                    const marker = createVehicleMarker(vehicle);
                    markerClusterGroup.addLayer(marker);
                } catch (error) {
                    console.error(
                        `Failed to create marker for ${vehicle.id}:`,
                        error
                    );
                }
            });

            map.addLayer(markerClusterGroup);
        } catch (error) {
            console.error("Map initialization failed:", error);
            console.log("Map failed to load; using placeholder.");
            document.getElementById("map-area")!.innerHTML =
                "<p>Map unavailable</p>";
        }
    } else {
        console.error("App element not found in document");
    }
});
