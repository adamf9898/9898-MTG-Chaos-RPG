# 🎴 9898-MTG Chaos RPG

A comprehensive Magic: The Gathering Chaos RPG implementation featuring cooperative gameplay, dynamic encounters, and integration with the Scryfall API and Perchance generators.

## 🎯 Features

### ✅ Implemented Core Systems

#### 🤖 AI-Driven Content Generation
- **Dynamic Storytelling**: AI-enhanced narratives that adapt to player choices
- **Personality System**: Choose between Default, Cautious, Experimental, or Reckless AI personalities
- **Adaptive Encounters**: Difficulty and mechanics scale based on AI personality
- **Smart NPCs**: AI-generated dialogue and behavior patterns
- **Procedural Quests**: Dynamic quest generation with moral choices and bonus objectives
- **Boss Intelligence**: AI-driven boss tactics and phase transitions

#### 🎮 Game Architecture & State Management
- **Modular Design**: Clean separation of concerns with dedicated modules for API, generators, and game logic
- **Observer Pattern**: Real-time UI updates through state change notifications
- **Persistent State**: Game state management with save/load capabilities (foundation implemented)

#### 🃏 Scryfall API Integration
- **Rate-Limited Requests**: Respects Scryfall's API guidelines with built-in rate limiting
- **Intelligent Caching**: Reduces API calls and improves performance
- **Card Search**: Powerful search functionality using Scryfall's syntax
- **Fallback System**: Graceful degradation when API is unavailable

#### 🎲 Perchance-Compatible Generator System
- **Dynamic Content**: Procedural generation of encounters, quests, and loot
- **Nested Generators**: Support for complex template patterns `[generatorName]`
- **Extensible**: Easy to add new generator categories and content
- **History Tracking**: Generation history for debugging and analysis

#### 🎨 Frontend UI & Accessibility
- **Responsive Design**: Mobile-friendly interface that adapts to different screen sizes
- **Accessibility Features**: ARIA labels, keyboard navigation, focus management
- **Dark Theme**: MTG-inspired color scheme with gold accents
- **Interactive Cards**: Drag-and-drop ready card system with hover effects

#### 🏰 Boss & Encounter System
- **8 Master Bosses**: Unique bosses with different abilities and weaknesses
- **Dynamic Encounters**: Procedurally generated encounters with varying difficulty
- **Quest System**: Multi-objective quests with progress tracking
- **Inventory Management**: Loot and reward system

#### ⚔️ Combat & Card System
- **MTG Card Integration**: Real Magic cards with proper formatting
- **Hand Management**: Draw, play, and manage cards
- **Battlefield Tracking**: Visual representation of played cards
- **Turn Management**: Structured turn-based gameplay

### 🔄 Game Flow

1. **Start New Game**: Initialize player, draw starting hand
2. **Explore**: Discover new locations and encounters
3. **Combat**: Use MTG cards to overcome challenges
4. **Progression**: Complete quests, defeat bosses, collect loot
5. **Victory**: Defeat all 8 Master Bosses to win

## 🚀 Getting Started

### Prerequisites
- Modern web browser with ES6 module support
- Node.js 18+ (for development)
- Internet connection (for Scryfall API, optional)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/adamf9898/9898-MTG-Chaos-RPG.git
   cd 9898-MTG-Chaos-RPG
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run serve
   ```

4. **Open in browser**:
   Navigate to `http://localhost:8000`

### Quick Start

1. Click **"New Game"** to begin
2. Use **"Explore"** to discover encounters
3. Click on cards to view details
4. Play cards to the battlefield
5. Use **"End Turn"** to progress

### AI Personalities

The game features four AI personality modes that affect encounter generation and difficulty:

- **Default**: Balanced gameplay with moderate challenge (Creativity: 70%, Danger: 50%)
- **Cautious**: Safe, predictable encounters with lower difficulty (Creativity: 50%, Danger: 30%)
- **Experimental**: Creative, unpredictable scenarios with unique twists (Creativity: 90%, Danger: 60%)
- **Reckless**: High-risk, high-reward encounters with intense challenges (Creativity: 80%, Danger: 90%)

Select your preferred AI personality in the Deck Builder tab to customize your game experience. The AI will:
- Generate dynamic narratives based on your actions
- Scale encounter difficulty appropriately
- Create unique special mechanics and environmental effects
- Adapt boss behavior and tactics
- Generate quests with moral choices and bonus objectives

## 🔗 Original Links

- **TTS Mod**: [Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=2815480422)
- **Perchance Generator**: [9898-MTG Chaos RPG](https://perchance.org/9898-mtg-chaos-rpg)
- **Facebook Group**: [MTG Community](https://www.facebook.com/groups/708263449826846/)
- **Discord**: [Join Server](https://discord.gg/b4txcrRZ8t)
- **Original TTS**: [MTG RPG Original](https://steamcommunity.com/sharedfiles/filedetails/?id=2601677731)

## 🎯 Gameplay

### Core Mechanics

#### Cooperative Play
- Team up with other players (multiplayer foundation ready)
- Share resources and strategies
- Coordinate attacks against bosses

#### Boss Battles
- Each boss has unique abilities and weaknesses
- Health tracking and damage calculation
- Special boss mechanics and phases

#### Random Encounters
- Procedurally generated using Perchance system
- Varying difficulty levels (1-5)
- Environmental effects and special conditions
- Rewards and consequences

#### Quest System
- Dynamic quest generation
- Objective tracking and progress
- Rewards upon completion
- Multiple quest types

### Card Integration

#### Scryfall Integration
- Real MTG card data and images
- Advanced search capabilities
- Card legality and format checking
- Set and expansion support

#### Custom Content
- Foundation for user-generated cards
- Custom boss abilities
- Unique encounter mechanics
- Homebrew content support

## 🛠️ Technical Architecture

### Frontend Stack
- **Vanilla JavaScript ES6+**: No framework dependencies
- **CSS Grid & Flexbox**: Modern layout techniques
- **Web Standards**: ARIA, semantic HTML, progressive enhancement

### API Integration
- **Scryfall API**: MTG card data and search
- **Rate Limiting**: Respectful API usage
- **Error Handling**: Graceful degradation

### Data Flow
```
User Interaction → Game State → UI Update
                ↓
        Perchance Generator → Content
                ↓
        Scryfall API → Card Data
```

### Module Structure
```
src/
├── ai/
│   └── aiService.js         # AI-driven content generation
├── api/
│   └── scryfall.js          # Scryfall API client
├── core/
│   └── gameState.js         # Game state management
├── generators/
│   └── perchance.js         # Content generators
└── ui/
    └── main.js              # UI controller
```

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Test Coverage
- ✅ Game State Management
- ✅ Perchance Generator Logic
- ✅ Scryfall API Integration
- ✅ AI Service Integration
- ✅ Boss Battle Mechanics
- ✅ Player Management
- ✅ Encounter Generation
- ✅ Quest System
- ✅ Inventory Management

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details.

---

*Built with ❤️ for the Magic: The Gathering community*