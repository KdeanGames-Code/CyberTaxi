/**
 * main.tsx - Main entry point for CyberTaxi game.
 * Renders map, top menu, registration form, footer, browser, and context menu, per GDD v1.1.
 * Initializes Leaflet map and fetches vehicle data for marker rendering.
 * @module Main
 * @version 0.3.0
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
import type { Vehicle } from "./components/map/vehicle-markers";
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
 * Manages map initialization, vehicle fetching, and UI components.
 * @returns {JSX.Element} Main game interface.
 */
const App: React.FC = () => {
    const topMenuRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const [isBrowserOpen, setIsBrowserOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(
        !localStorage.getItem("jwt_token")
    );
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [popupContext, setPopupContext] = useState("footer");
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("jwt_token")
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

    /**
     * Monitors login state and updates UI accordingly.
     * Listens for storage events to sync login state across tabs.
     */
    useEffect(() => {
        const checkLogin = () => {
            const loggedIn = !!localStorage.getItem("jwt_token");
            console.log(`isLoggedIn state: ${loggedIn}`);
            setIsLoggedIn(loggedIn);
            setIsRegisterOpen(!loggedIn);
        };
        checkLogin();
        window.addEventListener("storage", checkLogin);
        return () => window.removeEventListener("storage", checkLogin);
    }, []);

    /**
     * Decodes JWT token for debugging claims.
     * @param {string} token - JWT token to decode.
     * @returns {object | null} Decoded token claims or null if invalid.
     */
    const decodeToken = (token: string) => {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => {
                        return (
                            "%" +
                            ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                        );
                    })
                    .join("")
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Failed to decode JWT token:", e);
            return null;
        }
    };

    /**
     * Refreshes JWT token on 401/403 errors.
     * Updates localStorage with new token and player data.
     * @returns {Promise<string | null>} New token or null if refresh fails.
     */
    const refreshToken = async () => {
        const playerId = localStorage.getItem("player_id") || "1";
        const username = localStorage.getItem("username") || "Kevin-Dean";
        const playerIdNum = parseInt(playerId, 10);
        console.log(
            `Attempting to refresh token for player_id: ${playerIdNum}, username: ${username}`
        );
        try {
            const response = await fetch(
                "http://localhost:3000/api/auth/login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        player_id: playerIdNum,
                        password: "test123",
                    }),
                }
            );
            const data = await response.json();
            console.log("Token refresh response:", data);
            if (data.status === "Success") {
                console.log(
                    `Token refresh successful, new token: ${data.token}`
                );
                const tokenClaims = decodeToken(data.token);
                console.log("New token claims:", tokenClaims);
                localStorage.setItem("jwt_token", data.token);
                localStorage.setItem("player_id", data.player_id.toString());
                localStorage.setItem("username", username);
                return data.token;
            } else {
                console.error("Token refresh failed:", data.message);
                setErrorMessage(
                    "Failed to refresh session. Please log in again."
                );
                localStorage.removeItem("jwt_token");
                localStorage.removeItem("username");
                localStorage.removeItem("player_id");
                setIsLoggedIn(false);
                setIsRegisterOpen(true);
                return null;
            }
        } catch (error) {
            console.error("Token refresh error:", error);
            setErrorMessage("Failed to refresh session. Please log in again.");
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("username");
            localStorage.removeItem("player_id");
            setIsLoggedIn(false);
            setIsRegisterOpen(true);
            return null;
        }
    };

    /**
     * Fetches player vehicles from the backend API.
     * Handles retries and token refresh on 401/403 errors.
     * @param {number} [retries=3] - Number of retry attempts.
     * @param {number} [delay=1000] - Delay between retries in milliseconds.
     * @returns {Promise<Vehicle[]>} Array of validated vehicle data.
     */
    const fetchVehicles = async (
        retries = 3,
        delay = 1000
    ): Promise<Vehicle[]> => {
        let token = localStorage.getItem("jwt_token");
        const username = localStorage.getItem("username") || "Kevin-Dean";
        console.log(`Initiating fetch from /api/player/${username}/vehicles`, {
            token: token ? `${token.slice(0, 10)}...` : "No token",
        });
        if (!token) {
            console.error("No JWT token found");
            setErrorMessage("Authentication required. Please log in again.");
            setIsLoggedIn(false);
            setIsRegisterOpen(true);
            return [];
        }
        const tokenClaims = decodeToken(token);
        console.log("Token claims:", tokenClaims);
        try {
            const response = await fetch(
                `http://localhost:3000/api/player/${username}/vehicles`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 401 || response.status === 403) {
                    console.error("Token invalid or unauthorized:", errorText);
                    setErrorMessage(
                        "Session expired. Attempting to refresh token..."
                    );
                    token = await refreshToken();
                    if (!token) {
                        return [];
                    }
                    console.log(
                        `Retrying fetch with new token: ${token.slice(
                            0,
                            10
                        )}...`
                    );
                    const retryResponse = await fetch(
                        `http://localhost:3000/api/player/${username}/vehicles`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    if (!retryResponse.ok) {
                        const retryErrorText = await retryResponse.text();
                        throw new Error(
                            `HTTP ${retryResponse.status}: Failed to fetch vehicles after token refresh - ${retryErrorText}`
                        );
                    }
                    const retryData = await retryResponse.json();
                    console.log(
                        "Retry API vehicles response:",
                        JSON.stringify(retryData, null, 2)
                    );
                    if (!Array.isArray(retryData.vehicles)) {
                        console.warn(
                            "Retry API returned invalid vehicles array:",
                            retryData
                        );
                        setErrorMessage("No vehicles found in database");
                        return [];
                    }
                    const vehicles = retryData.vehicles
                        .filter((v: any) => {
                            const isValid =
                                v.id &&
                                v.player_id &&
                                v.type &&
                                v.status &&
                                ["active", "parked", "garage", "new"].includes(
                                    v.status
                                ) &&
                                Array.isArray(v.coords) &&
                                v.coords.length === 2 &&
                                typeof v.coords[0] === "number" &&
                                typeof v.coords[1] === "number";
                            if (!isValid) {
                                console.warn("Invalid vehicle data:", v);
                            }
                            return isValid;
                        })
                        .map((v: any) => ({
                            id: v.id.toString(),
                            player_id: v.player_id,
                            type: v.type,
                            status: v.status as
                                | "active"
                                | "parked"
                                | "garage"
                                | "new",
                            coords: [v.coords[0], v.coords[1]] as [
                                number,
                                number
                            ],
                            dest: v.dest
                                ? ([v.dest[0], v.dest[1]] as [number, number])
                                : null,
                            wear: v.wear,
                            battery: v.battery,
                            mileage: v.mileage,
                            tire_mileage: v.tire_mileage,
                            purchase_date: v.purchase_date,
                            delivery_timestamp: v.delivery_timestamp,
                            cost: v.cost,
                            created_at: v.created_at,
                            updated_at: v.updated_at,
                        }));
                    console.log(
                        "Fetched",
                        vehicles.length,
                        "valid vehicles from retry API:",
                        vehicles
                    );
                    if (vehicles.length === 0) {
                        setErrorMessage("No valid vehicles found in database");
                    }
                    return vehicles;
                }
                throw new Error(
                    `HTTP ${response.status}: Failed to fetch vehicles - ${errorText}`
                );
            }
            const data = await response.json();
            console.log(
                "API vehicles response:",
                JSON.stringify(data, null, 2)
            );
            if (!Array.isArray(data.vehicles)) {
                console.warn("API returned invalid vehicles array:", data);
                setErrorMessage("No vehicles found in database");
                return [];
            }
            const vehicles = data.vehicles
                .filter((v: any) => {
                    const isValid =
                        v.id &&
                        v.player_id &&
                        v.type &&
                        v.status &&
                        ["active", "parked", "garage", "new"].includes(
                            v.status
                        ) &&
                        Array.isArray(v.coords) &&
                        v.coords.length === 2 &&
                        typeof v.coords[0] === "number" &&
                        typeof v.coords[1] === "number";
                    if (!isValid) {
                        console.warn("Invalid vehicle data:", v);
                    }
                    return isValid;
                })
                .map((v: any) => ({
                    id: v.id.toString(),
                    player_id: v.player_id,
                    type: v.type,
                    status: v.status as "active" | "parked" | "garage" | "new",
                    coords: [v.coords[0], v.coords[1]] as [number, number],
                    dest: v.dest
                        ? ([v.dest[0], v.dest[1]] as [number, number])
                        : null,
                    wear: v.wear,
                    battery: v.battery,
                    mileage: v.mileage,
                    tire_mileage: v.tire_mileage,
                    purchase_date: v.purchase_date,
                    delivery_timestamp: v.delivery_timestamp,
                    cost: v.cost,
                    created_at: v.created_at,
                    updated_at: v.updated_at,
                }));
            console.log(
                "Fetched",
                vehicles.length,
                "valid vehicles from API:",
                vehicles
            );
            if (vehicles.length === 0) {
                setErrorMessage("No valid vehicles found in database");
            }
            return vehicles;
        } catch (error) {
            if (retries > 0) {
                console.warn(
                    `Retrying fetch (/api/player/${username}/vehicles), ${retries} attempts left`
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                return fetchVehicles(retries - 1, delay * 2);
            }
            console.error(
                `Failed to fetch vehicles from /api/player/${username}/vehicles:`,
                error
            );
            setErrorMessage(`Failed to fetch vehicles: ${error.message}`);
            return [];
        }
    };

    /**
     * Handles registration form close and triggers vehicle fetch post-login.
     */
    const handleClose = () => {
        console.log("Registration window close triggered");
        setIsRegisterOpen(false);
        setIsLoggedIn(!!localStorage.getItem("jwt_token"));
    };

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
        if (action === "register" || action === "login") {
            setIsRegisterOpen(true);
            setIsPopupOpen(false);
        } else if (action === "logout") {
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("registerData");
            localStorage.removeItem("username");
            localStorage.removeItem("player_id");
            setIsLoggedIn(false);
            setIsPopupOpen(false);
            setIsRegisterOpen(true);
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
     * Initializes top menu and map, fetches vehicles on login.
     */
    useEffect(() => {
        const appElement = document.getElementById("app");
        if (!appElement) {
            console.error("Root element #app not found in index.html");
            setErrorMessage("Root element not found");
            return;
        }

        if (topMenuRef.current) {
            topMenuRef.current.appendChild(createTopMenu());
        }

        const mapElement = document.getElementById("map-area");
        if (!mapElement) {
            console.error("Map container #map-area not found");
            setErrorMessage("Map container not found");
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
            } catch (error) {
                console.error("Failed to initialize Leaflet map:", error);
                setErrorMessage("Failed to initialize map");
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
     * Fetches vehicles when logged in and updates state.
     */
    useEffect(() => {
        if (!isLoggedIn) {
            console.log("No vehicles rendered pre-login");
            setVehicles([]);
            setIsLoadingVehicles(false);
            return;
        }

        const loadVehicles = async () => {
            setIsLoadingVehicles(true);
            console.log("Triggering vehicle fetch on login state change");
            const fetchedVehicles = await fetchVehicles();
            console.log(`Vehicles fetched: ${fetchedVehicles.length}`);
            setVehicles(fetchedVehicles);
            let playerData: any;
            try {
                playerData = JSON.parse(
                    localStorage.getItem("player_1") || "{}"
                );
            } catch (error) {
                console.error("Failed to parse player_1 data:", error);
                setErrorMessage("Failed to load player data");
                playerData = {
                    fleet: [],
                    bank_balance: 10000.0,
                    garages: [],
                };
            }
            playerData.fleet = fetchedVehicles;
            localStorage.setItem("player_1", JSON.stringify(playerData));
            console.log(
                "Stored",
                fetchedVehicles.length,
                "vehicles in localStorage"
            );
            setIsLoadingVehicles(false);
        };

        loadVehicles();
    }, [isLoggedIn]);

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
                {!isLoadingVehicles && (
                    <MapManager
                        vehicles={vehicles}
                        setErrorMessage={setErrorMessage}
                        mapRef={mapRef}
                    />
                )}
                <CyberFooter />
                {isRegisterOpen && <RegisterForm onClose={handleClose} />}
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
