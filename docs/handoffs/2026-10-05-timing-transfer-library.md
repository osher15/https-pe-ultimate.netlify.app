# Task handoff
Date: 2026-10-05
Owner: Claude
Base commit: 3b98fd2 (main after PR #37)
Branch / PR: ccr-3cbe9a9d-h2mvca; #36 and #37 merged by the owner's request; the library work below is a new PR.
Task / priority / status: #19 flexible timing (in progress, teacher review of draft tables pending), #22 transfer design + verification code (step 1 done), #21 library favorites / compact / manual filters (first increment done).

Reserved files/sections:
- #19: hm-data.js (stepRanges/fitSteps/variantFit/warmMinutes/timeOpts), hm-lesson.js (generator timing, weather, short lessons, plan editing), hm-live.js (free-play line), TOPICS timing data (t, r), index.html timing panel, ls.* / gm.* translation keys.
- #22: hm-app.js bkSave/bkFingerprint/bkPreview, docs/DEVICE_TRANSFER_DESIGN.md, bk.* keys.
- #21: hm-know.js games view, hm-data.js parseGameMeta/gameMatches, index.html games filter panel, hm-styles.css .gm-*, gm.* keys.

Changes and user behavior:
- Timing: each step has a typical time (t) and an effective range derived from it (explicit override r). Minutes are fitted inside the range to the allotted time. Teacher controls: class pace, transition length, water break, weather (outdoor only). Leftover time becomes a "light recreational game or free play" line. When game + main activity would not fit (<18 min main) the opening warm-up is cut to a standard 5-minute warm-up and the closing game stays. All 108 variants now have draft timings.
- Transfer: backup files carry a short verification code (SHA-256 prefix of the exact file) shown on creation and in the restore preview. QR/WebRTC pairing is NOT implemented.
- Library: one-tap favorites (gm.fav) with a Favorites tab, compact/full view (gm.compact, safety line always visible), manual filters for grade level, duration, pupil count and no-equipment (gm.flt). Filters are manual; no automatic suggestions.

Validation commands and results (local):
- npm test: 647/647.
- node build-standalone.js: repeated build gives no diff.
- Full browser suite (node tests/e2e/run.js) was 606/606 before the library change; the library suites (library21, 3/3) pass; the full suite is rerun before the PR.

CI / emulation / physical-device evidence:
- CI for #36/#37 passed unit and browser tests; native builds were still queued at merge time. No physical-device evidence; Android/iOS acceptance remains an owner task.

Update (manual builder, #19 remainder): hm-build.js now shares the equipment availability (ls.eqAvail) and time options (ls.timeOpts) with the quick generator; cards, summary and the built plan show a "missing equipment" warning (never blocking); the main part shows an effective window per work format with leftover time as free play; the opening warm-up recommendation (weather, short lesson) is applied only on click; "pick for me" prefers drills whose equipment is available. Tests: unit 2.7/2.8, builder19.e2e.js (7). Format ranges are drafts, listed in docs/TIMING_DRAFT_REVIEW.md.

Unresolved issues and dependencies:
- docs/TIMING_DRAFT_REVIEW.md: timing tables are drafts from reading the text only; teacher approval pending. Some step texts contain explicit minutes that do not change when minutes are fitted.
- Manual builder: per-step times for builder items are not modeled (window is per work format); free-text "other equipment" is not shared with the builder.
- #21 remaining: authored easier/harder adaptations beside each drill (needs reviewed content in five languages; not claimed for every item), personal collections, personal edited copies, export/import of plans, quick rating near Start. Content import (#24): hold lifted; see docs/handoffs/2026-10-05-lessonbank-import.md.
- #22 remaining: pairing transport (see design doc section 4).
- #13: native packaging untouched.

Publication status: merged work is on main; the library increment is on the task branch, PR to follow. No deployment performed by the assistant.

Next owner / next action: owner reviews docs/TIMING_DRAFT_REVIEW.md; Claude continues #21 adaptations after the author/review decision.
