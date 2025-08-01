/**
 * CyberFooter.tsx - Renders bottom menu with globe icon for CyberBrowser access.
 * Supports left-click and right-click context menu to open CyberBrowser.
 * @module CyberFooter
 */

import React, { useState, useEffect, useRef } from "react";

/**
 * Props for the CyberFooter component (none required).
 * @interface CyberFooterProps
 */
interface CyberFooterProps {}

/**
 * CyberFooter component renders a bottom menu with a centered globe icon.
 * Left-click or right-click "Tesla" option opens CyberBrowser, per GDD v1.1.
 * @returns {JSX.Element} Bottom menu with globe icon and context menu.
 */
export const CyberFooter: React.FC<CyberFooterProps> = () => {
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement>(null);

    // Toggle CyberBrowser on globe click or Tesla selection
    const handleGlobeClick = () => {
        (window as any).toggleCyberBrowser?.();
        console.log("Globe clicked: Open CyberBrowser");
        setShowContextMenu(false); // Close context menu
    };

    // Open context menu on right-click
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const windowHeight = window.innerHeight;
        const menuHeight = 80; // Approximate context menu height
        const y =
            e.clientY > windowHeight - menuHeight
                ? e.clientY - menuHeight
                : e.clientY;
        setMenuPosition({ x: e.clientX, y });
        setShowContextMenu(true);
        console.log("Right-click menu opened at", { x: e.clientX, y });
    };

    // Close context menu
    const handleMenuClose = () => {
        setShowContextMenu(false);
        console.log("Context menu closed");
    };

    // Close context menu on outside click
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                setShowContextMenu(false);
                console.log("Context menu closed by outside click");
            }
        };

        if (showContextMenu) {
            document.addEventListener("click", handleOutsideClick);
        }

        return () => {
            document.removeEventListener("click", handleOutsideClick);
        };
    }, [showContextMenu]);

    return (
        <div
            className="bottom-menu"
            role="contentinfo"
            aria-label="Footer navigation"
        >
            <i
                className="fas fa-globe footer-icon"
                onClick={handleGlobeClick}
                onContextMenu={handleContextMenu}
                role="button"
                aria-label="Open CyberBrowser"
            ></i>
            {showContextMenu && (
                <div
                    className="context-menu"
                    style={{
                        top: `${menuPosition.y}px`,
                        left: `${menuPosition.x}px`,
                    }}
                    role="menu"
                    aria-label="Browser shortcuts"
                    ref={menuRef}
                >
                    <div
                        className="menu-item"
                        role="menuitem"
                        onClick={handleGlobeClick}
                    >
                        Tesla
                    </div>
                    <div
                        className="menu-item"
                        role="menuitem"
                        onClick={handleMenuClose}
                    >
                        Real Estate
                    </div>
                </div>
            )}
        </div>
    );
};
