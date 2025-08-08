/**
 * useAuth.ts - Custom React hook for managing authentication in CyberTaxi.
 * Handles login state and registration form close, per GDD v1.1.
 * @module useAuth
 * @version 0.1.1
 */

import { useState, useEffect } from "react";

/**
 * Interface for auth hook return value.
 * @interface AuthState
 * @property {boolean} isLoggedIn - Whether the user is logged in.
 * @property {() => void} handleClose - Callback for registration form close.
 */
interface AuthState {
    isLoggedIn: boolean;
    handleClose: () => void;
}

/**
 * Custom hook to manage authentication and login state.
 * Monitors localStorage for JWT token and provides login/logout handling.
 * @returns {AuthState} Authentication state and callbacks.
 */
export const useAuth = (): AuthState => {
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("jwt_token")
    );

    /**
     * Handles registration form close and updates login state.
     * Triggers login state check after form closes.
     * @returns {void}
     */
    const handleClose = () => {
        console.log("Registration window close triggered");
        const loggedIn = !!localStorage.getItem("jwt_token");
        setIsLoggedIn(loggedIn);
    };

    /**
     * Monitors login state via localStorage changes.
     * Syncs isLoggedIn state across tabs for consistent auth behavior.
     */
    useEffect(() => {
        console.log("Auth hook initialized");
        const checkLogin = () => {
            const loggedIn = !!localStorage.getItem("jwt_token");
            console.log(`isLoggedIn state: ${loggedIn}`);
            setIsLoggedIn(loggedIn);
        };
        checkLogin();
        window.addEventListener("storage", checkLogin);
        return () => window.removeEventListener("storage", checkLogin);
    }, []);

    return {
        isLoggedIn,
        handleClose,
    };
};
