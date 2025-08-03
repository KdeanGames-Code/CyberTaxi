/**
 * Window.tsx - Reusable draggable and optionally resizable window component.
 * Used for modals like registration, About, and CyberBrowser windows.
 * Supports single-click dragging, resizability, and position persistence via localStorage.
 * @module Window
 */

import React, { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";

/**
 * Props for the Window component.
 * @interface WindowProps
 * @property {string} id - Unique identifier for the window (used for localStorage key).
 * @property {string} title - Window title displayed in the header.
 * @property {ReactNode} children - Content to render inside the window.
 * @property {() => void} onClose - Callback to close the window.
 * @property {boolean} [isResizable=true] - Whether the window is resizable.
 * @property {React.CSSProperties} [style] - Optional CSS styles for positioning.
 * @property {{ top: number; left: number }} [initialPosition] - Initial position for dragging.
 */
interface WindowProps {
    id: string;
    title: string;
    children: ReactNode;
    onClose: () => void;
    isResizable?: boolean;
    style?: React.CSSProperties;
    initialPosition?: { top: number; left: number };
}

/**
 * Window component renders a draggable, optionally resizable modal with cyberpunk styling.
 * Saves position to localStorage on drag end or close, restores on mount.
 * @param {WindowProps} props - Component props.
 * @returns {JSX.Element} Draggable window with content.
 */
export const Window: React.FC<WindowProps> = ({
    id,
    title,
    children,
    onClose,
    isResizable = true,
    style,
    initialPosition = { top: 100, left: 100 },
}) => {
    // Load saved position from localStorage or use initialPosition
    const getSavedPosition = () => {
        const saved = localStorage.getItem(`window_position_${id}`);
        return saved ? JSON.parse(saved) : initialPosition;
    };

    // State for window position, initialized with saved or initial position
    const [position, setPosition] = useState(getSavedPosition());
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ posX: 0, posY: 0 });
    const windowRef = useRef<HTMLDivElement>(null);

    // Save position to localStorage
    const savePosition = (newPosition: { top: number; left: number }) => {
        localStorage.setItem(
            `window_position_${id}`,
            JSON.stringify(newPosition)
        );
        console.log(`Saved position for window ${id}:`, newPosition);
    };

    // Handle drag start on window header
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!windowRef.current) {
            console.error("Window ref not set");
            return;
        }
        setIsDragging(true);
        const rect = windowRef.current.getBoundingClientRect();
        dragRef.current = {
            posX: e.clientX - rect.left,
            posY: e.clientY - rect.top,
        };
        console.log("Drag started at", {
            clientX: e.clientX,
            clientY: e.clientY,
            left: rect.left,
            top: rect.top,
        });
    };

    // Update position during drag
    const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        if (isDragging && windowRef.current) {
            const newLeft = e.clientX - dragRef.current.posX;
            const newTop = e.clientY - dragRef.current.posY;
            setPosition({ top: newTop, left: newLeft });
            console.log("Dragging to", {
                left: newLeft,
                top: newTop,
                clientX: e.clientX,
                clientY: e.clientY,
            });
        }
    };

    // Stop dragging and save position
    const handleMouseUp = () => {
        setIsDragging(false);
        savePosition(position);
        console.log("Drag stopped");
    };

    // Save position on close
    const handleClose = () => {
        savePosition(position);
        onClose();
    };

    // Register/unregister drag listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove, {
                passive: false,
            });
            document.addEventListener("mouseup", handleMouseUp, {
                passive: false,
            });
        }
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, position]);

    // Prioritize style prop over internal position state
    const mergedStyle: React.CSSProperties = {
        ...style,
        top: style?.top ?? `${position.top}px`,
        left: style?.left ?? `${position.left}px`,
        zIndex: style?.zIndex ?? 1000,
    };

    return (
        <div
            className={`draggable-window ${isResizable ? "resizable" : ""}`}
            style={mergedStyle}
            role="dialog"
            aria-label={`${title} window`}
            id={id}
            ref={windowRef}
        >
            <div className="window-header" onMouseDown={handleMouseDown}>
                <h3>{title}</h3>
                <span
                    className="close-btn"
                    onClick={handleClose}
                    role="button"
                    aria-label="Close window"
                >
                    ×
                </span>
            </div>
            <div className="window-content">{children}</div>
        </div>
    );
};
