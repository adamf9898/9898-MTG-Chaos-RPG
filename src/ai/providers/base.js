/**
 * Abstract AI Provider Base
 *
 * All AI providers must extend this class and implement `generate()`.
 * The AIService selects a provider at runtime.
 */

export class BaseAIProvider {
    /**
     * @param {object} options
     * @param {string} [options.name] - Provider display name
     */
    constructor(options = {}) {
        this.name = options.name ?? 'base';
        this.available = false;
    }

    /**
     * Check whether this provider is available.
     * @returns {Promise<boolean>}
     */
    async checkAvailability() {
        return false;
    }

    /**
     * Generate text from a prompt.
     * @param {string} _prompt
     * @param {object} [_options]
     * @returns {Promise<string>}
     */
    async generate(_prompt, _options = {}) {
        throw new Error(`[${this.name}] generate() not implemented`);
    }

    /**
     * Generate a structured JSON object from a prompt.
     * Falls back to parsing JSON from the text response.
     * @param {string} prompt
     * @param {object} [options]
     * @returns {Promise<object|null>}
     */
    async generateJSON(prompt, options = {}) {
        try {
            const text = await this.generate(prompt, options);
            // Extract JSON from markdown code blocks if present
            const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
            const raw = match ? match[1] : text;
            return JSON.parse(raw.trim());
        } catch (error) {
            console.warn(`[${this.name}] generateJSON parse failed:`, error.message);
            return null;
        }
    }
}
