/**
 * TopMenu.tsx - Renders the top menu bar for CyberTaxi game.
 * Includes logo, stats, energy bar, and help button to toggle About window, per GDD v1.1.
 * @module TopMenu
 * @version 0.2.23
 */
import React from "react";
import "../../styles/global.css";

/**
 * Props for the TopMenu component.
 * @interface TopMenuProps
 */
interface TopMenuProps {
    onTaxiClick?: (x: number, y: number) => void; // Callback for taxi icon click
}

/**
 * TopMenu component renders the top menu bar with logo, stats, energy bar, and help button.
 * @param props - Component props.
 * @returns {JSX.Element} Top menu bar.
 */
export const TopMenu: React.FC<TopMenuProps> = ({ onTaxiClick }) => {
    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(
            `Left-click on Taxi icon at x:${e.clientX}, y:${e.clientY}`
        );
        if (onTaxiClick) {
            onTaxiClick(e.clientX, e.clientY);
            console.log("click-taxi dispatched via onTaxiClick");
        } else {
            console.warn("onTaxiClick prop not provided");
        }
    };

    const handleHelpClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if ((window as any).toggleAboutWindow) {
            (window as any).toggleAboutWindow();
            console.log("Help button clicked to toggle About window");
        } else {
            console.error("toggleAboutWindow not defined");
        }
    };

    return (
        <div
            className="top-menu"
            role="banner"
            aria-label="Game status and controls"
            style={{ zIndex: 1000, pointerEvents: "auto" }} // Match global.css z-index
        >
            <button
                className="taxi-logo-button"
                onClick={handleLogoClick}
                aria-label="CyberTaxi Logo"
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    pointerEvents: "auto",
                }}
            >
                <i className="fas fa-taxi logo" role="img"></i>
            </button>
            <div
                className="stats-container"
                role="region"
                aria-label="Player statistics"
            >
                <div className="stats">
                    <div className="stat-item" aria-label="Bank balance">
                        <span>Bank</span>
                        <span>$10,000</span>
                    </div>
                    <div className="stat-item" aria-label="Player score">
                        <span>Score</span>
                        <span>500</span>
                    </div>
                </div>
            </div>
            <div
                className="energy-help"
                role="region"
                aria-label="Energy and help"
            >
                <div className="energy">
                    <span>Energy</span>
                    <div
                        className="energy-bar"
                        role="progressbar"
                        aria-valuenow={75}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Energy level"
                    >
                        <div
                            className="energy-fill"
                            style={{ width: "75%" }}
                        ></div>
                    </div>
                </div>
                <div
                    className="help"
                    role="button"
                    aria-label="Help menu"
                    onClick={handleHelpClick}
                    style={{ pointerEvents: "auto" }}
                >
                    ?
                </div>
            </div>
        </div>
    );
};
