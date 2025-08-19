// src/services/PlayerService.ts
/**
 * @file PlayerService.ts
 * @description Service for fetching player statistics in CyberTaxi, such as bank balance and score.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.5
 * @note Provides API integration for player stats, aligns with GDD v1.1.
 * @detail Fetches data from /api/player/:username/balance and /api/player/:username/score, falls back to placeholders on error.
 */
import { API_CONFIG } from "../config/apiConfig";

export class PlayerService {
    /**
     * Fetches player statistics (bank balance and score).
     * @returns {Promise<{ bankBalance: number; score: number }>} Player stats.
     * @throws {Error} If API call fails.
     */
    static async getPlayerStats(): Promise<{ bankBalance: number; score: number }> {
        try {
            const token = localStorage.getItem("jwt_token");
            const username = localStorage.getItem("username");
            if (!token || !username) {
                throw new Error("Missing JWT token or username");
            }
            console.log("PlayerService: Fetching player stats for", username);

            // Fetch bank balance
            const balanceResponse = await fetch(`${API_CONFIG.BASE_URL}/player/${username}/balance`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (!balanceResponse.ok) {
                throw new Error(`Balance HTTP error! status: ${balanceResponse.status}`);
            }
            const balanceData = await balanceResponse.json();

            // Fetch score
            const scoreResponse = await fetch(`${API_CONFIG.BASE_URL}/player/${username}/score`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
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