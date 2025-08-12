// src/utils/errorhandling/ErrorBoundary.tsx
/**
 * @file ErrorBoundary.tsx
 * @description Global error boundary component for CyberTaxi.
 * @author CyberTaxi Team
 * @version 0.1.1
 */
//import React, { ReactNode, Component } from "react";
//import type { ReactNode as RN } from "react"; // Type-only import for verbatimModuleSyntax
//import { CyberError } from "./CyberError";
//import { handleError } from "./errorHandler";

/**
 * Props for the GlobalErrorBoundary component.
 * @interface Props
 * @property {RN} children - The child components to wrap.
 */
//interface Props {
//  children: RN;

/**
 * State for the GlobalErrorBoundary component.
 * @interface State
 * @property {boolean} hasError - Tracks if an error occurred.
 * @property {string | null} errorMessage - Stores the error message.
 */
/**interface State {
    hasError: boolean;
    errorMessage: string | null;
} */

/**
 * GlobalErrorBoundary component to catch and display unhandled errors.
 * @class GlobalErrorBoundary
 * @extends {Component<Props, State>}
 */
/**class GlobalErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, errorMessage: null };
    }

    /**
     * Static method to update state when an error is caught.
     * @static
     * @param {Error} error - The caught error.
     * @returns {State} New state with error details.
     */
/**    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, errorMessage: error.message };
    }

    /**
     * Component lifecycle method to log error details and handle with middleware.
     * @param {Error} error - The caught error.
     * @param {React.ErrorInfo} errorInfo - Additional error info.
     */
/** componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("GlobalErrorBoundary caught:", error, errorInfo);
        handleError(error, (msg: string) =>
            this.setState({ errorMessage: msg })
        );
    }

    /**
     * Renders the component, showing an error message if present.
     * @returns {JSX.Element} The rendered output.
     */
/**    render() {
        if (this.state.hasError) {
            return (
                <div style={{ color: "red", padding: "10px" }}>
                    /** @description Displays global error message */
/**                 {this.state.errorMessage || "Unknown error"}
                </div>
            );
        }
        return this.props.children; 
    } 
}

export default GlobalErrorBoundary; */
