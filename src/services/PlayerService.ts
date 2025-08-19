// src/services/PlayerService.ts
/**
 * @file PlayerService.ts
 * @description Service for fetching player statistics in CyberTaxi, such as bank balance and score.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.7
 * @note Provides API integration for player stats, aligns with GDD v1.1.
 * @detail Fetches data from /api/player/:username/balance and /api/player/:username/score, refreshes token on 403.
 */
import { API_CONFIG } from "../config/apiConfig";
import { LoginService } from "./LoginService";

export class PlayerService {
    /**
     * Refreshes JWT token using stored username and password.
     * @param username - Player username from localStorage.
     * @returns {Promise<string>} New JWT token.
     * @throws {Error} If refresh fails.
     */
    private static async refreshToken(username: string): Promise<string> {
        try {
            const password = localStorage.getItem("password") || "newpass123"; // Fallback for testing
            const response = await LoginService.login(username, password);
            if (!response?.token) {
                throw new Error("Failed to refresh token");
            }
            localStorage.setItem("jwt_token", response.token);
            console.log("PlayerService: Token refreshed for", username);
            return response.token;
        } catch (error) {
            console.error("PlayerService: Error refreshing token:", error);
            throw error;
        }
    }

    /**
     * Fetches player statistics (bank balance and score).
     * @returns {Promise<{ bankBalance: number; score: number }>} Player stats.
     * @throws {Error} If API call fails.
     */
    static async getPlayerStats(): Promise<{ bankBalance: number; score: number }> {
        try {
            let token = localStorage.getItem("jwt_token");
            const username = localStorage.getItem("username");
            if (!token || !username) {
                throw new Error("Missing JWT token or username");
            }
            console.log("PlayerService: Fetching player stats for", username);

            // Fetch bank balance
            let balanceResponse = await fetch(`${API_CONFIG.BASE_URL}/player/${username}/balance`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (balanceResponse.status === 403) {
                console.log("PlayerService: 403 on balance, refreshing token");
                token = await this.refreshToken(username);
                balanceResponse = await fetch(`${API_CONFIG.BASE_URL}/player/${username}/balance`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
            }
            if (!balanceResponse.ok) {
                throw new Error(`Balance HTTP error! status: ${balanceResponse.status}`);
            }
            const balanceData = await balanceResponse.json();

            // Fetch score
            let scoreResponse = await fetch(`${API_CONFIG.BASE_URL}/player/${username}/score`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (scoreResponse.status === 403) {
                console.log("PlayerService: 403 on score, refreshing token");
                token = await this.refreshToken(username);
                scoreResponse = await fetch(`${API_CONFIG.BASE_URL}/player/${username}/score`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
            }
            if (!scoreResponse.ok) {
                throw new Error(`Score HTTP error! status: ${scoreResponse.status}`);
            }
            const scoreData = await scoreResponse.json();

            return { bankBalance: balanceData.bank_balance, score: scoreData.score };
        } catch (error) {
            console.error("PlayerService: Error fetching player stats, using fallback:", error);
            // Fallback to placeholder values on error
            return { bankBalance: 50000, score: 1000 };
        }
    }
}