// src/components/ui/AboutPortal.tsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { AboutWindow } from "./AboutWindow";

export const AboutPortal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        console.log("About window toggled:", !isOpen);
    };

    // Expose toggle function to global scope for TopMenu.ts
    (window as any).toggleAboutWindow = handleToggle;

    return isOpen
        ? createPortal(
              <AboutWindow onClose={() => setIsOpen(false)} />,
              document.getElementById("about-portal")!
          )
        : null;
};
