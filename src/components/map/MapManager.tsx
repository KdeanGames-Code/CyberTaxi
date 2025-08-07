/**
 * MapManager.tsx - Manages vehicle marker rendering and clustering for the CyberTaxi map.
 * Integrates with Leaflet map initialized in main.tsx, rendering player vehicles as markers with clustering, per GDD v1.1.
 * @module MapManager
 * @version 0.3.0
 */

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { createVehicleMarker } from "./vehicle-markers";
import type { Vehicle } from "./vehicle-markers";

/**
 * Props for the MapManager component.
 * @interface MapManagerProps
 * @property {Vehicle[]} vehicles - Array of vehicle data to render as markers.
 * @property {(message: string | null) => void} setErrorMessage - Function to set error messages in the UI.
 * @property {React.MutableRefObject<L.Map | null>} mapRef - Reference to the Leaflet map instance from main.tsx.
 */
interface MapManagerProps {
    vehicles: Vehicle[];
    setErrorMessage: (message: string | null) => void;
    mapRef: React.MutableRefObject<L.Map | null>;
}

/**
 * MapManager component to render vehicle markers on a Leaflet map with clustering.
 * Initializes a marker cluster group and renders vehicles as markers, handling click events for clusters and individual markers.
 * @param {MapManagerProps} props - Component props.
 * @returns {null} - No DOM output, manages markers only.
 */
export const MapManager: React.FC<MapManagerProps> = ({
    vehicles,
    setErrorMessage,
    mapRef,
}) => {
    const markersRef = useRef<L.MarkerClusterGroup | null>(null);

    /**
     * Initializes the marker cluster group.
     * Creates a MarkerClusterGroup and adds it to the map when mapRef.current is ready.
     * Handles cleanup on unmount.
     * @returns {void}
     */
    useEffect(() => {
        if (mapRef.current && !markersRef.current) {
            markersRef.current = L.markerClusterGroup({
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
            mapRef.current.addLayer(markersRef.current);
            console.log("Marker cluster initialized");
        }

        return () => {
            if (mapRef.current && markersRef.current) {
                mapRef.current.removeLayer(markersRef.current);
                markersRef.current = null;
            }
        };
    }, [mapRef]);

    /**
     * Renders vehicle markers on the map with clustering.
     * Clears existing markers, validates vehicle coordinates, and adds new markers to the cluster group.
     * Handles cluster and marker click events, zooming to cluster bounds if valid.
     * @param {Vehicle[]} vehicles - Array of vehicle data to render.
     * @returns {void}
     */
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
            `Rendering ${vehicles.length} player vehicles post-login:`,
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
            `Vehicle cluster group updated with ${vehicles.length} vehicles`
        );

        // Handle cluster clicks
        markers.on("clusterclick", (e) => {
            const childCount = e.layer.getAllChildMarkers().length;
            console.log(`Cluster click handled: ${childCount} vehicles`);
        });

        // Handle individual marker clicks
        markers.on("click", (e) => {
            if (!e.layer.getAllChildMarkers) {
                console.log(
                    `Single marker clicked: vehicle ID ${
                        e.layer.options?.vehicleId || "unknown"
                    }`
                );
            }
        });

        if (markers.getBounds().isValid()) {
            map.fitBounds(markers.getBounds(), { padding: [50, 50] });
            console.log("Map zoomed to marker bounds:", markers.getBounds());
        } else {
            console.warn("Invalid marker bounds, skipping fitBounds");
        }
        console.log(
            `Marker rendering completed for ${vehicles.length} vehicles`
        );
    };

    // Render vehicles when vehicles or markers are ready
    useEffect(() => {
        console.log(`MapManager received ${vehicles.length} vehicles`);
        if (!mapRef.current || !markersRef.current) {
            console.log("Skipping render: map or markers not ready");
            return;
        }
        renderVehicles(vehicles);
        console.log(`MapManager rendered ${vehicles.length} vehicles`);
    }, [vehicles, mapRef, markersRef, setErrorMessage]);

    return null; // No DOM output, just manages markers
};
