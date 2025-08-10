/**
 * useAuth.ts - Custom React hook for managing authentication in CyberTaxi.
 * Handles login state, username, and registration form close, per GDD v1.1.
 * @module useAuth
 * @version 0.1.13
 */
import { useState, useEffect } from "react";

/**
 * Interface for auth hook return value.
 * @interface AuthState
 */
interface AuthState {
    isLoggedIn: boolean; // Whether the user is logged in
    handleClose: () => void; // Callback for registration form close
    handleLogin: (token: string, username: string) => void; // Callback for manual login
    username: string | null; // Current username from localStorage
}

/**
 * Custom hook to manage authentication and login state.
 * Monitors localStorage for JWT token and username, provides login/logout handling.
 * @returns AuthState - Authentication state and callbacks.
 */
export const useAuth = (): AuthState => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
        !!localStorage.getItem("jwt_token")
    );
    const [username, setUsername] = useState<string | null>(
        localStorage.getItem("username")
    );

    /**
     * Handles registration form close without clearing auth data.
     */
    const handleClose = () => {
        console.log("Registration window close triggered");
        const token = localStorage.getItem("jwt_token");
        const storedUsername = localStorage.getItem("username");
        setIsLoggedIn(!!token);
        setUsername(storedUsername);
        console.log(
            `handleClose: isLoggedIn set to ${!!token}, username: ${
                storedUsername || "none"
            }`
        );
    };

    /**
     * Handles manual login to update state and localStorage.
     */
    const handleLogin = (token: string, username: string) => {
        console.log(
            `handleLogin: Setting token=${token}, username=${username}`
        );
        localStorage.setItem("jwt_token", token);
        localStorage.setItem("username", username);
        setIsLoggedIn(true);
        setUsername(username);
    };

    /**
     * Monitors login state and username via localStorage changes.
     * Syncs isLoggedIn and username across tabs for consistent auth behavior.
     */
    useEffect(() => {
        console.log("Auth hook initialized");
        const checkLogin = () => {
            const token = localStorage.getItem("jwt_token");
            const storedUsername = localStorage.getItem("username");
            const loggedIn = !!token && !!storedUsername;
            console.log(
                `checkLogin: isLoggedIn=${loggedIn}, username=${
                    storedUsername || "none"
                }`
            );
            if (loggedIn !== isLoggedIn) {
                setIsLoggedIn(loggedIn);
            }
            if (storedUsername !== username) {
                setUsername(storedUsername);
            }
        };
        checkLogin();
        window.addEventListener("storage", checkLogin);
        return () => {
            window.removeEventListener("storage", checkLogin);
        };
    }, [isLoggedIn, username]);

    return {
        isLoggedIn,
        handleClose,
        handleLogin,
        username,
    };
};
