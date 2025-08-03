/**
 * register-form.tsx - Renders a non-resizable, draggable registration form for CyberTaxi onboarding.
 * Handles user signup via POST /api/auth/signup, stores JWT token, and saves form data to localStorage.
 * @module RegisterForm
 */

import React, { useState } from "react";
import { Window } from "../ui/Window";

/**
 * Props for the RegisterForm component.
 * @interface RegisterFormProps
 * @property {() => void} onClose - Callback to close the registration form.
 */
interface RegisterFormProps {
    onClose: () => void;
}

/**
 * RegisterForm component renders a cyberpunk-styled form for user registration.
 * Submits username, email, and password to POST /api/auth/signup, handles JWT, and saves to localStorage, per GDD v1.1.
 * @param {RegisterFormProps} props - Component props.
 * @returns {JSX.Element} Draggable registration form window.
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({ onClose }) => {
    const [formData, setFormData] = useState({
        username: "TestUser",
        email: "test@example.com",
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
            // Save to localStorage for fallback
            localStorage.setItem("registerData", JSON.stringify(formData));
            console.log("Form saved to localStorage:", formData);

            // Send signup request
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                throw new Error("Invalid server response: Not valid JSON");
            }

            if (result.status === "Success" && result.token) {
                localStorage.setItem("jwt_token", result.token);
                setStatus("Registration successful!");
                console.log("Signup successful, token stored:", result.token);
                setTimeout(() => {
                    setStatus(null);
                    onClose();
                }, 2000); // Close after 2s
            } else {
                setStatus(`Error: ${result.message || "Unknown server error"}`);
                console.error(
                    "Signup failed:",
                    result.message || "No message provided"
                );
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Network issue, please try again";
            setStatus(`Error: ${errorMessage}`);
            console.error("Signup error:", errorMessage);
        }
    };

    return (
        <Window
            id="register-window"
            title="Register for CyberTaxi"
            onClose={onClose}
            isResizable={false}
        >
            <form
                className="register-form"
                onSubmit={handleSubmit}
                role="form"
                aria-label="Registration form"
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
                <button
                    type="submit"
                    className="submit-btn"
                    aria-label="Submit registration"
                >
                    Register
                </button>
                {status && <p className="form-status">{status}</p>}
            </form>
        </Window>
    );
};
