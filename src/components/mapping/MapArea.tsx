// src/components/mapping/MapArea.tsx
/**
 * @file MapArea.tsx
 * @description Leaflet map component for CyberTaxi, displaying a map centered on Austin, TX.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.1
 * @note Renders a Leaflet map with dark tiles from backend or OpenStreetMap fallback, per GDD v1.1.
 * @detail Centers on Austin (lat: 30.2672, lng: -97.7431, zoom: 12), uses mapping-tiles.ts.
 */
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createTileLayer } from "./mapping-tiles";
import "../../styles/mapping/MapArea.css";

/**
 * Props for MapArea component (none required).
 * @interface MapAreaProps
 */
interface MapAreaProps {}

/**
 * Renders a Leaflet map centered on Austin, TX.
 * @returns {JSX.Element} Map container element.
 */
export const MapArea: React.FC<MapAreaProps> = () => {
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

    return (
        <div
            className="map-area"
            ref={mapContainerRef}
            role="region"
            aria-label="CyberTaxi map centered on Austin"
        />
    );
};