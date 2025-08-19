// src/components/ui/Windows/LoginForm.tsx
/**
 * @file LoginForm.tsx
 * @description Login/registration/reset form component for CyberTaxi onboarding, focusing on username-based login.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.2.39
 * @note Renders a non-resizable, draggable form with toggleable login/register/reset modes, including API calls.
 * @detail Handles user signup via POST /api/auth/signup, login via POST /api/auth/login/username, and placeholder reset logic.
 * Stores JWT and form data in localStorage. Uses 'newpass123' for testing.
 */
import React, { useState, useEffect, useRef } from "react";
import { BaseWindow } from "./baseWindow";
import type { BaseWindowProps } from "./baseWindow";
import type { FormEvent } from "react"; // Type-only import for verbatimModuleSyntax
import { LoginService } from "../../../services/LoginService"; // Service import
import "../../../styles/ui/LoginForm.css"; // Unique styles only

/**
 * Props for LoginForm component.
 * @interface LoginFormProps
 * @extends {Omit<BaseWindowProps, "children">}
 * @property {() => void} onClose - Callback to close the form window.
 * @property {"login" | "register" | "reset"} [mode] - Optional initial mode, defaults to 'login'.
 * @property {() => void} [onLoginSuccess] - Callback for successful login.
 */
interface LoginFormProps extends Omit<BaseWindowProps, "children"> {
    onClose: () => void;
    mode?: "login" | "register" | "reset";
    onLoginSuccess?: () => void;
}

/**
 * Renders the login/registration/reset form with validation and API integration.
 * @param {LoginFormProps} props - Component props including onClose, mode, and onLoginSuccess.
 * @returns {JSX.Element} The rendered form window.
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onClose, mode = "login", onLoginSuccess }) => {
    const [formMode, setFormMode] = useState<"login" | "register" | "reset">(mode);
    const [formData, setFormData] = useState({
        username: localStorage.getItem("username") || "",
        email: localStorage.getItem("registerData")
            ? JSON.parse(localStorage.getItem("registerData")!).email
            : "test@example.com",
        password: "newpass123", // Consistent password for testing
        new_password: "", // For reset mode
    });
    const [formError, setFormError] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [validationMessages, setValidationMessages] = useState<{
        username?: string;
        email?: string;
        password?: string;
        new_password?: string;
    }>({});
    const formRef = useRef<HTMLFormElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const newPasswordRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        console.log("Checking localStorage for username pre-fill");
        const savedData = localStorage.getItem("registerData");
        const token = localStorage.getItem("jwt_token");
        if (token) {
            console.log("Token found, setting username from localStorage");
            setFormData((prev) => ({
                ...prev,
                username: localStorage.getItem("username") || "",
                password: "newpass123",
            }));
        } else if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                console.log("Parsed registerData:", parsedData);
                setFormData((prev) => ({
                    ...prev,
                    username: parsedData.username || "",
                    email: parsedData.email || "test@example.com",
                    password: "newpass123",
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
        [usernameRef, emailRef, passwordRef, newPasswordRef].forEach((ref) => {
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
            if (!input.value.match(emailRegex)) {
                message = "Please enter a valid email (e.g., user@example.com)";
            }
        }
        input.setCustomValidity(message);
        setValidationMessages((prev) => ({ ...prev, [name]: message }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        console.log(`Form submitted, mode: ${formMode}, username: ${formData.username}`);
        if (formMode !== "reset" && formData.password.length < 6) {
            setFormError("Password must be at least 6 characters");
            return;
        }
        if (formMode === "reset" && formData.new_password.length < 6) {
            setFormError("New password must be at least 6 characters");
            return;
        }
        setFormError("");
        setIsSubmitted(true);
        setValidationMessages({});
        const form = formRef.current;
        if (!form) {
            console.log("Form ref not found");
            return;
        }
        [usernameRef, emailRef, passwordRef, newPasswordRef].forEach((ref) => {
            if (ref.current && !ref.current.validity.valid && ref.current.name) {
                const name = ref.current.name as string;
                let message = "";
                if (ref.current.validity.valueMissing) {
                    message = `Please enter a ${name}`;
                } else if (name === "email") {
                    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
                    if (!ref.current.value.match(emailRegex)) {
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
            let result: { token: string; player_id?: number } | { status: string; message: string } | null = null;
            if (formMode === "login") {
                result = await LoginService.login(formData.username, formData.password);
            } else if (formMode === "register") {
                result = await LoginService.signup(formData.username, formData.email, formData.password);
            } else {
                // Placeholder for reset password logic (pending LoginService.resetPassword)
                console.log("Reset password attempted, username:", formData.username, "new_password:", formData.new_password);
                result = { status: "Success", message: "Password reset successful (placeholder)" };
            }
            if (result && ("token" in result || result.status === "Success")) {
                if ("token" in result) {
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
                    if (formMode === "login" && onLoginSuccess) {
                        onLoginSuccess();
                    }
                } else {
                    console.log("Password reset successful:", result.message);
                }
                onClose();
            } else {
                setFormError("Operation failed");
                console.log("Form error set: Operation failed");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Network issue, please try again";
            setFormError(errorMessage);
            console.error(`${formMode === "login" ? "Login" : formMode === "register" ? "Signup" : "Reset"} error:`, errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWindowClose = () => {
        console.log("LoginForm close button triggered");
        onClose();
    };

    return (
        <BaseWindow
            id="login-window"
            title={formMode === "login" ? "CyberTaxi Login" : formMode === "register" ? "Register for CyberTaxi" : "Reset Password"}
            onClose={handleWindowClose}
            isResizable={false}
            isDraggable={true}
            style={{ zIndex: 1000 }}
            initialPosition={{ top: 200, left: 200 }}
            defaultWidth={250} // Per README
            defaultHeight={formMode === "login" ? 270 : 330} // Per README: 270px login, 330px register/reset
        >
            <form
                className={`login-form ${formMode} ${isSubmitted ? "submitted" : ""}`}
                ref={formRef}
                onSubmit={handleSubmit}
                noValidate
                role="form"
                aria-label={formMode === "login" ? "Login form" : formMode === "register" ? "Registration form" : "Reset password form"}
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
                                    onClick={() => setFormMode("login")}
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
                            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}"
                        />
                        {validationMessages.email && (
                            <span className="error-fallback" role="alert" aria-live="polite">
                                {validationMessages.email}
                            </span>
                        )}
                    </div>
                )}
                {formMode !== "reset" && (
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
                )}
                {formMode === "reset" && (
                    <div className="form-group">
                        <label htmlFor="new_password">New Password</label>
                        <input
                            type="password"
                            id="new_password"
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleInputChange}
                            onInvalid={handleInvalid}
                            placeholder="Enter New Password"
                            required
                            ref={newPasswordRef}
                            aria-required="true"
                            autoComplete="new-password"
                        />
                        {validationMessages.new_password && (
                            <span className="error-fallback" role="alert" aria-live="polite">
                                {validationMessages.new_password}
                            </span>
                        )}
                    </div>
                )}
                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting}
                        aria-label={formMode === "login" ? "Submit login" : formMode === "register" ? "Submit registration" : "Submit password reset"}
                    >
                        {isSubmitting ? "Submitting..." : formMode === "login" ? "Login" : formMode === "register" ? "Register" : "Reset Password"}
                    </button>
                    <button
                        type="button"
                        className="toggle-btn"
                        onClick={() => setFormMode(formMode === "login" ? "register" : "login")}
                        aria-label={formMode === "login" ? "Switch to registration" : "Switch to login"}
                    >
                        {formMode === "login" ? "Need to Register?" : formMode === "register" ? "Already have an account?" : "Back to Login"}
                    </button>
                </div>
            </form>
        </BaseWindow>
    );
};