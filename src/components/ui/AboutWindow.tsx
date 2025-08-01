/**
 * AboutWindow.tsx - Displays CyberTaxi game credits in a non-resizable, draggable window.
 * Renders near the TopMenu "?" icon with a taxi icon, placeholder image, and team credits.
 * @module AboutWindow
 */

import React from "react";
import { Window } from "./Window";

/**
 * Props for the AboutWindow component.
 * @interface AboutWindowProps
 * @property {() => void} onClose - Callback to close the About window.
 */
interface AboutWindowProps {
    onClose: () => void;
}

/**
 * AboutWindow component renders a cyberpunk-styled window with game credits.
 * Includes taxi icon, vehicle image, and developer credits per GDD v1.1.
 * @param {AboutWindowProps} props - Component props.
 * @returns {JSX.Element} Draggable window with About content.
 */
export const AboutWindow: React.FC<AboutWindowProps> = ({ onClose }) => {
    return (
        <Window
            id="about-window"
            title="About CyberTaxi V 1.0"
            onClose={onClose}
            isResizable={false}
            // Position near TopMenu "?" icon (top-right)
            style={{ top: "50px", left: "calc(100% - 340px)" }}
        >
            <div className="about-content">
                {/* Taxi icon and game title */}
                <div className="about-header">
                    <i className="fas fa-taxi" aria-label="CyberTaxi Logo"></i>
                    <h2>CyberTaxi: Own the Roads</h2>
                </div>
                {/* Vehicle placeholder image */}
                <img
                    src="public/vehicle-placeholder.png"
                    alt="CyberTaxi vehicle"
                    className="about-vehicle"
                />
                {/* Developer credits */}
                <p>Kevin-Dean Livingstone - Game Developer</p>
                <p>Crafted with wisdom by Grok, created by xAI.</p>

                {/* Copyright notice */}
                <p>
                    CyberTaxi: Own the Roads.
                    <br /> Copyright 2025 All rights reserved.
                </p>
                <p>CyberTaxi Team</p>
            </div>
        </Window>
    );
};
