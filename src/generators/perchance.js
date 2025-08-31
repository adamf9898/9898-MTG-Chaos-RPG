/**
 * Perchance-compatible Generator System
 * Implements random generation for encounters, quests, loot, and story elements
 * Compatible with Perchance syntax and patterns
 */

class PerchanceGenerator {
    constructor() {
        this.generators = new Map();
        this.variables = new Map();
        this.history = [];
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
                "A massive [bossCreature] emerges from the shadows, its [bossAbility] threatening the very fabric of reality!",
                "The planeswalker [bossName] appears in a flash of [manaColor] energy, wielding [bossArtifact]!",
                "An ancient [bossType] awakens, commanding legions of [minionType] creatures!",
                "The corrupted [bossTitle] [bossName] challenges your party with [bossChallenge]!",
                "Reality warps as [bossName] the [bossTitle] manifests with [bossSpecialAbility]!"
            ]
        });

        // Boss Names
        this.addGenerator('bossName', {
            weight: 1,
            items: [
                "Vorthak", "Malachar", "Nethys", "Xandros", "Vaelthara",
                "Grimjaw", "Shadowmere", "Infernus", "Crystallia", "Voidheart",
                "Tempest", "Bloodmoon", "Nightfall", "Stormcaller", "Doomweaver"
            ]
        });

        // Boss Titles
        this.addGenerator('bossTitle', {
            weight: 1,
            items: [
                "the Destroyer", "the Corrupted", "the Ancient", "the Eternal",
                "the Void Walker", "the Soul Reaper", "the Plane Shatterer",
                "the Shadow Lord", "the Chaos Bringer", "the World Ender",
                "the Nightmare", "the Forgotten", "the Forbidden"
            ]
        });

        // Boss Creatures
        this.addGenerator('bossCreature', {
            weight: 1,
            items: [
                "Elder Dragon", "Cosmic Horror", "Primordial Titan", "Demon Lord",
                "Angel of Destruction", "Eldrazi Spawn", "Phoenix Eternal",
                "Hydra Ancient", "Leviathan", "Wurm Colossal", "Vampire Progenitor"
            ]
        });

        // Encounters
        this.addGenerator('randomEncounter', {
            weight: 1,
            items: [
                "You discover [encounterLocation] where [encounterEvent] awaits!",
                "A [encounterCreature] blocks your path, demanding [encounterDemand]!",
                "The party stumbles upon [encounterTreasure] guarded by [encounterGuardian]!",
                "Strange [encounterMagic] fills the air as [encounterNPC] approaches!",
                "A [encounterTrap] triggers, but reveals [encounterReward] beyond!"
            ]
        });

        // Locations
        this.addGenerator('encounterLocation', {
            weight: 1,
            items: [
                "an abandoned wizard's tower", "a crystalline cave", "floating ruins",
                "a portal nexus", "an ancient battlefield", "a magical oasis",
                "a haunted grove", "planar rifts", "a temporal anomaly",
                "an elemental shrine", "a forgotten library"
            ]
        });

        // Mana Colors
        this.addGenerator('manaColor', {
            weight: 1,
            items: [
                "white", "blue", "black", "red", "green",
                "colorless", "multicolored", "prismatic"
            ]
        });

        // Boss Abilities
        this.addGenerator('bossAbility', {
            weight: 1,
            items: [
                "Reality Rift", "Chaos Storm", "Void Manipulation", "Time Fracture",
                "Mana Drain", "Planar Summon", "Elemental Fury", "Soul Harvest",
                "Dimensional Tear", "Energy Overload", "Mind Control", "Death Aura",
                "Lightning Storm", "Fire Nova", "Ice Prison", "Earthquake",
                "Spell Reflection", "Magic Immunity", "Phase Shift", "Berserker Rage"
            ]
        });

        // Loot Generation
        this.addGenerator('treasure', {
            weight: 1,
            items: [
                "[treasureType] of [treasureQuality]",
                "Ancient [artifactType]",
                "[gemType] infused with [manaColor] mana",
                "Scroll of [spellType]",
                "[weaponType] forged by [creatorType]"
            ]
        });

        // Quests
        this.addGenerator('questObjective', {
            weight: 1,
            items: [
                "Retrieve the [questItem] from [questLocation]",
                "Defeat [questTarget] before [questTimeLimit]",
                "Protect [questNPC] during [questEvent]",
                "Collect [questQuantity] [questResource] for [questReason]",
                "Investigate [questMystery] in [questLocation]"
            ]
        });

        // Card Generation for Custom Content
        this.addGenerator('customCardName', {
            weight: 1,
            items: [
                "[cardAdjective] [cardNoun]",
                "[cardNoun] of [cardQuality]",
                "[cardVerb]ing [cardNoun]",
                "The [cardTitle] [cardNoun]"
            ]
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
            cardAdjective: ["Mystic", "Ancient", "Corrupted", "Divine", "Shadowy", "Burning", "Frozen", "Ethereal"],
            cardNoun: ["Blade", "Crystal", "Spirit", "Guardian", "Scholar", "Beast", "Phoenix", "Dragon"],
            cardQuality: ["Power", "Wisdom", "Destruction", "Creation", "the Void", "Light", "Darkness"],
            
            weatherEffect: ["mystical fog", "temporal storms", "mana rain", "void winds", "crystal snow"],
            
            npcPersonality: ["wise but cryptic", "aggressive and territorial", "friendly but cautious", "mysterious and aloof"],
            
            magicalEffect: ["reality bends", "time slows", "mana crystallizes", "spirits manifest", "elements dance"],
            
            dungeonHazard: ["shifting walls", "mana traps", "illusion chambers", "time loops", "elemental storms"],
            
            rewardType: ["rare artifact", "spell knowledge", "mana crystals", "planeswalker spark", "ancient wisdom"]
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
            ...generator
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

        let result = this.selectRandomItem(generator.items);
        
        // Process any nested generator references [generatorName]
        result = this.processNestedGenerators(result);
        
        // Store in history if requested
        if (options.recordHistory !== false) {
            this.history.push({
                generator: generatorName,
                result: result,
                timestamp: Date.now()
            });
        }

        return result;
    }

    /**
     * Process nested generator references in the format [generatorName]
     * @param {string} text - Text containing potential generator references
     */
    processNestedGenerators(text) {
        const generatorRegex = /\[([^\]]+)\]/g;
        let result = text;
        let match;
        let iterations = 0;
        const maxIterations = 10; // Prevent infinite loops

        while ((match = generatorRegex.exec(result)) !== null && iterations < maxIterations) {
            const generatorName = match[1];
            
            if (this.generators.has(generatorName)) {
                const replacement = this.generate(generatorName, { recordHistory: false });
                result = result.replace(match[0], replacement);
                generatorRegex.lastIndex = 0; // Reset regex for next iteration
            }
            
            iterations++;
        }

        return result;
    }

    /**
     * Select a random item from an array, supporting weighted selection
     * @param {Array} items - Array of items or weighted items
     */
    selectRandomItem(items) {
        if (!items || items.length === 0) {
            return "Empty generator";
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
            rewards: [
                this.generate('treasure'),
                this.generate('rewardType')
            ],
            special: Math.random() < 0.3 ? this.generate('magicalEffect') : null
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
            abilities: [
                this.generate('magicalEffect'),
                this.generate('dungeonHazard')
            ],
            weakness: this.generate('manaColor'),
            loot: [
                this.generate('treasure'),
                this.generate('rewardType'),
                this.generate('customCardName')
            ]
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
            rewards: [
                this.generate('treasure'),
                this.generate('rewardType')
            ]
        };

        return quest;
    }

    /**
     * Generate custom card ideas
     */
    generateCustomCard() {
        const card = {
            name: this.generate('customCardName'),
            type: this.selectRandomItem(['Creature', 'Instant', 'Sorcery', 'Artifact', 'Enchantment']),
            cost: Math.floor(Math.random() * 8) + 1,
            description: `${this.generate('magicalEffect')} and ${this.generate('rewardType')}`,
            flavor: this.generate('randomEncounter')
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
            variablesCount: this.variables.size
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