# AGENTS.md — AI Agent Guide for 9898-MTG Chaos RPG

This file describes common agent workflows for AI coding assistants (GitHub Copilot, Claude, GPT-4, etc.) working on this repository.

For detailed Copilot instructions see `.github/copilot-instructions.md`.

---

## Environment Setup

```bash
# Always run these first
npm install --legacy-peer-deps
npm test       # verify baseline passes
npm run lint   # verify no existing lint errors
```

---

## Common Agent Flows

### 1. Add a New Boss

**Prompt file**: `.github/prompts/new-boss.prompt.md`

**Steps:**

1. Read `src/core/gameState.js` to understand the boss schema
2. Add the boss object to `gameData.bosses[]` in `initializeGameData()`
3. Add a test in `tests/core.test.js`
4. Run `npm test` to confirm passing

**Files to edit**: `src/core/gameState.js`, `tests/core.test.js`

---

### 2. Add a Generator / Encounter

**Prompt file**: `.github/prompts/new-generator.prompt.md`

**Steps:**

1. Read `src/generators/perchance.js` to understand existing generators
2. Add to `initializeDefaultGenerators()` using `this.addGenerator()`
3. Test with `perchanceGenerator.generate('yourGenerator')`
4. Add test in `tests/core.test.js`

**Files to edit**: `src/generators/perchance.js`, `tests/core.test.js`

---

### 3. Add a Quest

**Prompt file**: `.github/prompts/new-quest.prompt.md`

**Steps:**

1. For simple: add to `quest` generator in `perchance.js`
2. For AI-enhanced: extend `generateAIQuest()` in `aiService.js`
3. Test both paths

**Files to edit**: `src/generators/perchance.js` and/or `src/ai/aiService.js`

---

### 4. Scryfall Card Search

**Prompt file**: `.github/prompts/scryfall-query.prompt.md`

**Key rule**: Always use `src/services/cardSource.js`, not `scryfallAPI` directly.

```javascript
import cardSource from '../services/cardSource.js';
const cards = await cardSource.searchCards('t:dragon c:r');
```

---

### 5. Use Local AI (LM Studio)

**Provider**: `src/ai/providers/lmstudio.js`

```javascript
import { LMStudioProvider } from '../ai/providers/lmstudio.js';
const provider = new LMStudioProvider({ baseUrl: 'http://localhost:1234/v1' });
const text = await provider.generate('Write a chaos RPG encounter');
```

LM Studio must be running locally. Falls back to built-in generation if unavailable.

---

### 6. Record a League Match

**Prompt file**: `.github/prompts/league-match.prompt.md`

```javascript
import { leagueActions } from '../league/leagueActions.js';
await leagueActions.recordMatch({
    player1: 'Alice',
    player2: 'Bob',
    winner: 'Alice',
    format: 'chaos-rpg',
    turns: 10,
});
```

---

### 7. Fetch MTGJSON Bulk Data (offline cache)

```bash
node tools/fetch-mtgjson.js
```

This downloads the MTGJSON `AtomicCards.json` bulk file to `data/mtgjson/`. Run nightly or on-demand. The `cardSource` service automatically uses it when Scryfall is offline.

---

## Testing Rules for Agents

- Never make live network requests in tests — mock all APIs
- Run `npm test` before and after every change
- Run `npm run lint` before submitting
- All new features need at least one test

## Commit Format (Conventional Commits)

```
feat(boss): add Ulamog the Infinite Gyre boss
fix(generator): fix nested reference resolution for planar events
docs(prompts): add new-encounter prompt
chore(deps): update eslint to 9.x
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

## File Map Quick Reference

| Task                  | Primary File                  |
| --------------------- | ----------------------------- |
| Add boss              | `src/core/gameState.js`       |
| Add generator         | `src/generators/perchance.js` |
| Add AI quest          | `src/ai/aiService.js`         |
| Add AI provider       | `src/ai/providers/`           |
| Card data (online)    | `src/api/scryfall.js`         |
| Card data (offline)   | `src/services/mtgjson.js`     |
| Card source (unified) | `src/services/cardSource.js`  |
| League                | `src/league/`                 |
| UI controller         | `js/main.js`                  |
| Tests                 | `tests/core.test.js`          |
| Data tools            | `tools/`                      |
