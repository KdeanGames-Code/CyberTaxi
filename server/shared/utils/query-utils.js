/**
 * @file query-utils.js
 * @description Reusable database query functions for CyberTaxi
 * @author CyberTaxi Team
 * @version 0.1.0
 */

const pool = require("../../models/db");

/**
 * Fetch a player's bank balance
 * @param {number} playerId - The player's ID
 * @returns {Promise<number>} The player's bank balance
 * @throws {Error} If the player is not found or query fails
 */
async function getUserBalance(playerId) {
    try {
        console.log(`Fetching balance for player_id: ${playerId}`); // Debug log
        const [rows] = await pool.execute(
            "SELECT bank_balance FROM players WHERE player_id = ?",
            [playerId]
        );
        if (rows.length === 0) {
            throw new Error("Player not found");
        }
        return parseFloat(rows[0].bank_balance);
    } catch (error) {
        console.error(
            `Failed to fetch balance for player_id: ${playerId}:`,
            error.message
        );
        throw error;
    }
}

module.exports = { getUserBalance };
