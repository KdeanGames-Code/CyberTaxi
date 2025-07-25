// src/main.ts
import "./styles/global.css"; // Import global CSS
import { createTopMenu } from "./components/TopMenu.ts";

document.addEventListener("DOMContentLoaded", () => {
    const app = document.querySelector("#app");
    if (app) {
        app.innerHTML = `
      <div class="main-container" role="main" aria-label="Main game container">
        <div id="map-area" aria-label="Map area placeholder">Map Placeholder</div>
        <div class="bottom-header" aria-label="Footer">© 2025 CyberTaxi Team</div>
      </div>
    `;
        // Append top menu to body for fixed positioning without grid conflict
        document.body.appendChild(createTopMenu());
    } else {
        console.error("App element not found in document");
    }
});
