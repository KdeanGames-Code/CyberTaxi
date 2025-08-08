/**
 * TopMenu.tsx - Renders the top menu bar for CyberTaxi game.
 * Includes logo, stats, energy bar, and help button to toggle About window, per GDD v1.1.
 * @module TopMenu
 * @version 0.2.8
 */

import React, { useEffect, useRef } from "react";
import "../styles/global.css";

/**
 * TopMenu component renders the top menu bar with logo, stats, energy bar, and help button.
 * @returns {JSX.Element} Top menu bar.
 */
export const TopMenu: React.FC = () => {
    const topMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const logo = topMenuRef.current?.querySelector(".fa-taxi.logo");
        const helpButton = topMenuRef.current?.querySelector(".help");

        const handleLogoClick = (e: Event) => {
            e.preventDefault();
            const mouseEvent = e as MouseEvent;
            console.log(
                `Left-click on Taxi icon at x:${mouseEvent.clientX}, y:${mouseEvent.clientY}`
            );
            const event = new CustomEvent("click-taxi", {
                detail: { x: mouseEvent.clientX, y: mouseEvent.clientY },
                bubbles: true,
            });
            topMenuRef.current?.dispatchEvent(event);
            console.log("click-taxi dispatched");
        };

        const handleHelpClick = () => {
            if ((window as any).toggleAboutWindow) {
                (window as any).toggleAboutWindow();
                console.log("Help button clicked to toggle About window");
            } else {
                console.error("toggleAboutWindow not defined");
            }
        };

        if (logo) {
            logo.addEventListener("click", handleLogoClick);
        }
        if (helpButton) {
            helpButton.addEventListener("click", handleHelpClick);
        }

        return () => {
            if (logo) {
                logo.removeEventListener("click", handleLogoClick);
            }
            if (helpButton) {
                helpButton.removeEventListener("click", handleHelpClick);
            }
        };
    }, []);

    return (
        <div
            className="top-menu"
            role="banner"
            aria-label="Game status and controls"
            ref={topMenuRef}
        >
            <i
                className="fas fa-taxi logo"
                role="img"
                aria-label="CyberTaxi Logo"
            ></i>
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
                <div className="help" role="button" aria-label="Help menu">
                    ?
                </div>
            </div>
        </div>
    );
};
