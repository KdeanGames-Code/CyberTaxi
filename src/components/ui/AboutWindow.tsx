// src/components/ui/AboutWindow.tsx
import React from "react";
import { Window } from "./Window";

interface AboutWindowProps {
    onClose: () => void;
}

export const AboutWindow: React.FC<AboutWindowProps> = ({ onClose }) => {
    return (
        <Window
            id="about-window"
            title="About CyberTaxi"
            onClose={onClose}
            isResizable={false}
        >
            <div className="about-content">
                <p>© 2025 CyberTaxi Team, CyberTaxi: Own the Roads</p>
            </div>
        </Window>
    );
};
