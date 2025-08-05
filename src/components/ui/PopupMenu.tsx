/**
 * PopupMenu.tsx - Renders a dynamic context menu for CyberTaxi UI.
 * Used by CyberFooter.tsx (globe click) and TopMenu.ts (right-click Tesla) with customizable menu items.
 * @module PopupMenu
 * @version 0.2.5
 */

import React, { useEffect } from "react";
import "../../styles/windows.css";

/**
 * Props for the PopupMenu component.
 * @interface PopupMenuProps
 * @property {{ x: number; y: number }} position - Mouse coordinates for menu placement.
 * @property {{ label: string; action: string }[]} items - Menu items with labels and actions.
 * @property {string} context - Context identifier (e.g., 'footer', 'top-menu').
 * @property {() => void} onClose - Callback to close the menu.
 * @property {() => void} onOpenBrowser - Callback to open CyberBrowser.
 */
interface PopupMenuProps {
    position: { x: number; y: number };
    items: { label: string; action: string }[];
    context: string;
    onClose: () => void;
    onOpenBrowser: () => void;
}

/**
 * PopupMenu component renders a cyberpunk-styled context menu at specified coordinates.
 * Supports dynamic items, closes on item click or outside click, per GDD v1.1.
 * @param {PopupMenuProps} props - Component props.
 * @returns {JSX.Element} Context menu.
 */
export const PopupMenu: React.FC<PopupMenuProps> = ({
    position,
    items,
    context,
    onClose,
    onOpenBrowser,
}) => {
    // Handle outside click to close
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            const menu = document.querySelector(".context-menu");
            if (menu && !menu.contains(e.target as Node)) {
                console.log(`PopupMenu closed for ${context}: outside click`);
                onClose();
            }
        };

        document.addEventListener("click", handleOutsideClick);
        console.log(
            `PopupMenu opened for ${context} at x:${position.x}, y:${position.y}`
        );
        return () => {
            document.removeEventListener("click", handleOutsideClick);
        };
    }, [context, onClose, position]);

    // Handle menu item click
    const handleItemClick = (action: string) => {
        console.log(`Menu item clicked for ${context}: ${action}`);
        if (action === "open-tesla") {
            onOpenBrowser();
        } else if (action === "open-real-estate") {
            console.log("Real Estate action triggered (placeholder)");
        }
        onClose();
    };

    return (
        <div
            className="context-menu"
            style={{ top: position.y, left: position.x }}
            role="menu"
            aria-label={`Context menu for ${context}`}
        >
            {items.map((item) => (
                <div
                    key={item.action}
                    className="menu-item"
                    onClick={() => handleItemClick(item.action)}
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleItemClick(item.action);
                        }
                    }}
                >
                    {item.label}
                </div>
            ))}
        </div>
    );
};
