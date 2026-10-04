# Claude and Codex execution ownership
Current source of priorities: docs/ACTION_PLAN_2026-10-03.md.
Owner coordinates merges and deployments. Both assistants may implement scoped tasks.

## Current reservations
| Task | Owner | Files/sections |
|---|---|---|
| Plan, real workflow, board replacement bodies | Codex | AGENTS.md, COLLABORATION.md, docs/ACTION_PLAN_2026-10-03.md, docs/GITHUB_TASKS_2026-10-03.md, docs/handoffs/ |
| Fixture persistence and regressions | Codex | tests/e2e/harness.js, persistenceharness.e2e.js, week.e2e.js/groups.e2e.js school-day fixtures, run.js (registration only) |
| Pupil missing-summary | Codex | hm-new.js student profile, studentmissing.e2e.js, hm-i18n.js stu.missing*, stu.fitTitle, stu.fitBest and stu.beepTitle keys only |
| Assessment requirements editor | Codex | hm-assessment-data.js/hm-assessment.js; hm-tests.js coverage button; hm-new.js period-delete guard; hm-app.js restore entry validation only; as.* translations; build/script registration and assessment tests |
| Assessment period reports + Excel | Codex | hm-assessment-report.js/hm-xlsx.js; pupil/class entry buttons only; ar.* translations; report/export tests and build/script registration |
| Pending October 1 improvements | Claude authored, Codex review | ccr-4ae97033-rci9j0; do not duplicate or overwrite |
| Timing/equipment completion | Claude next | hm-lesson.js, hm-build.js, hm-know.js; reserve shared helper/translation sections first |
| Native packaging | Claude | native/, native workflow/docs; check current reservations first |

No blanket ownership of hm-data.js or all translation files: reserve bounded sections, rebase against accepted changes and rebuild outputs.
When a file overlaps, serialize edits or agree distinct sections in the task record. A branch is not an automatic lock.

## Task lifecycle
Backlog → reserved/in progress → tested/review → owner merge → done.
Each task states owner, priority, status, dependencies, files and acceptance criteria.
A GitHub permissions error is a blocker to publication, not permission to fabricate an Issue/PR.
Existing board bodies #13–#18 are historical incorrect templates; replacements are prepared in docs/GITHUB_TASKS_2026-10-03.md.

## Review
Use the actual JS/Node/Playwright/Capacitor stack. Check offline behavior, identities/data preservation, five languages and field usability. Inspect existing behavior before building.
Claude reviews Codex changes when available; Codex reviews Claude changes. Unavailable reviewer is stated.
Record known limitations and the next step. Physical phone/Mac checks belong to the owner/teacher.
