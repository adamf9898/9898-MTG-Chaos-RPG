# Prompt: Scryfall Card Query

Search for and use MTG card data through the app's card-source adapter.

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

1. Use `cardSource` outside the adapter implementation and its focused tests.
2. Search results are arrays; do not expect a Scryfall `{ data }` wrapper.
3. Never make live API calls in tests; mock the provider methods or `fetch`.
4. Let the Scryfall client enforce its rate limit and cache.
5. Render external card fields as text, not interpolated HTML.

## Example: Fetch Boss-Themed Cards

```javascript
import cardSource from '../services/cardSource.js';

const COLOR_CODES = { white: 'w', blue: 'u', black: 'b', red: 'r', green: 'g' };

async function getBossCards(colors = []) {
    try {
        const codes = [
            ...new Set(colors.map((color) => COLOR_CODES[color.toLowerCase()]).filter(Boolean)),
        ];
        const colorQuery = codes.length
            ? `(${codes.map((code) => `c:${code}`).join(' OR ')}) `
            : '';
        const cards = await cardSource.searchCards(`${colorQuery}t:creature r:rare order:edhrec`);
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
- [ ] Query uses valid Scryfall syntax and results are treated as arrays
