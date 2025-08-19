// src/components/ui/controls/MenuBar.tsx
/**
 * @file MenuBar.tsx
 * @description Top navigation bar component for CyberTaxi UI.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.4
 * @note Provides a fixed header with logo, stats (Bank before Score), energy bar, and help button.
 * @detail Fetches bankBalance and score from PlayerService, supports future energy/help props.
 */
import React, { useState, useEffect } from "react";
import { PlayerService } from "../../../services/PlayerService";
import "../../../styles/ui/MenuBar.css";

/**
 * MenuBar component rendering the top navigation.
 * @param {Object} props - Component props.
 * @param {function} props.onTaxiClick - Handler for taxi icon click to open TaxiMenu.
 * @returns {JSX.Element} The rendered menu bar.
 * @description Uses a grid layout for logo, stats, and energy/help sections.
 */
const MenuBar = ({
    onTaxiClick,
}: {
    onTaxiClick: (e: React.MouseEvent) => void;
}) => {
    const [bankBalance, setBankBalance] = useState(50000); // Default placeholder
    const [score, setScore] = useState(1000); // Default placeholder

    // Fetch player stats on mount
    useEffect(() => {
        const fetchPlayerStats = async () => {
            try {
                const stats = await PlayerService.getPlayerStats();
                setBankBalance(stats.bankBalance);
                setScore(stats.score);
                console.log("MenuBar: Fetched player stats:", stats);
            } catch (error) {
                console.error("MenuBar: Error fetching player stats:", error);
            }
        };
        fetchPlayerStats();
    }, []);

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
                    <div className="energy-bar">
                        <div className="energy-fill" />
                    </div>
                </div>
                <i className="fas fa-question help" />
            </div>
        </div>
    );
};

export default MenuBar;
