/**
 * AboutPortal.tsx - Manages React portal for rendering AboutWindow near TopMenu "?" icon.
 * Toggles visibility and positions window dynamically on the right side of the screen.
 * @module AboutPortal
 */

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AboutWindow } from "./AboutWindow";

/**
 * Props for the AboutPortal component (none required).
 * @interface AboutPortalProps
 */
interface AboutPortalProps {}

/**
 * AboutPortal component renders AboutWindow in a portal, positioned near the "?" icon on the right side.
 * Exposes toggle function globally for TopMenu.ts to control visibility.
 * @returns {JSX.Element | null} Portal with AboutWindow or null if closed.
 */
export const AboutPortal: React.FC<AboutPortalProps> = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({
        top: "50px",
        left: "calc(100% - 340px)",
        zIndex: 2000,
    });

    // Toggle About window and position near "?" icon, anchored to right side
    const handleToggle = () => {
        if (!isOpen) {
            const helpButton = document.querySelector(".help");
            if (helpButton) {
                const rect = helpButton.getBoundingClientRect();
                setPosition({
                    top: `${rect.bottom + 5}px`,
                    left: "calc(100% - 340px)",
                    zIndex: 2000,
                });
                console.log("Positioned About window at", {
                    top: rect.bottom + 5,
                    left: "calc(100% - 340px)",
                    zIndex: 2000,
                });
            }
        }
        setIsOpen(!isOpen);
        console.log("About window toggled:", !isOpen);
    };

    // Expose toggle function to global scope for TopMenu.ts
    useEffect(() => {
        (window as any).toggleAboutWindow = handleToggle;
        return () => {
            delete (window as any).toggleAboutWindow;
        };
    }, []);

    return isOpen
        ? createPortal(
              <AboutWindow onClose={() => setIsOpen(false)} style={position} />,
              document.getElementById("about-portal")!
          )
        : null;
};
