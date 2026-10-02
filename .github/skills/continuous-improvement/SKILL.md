---
name: continuous-improvement
description: Run one bounded, evidence-based improvement cycle for this repository, including verification and a human-review handoff.
---

Follow `AGENTS.md`, `.github/copilot-instructions.md`, and
`docs/continuous-improvement.md`.

1. Analyze relevant tracked code, workflows, prompts, documentation, and task
   records. Establish current behavior and baseline checks before editing.
2. Summarize evidence and plan one minimal, reviewable change. Mark broader
   ideas as deferred tasks rather than implementing speculative infrastructure.
3. Use separate coordinator, implementer, QA, and documentation roles. Delegate
   only independent work when agent delegation is actually available; otherwise
   perform the handoffs yourself and say so.
4. Add deterministic tests for production behavior. Mock all external I/O and
   use `src/services/cardSource.js` for app card lookups.
5. Run `npm ci --legacy-peer-deps` and `npm run verify`; preserve real command
   statuses and separate baseline issues from regressions.
6. Reflect, document results, risks, rollback, and a short priority-ordered
   backlog. Stop after this one iteration for human review.

Do not create an unattended loop, edit source from a scheduled workflow, merge
automatically, or create issues without authorization.
