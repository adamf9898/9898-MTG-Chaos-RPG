# GitHub Copilot Instructions for 9898-MTG-Chaos-RPG

Purpose
- Guide GitHub Copilot and Copilot Chat to produce code and docs consistent with this repository.
- Prefer correct, minimal, maintainable solutions over clever ones.
- Ask concise clarifying questions when requirements are ambiguous.

Project overview
- Working name: MTG Chaos RPG — a toolkit/game engine for a chaotic, Magic: The Gathering–inspired RPG.
- Primary goals: deterministic core rules, reproducible randomness, clean separation between engine, data, and UI.
- Avoid reproducing copyrighted MTG card text or proprietary data. Use stubs, mocks, or external APIs the repo already integrates.

Tech stack and environment
- Detect stack from repo:
    - If package.json/tsconfig.json present: use TypeScript (strict) targeting Node LTS; use ES modules if configured.
    - If pyproject.toml/requirements.txt present: use Python 3.11+ with type hints (PEP 484), prefer pydantic/dataclasses if already used.
    - If Go modules present: use latest stable Go; keep packages small.
    - If none detected, ask which stack to use before generating large changes.
- Respect existing configuration files: .editorconfig, .prettierrc, eslint/ruff configs, tsconfig, Makefile, Dockerfiles.

Architecture and design
- Keep domain logic pure and testable. Side effects and I/O should be at the edges.
- Prefer small modules with explicit interfaces. Avoid cyclic dependencies.
- Use dependency inversion: inject randomness (seeded PRNG) and time sources.
- Data boundaries:
    - engine/ (rules, resolution, state transitions)
    - data/ (schemas, migrations, fixtures, non-copyrighted datasets)
    - adapters/ (APIs, persistence, UI, CLI)
    - tests/ (unit, integration, property-based)

Coding standards
- TypeScript: strict types, no any, prefer readonly, narrow unions, use discriminated unions for state machines.
- Python: type-annotate all public functions; enable mypy/pyright if present; prefer dataclasses or pydantic models.
- Naming: descriptive, consistent, lower_snake_case for files in Python, kebab-case for npm scripts, PascalCase for types/classes.
- Errors: never swallow exceptions; attach context; return Result/Either where patterns exist.
- Logging: structured, leveled, no secrets or PII.

Dependencies
- Minimize new dependencies. Use what is already present in the repo.
- If a new dependency is essential, justify it and choose a well-maintained, permissively licensed package.

Randomness and determinism
- All game randomness must be seedable and reproducible for testing and replays.
- Provide deterministic test seeds and document them.

Data and domain
- Do not embed or regenerate copyrighted MTG card text or images.
- If card/meta data are required, use existing integration points (e.g., Scryfall API) only if already configured; otherwise provide interfaces and mocks.
- Keep rule text in your own words; cite sources without copying.

Testing and quality
- Follow existing test frameworks:
    - TS/JS: Vitest/Jest + ts-jest/tsx config if present.
    - Python: pytest + hypothesis for property-based tests.
- Write tests alongside new code. Aim for fast, reliable unit tests.
- Provide property-based tests for core rules and state transitions when feasible.
- Enforce lint/format on save and CI. Fix rather than disable rules, unless justified.

Performance
- Prefer O(n) over premature caching; measure before optimizing.
- Avoid global singletons; prefer injected services to enable parallel tests.

Security and privacy
- Never hardcode secrets. Use environment variables and secret managers.
- Validate and sanitize inputs at boundaries (APIs/CLI).
- Avoid eval/dynamic code execution. Keep dependencies up to date.

Documentation
- Update README and module-level docs when adding features or changing behavior.
- Include short usage examples and constraints. Keep docs close to code.
- For public APIs, document parameters, return types, errors, and examples.

CI/CD and repo hygiene
- Keep changes small and focused. Include migration notes if schemas change.
- Use Conventional Commits (feat, fix, docs, chore, refactor, test, perf).
- Ensure CI is green: build, lint, test must pass before merging.

How Copilot should respond in this repo
- Be concise and impersonal. Prefer code over prose.
- When generating files, include file path headers or clear context when requested.
- Ask at most 1–3 targeted questions if requirements are unclear.
- Default to the repo’s existing patterns; do not introduce new frameworks without approval.
- Provide safe fallbacks and guards. Avoid magic numbers; name constants.

Out of scope
- Harmful, hateful, lewd, or irrelevant content.
- Copying copyrighted text or assets.
- Large speculative refactors without prior discussion.

Placeholders to confirm with maintainers
- Primary language and runtime versions.
- Preferred test framework and coverage target.
- Target platforms (CLI, web, desktop, mobile).
- Existing data sources/APIs to integrate.

Maintenance
- Keep this file up to date as the project evolves.
- Prefer small, iterative improvements to instructions rather than large rewrites.
- Review and refine based on feedback from maintainers and contributors.