# Prompt: Add a New Generator or Encounter

Add a generator to the repository's JavaScript Perchance-style content system.
It supports list selection and `[generatorName]` references, not the full
Perchance.org language, plugins, or runtime.

## Context

- Generators live in `src/generators/perchance.js` → `initializeDefaultGenerators()`
- Use the `addGenerator(name, generator)` method
- Nested references use `[generatorName]` syntax
- Existing generators are registered in `initializeDefaultGenerators()` and
  `initializeExtendedGenerators()` in `src/generators/perchance.js`.

## Generator Schema

```javascript
this.addGenerator('myGenerator', {
    weight: 1,
    items: [
        'Simple string item',
        'Item with [nestedGenerator] reference',
        'Another [location] based item in [environment]',
    ],
});
```

## Instructions

1. Choose a descriptive generator name (camelCase)
2. Write 8–20 varied items for good randomness
3. Use nested `[generatorName]` references to existing generators for variety
4. Consider the MTG chaos-RPG theme: planar travel, magical mishaps, legendary creatures
5. Test the generator output with `perchanceGenerator.generate('myGenerator')`
6. Add production-module regression coverage under `tests/`
7. Ensure every new nested reference exists; missing references are preserved
   and reported in `lastDiagnostics`, while cycles/depth are bounded.
8. Run `npm run verify`

## Encounter Generator Instructions

For a complete encounter, update `generateCompleteEncounter()` in
`perchance.js` to use your new generator categories.

Encounter structure:

```javascript
{
    title: String,
    location: String,
    difficulty: Number (1–5),
    rewards: String[],
    special: String | null,
    environment: String | null,
}
```

## Example

```javascript
this.addGenerator('planarEvent', {
    weight: 1,
    items: [
        'A rift opens to [location], releasing [enemy]',
        'The [environment] warps reality — all spells cost 1 extra mana',
        'A [magicalItem] materialises, humming with [special] energy',
        'Planechase: roll the planar die or pay {1}',
        'Storm count doubles for this turn',
    ],
});
```

## Checklist

- [ ] Generator added to `initializeDefaultGenerators()` in `perchance.js`
- [ ] Unique generator name (no collision with existing names)
- [ ] At least 8 items
- [ ] Nested references use valid existing generator names
- [ ] Regression test added under `tests/`
- [ ] `npm run verify` passes
