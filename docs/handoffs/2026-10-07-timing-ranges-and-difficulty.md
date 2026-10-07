# Task handoff
Date: 2026-10-07
Owner: Claude
Base commit: 070c47e (main)
Branch / PR: ccr-e68b66c8-44gzz9; no PR opened, nothing merged or deployed.
Task / priority / status: #19 timing ranges and lesson lengths (done, field validation pending); #21 item 1 easier/harder adaptations (done for 42 games, translations draft).

Reserved files/sections: hm-data.js (stepRanges, fitSteps, warmMinutes, MAIN_FMT_RANGE, mainWindow); hm-lesson.js (gen time split, automatic main blocks, duration presets); index.html (#ls-dur field); hm-know.js (game `adapt` field + modal section); hm-texts.js and hm-terms.js (new keys only); hm-styles.css (.gm-lv); tests; docs/TIMING_DRAFT_REVIEW.md, docs/ADAPTATIONS_DRAFT_REVIEW.md. Reservation comment on Issue #19.

Changes and user behavior (owner decisions of 2026-10-07):
- Step range = 25% of typical time, rounded to 0.5 min, never more than ±2 min each way (8 -> 6-10). Minimum band 1 min for steps of 1-3 min. Manual `r` can narrow, not widen. Allocated minutes stay whole.
- Round-based variants (station/circuit/round/interval names) cannot be fitted below 8 min in total unless their typical total is shorter (Tabata 7). Same 8-min floor for stations/circuit/AMRAP/EMOM in the manual builder.
- Lesson length presets 45/50/60/90 (no 30). Warm-up <=12, cool-down <=8, game <=15. Without manual sub-topic choice, ceil(main/32) main blocks (max 3) are picked, different from each other. A 90-min lesson gets 2 blocks.
- Games: `adapt:{easy,hard}` for all 42 games, shown as "Difficulty levels" in the game window (inside "More" in compact view). Owner approved the draft table as written; the open questions were resolved with the recommended defaults.

Validation commands and results (local):
- npm test: 692/692.
- node tests/e2e/some.js stage2: 14/14; builder19 + library21 (before the library21 addition): 11/11; library21 after: 5/5.
- node build-standalone.js twice: no diff.
- Not run: the full tests/e2e/run.js (it does not finish in this sandbox within the tool time limit; known browser instability noted in 2026-10-05-session-state.md). CI is the evidence for the full browser suite.

CI / emulation / physical-device evidence: none for this change.

Unresolved issues and dependencies:
- Typical times (t) and the 90-minute split are not validated in a real class.
- en/ar/ru/es adaptation texts are draft translations; native-speaker review pending.
- With narrower ranges a block over ~32 min no longer fits most variants; the surplus becomes the "light game or free play" line (by design).
- Per-step times in the manual builder are still not modeled.

Publication status: pushed to the task branch only.
Next owner / next action: owner reviews on a device; opens PR when ready.
