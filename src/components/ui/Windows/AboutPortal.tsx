// src/components/ui/Windows/AboutPortal.tsx
/**
 * @file AboutPortal.tsx
 * @description Manages React portal for rendering AboutWindow below top menu.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.3.11
 * @note Toggles visibility and positions window with draggable support, per GDD v1.1.
 * @detail Ensures portal container exists before rendering.
 */
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AboutWindow } from "./AboutWindow"; // Fixed to named import

/**
 * Props for the AboutPortal component (none required).
 * @interface AboutPortalProps
 */
interface AboutPortalProps {}

/**
 * AboutPortal component renders AboutWindow in a portal, positioned below top menu.
 * Exposes toggle function globally for MenuBar.tsx to control visibility.
 * Ensures portal container exists before rendering.
 * @returns {JSX.Element | null} Portal with AboutWindow or null if closed or container missing.
 */
export const AboutPortal: React.FC<AboutPortalProps> = () => {
    const [isOpen, setIsOpen] = useState(false);

    /**
     * Toggles the About window visibility.
     * @returns {void}
     */
    const handleToggle = () => {
        setIsOpen((prev) => {
            console.log(`About window toggled: ${!prev}`);
            return !prev;
        });
    };

    /**
     * Sets up global toggleAboutWindow function for MenuBar.tsx.
     * Cleans up on unmount to prevent memory leaks.
     */
    useEffect(() => {
        console.log("Setting toggleAboutWindow");
        (window as any).toggleAboutWindow = handleToggle;
        return () => {
            console.log("Cleaning up toggleAboutWindow");
            delete (window as any).toggleAboutWindow;
        };
    }, []); // Empty deps for single setup

    /**
     * Verifies portal container exists before rendering.
     * @returns {HTMLElement | null} Portal container element or null if not found.
     */
    const getPortalContainer = () => {
        const container = document.getElementById("about-portal");
        if (container) {
            console.log("About portal container verified");
        } else {
            console.error("About portal container #about-portal not found");
        }
        return container;
    };

    const container = getPortalContainer();
    if (!isOpen || !container) {
        return null;
    }

    return createPortal(
        <AboutWindow
            id="about-window"
            title="About CyberTaxi V 1.0"
            onClose={() => {
                setIsOpen(false);
                console.log("About window toggled: false");
            }}
            style={{ zIndex: 2000 }}
            initialPosition={{ top: 40, left: 400 }}
            defaultWidth={300}
            defaultHeight={410}
        />,
        container
    );
};