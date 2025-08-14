// src/components/ui/LoginForm.tsx
/**
 * @file LoginForm.tsx
 * @description Static login/registration form component for CyberTaxi onboarding.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.2
 * @note Renders a non-resizable, draggable form with toggleable login/register modes, no API calls yet.
 */
import React, { useState, useEffect, useRef } from "react";
import { CyberWindow } from "../ui/CyberWindow";
import "../../styles/ui/LoginForm.css"; // Unique styles only
import "../../styles/windows.css"; // Reuse existing styles

/**
 * Props for LoginForm component.
 * @interface LoginFormProps
 */
interface LoginFormProps {
    onClose: () => void;
    mode?: "login" | "register";
}

/**
 * Renders the static login/registration form.
 * @param props - Component props.
 * @returns JSX.Element - Form window.
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onClose, mode = "login" }) => {
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
     */
    useEffect(() => {
        setFormMode(mode);
        setFormData({ username: "", email: "test@example.com", password: "" });
        [usernameRef, emailRef, passwordRef].forEach((ref) => {
            ref.current?.setCustomValidity("");
        });
    }, [mode]);

    /**
     * Handles input changes (static for now).
     * @param e - Input change event.
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Toggles between login and register modes.
     */
    const toggleMode = () => {
        setFormMode(formMode === "login" ? "register" : "login");
        setFormData({ username: "", email: "test@example.com", password: "" });
        [usernameRef, emailRef, passwordRef].forEach((ref) => {
            ref.current?.setCustomValidity("");
        });
    };

    return (
        <CyberWindow
            id="login-window"
            title={formMode === "login" ? "CyberTaxi Login" : "Register for CyberTaxi"}
            onClose={onClose}
            isResizable={false}
            style={{ zIndex: 1000 }}
            initialPosition={{ top: 200, left: 200 }}
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
        </CyberWindow>
    );
};