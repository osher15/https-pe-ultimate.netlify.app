# Task handoff
Date: 2026-10-07
Owner: Claude
Base commit: 243adc0 on ccr-e68b66c8-44gzz9 (includes main 348c1ab, PR #46 merged)
Branch / PR: ccr-e68b66c8-44gzz9; no PR, nothing merged or deployed.
Task / priority / status: #21 item 3 personal collections: implemented, tested, owner review pending.

Reserved files/sections: new hm-collections.js (registered in build-standalone.js SCRIPTS and index.html); hm-data.js (normCollections, colAdd, colRename, colDelete, colToggle, colsOf); hm-know.js (games: collection chips and filter, "Add to collection" button, col:change listener); hm-lesson.js (library row button, bank-modal button, resolvers for plan/bank/game); hm-app.js (one BK_LABELS entry); index.html (#col-modal, #ls-colCard, #ls-bankCol); hm-i18n.js (col.* x29); hm-styles.css; tests/unit/collections.test.js, tests/e2e/collections.e2e.js (+ run.js registration).

Changes and user behavior:
- A collection is a name plus references to games (g), my library plans (p) or bank lessons (b). It stores references only: it never copies or changes the item. Key `col.list`, included in the backup by prefix and labelled in the backup preview.
- "🗂 Add to collection" in the game window, on each library plan row and in the bank lesson window: tick collections or create one and add in one step. Writes happen per click; a failed write reverts the checkbox and shows a message.
- Games page: one chip per collection that holds games (filters the grid); a deleted collection returns the page to "All".
- Lesson page: "My collections" card: expand, open an item (game window, plan loaded into the planner, bank lesson window), remove an item, rename (Enter saves), delete (two taps; items are untouched). A reference to a deleted plan stays and shows "unavailable" until removed.
- Limits: 20 collections, 100 items each, names up to 40 characters, duplicate names refused (case/space folded). Damaged stored data is repaired on read without losing valid parts.
- Five languages for all new strings (author-made, not native-reviewed).

Validation (local): npm test 715/715; browser: collections 3/3, personalcopy 3/3, gameadapt + library21 + lessonbank 16 (with personalcopy 19), i18n15 + backuprestore 23/23; phone-width screenshot of the manager checked; node build-standalone.js twice, no diff. Full run.js not run. No CI, device or native evidence.

Unresolved issues and dependencies:
- The backup test only proves the key lives under the app prefix; a real full backup/restore round trip with a collection was not added.
- Bank lesson titles in collections show "sport · number" until that sport is loaded (lazy load), then the real title.
- Opening a game from the manager goes through the games page (same mechanism as "open game" from a plan).
- Not done: collections of drills/steps, sharing/exporting a collection, ordering items, collection-based assignment to a lesson. Plan export/import (#21 item 6) remains.

Publication status: pushed to the task branch only.
Next owner / next action: owner tries collections on a phone; then decides on plan export/import (item 6).
