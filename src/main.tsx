/**
 * main.tsx - Main entry point for CyberTaxi game.
 * Renders map, top menu, registration form, footer, and browser windows.
 * @module main
 */

import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { RegisterForm } from "./components/onboarding/register-form";
import { CyberFooter } from "./components/ui/CyberFooter";
import { AboutPortal } from "./components/ui/AboutPortal";
import { CyberBrowser } from "./components/ui/CyberBrowser";
import { createTopMenu } from "./components/TopMenu";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createTileLayer } from "./components/map/map-tiles";
import {
    createVehicleMarker,
    fetchVehicles,
} from "./components/map/vehicle-markers";
import type { Vehicle } from "./components/map/vehicle-markers";
import {
    createGarageMarker,
    mockGarages,
} from "./components/map/garage-markers";
import { purchaseVehicle } from "./utils/purchase-utils";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import "./styles/global.css";

/**
 * Error Boundary Component to catch and display runtime errors.
 */
class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>> {
    state = { hasError: false };

    static getDerivedStateFromError(error: Error) {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <h1>Something went wrong. Check the console for details.</h1>
            );
        }
        return this.props.children;
    }
}

/**
 * Main App component for CyberTaxi game.
 * Initializes map, top menu, and modals, with purchase test.
 * @returns {JSX.Element} Main game interface.
 */
const App: React.FC = () => {
    const topMenuRef = useRef<HTMLDivElement>(null);
    const [isBrowserOpen, setIsBrowserOpen] = useState(false);

    // Handle registration window close
    const handleClose = () => {
        console.log("Registration window closed");
    };

    // Toggle CyberBrowser
    const handleToggleBrowser = () => {
        setIsBrowserOpen(!isBrowserOpen);
        console.log("CyberBrowser toggled:", !isBrowserOpen);
    };

    // Expose toggle function for CyberFooter
    useEffect(() => {
        (window as any).toggleCyberBrowser = handleToggleBrowser;
        return () => {
            delete (window as any).toggleCyberBrowser;
        };
    }, []);

    // Initialize map and test purchase
    useEffect(() => {
        if (topMenuRef.current) {
            topMenuRef.current.appendChild(createTopMenu());
        }

        const map = L.map("map-area", {
            zoomControl: false,
        }).setView([30.2672, -97.7431], 12);
        createTileLayer("dark").addTo(map);
        map.invalidateSize();
        console.log("Map initialized successfully");

        const vehicleClusterGroup = L.markerClusterGroup({
            iconCreateFunction: (cluster) => {
                const childCount = cluster.getChildCount();
                console.log(
                    "Creating vehicle cluster icon for",
                    childCount,
                    "vehicles"
                );
                return L.divIcon({
                    html: `<div style="background: #D4A017; color: #F5F5F5; border: 2px solid #E8B923; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">${childCount}</div>`,
                    className: "vehicle-cluster-custom",
                    iconSize: [30, 30],
                });
            },
            maxClusterRadius: 50,
        });

        fetchVehicles(1, "active")
            .then((vehicles) => {
                console.log("Fetched vehicles:", vehicles);
                if (vehicles.length === 0) {
                    console.warn("No vehicles returned from API or fallback.");
                }
                vehicles.forEach((vehicle: Vehicle) => {
                    try {
                        const marker = createVehicleMarker(vehicle);
                        console.log(
                            `Adding vehicle marker for ${vehicle.id} at ${vehicle.coords} with type ${vehicle.type}`
                        );
                        vehicleClusterGroup.addLayer(marker);
                    } catch (error) {
                        console.error(
                            `Failed to create vehicle marker for ${vehicle.id}:`,
                            error
                        );
                    }
                });
                map.addLayer(vehicleClusterGroup);
                console.log("Vehicle cluster group added to map");
            })
            .catch((error) => {
                console.error("Failed to fetch vehicles:", error);
                console.log("No vehicle markers added due to fetch failure.");
            });

        console.log("Processing", mockGarages.length, "garage markers");
        mockGarages.forEach((garage) => {
            try {
                const marker = createGarageMarker(garage);
                console.log(
                    `Adding garage marker for ${garage.id} at ${garage.coords}`
                );
                marker.addTo(map);
            } catch (error) {
                console.error(
                    `Failed to create garage marker for ${garage.id}:`,
                    error
                );
            }
        });

        // Test purchase
        localStorage.setItem(
            "player_1",
            JSON.stringify({ bank_balance: 60000.0, fleet: [] })
        );
        const testVehicleData = {
            player_id: "1",
            type: "Model Y",
            cost: 50000,
            status: "new",
            coords: [30.2672, -97.7431],
            wear: 0,
            battery: 100,
            mileage: 0,
        };
        const result = purchaseVehicle(
            testVehicleData.player_id,
            testVehicleData.type
        );
        console.log("Purchase result:", result);

        return () => {
            map.remove();
        };
    }, []);

    return (
        <ErrorBoundary>
            <AboutPortal />
            <div
                className="main-container"
                role="main"
                aria-label="Main game container"
            >
                <div
                    id="top-menu-container"
                    ref={topMenuRef}
                    aria-hidden="true"
                ></div>
                <div id="map-area" aria-label="Map area"></div>
                <div id="about-portal"></div>
                <CyberFooter />
                <RegisterForm onClose={handleClose} />
                {isBrowserOpen && (
                    <CyberBrowser
                        onClose={() => {
                            setIsBrowserOpen(false);
                            console.log("Browser closed");
                        }}
                        playerId="1"
                    />
                )}
            </div>
        </ErrorBoundary>
    );
};

ReactDOM.createRoot(document.getElementById("app")!).render(<App />);
