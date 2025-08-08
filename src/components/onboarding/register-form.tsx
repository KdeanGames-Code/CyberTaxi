/**
 * register-form.tsx - Renders a non-resizable, draggable login/registration form for CyberTaxi onboarding.
 * Handles user signup via POST /api/auth/signup and login via POST /api/auth/login, stores JWT, and saves form data to localStorage.
 * Uses username for UI, maps to player_id internally, per GDD v1.1.
 * @module RegisterForm
 * @version 0.2.8
 */

import React, { useState, useEffect } from "react";
import type { FormEvent } from "react"; // Type-only import for FormEvent
import { Window } from "../ui/Window";
import "../../styles/windows.css";

/**
 * Props for the RegisterForm component.
 * @interface RegisterFormProps
 * @property {() => void} onClose - Callback to close the form.
 * @property {"login" | "register"} [mode] - Initial form mode (login or register).
 */
interface RegisterFormProps {
    onClose: () => void;
    mode?: "login" | "register";
}

/**
 * RegisterForm component renders a cyberpunk-styled form for user login or registration.
 * Toggles between login and signup modes, auto-populates username, submits to respective APIs with internal player_id,
 * handles JWT storage, and provides custom validation, per GDD v1.1.
 * @param {RegisterFormProps} props - Component props.
 * @returns {JSX.Element} Draggable form window.
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({
    onClose,
    mode = "login",
}) => {
    const [formMode, setFormMode] = useState<"login" | "register">(mode);
    const [formData, setFormData] = useState({
        username: "",
        email: "test@example.com",
        password: "test123",
        playerId: "",
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Auto-populates username from localStorage on mount.
     */
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
                    email: parsedData.email || "test@example.com",
                }));
            } catch (error) {
                console.error("Failed to parse registerData:", error);
            }
        }
    }, []);

    /**
     * Updates form mode when prop changes.
     */
    useEffect(() => {
        setFormMode(mode);
        setErrors({});
    }, [mode]);

    /**
     * Handles input changes for form fields.
     * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event.
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    /**
     * Validates form fields and sets error messages.
     * @returns {boolean} True if form is valid, false otherwise.
     */
    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.username.trim()) {
            newErrors.username = "Please enter a Username";
        }
        if (!formData.password.trim()) {
            newErrors.password = "Please enter a Password";
        }
        if (formMode === "register") {
            if (!formData.email.trim()) {
                newErrors.email = "Please enter an Email";
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = "Please enter a valid Email";
            }
            if (!formData.playerId.trim()) {
                newErrors.playerId = "Please enter a Player ID";
            } else if (isNaN(parseInt(formData.playerId))) {
                newErrors.playerId = "Player ID must be a number";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handles form submission for login or registration.
     * @param {FormEvent} e - Form submission event.
     */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        console.log(`Form submitted, mode: ${formMode}`);
        if (!validateForm()) {
            return;
        }
        setIsSubmitting(true);

        try {
            const playerId = parseInt(formData.playerId) || 1; // Default for Kevin-Dean
            const payload =
                formMode === "login"
                    ? { player_id: playerId, password: formData.password }
                    : {
                          player_id: playerId,
                          username: formData.username,
                          email: formData.email,
                          password: formData.password,
                      };
            const endpoint =
                formMode === "login" ? "/api/auth/login" : "/api/auth/signup";
            console.log(
                `Sending POST ${endpoint} with player_id: ${playerId}, username: ${formData.username}`
            );
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `HTTP error! Status: ${response.status}, Details: ${errorText}`
                );
            }
            const result = await response.json();
            console.log(
                `${formMode === "login" ? "Login" : "Signup"} response:`,
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
                console.log(
                    `${
                        formMode === "login" ? "Login" : "Signup"
                    } successful, token stored:`,
                    result.token
                );
                console.log("Calling onClose for", formMode);
                onClose();
            } else {
                setErrors({ form: result.message || "Unknown server error" });
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Network issue, please try again";
            setErrors({ form: `Error: ${errorMessage}` });
            console.error(
                `${formMode === "login" ? "Login" : "Signup"} error:`,
                errorMessage
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Toggles between login and signup modes.
     */
    const toggleMode = () => {
        console.log(
            "Toggling to mode:",
            formMode === "login" ? "signup" : "login"
        );
        setFormMode(formMode === "login" ? "register" : "login");
        setErrors({});
        setFormData({
            username: "",
            email: "test@example.com",
            password: "test123",
            playerId: "",
        });
    };

    return (
        <Window
            id="register-window"
            title={
                formMode === "login"
                    ? "CyberTaxi Login"
                    : "Register for CyberTaxi"
            }
            onClose={() => {
                console.log("RegisterForm onClose triggered");
                onClose();
            }}
            isResizable={false}
            style={{ zIndex: 1000 }}
            initialPosition={{ top: 200, left: 200 }}
        >
            <form
                className="register-form"
                onSubmit={handleSubmit}
                noValidate
                role="form"
                aria-label={
                    formMode === "login" ? "Login form" : "Registration form"
                }
            >
                {errors.form && (
                    <p className="error-message" role="alert">
                        {errors.form}
                    </p>
                )}
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Enter username"
                        aria-invalid={!!errors.username}
                        aria-describedby={
                            errors.username ? "username-error" : undefined
                        }
                        required
                    />
                    {errors.username && (
                        <p
                            id="username-error"
                            className="error-message"
                            role="alert"
                        >
                            {errors.username}
                        </p>
                    )}
                </div>
                {formMode === "register" && (
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter email"
                            aria-invalid={!!errors.email}
                            aria-describedby={
                                errors.email ? "email-error" : undefined
                            }
                            required
                        />
                        {errors.email && (
                            <p
                                id="email-error"
                                className="error-message"
                                role="alert"
                            >
                                {errors.email}
                            </p>
                        )}
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
                        placeholder="Enter password"
                        aria-invalid={!!errors.password}
                        aria-describedby={
                            errors.password ? "password-error" : undefined
                        }
                        required
                    />
                    {errors.password && (
                        <p
                            id="password-error"
                            className="error-message"
                            role="alert"
                        >
                            {errors.password}
                        </p>
                    )}
                </div>
                {formMode === "register" && (
                    <div className="form-group">
                        <label htmlFor="player-id">Player ID</label>
                        <input
                            type="text"
                            id="player-id"
                            name="playerId"
                            value={formData.playerId}
                            onChange={handleInputChange}
                            placeholder="Enter player ID"
                            aria-invalid={!!errors.playerId}
                            aria-describedby={
                                errors.playerId ? "player-id-error" : undefined
                            }
                            required
                        />
                        {errors.playerId && (
                            <p
                                id="player-id-error"
                                className="error-message"
                                role="alert"
                            >
                                {errors.playerId}
                            </p>
                        )}
                    </div>
                )}
                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting}
                        aria-label={
                            formMode === "login"
                                ? "Submit login"
                                : "Submit registration"
                        }
                    >
                        {isSubmitting
                            ? "Submitting..."
                            : formMode === "login"
                            ? "Login"
                            : "Register"}
                    </button>
                    <button
                        type="button"
                        className="toggle-btn"
                        onClick={toggleMode}
                        aria-label={
                            formMode === "login"
                                ? "Switch to registration"
                                : "Switch to login"
                        }
                    >
                        {formMode === "login"
                            ? "Need to Register?"
                            : "Already have an account?"}
                    </button>
                </div>
            </form>
        </Window>
    );
};
