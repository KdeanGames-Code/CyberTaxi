// src/utils/ui/windowUtils.ts
/**
 * @file windowUtils.ts
 * @description Utility functions and hooks for window drag/resize handling in CyberTaxi.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.10
 * @note Provides reusable logic for draggable/resizable windows, saving positions with CyberError logging.
 */
import { useRef, useEffect } from "react";
import { CyberError } from "../errorhandling/CyberError"; // Corrected path

/**
 * Custom hook for window drag handling.
 * @param id - Unique window identifier.
 * @param initialPosition - Initial position { top, left }.
 * @param defaultWidth - Default width in pixels.
 * @param defaultHeight - Default height in pixels.
 * @param isDraggable - Toggle drag functionality.
 * @param zIndexBase - Base z-index.
 * @returns RefObject<HTMLDivElement> - Reference to the window element (non-null after mount).
 */
export const useWindowDrag = (
    id: string,
    initialPosition: { top: number; left: number },
    defaultWidth: number,
    defaultHeight: number,
    isDraggable: boolean,
    zIndexBase: number
): React.RefObject<HTMLDivElement> => {
    const windowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const windowEl = windowRef.current;
        if (!windowEl) {
            new CyberError("Window element not found", 500);
            return;
        }
        let isDragging = false;
        let currentX = initialPosition.left;
        let currentY = initialPosition.top;
        let initialX: number;
        let initialY: number;

        windowEl.style.width = `${defaultWidth}px`;
        windowEl.style.height = `${defaultHeight}px`;

        const savedPosition = localStorage.getItem(`window_${id}_position`);
        if (savedPosition) {
            const { top, left } = JSON.parse(savedPosition);
            const { maxX, maxY } = getWindowBounds(windowEl.offsetWidth, windowEl.offsetHeight);
            currentX = Math.max(0, Math.min(Number(left), maxX));
            currentY = Math.max(0, Math.min(Number(top), maxY));
            windowEl.style.left = `${currentX}px`;
            windowEl.style.top = `${currentY}px`;
        } else {
            windowEl.style.left = `${currentX}px`;
            windowEl.style.top = `${currentY}px`;
        }

        if (!isDraggable) return;

        const handleMouseDown = (e: MouseEvent) => {
            isDragging = true;
            initialX = e.clientX - currentX;
            initialY = e.clientY - currentY;
            windowEl.style.zIndex = `${zIndexBase + 1}`;
            new CyberError(`Dragging started for window: ${id}`, 200);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            e.preventDefault();
            const newX = e.clientX - initialX;
            const newY = e.clientY - initialY;
            const { maxX, maxY } = getWindowBounds(windowEl.offsetWidth, windowEl.offsetHeight);
            currentX = Math.max(0, Math.min(newX, maxX));
            currentY = Math.max(0, Math.min(newY, maxY));
            windowEl.style.left = `${currentX}px`;
            windowEl.style.top = `${currentY}px`;
        };

        const handleMouseUp = () => {
            isDragging = false;
            new CyberError(`Dragging stopped for window: ${id}`, 200);
            saveWindowPosition(id, currentX, currentY);
        };

        const header = windowEl.querySelector(".window-header") as HTMLElement;
        if (header) {
            header.addEventListener("mousedown", handleMouseDown);
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            if (header) {
                header.removeEventListener("mousedown", handleMouseDown);
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            }
        };
    }, [id, initialPosition, defaultWidth, defaultHeight, isDraggable, zIndexBase]);

    // Type assertion since useEffect ensures windowEl is set before use
    return windowRef as React.RefObject<HTMLDivElement>;
};

/**
 * Custom hook for window resize handling.
 * @param windowRef - Reference to the window element.
 * @param minWidth - Minimum width in pixels.
 * @param maxHeight - Maximum height in pixels.
 * @param isResizable - Toggle resize functionality.
 */
export const useWindowResize = (
    windowRef: React.RefObject<HTMLDivElement>,
    minWidth: number,
    maxHeight: number,
    isResizable: boolean
) => {
    useEffect(() => {
        const windowEl = windowRef.current;
        if (!windowEl || !isResizable) {
            return; // Exit if null or not resizable
        }

        const handleResize = () => {
            const width = windowEl.offsetWidth;
            const height = windowEl.offsetHeight;
            if (width < minWidth) windowEl.style.width = `${minWidth}px`;
            if (height > maxHeight) windowEl.style.height = `${maxHeight}px`;
            new CyberError(`Resized window to ${width}x${height}`, 200);
        };

        windowEl.addEventListener("resize", handleResize);
        return () => windowEl.removeEventListener("resize", handleResize);
    }, [windowRef, minWidth, maxHeight, isResizable]);
};

/**
 * Utility to save window position to localStorage.
 * @param id - Unique window identifier.
 * @param x - Current x position.
 * @param y - Current y position.
 */
export const saveWindowPosition = (id: string, x: number, y: number) => {
    localStorage.setItem(`window_${id}_position`, JSON.stringify({ top: y, left: x }));
    new CyberError(`Saved position for ${id}: x=${x}, y=${y}`, 200);
};

/**
 * Utility to get window bounds.
 * @param width - Window width.
 * @param height - Window height.
 * @returns { maxX: number, maxY: number } - Maximum allowable positions.
 */
export const getWindowBounds = (width: number, height: number) => {
    const maxX = window.innerWidth - width;
    const maxY = window.innerHeight - height;
    return { maxX, maxY };
};