/**
 * AboutPortal.tsx - Manages React portal for rendering AboutWindow below top menu.
 * Toggles visibility and positions window with draggable support.
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
 * AboutPortal component renders AboutWindow in a portal, positioned below top menu.
 * Exposes toggle function globally for TopMenu.ts to control visibility.
 * @returns {JSX.Element | null} Portal with AboutWindow or null if closed.
 */
export const AboutPortal: React.FC<AboutPortalProps> = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Toggle About window
    const handleToggle = () => {
        setIsOpen(!isOpen);
        console.log("About window toggled:", !isOpen);
    };

    // Expose toggle function to global scope for TopMenu.ts
    useEffect(() => {
        console.log("Setting toggleAboutWindow");
        (window as any).toggleAboutWindow = handleToggle;
        return () => {
            console.log("Cleaning up toggleAboutWindow");
            delete (window as any).toggleAboutWindow;
        };
    }, []); // Empty deps to ensure single setup

    return isOpen
        ? createPortal(
              <AboutWindow
                  onClose={() => {
                      setIsOpen(false);
                      console.log("About window toggled: false");
                  }}
                  style={{ zIndex: 2000 }}
                  initialPosition={{ top: 40, left: 400 }}
              />,
              document.getElementById("about-portal")!
          )
        : null;
};
