// src/components/ui/CyberFooter.tsx
import React, { useState, useEffect, useRef } from "react";

export const CyberFooter: React.FC = () => {
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement>(null);

    const handleGlobeClick = () => {
        console.log("Globe clicked: Open CyberBrowser");
        setShowContextMenu(false); // Close menu on click
    };

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

    const handleMenuClose = () => {
        setShowContextMenu(false);
        console.log("Context menu closed");
    };

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
