# Task handoff
Date: 2026-10-07
Owner: Claude
Base commit: 0158ddb on ccr-e68b66c8-44gzz9 (main 070c47e + timing branch commits)
Branch / PR: ccr-e68b66c8-44gzz9; no PR, nothing merged or deployed.
Task / priority / status: #21 item 5 personal editable copy of a lesson + #24 bank-to-editable-copy: implemented, tested, owner review pending.

Reserved files/sections: Issue #21 comment 6045618304. hm-lesson.js (saveLib/updateCopy/undoCopy/bankCopy, library row actions, plan header line), hm-data.js (libSave, libUndo, bankToPlan, bankSectionMinutes), index.html (#ls-update, #ls-bankCopy), hm-i18n.js (pc.* x19), hm-styles.css (.ls-src), tests/unit/personalcopy.test.js, tests/e2e/personalcopy.e2e.js (+ run.js registration). Design: docs/PERSONAL_COPY_DESIGN_2026-10-07.md.

Changes and user behavior:
- Save = new personal copy (never overwrites). A plan loaded from the library and saved again becomes a new copy that remembers its source (`plan.src`).
- "Update my copy" (shown only for a plan tied to a library entry): explicit replace of that entry, previous version kept once, "↩" on the library row restores it.
- Duplicate (⧉) records its source.
- Lesson bank modal: "Create my editable copy" builds a timed plan from the sections (minutes read from "Duration: N minutes" in each section; 3 min and an estimate notice when absent), saves it to the library and loads it into the planner. The bank record is not modified. The plan shows "Based on: title · Bank lesson · version · draft status" and a button to open the original.
- Library full (60): save is refused with a message. Previously the oldest plan was dropped silently on every save/duplicate.
- Failed storage write: message shown, plan stays on screen, no false "saved".
- Assigned and live lessons keep their own snapshot; library updates do not change them.

Validation (local): npm test 699/699; browser: personalcopy 3/3, lessonbank + library21 + builder19 17/17, stage2 14/14 (earlier head) and i18n15 16/16; node build-standalone.js twice, no diff. Full run.js not run. No CI, device or native evidence.

Unresolved issues and dependencies:
- Bank copies do not carry commonErrors, teachingPoints, reflection or other prose sections; the "open the original" button is the way to read them.
- Bank copy phases have no per-step times and use kind-based `k` (warm/main/game/cool) from section names; the live lesson mode treats them like generated phases (not exercised on a device).
- Overlaps PR #46 only in generated files, COLLABORATION.md and the `return {}` line of hm-data.js.
- Personal collections and a readable/importable plan file are still not done (#21 items 3 and 6).
- Translations of pc.* are author-made, not native-reviewed.

Publication status: pushed to the task branch only.
Next owner / next action: owner tries "create my editable copy" from a bank lesson on a phone, edits a step, updates, restores; then decides on collections (item 3) and plan export/import (item 6).
