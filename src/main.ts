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
        const mainContainer = app.querySelector(".main-container");
        if (mainContainer) {
            mainContainer.insertBefore(
                createTopMenu(),
                mainContainer.firstChild
            );
        } else {
            console.error("Main container not found");
        }
    } else {
        console.error("App element not found in document");
    }
});
