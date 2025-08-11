/**
 * main.tsx - Main entry point for CyberTaxi game.
 * Renders map, top menu, registration form, footer, browser, and context menu, per GDD v1.1.
 * Initializes Leaflet map, manages auth/vehicle logic via useAuth and useVehicles hooks, and handles auto-login.
 * @module Main
 * @version 0.3.48
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
 * @returns JSX.Element - Main game interface.
 */
const App: React.FC = () => {
    const { isLoggedIn, handleClose, username, handleLogin } = useAuth();
    const { vehicles, errorMessage, isLoadingVehicles } =
        useVehicles(isLoggedIn);
    const topMenuRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [popupContext, setPopupContext] = useState<"footer" | "top-menu">(
        "footer"
    );
    const [registerMode, setRegisterMode] = useState<"login" | "register">(
        "login"
    );
    const [isFormOpen, setIsFormOpen] = useState(!isLoggedIn);
    const [browserPage, setBrowserPage] = useState<
        "tesla" | "realtor" | "agency" | null
    >(null);
    const [errorMessageState, setErrorMessage] = useState<string | null>(null);

    /**
     * Attempts auto-login using stored credentials from localStorage.
     */
    useEffect(() => {
        const token = localStorage.getItem("jwt_token");
        const savedUsername = localStorage.getItem("username");
        const savedData = localStorage.getItem("registerData");
        console.log(
            `Main.tsx: Checking auto-login, token: ${!!token}, username: ${
                savedUsername || "none"
            }`
        );
        if (token && savedUsername && savedData) {
            console.log("Attempting auto-login with stored credentials");
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
                            "Auto-login successful, token refreshed:",
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
                    } else {
                        throw new Error("Invalid login response");
                    }
                })
                .catch((error) => {
                    console.error("Auto-login error:", error);
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

    /**
     * Syncs form visibility and mode with login state.
     */
    useEffect(() => {
        console.log(
            `Main.tsx: Syncing form visibility, isLoggedIn: ${isLoggedIn}, registerMode: ${registerMode}, username: ${
                username || "none"
            }`
        );
        setIsFormOpen(!isLoggedIn);
    }, [isLoggedIn, registerMode, username]);

    /**
     * Handles taxi logo click to open PopupMenu.
     */
    const handleTaxiClick = (x: number, y: number) => {
        console.log(`click-taxi received at x: ${x}, y: ${y}`);
        setPopupPosition({ x, y });
        setPopupContext("top-menu");
        setIsPopupOpen(true);
    };

    /**
     * Handles CyberBrowser open event from footer.
     */
    const handleOpenCyberBrowser = (e: CustomEvent) => {
        const page = e.detail.page as
            | "tesla"
            | "realtor"
            | "agency"
            | undefined;
        console.log(`open-cyber-browser received: page=${page || "tesla"}`);
        setBrowserPage(page || "tesla");
    };

    /**
     * Sets up listener for open-cyber-browser event.
     */
    useEffect(() => {
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

    /**
     * Handles PopupMenu item selections.
     */
    const handlePopupItemSelect = (action: string) => {
        console.log(
            `PopupMenu action selected: ${action}, isLoggedIn: ${isLoggedIn}`
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
                "Logged out, jwt_token, registerData, username, and player_id cleared"
            );
        } else if (action === "settings") {
            console.log("Settings action triggered (placeholder)");
            setIsPopupOpen(false);
        } else if (action === "open-tesla") {
            setBrowserPage("tesla");
            setIsPopupOpen(false);
            console.log("Opening CyberBrowser with Tesla page");
        } else if (action === "open-real-estate") {
            setBrowserPage("realtor");
            setIsPopupOpen(false);
            console.log("Opening CyberBrowser with Realtor page");
        } else if (action === "open-agency") {
            setBrowserPage("agency");
            setIsPopupOpen(false);
            console.log("Opening CyberBrowser with Employment Agency page");
        }
    };

    /**
     * Closes the registration/login form.
     */
    const handleFormClose = () => {
        console.log("Main.tsx handleFormClose triggered");
        setIsFormOpen(false);
    };

    /**
     * Debug: Opens CyberBrowser with Tesla page.
     */
    const handleDebugOpenBrowser = () => {
        console.log("Debug: Forcing CyberBrowser open with Tesla page");
        setBrowserPage("tesla");
    };

    /**
     * Initializes Leaflet map with dark tiles.
     */
    useEffect(() => {
        const mapElement = document.getElementById("map-area");
        if (!mapElement) {
            console.error("Map container #map-area not found");
            setErrorMessage("Map container not found");
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

    /**
     * Invalidates map size when UI components change visibility.
     */
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.invalidateSize();
            console.log("Map size invalidated");
        }
    }, [isPopupOpen, isFormOpen, browserPage]);

    /**
     * Logs CyberBrowser rendering conditions.
     */
    useEffect(() => {
        if (browserPage && username) {
            console.log(
                `Attempting to render CyberBrowser with page: ${browserPage}, username: ${username}`
            );
        } else {
            console.log(
                `CyberBrowser not rendered: page=${browserPage}, username=${
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
                    style={{ zIndex: 1000 }} // Match global.css
                >
                    <TopMenu onTaxiClick={handleTaxiClick} />
                </div>
                <div
                    id="map-area"
                    style={{ position: "relative", zIndex: 500 }}
                    aria-label="Map area"
                ></div>
                {!isLoadingVehicles && isLoggedIn && (
                    <MapManager
                        vehicles={vehicles}
                        setErrorMessage={setErrorMessage}
                        mapRef={mapRef}
                    />
                )}
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
                                    console.log("Browser closed");
                                    setBrowserPage(null);
                                }}
                                username={username}
                                activePage={browserPage}
                                style={{ zIndex: 2000, display: "block" }}
                            />
                        </div>
                    </CyberBrowserBoundary>
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
                                      {
                                          label: "Employment Agency",
                                          action: "open-agency",
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
