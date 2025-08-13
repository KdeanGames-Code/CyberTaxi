// src/CyberMain.tsx
/**
 * @file CyberMain.tsx
 * @description Main entry point for CyberTaxi, defining the new UI/UX layout.
 * @author Kevin-Dean Livingstone & CyberTaxi Team
 * @version 0.2.8
 * @note Replaces main.tsx with a three-row structure: MenuBar, Map, BottomMenu, using CyberGlobal.css, with TaxiMenu triggered by taxi click.
 */
import React, { useState } from "react"; // Added useState for isLoggedIn
import ReactDOM from "react-dom/client";
import "./CyberGlobal.css"; // Base layout stylesheet
import MenuBar from "./components/ui/controls/MenuBar"; // New MenuBar component
import { TaxiMenu } from "./components/ui/controls/TaxiMenu"; // New TaxiMenu component
// Dummy components for layout
const Map = () => <div className="map-area">Map Area Placeholder</div>;
const BottomMenu = () => (
    <div className="bottom-menu">Bottom Menu Placeholder</div>
);

/**
 * Main application component with the new layout.
 * @returns {JSX.Element} The rendered three-row UI structure with TaxiMenu.
 * @description Sets up containers for MenuBar, Map, and BottomMenu with global styling, triggering TaxiMenu on taxi click.
 */
const CyberMain = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Dummy state for testing

    const handleTaxiClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent immediate outside click closure
        setPosition({ x: e.clientX, y: e.clientY });
        setIsOpen(true);
    };

    const handleItemSelect = (action: string) => {
        console.log(`Action selected: ${action}`);
        if (action === "logout") setIsLoggedIn(false);
        else if (action === "login") setIsLoggedIn(true);
        // Add other actions later
        setIsOpen(false); // Close menu after selection
    };

    return (
        <div id="app" onClick={() => setIsOpen(false)}>
            {" "}
            {/* Close on outside click */}
            <MenuBar onTaxiClick={handleTaxiClick} />{" "}
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
        </div>
    );
};

/**
 * Renders the CyberMain.component to the DOM.
 * @note Assumes #app element exists in index.html; applies new layout with CyberGlobal.css and TaxiMenu.
 */
ReactDOM.createRoot(document.getElementById("app")!).render(<CyberMain />);
console.log("CyberMain: App rendering initiated with new layout and TaxiMenu");
