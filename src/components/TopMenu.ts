/**
 * TopMenu.ts - Creates the top menu bar for CyberTaxi game.
 * Includes logo, stats, energy bar, and help button to toggle About window.
 * @module TopMenu
 * @version 0.2.5
 */

/**
 * Creates the top menu element with logo, stats, energy bar, and help button.
 * @returns {HTMLDivElement} The top menu container.
 */
export function createTopMenu(): HTMLDivElement {
    const topMenu = document.createElement("div");
    topMenu.className = "top-menu";
    topMenu.setAttribute("role", "banner");
    topMenu.setAttribute("aria-label", "Game status and controls");
    topMenu.innerHTML = `
    <i class="fas fa-taxi logo" role="img" aria-label="CyberTaxi Logo"></i>
    <div class="stats-container" role="region" aria-label="Player statistics">
      <div class="stats">
        <div class="stat-item" aria-label="Bank balance">
          <span>Bank</span><span>$10,000</span>
        </div>
        <div class="stat-item" aria-label="Player score">
          <span>Score</span><span>500</span>
        </div>
      </div>
    </div>
    <div class="energy-help" role="region" aria-label="Energy and help">
      <div class="energy">
        <span>Energy</span>
        <div class="energy-bar" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" aria-label="Energy level">
          <div class="energy-fill" style="width: 75%;"></div>
        </div>
      </div>
      <div class="help" role="button" aria-label="Help menu">?</div>
    </div>
  `;

    // Add right-click handler for Taxi logo
    const logo = topMenu.querySelector(".fa-taxi.logo") as HTMLElement;
    if (logo) {
        logo.addEventListener("contextmenu", (e: MouseEvent) => {
            e.preventDefault();
            console.log(
                `Right-click on Taxi icon at x:${e.clientX}, y:${e.clientY}`
            );
            const event = new CustomEvent("contextmenu-taxi", {
                detail: { x: e.clientX, y: e.clientY },
                bubbles: true,
            });
            topMenu.dispatchEvent(event);
            console.log("contextmenu-taxi dispatched");
        });
    }

    // Add click handler for help button to toggle About window
    const helpButton = topMenu.querySelector(".help");
    if (helpButton) {
        helpButton.addEventListener("click", () => {
            if ((window as any).toggleAboutWindow) {
                (window as any).toggleAboutWindow();
                console.log("Help button clicked to toggle About window");
            } else {
                console.error("toggleAboutWindow not defined");
            }
        });
    }

    return topMenu;
}
