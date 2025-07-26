// src/main.ts
import "./styles/global.css"; // Import global CSS
import { createTopMenu } from "./components/TopMenu.ts";
import L from "leaflet"; // Import Leaflet

document.addEventListener("DOMContentLoaded", () => {
    const app = document.querySelector("#app");
    if (app) {
        app.innerHTML = `
      <div class="main-container" role="main" aria-label="Main game container">
        <div id="top-menu-container" aria-hidden="true"></div> /* Row 1 for top menu */
        <div id="map-area" aria-label="Map area placeholder"></div> /* Row 2 for map */
        <div class="bottom-header" aria-label="Footer">© 2025 CyberTaxi Team</div> /* Row 3 for footer */
      </div>
    `;
        const topMenuContainer = app.querySelector("#top-menu-container");
        if (topMenuContainer) {
            topMenuContainer.appendChild(createTopMenu());
        }
        // Initialize Leaflet map
        const map = L.map("map-area", {
            zoomControl: false,
        }).setView([30.2672, -97.7431], 12); // Austin, TX
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
        }).addTo(map);
        map.invalidateSize(); // Size fix
    } else {
        console.error("App element not found in document");
    }
});
