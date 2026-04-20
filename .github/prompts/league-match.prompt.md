# Prompt: Record a League Match or Update Season

Interact with the 9898-MTG-League persistent layer.

## Context

- League data lives in `src/league/` and is persisted to `data/league/`
- The nightly rollover action (`.github/workflows/league-rollover.yml`) commits updated standings JSON
- Seasons advance automatically or can be triggered manually

## Available Actions

```javascript
import { leagueActions } from '../league/leagueActions.js';

// Record a match result
await leagueActions.recordMatch({
    player1: 'PlayerName1',
    player2: 'PlayerName2',
    winner: 'PlayerName1', // or null for draw
    format: 'chaos-rpg',
    turns: 12,
    notes: 'Optional notes',
});

// Get current standings
const standings = await leagueActions.getStandings();

// Advance to next season
await leagueActions.advanceSeason();
```

## League Data Schema

### Season (`data/league/season-N.json`)

```json
{
    "season": 1,
    "startDate": "2024-01-01",
    "endDate": null,
    "active": true,
    "matches": [],
    "standings": []
}
```

### Match Entry

```json
{
    "id": "match-<timestamp>",
    "date": "ISO 8601 date",
    "player1": "PlayerName",
    "player2": "PlayerName",
    "winner": "PlayerName",
    "format": "chaos-rpg",
    "turns": 12
}
```

### Standing Entry

```json
{
    "player": "PlayerName",
    "wins": 5,
    "losses": 2,
    "draws": 1,
    "points": 16,
    "winRate": 0.625
}
```

## Instructions

1. Always record matches through `leagueActions` (never mutate JSON directly)
2. Player names must match exactly (case-sensitive)
3. Standings are recalculated after every `recordMatch` call
4. The nightly rollover commits updated JSON — do not manually edit `data/league/`

## Checklist

- [ ] Match recorded via `leagueActions.recordMatch()`
- [ ] Player names correct (check existing standings)
- [ ] `npm test` passes
