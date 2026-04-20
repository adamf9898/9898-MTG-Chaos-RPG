/**
 * Hosted AI Provider Stub
 *
 * Stub for connecting to hosted AI model providers (OpenAI, Anthropic, etc.).
 * Requires an API key set in the environment or passed in options.
 *
 * To enable:
 *   1. Set your API key in the `copilot` GitHub environment (see SECURITY.md)
 *   2. Implement the `generate()` method body for your chosen provider
 *
 * NOTE: Never commit API keys. Use GitHub Actions environment secrets.
 */

import { BaseAIProvider } from './base.js';

export class HostedAIProvider extends BaseAIProvider {
    /**
     * @param {object} [options]
     * @param {string} [options.apiKey]  - Provider API key
     * @param {string} [options.baseUrl] - Provider base URL
     * @param {string} [options.model]   - Model identifier
     */
    constructor(options = {}) {
        super({ name: 'hosted' });
        this.apiKey = options.apiKey ?? null;
        this.baseUrl = options.baseUrl ?? 'https://api.openai.com/v1';
        this.model = options.model ?? 'gpt-4o-mini';
    }

    /**
     * @returns {Promise<boolean>}
     */
    async checkAvailability() {
        this.available = Boolean(this.apiKey);
        return this.available;
    }

    /**
     * Generate text using the hosted provider.
     * Implement this method to connect to your chosen hosted API.
     *
     * @param {string} prompt
     * @param {object} [options]
     * @returns {Promise<string>}
     */
    async generate(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('[HostedAI] No API key configured');
        }

        const messages = [
            {
                role: 'system',
                content:
                    options.systemPrompt ??
                    'You are a creative game master for a Magic: The Gathering chaos RPG.',
            },
            { role: 'user', content: prompt },
        ];

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages,
                max_tokens: options.maxTokens ?? 512,
                temperature: options.temperature ?? 0.8,
            }),
        });

        if (!response.ok) {
            throw new Error(`Hosted AI error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data?.choices?.[0]?.message?.content?.trim() ?? '';
    }
}

export default HostedAIProvider;
