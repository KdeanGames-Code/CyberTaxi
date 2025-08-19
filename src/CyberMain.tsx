// src/CyberMain.tsx
/**
 * @file CyberMain.tsx
 * @description Main entry point for CyberTaxi, defining the UI/UX layout with MenuBar, MapArea, and BottomMenu.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.2.21
 * @note Defines a three-row structure: MenuBar, MapArea, BottomMenu, with TaxiMenu and AboutPortal integration.
 * @detail Persists login state via localStorage, passes onTaxiClick to MenuBar.
 */
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { CyberError } from './utils/errorhandling/CyberError';
import './CyberGlobal.css'; // Base layout stylesheet
import MenuBar from './components/ui/controls/MenuBar'; // Default import
import { TaxiMenu } from './components/ui/controls/TaxiMenu';
import { AboutPortal } from './components/ui/Windows/AboutPortal';
import { LoginForm } from './components/ui/Windows/LoginForm';
import { BaseWindow } from './components/ui/Windows/baseWindow';
const MapArea = () => <div className="map-area">Map Area Placeholder</div>;
const BottomMenu = () => <div className="bottom-menu">Bottom Menu Placeholder</div>;

const CyberMain = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("jwt_token"));
    const [showLogin, setShowLogin] = useState(false);
    const [showTestWindow, setShowTestWindow] = useState(false);
    const [formMode, setFormMode] = useState<"login" | "register" | "reset">("login");

    // Sync isLoggedIn with localStorage on mount and storage changes
    useEffect(() => {
        const syncLoginState = () => {
            try {
                const token = localStorage.getItem("jwt_token");
                console.log("CyberMain: Syncing isLoggedIn, token:", !!token);
                setIsLoggedIn(!!token);
            } catch (error) {
                const cyberError = new CyberError("Failed to sync login state", 500);
                cyberError.log();
            }
        };
        syncLoginState();
        window.addEventListener("storage", syncLoginState);
        return () => {
            window.removeEventListener("storage", syncLoginState);
        };
    }, []);

    const handleTaxiClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPosition({ x: e.clientX, y: e.clientY });
        setIsOpen(true);
    };

    const handleItemSelect = (action: string) => {
        try {
            console.log(`Action selected: ${action}`);
            if (action === 'logout') {
                localStorage.removeItem("jwt_token");
                localStorage.removeItem("player_id");
                localStorage.removeItem("username");
                localStorage.removeItem("registerData");
                setIsLoggedIn(false);
                setShowLogin(false);
                console.log("CyberMain: Logged out, cleared localStorage");
            } else if (action === 'login') {
                setShowLogin(true);
                setFormMode('login');
            } else if (action === 'register') {
                setShowLogin(true);
                setFormMode('register');
            } else if (action === 'reset-password') {
                setShowLogin(true);
                setFormMode('reset');
            } else if (action === 'test') {
                setShowTestWindow(true);
            }
        } catch (error) {
            const cyberError = new CyberError(`Failed to handle action: ${action}`, 500);
            cyberError.log();
        }
        setIsOpen(false);
    };

    const handleLoginSuccess = () => {
        try {
            setIsLoggedIn(true);
            console.log("CyberMain: Login successful, isLoggedIn set to true");
        } catch (error) {
            const cyberError = new CyberError("Failed to handle login success", 500);
            cyberError.log();
        }
    };

    return (
        <div id="app" onClick={() => setIsOpen(false)}>
            <MenuBar onTaxiClick={handleTaxiClick} />
            <MapArea />
            <BottomMenu />
            <TaxiMenu
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                position={position}
                isLoggedIn={isLoggedIn}
                onItemSelect={handleItemSelect}
            />
            <AboutPortal />
            {showLogin && (
                <LoginForm
                    onClose={() => setShowLogin(false)}
                    onLoginSuccess={handleLoginSuccess}
                    id="login-window"
                    title={formMode === "login" ? "CyberTaxi Login" : formMode === "register" ? "Register for CyberTaxi" : "Reset Password"}
                    mode={formMode}
                />
            )}
            {showTestWindow && (
                <BaseWindow
                    id="test-window"
                    title="Test Base Window"
                    onClose={() => setShowTestWindow(false)}
                    isResizable={true}
                    isDraggable={true}
                    initialPosition={{ top: 150, left: 150 }}
                    defaultWidth={300}
                    defaultHeight={200}
                    minWidth={150}
                    maxHeight={500}
                    zIndexBase={1000}
                >
                    <div>Test Content</div>
                </BaseWindow>
            )}
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('app')!).render(<CyberMain />);
console.log('CyberMain: App rendering initiated with new layout, LoginForm, and BaseWindow test');