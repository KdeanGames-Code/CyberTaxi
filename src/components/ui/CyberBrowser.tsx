/**
 * CyberBrowser.tsx - Renders a resizable, draggable browser window for vehicle purchases.
 * Displays Tesla-inspired UI with vehicle images, purchase options, and updated URL, per GDD v1.1.
 * @module CyberBrowser
 */

import React, { useState } from "react";
import { Window } from "./Window";
import { purchaseVehicle } from "../../utils/purchase-utils";

/**
 * Props for the CyberBrowser component.
 * @interface CyberBrowserProps
 * @property {() => void} onClose - Callback to close the browser window.
 * @property {string} playerId - Player ID for purchase operations.
 */
interface CyberBrowserProps {
    onClose: () => void;
    playerId: string;
}

/**
 * CyberBrowser component renders a cyberpunk-styled browser window with purchase UI.
 * Integrates vehicle images and purchase functionality for Model Y and RoboCab.
 * @param {CyberBrowserProps} props - Component props.
 * @returns {JSX.Element} Resizable, draggable window with purchase UI.
 */
export const CyberBrowser: React.FC<CyberBrowserProps> = ({
    onClose,
    playerId,
}) => {
    const [url] = useState("https://Tesla.ct");
    const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);

    // Handle vehicle purchase
    const handlePurchase = (vehicleType: string) => {
        const result = purchaseVehicle(playerId, vehicleType);
        setPurchaseStatus(result.message);
        console.log(`Purchase attempted for ${vehicleType}:`, result);
        setTimeout(() => setPurchaseStatus(null), 3000); // Clear status after 3s
    };

    return (
        <Window
            id="cyber-browser"
            title="CyberBrowser V1.0 - Tesla: New Vehicle's"
            onClose={onClose}
            isResizable={true}
            initialPosition={{ top: 100, left: 100 }}
        >
            <div className="browser-content">
                {/* URL bar */}
                <div className="url-bar">
                    <input
                        type="text"
                        value={url}
                        readOnly
                        aria-label="Browser URL"
                    />
                </div>
                {/* Purchase section */}
                <div className="purchase-section">
                    <h3>Purchase Vehicles</h3>
                    <div className="vehicle-options">
                        <div className="vehicle-card">
                            <img
                                src="src/assets/showroom/ModelY-Showroom.png"
                                alt="Model Y vehicle"
                                className="vehicle-image"
                            />
                            <h4>Model Y</h4>
                            <p>Cost: $50,000</p>
                            <button
                                className="purchase-btn"
                                onClick={() => handlePurchase("Model Y")}
                                aria-label="Purchase Model Y"
                            >
                                Buy Now
                            </button>
                        </div>
                        <div className="vehicle-card">
                            <img
                                src="src/assets/showroom/RoboCab-Showroom.jpg"
                                alt="RoboCab vehicle"
                                className="vehicle-image"
                            />
                            <h4>RoboCab</h4>
                            <p>Cost: $35,000</p>
                            <button
                                className="purchase-btn"
                                onClick={() => handlePurchase("RoboCab")}
                                aria-label="Purchase RoboCab"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                    {purchaseStatus && (
                        <p className="purchase-status">{purchaseStatus}</p>
                    )}
                </div>
            </div>
        </Window>
    );
};
