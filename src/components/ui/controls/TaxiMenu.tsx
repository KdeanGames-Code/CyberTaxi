// src/components/ui/controls/TaxiMenu.tsx
/**
 * @file TaxiMenu.tsx
 * @description Context menu component for CyberTaxi top menu (TaxiMenu) interactions.
 * @author Kevin-Dean Livingstone & CyberTaxi Team
 * @version 0.2.18
 * @note Replaces PopupMenu with a top-menu-specific menu, supporting Login/Logout, Register, and Settings based on login state.
 */
import React, { useEffect, useRef } from "react";
import "../../../styles/PopupMenu.css"; // New stylesheet for TaxiMenu

/**
 * Interface for menu item objects.
 * @interface MenuItem
 */
interface MenuItem {
    label: string;
    action: string;
}

/**
 * Props for the TaxiMenu component.
 * @interface TaxiMenuProps
 */
interface TaxiMenuProps {
    isOpen: boolean;
    onClose: () => void;
    position: { x: number; y: number };
    isLoggedIn: boolean; // Determines menu items
    onItemSelect: (action: string) => void;
}

/**
 * Renders the TaxiMenu with context-sensitive items for the top menu.
 * @param props - Component props.
 * @returns {JSX.Element} The rendered TaxiMenu UI.
 * @description Displays Login, Register, Settings when logged out; Logout, Settings when logged in.
 */
export const TaxiMenu: React.FC<TaxiMenuProps> = ({
    isOpen,
    onClose,
    position,
    isLoggedIn,
    onItemSelect,
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    // Handle outside click to close menu
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                console.log("TaxiMenu closed by outside click");
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("click", handleOutsideClick);
        }
        return () => {
            document.removeEventListener("click", handleOutsideClick);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Dynamic items based on login state
    const menuItems: MenuItem[] = isLoggedIn
        ? [
              { label: "Logout", action: "logout" },
              { label: "Settings", action: "settings" },
          ]
        : [
              { label: "Login", action: "login" },
              { label: "Register", action: "register" },
              { label: "Settings", action: "settings" },
          ];

    return (
        <div
            className="context-menu taxi-menu"
            style={{
                top: `${position.y}px`,
                left: `${position.x}px`,
                zIndex: 3000,
            }}
            role="menu"
            aria-label="TaxiMenu context menu"
            ref={menuRef}
        >
            {menuItems.map((item, index) => (
                <div
                    key={index}
                    className="menu-item"
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
