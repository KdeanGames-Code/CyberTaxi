// src/main.ts
import "./styles/global.css"; // Import global CSS
import { createTopMenu } from "./components/TopMenu.ts";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createTileLayer } from "./components/map/map-tiles.ts"; // Import custom tile layer module

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
        // Initialize Leaflet map
        const map = L.map("map-area", {
            zoomControl: false,
        }).setView([30.2672, -97.7431], 12); // Austin, TX
        createTileLayer("dark").addTo(map); // Use custom dark style tiles
        map.invalidateSize(); // Size fix
    } else {
        console.error("App element not found in document");
    }
});
