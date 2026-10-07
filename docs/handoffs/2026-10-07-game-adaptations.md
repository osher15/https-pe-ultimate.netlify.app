# Task handoff
Date: 2026-10-07
Owner: Claude
Base commit: 070c47e (main, PR #43 merged)
Branch / PR: claude/game-tasks-variations-jgi3dt / no PR opened (owner merges)
Task / priority / status: #21 authored game adaptations, tasks/medals, teacher's own variations — implemented, tested, awaiting teacher review of the wording
Reserved files/sections: hm-know.js (GAMES + new GAME_ADAPT/TASK_MENU + games modal), hm-data.js (normGameMine/addGameMine/delGameMine only), hm-styles.css (.gm-lv/.gm-tm/.gm-mine*), hm-texts.js (appended block), hm-i18n.js (gm.mine* keys, gm.more), tests/unit/gamesadapt.test.js, tests/e2e/gameadapt.e2e.js (+ registration in run.js). GitHub write access was not used; the reservation lives in this file and COLLABORATION.md.

## Changes and user behavior
- Game window: new "Difficulty levels" block: Easier · Base ("the game as described") · More challenging, for all 44 games. Lines are the wording from docs/ADAPTATIONS_DRAFT_REVIEW.md that the owner reviewed ("קל / בסיס / מאתגר יותר" confirmed); the draft stays "בטיפול" until a teacher approves each line.
- "Tasks and medals" block for 18 games (game-specific, not difficulty levels): Gaga medals 10/20/25 hits (bronze/silver/gold) plus "hit player does a short task and returns"; the same idea adapted to dodgeball, tag, ramzor, lava, four square, 21, mundial, golden cone, etc. A shared short-task menu (push-ups 2–5, squats 5–10, plank 5–15 s, wall sit 5–15 s, star jumps 5–10) is shown only in games whose lines refer to it. Amounts are suggestions; the text says the teacher adjusts and that anyone unable does an easier task or skips.
- "My variations": per game, the teacher types and saves their own variation. Stored locally under `gm.mine` ({gameId:[{id,t}]}), included automatically in the encrypted backup (all namespaced keys are). Max 30 per game, 300 chars; delete needs two taps; a failed write keeps the typed text and shows no "saved" toast.
- New games, with complete rules (combined games keep all their rules): "מחניים זהב" (golden cone + dodgeball: 1 big cone + 4 small, king/goalkeeper with 3 lives (then out, and a new king is declared), three ways to win, a clean catch returns eliminated teammates in order of elimination, optional slow second ball) and "כדור־מכה משולב" (football/basketball/volleyball hybrid; goals only from a teammate's pass, points by body part 1–5). Dodgeball's old one-line twist now points to the full game.
- Compact view keeps how-to-play and safety open; levels, tasks, variations and "my variations" are inside the collapsed section.
- Five languages for every new string (he source + en/ar/ru/es), numerals kept identical across languages (test-enforced).

## Interpretation notes for the owner
- Cones (corrected by the owner): the middle of the court has only a dividing line; each team has its own golden cone and 4 small cones behind it, and its king guards them.
- "slow, non-flowing second ball": read as a large soft ball moved by walking/bouncing, no fast throws.
- Task amounts follow the owner's "2–10 repetitions depending on the exercise"; plank and wall sit are in seconds.
- Medal thresholds other than Gaga's (10/20/25) are my suggestions (5/10/15, 3/6/9, 1/2/3) and need teacher confirmation.

## Validation commands and results
- `npm test`: 700 tests / 700 pass / 0 fail (includes 12 new tests in gamesadapt.test.js and gamesfilter count 44).
- `node build-standalone.js` run; second run to be checked for no diff (see below).
- Browser: `node tests/e2e/some.js gameadapt library21` (see result recorded at the end of this file).

## CI / emulation / physical-device evidence
Unit and desktop-browser only. No phone, tablet or native-device check; the modal on a narrow phone and in Arabic/RTL needs a physical look.

## Unresolved issues and dependencies
- Teacher review of all adaptation wording, medal thresholds and the two new games; native-speaker review of the translations (author-translated, not reviewed).
- Safety question from the draft ("games to leave without adaptations, e.g. tug-of-war, dodgeball") is not answered; all games currently have lines.
- `gm.mine` has no label in the backup preview (shows the raw key, like `gm.fav`).
- Tasks as exercise-for-mistakes is the owner's design; the UI frames them as short optional tasks, but the teacher decides use per class.

## Publication status
Committed and pushed to the task branch only. No PR, merge or deploy.

## Next owner / next action
Owner: review in the app, tell which lines to change. Claude: apply teacher edits (Hebrew source in `GAME_ADAPT`, then matching rows in hm-texts.js), then the remaining #21 items (personal copies, collections, export/import).

## Final results (recorded after the last edit)
- `npm test`: 700 / 700 pass.
- `node build-standalone.js` twice: Hamegrash.html, index.html, sw.js identical (no diff).
- `node tests/e2e/some.js gameadapt library21`: 10/10 passed on the preceding build; `gameadapt` alone re-run on the final build: 6/6. The full `run.js` was not run.
