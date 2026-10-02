# Continuous Improvement

This project uses one finite improvement cycle per reviewed pull request:

**Analyze -> summarize -> plan -> implement -> test -> reflect -> document -> stop**

The next iteration starts only after a human reviews the results and authorizes
it. CI and scheduled audits are read-only; they do not edit files, create pull
requests, merge changes, or trigger another iteration.

## Roles and handoffs

| Role          | Inputs and ownership                                                                                                                               | Output and handoff                                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Coordinator   | The request, repository instructions, and a tracked-file inventory. Owns scope, priorities, and integration; does not invent product requirements. | A short baseline, bounded plan, explicit deferred work, and final review summary for the human reviewer.                      |
| Implementer   | An approved plan and relevant production code. Owns only the assigned code or workflow change and its focused regression tests.                    | A minimal diff, commands run, and known risks handed to QA.                                                                   |
| QA            | The diff, project commands, and expected behavior. Owns test execution and verification evidence; does not weaken checks to get a pass.            | Exact commands and exit statuses, findings separated into baseline vs. introduced, and a go/no-go handoff to the coordinator. |
| Documentation | Verified code behavior and QA evidence. Owns command, capability, task, and report guidance; does not document proposals as implemented.           | Updated instructions and an ordered backlog handed to the coordinator.                                                        |

When independent agents are available, delegate non-overlapping investigation
or implementation tasks and identify their actual outputs. Otherwise, perform
the roles sequentially and state that no separate agents participated. Never
describe a role checklist as completed delegation.

## Iteration checklist

- [ ] **Analyze** the request, applicable instructions, tracked first-party files, and existing implementation.
- [ ] **Summarize** the behavior, evidence, constraints, and baseline check results.
- [ ] **Plan** one small, reviewable change with acceptance criteria and a rollback path.
- [ ] **Implement** only the approved scope; preserve lockfiles, runtime support, offline behavior, and static-site deployment.
- [ ] **Test** with `npm ci --legacy-peer-deps` and `npm run verify`; mock all external I/O.
- [ ] **Reflect** on the diff and every check result; distinguish existing failures from regressions.
- [ ] **Document** verified commands, behavior, role handoffs, and the next bounded tasks.
- [ ] **Stop** and wait for human review before starting another iteration.

The verifier runs lint, formatting, and all Node.js tests under `tests/`, plus
checks required project assets. Each check is limited to four minutes.
It writes `reports/generated/quality-audit.json` and
`reports/generated/quality-audit.md`; these files are ignored locally and
uploaded as CI artifacts rather than committed as time-varying baselines.

## Task template

```markdown
## Objective

## Evidence and current behavior

## In scope

## Out of scope

## Acceptance checks

- [ ] Focused regression coverage
- [ ] `npm run verify`
- [ ] Documentation and rollback reviewed

## Dependencies or risks
```

## Iteration report template

```markdown
## Result

## Changed files and behavior

## Delegation actually performed

## Commands and exit statuses

## Baseline failures vs. introduced failures

## Risk and rollback

## Next tasks (priority ordered)
```

## Bounded backlog

1. Review the existing high-severity `brace-expansion` finding from the
   baseline `npm audit` in an isolated dependency-update change; do not run
   automatic dependency fixes as part of an unrelated feature.
2. Add browser-level tests for accessible UI behavior and safely rendering
   external card data without introducing a live network dependency.
3. Define a deliberate policy for provisioning offline MTGJSON bulk data in
   deployed environments; bulk card data stays out of source-control changes.
4. Validate any proposed native Perchance examples against official docs; the
   repository generator currently implements only its JavaScript reference
   syntax, not the full Perchance language or plugin runtime.
5. Revisit multiplayer only after defining server authority, persistence,
   abuse controls, and deployment requirements.
