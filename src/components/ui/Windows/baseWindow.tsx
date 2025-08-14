// src/components/ui/Windows/baseWindow.tsx
/**
 * @file baseWindow.tsx
 * @description Base window component for CyberTaxi UI, reusable and minimal.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.0
 * @note Provides a draggable/resizable window with customizable size and z-index, delegating logic to windowUtils.ts.
 */
import React from "react";
import { useWindowDrag, useWindowResize } from "../../../utils/ui/windowUtils"; // Split hooks
import "../../../styles/ui/baseWindow.css"; // Base styles

/**
 * Props for BaseWindow component.
 * @interface BaseWindowProps
 */
interface BaseWindowProps {
    id: string; // Unique identifier
    title: React.ReactNode; // Window title
    onClose: () => void; // Close callback
    isResizable?: boolean; // Optional resize
    isDraggable?: boolean; // Optional drag
    style?: React.CSSProperties; // Custom styles
    initialPosition?: { top: number; left: number }; // Initial position
    defaultWidth?: number; // Default width
    defaultHeight?: number; // Default height
    minWidth?: number; // Minimum width
    maxHeight?: number; // Maximum height
    zIndexBase?: number; // Base z-index
    children: React.ReactNode; // Window content
}

/**
 * BaseWindow component renders a minimal draggable/resizable window.
 * @param props - Component props.
 * @returns JSX.Element - Draggable window base.
 */
export const BaseWindow: React.FC<BaseWindowProps> = ({
    id,
    title,
    onClose,
    isResizable = false,
    isDraggable = true,
    style,
    initialPosition = { top: 100, left: 100 },
    defaultWidth = 400,
    defaultHeight = 300,
    minWidth = 200,
    maxHeight = 600,
    zIndexBase = 1000,
    children,
}) => {
    const windowRef = useWindowDrag(id, initialPosition, defaultWidth, defaultHeight, isDraggable, zIndexBase);
    useWindowResize(windowRef, minWidth, maxHeight, isResizable);

    const handleClose = () => {
        console.log(`Closing window: ${id}`);
        onClose();
    };

    return (
        <div
            ref={windowRef}
            className={`base-window ${isResizable ? "resizable" : ""}`}
            style={{ ...style, minWidth: `${minWidth}px`, maxHeight: `${maxHeight}px`, zIndex: zIndexBase }}
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
                ></span>
            </div>
            <div className="window-content">{children}</div>
        </div>
    );
};