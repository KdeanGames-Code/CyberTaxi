// src/components/ui/Windows/About.tsx
/**
 * @file About.tsx
 * @description About window component for CyberTaxi, displaying game information.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.0
 * @note Renders a non-resizable, draggable window with game details, triggered by MenuBar help button.
 * @detail Uses BaseWindow for consistent styling, per GDD v1.1.
 */
import React from "react";
import { BaseWindow } from "./baseWindow";
import type { BaseWindowProps } from "./baseWindow";
import "../../../styles/ui/About.css";

/**
 * Props for About component.
 * @interface AboutProps
 * @extends {Omit<BaseWindowProps, "children">}
 */
interface AboutProps extends Omit<BaseWindowProps, "children"> {}

/**
 * Renders the About window with game information.
 * @param {AboutProps} props - Component props.
 * @returns {JSX.Element} The rendered About window.
 */
export const About: React.FC<AboutProps> = (props) => {
    return (
        <BaseWindow {...props} isResizable={false} isDraggable={true} zIndexBase={2000}>
            <div className="about-content">
                <h2>CyberTaxi</h2>
                <p>Version: 1.1.0</p>
                <p>Developed by: Kevin-Dean Livingstone & CyberTaxi Team</p>
                <p>Powered by: Grok, created by xAI</p>
                <p>Manage your fleet of autonomous taxis in a cyberpunk world!</p>
            </div>
        </BaseWindow>
    );
};
