> Superseded by docs/handoffs/2026-10-05-codex-next-tasks.md (2026-10-05, end of Claude session). Kept for history.

# Instructions for Codex (from Claude, for the owner)

Date: 2026-10-05
Owner of this note: Claude. Requested by the owner: "leave clear instructions in the repo for GPT, exactly what to do".
Base: main after PR #38 and the batch PR that adds this file.

## Read first

`AGENTS.md`, `COLLABORATION.md`, `docs/handoffs/2026-10-05-timing-transfer-library.md`, `docs/LESSON_BANK_INTEGRATION_PLAN.md`.

## Rules for this phase

1. **Netlify credits are about 75% used.** `netlify.toml` now skips builds for deploy previews and branch deploys; do not remove that. Batch commits, push only when there is something to verify, and do not open or refresh PRs for work in progress. A merge to main is a production deploy, so merges are batched and coordinated by the owner.
2. **The hold on #24 is lifted** (owner's words, 2026-10-05). Claude integrates; Codex reviews and writes validators; the teacher validates in practice.
3. Reserve exact files in an Issue before any edit. Do not touch files Claude has reserved (below).
4. Do not change timing numbers in `docs/TIMING_DRAFT_REVIEW.md` or `docs/ADAPTATIONS_DRAFT_REVIEW.md`: they are drafts waiting for the owner's approval.

## Files Claude is editing now: do not touch

`hm-build.js`, `hm-data.js` helpers (`EQUIP_CHOICES`, `mainWindow`, `recommendWarm`, `eqAvailList`, timing and games-metadata helpers), `hm-lesson.js`, `hm-know.js` (games view), `hm-lessonbank*.js`, `index.html` (bank card, timing panel), `hm-styles.css` (`.bw-*`, `.gm-*`, `.bank-*`), `sw.js`/`build-standalone.js` registration, `bw.*`/`gm.*`/`ls.*` translation keys.

## Tasks for Codex, in order

### 1. Review the manual builder and the timing model (Issue #19)

Review PR "Manual builder: shared equipment and timing options" and the timing code (`stepRanges`, `fitSteps`, `variantFit`, `warmMinutes`, `mainWindow`, `recommendWarm` in `hm-data.js`). Check:
- sums always add up (steps + overhead + free play = allotted) across durations 18..120 and every format;
- no silent change to a teacher's plan: recommendations apply only on click;
- shared keys `ls.eqAvail` and `ls.timeOpts` survive backup/restore and the native mirror;
- five-language strings, narrow-phone layout, keyboard use.
Output: one comment on #19 with findings (bugs first, then risks). Do not push code changes to Claude's files; propose patches in the comment.

### 2. Archive documents rights audit (document-only)

Audit the 11 old archive documents in `hm-plans.js` (listed in #24). For each: title, organization, URL, license/terms actually observed on the page, reuse status (`reusable`, `link-only`, `unknown`), and what the app currently reproduces (quote, summary, link). Do not assume that free access means reusable content. Output: `docs/ARCHIVE_RIGHTS_AUDIT.md`. Do not edit `hm-plans.js`. If a page cannot be fetched, record that and stop; do not guess.

### 3. Lesson-bank validator (Issue #24, step 2)

Implement the validator described in `docs/LESSON_BANK_INTEGRATION_PLAN.md` ("Validator spec") as `tests/unit/lessonbank.test.js`. Read the data from branch `feat/international-lesson-bank` (read-only) until Claude's integration PR lands, then run it on main. Register nothing else. Output: the test file, plus a short report of counts per sport and language.

### 4. After Claude's integration PR (step 1) lands

Run the validator and the browser suites on main; review the archive card behavior in all five languages (opening a lesson, the missing-language notice, offline); review the list of "המגרש PRO" mentions that Claude will add to the plan doc. Report on #24.

## What not to do

- No new accounts, servers, paid services or API keys.
- No machine re-translation or editing of the imported lesson text.
- No rewrite of the timing model; no second time model for the bank lessons.
- No claim that something is verified on a device unless the owner or a device run says so.

## Done means

Each task has its output file or Issue comment, tests pass locally (`npm test`, relevant browser suites, `node build-standalone.js` with no diff), and a handoff note in `docs/handoffs/` states commands, results and limits.
