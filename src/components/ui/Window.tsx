/**
 * Window.tsx - Renders a draggable, optionally resizable window for CyberTaxi UI.
 * Used by RegisterForm.tsx, AboutWindow.tsx, and CyberBrowser.tsx for modal dialogs.
 * @module Window
 * @version 0.2.3
 */

import React, { useRef, useEffect } from "react";
import "../../styles/windows.css";

/**
 * Props for the Window component.
 * @interface WindowProps
 * @property {string} id - Unique ID for the window.
 * @property {string} title - Window title.
 * @property {() => void} onClose - Callback to close the window.
 * @property {boolean} [isResizable=false] - Whether the window is resizable.
 * @property {React.CSSProperties} [style] - Optional CSS styles.
 * @property {{ top: number; left: number }} [initialPosition] - Initial position for dragging.
 * @property {React.ReactNode} children - Window content.
 */
interface WindowProps {
    id: string;
    title: string;
    onClose: () => void;
    isResizable?: boolean;
    style?: React.CSSProperties;
    initialPosition?: { top: number; left: number };
    children: React.ReactNode;
}

/**
 * Window component renders a cyberpunk-styled, draggable window with optional resizing.
 * Supports close button and ARIA attributes for accessibility, per GDD v1.1.
 * @param {WindowProps} props - Component props.
 * @returns {JSX.Element} Draggable window.
 */
export const Window: React.FC<WindowProps> = ({
    id,
    title,
    onClose,
    isResizable = false,
    style,
    initialPosition,
    children,
}) => {
    const windowRef = useRef<HTMLDivElement>(null);

    // Handle dragging
    useEffect(() => {
        const windowEl = windowRef.current;
        if (!windowEl) return;

        let isDragging = false;
        let currentX = initialPosition?.left || 400;
        let currentY = initialPosition?.top || 40;
        let initialX: number;
        let initialY: number;

        const handleMouseDown = (e: MouseEvent) => {
            isDragging = true;
            initialX = e.clientX - currentX;
            initialY = e.clientY - currentY;
            windowEl.style.zIndex = "1001"; // Bring to front
            console.log(`Dragging started for window: ${id}`);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            windowEl.style.left = `${currentX}px`;
            windowEl.style.top = `${currentY}px`;
        };

        const handleMouseUp = () => {
            isDragging = false;
            console.log(`Dragging stopped for window: ${id}`);
        };

        const header = windowEl.querySelector(".window-header") as HTMLElement;
        if (header) {
            header.addEventListener("mousedown", handleMouseDown);
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        }

        // Initialize position
        windowEl.style.left = `${currentX}px`;
        windowEl.style.top = `${currentY}px`;

        return () => {
            if (header) {
                header.removeEventListener("mousedown", handleMouseDown);
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            }
        };
    }, [initialPosition, id]);

    // Handle close button
    const handleClose = () => {
        console.log(`Closing window: ${id}`);
        onClose();
    };

    return (
        <div
            ref={windowRef}
            className={`draggable-window ${isResizable ? "resizable" : ""}`}
            style={style}
            id={id}
            role="dialog"
            aria-labelledby={`${id}-title`}
        >
            <div className="window-header">
                <h3 id={`${id}-title`}>{title}</h3>
                <span
                    className="close-btn fas fa-times"
                    onClick={handleClose}
                    role="button"
                    aria-label="Close window"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleClose();
                        }
                    }}
                ></span>
            </div>
            <div className="window-content">{children}</div>
        </div>
    );
};
