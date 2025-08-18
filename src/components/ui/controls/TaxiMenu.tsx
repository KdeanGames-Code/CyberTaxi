// src/components/ui/controls/TaxiMenu.tsx
/**
 * @file TaxiMenu.tsx
 * @description Context menu component for CyberTaxi top menu (TaxiMenu) interactions.
  * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.2.20
 * @note Replaces PopupMenu with a top-menu-specific menu, supporting Login/Logout, Register, and Settings based on login state.
 * @detail Displays 'Logout, Settings' when logged in, 'Login, Register, Settings' when not. Includes Settings sub-menu with Reset Password on hover.
 */
import React, { useEffect, useRef, useState } from "react";
import "../../../styles/ui/PopupMenu.css"; // Corrected path

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
 * @description Displays Login, Register, Settings when logged out; Logout, Settings when logged in, with Reset Password sub-menu.
 */
export const TaxiMenu: React.FC<TaxiMenuProps> = ({
    isOpen,
    onClose,
    position,
    isLoggedIn,
    onItemSelect,
}) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [showSettingsSubMenu, setShowSettingsSubMenu] = useState(false);

    // Sync isLoggedIn with localStorage on mount
    useEffect(() => {
        const token = localStorage.getItem("jwt_token");
        if (token !== isLoggedIn.toString()) {
            console.log("TaxiMenu: Syncing isLoggedIn with localStorage, token:", !!token);
        }
    }, [isLoggedIn]);

    // Handle outside click to close menu
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                console.log("TaxiMenu closed by outside click");
                setShowSettingsSubMenu(false);
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
    const settingsSubMenuItems: MenuItem[] = [{ label: "Reset Password", action: "reset-password" }];

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
                    onMouseEnter={() => item.action === "settings" && setShowSettingsSubMenu(true)}
                    onMouseLeave={() => item.action === "settings" && setShowSettingsSubMenu(false)}
                    role="menuitem"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === "Enter" && onItemSelect(item.action) && onClose()}
                >
                    <div
                        onClick={() => {
                            console.log(`Clicked ${item.label}, action: ${item.action}`);
                            onItemSelect(item.action);
                            if (item.action !== "settings") onClose();
                        }}
                    >
                        {item.label}
                    </div>
                    {item.action === "settings" && showSettingsSubMenu && (
                        <div className="sub-menu" role="menu" aria-label="Settings sub-menu">
                            {settingsSubMenuItems.map((subItem, subIndex) => (
                                <div
                                    key={subIndex}
                                    className="sub-menu-item"
                                    onClick={() => {
                                        console.log(`Clicked ${subItem.label}, action: ${subItem.action}`);
                                        onItemSelect(subItem.action);
                                        onClose();
                                    }}
                                    role="menuitem"
                                    tabIndex={0}
                                    onKeyPress={(e) => e.key === "Enter" && onItemSelect(subItem.action) && onClose()}
                                >
                                    {subItem.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};