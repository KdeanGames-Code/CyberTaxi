// src/components/mapping/MapArea.tsx
/**
 * @file MapArea.tsx
 * @description Leaflet map component for CyberTaxi, displaying a map centered on Austin, TX.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.2
 * @note Renders a Leaflet map with dark tiles from backend or OpenStreetMap fallback, zooms on login, per GDD v1.1.
 * @detail Centers on Austin (lat: 30.2672, lng: -97.7431, zoom: 12), uses mapping-tiles.ts.
 */
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createTileLayer } from "./mapping-tiles";
import "../../styles/mapping/MapArea.css";

/**
 * Props for MapArea component.
 * @interface MapAreaProps
 */
interface MapAreaProps {
    isLoggedIn: boolean; // Login state to trigger zoom
}

/**
 * Renders a Leaflet map centered on Austin, TX, with zoom on login.
 * @param {MapAreaProps} props - Component props.
 * @returns {JSX.Element} Map container element.
 */
export const MapArea: React.FC<MapAreaProps> = ({ isLoggedIn }) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            try {
                // Initialize map centered on Austin, TX (lat: 30.2672, lng: -97.7431)
                mapRef.current = L.map(mapContainerRef.current, {
                    center: [30.2672, -97.7431],
                    zoom: 12,
                    zoomControl: true,
                    attributionControl: true,
                });

                // Add tile layer
                const tileLayer = createTileLayer("dark");
                tileLayer.addTo(mapRef.current);
                console.log("MapArea: Initialized map with dark tiles centered on Austin");

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
                console.log("MapArea: Cleaned up map");
            }
        };
    }, []);

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

    return (
        <div
            className="map-area"
            ref={mapContainerRef}
            role="region"
            aria-label="CyberTaxi map centered on Austin"
        />
    );
};