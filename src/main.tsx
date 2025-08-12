/**
 * main.tsx - Main entry point for CyberTaxi game.
 * Renders map, top menu, registration form, footer, browser, and context menu, per GDD v1.1.
 * Initializes Leaflet map, manages auth/vehicle logic via useAuth and useVehicles hooks, and handles auto-login.
 * @module Main
 * @version 0.3.48 (rolled back for stability, debug added)
 */
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { RegisterForm } from "./components/onboarding/register-form"; // Form for user login/signup
import { CyberFooter } from "./components/ui/CyberFooter"; // Footer UI component
import { AboutPortal } from "./components/ui/AboutPortal"; // About modal component
import { CyberBrowser } from "./components/ui/CyberBrowser"; // In-game browser component
import { PopupMenu } from "./components/ui/PopupMenu"; // Context menu for interactions
import { TopMenu } from "./components/ui/TopMenu"; // Top navigation bar
import { MapManager } from "./components/map/MapManager"; // Manages map and vehicle markers
import L from "leaflet"; // Leaflet library for map rendering
import "leaflet/dist/leaflet.css"; // Leaflet default styles
import "leaflet.markercluster/dist/MarkerCluster.css"; // Marker cluster styles
import "leaflet.markercluster/dist/MarkerCluster.Default.css"; // Default cluster styles
import "leaflet.markercluster"; // Marker clustering plugin
import { createTileLayer } from "./components/map/map-tiles"; // Custom tile layer function
import { useAuth } from "./components/auth/useAuth"; // Authentication hook
import { useVehicles } from "./components/vehicles/useVehicles"; // Vehicle management hook (pre-export type)
import "./styles/global.css"; // Global CSS styles

/**
 * Error boundary component to catch and display runtime errors.
 * @interface ErrorBoundaryProps
 */
interface ErrorBoundaryProps {
    children: React.ReactNode; // React children to wrap with error handling
}

/**
 * State for ErrorBoundary component.
 * @interface ErrorBoundaryState
 */
interface ErrorBoundaryState {
    hasError: boolean; // Tracks if an error has occurred
    error: Error | null; // Stores the error object or null
}

/**
 * ErrorBoundary class to handle runtime errors with a fallback UI.
 */
class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = {
        hasError: false, // Initial state: no error
        error: null, // Initial error: none
    };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        console.error("ErrorBoundary caught error:", error); // Log the error
        return { hasError: true, error }; // Update state to show error
    }

    resetError = () => {
        this.setState({ hasError: false, error: null }); // Reset error state
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    className="error-message"
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
                    <p>
                        Something went wrong:{" "}
                        {this.state.error?.message || "Unknown error"}
                    </p>
                    <button onClick={this.resetError}>Retry</button>
                </div>
            );
        }
        return this.props.children; // Render children if no error
    }
}

/**
 * Error boundary for CyberBrowser to catch specific rendering errors.
 */
class CyberBrowserBoundary extends React.Component<
    { children: React.ReactNode },
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = {
        hasError: false,
        error: null,
    };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        console.error("CyberBrowserBoundary caught error:", error);
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("CyberBrowserBoundary caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    className="error-message"
                    style={{
                        textAlign: "center",
                        color: "#ff4d4f",
                        padding: "10px",
                    }}
                >
                    <p>
                        CyberBrowser failed to load:{" "}
                        {this.state.error?.message || "Unknown error"}
                    </p>
                </div>
            );
        }
        return this.props.children;
    }
}

/**
 * Main App component for CyberTaxi.
 * Manages UI state, map initialization, and auto-login on app load.
 * @returns {JSX.Element} - Main game interface.
 */
const App: React.FC = () => {
    const { isLoggedIn, handleClose, username, handleLogin } = useAuth(); // Authentication state and actions
    const { vehicles, errorMessage, isLoadingVehicles } =
        useVehicles(isLoggedIn); // Vehicle data and status
    const topMenuRef = useRef<HTMLDivElement>(null); // Reference for top menu DOM element
    const mapRef = useRef<L.Map | null>(null); // Reference for Leaflet map instance
    const [isPopupOpen, setIsPopupOpen] = useState(false); // Controls popup menu visibility
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 }); // Popup menu position
    const [popupContext, setPopupContext] = useState<"footer" | "top-menu">(
        "footer"
    ); // Context for popup menu items
    const [registerMode, setRegisterMode] = useState<"login" | "register">(
        "login"
    ); // Login or register form mode
    const [isFormOpen, setIsFormOpen] = useState(!isLoggedIn); // Controls form visibility
    const [browserPage, setBrowserPage] = useState<
        "tesla" | "realtor" | "agency" | null
    >(null); // Active browser page
    const [errorMessageState, setErrorMessage] = useState<string | null>(null); // Local error state
    const [mapKey, setMapKey] = useState(0); // Key to force MapManager re-render

    useEffect(() => {
        // Auto-login logic using stored credentials
        console.log("Main.tsx: Starting auto-login check"); // Debug: Start of auto-login
        const token = localStorage.getItem("jwt_token");
        const savedUsername = localStorage.getItem("username");
        const savedData = localStorage.getItem("registerData");
        console.log(
            `Main.tsx: Checking auto-login, token: ${!!token}, username: ${
                savedUsername || "none"
            }`
        );
        if (token && savedUsername && savedData) {
            console.log(
                "Main.tsx: Attempting auto-login with stored credentials"
            );
            fetch("http://localhost:3000/api/auth/login/username", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username: savedUsername,
                    password: "test123",
                }),
            })
                .then((response) => {
                    console.log(
                        `Main.tsx: Auto-login response status: ${response.status}`
                    );
                    if (!response.ok)
                        throw new Error(
                            `Auto-login failed: ${response.statusText}`
                        );
                    return response.json();
                })
                .then((result) => {
                    console.log("Main.tsx: Auto-login response:", result);
                    if (result.status === "Success" && result.token) {
                        console.log(
                            "Main.tsx: Auto-login successful, token refreshed:",
                            result.token.slice(0, 10) + "..."
                        );
                        localStorage.setItem("jwt_token", result.token);
                        if (result.player_id) {
                            localStorage.setItem(
                                "player_id",
                                result.player_id.toString()
                            );
                        }
                        localStorage.setItem(
                            "username",
                            result.username || savedUsername
                        );
                        handleLogin(
                            result.token,
                            result.username || savedUsername
                        );
                        console.log(
                            "Main.tsx: Vehicles after auto-login:",
                            vehicles
                        ); // Debug: Check vehicles state
                        setMapKey((prev) => prev + 1); // Force re-render on login
                    } else {
                        throw new Error("Main.tsx: Invalid login response");
                    }
                })
                .catch((error) => {
                    console.error("Main.tsx: Auto-login error:", error);
                    localStorage.removeItem("jwt_token");
                    localStorage.removeItem("username");
                    localStorage.removeItem("registerData");
                    setIsFormOpen(true);
                    setRegisterMode("login");
                    setErrorMessage("Auto-login failed: " + error.message);
                });
        } else {
            console.log("Main.tsx: No valid credentials, opening login form");
            setIsFormOpen(true);
            setRegisterMode("login");
        }
    }, []);

    useEffect(() => {
        // Sync form visibility and map refresh based on auth state
        console.log(
            `Main.tsx: Syncing form visibility, isLoggedIn: ${isLoggedIn}, registerMode: ${registerMode}, username: ${
                username || "none"
            }, vehicles: ${vehicles.length}`
        );
        setIsFormOpen(!isLoggedIn);
        if (isLoggedIn && mapRef.current && vehicles.length > 0) {
            mapRef.current.invalidateSize(); // Ensure map resizes to show new markers
            setMapKey((prev) => prev + 1); // Trigger MapManager re-render
        }
    }, [isLoggedIn, registerMode, username, vehicles]);

    const handleTaxiClick = (x: number, y: number) => {
        // Handle taxi click to open popup menu
        console.log(`Main.tsx: click-taxi received at x: ${x}, y: ${y}`);
        setPopupPosition({ x, y });
        setPopupContext("top-menu");
        setIsPopupOpen(true);
    };

    const handleOpenCyberBrowser = (e: CustomEvent) => {
        // Handle opening CyberBrowser based on custom event
        const page = e.detail.page as
            | "tesla"
            | "realtor"
            | "agency"
            | undefined;
        console.log(
            `Main.tsx: open-cyber-browser received: page=${page || "tesla"}`
        );
        setBrowserPage(page || "tesla");
    };

    useEffect(() => {
        // Add and remove event listener for CyberBrowser open event
        document.addEventListener(
            "open-cyber-browser",
            handleOpenCyberBrowser as EventListener
        );
        return () => {
            document.removeEventListener(
                "open-cyber-browser",
                handleOpenCyberBrowser as EventListener
            );
        };
    }, []);

    const handlePopupItemSelect = (action: string) => {
        // Handle selection from popup menu
        console.log(
            `Main.tsx: PopupMenu action selected: ${action}, isLoggedIn: ${isLoggedIn}`
        );
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
            setBrowserPage(null);
            handleClose();
            console.log(
                "Main.tsx: Logged out, jwt_token, registerData, username, and player_id cleared"
            );
        } else if (action === "settings") {
            console.log("Main.tsx: Settings action triggered (placeholder)");
            setIsPopupOpen(false);
        } else if (action === "open-tesla") {
            setBrowserPage("tesla");
            setIsPopupOpen(false);
            console.log("Main.tsx: Opening CyberBrowser with Tesla page");
        } else if (action === "open-real-estate") {
            setBrowserPage("realtor");
            setIsPopupOpen(false);
            console.log("Main.tsx: Opening CyberBrowser with Realtor page");
        } else if (action === "open-agency") {
            setBrowserPage("agency");
            setIsPopupOpen(false);
            console.log(
                "Main.tsx: Opening CyberBrowser with Employment Agency page"
            );
        }
    };

    const handleFormClose = () => {
        // Handle closing the registration/login form
        console.log("Main.tsx: handleFormClose triggered");
        setIsFormOpen(false);
    };

    const handleDebugOpenBrowser = () => {
        // Debug function to force open CyberBrowser
        console.log(
            "Main.tsx: Debug: Forcing CyberBrowser open with Tesla page"
        );
        setBrowserPage("tesla");
    };

    useEffect(() => {
        // Initialize and clean up the Leaflet map
        const mapElement = document.getElementById("map-area");
        if (!mapElement) {
            console.error("Main.tsx: Map container #map-area not found");
            setErrorMessage("Map container not found");
            return;
        }
        if (!mapRef.current) {
            try {
                mapRef.current = L.map("map-area", {
                    zoomControl: false,
                }).setView([30.2672, -97.7431], 12);
                createTileLayer("dark").addTo(mapRef.current);
                console.log("Main.tsx: Main map initialized successfully");
            } catch (error: unknown) {
                console.error(
                    "Main.tsx: Failed to initialize Leaflet map:",
                    error
                );
                setErrorMessage(
                    "Failed to initialize map: " +
                        (error instanceof Error
                            ? error.message
                            : "Unknown error")
                );
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

    useEffect(() => {
        // Invalidate map size on state changes affecting layout
        if (mapRef.current) {
            mapRef.current.invalidateSize();
            console.log("Main.tsx: Map size invalidated");
        }
    }, [isFormOpen, browserPage, isLoggedIn, vehicles]);

    useEffect(() => {
        // Log CyberBrowser rendering attempts
        if (browserPage && username) {
            console.log(
                `Main.tsx: Attempting to render CyberBrowser with page: ${browserPage}, username: ${username}`
            );
        } else {
            console.log(
                `Main.tsx: CyberBrowser not rendered: page=${browserPage}, username=${
                    username || "none"
                }`
            );
        }
    }, [browserPage, username]);

    return (
        <ErrorBoundary>
            <AboutPortal />
            <div
                className="main-container"
                role="main"
                aria-label="Main game interface"
                style={{ position: "relative", zIndex: 1 }}
            >
                {(errorMessage || errorMessageState) && (
                    <div className="error-message">
                        {errorMessage || errorMessageState}
                    </div>
                )}
                <div
                    id="top-menu-container"
                    ref={topMenuRef}
                    aria-hidden="true"
                    style={{ zIndex: 1000 }}
                >
                    <TopMenu onTaxiClick={handleTaxiClick} />
                </div>
                <div
                    id="map-area"
                    style={{ position: "relative", zIndex: 500 }}
                    aria-label="Map area"
                >
                    <MapManager
                        key={mapKey}
                        vehicles={vehicles}
                        setErrorMessage={setErrorMessage}
                        mapRef={mapRef}
                    />
                </div>
                <CyberFooter />
                {isFormOpen && (
                    <RegisterForm
                        onClose={handleFormClose}
                        mode={registerMode}
                    />
                )}
                {browserPage && username && (
                    <CyberBrowserBoundary>
                        <div style={{ zIndex: 2000 }}>
                            <CyberBrowser
                                onClose={() => {
                                    console.log("Main.tsx: Browser closed");
                                    setBrowserPage(null);
                                }}
                                username={username}
                                activePage={browserPage}
                                style={{ zIndex: 2000, display: "block" }}
                            />
                        </div>
                    </CyberBrowserBoundary>
                )}
                <PopupMenu
                    isOpen={isPopupOpen}
                    position={popupPosition}
                    items={
                        popupContext === "top-menu"
                            ? [
                                  ...(isLoggedIn
                                      ? [{ label: "Logout", action: "logout" }]
                                      : [
                                            {
                                                label: "Register",
                                                action: "register",
                                            },
                                            { label: "Login", action: "login" },
                                        ]),
                                  { label: "Settings", action: "settings" },
                              ]
                            : [
                                  { label: "Tesla", action: "open-tesla" },
                                  {
                                      label: "Real Estate",
                                      action: "open-real-estate",
                                  },
                                  {
                                      label: "Employment Agency",
                                      action: "open-agency",
                                  },
                              ]
                    }
                    context={popupContext}
                    onClose={() => {
                        console.log(
                            `Main.tsx: PopupMenu closed from main.tsx for ${popupContext}`
                        );
                        setIsPopupOpen(false);
                    }}
                    onItemSelect={handlePopupItemSelect}
                />
            </div>
        </ErrorBoundary>
    );
};

ReactDOM.createRoot(document.getElementById("app")!).render(<App />);
