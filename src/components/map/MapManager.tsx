/**
 * MapManager.tsx - Manages vehicle marker rendering and clustering for the CyberTaxi map.
 * Integrates with Leaflet map initialized in main.tsx, rendering player and non-player vehicles as markers with clustering, per GDD v1.1.
 * Uses /api/player/:username/vehicles for player vehicles and /api/vehicles/others for non-player vehicles.
 * @module MapManager
 * @version 0.3.4
 */
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import type { LatLngTuple, Map, MarkerClusterGroup } from "leaflet";
import "leaflet.markercluster";
import { createVehicleMarker } from "./vehicle-markers";
import type { Vehicle } from "./vehicle-markers";

/**
 * Props for the MapManager component.
 * @interface MapManagerProps
 */
interface MapManagerProps {
    vehicles: Vehicle[]; // Player vehicles
    setErrorMessage: (message: string | null) => void; // Sets error messages in UI
    mapRef: React.MutableRefObject<Map | null>; // Reference to Leaflet map
}

/**
 * Renders vehicle markers on a Leaflet map with clustering for player and non-player vehicles.
 * @param props - Component props.
 * @returns null - No DOM output, manages markers only.
 */
export const MapManager: React.FC<MapManagerProps> = ({
    vehicles,
    setErrorMessage,
    mapRef,
}) => {
    const playerClusterRef = useRef<MarkerClusterGroup | null>(null);
    const otherClusterRef = useRef<MarkerClusterGroup | null>(null);

    /**
     * Initializes marker cluster groups for player and non-player vehicles.
     */
    useEffect(() => {
        if (mapRef.current && !playerClusterRef.current) {
            playerClusterRef.current = L.markerClusterGroup({
                iconCreateFunction: (cluster) => {
                    const childCount = cluster.getChildCount();
                    console.log(
                        `Player cluster rendering with ${childCount} vehicles`
                    );
                    return L.divIcon({
                        html: `<div class="custom-marker vehicle-cluster-custom" style="background: #D4A017; color: #F5F5F5; border: 2px solid #E8B923; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">${childCount}</div>`,
                        className: "",
                        iconSize: [30, 30],
                    });
                },
                maxClusterRadius: 50,
            });
            mapRef.current.addLayer(playerClusterRef.current);
            console.log("Marker cluster initialized for player vehicles");
        }
        if (mapRef.current && !otherClusterRef.current) {
            otherClusterRef.current = L.markerClusterGroup({
                iconCreateFunction: (cluster) => {
                    const childCount = cluster.getChildCount();
                    console.log(
                        `Other cluster rendering with ${childCount} vehicles`
                    );
                    return L.divIcon({
                        html: `<div class="custom-marker vehicle-cluster-custom" style="background: #4b0082; color: #F5F5F5; border: 2px solid #E8B923; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">${childCount}</div>`,
                        className: "",
                        iconSize: [30, 30],
                    });
                },
                maxClusterRadius: 50,
            });
            mapRef.current.addLayer(otherClusterRef.current);
            console.log("Marker cluster initialized for other vehicles");
        }
        return () => {
            if (mapRef.current && playerClusterRef.current) {
                mapRef.current.removeLayer(playerClusterRef.current);
                playerClusterRef.current = null;
            }
            if (mapRef.current && otherClusterRef.current) {
                mapRef.current.removeLayer(otherClusterRef.current);
                otherClusterRef.current = null;
            }
        };
    }, [mapRef]);

    /**
     * Fetches and renders non-player vehicles from /api/vehicles/others.
     */
    useEffect(() => {
        const fetchOtherVehicles = async () => {
            const token = localStorage.getItem("jwt_token");
            if (!token) {
                console.error("No JWT token found for other vehicles");
                setErrorMessage(
                    "Authentication required to fetch other vehicles"
                );
                return;
            }
            try {
                const response = await fetch(
                    "http://localhost:3000/api/vehicles/others",
                    {
                        method: "GET",
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(
                        `Other vehicles fetch failed: ${errorText}`
                    );
                }
                const data = await response.json();
                console.log(
                    "Other vehicles API response:",
                    JSON.stringify(data, null, 2)
                );
                if (
                    data.status === "Success" &&
                    otherClusterRef.current &&
                    mapRef.current
                ) {
                    otherClusterRef.current.clearLayers();
                    data.vehicles.forEach((vehicle: Vehicle) => {
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
                            const marker = createVehicleMarker(
                                vehicle,
                                "other"
                            );
                            otherClusterRef.current!.addLayer(marker);
                            console.log(
                                `Adding other vehicle marker for ${vehicle.id} at ${vehicle.coords}`
                            );
                        } else {
                            console.warn(
                                `Invalid coordinates for other vehicle ${vehicle.id}:`,
                                vehicle.coords
                            );
                        }
                    });
                    mapRef.current.addLayer(otherClusterRef.current);
                    console.log("Other vehicle cluster group added to map");
                } else {
                    console.error("Other vehicles fetch failed:", data.message);
                    setErrorMessage(
                        data.message || "Failed to fetch other vehicles"
                    );
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Unknown network issue";
                console.error("Other vehicles fetch error:", errorMessage);
                setErrorMessage(
                    "Network issue fetching other vehicles: " + errorMessage
                );
            }
        };

        if (mapRef.current) {
            fetchOtherVehicles();
        }
    }, [mapRef, setErrorMessage]);

    /**
     * Renders player vehicles and adjusts map view.
     */
    useEffect(() => {
        console.log(`MapManager received ${vehicles.length} vehicles`);
        if (
            !mapRef.current ||
            !playerClusterRef.current ||
            vehicles.length === 0
        ) {
            if (vehicles.length === 0) {
                console.log("Skipping empty vehicle render");
            } else {
                console.log("Skipping render: map or player markers not ready");
            }
            return;
        }

        playerClusterRef.current.clearLayers();
        console.log(
            `Rendering ${vehicles.length} player vehicles post-login:`,
            vehicles
        );

        const bounds: LatLngTuple[] = [];
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
                console.log("Creating marker for vehicle:", vehicle);
                const marker = createVehicleMarker(vehicle, "player");
                playerClusterRef.current!.addLayer(marker);
                console.log(
                    `Adding vehicle marker for ${vehicle.id} at ${vehicle.coords} with type ${vehicle.type}`
                );
                console.log(
                    `Marker visibility for ${vehicle.id}: added to map and cluster`
                );
                bounds.push(vehicle.coords as LatLngTuple);
            } else {
                console.warn(
                    `Invalid coordinates for vehicle ${vehicle.id}:`,
                    vehicle.coords
                );
            }
        });

        console.log(
            `Player cluster rendering with ${vehicles.length} vehicles`
        );
        mapRef.current.addLayer(playerClusterRef.current);
        console.log(
            `Vehicle cluster group updated with ${vehicles.length} vehicles`
        );

        playerClusterRef.current.on("clusterclick", (e) => {
            console.log(
                `Player cluster click handled: ${
                    e.layer.getAllChildMarkers().length
                } vehicles`
            );
        });
        playerClusterRef.current.on("click", (e) => {
            if (!e.layer.getAllChildMarkers) {
                console.log(
                    `Player single marker clicked: vehicle ID ${
                        (e.layer.options as any).vehicleId || "unknown"
                    }`
                );
            }
        });

        otherClusterRef.current?.on("clusterclick", (e) => {
            console.log(
                `Other cluster click handled: ${
                    e.layer.getAllChildMarkers().length
                } vehicles`
            );
        });
        otherClusterRef.current?.on("click", (e) => {
            if (!e.layer.getAllChildMarkers) {
                console.log(
                    `Other single marker clicked: vehicle ID ${
                        (e.layer.options as any).vehicleId || "unknown"
                    }`
                );
            }
        });

        if (bounds.length > 0) {
            mapRef.current.fitBounds(L.latLngBounds(bounds), {
                padding: [50, 50],
            });
            console.log(
                "Map zoomed to marker bounds:",
                mapRef.current.getBounds()
            );
        } else {
            console.warn(
                "No valid bounds for player vehicles, skipping fitBounds"
            );
        }
        console.log(
            `Marker rendering completed for ${vehicles.length} vehicles`
        );
        console.log(`MapManager rendered ${vehicles.length} vehicles`);
    }, [vehicles, mapRef]);

    return null;
};
