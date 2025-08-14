// src/components/ui/Windows/LoginForm.tsx
/**
 * @file LoginForm.tsx
 * @description Login/registration form component for CyberTaxi onboarding.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.2.9
 * @note Renders a non-resizable, draggable form with toggleable login/register modes, including API calls.
 * @detail Handles user signup via POST /api/auth/signup and login via POST /api/auth/login/username,
 *         stores JWT and form data in localStorage, using username for UI and mapping to player_id internally.
 */
import React, { useState, useEffect, useRef } from "react";
import { BaseWindow } from "./baseWindow";
import type { BaseWindowProps } from "./baseWindow";
import type { FormEvent } from "react"; // Type-only import for verbatimModuleSyntax
import "../../../styles/ui/LoginForm.css"; // Unique styles only

/**
 * Props for LoginForm component.
 * @interface LoginFormProps
 * @extends {Omit<BaseWindowProps, "children">}
 * @property {() => void} onClose - Callback to close the form window.
 * @property {"login" | "register"} [mode] - Optional initial mode, defaults to 'login'.
 */
interface LoginFormProps extends Omit<BaseWindowProps, "children"> {
    onClose: () => void;
    mode?: "login" | "register";
}

/**
 * Renders the login/registration form with validation and API integration.
 * @param {LoginFormProps} props - Component props including onClose and optional mode.
 * @returns {JSX.Element} The rendered form window.
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onClose, mode = "login" }) => {
    const [formMode, setFormMode] = useState<"login" | "register">(mode);
    const [formData, setFormData] = useState({
        username: localStorage.getItem("username") || "",
        email: localStorage.getItem("registerData")
            ? JSON.parse(localStorage.getItem("registerData")!).email
            : "test@example.com",
        password: "test123",
    });
    const [formError, setFormError] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [validationMessages, setValidationMessages] = useState<{
        username?: string;
        email?: string;
        password?: string;
    }>({});
    const formRef = useRef<HTMLFormElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        console.log("Checking localStorage for username pre-fill");
        const savedData = localStorage.getItem("registerData");
        const token = localStorage.getItem("jwt_token");
        if (token) {
            console.log("Token found, setting username from localStorage");
            setFormData((prev) => ({
                ...prev,
                username: localStorage.getItem("username") || "",
            }));
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

    useEffect(() => {
        setFormMode(mode);
        setFormError("");
        setIsSubmitted(false);
        setValidationMessages({});
        console.log(`Form mode set to: ${mode}`);
        [usernameRef, emailRef, passwordRef].forEach((ref) => {
            ref.current?.setCustomValidity("");
        });
    }, [mode]);

    useEffect(() => {
        console.log("Validation messages updated:", validationMessages);
    }, [validationMessages]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setValidationMessages((prev) => ({ ...prev, [name as string]: "" }));
        setFormError("");
        if (e.target) {
            e.target.setCustomValidity("");
        }
    };

    const handleInvalid = (e: React.InvalidEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        const name = input.name as string;
        console.log(`Invalid event triggered for ${name}`);
        let message = "";
        if (input.validity.valueMissing) {
            message = `Please enter a ${name}`;
        } else if (name === "email") {
            const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
            if (!emailRegex.test(input.value)) {
                message = "Please enter a valid email (e.g., user@example.com)";
            }
        }
        input.setCustomValidity(message);
        setValidationMessages((prev) => ({ ...prev, [name]: message }));
    };

    const attemptLogin = async (username: string, password: string) => {
        try {
            console.log(`Attempting login with username: ${username}`);
            const response = await fetch("http://localhost:3000/api/auth/login/username", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Login failed: ${errorText}`);
            }
            const result = await response.json();
            console.log("Login response:", result);
            if (result.status === "Success" && result.token) {
                localStorage.setItem("jwt_token", result.token);
                localStorage.setItem("username", username);
                if (result.player_id) {
                    localStorage.setItem("player_id", result.player_id.toString());
                }
                localStorage.setItem("registerData", JSON.stringify({
                    username,
                    email: formData.email,
                }));
                console.log("Login successful, token stored:", result.token);
                onClose();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        console.log(`Form submitted, mode: ${formMode}`);
        setFormError("");
        setIsSubmitted(true);
        setValidationMessages({});
        const form = formRef.current;
        if (!form) {
            console.log("Form ref not found");
            return;
        }
        [usernameRef, emailRef, passwordRef].forEach((ref) => {
            if (ref.current && !ref.current.validity.valid && ref.current.name) {
                const name = ref.current.name as string;
                let message = "";
                if (ref.current.validity.valueMissing) {
                    message = `Please enter a ${name}`;
                } else if (name === "email") {
                    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
                    if (!emailRegex.test(ref.current.value)) {
                        message = "Please enter a valid email (e.g., user@example.com)";
                    }
                }
                ref.current.setCustomValidity(message);
                setValidationMessages((prev) => ({ ...prev, [name]: message }));
            }
        });
        if (!form.checkValidity()) {
            console.log("Form validation failed");
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                username: formData.username,
                password: formData.password,
                ...(formMode === "register" ? { email: formData.email } : {}),
            };
            const endpoint = formMode === "login" ? "/api/auth/login/username" : "/api/auth/signup";
            console.log(`Sending POST ${endpoint} with username: ${formData.username}`);
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 409 && formMode === "register") {
                    const loginSuccess = await attemptLogin(formData.username, formData.password);
                    if (loginSuccess) return;
                    throw new Error("Username or email already exists. Try different credentials or log in.");
                }
                throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
            }
            const result = await response.json();
            console.log(`${formMode === "login" ? "Login" : "Signup"} response:`, result);
            if (result.status === "Success" && result.token) {
                localStorage.setItem("jwt_token", result.token);
                localStorage.setItem("username", formData.username);
                if (result.player_id) {
                    localStorage.setItem("player_id", result.player_id.toString());
                }
                localStorage.setItem("registerData", JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                }));
                console.log(`${formMode === "login" ? "Login" : "Signup"} successful, token stored:`, result.token);
                onClose();
            } else {
                setFormError(result.message || "Unknown server error");
                console.log("Form error set:", result.message || "Unknown server error");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Network issue, please try again";
            setFormError(errorMessage);
            console.error(`${formMode === "login" ? "Login" : "Signup"} error:`, errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleMode = () => {
        console.log("Toggling to mode:", formMode === "login" ? "register" : "login");
        setFormMode(formMode === "login" ? "register" : "login");
        setFormError("");
        setIsSubmitted(false);
        setValidationMessages({});
        setFormData({
            username: localStorage.getItem("username") || "",
            email: localStorage.getItem("registerData")
                ? JSON.parse(localStorage.getItem("registerData")!).email
                : "test@example.com",
            password: "test123",
        });
        [usernameRef, emailRef, passwordRef].forEach((ref) => {
            ref.current?.setCustomValidity("");
        });
    };

    const handleWindowClose = () => {
        console.log("LoginForm close button triggered");
        onClose();
    };

    return (
        <BaseWindow
            id="login-window"
            title={formMode === "login" ? "CyberTaxi Login" : "Register for CyberTaxi"}
            onClose={handleWindowClose}
            isResizable={false}
            isDraggable={true}
            style={{ zIndex: 1000 }}
            initialPosition={{ top: 200, left: 200 }}
        >
            <form
                className={`login-form ${isSubmitted ? "submitted" : ""}`}
                ref={formRef}
                onSubmit={handleSubmit}
                noValidate
                role="form"
                aria-label={formMode === "login" ? "Login form" : "Registration form"}
            >
                {formError && (
                    <p className="error-message form-error" role="alert" aria-live="assertive">
                        {formError}
                        {formError.includes("Username or email already exists") && (
                            <span>
                                {" "}
                                <button
                                    type="button"
                                    className="toggle-btn"
                                    onClick={toggleMode}
                                    aria-label="Switch to login"
                                >
                                    Try logging in
                                </button>
                            </span>
                        )}
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
                        onInvalid={handleInvalid}
                        placeholder="Enter Username"
                        required
                        ref={usernameRef}
                        aria-required="true"
                        autoComplete="username"
                    />
                    {validationMessages.username && (
                        <span className="error-fallback" role="alert" aria-live="polite">
                            {validationMessages.username}
                        </span>
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
                            onInvalid={handleInvalid}
                            placeholder="Enter Email"
                            required
                            ref={emailRef}
                            aria-required="true"
                            autoComplete="email"
                        />
                        {validationMessages.email && (
                            <span className="error-fallback" role="alert" aria-live="polite">
                                {validationMessages.email}
                            </span>
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
                        onInvalid={handleInvalid}
                        placeholder="Enter Password"
                        required
                        ref={passwordRef}
                        aria-required="true"
                        autoComplete="current-password"
                    />
                    {validationMessages.password && (
                        <span className="error-fallback" role="alert" aria-live="polite">
                            {validationMessages.password}
                        </span>
                    )}
                </div>
                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting}
                        aria-label={formMode === "login" ? "Submit login" : "Submit registration"}
                    >
                        {isSubmitting ? "Submitting..." : formMode === "login" ? "Login" : "Register"}
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