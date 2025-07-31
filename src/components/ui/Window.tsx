// src/components/ui/Window.tsx - Reusable Draggable Window Component
import React, { useState, useRef } from "react";
import type { ReactNode } from "react";

interface WindowProps {
    id: string;
    title: string;
    children: ReactNode;
    onClose: () => void;
}

export const Window: React.FC<WindowProps> = ({
    id,
    title,
    children,
    onClose,
}) => {
    const [position, setPosition] = useState({ x: 100, y: 100 }); // Default position
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ startX: 0, startY: 0 });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX - position.x,
            startY: e.clientY - position.y,
        };
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragRef.current.startX,
                y: e.clientY - dragRef.current.startY,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };

    return (
        <div
            className="draggable-window"
            style={{ top: `${position.y}px`, left: `${position.x}px` }}
            role="dialog"
            aria-label={`${title} window`}
            id={id}
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
