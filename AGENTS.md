# Working on PE Ultimate
Scope: only osher15/https-pe-ultimate.netlify.app. Other repositories are read-only.
Read docs/ACTION_PLAN_2026-10-03.md and COLLABORATION.md before work.

## Actual stack
Vanilla JavaScript/HTML/CSS, hm-data.js pure data helpers, node:test unit tests, Playwright browser tests, generated Hamegrash.html/index.html/sw.js, and native/ Capacitor.
Do not introduce React, TypeScript, a store marketplace, server/API/database or a rewrite based on historical templates.

## Workflow
- Read current main, open Issues/PRs and pending branch handoffs; distinguish merged from pending.
- Work on a dedicated task branch. Reserve exact files/sections in an Issue before edits. If GitHub write access is unavailable, record reservation and blocker in the local handoff and deliver a reviewable patch; never claim the board was changed.
- Codex owns current harness persistence and My Students missing-summary work. Claude owns subsequent lesson-builder timing/equipment and native packaging. New tasks need fresh reservations.
- Shared files: hm-data.js, hm-i18n.js, hm-terms.js, hm-texts.js, index.html, hm-styles.css, build script, SW, test runner and workflows. Generated outputs are rebuilt after integration, not copied from stale branches.
- Preserve stable sid/cid, real data, manual grades, language preference, manual lesson building and offline core.
- No forced/required feedback, no silent live lesson replacement, no intrusive alerts.
- English default for new installs; five-language additions; use English for new documentation/comments.
- Imports/expansion of international plans and the component bank are paused until the user explicitly lifts the hold.
- User is merge/deploy coordinator. Submit PRs/patches, do not auto-merge or deploy.
- No payments, new API keys, paid services or required account system.
- Run npm test, node build-standalone.js and relevant browser suites; check repeated build produces no diff. Test critical persistence/failure behavior, not just fixture state.
- Document exact commands/results and limitations. CI, simulated native, emulation and physical-device evidence are distinct.
- Write docs/handoffs/YYYY-MM-DD-task.md before handoff. Never mark work done solely from a branch name or historical report.
