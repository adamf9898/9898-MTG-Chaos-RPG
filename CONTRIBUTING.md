# Contributing to 9898-MTG Chaos RPG

We welcome contributions from the Magic: The Gathering and gaming community! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- Modern web browser with ES6 module support
- Basic knowledge of JavaScript, HTML, and CSS
- Familiarity with Magic: The Gathering rules and mechanics

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/9898-MTG-Chaos-RPG.git
   cd 9898-MTG-Chaos-RPG
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the development server**:
   ```bash
   npm run serve
   ```
5. **Open your browser** to `http://localhost:8000`

## 🛠️ Development Guidelines

### Code Style
- Use modern ES6+ JavaScript features
- Follow semantic HTML practices
- Implement responsive CSS design
- Maintain accessibility standards (ARIA labels, keyboard navigation)
- Use meaningful variable and function names
- Add comments for complex logic

### File Structure
```
├── index.html              # Main HTML file
├── styles/
│   └── main.css            # Main stylesheet
├── js/
│   └── main.js             # Main application controller
├── src/
│   ├── api/
│   │   └── scryfall.js     # Scryfall API integration
│   ├── core/
│   │   └── gameState.js    # Game state management
│   └── generators/
│       └── perchance.js    # Perchance-compatible generators
└── tests/
    └── core.test.js        # Test suite
```

### Coding Standards

#### JavaScript
- Use `const` and `let` instead of `var`
- Prefer arrow functions for short functions
- Use template literals for string interpolation
- Implement proper error handling with try/catch
- Follow the module pattern with ES6 imports/exports

#### CSS
- Use CSS Grid and Flexbox for layouts
- Implement mobile-first responsive design
- Use CSS custom properties (variables) for theming
- Follow BEM naming convention for CSS classes
- Ensure high contrast for accessibility

#### HTML
- Use semantic HTML5 elements
- Include proper ARIA labels and roles
- Ensure keyboard navigation support
- Implement proper heading hierarchy

## 🎮 Feature Development

### Adding New Generators

To add new Perchance-compatible generators:

1. **Open** `src/generators/perchance.js`
2. **Add your generator** in the `initializeDefaultGenerators()` method:
   ```javascript
   this.addGenerator('myGenerator', {
       weight: 1,
       items: [
           'Item 1',
           'Item with [nestedGenerator]',
           'Another item'
       ]
   });
   ```
3. **Test your generator**:
   ```javascript
   const result = perchanceGenerator.generate('myGenerator');
   console.log(result);
   ```

### Adding New Bosses

To add new boss encounters:

1. **Open** `src/core/gameState.js`
2. **Add to the bosses array** in `initializeGameData()`:
   ```javascript
   {
       id: 'unique-boss-id',
       name: 'Boss Name',
       health: 150,
       maxHealth: 150,
       abilities: ['Ability 1', 'Ability 2'],
       weaknesses: ['white', 'blue'],
       resistances: ['black', 'red'],
       difficulty: 8,
       defeated: false,
       location: 'Boss Location'
   }
   ```

### Extending Scryfall Integration

To add new Scryfall API functionality:

1. **Open** `src/api/scryfall.js`
2. **Add new methods** following the existing pattern:
   ```javascript
   async getCustomCards(criteria) {
       const query = this.buildQuery(criteria);
       return this.makeRequest(`/cards/search?q=${query}`);
   }
   ```
3. **Implement rate limiting** and caching
4. **Handle errors gracefully** with fallback options

### UI/UX Improvements

When modifying the user interface:

1. **Test on multiple screen sizes** (mobile, tablet, desktop)
2. **Verify keyboard navigation** works properly
3. **Check color contrast** meets WCAG guidelines
4. **Test with screen readers** if possible
5. **Ensure animations respect** `prefers-reduced-motion`

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Adding Tests

When adding new features, include tests:

1. **Open** `tests/core.test.js`
2. **Add test cases** following the existing pattern:
   ```javascript
   test('My New Feature', async () => {
       // Setup
       const mockData = { /* test data */ };
       
       // Execute
       const result = myNewFunction(mockData);
       
       // Verify
       assert.strictEqual(result.status, 'success');
   });
   ```

### Manual Testing Checklist

Before submitting a pull request:

- [ ] Test new game creation
- [ ] Verify card drawing and playing
- [ ] Test encounter generation
- [ ] Check boss battle mechanics
- [ ] Verify settings persistence
- [ ] Test on mobile devices
- [ ] Check accessibility features
- [ ] Verify error handling

## 📝 Pull Request Process

### Before Submitting

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-new-feature
   ```
2. **Make your changes** following the guidelines above
3. **Test thoroughly** on multiple browsers/devices
4. **Update documentation** if necessary
5. **Run the test suite**: `npm test`

### Pull Request Guidelines

1. **Use a clear title** describing the change
2. **Provide detailed description** of what was changed and why
3. **Reference any related issues** using `#issue-number`
4. **Include screenshots** for UI changes
5. **List breaking changes** if any

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing done

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

## 🎯 Areas for Contribution

### High Priority
- **Multiplayer functionality**: Real-time game state sharing
- **AI improvements**: Enhanced boss AI and encounter generation
- **Mobile optimization**: Touch-friendly interactions
- **Performance**: Optimize large card collections

### Medium Priority
- **Custom card creator**: User-generated content tools
- **Save/load system**: Local storage implementation
- **Sound effects**: Audio feedback for actions
- **Animations**: Card movement and transition effects

### Low Priority
- **Achievements system**: Player progression tracking
- **Statistics**: Game analytics and metrics
- **Themes**: Alternative UI color schemes
- **Internationalization**: Multi-language support

## 🎨 Design Guidelines

### Visual Design
- **Color Scheme**: Dark theme with gold accents (#ffd700)
- **Typography**: System fonts for performance and readability
- **Card Design**: MTG-inspired card styling with hover effects
- **Spacing**: Consistent spacing using CSS Grid/Flexbox

### User Experience
- **Progressive Enhancement**: Core functionality without JavaScript
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Fast loading and smooth interactions

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help newcomers learn
- Focus on the project goals

### Getting Help
- **GitHub Issues**: Report bugs and request features
- **Discord**: Real-time community discussion
- **Discussions**: Design and architecture discussions

### Recognition
Contributors will be recognized in:
- README.md contributors section
- Release notes for major contributions
- Project documentation

## 📚 Resources

### Learning Resources
- [MDN Web Docs](https://developer.mozilla.org/) - Web development reference
- [Scryfall API Docs](https://scryfall.com/docs/api) - MTG card data API
- [Perchance Tutorial](https://perchance.org/tutorial) - Random generation
- [MTG Rules](https://magic.wizards.com/en/rules) - Official game rules

### Tools
- [VS Code](https://code.visualstudio.com/) - Recommended editor
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools) - Debugging
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance testing
- [WAVE](https://wave.webaim.org/) - Accessibility testing

Thank you for contributing to 9898-MTG Chaos RPG! 🎴