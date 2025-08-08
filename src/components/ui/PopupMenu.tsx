/**
 * PopupMenu.tsx - Renders a dynamic context menu for CyberTaxi UI.
 * Used by CyberFooter.tsx (globe click) and TopMenu.ts (Taxi click) with customizable menu items.
 * @module PopupMenu
 * @version 0.2.7
 */

import React, { useEffect, useRef } from "react";
import "../../styles/windows.css";

/**
 * Props for the PopupMenu component.
 * @interface PopupMenuProps
 * @property {{ x: number; y: number }} position - Mouse coordinates for menu placement.
 * @property {{ label: string; action: string }[]} items - Menu items with labels and actions.
 * @property {string} context - Context identifier (e.g., 'footer', 'top-menu').
 * @property {() => void} onClose - Callback to close the menu.
 * @property {(action: string) => void} onItemSelect - Callback for item selection.
 */
interface PopupMenuProps {
    position: { x: number; y: number };
    items: { label: string; action: string }[];
    context: string;
    onClose: () => void;
    onItemSelect: (action: string) => void;
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
    onItemSelect,
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    /**
     * Closes menu on outside click.
     */
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                console.log(`PopupMenu closed for ${context}: outside click`);
                onClose();
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        console.log(
            `PopupMenu opened for ${context} at x:${position.x}, y:${position.y}`
        );
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [context, onClose, position]);

    /**
     * Handles menu item click.
     * @param {string} action - Action associated with the menu item.
     */
    const handleItemClick = (action: string) => {
        console.log(`Menu item clicked for ${context}: ${action}`);
        onItemSelect(action);
        onClose();
    };

    return (
        <div
            className="context-menu"
            style={{ top: position.y, left: position.x }}
            ref={menuRef}
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
