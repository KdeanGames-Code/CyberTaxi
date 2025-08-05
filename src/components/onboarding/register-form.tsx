/**
 * register-form.tsx - Renders a non-resizable, draggable login/registration form for CyberTaxi onboarding.
 * Handles user signup via POST /api/auth/signup and login via POST /api/auth/login, stores JWT, and saves form data to localStorage.
 * @module RegisterForm
 * @version 0.2.2
 */

import React, { useState } from "react";
import { Window } from "../ui/Window";

/**
 * Props for the RegisterForm component.
 * @interface RegisterFormProps
 * @property {() => void} onClose - Callback to close the form.
 */
interface RegisterFormProps {
    onClose: () => void;
}

/**
 * RegisterForm component renders a cyberpunk-styled form for user login or registration.
 * Toggles between login and signup modes, submits to respective APIs, and handles JWT storage, per GDD v1.1.
 * @param {RegisterFormProps} props - Component props.
 * @returns {JSX.Element} Draggable form window.
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({ onClose }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [formData, setFormData] = useState({
        username: "TestUser",
        email: "test@example.com",
        playerId: "1",
        password: "test123",
    });
    const [status, setStatus] = useState<string | null>(null);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isLoginMode) {
                // Login mode
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        player_id: formData.playerId,
                        password: formData.password,
                    }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const result = await response.json();
                if (result.status === "Success" && result.token) {
                    localStorage.setItem("jwt_token", result.token);
                    setStatus("Login successful!");
                    console.log(
                        "Login successful, token stored:",
                        result.token
                    );
                    setTimeout(() => {
                        setStatus(null);
                        onClose();
                    }, 2000); // Close after 2s
                } else {
                    setStatus(
                        `Error: ${result.message || "Unknown server error"}`
                    );
                    console.error(
                        "Login failed:",
                        result.message || "No message provided"
                    );
                }
            } else {
                // Signup mode
                localStorage.setItem("registerData", JSON.stringify(formData));
                console.log("Form saved to localStorage:", formData);
                const response = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                const result = await response.json();
                if (result.status === "Success") {
                    localStorage.setItem("jwt_token", result.token);
                    setStatus("Registration successful!");
                    console.log(
                        "Signup successful, token stored:",
                        result.token
                    );
                    setTimeout(() => {
                        setStatus(null);
                        onClose();
                    }, 2000); // Close after 2s
                } else {
                    setStatus(
                        `Error: ${result.message || "Unknown server error"}`
                    );
                    console.error(
                        "Signup failed:",
                        result.message || "No message provided"
                    );
                }
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
        setIsLoginMode(!isLoginMode);
        setStatus(null);
    };

    return (
        <Window
            id="register-window"
            title="CyberTaxi Login"
            onClose={onClose}
            isResizable={false}
        >
            <form
                className="register-form"
                onSubmit={handleSubmit}
                role="form"
                aria-label={isLoginMode ? "Login form" : "Registration form"}
            >
                {isLoginMode ? (
                    <>
                        <div className="form-group">
                            <label htmlFor="playerId">Player ID</label>
                            <input
                                type="text"
                                id="playerId"
                                name="playerId"
                                value={formData.playerId}
                                onChange={handleInputChange}
                                required
                                aria-required="true"
                            />
                        </div>
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
                    </>
                ) : (
                    <>
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
                    </>
                )}
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
