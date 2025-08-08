/**
 * register-form.tsx - Renders a non-resizable, draggable login/registration form for CyberTaxi onboarding.
 * Handles user signup via POST /api/auth/signup and login via POST /api/auth/login, stores JWT, and saves form data to localStorage.
 * Uses username for UI, maps to player_id internally, per GDD v1.1.
 * @module RegisterForm
 * @version 0.2.37
 */

import React, { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { Window } from "../ui/Window";
import "../../styles/windows.css";

interface RegisterFormProps {
    onClose: () => void;
    mode?: "login" | "register";
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
    onClose,
    mode = "login",
}) => {
    const [formMode, setFormMode] = useState<"login" | "register">(mode);
    const [formData, setFormData] = useState({
        username: "",
        email: "test@example.com",
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
        setValidationMessages((prev) => ({ ...prev, [name]: "" }));
        setFormError("");
        if (e.target) {
            e.target.setCustomValidity("");
        }
    };

    const handleInvalid = (e: React.InvalidEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        console.log(`Invalid event triggered for ${input.name}`);
        let message = "";
        if (input.validity.valueMissing) {
            message = `Please enter a ${input.name}`;
        } else if (input.name === "email") {
            const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
            if (!emailRegex.test(input.value)) {
                message = "Please enter a valid email (e.g., user@example.com)";
            }
        }
        input.setCustomValidity(message);
        setValidationMessages((prev) => ({ ...prev, [input.name]: message }));
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
            if (
                ref.current &&
                ref.current.validity &&
                !ref.current.validity.valid &&
                ref.current.name
            ) {
                const name = ref.current.name;
                let message = "";
                if (ref.current.validity.valueMissing) {
                    message = `Please enter a ${name}`;
                } else if (name === "email") {
                    const emailRegex =
                        /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
                    if (!emailRegex.test(ref.current.value)) {
                        message =
                            "Please enter a valid email (e.g., user@example.com)";
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
            const payload =
                formMode === "login"
                    ? {
                          player_id: parseInt(
                              localStorage.getItem("player_id") || "1"
                          ),
                          password: formData.password,
                      }
                    : {
                          username: formData.username,
                          email: formData.email,
                          password: formData.password,
                      };
            const endpoint =
                formMode === "login" ? "/api/auth/login" : "/api/auth/signup";
            console.log(
                `Sending POST ${endpoint} with username: ${formData.username}`
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
                if (result.player_id) {
                    localStorage.setItem(
                        "player_id",
                        result.player_id.toString()
                    );
                }
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
                        player_id: result.player_id || 1,
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
                console.log("Calling onClose for successful submission");
                onClose();
            } else {
                setFormError(result.message || "Unknown server error");
                console.log(
                    "Form error set:",
                    result.message || "Unknown server error"
                );
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Network issue, please try again";
            setFormError(`Error: ${errorMessage}`);
            console.error(
                `${formMode === "login" ? "Login" : "Signup"} error:`,
                errorMessage
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleMode = () => {
        console.log(
            "Toggling to mode:",
            formMode === "login" ? "signup" : "login"
        );
        setFormMode(formMode === "login" ? "register" : "login");
        setFormError("");
        setIsSubmitted(false);
        setValidationMessages({});
        setFormData({
            username: "",
            email: "test@example.com",
            password: "test123",
        });
        [usernameRef, emailRef, passwordRef].forEach((ref) => {
            ref.current?.setCustomValidity("");
        });
    };

    const handleWindowClose = () => {
        console.log("RegisterForm close button triggered");
        onClose();
    };

    return (
        <Window
            id="register-window"
            title={
                formMode === "login"
                    ? "CyberTaxi Login"
                    : "Register for CyberTaxi"
            }
            onClose={handleWindowClose}
            isResizable={false}
            style={{ zIndex: 1000 }}
            initialPosition={{ top: 200, left: 200 }}
        >
            <form
                className={`register-form ${isSubmitted ? "submitted" : ""}`}
                ref={formRef}
                onSubmit={handleSubmit}
                noValidate
                role="form"
                aria-label={
                    formMode === "login" ? "Login form" : "Registration form"
                }
            >
                {formError && (
                    <p
                        className="error-message form-error"
                        role="alert"
                        aria-live="assertive"
                    >
                        {formError}
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
                    />
                    {validationMessages.username && (
                        <span
                            className="error-fallback"
                            role="alert"
                            aria-live="polite"
                        >
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
                        />
                        {validationMessages.email && (
                            <span
                                className="error-fallback"
                                role="alert"
                                aria-live="polite"
                            >
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
                    />
                    {validationMessages.password && (
                        <span
                            className="error-fallback"
                            role="alert"
                            aria-live="polite"
                        >
                            {validationMessages.password}
                        </span>
                    )}
                </div>
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
