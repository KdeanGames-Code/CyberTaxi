// src/components/ui/CyberFooter.tsx
import React, { useState } from "react";

export const CyberFooter: React.FC = () => {
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    const handleGlobeClick = () => {
        console.log("Globe clicked: Open CyberBrowser");
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setShowContextMenu(true);
        console.log("Right-click menu opened at", {
            x: e.clientX,
            y: e.clientY,
        });
    };

    const handleMenuClose = () => {
        setShowContextMenu(false);
        console.log("Context menu closed");
    };

    return (
        <div
            className="bottom-menu"
            role="contentinfo"
            aria-label="Footer navigation"
        >
            <i className="fas fa-bolt footer-logo" aria-label="Tesla logo"></i>
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
