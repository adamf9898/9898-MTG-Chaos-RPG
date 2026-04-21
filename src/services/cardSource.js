/**
 * Card Source Abstraction
 *
 * Provides a unified interface for fetching MTG card data.
 * Automatically selects between Scryfall (online) and MTGJSON (offline cache).
 *
 * Usage:
 *   import cardSource from '../services/cardSource.js';
 *   const cards = await cardSource.searchCards('t:dragon c:r');
 */

import scryfallAPI from '../api/scryfall.js';
import mtgjsonProvider from './mtgjson.js';

class CardSource {
    constructor() {
        /** @type {'scryfall' | 'mtgjson' | 'auto'} */
        this.provider = 'auto';
        this._scryfallAvailable = null; // null = not yet checked
    }

    /**
     * Force a specific provider ('scryfall', 'mtgjson', or 'auto').
     * @param {'scryfall' | 'mtgjson' | 'auto'} provider
     */
    setProvider(provider) {
        const valid = ['scryfall', 'mtgjson', 'auto'];
        if (!valid.includes(provider)) {
            console.warn(`Unknown card source provider "${provider}", using "auto"`);
            this.provider = 'auto';
        } else {
            this.provider = provider;
        }
    }

    /**
     * Check if Scryfall is reachable (cached for the session).
     * @returns {Promise<boolean>}
     */
    async _isScryfallAvailable() {
        if (this._scryfallAvailable !== null) {
            return this._scryfallAvailable;
        }
        try {
            const response = await fetch('https://api.scryfall.com/', {
                method: 'HEAD',
                signal: AbortSignal.timeout(3000),
            });
            this._scryfallAvailable = response.ok;
        } catch {
            this._scryfallAvailable = false;
        }
        return this._scryfallAvailable;
    }

    /**
     * Resolve which provider to use.
     * @returns {Promise<'scryfall'|'mtgjson'>}
     */
    async _resolveProvider() {
        if (this.provider !== 'auto') {
            return this.provider;
        }
        const online = await this._isScryfallAvailable();
        return online ? 'scryfall' : 'mtgjson';
    }

    /**
     * Search for cards by Scryfall syntax or name fragment.
     * @param {string} query - Scryfall search query (e.g. 't:dragon c:r')
     * @returns {Promise<Array<object>>}
     */
    async searchCards(query) {
        try {
            const provider = await this._resolveProvider();
            if (provider === 'scryfall') {
                const result = await scryfallAPI.searchCards(query);
                return result?.data ?? result ?? [];
            }
            return await mtgjsonProvider.searchCards(query);
        } catch (error) {
            console.error('[CardSource] searchCards failed:', error);
            return [];
        }
    }

    /**
     * Get a card by its exact name.
     * @param {string} name
     * @returns {Promise<object|null>}
     */
    async getCardByName(name) {
        try {
            const provider = await this._resolveProvider();
            if (provider === 'scryfall') {
                return await scryfallAPI.getCardByName(name);
            }
            return await mtgjsonProvider.getCardByName(name);
        } catch (error) {
            console.error(`[CardSource] getCardByName("${name}") failed:`, error);
            return null;
        }
    }

    /**
     * Get a random card, optionally filtered by a query.
     * @param {string} [query] - Optional Scryfall search query to filter from
     * @returns {Promise<object|null>}
     */
    async getRandomCard(query = '') {
        try {
            const provider = await this._resolveProvider();
            if (provider === 'scryfall') {
                return await scryfallAPI.getRandomCard(query);
            }
            return await mtgjsonProvider.getRandomCard(query);
        } catch (error) {
            console.error('[CardSource] getRandomCard failed:', error);
            return null;
        }
    }

    /**
     * Reset the Scryfall availability cache (useful after network changes).
     */
    resetAvailabilityCache() {
        this._scryfallAvailable = null;
    }
}

const cardSource = new CardSource();
export default cardSource;
