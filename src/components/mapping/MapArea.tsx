// src/components/mapping/MapArea.tsx
/**
 * @file MapArea.tsx
 * @description Leaflet map component for CyberTaxi, displaying a map or splash screen based on login state.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.7
 * @note Renders a splash screen when logged out, or a Leaflet map with player vehicle markers when logged in, per GDD v1.1.
 * @detail Centers on Austin (lat: 30.2672, lng: -97.7431, zoom: 12), uses mapping-tiles.ts and VehicleMarkers.ts.
 */
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster";
import { createTileLayer } from "./mapping-tiles";
import { usePlayerVehicles } from "./usePlayerVehicles";
import { createVehicleMarker } from "./VehicleMarkers";
import "../../styles/mapping/MapArea.css";
import "../../styles/mapping/SplashScreen.css";

/**
 * Props for MapArea component.
 * @interface MapAreaProps
 */
interface MapAreaProps {
    isLoggedIn: boolean; // Login state to trigger zoom and vehicle fetch
}

/**
 * Renders a splash screen or Leaflet map based on login state.
 * @param {MapAreaProps} props - Component props.
 * @returns {JSX.Element} Splash screen or map container element.
 */
export const MapArea: React.FC<MapAreaProps> = ({ isLoggedIn }) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
    const { vehicles, errorMessage } = usePlayerVehicles(isLoggedIn);

    useEffect(() => {
        if (!isLoggedIn) {
            console.log("MapArea: Skipping map initialization, user not logged in");
            return;
        }
        if (mapContainerRef.current && !mapRef.current) {
            try {
                // Initialize map centered on Austin, TX (lat: 30.2672, lng: -97.7431)
                mapRef.current = L.map(mapContainerRef.current, {
                    center: [30.2672, -97.7431],
                    zoom: 12,
                    zoomControl: false, // Disable zoom controls
                    attributionControl: true,
                });

                // Add tile layer
                const tileLayer = createTileLayer("dark");
                tileLayer.addTo(mapRef.current);
                console.log("MapArea: Initialized map with dark tiles centered on Austin");

                // Initialize marker cluster group
                if (typeof L.markerClusterGroup === "function") {
                    clusterRef.current = L.markerClusterGroup({
                        showCoverageOnHover: true,
                        zoomToBoundsOnClick: true,
                        spiderfyOnMaxZoom: true,
                        maxClusterRadius: 50,
                        iconCreateFunction: (cluster) => {
                            const childCount = cluster.getChildCount();
                            console.log(`MapArea: Rendering cluster with ${childCount} vehicles`);
                            return L.divIcon({
                                html: `<div class="custom-marker vehicle-cluster-custom" style="background: #D4A017; color: #F5F5F5; border: 2px solid #E8B923; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">${childCount}</div>`,
                                className: "",
                                iconSize: [30, 30],
                            });
                        },
                    });
                    mapRef.current.addLayer(clusterRef.current);
                    console.log("MapArea: Initialized marker cluster group");
                } else {
                    console.warn("MapArea: leaflet.markercluster not available, skipping clustering");
                }

                // Ensure map size is correct
                mapRef.current.invalidateSize();
            } catch (error) {
                console.error("MapArea: Failed to initialize map:", error);
            }
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                clusterRef.current = null;
                console.log("MapArea: Cleaned up map and cluster");
            }
        };
    }, [isLoggedIn]);

    // Zoom to Austin on isLoggedIn change
    useEffect(() => {
        if (mapRef.current && isLoggedIn) {
            try {
                mapRef.current.setView([30.2672, -97.7431], 12, { animate: true });
                console.log("MapArea: Zoomed to Austin on login");
            } catch (error) {
                console.error("MapArea: Failed to zoom on login:", error);
            }
        }
    }, [isLoggedIn]);

    // Render player vehicle markers
    useEffect(() => {
        if (!isLoggedIn || !mapRef.current || !clusterRef.current) {
            console.log("MapArea: Skipping vehicle render - not logged in or map/cluster not ready");
            return;
        }
        clusterRef.current.clearLayers();
        console.log(`MapArea: Rendering ${vehicles.length} player vehicles`);
        vehicles.forEach((vehicle) => {
            if (
                vehicle.coords &&
                Array.isArray(vehicle.coords) &&
                vehicle.coords.length === 2 &&
                typeof vehicle.coords[0] === "number" &&
                typeof vehicle.coords[1] === "number" &&
                vehicle.coords[0] >= -90 &&
                vehicle.coords[0] <= 90 &&
                vehicle.coords[1] >= -180 &&
                vehicle.coords[1] <= 180
            ) {
                const type = isLoggedIn ? "player" : "other";
                const marker = createVehicleMarker(vehicle, type);
                clusterRef.current!.addLayer(marker);
                console.log(`MapArea: Added marker for vehicle ${vehicle.id} (${type})`);
            } else {
                console.warn(`MapArea: Invalid coordinates for vehicle ${vehicle.id}:`, vehicle.coords);
            }
        });
        if (errorMessage && vehicles.length === 0) {
            console.error("MapArea: Vehicle fetch error:", errorMessage);
        }
    }, [vehicles, isLoggedIn]);

    return (
        <div
            className={isLoggedIn ? "map-area" : "splash-screen"}
            ref={mapContainerRef}
            role={isLoggedIn ? "region" : "banner"}
            aria-label={isLoggedIn ? "CyberTaxi map centered on Austin" : "CyberTaxi splash screen"}
        >
            {!isLoggedIn && (
                <div className="splash-content">
                    <div className="splash-text">
                    <h1>CyberTaxi: Own the Roads!</h1>
                    <img src="src/assets/SplashScreen.jpg" alt="CyberTaxi Splash Screen" className="splash-image" />
                    
                        <p className="version">Version 0.2.27</p>
                        <p>Welcome to the future of autonomous taxi management!<br />
                        Log in to manage your fleet in a NeonGrid world.</p>
                        <p>Created by Kevin-Dean Livingstone & CyberTaxi Team</p>
                        <p>Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI</p>
                        <p className="copyright">&copy; 2025 CyberTaxi. All rights reserved.</p>
                    </div>
                </div>
            )}
        </div>
    );
};