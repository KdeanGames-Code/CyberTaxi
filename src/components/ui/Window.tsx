/**
 * Window.tsx - Renders a draggable, optionally resizable window for CyberTaxi UI.
 * Saves position to localStorage, per GDD v1.1.
 * @module Window
 * @version 0.2.8
 */

import React, { useRef, useEffect } from "react";
import "../../styles/windows.css";

/**
 * Props for the Window component.
 * @interface WindowProps
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
 * Window component renders a cyberpunk-styled, draggable window with position saving.
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

    // Handle dragging and save position
    useEffect(() => {
        const windowEl = windowRef.current;
        if (!windowEl) return;

        let isDragging = false;
        let currentX = initialPosition?.left || 400;
        let currentY = initialPosition?.top || 40;
        let initialX: number;
        let initialY: number;

        // Load saved position
        const savedPosition = localStorage.getItem(`window_${id}_position`);
        if (savedPosition) {
            const { top, left } = JSON.parse(savedPosition);
            currentX = left;
            currentY = top;
            windowEl.style.left = `${currentX}px`;
            windowEl.style.top = `${currentY}px`;
        }

        const handleMouseDown = (e: MouseEvent) => {
            isDragging = true;
            initialX = e.clientX - currentX;
            initialY = e.clientY - currentY;
            windowEl.style.zIndex = "1001";
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
