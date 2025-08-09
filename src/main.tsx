/**
 * main.tsx - Main entry point for CyberTaxi game.
 * Renders map, top menu, registration form, footer, browser, and context menu, per GDD v1.1.
 * Initializes Leaflet map, manages auth/vehicle logic via useAuth and useVehicles hooks, and handles auto-login.
 * @module Main
 * @version 0.3.17
 */
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { RegisterForm } from "./components/onboarding/register-form";
import { CyberFooter } from "./components/ui/CyberFooter";
import { AboutPortal } from "./components/ui/AboutPortal";
import { CyberBrowser } from "./components/ui/CyberBrowser";
import { PopupMenu } from "./components/ui/PopupMenu";
import { TopMenu } from "./components/ui/TopMenu";
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
 * Error boundary component to catch and display runtime errors.
 * @interface ErrorBoundaryProps
 */
interface ErrorBoundaryProps {
    children: React.ReactNode;
}

/**
 * State for ErrorBoundary component.
 * @interface ErrorBoundaryState
 */
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary class to handle runtime errors with a fallback UI.
 */
class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = {
        hasError: false,
        error: null,
    };

    /**
     * Updates state when an error is caught.
     * @param error - The caught error.
     * @returns Updated state.
     */
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        console.error("ErrorBoundary caught error:", error);
        return { hasError: true, error };
    }

    /**
     * Resets error state to retry rendering.
     */
    resetError = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    className="error-message"
                    style={{ textAlign: "center", color: "#ff4d4f" }}
                >
                    <p>
                        Something went wrong:{" "}
                        {this.state.error?.message || "Unknown error"}
                    </p>
                    <button
                        onClick={this.resetError}
                        style={{
                            padding: "8px",
                            background: "#d4a017",
                            border: "none",
                            borderRadius: "4px",
                            color: "#1a1a1a",
                            fontFamily: '"Orbitron", sans-serif',
                            cursor: "pointer",
                        }}
                    >
                        Retry
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

/**
 * Main App component for CyberTaxi.
 * Manages UI state, map initialization, and auto-login on app load.
 * @returns JSX.Element - Main game interface.
 */
const App: React.FC = () => {
    const { isLoggedIn, handleClose } = useAuth();
    const { vehicles, errorMessage, isLoadingVehicles } =
        useVehicles(isLoggedIn);
    const topMenuRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const [isBrowserOpen, setIsBrowserOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [popupContext, setPopupContext] = useState<"footer" | "top-menu">(
        "footer"
    );
    const [registerMode, setRegisterMode] = useState<"login" | "register">(
        "login"
    );
    const [isFormOpen, setIsFormOpen] = useState(!isLoggedIn);

    /**
     * Attempts auto-login using stored credentials from localStorage.
     */
    useEffect(() => {
        const token = localStorage.getItem("jwt_token");
        const username = localStorage.getItem("username");
        const savedData = localStorage.getItem("registerData");
        if (token && username && savedData) {
            console.log("Attempting auto-login with stored credentials");
            fetch("http://localhost:3000/api/auth/login/username", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ username, password: "test123" }), // Password not stored; use placeholder or prompt
            })
                .then((response) => {
                    if (!response.ok) throw new Error("Auto-login failed");
                    return response.json();
                })
                .then((result) => {
                    if (result.status === "Success" && result.token) {
                        console.log(
                            "Auto-login successful, token refreshed:",
                            result.token
                        );
                        localStorage.setItem("jwt_token", result.token);
                        if (result.player_id) {
                            localStorage.setItem(
                                "player_id",
                                result.player_id.toString()
                            );
                        }
                        setIsFormOpen(false);
                    }
                })
                .catch((error) => {
                    console.error("Auto-login error:", error);
                    localStorage.removeItem("jwt_token");
                    setIsFormOpen(true);
                    setRegisterMode("login");
                });
        } else {
            setIsFormOpen(true);
            setRegisterMode("login");
        }
    }, []);

    /**
     * Syncs form visibility and mode with login state.
     */
    useEffect(() => {
        setIsFormOpen(!isLoggedIn);
        setRegisterMode(isLoggedIn ? "login" : "login");
    }, [isLoggedIn]);

    /**
     * Toggles CyberBrowser or opens PopupMenu on footer globe click.
     * @param e - Optional mouse event for PopupMenu positioning.
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
     * Handles taxi logo click to open PopupMenu.
     * @param e - Custom event with click coordinates.
     */
    const handleTaxiClick = (e: CustomEvent) => {
        console.log("click-taxi received at x:", e.detail.x, "y:", e.detail.y);
        setPopupPosition({ x: e.detail.x, y: e.detail.y });
        setPopupContext("top-menu");
        setIsPopupOpen(true);
    };

    /**
     * Handles PopupMenu item selections.
     * @param action - Selected menu action (e.g., "logout", "login").
     */
    const handlePopupItemSelect = (action: string) => {
        console.log(`PopupMenu action selected: ${action}`);
        if (action === "register") {
            setRegisterMode("register");
            setIsFormOpen(true);
            setIsPopupOpen(false);
        } else if (action === "login") {
            setRegisterMode("login");
            setIsFormOpen(true);
            setIsPopupOpen(false);
        } else if (action === "logout") {
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("registerData");
            localStorage.removeItem("username");
            localStorage.removeItem("player_id");
            setIsPopupOpen(false);
            setIsFormOpen(true);
            setRegisterMode("login");
            handleClose();
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
     * Closes the registration/login form.
     */
    const handleFormClose = () => {
        console.log("Main.tsx handleFormClose triggered");
        setIsFormOpen(false);
        handleClose();
    };

    /**
     * Sets up global event listeners for CyberBrowser and taxi click.
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
     * Initializes Leaflet map with dark tiles.
     */
    useEffect(() => {
        const mapElement = document.getElementById("map-area");
        if (!mapElement) {
            console.error("Map container #map-area not found");
            return;
        }
        if (!mapRef.current) {
            try {
                mapRef.current = L.map("map-area", {
                    zoomControl: false,
                }).setView([30.2672, -97.7431], 12);
                createTileLayer("dark").addTo(mapRef.current);
                console.log("Main map initialized successfully");
            } catch (error: unknown) {
                console.error("Failed to initialize Leaflet map:", error);
                return;
            }
        }
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    /**
     * Invalidates map size when UI components change visibility.
     */
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.invalidateSize();
            console.log("Map size invalidated");
        }
    }, [isBrowserOpen, isPopupOpen, isFormOpen]);

    return (
        <ErrorBoundary>
            <AboutPortal />
            <div
                className="main-container"
                role="main"
                aria-label="Main game interface"
                style={{ position: "relative", zIndex: 0 }}
            >
                {errorMessage && (
                    <div className="error-message">{errorMessage}</div>
                )}
                <div
                    id="top-menu-container"
                    ref={topMenuRef}
                    aria-hidden="true"
                >
                    <TopMenu />
                </div>
                <div
                    id="map-area"
                    style={{ position: "relative", zIndex: 500 }}
                    aria-label="Map area"
                ></div>
                {!isLoadingVehicles && isLoggedIn && (
                    <MapManager
                        vehicles={vehicles}
                        setErrorMessage={() => {}}
                        mapRef={mapRef}
                    />
                )}
                <CyberFooter />
                {!isLoggedIn && isFormOpen && (
                    <RegisterForm
                        onClose={handleFormClose}
                        mode={registerMode}
                    />
                )}
                {isBrowserOpen && (
                    <CyberBrowser
                        onClose={() => {
                            console.log("Browser closed");
                            setIsBrowserOpen(false);
                        }}
                        playerId={localStorage.getItem("player_id") || "1"}
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
