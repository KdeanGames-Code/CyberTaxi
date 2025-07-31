// src/components/onboarding/register-form.tsx
import React, { useState } from "react";
import { Window } from "../ui/Window";

interface RegisterFormProps {
    onClose: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onClose }) => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            localStorage.setItem("registerData", JSON.stringify(formData));
            console.log("Form saved to localStorage:", formData); // Debug form save
            onClose();
        } catch (error) {
            console.error("Failed to save form data:", error);
        }
    };

    return (
        <Window
            id="register-window"
            title="Register for CyberTaxi"
            onClose={onClose}
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
                <button type="submit" className="submit-btn">
                    Register
                </button>
            </form>
        </Window>
    );
};
