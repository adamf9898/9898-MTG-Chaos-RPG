/**
 * Game State Management System
 * Handles all game state, player data, boss encounters, and game flow
 * Implements observer pattern for UI updates
 */

class GameState {
    constructor() {
        this.state = {
            gamePhase: 'menu', // 'menu', 'playing', 'encounter', 'boss', 'victory', 'defeat'
            currentTurn: 0,
            players: [],
            currentBoss: null,
            currentEncounter: null,
            location: null,
            inventory: [],
            quests: [],
            defeatedBosses: [],
            gameSettings: {
                autoTapLands: false,
                showCardPreviews: true,
                soundVolume: 50,
                difficulty: 'normal'
            }
        };
        
        this.observers = [];
        this.gameData = {
            bosses: [],
            encounters: [],
            playerCards: [],
            customContent: []
        };
        
        this.initializeGameData();
    }

    /**
     * Initialize default game data
     */
    initializeGameData() {
        // Default boss templates - will be enhanced with Scryfall data
        this.gameData.bosses = [
            {
                id: 'vorthak-destroyer',
                name: 'Vorthak the Destroyer',
                health: 150,
                maxHealth: 150,
                abilities: ['Chaos Storm', 'Reality Rift', 'Void Manipulation'],
                weaknesses: ['white', 'blue'],
                resistances: ['black', 'red'],
                difficulty: 8,
                defeated: false,
                location: 'The Chaos Nexus'
            },
            {
                id: 'malachar-corrupted',
                name: 'Malachar the Corrupted',
                health: 120,
                maxHealth: 120,
                abilities: ['Soul Drain', 'Shadow Minions', 'Corrupt Spells'],
                weaknesses: ['white', 'green'],
                resistances: ['black'],
                difficulty: 6,
                defeated: false,
                location: 'The Shadowlands'
            },
            {
                id: 'nethys-ancient',
                name: 'Nethys the Ancient',
                health: 200,
                maxHealth: 200,
                abilities: ['Time Manipulation', 'Ancient Knowledge', 'Planar Binding'],
                weaknesses: ['red', 'green'],
                resistances: ['blue', 'white'],
                difficulty: 9,
                defeated: false,
                location: 'The Temporal Sanctum'
            }
        ];

        // Default player template
        this.defaultPlayer = {
            id: '',
            name: 'Player',
            health: 20,
            maxHealth: 20,
            mana: { white: 0, blue: 0, black: 0, red: 0, green: 0, colorless: 0 },
            hand: [],
            battlefield: [],
            graveyard: [],
            library: [],
            abilities: [],
            experience: 0,
            level: 1
        };
    }

    /**
     * Subscribe to state changes
     * @param {Function} callback - Function to call when state changes
     */
    subscribe(callback) {
        this.observers.push(callback);
    }

    /**
     * Unsubscribe from state changes
     * @param {Function} callback - Function to remove from observers
     */
    unsubscribe(callback) {
        this.observers = this.observers.filter(obs => obs !== callback);
    }

    /**
     * Notify all observers of state changes
     * @param {Object} change - Details about what changed
     */
    notifyObservers(change) {
        this.observers.forEach(callback => {
            try {
                callback(this.state, change);
            } catch (error) {
                console.error('Observer callback error:', error);
            }
        });
    }

    /**
     * Update game state and notify observers
     * @param {Object} updates - State updates to apply
     */
    updateState(updates) {
        const previousState = { ...this.state };
        this.state = { ...this.state, ...updates };
        
        this.notifyObservers({
            type: 'state_update',
            previous: previousState,
            current: this.state,
            updates
        });
    }

    /**
     * Start a new game
     * @param {Object} options - Game initialization options
     */
    startNewGame(options = {}) {
        const players = options.playerCount ? 
            Array.from({ length: options.playerCount }, (_, i) => ({
                ...this.defaultPlayer,
                id: `player-${i + 1}`,
                name: options.playerNames?.[i] || `Player ${i + 1}`
            })) : 
            [{ ...this.defaultPlayer, id: 'player-1', name: 'Player 1' }];

        this.updateState({
            gamePhase: 'playing',
            currentTurn: 1,
            players: players,
            currentBoss: null,
            currentEncounter: null,
            location: 'Starting Village',
            inventory: [],
            quests: [],
            defeatedBosses: []
        });

        this.notifyObservers({
            type: 'game_started',
            options
        });
    }

    /**
     * Load a saved game
     * @param {Object} saveData - Saved game data
     */
    loadGame(saveData) {
        if (!saveData || !saveData.state) {
            throw new Error('Invalid save data');
        }

        this.state = { ...saveData.state };
        this.gameData = { ...saveData.gameData };

        this.notifyObservers({
            type: 'game_loaded',
            saveData
        });
    }

    /**
     * Save current game state
     * @returns {Object} Serializable save data
     */
    saveGame() {
        const saveData = {
            version: '1.0.0',
            timestamp: Date.now(),
            state: { ...this.state },
            gameData: { ...this.gameData }
        };

        this.notifyObservers({
            type: 'game_saved',
            saveData
        });

        return saveData;
    }

    /**
     * Start a boss encounter
     * @param {string|Object} boss - Boss ID or boss object
     */
    startBossEncounter(boss) {
        const bossData = typeof boss === 'string' ? 
            this.gameData.bosses.find(b => b.id === boss) : 
            boss;

        if (!bossData) {
            throw new Error('Boss not found');
        }

        this.updateState({
            gamePhase: 'boss',
            currentBoss: { ...bossData },
            currentEncounter: null
        });

        this.notifyObservers({
            type: 'boss_encounter_started',
            boss: bossData
        });
    }

    /**
     * Start a random encounter
     * @param {Object} encounter - Encounter data
     */
    startEncounter(encounter) {
        this.updateState({
            gamePhase: 'encounter',
            currentEncounter: encounter,
            currentBoss: null
        });

        this.notifyObservers({
            type: 'encounter_started',
            encounter
        });
    }

    /**
     * Deal damage to current boss
     * @param {number} damage - Amount of damage to deal
     */
    damageBoss(damage) {
        if (!this.state.currentBoss) {
            throw new Error('No active boss to damage');
        }

        const boss = this.state.currentBoss;
        boss.health = Math.max(0, boss.health - damage);

        if (boss.health <= 0) {
            this.defeatBoss();
        } else {
            this.updateState({ currentBoss: boss });
            this.notifyObservers({
                type: 'boss_damaged',
                damage,
                boss
            });
        }
    }

    /**
     * Defeat the current boss
     */
    defeatBoss() {
        if (!this.state.currentBoss) {
            throw new Error('No active boss to defeat');
        }

        const defeatedBoss = this.state.currentBoss;
        const newDefeatedBosses = [...this.state.defeatedBosses, defeatedBoss.id];

        // Mark boss as defeated in game data
        const bossIndex = this.gameData.bosses.findIndex(b => b.id === defeatedBoss.id);
        if (bossIndex !== -1) {
            this.gameData.bosses[bossIndex].defeated = true;
        }

        // Check for victory condition (all bosses defeated)
        const allBossesDefeated = this.gameData.bosses.every(boss => boss.defeated);

        this.updateState({
            gamePhase: allBossesDefeated ? 'victory' : 'playing',
            currentBoss: null,
            defeatedBosses: newDefeatedBosses
        });

        this.notifyObservers({
            type: 'boss_defeated',
            boss: defeatedBoss,
            victory: allBossesDefeated
        });
    }

    /**
     * Add card to player's hand
     * @param {string} playerId - Player ID
     * @param {Object} card - Card to add
     */
    addCardToHand(playerId, card) {
        const players = this.state.players.map(player => {
            if (player.id === playerId) {
                return {
                    ...player,
                    hand: [...player.hand, card]
                };
            }
            return player;
        });

        this.updateState({ players });

        this.notifyObservers({
            type: 'card_added_to_hand',
            playerId,
            card
        });
    }

    /**
     * Play a card from player's hand
     * @param {string} playerId - Player ID
     * @param {Object} card - Card to play
     * @param {string} zone - Target zone ('battlefield', 'graveyard')
     */
    playCard(playerId, card, zone = 'battlefield') {
        const players = this.state.players.map(player => {
            if (player.id === playerId) {
                const hand = player.hand.filter(c => c.id !== card.id);
                const targetZone = [...player[zone], card];
                
                return {
                    ...player,
                    hand,
                    [zone]: targetZone
                };
            }
            return player;
        });

        this.updateState({ players });

        this.notifyObservers({
            type: 'card_played',
            playerId,
            card,
            zone
        });
    }

    /**
     * Add item to inventory
     * @param {Object} item - Item to add
     */
    addToInventory(item) {
        const inventory = [...this.state.inventory, {
            ...item,
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }];

        this.updateState({ inventory });

        this.notifyObservers({
            type: 'item_added_to_inventory',
            item
        });
    }

    /**
     * Add quest to quest log
     * @param {Object} quest - Quest to add
     */
    addQuest(quest) {
        const quests = [...this.state.quests, {
            ...quest,
            id: `quest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            status: 'active',
            progress: 0
        }];

        this.updateState({ quests });

        this.notifyObservers({
            type: 'quest_added',
            quest
        });
    }

    /**
     * Update quest progress
     * @param {string} questId - Quest ID
     * @param {number} progress - New progress value
     */
    updateQuestProgress(questId, progress) {
        const quests = this.state.quests.map(quest => {
            if (quest.id === questId) {
                const completed = progress >= 100;
                return {
                    ...quest,
                    progress,
                    status: completed ? 'completed' : 'active'
                };
            }
            return quest;
        });

        this.updateState({ quests });

        this.notifyObservers({
            type: 'quest_progress_updated',
            questId,
            progress
        });
    }

    /**
     * Change current location
     * @param {string} location - New location name
     */
    changeLocation(location) {
        this.updateState({ location });

        this.notifyObservers({
            type: 'location_changed',
            location
        });
    }

    /**
     * Update game settings
     * @param {Object} settings - Settings to update
     */
    updateSettings(settings) {
        const gameSettings = { ...this.state.gameSettings, ...settings };
        this.updateState({ gameSettings });

        this.notifyObservers({
            type: 'settings_updated',
            settings: gameSettings
        });
    }

    /**
     * Get current game statistics
     * @returns {Object} Game statistics
     */
    getGameStats() {
        return {
            turnCount: this.state.currentTurn,
            bossesDefeated: this.state.defeatedBosses.length,
            totalBosses: this.gameData.bosses.length,
            activeQuests: this.state.quests.filter(q => q.status === 'active').length,
            completedQuests: this.state.quests.filter(q => q.status === 'completed').length,
            inventorySize: this.state.inventory.length,
            players: this.state.players.length,
            gamePhase: this.state.gamePhase,
            location: this.state.location
        };
    }

    /**
     * Reset game to initial state
     */
    resetGame() {
        this.state = {
            gamePhase: 'menu',
            currentTurn: 0,
            players: [],
            currentBoss: null,
            currentEncounter: null,
            location: null,
            inventory: [],
            quests: [],
            defeatedBosses: [],
            gameSettings: this.state.gameSettings // Preserve settings
        };

        // Reset boss defeated status
        this.gameData.bosses.forEach(boss => {
            boss.defeated = false;
            boss.health = boss.maxHealth;
        });

        this.notifyObservers({
            type: 'game_reset'
        });
    }

    /**
     * Get player by ID
     * @param {string} playerId - Player ID
     * @returns {Object|null} Player object or null if not found
     */
    getPlayer(playerId) {
        return this.state.players.find(player => player.id === playerId) || null;
    }

    /**
     * Get all available bosses
     * @returns {Array} Array of boss objects
     */
    getBosses() {
        return this.gameData.bosses;
    }

    /**
     * Get undefeated bosses
     * @returns {Array} Array of undefeated boss objects
     */
    getUndefeatedBosses() {
        return this.gameData.bosses.filter(boss => !boss.defeated);
    }
}

// Create and export a singleton instance
const gameState = new GameState();
export default gameState;