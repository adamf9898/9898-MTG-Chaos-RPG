/**
 * MTG Chaos RPG - Main Application
 * Orchestrates the game components and handles UI interactions
 */

import scryfallAPI from '../src/api/scryfall.js';
import perchanceGenerator from '../src/generators/perchance.js';
import gameState from '../src/core/gameState.js';

class MTGChaosRPG {
    constructor() {
        this.isInitialized = false;
        this.loadingQueue = [];
        this.cardCache = new Map();
        
        // Bind methods to preserve context
        this.handleNewGame = this.handleNewGame.bind(this);
        this.handleLoadGame = this.handleLoadGame.bind(this);
        this.handleSettings = this.handleSettings.bind(this);
        this.handleHelp = this.handleHelp.bind(this);
        this.handleDrawCard = this.handleDrawCard.bind(this);
        this.handleEndTurn = this.handleEndTurn.bind(this);
        this.handleExplore = this.handleExplore.bind(this);
        this.handleUseAbility = this.handleUseAbility.bind(this);
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            this.showLoading('Initializing MTG Chaos RPG...');
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Subscribe to game state changes
            gameState.subscribe(this.handleStateChange.bind(this));
            
            // Initialize UI
            this.updateUI();
            
            this.hideLoading();
            this.isInitialized = true;
            
            console.log('MTG Chaos RPG initialized successfully');
        } catch (error) {
            console.error('Failed to initialize MTG Chaos RPG:', error);
            this.showError('Failed to initialize game. Please refresh and try again.');
        }
    }

    /**
     * Set up event listeners for UI interactions
     */
    setupEventListeners() {
        // Navigation buttons
        document.getElementById('new-game-btn')?.addEventListener('click', this.handleNewGame);
        document.getElementById('load-game-btn')?.addEventListener('click', this.handleLoadGame);
        document.getElementById('settings-btn')?.addEventListener('click', this.handleSettings);
        document.getElementById('help-btn')?.addEventListener('click', this.handleHelp);
        
        // Action buttons
        document.getElementById('draw-card-btn')?.addEventListener('click', this.handleDrawCard);
        document.getElementById('end-turn-btn')?.addEventListener('click', this.handleEndTurn);
        document.getElementById('use-ability-btn')?.addEventListener('click', this.handleUseAbility);
        document.getElementById('explore-btn')?.addEventListener('click', this.handleExplore);
        
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', this.handleCloseModal.bind(this));
        });
        
        // Settings form
        document.getElementById('settings-form')?.addEventListener('submit', this.handleSettingsSubmit.bind(this));
        
        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    /**
     * Handle game state changes
     * @param {Object} state - Current game state
     * @param {Object} change - Change details
     */
    handleStateChange(state, change) {
        console.log('Game state changed:', change.type, change);
        
        switch (change.type) {
            case 'game_started':
                this.updateUI();
                this.showMessage('New game started! Welcome to the MTG Chaos RPG!');
                break;
                
            case 'boss_encounter_started':
                this.updateBossDisplay(change.boss);
                this.showMessage(`Boss encounter: ${change.boss.name} appears!`);
                break;
                
            case 'boss_defeated':
                this.updateBossDisplay(null);
                this.showMessage(`${change.boss.name} has been defeated!`);
                if (change.victory) {
                    this.showVictoryScreen();
                }
                break;
                
            case 'encounter_started':
                this.updateEncounterDisplay(change.encounter);
                break;
                
            case 'card_played':
                this.updatePlayerHand();
                this.updateBattlefield();
                break;
                
            case 'item_added_to_inventory':
                this.showMessage(`Found: ${change.item.name || 'New item'}`);
                break;
                
            case 'quest_added':
                this.showMessage(`New quest: ${change.quest.title || 'Untitled Quest'}`);
                break;
                
            default:
                this.updateUI();
        }
    }

    /**
     * Handle new game button click
     */
    async handleNewGame() {
        try {
            this.showLoading('Starting new game...');
            
            // Start with a simple single-player game
            gameState.startNewGame({
                playerCount: 1,
                playerNames: ['Hero']
            });
            
            // Generate initial content
            await this.generateInitialContent();
            
            this.hideLoading();
        } catch (error) {
            console.error('Error starting new game:', error);
            this.showError('Failed to start new game. Please try again.');
            this.hideLoading();
        }
    }

    /**
     * Generate initial game content
     */
    async generateInitialContent() {
        try {
            // Generate starting encounter
            const initialEncounter = perchanceGenerator.generateCompleteEncounter();
            gameState.startEncounter(initialEncounter);
            
            // Draw initial hand
            await this.drawInitialHand();
            
        } catch (error) {
            console.error('Error generating initial content:', error);
        }
    }

    /**
     * Draw initial hand for the player
     */
    async drawInitialHand() {
        try {
            // Get some basic cards for the starting hand
            const playerCards = await scryfallAPI.searchCards('cmc<=3 type:creature OR type:instant OR type:sorcery');
            
            if (playerCards.data && playerCards.data.length > 0) {
                // Add 5 random cards to hand
                const handSize = 5;
                for (let i = 0; i < handSize && i < playerCards.data.length; i++) {
                    const randomCard = playerCards.data[Math.floor(Math.random() * playerCards.data.length)];
                    gameState.addCardToHand('player-1', {
                        id: `card-${Date.now()}-${i}`,
                        scryfallId: randomCard.id,
                        name: randomCard.name,
                        manaCost: randomCard.mana_cost,
                        type: randomCard.type_line,
                        text: randomCard.oracle_text,
                        imageUrl: randomCard.image_uris?.normal,
                        power: randomCard.power,
                        toughness: randomCard.toughness
                    });
                }
            }
        } catch (error) {
            console.error('Error drawing initial hand:', error);
            // Fallback: add some default cards
            this.addDefaultCards();
        }
    }

    /**
     * Add default cards if API fails
     */
    addDefaultCards() {
        const defaultCards = [
            { id: 'default-1', name: 'Lightning Bolt', manaCost: '{R}', type: 'Instant', text: 'Deal 3 damage to any target.' },
            { id: 'default-2', name: 'Grizzly Bears', manaCost: '{1}{G}', type: 'Creature — Bear', text: '', power: '2', toughness: '2' },
            { id: 'default-3', name: 'Counterspell', manaCost: '{U}{U}', type: 'Instant', text: 'Counter target spell.' },
            { id: 'default-4', name: 'Healing Salve', manaCost: '{W}', type: 'Instant', text: 'Choose one — Target player gains 3 life; or prevent the next 3 damage.' },
            { id: 'default-5', name: 'Dark Ritual', manaCost: '{B}', type: 'Instant', text: 'Add {B}{B}{B}.' }
        ];

        defaultCards.forEach(card => {
            gameState.addCardToHand('player-1', card);
        });
    }

    /**
     * Handle load game button click
     */
    handleLoadGame() {
        // For now, show a placeholder message
        this.showMessage('Load game functionality coming soon! Save files will be stored locally.');
    }

    /**
     * Handle settings button click
     */
    handleSettings() {
        this.showModal('settings-modal');
        this.populateSettingsForm();
    }

    /**
     * Populate settings form with current values
     */
    populateSettingsForm() {
        const settings = gameState.state.gameSettings;
        
        document.getElementById('auto-tap-lands').checked = settings.autoTapLands;
        document.getElementById('show-card-previews').checked = settings.showCardPreviews;
        document.getElementById('volume-slider').value = settings.soundVolume;
    }

    /**
     * Handle settings form submission
     */
    handleSettingsSubmit(e) {
        e.preventDefault();
        
        const settings = {
            autoTapLands: document.getElementById('auto-tap-lands').checked,
            showCardPreviews: document.getElementById('show-card-previews').checked,
            soundVolume: parseInt(document.getElementById('volume-slider').value)
        };
        
        gameState.updateSettings(settings);
        this.hideModal('settings-modal');
        this.showMessage('Settings saved!');
    }

    /**
     * Handle help button click
     */
    handleHelp() {
        const helpText = `
            <h2>MTG Chaos RPG Help</h2>
            <h3>Objective</h3>
            <p>Work together to defeat all 8 Master Bosses in this cooperative MTG RPG format.</p>
            
            <h3>Controls</h3>
            <ul>
                <li><strong>Draw Card:</strong> Draw a card from your library</li>
                <li><strong>End Turn:</strong> End your current turn</li>
                <li><strong>Use Ability:</strong> Activate special abilities</li>
                <li><strong>Explore:</strong> Discover new locations and encounters</li>
            </ul>
            
            <h3>Encounters</h3>
            <p>Random encounters provide challenges, rewards, and story elements. Use your cards wisely!</p>
            
            <h3>Bosses</h3>
            <p>Each boss has unique abilities, weaknesses, and requires different strategies to defeat.</p>
            
            <h3>Tips</h3>
            <ul>
                <li>Pay attention to boss weaknesses and resistances</li>
                <li>Complete quests for valuable rewards</li>
                <li>Explore different locations for better equipment</li>
                <li>Work together with other players for maximum effectiveness</li>
            </ul>
        `;
        
        this.showCustomModal('Help', helpText);
    }

    /**
     * Handle draw card button click
     */
    async handleDrawCard() {
        try {
            this.showLoading('Drawing card...');
            
            // Get a random card from Scryfall
            const randomCard = await scryfallAPI.getRandomCard('cmc<=6');
            
            if (randomCard) {
                gameState.addCardToHand('player-1', {
                    id: `card-${Date.now()}`,
                    scryfallId: randomCard.id,
                    name: randomCard.name,
                    manaCost: randomCard.mana_cost,
                    type: randomCard.type_line,
                    text: randomCard.oracle_text,
                    imageUrl: randomCard.image_uris?.normal,
                    power: randomCard.power,
                    toughness: randomCard.toughness
                });
                
                this.showMessage(`Drew: ${randomCard.name}`);
            }
            
            this.hideLoading();
        } catch (error) {
            console.error('Error drawing card:', error);
            this.hideLoading();
            this.showError('Failed to draw card. Try again.');
        }
    }

    /**
     * Handle end turn button click
     */
    handleEndTurn() {
        // Increment turn counter
        gameState.updateState({ 
            currentTurn: gameState.state.currentTurn + 1 
        });
        
        this.showMessage(`Turn ${gameState.state.currentTurn} begins!`);
    }

    /**
     * Handle use ability button click
     */
    handleUseAbility() {
        this.showMessage('Ability system coming soon! Will allow special player powers and boss interactions.');
    }

    /**
     * Handle explore button click
     */
    async handleExplore() {
        try {
            this.showLoading('Exploring...');
            
            // Generate a random encounter
            const encounter = perchanceGenerator.generateCompleteEncounter();
            gameState.startEncounter(encounter);
            
            // Random chance for loot or quest
            if (Math.random() < 0.3) {
                const loot = perchanceGenerator.generate('treasure');
                gameState.addToInventory({ name: loot });
            }
            
            if (Math.random() < 0.2) {
                const quest = perchanceGenerator.generateQuest();
                gameState.addQuest(quest);
            }
            
            this.hideLoading();
        } catch (error) {
            console.error('Error exploring:', error);
            this.hideLoading();
            this.showError('Exploration failed. Try again.');
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeydown(e) {
        // Escape key closes modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => {
                this.hideModal(modal.id);
            });
        }
        
        // Game shortcuts (only when not typing)
        if (!e.target.matches('input, textarea')) {
            switch (e.key.toLowerCase()) {
                case 'd':
                    this.handleDrawCard();
                    break;
                case 'e':
                    this.handleExplore();
                    break;
                case 't':
                    this.handleEndTurn();
                    break;
                case 'h':
                    this.handleHelp();
                    break;
            }
        }
    }

    /**
     * Update the entire UI based on current game state
     */
    updateUI() {
        this.updateBossDisplay(gameState.state.currentBoss);
        this.updateEncounterDisplay(gameState.state.currentEncounter);
        this.updatePlayerHand();
        this.updateBattlefield();
        this.updatePartyDisplay();
    }

    /**
     * Update boss display
     */
    updateBossDisplay(boss) {
        const bossNameElement = document.getElementById('current-boss');
        const bossHealthFill = document.getElementById('boss-health-fill');
        const bossHealthText = document.getElementById('boss-health-text');
        
        if (boss) {
            bossNameElement.textContent = boss.name;
            const healthPercentage = (boss.health / boss.maxHealth) * 100;
            bossHealthFill.style.width = `${healthPercentage}%`;
            bossHealthText.textContent = `${boss.health}/${boss.maxHealth}`;
        } else {
            bossNameElement.textContent = 'Select Boss';
            bossHealthFill.style.width = '100%';
            bossHealthText.textContent = '100/100';
        }
    }

    /**
     * Update encounter display
     */
    updateEncounterDisplay(encounter) {
        const encounterElement = document.getElementById('encounter-display');
        
        if (encounter) {
            encounterElement.innerHTML = `
                <h4>${encounter.title || 'Current Encounter'}</h4>
                <p><strong>Location:</strong> ${encounter.location || 'Unknown'}</p>
                ${encounter.weather ? `<p><strong>Weather:</strong> ${encounter.weather}</p>` : ''}
                <p><strong>Difficulty:</strong> ${encounter.difficulty || 1}/5</p>
                ${encounter.special ? `<p><strong>Special:</strong> ${encounter.special}</p>` : ''}
            `;
        } else {
            encounterElement.innerHTML = '<p>Click "Explore" to discover new encounters!</p>';
        }
    }

    /**
     * Update player hand display
     */
    updatePlayerHand() {
        const handElement = document.getElementById('player-hand');
        const player = gameState.getPlayer('player-1');
        
        if (!player || !player.hand) {
            handElement.innerHTML = '<p>No cards in hand</p>';
            return;
        }
        
        handElement.innerHTML = player.hand.map(card => 
            this.createCardHTML(card)
        ).join('');
        
        // Add click handlers to cards
        handElement.querySelectorAll('.mtg-card').forEach(cardElement => {
            cardElement.addEventListener('click', (e) => {
                const cardId = e.currentTarget.dataset.cardId;
                const card = player.hand.find(c => c.id === cardId);
                if (card) {
                    this.showCardDetails(card);
                }
            });
        });
    }

    /**
     * Update battlefield display
     */
    updateBattlefield() {
        const battlefieldElement = document.getElementById('battlefield-zone');
        const player = gameState.getPlayer('player-1');
        
        if (!player || !player.battlefield || player.battlefield.length === 0) {
            battlefieldElement.innerHTML = '<p>No creatures on battlefield</p>';
            return;
        }
        
        battlefieldElement.innerHTML = player.battlefield.map(card => 
            this.createCardHTML(card)
        ).join('');
    }

    /**
     * Update party display
     */
    updatePartyDisplay() {
        const partyElement = document.getElementById('party-members');
        const players = gameState.state.players;
        
        partyElement.innerHTML = players.map(player => `
            <div class="party-member">
                <strong>${player.name}</strong><br>
                Health: ${player.health}/${player.maxHealth}<br>
                Level: ${player.level}
            </div>
        `).join('');
    }

    /**
     * Create HTML for a card
     */
    createCardHTML(card) {
        return `
            <div class="mtg-card" data-card-id="${card.id}">
                <div class="card-name">${card.name}</div>
                ${card.manaCost ? `<div class="card-cost">${this.formatManaCost(card.manaCost)}</div>` : ''}
                <div class="card-type">${card.type}</div>
                <div class="card-text">${this.truncateText(card.text || '', 60)}</div>
                ${card.power && card.toughness ? 
                    `<div class="card-power-toughness">${card.power}/${card.toughness}</div>` : ''}
            </div>
        `;
    }

    /**
     * Format mana cost for display
     */
    formatManaCost(manaCost) {
        if (!manaCost) return '';
        return manaCost.replace(/[{}]/g, '');
    }

    /**
     * Truncate text to specified length
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    /**
     * Show card details in modal
     */
    showCardDetails(card) {
        const cardDetailsElement = document.getElementById('card-details');
        
        cardDetailsElement.innerHTML = `
            <h3>${card.name}</h3>
            <p><strong>Type:</strong> ${card.type}</p>
            ${card.manaCost ? `<p><strong>Mana Cost:</strong> ${card.manaCost}</p>` : ''}
            ${card.power && card.toughness ? `<p><strong>Power/Toughness:</strong> ${card.power}/${card.toughness}</p>` : ''}
            <p><strong>Text:</strong> ${card.text || 'No text'}</p>
            ${card.imageUrl ? `<img src="${card.imageUrl}" alt="${card.name}" style="max-width: 200px; margin-top: 10px;">` : ''}
            <div style="margin-top: 20px;">
                <button onclick="mtgGame.playCardFromHand('${card.id}')" class="action-btn">Play Card</button>
            </div>
        `;
        
        this.showModal('card-modal');
    }

    /**
     * Play card from hand
     */
    playCardFromHand(cardId) {
        const player = gameState.getPlayer('player-1');
        const card = player.hand.find(c => c.id === cardId);
        
        if (card) {
            gameState.playCard('player-1', card);
            this.hideModal('card-modal');
            this.showMessage(`Played: ${card.name}`);
        }
    }

    /**
     * Show loading indicator
     */
    showLoading(message = 'Loading...') {
        const loadingElement = document.getElementById('loading-indicator');
        const loadingText = loadingElement.querySelector('p');
        
        if (loadingText) loadingText.textContent = message;
        loadingElement.style.display = 'flex';
        loadingElement.setAttribute('aria-hidden', 'false');
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        const loadingElement = document.getElementById('loading-indicator');
        loadingElement.style.display = 'none';
        loadingElement.setAttribute('aria-hidden', 'true');
    }

    /**
     * Show modal
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
            
            // Focus first focusable element
            const focusable = modal.querySelector('button, input, select, textarea');
            if (focusable) focusable.focus();
        }
    }

    /**
     * Hide modal
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Handle modal close button
     */
    handleCloseModal(e) {
        const modal = e.target.closest('.modal');
        if (modal) {
            this.hideModal(modal.id);
        }
    }

    /**
     * Show custom modal with content
     */
    showCustomModal(title, content) {
        // Create temporary modal
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" aria-label="Close">&times;</button>
                <h2>${title}</h2>
                <div>${content}</div>
            </div>
        `;
        
        // Add close functionality
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        document.body.appendChild(modal);
    }

    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            border: 2px solid #ffd700;
            z-index: 9999;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showMessage(message, 'error');
    }

    /**
     * Show victory screen
     */
    showVictoryScreen() {
        const victoryContent = `
            <h2>🎉 Victory! 🎉</h2>
            <p>Congratulations! You have defeated all the Master Bosses and saved the multiverse!</p>
            <p>Your legendary deeds will be remembered across all planes of existence.</p>
            <div style="margin-top: 20px;">
                <button onclick="gameState.resetGame(); mtgGame.hideModal('victory-modal')" class="action-btn">New Game</button>
            </div>
        `;
        
        this.showCustomModal('Victory!', victoryContent);
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mtgGame = new MTGChaosRPG();
});

// Export for use in other modules
export default MTGChaosRPG;