/**
 * PopupMenu.tsx - Renders the popup menu for CyberTaxi with context-sensitive items.
 * Displays top-menu (Logout, Settings) and footer menu (Tesla, Real Estate, Employment Agency) based on provided items, per GDD v1.1.
 * Matches the style and behavior of the CyberFooter right-click menu using .context-menu, including click-off closure.
 * @module PopupMenu
 * @version 0.2.15
 */
import React, { useEffect, useRef } from "react";
import "../../styles/windows.css"; // Using windows.css for .context-menu style

/**
 * Interface for menu item objects.
 * @interface MenuItem
 */
interface MenuItem {
    label: string;
    action: string;
}

/**
 * Props for the PopupMenu component.
 * @interface PopupMenuProps
 */
interface PopupMenuProps {
    isOpen: boolean;
    onClose: () => void;
    position: { x: number; y: number };
    context: "footer" | "top" | "top-menu";
    items: MenuItem[];
    onItemSelect: (action: string) => void;
}

/**
 * Renders the popup menu with context-sensitive items, styled and behaving like CyberFooter right-click menu.
 * @param props - Component props.
 * @returns JSX.Element - Popup menu UI.
 */
export const PopupMenu: React.FC<PopupMenuProps> = ({
    isOpen,
    onClose,
    position,
    context,
    items,
    onItemSelect,
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    // Handle outside click to close menu, matching CyberFooter behavior
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
        if (isOpen) {
            document.addEventListener("click", handleOutsideClick);
        }
        return () => {
            document.removeEventListener("click", handleOutsideClick);
        };
    }, [isOpen, onClose, context]);

    if (!isOpen) return null;

    return (
        <div
            className="context-menu" // Matches CyberFooter style
            style={{
                top: `${position.y}px`,
                left: `${position.x}px`,
                zIndex: 3000, // Matches CyberFooter context-menu z-index
            }}
            role="menu"
            aria-label={`${context} context menu`}
            ref={menuRef}
        >
            {items.map((item, index) => (
                <div
                    key={index}
                    className="menu-item"
                    style={{
                        padding: "8px",
                        cursor: "pointer",
                    }}
                    onClick={() => {
                        console.log(
                            `Clicked ${item.label}, action: ${item.action}`
                        );
                        onItemSelect(item.action);
                        onClose();
                    }}
                    role="menuitem"
                    tabIndex={0}
                    onKeyPress={(e) =>
                        e.key === "Enter" &&
                        onItemSelect(item.action) &&
                        onClose()
                    }
                >
                    {item.label}
                </div>
            ))}
        </div>
    );
};
