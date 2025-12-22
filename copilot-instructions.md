# GitHub Copilot Instructions for 9898-MTG Chaos RPG

This file provides context and guidelines for GitHub Copilot to assist with development of the 9898-MTG Chaos RPG project.

## Project Overview

9898-MTG Chaos RPG is a comprehensive Magic: The Gathering Chaos RPG implementation featuring:
- Cooperative gameplay with dynamic encounters
- Integration with the Scryfall API for real MTG card data
- AI-driven content generation with multiple personality modes
- Perchance-compatible procedural generation system
- Boss battle system with 8 unique Master Bosses
- Quest and inventory management
- Responsive, accessible web interface

## Technology Stack

- **Language**: Vanilla JavaScript ES6+ (no frameworks)
- **Module System**: ES6 modules with `type: "module"` in package.json
- **Runtime**: Browser-based with Node.js 18+ for development
- **Styling**: Modern CSS (Grid, Flexbox, Custom Properties)
- **API Integration**: Scryfall API for MTG card data
- **Testing**: Node.js built-in test runner

## Architecture

### Module Structure

```
src/
├── ai/
│   └── aiService.js         # AI-driven content generation with personality system
├── api/
│   └── scryfall.js          # Scryfall API client with rate limiting and caching
├── core/
│   └── gameState.js         # Game state management with observer pattern
├── generators/
│   └── perchance.js         # Perchance-compatible content generators
└── prompt.md                # Feature implementation menu

js/
└── main.js                  # Main application controller

tests/
└── core.test.js             # Test suite
```

### Design Patterns

- **Observer Pattern**: Used in `gameState.js` for UI updates
- **Module Pattern**: ES6 imports/exports throughout
- **Singleton Pattern**: GameState, AI Service, Scryfall API instances
- **Factory Pattern**: Generator system for creating encounters, quests, and content

## Code Style and Conventions

### JavaScript

- **Modern ES6+**: Use `const` and `let`, never `var`
- **Arrow Functions**: Prefer for short functions and callbacks
- **Template Literals**: Use for string interpolation
- **Async/Await**: Use for asynchronous operations (API calls, etc.)
- **Error Handling**: Always use try/catch blocks for async operations
- **Comments**: JSDoc-style comments for classes and public methods

Example:
```javascript
/**
 * Fetches card data from Scryfall API
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of card objects
 */
async searchCards(query) {
    try {
        const response = await this.makeRequest(`/cards/search?q=${query}`);
        return response.data;
    } catch (error) {
        console.error('Card search failed:', error);
        return [];
    }
}
```

### CSS

- **Mobile-First**: Design for mobile first, then enhance for larger screens
- **CSS Custom Properties**: Use for theming and reusable values
- **BEM-like Naming**: Use descriptive class names (e.g., `card-container`, `boss-health-bar`)
- **Grid/Flexbox**: Use modern layout techniques, avoid floats
- **Dark Theme**: Primary color scheme with gold accents (#ffd700)
- **Accessibility**: Ensure high contrast ratios (WCAG 2.1 AA)

### HTML

- **Semantic HTML5**: Use appropriate elements (`<main>`, `<section>`, `<article>`, etc.)
- **ARIA Labels**: Include for accessibility
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Progressive Enhancement**: Core functionality should work without JavaScript

## API Integration

### Scryfall API

- **Rate Limiting**: Respect 10 requests per second limit (100ms delay between requests)
- **Caching**: Cache responses to minimize API calls
- **Error Handling**: Graceful degradation when API is unavailable
- **Endpoints Used**:
  - `/cards/search` - Search for cards
  - `/cards/named` - Get specific card by name
  - `/cards/random` - Get random card

Example:
```javascript
// Always use rate limiting
await this.rateLimit();
const response = await fetch(`${this.baseUrl}/cards/search?q=${query}`);
```

### AI Service

- **Personality Modes**: Default, Cautious, Experimental, Reckless
- **Parameters**:
  - Creativity: 50-90% (affects content variety)
  - Danger: 30-90% (affects difficulty scaling)
- **Content Generation**: Encounters, quests, narratives, boss tactics

## Testing Guidelines

### Running Tests

```bash
npm test  # Runs core.test.js
```

### Test Structure

- Tests are in `tests/core.test.js`
- Use Node.js built-in `assert` module
- Test game state management, generators, API integration, AI service
- Mock external dependencies (Scryfall API calls)

### Adding Tests

When adding new features:
1. Add corresponding tests to `tests/core.test.js`
2. Follow existing test patterns
3. Test both success and error cases
4. Use descriptive test names

Example:
```javascript
test('AI Service generates encounter with correct personality settings', async () => {
    const encounter = await aiService.generateEncounter('default');
    assert(encounter.description.length > 0);
    assert(encounter.difficulty >= 1 && encounter.difficulty <= 5);
});
```

## Development Workflow

### Starting Development

```bash
npm install           # Install dependencies
npm run serve         # Start development server on port 8000
```

### File Modification Guidelines

1. **Adding New Generators**: Edit `src/generators/perchance.js`
   - Add to `initializeDefaultGenerators()` method
   - Follow existing generator structure with weighted items
   - Support nested generators using `[generatorName]` syntax

2. **Adding New Bosses**: Edit `src/core/gameState.js`
   - Add to `gameData.bosses` array in `initializeGameData()`
   - Include: id, name, health, abilities, weaknesses, resistances, difficulty, location

3. **Extending Scryfall Integration**: Edit `src/api/scryfall.js`
   - Add new methods following existing patterns
   - Always implement rate limiting
   - Handle errors with fallback options

4. **UI Changes**: Edit `index.html`, `styles/main.css`, `js/main.js`
   - Test on multiple screen sizes
   - Verify keyboard navigation
   - Check color contrast
   - Ensure responsive design

## Common Patterns

### State Management

```javascript
// Always notify observers when state changes
updateState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyObservers();
}

// Subscribe to state changes
gameState.addObserver((state) => {
    // Update UI based on state changes
});
```

### Perchance Generator Usage

```javascript
// Generate content from a generator
const result = perchanceGenerator.generate('encounterType');

// Add nested generator references
this.addGenerator('quest', {
    weight: 1,
    items: [
        'Retrieve the [magicalItem] from [location]',
        'Defeat [enemyType] in [location]'
    ]
});
```

### Error Handling

```javascript
// Always provide user-friendly error messages
try {
    const card = await scryfallAPI.getCardByName(cardName);
    return card;
} catch (error) {
    console.error('Failed to fetch card:', error);
    // Provide fallback or user feedback
    return this.getFallbackCard();
}
```

## Accessibility Requirements

- **ARIA Labels**: All interactive elements must have appropriate ARIA labels
- **Keyboard Navigation**: All functionality accessible via keyboard
- **Focus Management**: Visible focus indicators on all interactive elements
- **Screen Reader Support**: Meaningful text alternatives for all content
- **Color Contrast**: Minimum WCAG 2.1 AA compliance (4.5:1 for normal text)
- **Reduced Motion**: Respect `prefers-reduced-motion` media query

## Performance Considerations

- **Lazy Loading**: Load card images and data as needed
- **Debouncing**: Debounce search inputs and frequent operations
- **Caching**: Cache API responses and generated content
- **Batch Operations**: Group multiple state updates when possible
- **Virtual Scrolling**: Consider for large card collections

## Security Guidelines

- **Input Validation**: Validate all user inputs before processing
- **XSS Prevention**: Sanitize user-generated content before display
- **API Keys**: Never commit API keys (Scryfall doesn't require authentication)
- **Content Security Policy**: Follow CSP best practices

## Git Workflow

- **Branch Naming**: Use descriptive branch names (e.g., `feature/multiplayer-support`)
- **Commit Messages**: Clear, concise messages describing the change
- **Pull Requests**: Include description, screenshots for UI changes, and testing checklist
- **Code Review**: All changes reviewed before merging

## Documentation Standards

- **Code Comments**: Use JSDoc-style comments for public APIs
- **README Updates**: Update README.md for significant feature additions
- **CONTRIBUTING**: Follow guidelines in CONTRIBUTING.md
- **Inline Documentation**: Comment complex algorithms and business logic

## Common Tasks

### Adding a New Feature

1. Create feature branch
2. Update relevant modules in `src/`
3. Add tests to `tests/core.test.js`
4. Update documentation (README.md, CONTRIBUTING.md)
5. Test on multiple browsers/devices
6. Submit pull request with description and screenshots

### Debugging

- **Browser DevTools**: Use Console, Network, and Debugger tabs
- **State Inspection**: Log game state changes via observer pattern
- **API Debugging**: Monitor network requests to Scryfall
- **Generator Testing**: Use console to test generator output

### Optimization

- **Profile Performance**: Use Chrome DevTools Performance tab
- **Check Bundle Size**: Keep dependencies minimal (currently only axios)
- **Lighthouse Audit**: Run regular Lighthouse audits
- **WAVE Testing**: Use WAVE for accessibility audits

## AI Personality System

When implementing AI features:

- **Default** (Creativity: 70%, Danger: 50%): Balanced gameplay
- **Cautious** (Creativity: 50%, Danger: 30%): Safe, predictable
- **Experimental** (Creativity: 90%, Danger: 60%): Creative, unpredictable
- **Reckless** (Creativity: 80%, Danger: 90%): High-risk, high-reward

Personality affects:
- Encounter generation
- Boss tactics
- Quest difficulty and variety
- Narrative tone and content
- Special mechanics and environmental effects

## Build and Deployment

- **Build**: Static site, no build process required
- **Development**: `npm run serve` (Python HTTP server on port 8000)
- **Testing**: `npm test` runs Node.js test suite
- **Deployment**: GitHub Pages via `.github/workflows/static.yml`
- **Linting**: Consider adding ESLint in future (currently placeholder)

## Resources

- [Scryfall API Documentation](https://scryfall.com/docs/api)
- [Perchance Tutorial](https://perchance.org/tutorial)
- [MTG Comprehensive Rules](https://magic.wizards.com/en/rules)
- [MDN Web Docs](https://developer.mozilla.org/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Project Goals

- **Quality**: Maintainable, well-documented code
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Fast, responsive user experience
- **Community**: Open to contributions from MTG community
- **Innovation**: Leverage AI and modern web technologies

## Notes for GitHub Copilot

- Prioritize vanilla JavaScript solutions over framework-specific approaches
- Suggest ES6+ features and modern web APIs
- Consider accessibility in all UI suggestions
- Follow the existing code style and patterns
- Respect rate limiting and caching patterns for API calls
- Maintain compatibility with the existing module structure
- Test suggestions should follow Node.js built-in test runner patterns
- CSS suggestions should use modern techniques (Grid, Flexbox, Custom Properties)
