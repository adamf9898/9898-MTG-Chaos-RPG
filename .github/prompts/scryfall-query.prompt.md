# Prompt: Scryfall Card Query

Search for and use MTG card data via the Scryfall API integration.

## Context

- The Scryfall API client is at `src/api/scryfall.js`
- Always rate-limit requests and use the cache
- `src/services/cardSource.js` provides a unified interface (Scryfall or MTGJSON offline)

## Recommended Interface

```javascript
import cardSource from '../services/cardSource.js';

// Automatically uses Scryfall if online, MTGJSON if offline
const cards = await cardSource.searchCards('t:dragon c:r');
const card = await cardSource.getCardByName('Lightning Bolt');
const random = await cardSource.getRandomCard();
```

## Direct Scryfall (when needed)

```javascript
import scryfallAPI from '../api/scryfall.js';

const cards = await scryfallAPI.searchCards('t:dragon c:r');
const card = await scryfallAPI.getCardByName('Lightning Bolt');
const random = await scryfallAPI.getRandomCard('t:instant');
```

## Scryfall Search Syntax

| Syntax     | Description    | Example               |
| ---------- | -------------- | --------------------- |
| `t:type`   | Card type      | `t:creature t:dragon` |
| `c:color`  | Color identity | `c:r`, `c:wu`         |
| `cmc<=N`   | Mana value     | `cmc<=3`              |
| `f:format` | Format legal   | `f:commander`         |
| `o:text`   | Oracle text    | `o:"draw a card"`     |
| `pow>=N`   | Power          | `pow>=4`              |
| `r:rarity` | Rarity         | `r:mythic`            |
| `set:XXX`  | Set code       | `set:dom`             |

## Rules

1. Always use `await` and wrap in `try/catch`
2. Prefer `cardSource` over raw `scryfallAPI` for resilience
3. Never make live API calls in tests — use mocks
4. Respect the 100ms rate limit built into the client

## Example: Fetch Boss-Themed Cards

```javascript
import cardSource from '../services/cardSource.js';

async function getBossCards(boss) {
    try {
        const colorQuery = boss.weaknesses.map((c) => `c:${c[0]}`).join(' or ');
        const cards = await cardSource.searchCards(
            `(${colorQuery}) t:creature r:rare order:edhrec`
        );
        return cards.slice(0, 5);
    } catch (error) {
        console.error('Card fetch failed, using fallback:', error);
        return [];
    }
}
```

## Checklist

- [ ] Using `cardSource` (not raw `scryfallAPI`) for resilience
- [ ] `await` + `try/catch` on all async calls
- [ ] No live API calls in tests (use mocks)
- [ ] Query uses valid Scryfall syntax
