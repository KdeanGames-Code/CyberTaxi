/**
 * CyberWindow.tsx - Renders a draggable, optionally resizable window for CyberTaxi UI.
 * Saves position to localStorage, per GDD v1.1.
 * @module CyberWindow
 * @version 0.2.11
 */
import React, { useRef, useEffect } from "react";
import "../../styles/windows.css";

/**
 * Props for the CyberWindow component.
 * @interface CyberWindowProps
 */
interface CyberWindowProps {
    id: string; // Unique identifier for the window
    title: React.ReactNode; // Window title, supports JSX
    onClose: () => void; // Callback for closing the window
    isResizable?: boolean; // Whether the window is resizable
    style?: React.CSSProperties; // Custom styles for the window
    initialPosition?: { top: number; left: number }; // Initial window position
    children: React.ReactNode; // Window content
}

/**
 * CyberWindow component renders a cyberpunk-styled, draggable window with position saving.
 * @param {CyberWindowProps} props - Component props.
 * @returns {JSX.Element} Draggable window.
 */
export const CyberWindow: React.FC<CyberWindowProps> = ({
    id,
    title,
    onClose,
    isResizable = false,
    style,
    initialPosition = { top: 100, left: 100 }, // Default position
    children,
}) => {
    const windowRef = useRef<HTMLDivElement>(null);

    // Handle dragging and save position
    useEffect(() => {
        const windowEl = windowRef.current;
        if (!windowEl) return;
        let isDragging = false;
        let currentX = initialPosition.left;
        let currentY = initialPosition.top;
        let initialX: number;
        let initialY: number;

        // Load saved position with bounds check
        const savedPosition = localStorage.getItem(`window_${id}_position`);
        if (savedPosition) {
            const { top, left } = JSON.parse(savedPosition);
            // Ensure position is within viewport
            const maxX = window.innerWidth - 400; // Assume window width ~400px
            const maxY = window.innerHeight - 300; // Assume window height ~300px
            currentX = Math.max(0, Math.min(left, maxX));
            currentY = Math.max(0, Math.min(top, maxY));
            windowEl.style.left = `${currentX}px`;
            windowEl.style.top = `${currentY}px`;
        } else {
            windowEl.style.left = `${currentX}px`;
            windowEl.style.top = `${currentY}px`;
        }

        const handleMouseDown = (e: MouseEvent) => {
            isDragging = true;
            initialX = e.clientX - currentX;
            initialY = e.clientY - currentY;
            windowEl.style.zIndex = "2001";
            console.log(`Dragging started for window: ${id}`);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            e.preventDefault();
            const newX = e.clientX - initialX;
            const newY = e.clientY - initialY;
            const maxX = window.innerWidth - windowEl.offsetWidth;
            const maxY = window.innerHeight - windowEl.offsetHeight;
            currentX = Math.max(0, Math.min(newX, maxX));
            currentY = Math.max(0, Math.min(newY, maxY));
            windowEl.style.left = `${currentX}px`;
            windowEl.style.top = `${currentY}px`;
        };

        const handleMouseUp = () => {
            isDragging = false;
            console.log(`Dragging stopped for window: ${id}`);
            localStorage.setItem(
                `window_${id}_position`,
                JSON.stringify({ top: currentY, left: currentX })
            );
            console.log(
                `Saved window ${id} position: top=${currentY}, left=${currentX}`
            );
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
    }, [id, initialPosition]);

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
