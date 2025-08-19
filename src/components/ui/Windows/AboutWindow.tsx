// src/components/ui/Windows/AboutWindow.tsx
/**
 * @file AboutWindow.tsx
 * @description About window component for CyberTaxi, displaying game credits.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.2.4
 * @note Renders a non-resizable, draggable window with game details, triggered by AboutPortal.
 * @detail Uses BaseWindow and About.css for consistent styling, per GDD v1.1.
 */
import React from "react";
import { BaseWindow } from "./baseWindow";
import type { BaseWindowProps } from "./baseWindow";
import "../../../styles/ui/About.css";

/**
 * Props for AboutWindow component.
 * @interface AboutWindowProps
 * @extends {Omit<BaseWindowProps, "children">}
 */
interface AboutWindowProps extends Omit<BaseWindowProps, "children"> {}

/**
 * Renders the About window with game credits.
 * @param {AboutWindowProps} props - Component props.
 * @returns {JSX.Element} Draggable window with About content.
 */
const AboutWindow: React.FC<AboutWindowProps> = (props) => {
    return (
        <BaseWindow {...props} isResizable={false} isDraggable={true} zIndexBase={2000}>
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
        </BaseWindow>
    );
};

export default AboutWindow; // Changed to default export to align with error