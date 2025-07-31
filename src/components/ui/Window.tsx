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
    const [position, setPosition] = useState({ top: 100, left: 100 }); // Default position
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ posX: 0, posY: 0 });
    const windowRef = useRef<HTMLDivElement>(null);

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

    const handleMouseUp = () => {
        setIsDragging(false);
        console.log("Drag stopped");
    };

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

    return (
        <div
            className="draggable-window"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
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
