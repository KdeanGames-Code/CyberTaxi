// src/GlobalMain.tsx
/**
 * @file GlobalMain.tsx
 * @description Main entry point for CyberTaxi, defining the new UI/UX layout with LoginForm.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.2.13
 * @note Replaces CyberMain.tsx with a three-row structure: MenuBar, Map, BottomMenu, and LoginForm integration.
 */
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './CyberGlobal.css'; // Base layout stylesheet
import MenuBar from './components/ui/controls/MenuBar'; // New MenuBar component
import { TaxiMenu } from './components/ui/controls/TaxiMenu'; // New TaxiMenu component
import { LoginForm } from './components/ui/LoginForm'; // New LoginForm component
// Dummy components for layout
const Map = () => <div className="map-area">Map Area Placeholder</div>;
const BottomMenu = () => <div className="bottom-menu">Bottom Menu Placeholder</div>;

/**
 * Main application component with the new layout.
 * @returns {JSX.Element} The rendered three-row UI structure with LoginForm.
 * @description Sets up containers for MenuBar, Map, and BottomMenu with global styling, triggering TaxiMenu and LoginForm.
 */
const GlobalMain = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Dummy state
    const [showLogin, setShowLogin] = useState(false); // Control LoginForm visibility

    const handleTaxiClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent immediate outside click closure
        setPosition({ x: e.clientX, y: e.clientY });
        setIsOpen(true);
    };

    const handleItemSelect = (action: string) => {
        console.log(`Action selected: ${action}`);
        if (action === 'logout') setIsLoggedIn(false);
        else if (action === 'login') {
            setIsLoggedIn(true);
            setShowLogin(true); // Show LoginForm on login select
        }
        setIsOpen(false); // Close menu after selection
    };

    return (
        <div id="app" onClick={() => setIsOpen(false)}>
            {/* Close on outside click */}
            <MenuBar onTaxiClick={handleTaxiClick} />
            {/* Trigger TaxiMenu on taxi click */}
            <Map />
            <BottomMenu />
            <TaxiMenu
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                position={position}
                isLoggedIn={isLoggedIn}
                onItemSelect={handleItemSelect}
            />
            {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
        </div>
    );
};

/**
 * Renders the GlobalMain component to the DOM.
 * @note Assumes #app element exists in index.html; applies new layout with CyberGlobal.css and LoginForm.
 */
ReactDOM.createRoot(document.getElementById('app')!).render(<GlobalMain />);
console.log('GlobalMain: App rendering initiated with new layout and LoginForm');