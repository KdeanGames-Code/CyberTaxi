/**
 * CyberBrowser.tsx - Renders a resizable, draggable browser window for CyberTaxi.
 * Includes a menu bar with Tesla, Realtor, and Employment Agency options, a rounded URL dropdown, and dynamic content area, per GDD v1.1.
 * @module CyberBrowser
 * @version 0.3.25
 */
import React, { Component, useEffect, useState } from "react";
import { CyberWindow } from "./CyberWindow";
import { TeslaPage } from "../browser/TeslaPage";
import { RealtorPage } from "../browser/RealtorPage";
import { EmploymentAgencyPage } from "../browser/EmploymentAgencyPage";
import "../../styles/browser.css";

/**
 * Props for the CyberBrowser component.
 * @interface CyberBrowserProps
 */
interface CyberBrowserProps {
    onClose: () => void; // Callback to close the browser
    username: string; // Player username for API calls
    activePage?: "tesla" | "realtor" | "agency"; // Initial page to display
    style?: React.CSSProperties; // Custom styles for the window
}

/**
 * State for ErrorBoundary components.
 * @interface ErrorBoundaryState
 */
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    pageName?: string; // Add pageName to state
}

/**
 * Error boundary for CyberBrowser to catch rendering errors.
 */
class CyberBrowserErrorBoundary extends Component<
    { children: React.ReactNode },
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = {
        hasError: false,
        error: null,
    };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        console.error("CyberBrowserErrorBoundary caught error:", error);
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("CyberBrowserErrorBoundary caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    className="error-message"
                    style={{
                        textAlign: "center",
                        color: "#ff4d4f",
                        padding: "10px",
                    }}
                >
                    <p>
                        CyberBrowser failed to load:{" "}
                        {this.state.error?.message || "Unknown error"}
                    </p>
                </div>
            );
        }
        return this.props.children;
    }
}

/**
 * Error boundary for child page components (TeslaPage, RealtorPage, EmploymentAgencyPage).
 */
class PageErrorBoundary extends Component<
    { children: React.ReactNode; pageName: string },
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = {
        hasError: false,
        error: null,
        pageName: this.props.pageName, // Initialize pageName from props
    };

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        console.error(`PageErrorBoundary caught error:`, error);
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(
            `PageErrorBoundary for ${this.state.pageName} caught:`,
            error,
            errorInfo
        );
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    className="error-message"
                    style={{
                        textAlign: "center",
                        color: "#ff4d4f",
                        padding: "10px",
                    }}
                >
                    <p>
                        {this.state.pageName || "Page"} failed to load:{" "}
                        {this.state.error?.message || "Unknown error"}
                    </p>
                </div>
            );
        }
        return this.props.children;
    }
}

/**
 * Renders a cyberpunk-styled browser with menu bar, URL dropdown, and content area.
 * @param props - Component props.
 * @returns JSX.Element - Browser window.
 */
export const CyberBrowser: React.FC<CyberBrowserProps> = ({
    onClose,
    username,
    activePage = "tesla",
    style,
}) => {
    const [currentPage, setCurrentPage] = useState<
        "tesla" | "realtor" | "agency"
    >(activePage);
    const [url, setUrl] = useState<string>(
        `https://${activePage.charAt(0).toUpperCase() + activePage.slice(1)}.ct`
    );

    /**
     * Logs component rendering and checks DOM visibility.
     */
    useEffect(() => {
        console.log(
            `CyberBrowser component mounted with username: ${username}, page: ${activePage}, style: ${JSON.stringify(
                style
            )}`
        );
        console.log(
            `CyberBrowser initial state: currentPage=${currentPage}, url=${url}`
        );
        const browserElement = document.getElementById("cyber-browser");
        if (browserElement) {
            const computedStyle = window.getComputedStyle(browserElement);
            console.log("CyberBrowser DOM element found, styles:", {
                display: computedStyle.display,
                visibility: computedStyle.visibility,
                opacity: computedStyle.opacity,
                zIndex: computedStyle.zIndex,
                position: computedStyle.position,
                top: computedStyle.top,
                left: computedStyle.left,
                width: computedStyle.width,
                height: computedStyle.height,
            });
        } else {
            console.warn("CyberBrowser DOM element #cyber-browser not found");
        }
    }, [username, activePage, style]);

    /**
     * Syncs URL with current page.
     */
    useEffect(() => {
        setUrl(
            `https://${
                currentPage.charAt(0).toUpperCase() + currentPage.slice(1)
            }.ct`
        );
        console.log(`CyberBrowser page changed to: ${currentPage}`);
    }, [currentPage]);

    /**
     * Sets up global toggleCyberBrowser function.
     */
    useEffect(() => {
        (window as any).toggleCyberBrowser = (
            page: "tesla" | "realtor" | "agency" | undefined
        ) => {
            setCurrentPage(page || "tesla");
            console.log(`CyberBrowser toggled to page: ${page || "tesla"}`);
        };
        return () => {
            delete (window as any).toggleCyberBrowser;
        };
    }, []);

    /**
     * Handles menu button clicks to switch pages.
     * @param page - Page to switch to.
     */
    const handleMenuClick = (page: "tesla" | "realtor" | "agency") => {
        setCurrentPage(page);
        console.log(`Menu button clicked: ${page}`);
    };

    /**
     * Handles URL dropdown changes.
     * @param e - Change event.
     */
    const handleUrlChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        const page = selected
            .replace("https://", "")
            .replace(".ct", "")
            .toLowerCase() as "tesla" | "realtor" | "agency";
        setCurrentPage(page);
        console.log(`URL dropdown changed to: ${selected}`);
    };

    return (
        <CyberBrowserErrorBoundary>
            <CyberWindow
                id="cyber-browser"
                title={
                    <span>
                        <i
                            className="fas fa-globe globe-icon"
                            aria-hidden="true"
                        ></i>
                        {" CyberBrowser"}
                    </span>
                }
                onClose={() => {
                    console.log("CyberBrowser onClose triggered");
                    onClose();
                }}
                isResizable={true}
                initialPosition={{ top: 100, left: 100 }}
                style={{ zIndex: 2000, display: "block", ...style }}
            >
                <div
                    className="browser-content"
                    role="region"
                    aria-label="CyberBrowser interface"
                >
                    <div
                        className="menu-bar"
                        role="navigation"
                        aria-label="Browser menu"
                    >
                        <button
                            className={`menu-btn ${
                                currentPage === "tesla" ? "active" : ""
                            }`}
                            onClick={() => handleMenuClick("tesla")}
                            aria-label="Tesla page"
                        >
                            <i className="fas fa-taxi" aria-hidden="true"></i>{" "}
                            Tesla
                        </button>
                        <button
                            className={`menu-btn ${
                                currentPage === "realtor" ? "active" : ""
                            }`}
                            onClick={() => handleMenuClick("realtor")}
                            aria-label="Realtor page"
                        >
                            <i
                                className="fas fa-building"
                                aria-hidden="true"
                            ></i>{" "}
                            Realtor
                        </button>
                        <button
                            className={`menu-btn ${
                                currentPage === "agency" ? "active" : ""
                            }`}
                            onClick={() => handleMenuClick("agency")}
                            aria-label="Employment Agency page"
                        >
                            <i
                                className="fas fa-briefcase"
                                aria-hidden="true"
                            ></i>{" "}
                            Employment Agency
                        </button>
                    </div>
                    <div className="url-bar">
                        <select
                            value={url}
                            onChange={handleUrlChange}
                            aria-label="Browser URL selector"
                        >
                            <option value="https://Tesla.ct">
                                https://Tesla.ct
                            </option>
                            <option value="https://Realtor.ct">
                                https://Realtor.ct
                            </option>
                            <option value="https://EmploymentAgency.ct">
                                https://EmploymentAgency.ct
                            </option>
                        </select>
                    </div>
                    <div
                        className="content-area"
                        role="main"
                        aria-label="Browser content"
                    >
                        {currentPage ? (
                            <>
                                {currentPage === "tesla" && (
                                    <PageErrorBoundary pageName="TeslaPage">
                                        <TeslaPage username={username} />
                                    </PageErrorBoundary>
                                )}
                                {currentPage === "realtor" && (
                                    <PageErrorBoundary pageName="RealtorPage">
                                        <RealtorPage />
                                    </PageErrorBoundary>
                                )}
                                {currentPage === "agency" && (
                                    <PageErrorBoundary pageName="EmploymentAgencyPage">
                                        <EmploymentAgencyPage />
                                    </PageErrorBoundary>
                                )}
                            </>
                        ) : (
                            <div
                                style={{
                                    textAlign: "center",
                                    color: "#f5f5f5",
                                    padding: "10px",
                                }}
                            >
                                <p>No page selected</p>
                            </div>
                        )}
                    </div>
                </div>
            </CyberWindow>
        </CyberBrowserErrorBoundary>
    );
};
