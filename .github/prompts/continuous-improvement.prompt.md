# Prompt: One Continuous-Improvement Iteration

Run exactly one bounded improvement cycle for this repository. Read
`AGENTS.md`, `.github/copilot-instructions.md`, and
`docs/continuous-improvement.md` first.

1. Analyze the request and relevant tracked files. Record observed behavior and
   run applicable baseline checks before editing.
2. Summarize the evidence and plan one reviewable change with acceptance and
   rollback criteria. Keep multiplayer, hosted-AI infrastructure, broad UI
   redesigns, bulk data downloads, and dependency modernization out of scope
   unless explicitly required.
3. Delegate independent, non-overlapping roles only when actual agents are
   available. Otherwise work through coordinator, implementer, QA, and
   documentation roles sequentially; do not claim agents ran.
4. Implement only the approved scope. Preserve browser behavior, persistence,
   static Pages deployment, and offline card lookup. Use
   `src/services/cardSource.js` for UI card operations; do not make live network
   calls in tests.
5. Run `npm ci --legacy-peer-deps` and `npm run verify`. Report exact commands
   and statuses, including every pre-existing warning or failure. Do not skip,
   weaken, or mask checks.
6. Reflect on the resulting diff, update verified documentation, and list a
   small priority-ordered backlog.
7. Stop for human review. Do not launch another improvement pass, auto-merge,
   or create repository issues without authorization.

Use the task and report templates in `docs/continuous-improvement.md`.
