# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in 9898-MTG Chaos RPG, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

### How to Report

1. **Email**: Open a [GitHub Security Advisory](https://github.com/adamf9898/9898-MTG-Chaos-RPG/security/advisories/new) directly in the repository.
2. **Response Time**: You can expect an acknowledgment within 48 hours and a resolution plan within 7 days.

### Scope

The following are in scope for security reports:

- Cross-site scripting (XSS) vulnerabilities in the web UI
- Issues with API key handling or credential exposure
- Dependency vulnerabilities that affect the production application
- Content Security Policy bypass vulnerabilities

### Out of Scope

- Bugs that are not security-related (please file a regular issue)
- Vulnerabilities in third-party services (Scryfall, Perchance, etc.)
- Issues that require physical access to the user's device

### Security Practices

This project follows these security practices:

- **No API Keys**: Scryfall API requires no authentication; no keys are stored in the repo
- **Input Sanitization**: All user-generated content is sanitized before display
- **Content Security Policy**: CSP headers recommended for deployment
- **Dependency Management**: Dependencies are kept minimal and updated regularly via Dependabot

Thank you for helping keep the 9898-MTG community safe! 🛡️
