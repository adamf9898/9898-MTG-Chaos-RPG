# MTG Chaos RPG: Feature Implementation Menu

Use this menu to select one bounded feature for a reviewed pull request. Keep
the feature categories intact; proposals below are not claims of implementation.

1. **Game Architecture & State Management** - Improve modular state and browser UI integration.

2. **Scryfall API Integration** - Use `src/services/cardSource.js` for cached online lookups and offline MTGJSON fallback.

3. **AI-Driven Encounters & Storytelling** - Extend local personality-driven content or the existing provider interface.

4. **Multiplayer & Real-Time Collaboration** - Deferred: this static app has no authoritative multiplayer server or matchmaking.

5. **Custom Content System (Cards, Bosses, Quests)** - Extend the existing data and generator APIs with real-module tests.

6. **Frontend UI & Accessibility** - Maintain semantic HTML, keyboard access, responsive layout, and reduced-motion support.

7. **DevOps, Testing & Continuous Deployment** - Extend existing read-only audit and CI; do not add uncontrolled auto-edit loops.

8. **Documentation & Contribution Guidelines** - Keep commands, supported capabilities, and role handoffs aligned.

For each iteration, analyze -> summarize -> plan -> implement -> test -> reflect
-> document, then stop for human review. Use
`.github/prompts/continuous-improvement.prompt.md` and
`docs/continuous-improvement.md` for the checklist, roles, and report format.
