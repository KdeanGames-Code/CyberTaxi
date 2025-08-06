/**
 * main.tsx - Main entry point for CyberTaxi game.
 * Renders map, top menu, registration form, footer, browser, and context menu.
 * @module Main
 * @version 0.2.7
 */

import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { RegisterForm } from "./components/onboarding/register-form";
import { CyberFooter } from "./components/ui/CyberFooter";
import { AboutPortal } from "./components/ui/AboutPortal";
import { CyberBrowser } from "./components/ui/CyberBrowser";
import { PopupMenu } from "./components/ui/PopupMenu";
import { createTopMenu } from "./components/TopMenu";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createTileLayer } from "./components/map/map-tiles";
import { createVehicleMarker } from "./components/map/vehicle-markers";
import type { Vehicle } from "./components/map/vehicle-markers";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import "./styles/global.css";

/**
 * Error Boundary Component to catch and display runtime errors.
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
 * Initializes map, top menu, modals, and context menu.
 * @returns {JSX.Element} Main game interface.
 */
const App: React.FC = () => {
    const topMenuRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.MarkerClusterGroup | null>(null);
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

    // Update login state
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

    // Decode JWT token for debugging
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

    // Refresh JWT token
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

    // Fetch vehicles from API
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

    // Render vehicles to map
    const renderVehicles = (vehicles: Vehicle[]) => {
        const markers = markersRef.current;
        const map = mapRef.current;
        if (!map || !markers) {
            console.error("Map or markers not initialized");
            setErrorMessage("Map initialization failed");
            return;
        }
        markers.clearLayers();
        if (vehicles.length === 0) {
            console.warn("No player vehicles to render");
            return;
        }
        console.log(
            "Rendering",
            vehicles.length,
            "player vehicles post-login:",
            vehicles
        );
        vehicles.forEach((vehicle: Vehicle) => {
            try {
                if (
                    !vehicle.coords ||
                    !Array.isArray(vehicle.coords) ||
                    vehicle.coords.length !== 2 ||
                    typeof vehicle.coords[0] !== "number" ||
                    typeof vehicle.coords[1] !== "number" ||
                    vehicle.coords[0] < -90 ||
                    vehicle.coords[0] > 90 ||
                    vehicle.coords[1] < -180 ||
                    vehicle.coords[1] > 180
                ) {
                    console.error(
                        `Invalid coordinates for vehicle ${vehicle.id}:`,
                        vehicle.coords
                    );
                    return;
                }
                console.log("Creating marker for vehicle:", vehicle);
                const marker = createVehicleMarker(vehicle);
                console.log(
                    `Adding vehicle marker for ${vehicle.id} at ${vehicle.coords} with type ${vehicle.type}`
                );
                markers.addLayer(marker);
                // Debug: Add marker directly to map to check visibility
                map.addLayer(marker);
                console.log(
                    `Marker visibility for ${vehicle.id}: added to map and cluster`
                );
            } catch (error) {
                console.error(
                    `Failed to create vehicle marker for ${vehicle.id}:`,
                    error
                );
            }
        });
        console.log(
            "Vehicle cluster group updated with",
            vehicles.length,
            "vehicles"
        );
        markers.on("click", (e) => {
            console.log(
                "Vehicle cluster clicked:",
                e.layer.getAllChildMarkers().length,
                "vehicles"
            );
        });
        map.invalidateSize(); // Force map re-render
        if (markers.getBounds().isValid()) {
            map.fitBounds(markers.getBounds(), { padding: [50, 50] }); // Zoom to markers
            console.log("Map zoomed to marker bounds:", markers.getBounds());
        } else {
            console.warn("Invalid marker bounds, skipping fitBounds");
        }
    };

    // Handle registration window close and fetch vehicles
    const handleClose = () => {
        console.log("Registration window close triggered");
        setIsRegisterOpen(false);
        setIsLoggedIn(!!localStorage.getItem("jwt_token"));
        if (localStorage.getItem("jwt_token")) {
            console.log("Triggering vehicle fetch post-login");
            fetchVehicles().then((vehicles) => {
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
                playerData.fleet = vehicles;
                localStorage.setItem("player_1", JSON.stringify(playerData));
                console.log(
                    "Stored",
                    vehicles.length,
                    "vehicles in localStorage"
                );
                renderVehicles(vehicles);
            });
        }
    };

    // Toggle CyberBrowser and PopupMenu
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

    // Handle Taxi logo click
    const handleTaxiClick = (e: CustomEvent) => {
        console.log("click-taxi received at x:", e.detail.x, "y:", e.detail.y);
        setPopupPosition({ x: e.detail.x, y: e.detail.y });
        setPopupContext("top-menu");
        setIsPopupOpen(true);
    };

    // Handle PopupMenu item selection
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

    // Expose toggle function and listen for click-taxi
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

    // Initialize map and vehicles
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
        let map: L.Map;
        try {
            map = L.map("map-area", {
                zoomControl: false,
            }).setView([30.2672, -97.7431], 12);
            mapRef.current = map;
            createTileLayer("dark").addTo(map);
            map.invalidateSize();
            console.log("Map initialized successfully");
        } catch (error) {
            console.error("Failed to initialize Leaflet map:", error);
            setErrorMessage("Failed to initialize map");
            return;
        }

        const markers = L.markerClusterGroup({
            iconCreateFunction: (cluster) => {
                const childCount = cluster.getChildCount();
                console.log("Cluster rendering with", childCount, "vehicles");
                return L.divIcon({
                    html: `<div class="custom-marker vehicle-cluster-custom" style="background: #D4A017; color: #F5F5F5; border: 2px solid #E8B923; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">${childCount}</div>`,
                    className: "",
                    iconSize: [30, 30],
                });
            },
            maxClusterRadius: 50,
        });
        markersRef.current = markers;
        map.addLayer(markers);

        // Render player vehicles post-login
        if (isLoggedIn) {
            console.log("Triggering vehicle fetch on initial load");
            fetchVehicles().then((vehicles) => {
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
                playerData.fleet = vehicles;
                localStorage.setItem("player_1", JSON.stringify(playerData));
                console.log(
                    "Stored",
                    vehicles.length,
                    "vehicles in localStorage"
                );
                renderVehicles(vehicles);
            });
        } else {
            console.log("No vehicles rendered pre-login");
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
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
                <div id="about-portal"></div>
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
