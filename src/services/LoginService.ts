// src/services/LoginService.ts
/**
 * @file LoginService.ts
 * @description Service class for handling login and signup API calls in CyberTaxi.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.1
 * @note Manages authentication requests to the backend, isolating API logic from UI components.
 * @detail Uses API_CONFIG.BASE_URL for dynamic endpoint configuration.
 */
import { API_CONFIG } from "../config/apiConfig";

export class LoginService {
    /**
     * Attempts login with username and password.
     * @param {string} username - User’s username.
     * @param {string} password - User’s password.
     * @returns {Promise<{ token: string; player_id?: number } | null>} Login result or null on failure.
     * @throws {Error} If the HTTP request fails or the response is invalid.
     */
    static async login(username: string, password: string): Promise<{ token: string; player_id?: number } | null> {
        try {
            console.log(`Attempting login with username: ${username}`);
            const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login/username`, {
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
                return result;
            }
            return null;
        } catch (error) {
            console.error("Login error:", error);
            throw error instanceof Error ? error : new Error("Network issue during login");
        }
    }

    /**
     * Attempts signup with username, email, and password.
     * @param {string} username - User’s username.
     * @param {string} email - User’s email.
     * @param {string} password - User’s password.
     * @returns {Promise<{ token: string; player_id?: number } | null>} Signup result or null on failure.
     * @throws {Error} If the HTTP request fails or the response is invalid.
     */
    static async signup(username: string, email: string, password: string): Promise<{ token: string; player_id?: number } | null> {
        try {
            console.log(`Attempting signup with username: ${username}`);
            const response = await fetch(`${API_CONFIG.BASE_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Signup failed: ${errorText}`);
            }
            const result = await response.json();
            console.log("Signup response:", result);
            if (result.status === "Success" && result.token) {
                return result;
            }
            return null;
        } catch (error) {
            console.error("Signup error:", error);
            throw error instanceof Error ? error : new Error("Network issue during signup");
        }
    }
}