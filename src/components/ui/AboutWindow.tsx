/**
 * AboutWindow.tsx - Renders a non-resizable, draggable About window for CyberTaxi.
 * Displays game credits and vehicle image, per GDD v1.1.
 * @module AboutWindow
 * @version 0.2.1
 */

import React from "react";
import { Window } from "./Window";

/**
 * Props for the AboutWindow component.
 * @interface AboutWindowProps
 * @property {() => void} onClose - Callback to close the About window.
 * @property {React.CSSProperties} [style] - Optional CSS styles for positioning.
 * @property {{ top: number; left: number }} [initialPosition] - Initial position for dragging.
 */
interface AboutWindowProps {
    onClose: () => void;
    style?: React.CSSProperties;
    initialPosition?: { top: number; left: number };
}

/**
 * AboutWindow component renders a cyberpunk-styled About window with game credits.
 * Displays a vehicle image and static content.
 * @param {AboutWindowProps} props - Component props.
 * @returns {JSX.Element} Draggable About window.
 */
export const AboutWindow: React.FC<AboutWindowProps> = ({
    onClose,
    style,
    initialPosition,
}) => {
    return (
        <Window
            id="about-window"
            title="About CyberTaxi"
            onClose={onClose}
            isResizable={false}
            style={style}
            initialPosition={initialPosition}
        >
            <div className="about-content">
                <div className="about-header">
                    <i className="fa-solid fa-taxi" aria-hidden="true"></i>
                    <h2>CyberTaxi</h2>
                </div>
                <p>A game by Kevin-Dean Livingstone</p>
                <img
                    src="/vehicle-placeholder.png"
                    alt="Vehicle placeholder"
                    className="about-vehicle"
                />
                <p>Version 1.0 - Built with React and Leaflet</p>
            </div>
        </Window>
    );
};
