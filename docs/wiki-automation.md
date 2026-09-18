# Wiki Automation

The GitHub wiki for this repository is regenerated automatically every week
from the main repository contents. You do not need to edit the wiki by hand;
edit the source files in the repo and the wiki will follow.

## What runs

- **Script**: [`tools/manage-wiki.js`](../tools/manage-wiki.js)
- **Workflow**: [`.github/workflows/weekly-wiki.yml`](../.github/workflows/weekly-wiki.yml)
- **Schedule**: every Monday at 06:00 UTC (also runnable on-demand via
  **Actions -> Weekly Wiki Sync -> Run workflow**).

## What the script does

`tools/manage-wiki.js` writes a fixed set of pages into a checkout of the
`<repo>.wiki.git` repository:

| Page                        | Source                                                               |
| --------------------------- | -------------------------------------------------------------------- |
| `Home.md`                   | README intro + wiki navigation                                       |
| `Getting-Started.md`        | "Getting Started" / "Quick Start" section of README                  |
| `World-Building.md`         | `world-building-wiki.md`                                             |
| `Mechanics.md`              | `mechanics-development.md`                                           |
| `Tutorial-Handbook.md`      | `docs/practical-tutorial-handbook.md`                                |
| `Bosses.md`                 | Parsed from `src/core/gameState.js` `bosses[]`                       |
| `Generators.md`             | Parsed from `src/generators/perchance.js` `addGenerator()` calls     |
| `Module-Reference.md`       | Walked from `src/`, `js/`, `tools/` with leading JSDoc/line comments |
| `Contributing.md`           | `CONTRIBUTING.md`                                                    |
| `Security.md`               | `SECURITY.md`                                                        |
| `_Sidebar.md`, `_Footer.md` | Navigation + last-synced timestamp                                   |

Every generated page begins with an HTML comment banner warning that manual
edits will be overwritten.

## Running locally

```bash
# Clone the wiki alongside the main repo
git clone https://github.com/adamf9898/9898-MTG-Chaos-RPG.wiki.git /tmp/wiki

# Regenerate pages
npm run wiki:sync -- --out /tmp/wiki

# Review and commit
cd /tmp/wiki && git diff
```

The workflow uses the default `GITHUB_TOKEN` with `contents: write`
permission to push to the wiki repo; no additional secrets are required.
If the wiki has never been initialised, the workflow bootstraps it with an
empty `Home.md` before generating pages.
