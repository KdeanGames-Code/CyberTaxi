/**
 * PopupMenu.tsx - Renders a context menu for CyberTaxi UI.
 * Supports top-menu and footer contexts with dynamic items, per GDD v1.1.
 * @module PopupMenu
 * @version 0.2.9
 */
import React, { useEffect, useRef } from "react";
import "../../styles/global.css";

/**
 * Props for the PopupMenu component.
 * @interface PopupMenuProps
 */
interface PopupMenuProps {
    position: { x: number; y: number }; // Menu position
    items: { label: string; action: string }[]; // Menu items
    context: "footer" | "top-menu"; // Menu context
    onClose: () => void; // Callback for closing the menu
    onItemSelect: (action: string) => void; // Callback for item selection
}

/**
 * Renders a context menu with dynamic items based on context.
 * @param props - Component props.
 * @returns JSX.Element - Context menu.
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
                console.log(`PopupMenu closed by outside click for ${context}`);
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
    }, [context, position, onClose]);

    /**
     * Handles item click.
     * @param action - Selected item action.
     */
    const handleItemClick = (action: string) => {
        console.log(`Menu item clicked for ${context}: ${action}`);
        onItemSelect(action);
        onClose();
    };

    return (
        <div
            className="context-menu"
            style={{ top: `${position.y}px`, left: `${position.x}px` }}
            ref={menuRef}
            role="menu"
            aria-label={`${context} context menu`}
        >
            {items.map((item) => (
                <div
                    key={item.action}
                    className="menu-item"
                    role="menuitem"
                    onClick={() => handleItemClick(item.action)}
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
