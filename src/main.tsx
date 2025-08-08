/**
 * main.tsx - Main entry point for CyberTaxi game.
 * Renders map, top menu, registration form, footer, browser, and context menu, per GDD v1.1.
 * Initializes Leaflet map and integrates auth/vehicle logic via useAuth and useVehicles hooks.
 * @module Main
 * @version 0.3.3
 */

import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { RegisterForm } from "./components/onboarding/register-form";
import { CyberFooter } from "./components/ui/CyberFooter";
import { AboutPortal } from "./components/ui/AboutPortal";
import { CyberBrowser } from "./components/ui/CyberBrowser";
import { PopupMenu } from "./components/ui/PopupMenu";
import { createTopMenu } from "./components/TopMenu";
import { MapManager } from "./components/map/MapManager";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { createTileLayer } from "./components/map/map-tiles";
import { useAuth } from "./components/auth/useAuth";
import { useVehicles } from "./components/vehicles/useVehicles";
import "./styles/global.css";

/**
 * Error Boundary Component to catch and display runtime errors.
 * @class ErrorBoundary
 * @extends React.Component
 */
class ErrorBoundary extends React.Component<
    React.PropsWithChildren<{}>,
    { hasError: boolean; error: Error | null }
> {
    state: { hasError: boolean; error: Error | null } = {
        hasError: false,
        error: null,
    };
    static getDerivedStateFromError(error: Error) {
        console.error("ErrorBoundary caught error:", error);
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="error-message">
                    Something went wrong:{" "}
                    {this.state.error?.message || "Unknown error"}
                </div>
            );
        }
        return this.props.children;
    }
}

/**
 * Main App component for CyberTaxi game.
 * Manages map initialization and UI components, using useAuth and useVehicles hooks.
 * @returns {JSX.Element} Main game interface.
 */
const App: React.FC = () => {
    const topMenuRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const [isBrowserOpen, setIsBrowserOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [popupContext, setPopupContext] = useState("footer");
    const [registerMode, setRegisterMode] = useState<"login" | "register">(
        "login"
    );
    const { isLoggedIn, handleClose } = useAuth();
    const { vehicles, errorMessage, isLoadingVehicles } =
        useVehicles(isLoggedIn);

    /**
     * Toggles CyberBrowser or opens PopupMenu on footer globe click.
     * @param {MouseEvent} [e] - Optional mouse event for PopupMenu positioning.
     */
    const handleToggleBrowser = (e?: MouseEvent) => {
        if (e) {
            setPopupPosition({ x: e.clientX, y: e.clientY });
            setPopupContext("footer");
            setIsPopupOpen(true);
            console.log(
                "PopupMenu triggered by globe click at x:",
                e.clientX,
                "y:",
                e.clientY
            );
        } else {
            setIsBrowserOpen(!isBrowserOpen);
            console.log("CyberBrowser toggled:", !isBrowserOpen);
        }
    };

    /**
     * Handles Taxi logo click to open PopupMenu.
     * @param {CustomEvent} e - Custom event with click coordinates.
     */
    const handleTaxiClick = (e: CustomEvent) => {
        console.log("click-taxi received at x:", e.detail.x, "y:", e.detail.y);
        setPopupPosition({ x: e.detail.x, y: e.detail.y });
        setPopupContext("top-menu");
        setIsPopupOpen(true);
    };

    /**
     * Handles PopupMenu item selection actions.
     * @param {string} action - Selected menu action (e.g., "logout", "open-tesla").
     */
    const handlePopupItemSelect = (action: string) => {
        console.log(`PopupMenu action selected: ${action}`);
        if (action === "register") {
            setRegisterMode("register");
            handleClose();
            setIsPopupOpen(false);
        } else if (action === "login") {
            setRegisterMode("login");
            handleClose();
            setIsPopupOpen(false);
        } else if (action === "logout") {
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("registerData");
            localStorage.removeItem("username");
            localStorage.removeItem("player_id");
            setIsPopupOpen(false);
            handleClose(); // Trigger useAuth to sync isLoggedIn
            console.log(
                "Logged out, jwt_token, registerData, username, and player_id cleared"
            );
        } else if (action === "settings") {
            console.log("Settings action triggered (placeholder)");
            setIsPopupOpen(false);
        } else if (action === "open-tesla") {
            setIsBrowserOpen(true);
            setIsPopupOpen(false);
            console.log("Opening CyberBrowser from PopupMenu");
        } else if (action === "open-real-estate") {
            console.log("Real Estate action triggered (placeholder)");
            setIsPopupOpen(false);
        }
    };

    /**
     * Sets up global toggleCyberBrowser and click-taxi event listeners.
     */
    useEffect(() => {
        (window as any).toggleCyberBrowser = handleToggleBrowser;
        document.addEventListener(
            "click-taxi",
            handleTaxiClick as EventListener
        );
        return () => {
            delete (window as any).toggleCyberBrowser;
            document.removeEventListener(
                "click-taxi",
                handleTaxiClick as EventListener
            );
        };
    }, []);

    /**
     * Initializes top menu and map.
     */
    useEffect(() => {
        const appElement = document.getElementById("app");
        if (!appElement) {
            console.error("Root element #app not found in index.html");
            return;
        }

        if (topMenuRef.current) {
            topMenuRef.current.appendChild(createTopMenu());
        }

        const mapElement = document.getElementById("map-area");
        if (!mapElement) {
            console.error("Map container #map-area not found");
            return;
        }
        console.log("Main map container verified");

        if (!mapRef.current) {
            try {
                mapRef.current = L.map("map-area", {
                    zoomControl: false,
                }).setView([30.2672, -97.7431], 12);
                createTileLayer("dark").addTo(mapRef.current);
                mapRef.current.invalidateSize();
                console.log("Main map initialized successfully");
            } catch (error: unknown) {
                console.error("Failed to initialize Leaflet map:", error);
                return;
            }
        }

        console.log("Main app rendered");
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return (
        <ErrorBoundary>
            <AboutPortal />
            <div
                className="main-container"
                role="main"
                aria-label="Main game interface"
            >
                {errorMessage && (
                    <div className="error-message">{errorMessage}</div>
                )}
                <div
                    id="top-menu-container"
                    ref={topMenuRef}
                    aria-hidden="true"
                ></div>
                <div id="map-area" aria-label="Map area"></div>
                {!isLoadingVehicles && isLoggedIn && (
                    <MapManager
                        vehicles={vehicles}
                        setErrorMessage={() => {}}
                        mapRef={mapRef}
                    />
                )}
                <CyberFooter />
                {!isLoggedIn && (
                    <RegisterForm onClose={handleClose} mode={registerMode} />
                )}
                {isBrowserOpen && (
                    <CyberBrowser
                        onClose={() => {
                            console.log("Browser closed");
                            setIsBrowserOpen(false);
                        }}
                        playerId="1"
                    />
                )}
                {isPopupOpen && (
                    <PopupMenu
                        position={popupPosition}
                        items={
                            popupContext === "top-menu"
                                ? [
                                      ...(isLoggedIn
                                          ? [
                                                {
                                                    label: "Logout",
                                                    action: "logout",
                                                },
                                            ]
                                          : [
                                                {
                                                    label: "Register",
                                                    action: "register",
                                                },
                                                {
                                                    label: "Login",
                                                    action: "login",
                                                },
                                            ]),
                                      { label: "Settings", action: "settings" },
                                  ]
                                : [
                                      { label: "Tesla", action: "open-tesla" },
                                      {
                                          label: "Real Estate",
                                          action: "open-real-estate",
                                      },
                                  ]
                        }
                        context={popupContext}
                        onClose={() => {
                            console.log(
                                `PopupMenu closed from main.tsx for ${popupContext}`
                            );
                            setIsPopupOpen(false);
                        }}
                        onItemSelect={handlePopupItemSelect}
                    />
                )}
            </div>
        </ErrorBoundary>
    );
};

ReactDOM.createRoot(document.getElementById("app")!).render(<App />);
