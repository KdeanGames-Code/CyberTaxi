/**
 * Window.tsx - Reusable draggable and optionally resizable window component.
 * Used for modals like registration, About, and future CyberBrowser windows.
 * Supports single-click dragging, resizability, and custom styling.
 * @module Window
 */

import React, { useState, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Props for the Window component.
 * @interface WindowProps
 * @property {string} id - Unique identifier for the window.
 * @property {string} title - Window title displayed in the header.
 * @property {ReactNode} children - Content to render inside the window.
 * @property {() => void} onClose - Callback to close the window.
 * @property {boolean} [isResizable=true] - Whether the window is resizable.
 * @property {React.CSSProperties} [style] - Optional CSS styles for positioning.
 */
interface WindowProps {
    id: string;
    title: string;
    children: ReactNode;
    onClose: () => void;
    isResizable?: boolean;
    style?: React.CSSProperties;
}

/**
 * Window component renders a draggable, optionally resizable modal with cyberpunk styling.
 * Handles single-click dragging and resizability via CSS, prioritizing passed style props.
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
}) => {
    // State for window position, used only if style prop doesn't override
    const [position, setPosition] = useState({ top: 100, left: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ posX: 0, posY: 0 });
    const windowRef = useRef<HTMLDivElement>(null);

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

    // Stop dragging
    const handleMouseUp = () => {
        setIsDragging(false);
        console.log("Drag stopped");
    };

    // Register/unregister drag listeners
    React.useEffect(() => {
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
    }, [isDragging]);

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
                    onClick={onClose}
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
