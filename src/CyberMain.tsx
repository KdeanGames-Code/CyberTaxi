// src/CyberMain.tsx
/**
 * @file CyberMain.tsx
 * @description Main entry point for CyberTaxi, defining the UI/UX layout with BaseWindow and LoginForm.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.2.11
 * @note Defines a three-row structure: MenuBar, MapArea, BottomMenu, with BaseWindow and LoginForm integration.
 */
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './CyberGlobal.css'; // Base layout stylesheet
import MenuBar from './components/ui/controls/MenuBar';
import { TaxiMenu } from './components/ui/controls/TaxiMenu';
import { LoginForm } from './components/ui/Windows/LoginForm';
import { BaseWindow } from './components/ui/Windows/baseWindow';
const MapArea = () => <div className="map-area">Map Area Placeholder</div>;
const BottomMenu = () => <div className="bottom-menu">Bottom Menu Placeholder</div>;

const CyberMain = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [showTestWindow, setShowTestWindow] = useState(false);

    const handleTaxiClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPosition({ x: e.clientX, y: e.clientY });
        setIsOpen(true);
    };

    const handleItemSelect = (action: string) => {
        console.log(`Action selected: ${action}`);
        if (action === 'logout') setIsLoggedIn(false);
        else if (action === 'login') {
            setIsLoggedIn(true);
            setShowLogin(true);
        } else if (action === 'test') {
            setShowTestWindow(true);
        }
        setIsOpen(false);
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
            {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
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