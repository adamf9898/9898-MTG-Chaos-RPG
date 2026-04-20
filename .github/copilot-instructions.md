# GitHub Copilot Instructions — 9898-MTG Chaos RPG

This file provides context and guidelines for GitHub Copilot and other AI agents assisting with this project. It lives at `.github/copilot-instructions.md` (the canonical location recognised by GitHub Copilot).

---

## Quick-Start Commands

```bash
npm install --legacy-peer-deps  # Install all dependencies
npm run serve                   # Dev server → http://localhost:8000
npm test                        # Run test suite (node:test)
npm run lint                    # ESLint check
npm run lint:fix                # ESLint auto-fix
npm run format                  # Prettier format all files
npm run format:check            # Prettier check (CI)
```

---

## Project Overview

**9898-MTG Chaos RPG** is a web-based Magic: The Gathering Chaos RPG featuring:

- Cooperative gameplay with dynamic, procedurally generated encounters
- Integration with the [Scryfall API](https://scryfall.com/docs/api) for real MTG card data
- AI-driven content generation with four personality modes (Default / Cautious / Experimental / Reckless)
- Perchance-compatible procedural generation system
- Boss battle system with 8 unique Master Bosses
- Quest, inventory, and player management
- **9898-MTG-League** — persistent season/standings layer (see `src/league/`)

---

## Technology Stack

| Layer          | Technology                                                        |
| -------------- | ----------------------------------------------------------------- |
| Language       | Vanilla JavaScript ES6+ (no framework)                            |
| Module System  | ES6 modules (`type: "module"`)                                    |
| Runtime        | Browser + Node 18 for dev/test/tools                              |
| Styling        | Modern CSS (Grid, Flexbox, Custom Properties)                     |
| Card Data      | Scryfall API (online) / MTGJSON (offline cache)                   |
| Procedural Gen | Perchance-compatible generator (`src/generators/perchance.js`)    |
| AI Content     | `src/ai/aiService.js` + pluggable providers (`src/ai/providers/`) |
| Testing        | Node.js built-in `node:test` + `node:assert`                      |
| Linting        | ESLint 9 (flat config) + Prettier                                 |
| Git Hooks      | Husky + lint-staged                                               |
| CI             | GitHub Actions (`.github/workflows/ci.yml`)                       |
| Deploy         | GitHub Pages (`.github/workflows/static.yml`)                     |

---

## Module Structure

```
src/
├── ai/
│   ├── aiService.js          # AI personality system & content generation
│   └── providers/
│       ├── base.js           # Abstract AI provider interface
│       ├── lmstudio.js       # LM Studio (local LLM) provider
│       └── hosted.js         # Stub for hosted model providers
├── api/
│   └── scryfall.js           # Scryfall API client (rate-limited + cached)
├── core/
│   └── gameState.js          # Game state + observer pattern
├── generators/
│   └── perchance.js          # Perchance-compatible content generators
├── services/
│   ├── cardSource.js         # Card-source abstraction (Scryfall OR MTGJSON)
│   └── mtgjson.js            # MTGJSON offline provider
├── league/
│   ├── leagueState.js        # League season / standings model
│   ├── leagueActions.js      # Record match, advance season, reset
│   └── leagueRollover.js     # CLI script for nightly rollover (Actions)
└── prompt.md                 # Feature implementation menu

js/
└── main.js                   # Main UI controller

tests/
└── core.test.js              # Test suite (node:test)

tools/
├── fetch-mtgjson.js          # Fetch & cache MTGJSON bulk data
├── shops-generation.json     # Shop content data
└── villages-quests.json      # Village quest data

data/
└── league/                   # Static JSON persistence for league seasons

.github/
├── copilot-instructions.md   # ← you are here
├── prompts/                  # Reusable AI prompt library
├── workflows/
│   ├── ci.yml                # Lint + test on every PR/push
│   ├── static.yml            # GitHub Pages deploy (gated on CI)
│   ├── copilot-setup-steps.yml  # Copilot cloud agent preinstall
│   ├── league-rollover.yml   # Daily league standings update
│   └── release.yml           # Semantic release (future)
└── ISSUE_TEMPLATE/           # Bug report / feature request templates
```

---

## Design Patterns

| Pattern            | Where Used                                        |
| ------------------ | ------------------------------------------------- |
| Observer           | `gameState.js` → UI updates                       |
| Module / Singleton | `gameState`, `aiService`, `scryfallAPI` instances |
| Factory            | Generator system (encounters, quests, loot)       |
| Strategy           | AI providers (`src/ai/providers/`)                |
| Adapter            | `src/services/cardSource.js` (Scryfall ↔ MTGJSON) |

---

## Code Conventions

### JavaScript

- **ES6+**: always `const`/`let`, never `var`
- **Arrow functions** for callbacks; named functions for class methods
- **Template literals** for string interpolation
- **Async/await** for all async operations; wrap in `try/catch`
- **JSDoc** for all public methods/classes

### CSS

- Mobile-first; use CSS Grid + Flexbox
- CSS Custom Properties for theming; primary accent: `#ffd700`
- BEM-like class names: `card-container`, `boss-health-bar`
- WCAG 2.1 AA contrast ratios minimum

### HTML

- Semantic HTML5 elements (`<main>`, `<section>`, `<article>`)
- ARIA labels on all interactive elements
- Keyboard-navigable

---

## API Guidelines

### Scryfall

- Respect 10 req/s limit → always call `await this.rateLimit()` before requests
- Cache all responses in `this.cache` (Map)
- Endpoints: `/cards/search`, `/cards/named`, `/cards/random`
- Fall back gracefully when offline

### MTGJSON (offline cache)

- Bulk data is fetched nightly by `tools/fetch-mtgjson.js` → stored in `data/`
- `src/services/cardSource.js` selects Scryfall or MTGJSON based on availability

### LM Studio (local AI)

- Default endpoint: `http://localhost:1234/v1`
- Provider: `src/ai/providers/lmstudio.js`
- Falls back to built-in personality-driven generation if unavailable

---

## Testing Guidelines

```bash
npm test            # Run all tests
node --test tests/  # Same via Node directly
```

- All tests live in `tests/core.test.js`; use `node:test` + `node:assert`
- Mock external dependencies (never make live API calls in tests)
- Test both success and error/fallback paths
- Descriptive test names: `'Boss health reaches 0 when damage equals maxHealth'`

---

## Common Tasks

### Add a New Boss

Edit `src/core/gameState.js` → `initializeGameData()` → `gameData.bosses` array.
Each boss requires: `id`, `name`, `health`, `maxHealth`, `abilities[]`, `weaknesses[]`, `resistances[]`, `difficulty` (1–10), `location`.

See prompt: `.github/prompts/new-boss.prompt.md`

### Add a New Generator / Encounter

Edit `src/generators/perchance.js` → `initializeDefaultGenerators()`.
Follow nested-reference syntax: `'Retrieve the [magicalItem] from [location]'`.

See prompt: `.github/prompts/new-generator.prompt.md`

### Add a New Quest

Edit `src/generators/perchance.js` or the AI quest generator in `src/ai/aiService.js`.

See prompt: `.github/prompts/new-quest.prompt.md`

### Query Scryfall Cards

Use `src/api/scryfall.js` methods. Always rate-limit and cache.

See prompt: `.github/prompts/scryfall-query.prompt.md`

### Record a League Match

Use `src/league/leagueActions.js` → `recordMatch(player1, player2, winner)`.

---

## AI Personality System

| Personality    | Creativity | Danger | Description             |
| -------------- | ---------- | ------ | ----------------------- |
| `default`      | 70%        | 50%    | Balanced gameplay       |
| `cautious`     | 50%        | 30%    | Safe, predictable       |
| `experimental` | 90%        | 60%    | Creative, unpredictable |
| `reckless`     | 80%        | 90%    | High-risk, high-reward  |

Personality is pluggable. To use a local LLM (LM Studio), set provider in `src/ai/providers/lmstudio.js`.

---

## Git Workflow

- **Branch naming**: `feature/<description>`, `fix/<description>`, `chore/<description>`
- **Commit messages**: Conventional Commits — `feat(boss): add Nicol Bolas phase`
- **Pull requests**: fill out `.github/pull_request_template.md`
- **Pre-commit hook**: `lint-staged` runs ESLint + Prettier automatically
- **Commit-msg hook**: validates Conventional Commits format

---

## Security

- Never commit API keys or secrets
- Scryfall requires no authentication
- Sanitise all user-generated content before inserting into the DOM
- See `SECURITY.md` for vulnerability reporting

---

## Resources

- [Scryfall API Docs](https://scryfall.com/docs/api)
- [MTGJSON Docs](https://mtgjson.com/getting-started/)
- [Perchance Tutorial](https://perchance.org/tutorial)
- [MTG Comprehensive Rules](https://magic.wizards.com/en/rules)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [boardgame.io Docs](https://boardgame.io/) _(future multiplayer layer)_
- [LM Studio](https://lmstudio.ai/) _(local AI provider)_
