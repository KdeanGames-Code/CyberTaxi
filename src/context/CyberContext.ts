// src/context/CyberContext.ts
/**
 * @file CyberContext.ts
 * @description Context for managing global state in CyberTaxi (e.g., login status, username).
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.11
 * @note Provides a centralized state provider and custom hook, using React.createElement as a workaround for JSX parsing issues.
 */
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react'; // Type-only import

// Define the state interface
interface CyberState {
    isLoggedIn: boolean;
    username: string | null;
    setAuth: (loggedIn: boolean, username?: string) => void;
}

// Create the context with a default value
const CyberContext = createContext<CyberState | undefined>(undefined);

/**
 * Props for CyberProvider component.
 * @interface CyberProviderProps
 */
interface CyberProviderProps {
    children: ReactNode;
}

/**
 * Provider component for CyberTaxi global state.
 * @param {CyberProviderProps} props - Component props.
 * @returns {JSX.Element} The context provider with children.
 * @description Manages isLoggedIn and username, syncing with localStorage, using React.createElement.
 */
export const CyberProvider = ({ children }: CyberProviderProps) => {
    console.log('CyberProvider initializing'); // Debug: Check initialization
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('jwt_token'));
    const [username, setUsername] = useState(localStorage.getItem('username') || null);

    const setAuth = (loggedIn: boolean, username?: string) => {
        console.log(`Setting auth: loggedIn=${loggedIn}, username=${username}`); // Debug: Track auth
        setIsLoggedIn(loggedIn);
        setUsername(username || null);
        if (!loggedIn) {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('username');
        } else if (username) {
            localStorage.setItem('username', username);
            localStorage.setItem('jwt_token', 'dummy_token'); // Placeholder
        }
    };

    return React.createElement(
        CyberContext.Provider,
        { value: { isLoggedIn, username, setAuth } },
        children
    );
};

/**
 * Custom hook to access CyberContext state.
 * @returns {CyberState} The current state and setters.
 * @throws {Error} If used outside CyberProvider.
 * @description Provides safe access to global state for components.
 */
export const useCyber = (): CyberState => {
    const context = useContext(CyberContext);
    if (!context) throw new Error('useCyber must be used within CyberProvider');
    return context;
};