// src/components/ui/Windows/LoginForm.tsx
/**
 * @file LoginForm.tsx
 * @description Login/registration form component for CyberTaxi onboarding, extending BaseWindow.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.2.7
 * @note Renders a non-resizable, draggable form with toggleable login/register modes, no API calls yet.
 * @detail This component leverages BaseWindow for window management, focusing on form state and mode toggling.
 *         The form supports two modes: 'login' and 'register', with dynamic field visibility and validation.
 *         Future enhancements will include API integration for authentication.
 */
import React, { useState, useEffect, useRef } from "react";
import { BaseWindow } from "./baseWindow"; // Component import
import type { BaseWindowProps } from "./baseWindow"; // Type-only import for verbatimModuleSyntax
import "../../../styles/ui/LoginForm.css"; // Unique styles only

/**
 * Props for LoginForm component.
 * @interface LoginFormProps
 * @extends {Omit<BaseWindowProps, "children">}
 * @property {() => void} onClose - Callback to close the form window.
 * @property {"login" | "register"} [mode] - Optional initial mode, defaults to 'login'.
 * @property {string} id - Unique identifier for the window, required.
 * @property {React.ReactNode} title - Window title, required and dynamically set based on mode.
 * @description Extends BaseWindowProps excluding 'children', adding custom props for form behavior.
 *              Note: 'id' and 'title' are required and handled internally with defaults.
 */
interface LoginFormProps extends Omit<BaseWindowProps, "children"> {
    onClose: () => void;
    mode?: "login" | "register";
    id: string;
    title: React.ReactNode;
}

/**
 * Renders the login/registration form within a BaseWindow.
 * @param {LoginFormProps} props - Component props including onClose, mode, id, and title.
 * @returns {JSX.Element} The rendered form window.
 * @description Manages form state, handles mode toggling, and integrates with BaseWindow for drag/resize.
 *              Uses useEffect to sync mode changes and reset form data.
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onClose, mode = "login", id, title }) => {
    // State for form mode, initialized with prop or default
    const [formMode, setFormMode] = useState<"login" | "register">(mode);

    const [formData, setFormData] = useState({
        username: "",
        email: "test@example.com",
        password: "",
    });
    const formRef = useRef<HTMLFormElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    /**
     * Syncs form mode and resets state when mode prop changes.
     * @effect Runs on mode change to update UI and clear form data.
     */
    useEffect(() => {
        setFormMode(mode);
        setFormData({ username: "", email: "test@example.com", password: "" });
        [usernameRef, emailRef, passwordRef].forEach((ref) => {
            ref.current?.setCustomValidity("");
        });
    }, [mode]);

    /**
     * Handles input changes, updating formData state.
     * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
     * @description Updates the corresponding field in formData based on the input name and value.
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Toggles between login and register modes, resetting form data.
     * @description Switches formMode and clears formData, ensuring a clean state transition.
     */
    const toggleMode = () => {
        setFormMode(formMode === "login" ? "register" : "login");
        setFormData({ username: "", email: "test@example.com", password: "" });
        [usernameRef, emailRef, passwordRef].forEach((ref) => {
            ref.current?.setCustomValidity("");
        });
    };

    return (
        <BaseWindow
            id={id}
            title={title || (formMode === "login" ? "CyberTaxi Login" : "Register for CyberTaxi")} // Use prop or fallback
            onClose={onClose}
            isResizable={false}
            isDraggable={true}
            style={{ zIndex: 1000 }}
            initialPosition={{ top: 200, left: 200 }}
            defaultWidth={400}
            defaultHeight={300}
            minWidth={200}
            maxHeight={600}
            zIndexBase={1000}
        >
            <form
                className={`login-form ${formMode === "register" ? "register-mode" : ""}`}
                ref={formRef}
                role="form"
                aria-label={formMode === "login" ? "Login form" : "Registration form"}
            >
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Enter Username"
                        required
                        ref={usernameRef}
                        aria-required="true"
                    />
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
                            placeholder="Enter Email"
                            required
                            ref={emailRef}
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
                        placeholder="Enter Password"
                        required
                        ref={passwordRef}
                        aria-required="true"
                    />
                </div>
                <div className="form-actions">
                    <button
                        type="button" // Static for now, no submit
                        className="submit-btn"
                        aria-label={formMode === "login" ? "View login" : "View registration"}
                    >
                        {formMode === "login" ? "Login" : "Register"}
                    </button>
                    <button
                        type="button"
                        className="toggle-btn"
                        onClick={toggleMode}
                        aria-label={formMode === "login" ? "Switch to registration" : "Switch to login"}
                    >
                        {formMode === "login" ? "Need to Register?" : "Already have an account?"}
                    </button>
                </div>
            </form>
        </BaseWindow>
    );
};