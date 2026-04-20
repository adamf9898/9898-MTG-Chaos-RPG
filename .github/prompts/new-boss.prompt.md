# Prompt: Add a New Boss

Add a new Master Boss to the 9898-MTG Chaos RPG game.

## Context

- Bosses are defined in `src/core/gameState.js` → `initializeGameData()` → `gameData.bosses[]`
- The game has 8 Master Bosses; players must defeat all to win
- Each boss should feel unique and tie into MTG lore or chaos themes

## Boss Schema

```javascript
{
    id: 'kebab-case-unique-id',
    name: 'Display Name',
    health: 100,          // 80–200 range
    maxHealth: 100,       // same as health
    abilities: [          // 2–4 ability names (strings)
        'Ability One',
        'Ability Two',
    ],
    weaknesses: ['white', 'blue', 'black', 'red', 'green'],  // 1–2 MTG colors
    resistances: ['white', 'blue', 'black', 'red', 'green'], // 1–2 MTG colors
    difficulty: 7,        // 1–10 scale
    defeated: false,      // always false initially
    location: 'The Location Name',
}
```

## Instructions

1. Choose a thematic name tied to MTG lore (planeswalker, elder dragon, demon lord, etc.)
2. Pick a unique location in the MTG multiverse
3. Set `health` proportional to `difficulty` (difficulty 5 ≈ 100 HP, difficulty 10 ≈ 200 HP)
4. Abilities should reflect the boss's color identity and flavor
5. Weaknesses should be enemy colors (opposite on the color wheel)
6. Add a corresponding test case in `tests/core.test.js`

## Example Output

```javascript
{
    id: 'szarekh-silent-king',
    name: 'Szarekh the Silent King',
    health: 180,
    maxHealth: 180,
    abilities: ['Necrodermis Regeneration', 'Translocation', 'Gauss Obliterator', "C'tan Phase Weapon"],
    weaknesses: ['white', 'green'],
    resistances: ['black', 'blue'],
    difficulty: 9,
    defeated: false,
    location: 'The Tomb World',
}
```

## Checklist

- [ ] Boss added to `gameData.bosses` in `gameState.js`
- [ ] Unique `id` (kebab-case, no duplicates)
- [ ] Test added in `tests/core.test.js`
- [ ] `npm test` passes
