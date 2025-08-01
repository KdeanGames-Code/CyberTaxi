/**
 * AboutPortal.tsx - Manages React portal for rendering AboutWindow below top menu.
 * Toggles visibility and positions window dynamically in the map area.
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
 * AboutPortal component renders AboutWindow in a portal, positioned below top menu and left-shifted.
 * Exposes toggle function globally for TopMenu.ts to control visibility.
 * @returns {JSX.Element | null} Portal with AboutWindow or null if closed.
 */
export const AboutPortal: React.FC<AboutPortalProps> = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Toggle About window and position below top menu
    const handleToggle = () => {
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
              <AboutWindow
                  onClose={() => {
                      setIsOpen(false);
                      console.log("About window toggled: false");
                  }}
                  style={{ top: "50px", left: "360px", zIndex: 2000 }}
              />,
              document.getElementById("about-portal")!
          )
        : null;
};
