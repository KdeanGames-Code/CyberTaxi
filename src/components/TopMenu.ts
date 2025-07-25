// src/components/TopMenu.ts
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

    return topMenu;
}
