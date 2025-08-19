// src/components/mapping/mapping-tiles.ts
/**
 * @file mapping-tiles.ts
 * @description Modular tile layer utility for CyberTaxi map.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.2
 * @note Creates a Leaflet tile layer with backend tiles and OpenStreetMap fallback, per GDD v1.1.
 * @detail Uses API_CONFIG.BASE_URL/tiles/dark/{z}/{x}/{y}.png, falls back to OSM on error.
 */
import L from "leaflet";
import { API_CONFIG } from "../../config/apiConfig";

/**
 * Creates a Leaflet tile layer with error handling.
 * @param style - Tile style (default: "dark").
 * @returns {L.TileLayer} Configured tile layer.
 */
export function createTileLayer(style = "dark"): L.TileLayer {
    const customUrl = `${API_CONFIG.BASE_URL}/tiles/${style}/{z}/{x}/{y}.png`; // Backend tile endpoint
    const fallbackUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"; // OSM fallback
    try {
        const tileLayer = L.tileLayer(customUrl, {
            attribution: "Custom Tiles © CyberTaxi Team",
            maxZoom: 18,
            errorTileUrl: "", // Prevent broken tile images
        });
        tileLayer.on("tileerror", (error) => {
            console.error("mapping-tiles: Custom tile load error:", error);
            tileLayer.setUrl(fallbackUrl);
            tileLayer.options.attribution =
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
        });
        tileLayer.on("load", () => {
            console.log(
                `mapping-tiles: Loaded tiles for style ${style} with full road detail and labels`
            );
        });
        return tileLayer;
    } catch (error) {
        console.error("mapping-tiles: Tile layer creation error:", error);
        return L.tileLayer(fallbackUrl, {
            attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
        });
    }
}