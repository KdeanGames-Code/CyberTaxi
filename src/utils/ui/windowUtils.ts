// src/utils/ui/windowUtils.ts
/**
 * @file windowUtils.ts
 * @description Utility functions and hooks for window drag/resize handling in CyberTaxi.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.2
 * @note Provides reusable logic for draggable/resizable windows, saving positions with CyberError logging.
 */
import { useRef, useEffect } from "react";
import { CyberError } from "../errorhandling/CyberError"; // Import error handler

/**
 * Custom hook for window drag handling.
 * @param id - Unique window identifier.
 * @param initialPosition - Initial position { top, left }.
 * @param defaultWidth - Default width in pixels.
 * @param defaultHeight - Default height in pixels.
 * @param isDraggable - Toggle drag functionality.
 * @param zIndexBase - Base z-index.
 * @returns RefObject<HTMLDivElement> - Reference to the window element.
 */
export const useWindowDrag = (
    id: string,
    initialPosition: { top: number; left: number },
    defaultWidth: number,
    defaultHeight: number,
    isDraggable: boolean,
    zIndexBase: number
) => {
    const windowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const windowEl = windowRef.current;
        if (!windowEl) {
            new CyberError("Window element not found", "useWindowDrag").log();
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
            const maxX = window.innerWidth - windowEl.offsetWidth;
            const maxY = window.innerHeight - windowEl.offsetHeight;
            currentX = Math.max(0, Math.min(left, maxX));
            currentY = Math.max(0, Math.min(top, maxY));
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
            new CyberError(`Dragging started for window: ${id}`, "useWindowDrag").log();
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
            new CyberError(`Dragging stopped for window: ${id}`, "useWindowDrag").log();
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

    return windowRef;
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
        if (!windowEl || !isResizable) return;

        const handleResize = () => {
            const width = windowEl.offsetWidth;
            const height = windowEl.offsetHeight;
            if (width < minWidth) windowEl.style.width = `${minWidth}px`;
            if (height > maxHeight) windowEl.style.height = `${maxHeight}px`;
            new CyberError(`Resized window to ${width}x${height}`, "useWindowResize").log();
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
    new CyberError(`Saved position for ${id}: x=${x}, y=${y}`, "saveWindowPosition").log();
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