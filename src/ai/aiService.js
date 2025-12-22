/**
 * AI Service for MTG Chaos RPG
 * Provides AI-driven encounters, storytelling, and dynamic content generation
 * Can work with local simulation or external AI APIs
 */

import perchanceGenerator from '../generators/perchance.js';

class AIService {
    constructor() {
        this.personality = 'default';
        this.conversationHistory = [];
        this.storyContext = {
            currentArc: null,
            majorEvents: [],
            npcRelationships: new Map()
        };
        
        // AI personalities affect content generation style
        this.personalities = {
            default: {
                creativity: 0.7,
                danger: 0.5,
                humor: 0.3,
                description: 'Balanced gameplay with moderate challenge'
            },
            cautious: {
                creativity: 0.5,
                danger: 0.3,
                humor: 0.2,
                description: 'Safe, predictable encounters with lower difficulty'
            },
            experimental: {
                creativity: 0.9,
                danger: 0.6,
                humor: 0.5,
                description: 'Creative, unpredictable scenarios with unique twists'
            },
            reckless: {
                creativity: 0.8,
                danger: 0.9,
                humor: 0.4,
                description: 'High-risk, high-reward encounters with intense challenges'
            }
        };
    }

    /**
     * Set AI personality affecting content generation
     * @param {string} personality - Personality type
     */
    setPersonality(personality) {
        if (this.personalities[personality]) {
            this.personality = personality;
            console.log(`AI Personality set to: ${personality}`);
        } else {
            console.warn(`Unknown personality: ${personality}, using default`);
            this.personality = 'default';
        }
    }

    /**
     * Get current personality configuration
     */
    getPersonality() {
        return this.personalities[this.personality];
    }

    /**
     * Generate AI-enhanced encounter with dynamic storytelling
     * @param {Object} options - Encounter generation options
     */
    generateAIEncounter(options = {}) {
        const personality = this.getPersonality();
        const baseEncounter = perchanceGenerator.generateCompleteEncounter();
        
        // Enhance encounter with AI-driven elements
        const aiEnhancedEncounter = {
            ...baseEncounter,
            aiGenerated: true,
            personality: this.personality,
            
            // Add dynamic story elements
            narrative: this.generateNarrative(baseEncounter, personality),
            
            // Add consequences based on personality
            consequences: this.generateConsequences(personality),
            
            // Add dynamic difficulty scaling
            difficulty: this.scaleDifficulty(baseEncounter.difficulty, personality),
            
            // Add unique mechanics
            specialMechanics: this.generateSpecialMechanics(personality),
            
            // Add environmental effects
            environment: this.generateEnvironment(baseEncounter, personality)
        };
        
        // Record in story context
        this.recordStoryEvent(aiEnhancedEncounter);
        
        return aiEnhancedEncounter;
    }

    /**
     * Generate narrative text for encounter
     */
    generateNarrative(baseEncounter, personality) {
        const narrativeTemplates = {
            high_creativity: [
                `As you venture into ${baseEncounter.location}, the air shimmers with ${baseEncounter.weather}. Strange symbols appear on the ground, pulsing with otherworldly energy. What appears to be a simple encounter may be far more than it seems...`,
                `The fabric of reality seems thin here at ${baseEncounter.location}. ${baseEncounter.weather} swirls around you in impossible patterns. You sense that your actions here will echo across multiple planes of existence.`,
                `Ancient texts spoke of ${baseEncounter.location}, but nothing could prepare you for this. The ${baseEncounter.weather} carries whispers of forgotten magic, and you realize you've stepped into something extraordinary.`
            ],
            medium_creativity: [
                `You arrive at ${baseEncounter.location} where ${baseEncounter.weather} makes visibility challenging. Your instincts tell you this encounter will test your skills.`,
                `${baseEncounter.location} stretches before you, shrouded in ${baseEncounter.weather}. The atmosphere is tense, suggesting imminent conflict.`,
                `As you approach ${baseEncounter.location}, the ${baseEncounter.weather} intensifies. Something significant awaits you here.`
            ],
            low_creativity: [
                `You reach ${baseEncounter.location}. The weather is ${baseEncounter.weather}.`,
                `${baseEncounter.location} appears ahead. Conditions: ${baseEncounter.weather}.`,
                `Location: ${baseEncounter.location}. Current weather: ${baseEncounter.weather}.`
            ]
        };
        
        const creativityLevel = personality.creativity > 0.7 ? 'high_creativity' : 
                               personality.creativity > 0.4 ? 'medium_creativity' : 
                               'low_creativity';
        
        const templates = narrativeTemplates[creativityLevel];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    /**
     * Generate consequences for player choices
     */
    generateConsequences(personality) {
        const consequences = [];
        
        // More dangerous personalities have more severe consequences
        if (personality.danger > 0.7) {
            consequences.push({
                type: 'danger',
                description: 'Failure may result in permanent character changes',
                severity: 'high'
            });
        }
        
        if (personality.creativity > 0.8) {
            consequences.push({
                type: 'narrative',
                description: 'Your choices here will affect future story arcs',
                severity: 'medium'
            });
        }
        
        return consequences;
    }

    /**
     * Scale difficulty based on personality and game state
     */
    scaleDifficulty(baseDifficulty, personality) {
        let scaled = baseDifficulty;
        
        // Adjust for personality
        if (personality.danger > 0.7) {
            scaled += 1;
        } else if (personality.danger < 0.4) {
            scaled -= 1;
        }
        
        // Ensure within bounds
        return Math.max(1, Math.min(5, scaled));
    }

    /**
     * Generate special mechanics for encounter
     */
    generateSpecialMechanics(personality) {
        const mechanics = [];
        
        if (personality.creativity > 0.7) {
            const specialMechanics = [
                { name: 'Time Distortion', effect: 'Turn order reverses randomly', trigger: 'combat' },
                { name: 'Mana Cascade', effect: 'Spells cost 1 less but have random effects', trigger: 'spell_cast' },
                { name: 'Reality Shift', effect: 'Creatures swap controller each turn', trigger: 'turn_start' },
                { name: 'Chaos Multiplication', effect: 'All numerical values doubled', trigger: 'always' },
                { name: 'Planar Resonance', effect: 'Cards in graveyard can be cast', trigger: 'main_phase' }
            ];
            
            mechanics.push(specialMechanics[Math.floor(Math.random() * specialMechanics.length)]);
        }
        
        if (personality.danger > 0.8) {
            mechanics.push({
                name: 'High Stakes',
                effect: 'Winning grants double rewards, losing has severe consequences',
                trigger: 'always'
            });
        }
        
        return mechanics;
    }

    /**
     * Generate environmental effects
     */
    generateEnvironment(baseEncounter, personality) {
        const environments = [
            { 
                name: 'Unstable Mana Field',
                effect: 'All players draw an extra card each turn',
                visual: 'Shimmering magical auras'
            },
            {
                name: 'Temporal Anomaly',
                effect: 'Players may take two actions per turn',
                visual: 'Time appears to move in slow motion'
            },
            {
                name: 'Chaos Vortex',
                effect: 'Random card effects trigger spontaneously',
                visual: 'Swirling multicolored energy'
            },
            {
                name: 'Planar Convergence',
                effect: 'All colors of mana available',
                visual: 'Multiple planes visible in the sky'
            }
        ];
        
        // Higher creativity = more likely to have special environment
        if (Math.random() < personality.creativity) {
            return environments[Math.floor(Math.random() * environments.length)];
        }
        
        return null;
    }

    /**
     * Generate AI-driven NPC dialogue
     * @param {Object} npc - NPC data
     * @param {Object} context - Current game context
     */
    generateNPCDialogue(npc, context = {}) {
        const personality = this.getPersonality();
        
        const dialogueStyles = {
            high_humor: [
                `"${npc.name} here! You look like you've seen a ghost. Or maybe a zombie. Hard to tell in this light."`,
                `"Well, well, well... if it isn't the legendary ${context.playerName || 'adventurer'}. I've heard stories, mostly involving poor life choices."`,
                `"I'd offer you a quest, but last time someone accepted, they came back as a newt. They got better, eventually."`
            ],
            medium_humor: [
                `"Greetings, ${context.playerName || 'traveler'}. I may have something of interest for you."`,
                `"Ah, ${npc.name} at your service. Care to hear what I've learned?"`,
                `"You've arrived at an opportune moment. I could use someone with your... particular talents."`
            ],
            low_humor: [
                `"I am ${npc.name}. I have information."`,
                `"${context.playerName || 'Adventurer'}, approach."`,
                `"There is work to be done."`
            ]
        };
        
        const humorLevel = personality.humor > 0.4 ? 'high_humor' :
                          personality.humor > 0.2 ? 'medium_humor' :
                          'low_humor';
        
        const dialogues = dialogueStyles[humorLevel];
        return dialogues[Math.floor(Math.random() * dialogues.length)];
    }

    /**
     * Generate a quest with AI-driven narrative
     */
    generateAIQuest(difficulty = 3) {
        const personality = this.getPersonality();
        const baseQuest = perchanceGenerator.generateQuest();
        
        return {
            ...baseQuest,
            aiEnhanced: true,
            narrative: this.generateQuestNarrative(baseQuest, personality),
            dynamicObjectives: this.generateDynamicObjectives(baseQuest, personality),
            moralChoice: personality.creativity > 0.6 ? this.generateMoralChoice() : null,
            questGiver: this.generateQuestGiver(personality)
        };
    }

    /**
     * Generate narrative for quest
     */
    generateQuestNarrative(baseQuest, personality) {
        const narratives = [
            `A mysterious figure approaches you with urgent news. ${baseQuest.objective} The fate of countless lives may hang in the balance.`,
            `Ancient prophecies speak of this moment. ${baseQuest.objective} Only you can prevent the coming catastrophe.`,
            `Time is running short. ${baseQuest.objective} The longer you wait, the more dire the consequences.`,
            `You discover a hidden message carved in stone: "${baseQuest.objective}" The meaning becomes clear - you must act.`
        ];
        
        return narratives[Math.floor(Math.random() * narratives.length)];
    }

    /**
     * Generate dynamic objectives that adapt to player actions
     */
    generateDynamicObjectives(baseQuest, personality) {
        const objectives = [{
            description: baseQuest.objective,
            completed: false,
            primary: true
        }];
        
        // Add bonus objectives for creative personalities
        if (personality.creativity > 0.6) {
            objectives.push({
                description: 'Complete the quest without losing any creatures',
                completed: false,
                primary: false,
                bonus: 'Extra rare card reward'
            });
        }
        
        if (personality.danger > 0.7) {
            objectives.push({
                description: 'Complete within 10 turns',
                completed: false,
                primary: false,
                bonus: 'Legendary artifact'
            });
        }
        
        return objectives;
    }

    /**
     * Generate moral choice for quest
     */
    generateMoralChoice() {
        const choices = [
            {
                situation: 'You find the target weak and defenseless',
                options: [
                    { choice: 'Show mercy', consequence: 'Gain favor but lose reward', alignment: 'good' },
                    { choice: 'Complete the contract', consequence: 'Full reward but moral cost', alignment: 'neutral' },
                    { choice: 'Demand double payment', consequence: 'Risk confrontation', alignment: 'chaotic' }
                ]
            },
            {
                situation: 'You discover the quest giver lied about the situation',
                options: [
                    { choice: 'Confront them', consequence: 'Truth revealed but potential conflict', alignment: 'lawful' },
                    { choice: 'Play along', consequence: 'Maintain relationship but enable deception', alignment: 'neutral' },
                    { choice: 'Turn the tables', consequence: 'Chaotic outcome', alignment: 'chaotic' }
                ]
            }
        ];
        
        return choices[Math.floor(Math.random() * choices.length)];
    }

    /**
     * Generate quest giver NPC
     */
    generateQuestGiver(personality) {
        const questGivers = [
            { name: 'Elder Sage Meridian', type: 'wizard', trustworthy: 0.9 },
            { name: 'Captain Ironheart', type: 'warrior', trustworthy: 0.8 },
            { name: 'Mysterious Stranger', type: 'rogue', trustworthy: 0.4 },
            { name: 'Village Elder', type: 'civilian', trustworthy: 0.95 },
            { name: 'Shadowy Figure', type: 'unknown', trustworthy: 0.3 }
        ];
        
        // More dangerous personalities might give shadier quest givers
        if (personality.danger > 0.7) {
            return questGivers[Math.floor(Math.random() * questGivers.length)];
        }
        
        // Cautious personalities get more trustworthy quest givers
        return questGivers.filter(qg => qg.trustworthy > 0.7)[
            Math.floor(Math.random() * 3)
        ];
    }

    /**
     * Generate AI-driven boss behavior
     */
    generateBossBehavior(boss, gameState) {
        const personality = this.getPersonality();
        
        return {
            tactics: this.generateBossTactics(boss, personality),
            dialogue: this.generateBossDialogue(boss, gameState),
            adaptiveStrategy: this.generateAdaptiveStrategy(boss, gameState, personality),
            phaseTransitions: this.generatePhaseTransitions(boss)
        };
    }

    /**
     * Generate boss tactics
     */
    generateBossTactics(boss, personality) {
        const tactics = [];
        
        if (personality.danger > 0.7) {
            tactics.push({
                name: 'Overwhelming Force',
                description: 'Boss summons additional minions when below 50% health',
                trigger: 'health_threshold',
                threshold: 0.5
            });
        }
        
        if (personality.creativity > 0.6) {
            tactics.push({
                name: 'Reality Manipulation',
                description: 'Boss changes battlefield rules randomly',
                trigger: 'turn_based',
                frequency: 3
            });
        }
        
        return tactics;
    }

    /**
     * Generate boss dialogue
     */
    generateBossDialogue(boss, gameState) {
        const dialogues = {
            encounter_start: [
                `"So, ${gameState.playerName || 'mortal'}, you dare challenge ${boss.name}? Your courage is admirable... and futile."`,
                `"I've been expecting you. Your journey ends here, at the hands of ${boss.name}!"`,
                `"How delightful! Fresh souls to add to my collection. Come, let us dance the dance of destruction!"`
            ],
            half_health: [
                `"Impressive... but I've only begun to show you my power!"`,
                `"You think you're winning? This is merely the beginning of your nightmare!"`,
                `"Enough games! Now you face my true strength!"`
            ],
            defeated: [
                `"Impossible... how could mere mortals... defeat... ${boss.name}..."`,
                `"This... is not... the end... I will... return..."`,
                `"You may have won this battle, but the war... is far from over..."`
            ]
        };
        
        return {
            encounterStart: dialogues.encounter_start[Math.floor(Math.random() * dialogues.encounter_start.length)],
            halfHealth: dialogues.half_health[Math.floor(Math.random() * dialogues.half_health.length)],
            defeated: dialogues.defeated[Math.floor(Math.random() * dialogues.defeated.length)]
        };
    }

    /**
     * Generate adaptive strategy based on player actions
     */
    generateAdaptiveStrategy(boss, gameState, personality) {
        return {
            counterCreatures: gameState.creatureCount > 3,
            counterSpells: gameState.spellCount > 5,
            focusWeakest: personality.danger > 0.6,
            unpredictable: personality.creativity > 0.7
        };
    }

    /**
     * Generate boss phase transitions
     */
    generatePhaseTransitions(boss) {
        return [
            {
                healthThreshold: 0.75,
                name: 'Anger',
                effect: 'Boss attacks become more aggressive',
                visual: 'Red aura surrounds the boss'
            },
            {
                healthThreshold: 0.5,
                name: 'Desperation',
                effect: 'Boss summons reinforcements',
                visual: 'Dark portals open around the battlefield'
            },
            {
                healthThreshold: 0.25,
                name: 'Final Stand',
                effect: 'Boss abilities power increased significantly',
                visual: 'Boss transforms into final form'
            }
        ];
    }

    /**
     * Generate AI suggestions for player actions
     */
    generatePlayerSuggestion(gameState) {
        const personality = this.getPersonality();
        
        const suggestions = [];
        
        // Analyze game state and provide contextual suggestions
        if (gameState.bossHealth && gameState.bossHealth < 30) {
            suggestions.push({
                action: 'aggressive',
                description: 'The boss is weakening. Press the attack!',
                priority: 'high'
            });
        }
        
        if (gameState.playerHealth < 10) {
            if (personality.danger > 0.7) {
                suggestions.push({
                    action: 'risky',
                    description: 'Go all-in! High risk, high reward!',
                    priority: 'medium'
                });
            } else {
                suggestions.push({
                    action: 'defensive',
                    description: 'Focus on survival and healing',
                    priority: 'high'
                });
            }
        }
        
        if (gameState.handSize > 7) {
            suggestions.push({
                action: 'card_management',
                description: 'Consider discarding or playing cards to avoid losing them',
                priority: 'medium'
            });
        }
        
        return suggestions;
    }

    /**
     * Record story event for continuity
     */
    recordStoryEvent(event) {
        this.storyContext.majorEvents.push({
            timestamp: Date.now(),
            event: event,
            personality: this.personality
        });
        
        // Keep only last 50 events
        if (this.storyContext.majorEvents.length > 50) {
            this.storyContext.majorEvents.shift();
        }
    }

    /**
     * Get story context for generating connected narratives
     */
    getStoryContext() {
        return {
            ...this.storyContext,
            recentEvents: this.storyContext.majorEvents.slice(-10)
        };
    }

    /**
     * Reset AI context
     */
    reset() {
        this.conversationHistory = [];
        this.storyContext = {
            currentArc: null,
            majorEvents: [],
            npcRelationships: new Map()
        };
    }

    /**
     * Get AI statistics
     */
    getStats() {
        return {
            personality: this.personality,
            personalityConfig: this.getPersonality(),
            conversationLength: this.conversationHistory.length,
            majorEvents: this.storyContext.majorEvents.length,
            npcRelationships: this.storyContext.npcRelationships.size
        };
    }
}

// Create and export a singleton instance
const aiService = new AIService();
export default aiService;
