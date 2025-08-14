// src/utils/ui/windowUtils.ts
/**
 * @file windowUtils.ts
 * @description Utility functions and hooks for window drag/resize handling in CyberTaxi.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.13
 * @note Provides reusable logic for draggable/resizable windows, saving positions with CyberError logging.
 * @detail Ensures window IDs are validated and logged to track dragging and position saving.
 */
import { useRef, useEffect } from "react";
import { CyberError } from "../errorhandling/CyberError";

/**
 * Custom hook for window drag handling.
 * @param {string} id - Unique window identifier (required).
 * @param { { top: number; left: number } } initialPosition - Initial position.
 * @param {number} defaultWidth - Default width in pixels.
 * @param {number} defaultHeight - Default height in pixels.
 * @param {boolean} isDraggable - Toggle drag functionality.
 * @param {number} zIndexBase - Base z-index.
 * @returns {React.RefObject<HTMLDivElement>} Reference to the window element.
 * @throws {CyberError} If id is empty or invalid.
 */
export const useWindowDrag = (
    id: string,
    initialPosition: { top: number; left: number },
    defaultWidth: number,
    defaultHeight: number,
    isDraggable: boolean,
    zIndexBase: number
): React.RefObject<HTMLDivElement> => {
    if (!id || id.trim() === "") {
        throw new CyberError("Window ID is required", 400);
    }
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

    return windowRef as React.RefObject<HTMLDivElement>;
};

/**
 * Custom hook for window resize handling.
 * @param {React.RefObject<HTMLDivElement>} windowRef - Reference to the window element.
 * @param {number} minWidth - Minimum width in pixels.
 * @param {number} maxHeight - Maximum height in pixels.
 * @param {boolean} isResizable - Toggle resize functionality.
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
            return;
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
 * @param {string} id - Unique window identifier.
 * @param {number} x - Current x position.
 * @param {number} y - Current y position.
 */
export const saveWindowPosition = (id: string, x: number, y: number) => {
    localStorage.setItem(`window_${id}_position`, JSON.stringify({ top: y, left: x }));
    new CyberError(`Saved position for ${id}: x=${x}, y=${y}`, 200);
};

/**
 * Utility to get window bounds.
 * @param {number} width - Window width.
 * @param {number} height - Window height.
 * @returns {{ maxX: number, maxY: number }} Maximum allowable positions.
 */
export const getWindowBounds = (width: number, height: number) => {
    const maxX = window.innerWidth - width;
    const maxY = window.innerHeight - height;
    return { maxX, maxY };
};