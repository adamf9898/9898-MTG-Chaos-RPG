/**
 * League Actions — 9898-MTG-League
 *
 * All state mutations for the league go through these actions.
 * In the browser, state is kept in-memory and synced to sessionStorage.
 * In Node (GitHub Actions rollover), state is read/written to data/league/*.json.
 */

import { createSeason, calculateStandings } from './leagueState.js';

class LeagueActions {
    constructor() {
        /** @type {import('./leagueState.js').LeagueSeason|null} */
        this._season = null;
        this._seasonNumber = 1;
    }

    // ──────────────────────────────────────────────────────────────
    // Internal helpers
    // ──────────────────────────────────────────────────────────────

    /**
     * Load (or initialise) the current season.
     * In the browser, falls back to sessionStorage.
     * @returns {Promise<import('./leagueState.js').LeagueSeason>}
     */
    async _loadSeason() {
        if (this._season) {
            return this._season;
        }

        // Browser: try sessionStorage
        if (typeof window !== 'undefined' && window.sessionStorage) {
            const raw = sessionStorage.getItem('league_season');
            if (raw) {
                try {
                    this._season = JSON.parse(raw);
                    return this._season;
                } catch {
                    // corrupt — fall through to fresh init
                }
            }
        }

        // Fallback: start a fresh season in memory
        this._season = createSeason(this._seasonNumber);
        return this._season;
    }

    /**
     * Persist the current season state.
     */
    async _saveSeason() {
        if (!this._season) {
            return;
        }
        if (typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.setItem('league_season', JSON.stringify(this._season));
        }
        // In Node/CI the rollover script handles file writes
    }

    // ──────────────────────────────────────────────────────────────
    // Public API
    // ──────────────────────────────────────────────────────────────

    /**
     * Record a match result and update standings.
     * @param {object} params
     * @param {string} params.player1
     * @param {string} params.player2
     * @param {string|null} params.winner - Player name or null for draw
     * @param {string} [params.format]
     * @param {number} [params.turns]
     * @param {string} [params.notes]
     * @returns {Promise<import('./leagueState.js').LeagueStanding[]>}
     */
    async recordMatch({
        player1,
        player2,
        winner = null,
        format = 'chaos-rpg',
        turns = 0,
        notes = '',
    }) {
        if (!player1 || !player2) {
            throw new Error('Both player1 and player2 are required');
        }
        if (player1 === player2) {
            throw new Error('player1 and player2 must be different');
        }
        if (winner !== null && winner !== player1 && winner !== player2) {
            throw new Error(`winner must be "${player1}", "${player2}", or null`);
        }

        const season = await this._loadSeason();
        const match = {
            id: `match-${Date.now()}`,
            date: new Date().toISOString(),
            player1,
            player2,
            winner,
            format,
            turns,
            notes,
        };

        season.matches.push(match);
        season.standings = calculateStandings(season.matches);
        await this._saveSeason();

        console.log(
            `[League] Match recorded: ${player1} vs ${player2} → winner: ${winner ?? 'draw'}`
        );
        return season.standings;
    }

    /**
     * Get the current standings.
     * @returns {Promise<import('./leagueState.js').LeagueStanding[]>}
     */
    async getStandings() {
        const season = await this._loadSeason();
        return season.standings;
    }

    /**
     * Get all matches in the current season.
     * @returns {Promise<import('./leagueState.js').LeagueMatch[]>}
     */
    async getMatches() {
        const season = await this._loadSeason();
        return season.matches;
    }

    /**
     * Get the full current season object.
     * @returns {Promise<import('./leagueState.js').LeagueSeason>}
     */
    async getCurrentSeason() {
        return this._loadSeason();
    }

    /**
     * Advance to a new season (archives current, starts fresh).
     * @returns {Promise<import('./leagueState.js').LeagueSeason>}
     */
    async advanceSeason() {
        const current = await this._loadSeason();
        current.active = false;
        current.endDate = new Date().toISOString();

        this._seasonNumber = current.season + 1;
        this._season = createSeason(this._seasonNumber);
        await this._saveSeason();

        console.log(`[League] Advanced to season ${this._seasonNumber}`);
        return this._season;
    }

    /**
     * Reset the league completely (admin only).
     * @returns {Promise<import('./leagueState.js').LeagueSeason>}
     */
    async resetLeague() {
        this._seasonNumber = 1;
        this._season = createSeason(1);
        await this._saveSeason();
        console.log('[League] League reset to season 1');
        return this._season;
    }
}

export const leagueActions = new LeagueActions();
export default leagueActions;
