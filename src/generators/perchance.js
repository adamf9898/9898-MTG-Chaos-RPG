/**
 * Lightweight Perchance-style generator for encounter, quest, loot, and story text.
 * Supports this repository's [generatorName] references, not the full Perchance runtime.
 */

const MAX_NESTED_GENERATOR_DEPTH = 10;
const MAX_GENERATOR_EXPANSIONS = 100;

export class PerchanceGenerator {
    constructor() {
        this.generators = new Map();
        this.variables = new Map();
        this.history = [];
        this.lastDiagnostics = [];
        this.initializeDefaultGenerators();
    }

    /**
     * Initialize default generators for the MTG Chaos RPG
     */
    initializeDefaultGenerators() {
        // Boss Encounters
        this.addGenerator('bossEncounter', {
            weight: 1,
            items: [
                'A massive [bossCreature] emerges from the shadows, its [bossAbility] threatening the very fabric of reality!',
                'The planeswalker [bossName] appears in a flash of [manaColor] energy, wielding [bossArtifact]!',
                'An ancient [bossType] awakens, commanding legions of [minionType] creatures!',
                'The corrupted [bossTitle] [bossName] challenges your party with [bossChallenge]!',
                'Reality warps as [bossName] the [bossTitle] manifests with [bossSpecialAbility]!',
            ],
        });

        // Boss Names
        this.addGenerator('bossName', {
            weight: 1,
            items: [
                'Vorthak',
                'Malachar',
                'Nethys',
                'Xandros',
                'Vaelthara',
                'Grimjaw',
                'Shadowmere',
                'Infernus',
                'Crystallia',
                'Voidheart',
                'Tempest',
                'Bloodmoon',
                'Nightfall',
                'Stormcaller',
                'Doomweaver',
            ],
        });

        // Boss Titles
        this.addGenerator('bossTitle', {
            weight: 1,
            items: [
                'the Destroyer',
                'the Corrupted',
                'the Ancient',
                'the Eternal',
                'the Void Walker',
                'the Soul Reaper',
                'the Plane Shatterer',
                'the Shadow Lord',
                'the Chaos Bringer',
                'the World Ender',
                'the Nightmare',
                'the Forgotten',
                'the Forbidden',
            ],
        });

        // Boss Creatures
        this.addGenerator('bossCreature', {
            weight: 1,
            items: [
                'Elder Dragon',
                'Cosmic Horror',
                'Primordial Titan',
                'Demon Lord',
                'Angel of Destruction',
                'Eldrazi Spawn',
                'Phoenix Eternal',
                'Hydra Ancient',
                'Leviathan',
                'Wurm Colossal',
                'Vampire Progenitor',
            ],
        });

        // Encounters
        this.addGenerator('randomEncounter', {
            weight: 1,
            items: [
                'You discover [encounterLocation] where [encounterEvent] awaits!',
                'A [encounterCreature] blocks your path, demanding [encounterDemand]!',
                'The party stumbles upon [encounterTreasure] guarded by [encounterGuardian]!',
                'Strange [encounterMagic] fills the air as [encounterNPC] approaches!',
                'A [encounterTrap] triggers, but reveals [encounterReward] beyond!',
            ],
        });

        // Locations
        this.addGenerator('encounterLocation', {
            weight: 1,
            items: [
                "an abandoned wizard's tower",
                'a crystalline cave',
                'floating ruins',
                'a portal nexus',
                'an ancient battlefield',
                'a magical oasis',
                'a haunted grove',
                'planar rifts',
                'a temporal anomaly',
                'an elemental shrine',
                'a forgotten library',
            ],
        });

        // Mana Colors
        this.addGenerator('manaColor', {
            weight: 1,
            items: [
                'white',
                'blue',
                'black',
                'red',
                'green',
                'colorless',
                'multicolored',
                'prismatic',
            ],
        });

        // Boss Abilities
        this.addGenerator('bossAbility', {
            weight: 1,
            items: [
                'Reality Rift',
                'Chaos Storm',
                'Void Manipulation',
                'Time Fracture',
                'Mana Drain',
                'Planar Summon',
                'Elemental Fury',
                'Soul Harvest',
                'Dimensional Tear',
                'Energy Overload',
                'Mind Control',
                'Death Aura',
                'Lightning Storm',
                'Fire Nova',
                'Ice Prison',
                'Earthquake',
                'Spell Reflection',
                'Magic Immunity',
                'Phase Shift',
                'Berserker Rage',
            ],
        });

        // Loot Generation
        this.addGenerator('treasure', {
            weight: 1,
            items: [
                '[treasureType] of [treasureQuality]',
                'Ancient [artifactType]',
                '[gemType] infused with [manaColor] mana',
                'Scroll of [spellType]',
                '[weaponType] forged by [creatorType]',
            ],
        });

        // Quests
        this.addGenerator('questObjective', {
            weight: 1,
            items: [
                'Retrieve the [questItem] from [questLocation]',
                'Defeat [questTarget] before [questTimeLimit]',
                'Protect [questNPC] during [questEvent]',
                'Collect [questQuantity] [questResource] for [questReason]',
                'Investigate [questMystery] in [questLocation]',
            ],
        });

        // Card Generation for Custom Content
        this.addGenerator('customCardName', {
            weight: 1,
            items: [
                '[cardAdjective] [cardNoun]',
                '[cardNoun] of [cardQuality]',
                '[cardVerb]ing [cardNoun]',
                'The [cardTitle] [cardNoun]',
            ],
        });

        // Add many more generators for comprehensive content...
        this.initializeExtendedGenerators();
    }

    /**
     * Initialize extended generators for more variety
     */
    initializeExtendedGenerators() {
        // Extended content generators
        const generators = {
            cardAdjective: [
                'Mystic',
                'Ancient',
                'Corrupted',
                'Divine',
                'Shadowy',
                'Burning',
                'Frozen',
                'Ethereal',
            ],
            cardNoun: [
                'Blade',
                'Crystal',
                'Spirit',
                'Guardian',
                'Scholar',
                'Beast',
                'Phoenix',
                'Dragon',
            ],
            cardQuality: [
                'Power',
                'Wisdom',
                'Destruction',
                'Creation',
                'the Void',
                'Light',
                'Darkness',
            ],

            weatherEffect: [
                'mystical fog',
                'temporal storms',
                'mana rain',
                'void winds',
                'crystal snow',
            ],

            npcPersonality: [
                'wise but cryptic',
                'aggressive and territorial',
                'friendly but cautious',
                'mysterious and aloof',
            ],

            magicalEffect: [
                'reality bends',
                'time slows',
                'mana crystallizes',
                'spirits manifest',
                'elements dance',
            ],

            dungeonHazard: [
                'shifting walls',
                'mana traps',
                'illusion chambers',
                'time loops',
                'elemental storms',
            ],

            rewardType: [
                'rare artifact',
                'spell knowledge',
                'mana crystals',
                'planeswalker spark',
                'ancient wisdom',
            ],
            bossArtifact: [
                'the Worldheart Engine',
                'a blade forged from a fallen star',
                'the Obsidian Codex',
                'a crown of fractured mana',
            ],
            bossType: ['dragon', 'demon', 'elemental', 'Eldrazi horror'],
            minionType: ['goblin raiders', 'spectral warriors', 'corrupted beasts'],
            bossChallenge: [
                'a trial of strength',
                'a battle across shifting planes',
                'a test of the party’s resolve',
            ],
            bossSpecialAbility: [
                'an aura that unravels magic',
                'the power to fracture time',
                'a storm of living shadows',
            ],
            encounterEvent: [
                'a planar rift tears open',
                'a desperate caravan seeks help',
                'an ancient spell awakens',
            ],
            encounterCreature: ['chaos-twisted hydra', 'wandering wurm', 'phantom knight'],
            encounterDemand: ['a rare spell', 'a promise of safe passage', 'a worthy duel'],
            encounterTreasure: ['a sealed vault', 'a cache of mana crystals', 'a lost relic'],
            encounterGuardian: ['a stone colossus', 'a sphinx', 'a pair of rival mages'],
            encounterMagic: ['unstable mana', 'an illusion', 'a strange enchantment'],
            encounterNPC: ['a masked planeswalker', 'a stranded scholar', 'a wary merchant'],
            encounterTrap: ['a rune-charged snare', 'a shifting floor', 'a false portal'],
            encounterReward: ['a hidden sanctuary', 'an enchanted cache', 'a forgotten map'],
            treasureType: ['cache', 'chest', 'reliquary'],
            treasureQuality: ['uncommon', 'rare', 'legendary'],
            artifactType: ['compass', 'signet', 'planar lens'],
            gemType: ['opal', 'sapphire', 'emberstone'],
            spellType: ['the Unbinding', 'the Final Spark', 'Forgotten Paths'],
            weaponType: ['sword', 'spear', 'warhammer'],
            creatorType: ['a dwarven forge', 'the Izzet League', 'a planeswalker artificer'],
            questItem: ['the Ember Shard', 'a sealed scroll', 'the lost signet'],
            questLocation: ['the Sunken Archive', 'a shifting labyrinth', 'the Ashen Wilds'],
            questTarget: ['the rogue mage', 'a rampaging elemental', 'the thief in the mist'],
            questTimeLimit: ['the next moonrise', 'three days', 'the storm’s arrival'],
            questNPC: ['the village healer', 'an exiled knight', 'a stranded merchant'],
            questEvent: ['a dangerous crossing', 'the night watch', 'a siege'],
            questQuantity: ['three', 'seven', 'a dozen'],
            questResource: ['mana crystals', 'healing herbs', 'lost spell pages'],
            questReason: ['the village’s protection', 'an ancient pact', 'a cure'],
            questMystery: ['the vanishing stars', 'a string of strange dreams', 'the silent bells'],
            cardVerb: ['banish', 'shatter', 'awaken', 'bind'],
            cardTitle: ['Dread', 'Forgotten', 'Eternal', 'Wandering'],
        };

        Object.entries(generators).forEach(([name, items]) => {
            this.addGenerator(name, { weight: 1, items });
        });
    }

    /**
     * Add a new generator or update existing one
     * @param {string} name - Generator name
     * @param {Object} generator - Generator object with weight and items
     */
    addGenerator(name, generator) {
        this.generators.set(name, {
            weight: generator.weight || 1,
            items: generator.items || [],
            ...generator,
        });
    }

    /**
     * Generate content from a specific generator
     * @param {string} generatorName - Name of the generator to use
     * @param {Object} options - Generation options
     */
    generate(generatorName, options = {}) {
        const generator = this.generators.get(generatorName);

        if (!generator) {
            throw new Error(`Generator '${generatorName}' not found`);
        }

        this.lastDiagnostics = [];
        const result = this.expandNestedGenerators(
            this.selectRandomItem(generator.items),
            [generatorName],
            0,
            { expansions: 0, limitReported: false }
        );

        // Store in history if requested
        if (options.recordHistory !== false) {
            this.history.push({
                generator: generatorName,
                result: result,
                timestamp: Date.now(),
            });
        }

        return result;
    }

    /**
     * Process nested generator references in the format [generatorName].
     * Missing and cyclic references are preserved and reported in lastDiagnostics.
     * @param {string} text - Text containing potential generator references
     */
    processNestedGenerators(text) {
        this.lastDiagnostics = [];
        return this.expandNestedGenerators(text, [], 0, { expansions: 0, limitReported: false });
    }

    expandNestedGenerators(text, ancestry, depth, context) {
        return String(text).replace(/\[([^\]]+)\]/g, (reference, generatorName) => {
            context.expansions += 1;
            if (context.expansions > MAX_GENERATOR_EXPANSIONS) {
                if (!context.limitReported) {
                    this.lastDiagnostics.push({ type: 'expansion-limit', path: ancestry });
                    context.limitReported = true;
                }
                return reference;
            }

            const path = [...ancestry, generatorName];
            if (!this.generators.has(generatorName)) {
                this.lastDiagnostics.push({ type: 'missing-reference', path });
                return reference;
            }

            if (ancestry.includes(generatorName)) {
                this.lastDiagnostics.push({ type: 'cycle-reference', path });
                return reference;
            }

            if (depth >= MAX_NESTED_GENERATOR_DEPTH) {
                this.lastDiagnostics.push({ type: 'depth-limit', path });
                return reference;
            }

            const generator = this.generators.get(generatorName);
            const replacement = this.selectRandomItem(generator.items);
            return this.expandNestedGenerators(replacement, path, depth + 1, context);
        });
    }

    /**
     * Select a random item from an array, supporting weighted selection
     * @param {Array} items - Array of items or weighted items
     */
    selectRandomItem(items) {
        if (!items || items.length === 0) {
            return 'Empty generator';
        }

        // Simple random selection for now
        // Could be enhanced with weighted selection later
        const randomIndex = Math.floor(Math.random() * items.length);
        return items[randomIndex];
    }

    /**
     * Generate a complete encounter with multiple elements
     */
    generateCompleteEncounter() {
        const encounter = {
            title: this.generate('randomEncounter'),
            location: this.generate('encounterLocation'),
            weather: this.generate('weatherEffect'),
            difficulty: Math.floor(Math.random() * 5) + 1,
            rewards: [this.generate('treasure'), this.generate('rewardType')],
            special: Math.random() < 0.3 ? this.generate('magicalEffect') : null,
        };

        return encounter;
    }

    /**
     * Generate a boss encounter with full details
     */
    generateBossEncounter() {
        const boss = {
            name: this.generate('bossName'),
            title: this.generate('bossTitle'),
            description: this.generate('bossEncounter'),
            health: Math.floor(Math.random() * 50) + 100,
            abilities: [this.generate('magicalEffect'), this.generate('dungeonHazard')],
            weakness: this.generate('manaColor'),
            loot: [
                this.generate('treasure'),
                this.generate('rewardType'),
                this.generate('customCardName'),
            ],
        };

        return boss;
    }

    /**
     * Generate a quest with objectives and rewards
     */
    generateQuest() {
        const quest = {
            title: `The ${this.generate('cardQuality')} Quest`,
            objective: this.generate('questObjective'),
            description: this.generate('randomEncounter'),
            difficulty: Math.floor(Math.random() * 5) + 1,
            timeLimit: Math.random() < 0.4 ? Math.floor(Math.random() * 10) + 5 : null,
            rewards: [this.generate('treasure'), this.generate('rewardType')],
        };

        return quest;
    }

    /**
     * Generate custom card ideas
     */
    generateCustomCard() {
        const card = {
            name: this.generate('customCardName'),
            type: this.selectRandomItem([
                'Creature',
                'Instant',
                'Sorcery',
                'Artifact',
                'Enchantment',
            ]),
            cost: Math.floor(Math.random() * 8) + 1,
            description: `${this.generate('magicalEffect')} and ${this.generate('rewardType')}`,
            flavor: this.generate('randomEncounter'),
        };

        if (card.type === 'Creature') {
            card.power = Math.floor(Math.random() * 8) + 1;
            card.toughness = Math.floor(Math.random() * 8) + 1;
        }

        return card;
    }

    /**
     * Get generator statistics
     */
    getStats() {
        return {
            totalGenerators: this.generators.size,
            generatorNames: Array.from(this.generators.keys()),
            historyLength: this.history.length,
            variablesCount: this.variables.size,
        };
    }

    /**
     * Clear generation history
     */
    clearHistory() {
        this.history = [];
    }

    /**
     * Export generator definitions for sharing
     */
    exportGenerators() {
        const exported = {};
        this.generators.forEach((generator, name) => {
            exported[name] = generator;
        });
        return exported;
    }

    /**
     * Import generator definitions
     * @param {Object} generators - Generator definitions to import
     */
    importGenerators(generators) {
        Object.entries(generators).forEach(([name, generator]) => {
            this.addGenerator(name, generator);
        });
    }
}

// Create and export a singleton instance
const perchanceGenerator = new PerchanceGenerator();
export default perchanceGenerator;
