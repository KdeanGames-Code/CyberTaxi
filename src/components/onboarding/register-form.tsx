/**
 * register-form.tsx - Renders a non-resizable, draggable login/registration form for CyberTaxi onboarding.
 * Handles user signup via POST /api/auth/signup and login via POST /api/auth/login, stores JWT, and saves form data to localStorage.
 * Uses username for UI, maps to player_id internally, per GDD v1.1.
 * @module RegisterForm
 * @version 0.2.7
 */

import React, { useState, useEffect } from "react";
import { Window } from "../ui/Window";
import "../../styles/windows.css";

/**
 * Props for the RegisterForm component.
 * @interface RegisterFormProps
 */
interface RegisterFormProps {
    onClose: () => void;
}

/**
 * RegisterForm component renders a cyberpunk-styled form for user login or registration.
 * Toggles between login and signup modes, auto-populates username, submits to respective APIs with internal player_id, and handles JWT storage, per GDD v1.1.
 * @param {RegisterFormProps} props - Component props.
 * @returns {JSX.Element} Draggable form window.
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({ onClose }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [formData, setFormData] = useState({
        username: "",
        email: "test@example.com",
        password: "test123",
    });
    const [status, setStatus] = useState<string | null>(null);

    // Auto-populate username from localStorage
    useEffect(() => {
        console.log("Checking localStorage for username pre-fill");
        const savedData = localStorage.getItem("registerData");
        const token = localStorage.getItem("jwt_token");
        if (token) {
            console.log("Token found, setting username to Kevin-Dean");
            setFormData((prev) => ({ ...prev, username: "Kevin-Dean" }));
        } else if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                console.log("Parsed registerData:", parsedData);
                setFormData((prev) => ({
                    ...prev,
                    username: parsedData.username || "",
                }));
            } catch (error) {
                console.error("Failed to parse registerData:", error);
            }
        }
    }, []);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null); // Clear previous status
        console.log("Form submitted, mode:", isLoginMode ? "login" : "signup");
        try {
            const playerId = 1; // Default for Kevin-Dean, adjust if backend provides dynamic mapping
            const payload = isLoginMode
                ? { player_id: playerId, password: formData.password }
                : {
                      player_id: playerId,
                      username: formData.username,
                      email: formData.email,
                      password: formData.password,
                  };
            console.log(
                `Sending POST /api/auth/${
                    isLoginMode ? "login" : "signup"
                } with player_id: ${playerId}, username: ${formData.username}`
            );
            const response = await fetch(
                `http://localhost:3000/api/auth/${
                    isLoginMode ? "login" : "signup"
                }`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `HTTP error! Status: ${response.status}, Details: ${errorText}`
                );
            }
            const result = await response.json();
            console.log(
                `${isLoginMode ? "Login" : "Signup"} response:`,
                result
            );
            if (result.status === "Success" && result.token) {
                localStorage.setItem("jwt_token", result.token);
                localStorage.setItem(
                    "username",
                    formData.username || "Kevin-Dean"
                );
                localStorage.setItem("player_id", playerId.toString());
                localStorage.setItem(
                    "registerData",
                    JSON.stringify({
                        username: formData.username || "Kevin-Dean",
                        email: formData.email,
                    })
                );
                localStorage.setItem(
                    "player_1",
                    JSON.stringify({
                        player_id: playerId,
                        username: formData.username || "Kevin-Dean",
                        fleet: [],
                        bank_balance: 10000.0,
                        garages: [],
                    })
                );
                setStatus(
                    `${isLoginMode ? "Login" : "Registration"} successful!`
                );
                console.log(
                    `${
                        isLoginMode ? "Login" : "Signup"
                    } successful, token stored:`,
                    result.token
                );
                console.log(
                    "Calling onClose for",
                    isLoginMode ? "login" : "signup"
                );
                onClose();
            } else {
                setStatus(`Error: ${result.message || "Unknown server error"}`);
                console.error(
                    `${isLoginMode ? "Login" : "Signup"} failed:`,
                    result.message || "No message provided"
                );
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Network issue, please try again";
            setStatus(`Error: ${errorMessage}`);
            console.error(
                `${isLoginMode ? "Login" : "Signup"} error:`,
                errorMessage
            );
        }
    };

    // Toggle between login and signup modes
    const toggleMode = () => {
        console.log("Toggling to mode:", !isLoginMode ? "login" : "signup");
        setIsLoginMode(!isLoginMode);
        setStatus(null);
    };

    return (
        <Window
            id="register-window"
            title={isLoginMode ? "CyberTaxi Login" : "Register for CyberTaxi"}
            onClose={() => {
                console.log("RegisterForm onClose triggered");
                onClose();
            }}
            isResizable={false}
        >
            <form
                className="register-form"
                onSubmit={handleSubmit}
                role="form"
                aria-label={isLoginMode ? "Login form" : "Registration form"}
            >
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        aria-required="true"
                    />
                </div>
                {!isLoginMode && (
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            aria-required="true"
                        />
                    </div>
                )}
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        aria-required="true"
                    />
                </div>
                <button
                    type="submit"
                    className="submit-btn"
                    aria-label={
                        isLoginMode ? "Submit login" : "Submit registration"
                    }
                >
                    {isLoginMode ? "Login" : "Register"}
                </button>
                <button
                    type="button"
                    className="toggle-btn"
                    onClick={toggleMode}
                    aria-label={
                        isLoginMode
                            ? "Switch to registration"
                            : "Switch to login"
                    }
                >
                    {isLoginMode
                        ? "Need to Register?"
                        : "Already have an account?"}
                </button>
                {status && (
                    <p
                        className={`form-status ${
                            status.startsWith("Error") ? "error" : ""
                        }`}
                    >
                        {status}
                    </p>
                )}
            </form>
        </Window>
    );
};
