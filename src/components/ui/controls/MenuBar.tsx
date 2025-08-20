// src/components/ui/controls/MenuBar.tsx
/**
 * @file MenuBar.tsx
 * @description Top navigation bar component for CyberTaxi UI.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.11
 * @note Provides a fixed header with logo, stats (Bank before Score), energy bar, and help button.
 * @detail Fetches bankBalance and score from PlayerService, displays energy percentage, toggles AboutPortal.
 */
import React, { useState, useEffect } from "react";
import { PlayerService } from "../../../services/PlayerService";
import "../../../styles/ui/MenuBar.css";

/**
 * MenuBar component rendering the top navigation.
 * @param {Object} props - Component props.
 * @param {function} props.onTaxiClick - Handler for taxi icon click to open TaxiMenu.
 * @param {boolean} props.isLoggedIn - Login state from CyberMain.
 * @returns {JSX.Element} The rendered menu bar.
 * @description Uses a grid layout for logo, stats, and energy/help sections.
 */
const MenuBar = ({
    onTaxiClick,
    isLoggedIn,
}: {
    onTaxiClick: (e: React.MouseEvent) => void;
    isLoggedIn: boolean;
}) => {
    const [bankBalance, setBankBalance] = useState(50000); // Default placeholder
    const [score, setScore] = useState(1000); // Default placeholder
    const energy = 75; // Static placeholder energy percentage

    // Fetch player stats on mount and isLoggedIn change
    useEffect(() => {
        const fetchPlayerStats = async () => {
            if (!isLoggedIn || !localStorage.getItem("username")) {
                console.log("MenuBar: Skipping stats fetch, not logged in or no username");
                setBankBalance(50000);
                setScore(1000);
                return;
            }
            try {
                const stats = await PlayerService.getPlayerStats();
                setBankBalance(stats.bankBalance);
                setScore(stats.score);
                console.log("MenuBar: Fetched player stats:", stats);
            } catch (error) {
                console.error("MenuBar: Error fetching player stats:", error);
                setBankBalance(50000);
                setScore(1000);
            }
        };
        fetchPlayerStats();
    }, [isLoggedIn]);

    const handleHelpClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if ((window as any).toggleAboutWindow) {
            (window as any).toggleAboutWindow();
            console.log("MenuBar: Help button clicked to toggle AboutPortal");
        } else {
            console.error("MenuBar: toggleAboutWindow not defined");
        }
    };

    return (
        <div className="menu-bar">
            <i className="fas fa-taxi logo" onClick={onTaxiClick} />
            <div className="stats-container">
                <div className="stats">
                    <div className="stat-item">
                        <span>Bank</span>
                        <span>${bankBalance.toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                        <span>Score</span>
                        <span>{score.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div className="energy-help">
                <div className="energy">
                    <span>Energy</span>
                    <div className="energy-bar" role="progressbar" aria-valuenow={energy} aria-valuemin={0} aria-valuemax={100} aria-label="Energy level">
                        <div className="energy-fill" style={{ width: `${energy}%` }} />
                        <span className="energy-percentage">{energy}%</span>
                    </div>
                </div>
                <i className="fas fa-question help" onClick={handleHelpClick} />
            </div>
        </div>
    );
};

export default MenuBar;