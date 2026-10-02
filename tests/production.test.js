import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import scryfallAPI from '../src/api/scryfall.js';
import aiService from '../src/ai/aiService.js';
import { PerchanceGenerator } from '../src/generators/perchance.js';
import { CardSource } from '../src/services/cardSource.js';
import mtgjsonProvider from '../src/services/mtgjson.js';

const getStringValues = (value) => {
    if (typeof value === 'string') {
        return [value];
    }
    if (Array.isArray(value)) {
        return value.flatMap(getStringValues);
    }
    if (value && typeof value === 'object') {
        return Object.values(value).flatMap(getStringValues);
    }
    return [];
};

describe('PerchanceGenerator production behavior', () => {
    test('resolves nested references without recording internal generations', () => {
        const generator = new PerchanceGenerator();
        generator.addGenerator('color', { items: ['red'] });
        generator.addGenerator('phrase', { items: ['A [color] spark and a [color] flame'] });

        assert.equal(generator.generate('phrase'), 'A red spark and a red flame');
        assert.deepEqual(
            generator.history.map(({ generator: name }) => name),
            ['phrase']
        );
    });

    test('preserves and diagnoses unknown references', () => {
        const generator = new PerchanceGenerator();
        generator.addGenerator('phrase', { items: ['Seek [unknownRelic]'] });

        assert.equal(generator.generate('phrase'), 'Seek [unknownRelic]');
        assert.deepEqual(generator.lastDiagnostics, [
            { type: 'missing-reference', path: ['phrase', 'unknownRelic'] },
        ]);
    });

    test('stops self-referential and mutually recursive generators', () => {
        const generator = new PerchanceGenerator();
        generator.addGenerator('self', { items: ['[self]'] });
        generator.addGenerator('first', { items: ['[second]'] });
        generator.addGenerator('second', { items: ['[first]'] });

        assert.equal(generator.generate('self'), '[self]');
        assert.equal(generator.lastDiagnostics[0].type, 'cycle-reference');
        assert.deepEqual(generator.lastDiagnostics[0].path, ['self', 'self']);

        assert.equal(generator.generate('first'), '[first]');
        assert.equal(generator.lastDiagnostics[0].type, 'cycle-reference');
        assert.deepEqual(generator.lastDiagnostics[0].path, ['first', 'second', 'first']);
    });

    test('bounds deeply nested references with a diagnostic', () => {
        const generator = new PerchanceGenerator();
        for (let index = 0; index <= 11; index += 1) {
            generator.addGenerator(`level${index}`, {
                items: [index === 11 ? 'bottom' : `[level${index + 1}]`],
            });
        }

        assert.equal(generator.generate('level0'), '[level11]');
        assert.equal(generator.lastDiagnostics.at(-1).type, 'depth-limit');
    });

    test('bounds total reference expansion', () => {
        const generator = new PerchanceGenerator();
        generator.addGenerator('leaf', { items: ['resolved'] });
        generator.addGenerator('many', { items: [Array(102).fill('[leaf]').join(' ')] });

        const result = generator.generate('many');

        assert.equal(result.split('resolved').length - 1, 100);
        assert.equal(result.split('[leaf]').length - 1, 2);
        assert.equal(generator.lastDiagnostics.at(-1).type, 'expansion-limit');
    });

    test('keeps empty generator and history behavior stable', () => {
        const generator = new PerchanceGenerator();
        generator.addGenerator('empty', { items: [] });

        assert.equal(generator.generate('empty'), 'Empty generator');
        assert.equal(generator.history.length, 1);
        assert.equal(generator.generate('empty', { recordHistory: false }), 'Empty generator');
        assert.equal(generator.history.length, 1);
        assert.equal(generator.processNestedGenerators(''), '');
    });

    test('every built-in template reference has a generator', () => {
        const generator = new PerchanceGenerator();
        const references = [...generator.generators.values()]
            .flatMap(({ items }) => items)
            .filter((item) => typeof item === 'string')
            .flatMap((item) => [...item.matchAll(/\[([^\]]+)\]/g)].map((match) => match[1]));

        assert.deepEqual(
            [...new Set(references.filter((name) => !generator.generators.has(name)))],
            []
        );
    });

    test('generates complete encounters and quests with resolved defaults', () => {
        const generator = new PerchanceGenerator();
        generator.selectRandomItem = (items) => items[0] ?? 'Empty generator';

        const encounter = generator.generateCompleteEncounter();
        const quest = generator.generateQuest();

        assert.match(encounter.title, /.+/);
        assert.match(encounter.location, /.+/);
        for (const value of getStringValues(encounter)) {
            assert.doesNotMatch(value, /\[[^\]]+\]/);
        }
        assert.match(quest.objective, /.+/);
        assert.match(quest.description, /.+/);
        for (const value of getStringValues(quest)) {
            assert.doesNotMatch(value, /\[[^\]]+\]/);
        }
    });
});

describe('CardSource production behavior', () => {
    test('normalizes Scryfall search results to an array', async (t) => {
        const card = { id: 'card-1', name: 'Test Dragon' };
        const source = new CardSource();
        source.setProvider('scryfall');
        t.mock.method(scryfallAPI, 'searchCards', async () => ({ data: [card] }));

        assert.deepEqual(await source.searchCards('t:dragon'), [card]);
    });

    test('uses the offline provider for search and random card batches', async (t) => {
        const source = new CardSource();
        source.setProvider('mtgjson');
        t.mock.method(mtgjsonProvider, 'searchCards', async () => [{ name: 'Offline Dragon' }]);
        const randomCards = [
            { name: 'Offline Dragon' },
            { name: 'Offline Dragon' },
            { name: 'Offline Wizard' },
            null,
        ];
        t.mock.method(mtgjsonProvider, 'getRandomCard', async () => randomCards.shift() ?? null);

        assert.deepEqual(await source.searchCards('dragon'), [{ name: 'Offline Dragon' }]);
        assert.deepEqual(await source.getRandomCards(3), [
            { name: 'Offline Dragon' },
            { name: 'Offline Wizard' },
        ]);
    });
});

test('AI service generates an encounter from production generators', (t) => {
    const previousPersonality = aiService.personality;
    t.after(() => aiService.setPersonality(previousPersonality));
    aiService.setPersonality('cautious');

    const encounter = aiService.generateAIEncounter();

    assert.equal(encounter.aiGenerated, true);
    assert.equal(encounter.personality, 'cautious');
    assert.ok(encounter.difficulty >= 1 && encounter.difficulty <= 5);
    assert.match(encounter.narrative, /.+/);
    for (const value of getStringValues(encounter)) {
        assert.doesNotMatch(value, /\[[^\]]+\]/);
    }
});
