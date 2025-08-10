/**
 * CyberFooter.tsx - Renders bottom menu with globe icon for CyberBrowser access.
 * Supports left-click and right-click context menu to open CyberBrowser, per GDD v1.1.
 * @module CyberFooter
 * @version 0.2.5
 */
import React, { useState, useEffect, useRef } from "react";
import "../../styles/global.css";

/**
 * Props for the CyberFooter component (none required).
 * @interface CyberFooterProps
 */
interface CyberFooterProps {}

/**
 * Renders a bottom menu with a centered globe icon and context menu.
 * Left-click or right-click menu options open CyberBrowser to specific pages.
 * @returns JSX.Element - Footer with globe icon and context menu.
 */
export const CyberFooter: React.FC<CyberFooterProps> = () => {
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement>(null);

    /**
     * Opens CyberBrowser to a specific page via custom event.
     * @param page - Page to open ("tesla", "realtor", "agency").
     */
    const handleGlobeClick = (
        page: "tesla" | "realtor" | "agency" = "tesla"
    ) => {
        const event = new CustomEvent("open-cyber-browser", {
            detail: { page },
            bubbles: false,
            cancelable: true,
        });
        document.dispatchEvent(event);
        console.log(`Globe clicked: Open CyberBrowser to ${page} page`);
        setShowContextMenu(false);
    };

    /**
     * Opens context menu on right-click.
     * @param e - Mouse event.
     */
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const windowHeight = window.innerHeight;
        const menuHeight = 120; // Approximate context menu height with 3 options
        const y =
            e.clientY > windowHeight - menuHeight
                ? e.clientY - menuHeight
                : e.clientY;
        setMenuPosition({ x: e.clientX, y });
        setShowContextMenu(true);
        console.log("Right-click menu opened at", { x: e.clientX, y });
    };

    /**
     * Closes context menu on outside click.
     */
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
            className="cyber-footer"
            role="contentinfo"
            aria-label="Footer navigation"
        >
            <i
                className="fas fa-globe footer-icon"
                onClick={() => handleGlobeClick()}
                onContextMenu={handleContextMenu}
                role="button"
                aria-label="Open CyberBrowser"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        handleGlobeClick();
                    }
                }}
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
                        onClick={() => handleGlobeClick("tesla")}
                    >
                        Tesla
                    </div>
                    <div
                        className="menu-item"
                        role="menuitem"
                        onClick={() => handleGlobeClick("realtor")}
                    >
                        Real Estate
                    </div>
                    <div
                        className="menu-item"
                        role="menuitem"
                        onClick={() => handleGlobeClick("agency")}
                    >
                        Employment Agency
                    </div>
                </div>
            )}
        </div>
    );
};
