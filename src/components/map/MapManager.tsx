/**
 * MapManager.tsx - Manages vehicle marker rendering and clustering for the CyberTaxi map.
 * Integrates with Leaflet map initialized in main.tsx, rendering player and non-player vehicles in a single cluster, per GDD v1.1.
 * Uses /api/player/:username/vehicles for player vehicles and /api/vehicles/others for non-player vehicles.
 * @module MapManager
 * @version 0.3.6
 */
import React, { useEffect, useRef, useState } from "react";
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
 * Renders vehicle markers on a Leaflet map with a single cluster for player and non-player vehicles.
 * @param props - Component props.
 * @returns null - No DOM output, manages markers only.
 */
export const MapManager: React.FC<MapManagerProps> = ({
    vehicles,
    setErrorMessage,
    mapRef,
}) => {
    const clusterRef = useRef<MarkerClusterGroup | null>(null);
    const [otherVehicles, setOtherVehicles] = useState<Vehicle[]>([]);
    const [hasZoomed, setHasZoomed] = useState(false); // Track initial zoom

    /**
     * Initializes a single marker cluster group for all vehicles.
     */
    useEffect(() => {
        if (mapRef.current && !clusterRef.current) {
            clusterRef.current = L.markerClusterGroup({
                iconCreateFunction: (cluster) => {
                    const childCount = cluster.getChildCount();
                    console.log(
                        `Cluster rendering with ${childCount} vehicles`
                    );
                    return L.divIcon({
                        html: `<div class="custom-marker vehicle-cluster-custom" style="background: #D4A017; color: #F5F5F5; border: 2px solid #E8B923; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">${childCount}</div>`,
                        className: "",
                        iconSize: [30, 30],
                    });
                },
                maxClusterRadius: 50,
            });
            mapRef.current.addLayer(clusterRef.current);
            console.log("Marker cluster initialized for all vehicles");
        }
        return () => {
            if (mapRef.current && clusterRef.current) {
                mapRef.current.removeLayer(clusterRef.current);
                clusterRef.current = null;
            }
        };
    }, [mapRef]);

    /**
     * Fetches non-player vehicles from /api/vehicles/others.
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
                if (data.status === "Success") {
                    const validVehicles = data.vehicles.filter(
                        (vehicle: Vehicle) =>
                            vehicle.coords &&
                            Array.isArray(vehicle.coords) &&
                            vehicle.coords.length === 2 &&
                            typeof vehicle.coords[0] === "number" &&
                            typeof vehicle.coords[1] === "number" &&
                            vehicle.coords[0] >= -90 &&
                            vehicle.coords[0] <= 90 &&
                            vehicle.coords[1] >= -180 &&
                            vehicle.coords[1] <= 180
                    );
                    setOtherVehicles(validVehicles);
                    console.log(
                        `Fetched ${validVehicles.length} valid non-player vehicles`
                    );
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
     * Renders all vehicles (player and non-player) in a single cluster.
     */
    useEffect(() => {
        console.log(
            `MapManager received ${vehicles.length} player vehicles and ${otherVehicles.length} non-player vehicles`
        );
        if (!mapRef.current || !clusterRef.current) {
            console.log("Skipping render: map or cluster not ready");
            return;
        }
        clusterRef.current.clearLayers();
        const allVehicles = [...vehicles, ...otherVehicles];
        if (allVehicles.length === 0) {
            console.log("Skipping empty vehicle render");
            return;
        }
        console.log(
            `Rendering ${allVehicles.length} vehicles (player and non-player):`,
            allVehicles
        );
        const bounds: LatLngTuple[] = [];
        allVehicles.forEach((vehicle, index) => {
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
                const type = index < vehicles.length ? "player" : "other";
                console.log(
                    `Creating marker for vehicle ${vehicle.id} (${type}):`,
                    vehicle
                );
                const marker = createVehicleMarker(vehicle, type);
                clusterRef.current!.addLayer(marker);
                console.log(
                    `Adding vehicle marker for ${vehicle.id} at ${vehicle.coords} with type ${vehicle.type} (${type})`
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
        console.log(`Cluster rendering with ${allVehicles.length} vehicles`);
        mapRef.current.addLayer(clusterRef.current);
        console.log(
            `Vehicle cluster group updated with ${allVehicles.length} vehicles`
        );
        clusterRef.current.on("clusterclick", (e) => {
            console.log(
                `Cluster click handled: ${
                    e.layer.getAllChildMarkers().length
                } vehicles`
            );
            // Zoom only on cluster click
            mapRef.current!.fitBounds(e.layer.getBounds(), {
                padding: [50, 50],
            });
        });
        clusterRef.current.on("click", (e) => {
            if (!e.layer.getAllChildMarkers) {
                console.log(
                    `Single marker clicked: vehicle ID ${
                        (e.layer.options as any).vehicleId || "unknown"
                    }`
                );
            }
        });
        if (bounds.length > 0 && !hasZoomed) {
            mapRef.current.setView(bounds[0], 12); // Set initial view without zoom
            setHasZoomed(true);
            console.log("Map set to initial view without auto-zoom");
        } else if (!bounds.length) {
            console.warn(
                "No valid bounds for vehicles, skipping view adjustment"
            );
        }
        console.log(
            `Marker rendering completed for ${allVehicles.length} vehicles`
        );
        console.log(`MapManager rendered ${allVehicles.length} vehicles`);
    }, [vehicles, otherVehicles, mapRef, hasZoomed]);

    return null;
};
