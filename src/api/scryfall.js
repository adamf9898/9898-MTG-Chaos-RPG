/**
 * Scryfall API Client
 * Handles all interactions with the Scryfall API for MTG card data
 * Implements caching to reduce API calls and improve performance
 */

class ScryfallAPI {
    constructor() {
        this.baseURL = 'https://api.scryfall.com';
        this.cache = new Map();
        this.rateLimitDelay = 100; // Scryfall requests 50-100ms between requests
        this.lastRequestTime = 0;
    }

    /**
     * Rate limiting helper - ensures we don't exceed Scryfall's rate limits
     */
    async rateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.rateLimitDelay) {
            await this.sleep(this.rateLimitDelay - timeSinceLastRequest);
        }
        
        this.lastRequestTime = Date.now();
    }

    /**
     * Sleep utility for rate limiting
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generic API request handler with error handling and caching
     */
    async makeRequest(endpoint, useCache = true) {
        const cacheKey = endpoint;
        
        // Check cache first
        if (useCache && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            await this.rateLimit();
            
            const response = await fetch(`${this.baseURL}${endpoint}`);
            
            if (!response.ok) {
                throw new Error(`Scryfall API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Cache successful responses
            if (useCache) {
                this.cache.set(cacheKey, data);
            }
            
            return data;
        } catch (error) {
            console.error('Scryfall API request failed:', error);
            throw error;
        }
    }

    /**
     * Search for cards using Scryfall's powerful search syntax
     * @param {string} query - Scryfall search query
     * @param {Object} options - Additional search options
     */
    async searchCards(query, options = {}) {
        const params = new URLSearchParams({
            q: query,
            format: 'json',
            ...options
        });

        return this.makeRequest(`/cards/search?${params}`);
    }

    /**
     * Get a random card with optional filters
     * @param {string} query - Optional Scryfall query to filter random selection
     */
    async getRandomCard(query = '') {
        const params = query ? `?q=${encodeURIComponent(query)}` : '';
        return this.makeRequest(`/cards/random${params}`, false); // Don't cache random cards
    }

    /**
     * Get card by exact name
     * @param {string} name - Exact card name
     */
    async getCardByName(name) {
        const params = new URLSearchParams({ exact: name });
        return this.makeRequest(`/cards/named?${params}`);
    }

    /**
     * Get card by Scryfall ID
     * @param {string} id - Scryfall card ID
     */
    async getCardById(id) {
        return this.makeRequest(`/cards/${id}`);
    }

    /**
     * Search for cards suitable for boss encounters
     * High-cost, powerful creatures and spells
     */
    async getBossCards() {
        const queries = [
            'cmc>=7 type:creature power>=7',
            'cmc>=6 type:sorcery OR type:instant',
            'type:planeswalker',
            'type:enchantment cmc>=5'
        ];

        const results = [];
        for (const query of queries) {
            try {
                const response = await this.searchCards(query);
                if (response.data) {
                    results.push(...response.data.slice(0, 5)); // Get 5 cards from each category
                }
            } catch (error) {
                console.warn(`Failed to fetch boss cards for query: ${query}`, error);
            }
        }

        return results;
    }

    /**
     * Search for cards suitable for encounters and quests
     * Mid-range cards with interesting abilities
     */
    async getEncounterCards() {
        const queries = [
            'cmc>=3 cmc<=5 type:creature',
            'cmc<=4 type:artifact',
            'type:enchantment cmc<=4',
            'cmc<=3 (type:instant OR type:sorcery)'
        ];

        const results = [];
        for (const query of queries) {
            try {
                const response = await this.searchCards(query);
                if (response.data) {
                    results.push(...response.data.slice(0, 10)); // Get 10 cards from each category
                }
            } catch (error) {
                console.warn(`Failed to fetch encounter cards for query: ${query}`, error);
            }
        }

        return results;
    }

    /**
     * Get cards for player starting decks
     * Balanced, playable cards across different strategies
     */
    async getPlayerCards() {
        const queries = [
            'cmc<=3 type:creature',
            'cmc<=2 type:instant',
            'cmc<=3 type:sorcery',
            'type:land',
            'cmc<=4 type:artifact'
        ];

        const results = [];
        for (const query of queries) {
            try {
                const response = await this.searchCards(query);
                if (response.data) {
                    results.push(...response.data.slice(0, 15)); // Get 15 cards from each category
                }
            } catch (error) {
                console.warn(`Failed to fetch player cards for query: ${query}`, error);
            }
        }

        return results;
    }

    /**
     * Get cards by specific criteria for custom encounters
     * @param {Object} criteria - Search criteria
     */
    async getCardsByCriteria(criteria) {
        let query = '';
        
        if (criteria.colors) {
            query += `color:${criteria.colors.join('')} `;
        }
        
        if (criteria.types) {
            query += `(${criteria.types.map(type => `type:${type}`).join(' OR ')}) `;
        }
        
        if (criteria.cmc) {
            if (criteria.cmc.min !== undefined) query += `cmc>=${criteria.cmc.min} `;
            if (criteria.cmc.max !== undefined) query += `cmc<=${criteria.cmc.max} `;
        }
        
        if (criteria.keywords) {
            query += criteria.keywords.map(kw => `keyword:${kw}`).join(' ');
        }

        return this.searchCards(query.trim());
    }

    /**
     * Get card sets information
     */
    async getSets() {
        return this.makeRequest('/sets');
    }

    /**
     * Get cards from a specific set
     * @param {string} setCode - Three letter set code
     */
    async getCardsFromSet(setCode) {
        return this.makeRequest(`/cards/search?q=set:${setCode}`);
    }

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Create and export a singleton instance
const scryfallAPI = new ScryfallAPI();
export default scryfallAPI;