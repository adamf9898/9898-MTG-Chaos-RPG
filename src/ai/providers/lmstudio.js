/**
 * LM Studio AI Provider
 *
 * Connects to a locally running LM Studio instance.
 * Default endpoint: http://localhost:1234/v1 (OpenAI-compatible API)
 *
 * Setup:
 *   1. Install LM Studio: https://lmstudio.ai/
 *   2. Load a model (e.g. Mistral, LLaMA 3, Phi-3)
 *   3. Start the local server in LM Studio
 *   4. This provider will automatically detect and use it
 *
 * Falls back silently if LM Studio is not running.
 */

import { BaseAIProvider } from './base.js';

export class LMStudioProvider extends BaseAIProvider {
    /**
     * @param {object} [options]
     * @param {string} [options.baseUrl] - LM Studio server URL
     * @param {string} [options.model]   - Model identifier (default: auto-detect)
     * @param {number} [options.maxTokens] - Max tokens to generate
     * @param {number} [options.temperature] - Sampling temperature (0–2)
     */
    constructor(options = {}) {
        super({ name: 'lmstudio' });
        this.baseUrl = options.baseUrl ?? 'http://localhost:1234/v1';
        this.model = options.model ?? null; // null = use whatever is loaded
        this.maxTokens = options.maxTokens ?? 512;
        this.temperature = options.temperature ?? 0.8;
    }

    /**
     * Check if LM Studio server is running.
     * @returns {Promise<boolean>}
     */
    async checkAvailability() {
        try {
            const response = await fetch(`${this.baseUrl}/models`, {
                signal: AbortSignal.timeout(2000),
            });
            this.available = response.ok;
            if (this.available) {
                // Auto-detect loaded model if not specified
                if (!this.model) {
                    const data = await response.json();
                    this.model = data?.data?.[0]?.id ?? null;
                    if (this.model) {
                        console.log(`[LMStudio] Using model: ${this.model}`);
                    }
                }
            }
        } catch {
            this.available = false;
        }
        return this.available;
    }

    /**
     * Generate text using the LM Studio local model.
     * @param {string} prompt
     * @param {object} [options]
     * @param {number} [options.temperature]
     * @param {number} [options.maxTokens]
     * @param {string} [options.systemPrompt]
     * @returns {Promise<string>}
     */
    async generate(prompt, options = {}) {
        const messages = [];
        const systemPrompt =
            options.systemPrompt ??
            'You are a creative game master for a Magic: The Gathering chaos RPG. ' +
                'Generate vivid, concise content in the style of MTG lore.';

        messages.push({ role: 'system', content: systemPrompt });
        messages.push({ role: 'user', content: prompt });

        const body = {
            model: this.model ?? 'local-model',
            messages,
            max_tokens: options.maxTokens ?? this.maxTokens,
            temperature: options.temperature ?? this.temperature,
            stream: false,
        };

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(30000),
        });

        if (!response.ok) {
            throw new Error(`LM Studio API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data?.choices?.[0]?.message?.content?.trim() ?? '';
    }
}

export default LMStudioProvider;
