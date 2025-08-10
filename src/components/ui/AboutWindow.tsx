/**
 * AboutWindow.tsx - Displays CyberTaxi game credits in a non-resizable, draggable window.
 * Renders below top menu with a taxi icon, vehicle image, and team credits.
 * @module AboutWindow
 * @version 0.2.2
 */
import React from "react";
import { CyberWindow } from "./CyberWindow";
import "../../styles/windows.css";

/**
 * Props for the AboutWindow component.
 * @interface AboutWindowProps
 */
interface AboutWindowProps {
    onClose: () => void; // Callback to close the About window
    style?: React.CSSProperties; // Optional CSS styles for positioning
    initialPosition?: { top: number; left: number }; // Initial position for dragging
}

/**
 * AboutWindow component renders a cyberpunk-styled window with game credits.
 * Includes taxi icon, vehicle image, and developer credits per GDD v1.1.
 * @param {AboutWindowProps} props - Component props.
 * @returns {JSX.Element} Draggable window with About content.
 */
export const AboutWindow: React.FC<AboutWindowProps> = ({
    onClose,
    style,
    initialPosition,
}) => {
    return (
        <CyberWindow
            id="about-window"
            title="About CyberTaxi V 1.0"
            onClose={onClose}
            isResizable={false}
            style={style}
            initialPosition={initialPosition}
        >
            <div className="about-content">
                {/* Taxi icon and game title */}
                <div className="about-header">
                    <i className="fas fa-taxi" aria-label="CyberTaxi Logo"></i>
                    <h2>CyberTaxi: Own the Roads</h2>
                </div>
                {/* Vehicle image */}
                <img
                    src="src/assets/showroom/RoboCab-Showroom.jpg"
                    alt="RoboCab vehicle"
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
        </CyberWindow>
    );
};
