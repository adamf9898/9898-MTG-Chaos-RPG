/**
 * MTGJSON Offline Card Provider
 *
 * Provides card lookup from locally cached MTGJSON bulk data.
 * Cache is downloaded by `tools/fetch-mtgjson.js` (run nightly via GitHub Actions).
 *
 * Cache location: data/mtgjson/AtomicCards.json
 *
 * Data format follows the MTGJSON AtomicCards schema:
 * https://mtgjson.com/data-models/card/card-atomic/
 */

class MTGJSONProvider {
    constructor() {
        /** @type {Map<string, object>|null} */
        this._cards = null;
        this._loadPromise = null;
        this._cacheUrl = '/data/mtgjson/AtomicCards.json';
    }

    /**
     * Load the MTGJSON cache (lazy, only once).
     * @returns {Promise<Map<string, object>>}
     */
    async _load() {
        if (this._cards) {
            return this._cards;
        }
        if (this._loadPromise) {
            return this._loadPromise;
        }
        this._loadPromise = this._fetchCache();
        this._cards = await this._loadPromise;
        return this._cards;
    }

    /**
     * @returns {Promise<Map<string, object>>}
     */
    async _fetchCache() {
        try {
            const response = await fetch(this._cacheUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const json = await response.json();
            // AtomicCards.json has shape: { data: { "Card Name": [printings...] } }
            const data = json.data ?? json;
            const map = new Map();
            for (const [name, printings] of Object.entries(data)) {
                // Use the first printing as the canonical entry
                const card = Array.isArray(printings) ? printings[0] : printings;
                map.set(name.toLowerCase(), { ...card, name });
            }
            console.log(`[MTGJSON] Loaded ${map.size} cards from cache`);
            return map;
        } catch (error) {
            console.warn('[MTGJSON] Cache not available:', error.message);
            return new Map();
        }
    }

    /**
     * Search cards by name fragment or simple color/type filter.
     * MTGJSON does not support Scryfall query syntax; only name search is supported.
     * @param {string} query
     * @returns {Promise<Array<object>>}
     */
    async searchCards(query) {
        const cards = await this._load();
        if (cards.size === 0) {
            return [];
        }
        const q = query.toLowerCase();
        const results = [];
        for (const [, card] of cards) {
            if (card.name?.toLowerCase().includes(q)) {
                results.push(this._normalize(card));
                if (results.length >= 100) {
                    break;
                }
            }
        }
        return results;
    }

    /**
     * Get a card by exact name.
     * @param {string} name
     * @returns {Promise<object|null>}
     */
    async getCardByName(name) {
        const cards = await this._load();
        const card = cards.get(name.toLowerCase());
        return card ? this._normalize(card) : null;
    }

    /**
     * Get a random card from the cache.
     * @param {string} [_query] - Ignored; random selection from full cache
     * @returns {Promise<object|null>}
     */
    async getRandomCard(_query = '') {
        const cards = await this._load();
        if (cards.size === 0) {
            return null;
        }
        const entries = [...cards.values()];
        const card = entries[Math.floor(Math.random() * entries.length)];
        return this._normalize(card);
    }

    /**
     * Normalize an MTGJSON card to a shape compatible with Scryfall card objects.
     * @param {object} card
     * @returns {object}
     */
    _normalize(card) {
        return {
            id: card.uuid ?? card.name,
            name: card.name,
            mana_cost: card.manaCost ?? '',
            type_line: card.type ?? '',
            oracle_text: card.text ?? '',
            colors: card.colors ?? [],
            color_identity: card.colorIdentity ?? [],
            power: card.power,
            toughness: card.toughness,
            rarity: card.rarity ?? 'common',
            set: card.setCode ?? '',
            // MTGJSON doesn't have image URIs in AtomicCards — use Scryfall image URL as fallback
            image_uris: {
                normal: `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(card.name)}&format=image`,
            },
            _source: 'mtgjson',
        };
    }
}

const mtgjsonProvider = new MTGJSONProvider();
export default mtgjsonProvider;
