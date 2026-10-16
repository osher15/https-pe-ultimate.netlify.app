# PE Tools Store — product readiness (task C5) — 2026-10-14

Reservation: GitHub Issue #57 (C5: `store-content/reports/product-readiness.md`, `store-content/checks/`;
`prototypes/pe-boards/` read-only). Base: `main` @ `531b778`. Author: Claude (sub-agent C5).
No app source, prototype, generated output, test, workflow or package file was changed. Proposed fixes
are delivered as patch files under `store-content/reports/patches/` and were **not applied**.

This report says what is verified, by which kind of evidence, so that store copy (owner, ChatGPT G4)
does not claim more than that. Read the "Do not claim" list before you write any product page.

## 0. Evidence types used

| Code | Meaning | What it can and cannot prove |
|---|---|---|
| **N** | Node checks with a simulated DOM and storage (`node --test`) | Logic and data handling. Not layout, touch, audio or downloads. |
| **B-desk** | Headless Chromium 141.0.7390.37 (Playwright 1.56.1) at 1366×768, loopback server or `file://` | Rendering, layout, storage behaviour and download *events* in Chromium only. |
| **B-emu** | The same headless Chromium with an emulated phone or tablet viewport (360×740, 390×844, 768×1024; `isMobile`, `hasTouch`, DPR 2) | Responsive layout and hit-testing at those sizes. **Not** a real phone, not iOS Safari, not Android WebView. |
| **S** | Static source analysis (byte counts, keys, dependencies) | Size and coupling estimates only. |
| **NOT DONE** | Physical phone or tablet, iOS Safari, real speaker output, real phone download or share sheet, projector, native packaging, native-speaker or PE-teacher review, field pilot | **No device acceptance is claimed for any product.** |

## 1. Summary

Status values: **Ready to list** = can be sold as is. **Needs work** = exists as a standalone product, with bounded fixes. **Not yet** = still inside the app or not built. Extraction or production is needed first. **Do not sell yet** = a rights, review or data-protection blocker comes before any engineering.

| Product (tentative ILS) | Status | Effort | One-line reason |
|---|---|---|---|
| Tactics / coach board (39) | **Needs work** | S | Standalone. 5 languages. Passes all browser checks. Still missing: licence/about/version, product branding, some untranslated screen-reader labels, a squeezed sport selector in Russian at 360 px, native-speaker review and a device pass. |
| Scoreboard (29) | **Needs work** | S | Standalone. 5 languages. **Bug found:** after a reload the scoreboard stops autosaving. There is a tested patch. Also missing: print layout, licence/about, JSON import and a device pass. |
| Beep test (19) | **Not yet** | M | Lives inside `hm-app.js`. It is coupled to the class roster, fitness-test results and the live lesson. The cues are synthesized with Web Audio (good: no audio files). The FITNESSGRAM® norms and trademark wording need a rights decision first. |
| Single-sport lesson pack (49) | **Not yet** | M (pipeline) + review | The lessons are in the app. Only the Hebrew text is teacher-reviewed; EN/AR/RU/ES are drafts. The pack depends on C2 diagrams, the G1 export, C3 reconciliation and the C6 build. None of these has started. |
| Lesson generator (69) | **Do not sell yet** | L | 167 KB module with 12 app globals and about 2.5 MB of i18n dictionaries. Its content is authored in Hebrew. The timing/equipment work is still in progress. There are curriculum and standards claims. |
| Drill/game/activity pack (39) | **Do not sell yet** | M + review | The activity bank exists only in Notion as an unreviewed draft. It is not in the repo, and its import is still under the AGENTS.md hold, except for preparation work. |
| Fitness tool (59) | **Do not sell yet** (as defined today) | M (trainer) / L (tests) | The name is ambiguous. The *trainer* (timers, circuits, exercise library) needs a CC BY-SA attribution plan and 6.3 MB of GIFs. The *fitness tests* depend deeply on student data and use Ministry of Education norms (rights unclear). |
| Bundle (149) | **Do not sell yet** | — | No component is "Ready to list". |

The planning document is out of date on one point. `docs/handoffs/2026-10-14-store-content-plan.md` still says the "coach board is EN/HE only". On current `main`, the coach board has **five languages** (the 2026-10-11 hardening was merged). The evidence: the Node check "all five coach UI dictionaries have exact key coverage" and the B-emu language pass below.

## 2. Commands run and results (2026-10-14, this worktree)

| # | Command (repository root) | Evidence | Result |
|---|---|---|---|
| 1 | `node --test prototypes/pe-boards/checks/verify-boards.cjs` | N | **38/38 pass** |
| 2 | `NODE_PATH=/opt/node22/lib/node_modules node prototypes/pe-boards/checks/browser-boards.cjs` | B-emu 320/390 px | **22/22 pass** |
| 3 | `node store-content/checks/boards-browser-readiness.cjs` (new, this task) | B-desk + B-emu, loopback and `file://` | **55 pass / 2 fail**. Both failures are real scoreboard bugs (§3.2). Full output: `store-content/reports/boards-browser-result.json` |
| 4 | `BOARDS_DIR=<scratch copy with patch> node store-content/checks/boards-browser-readiness.cjs` | same | **57/57 pass** with `patches/scoreboard-reload-autosave.diff` applied to a scratch copy. Commands #1 and #2, run against the same patched copy: **38/38** and **22/22** |
| 5 | `node store-content/checks/app-tools-extraction-map.cjs --browser` (new) | S + B-emu on generated `Hamegrash.html` | Writes `store-content/reports/app-tools-extraction.json` (§4–§5) |
| 6 | `npm test` | N | **810/810 pass**, 0 fail, 0 skipped |
| 7 | `node build-standalone.js` then `git status --porcelain` | — | Build OK (`Hamegrash.html` 5951 KB). **No diff** to generated files; the only untracked path is `store-content/` |

`boards-browser-readiness.cjs` resolves Playwright locally or through `npm root -g`. It uses the preinstalled
Chromium (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`) and adds no dependency. It exits with code 1 while the two scoreboard bugs are open. Options: `SHOTS_DIR`, `JSON_OUT`, `BOARDS_DIR`.

## 3. Boards (`prototypes/pe-boards/`)

### 3.1 What the browser pass covered (command #3)

| Check | Scoreboard | Coach board |
|---|---|---|
| Layout at 360×740, 390×844, 768×1024, 1366×768 × EN/HE/AR/RU/ES. The language is changed with the real `<select>`, not the API. (40 cases per board) | Pass: no horizontal page scroll; `lang`/`dir` correct (RTL for he/ar); no raw i18n keys; every key control can be scrolled to and hit-tested | Pass, same checks. The quick bar is used on narrow screens and the sidebar on wide ones |
| Persistence across reload | Score, fouls, match ID and language survive. **But see bug 1** | Sport and language survive |
| Export → download event | JSON `match-….json` (713 B, `format: pe-scoreboard-result`). Download from the archive also works | `PE_Coach_Scenario.json` and `PE_Coach_Board.png` (1600×892, a valid PNG). JSON re-import round-trips exactly |
| Import | **None.** There is no file input, so an exported result cannot be re-imported | Validated JSON import; invalid file rejected (existing check #2) |
| Storage getter throws (`SecurityError`) | Renders and works in memory. Shows "Not saved…" with the error style. Toast text is misleading (see bug 3) | Renders. Shows "Browser storage is unavailable. Use Save JSON…" |
| `setItem` quota error | No crash. Shows "Not saved — export a copy before closing" | No crash. Shows the "unavailable" message |
| Print (print media, A4 PDF) | **No `@media print`.** The page prints the dark screen UI with all buttons and any toast: 2 pages, 245 KB | Has print CSS. Prints the court only (title, board): 1 page. Still on a dark background (uses a lot of ink) |
| Offline: `file://` with the context offline | Loads. Exactly 1 request (the file itself) | Same |
| External requests (all runs, loopback) | **None** | **None** |
| Presentation mode | Display mode on. Sound toggle `aria-pressed=true`. No audio output was verified | Demo playback advances (progress 79/1000 after 600 ms). Help dialog opens |
| Size | 52,538 bytes, single file | 84,256 bytes, single file |

Observations from the same pass (they do not make it fail):
- **Small touch targets** (< 40 px) at phone width. Scoreboard: `+1` score buttons 29×46 at 360 px and 32×46 at 390 px. Foul `+` 32×40. Coach: quick-rotate `↻` 31×42.
- **Coach: untranslated accessibility labels** in HE/AR/RU/ES, all read by screen readers in English: "Language", "Sport", "Team for new players", "Blue player count", "Red player count", "Example", "Scenario title", "Interactive coaching court", "Animation progress", "Phase coaching cue". The default scenario title "My coaching scenario" also stays English (it is stored data).
- **Scoreboard: default team names stay English** ("Blue team"/"Red team") after a first-run language switch. That match was created in English. A new match uses translated names. The brand line "SCOREBOARD / 01" and the select's `aria-label="Language"` are English in every language.
- **Coach, Russian at 360 px:** the quick sport `<select>` shrinks to **38 px**, so the sport name is not visible (screenshot `coach-360x740-ru.png`). Cause: `.quick-setup select{flex:1;min-width:0}` next to long Russian button labels. Proposed CSS (tested by injecting it in B-emu): the select is then ≥ 114 px in EN/RU/ES/AR at 320 and 360 px, with no overflow:
  `@media(max-width:900px){.quick-setup{flex-wrap:wrap}.quick-setup select{flex:1 1 8em;min-width:8em}}`
- **The scoreboard's transient toast covers controls** at the bottom of the viewport for about 4.5 s (`#next`, `#undo`, `#finish` at phone width). They can be reached again after the toast closes.
- **Stale in-file claims:** the scoreboard header comment says "19 automated scenarios" (the current Node check has 38). The coach header lists "Browser QA … Hebrew mobile" from an earlier session that this upload did not re-run. Remove or update both before sale.
- Branding: both titles are "PE Ultimate · …" and both headers say "PE ULTIMATE". There is **no licence, terms, ©, version or about** in the visible UI. The version appears only in an HTML comment (coach "v1.0") and in `PEScoreboard.version`.
- The coach file names three public tactics-board projects as "research references (no source code/assets/drills copied)" (two MIT repositories and one user guide). That is fine, but the owner should know before claiming "original".

### 3.2 Bugs found (with exact repro and a proposed patch; not applied)

**Bug 1 — Scoreboard stops autosaving after a same-tab reload (data-loss risk). Severity: high for a paid product.**
Repro (B-emu 390×844, also with `page.goto` to the same URL; not with close-and-reopen):
1. Open `PE_Ultimate_Scoreboard.html` with fresh storage. Tap Blue `+1`.
2. Reload the tab.
3. The new document receives 2 `storage` events. They come from the old document's `pagehide` and `visibilitychange` writes. The new document sets `conflict=true`, and the status shows "Not saved — another tab has changed the board…".
4. Tap Blue `+1` again. The display shows **2**, but `localStorage` still holds **1**. Every later change in this session stays unsaved, although the teacher has only one tab open.

Cause: `pagehide` and `visibilitychange` call `store()` without a condition, even when nothing changed. The browser delivers those writes to the reloaded document as `storage` events, and that document treats them as a second tab.
Fix: `store-content/reports/patches/scoreboard-reload-autosave.diff` (`git apply --check` passes on `main`). It remembers a signature of the last saved state, leaving out the derived `remaining`, which the stored `deadline` already determines. On unload it writes only if something changed. Verified on a scratch copy: commands #1 38/38, #2 22/22, #3 57/57. A storage-event trace shows 0 events reach the reloaded document. Residual risk: if the state really changed in the last moment before a reload (for example a period ended during the unload), the old behaviour can still occur. This was not tested on a physical device.

**Bug 2 — The first-ever open says "Match restored; clock is paused".** The load path calls `store()` first, which sets `revision`, and then shows the "restored" message if `revision` is set. That is always the case. The same diff records `hadSaved` before the first write. The check "first-ever open does not claim Match restored" passes with the patch.

**Bug 3 (low) — Blocked storage reports "Saved data could not be read…".** When the `localStorage` getter throws (private mode or embedded policy), the scoreboard treats this as damaged data. The behaviour is safe, but the text is misleading. Proposal (not in the diff): in the load `catch`, tell `SecurityError` apart from a parse or validation failure, and use the existing `unsaved` text for blocked storage.

### 3.3 Gaps that block sale (boards)

| Gap | Scoreboard | Coach |
|---|---|---|
| Bug 1 and bug 2 (patch ready) | **Blocker** | — |
| Licence / terms / © / support link / version or about panel in the UI | Missing | Missing |
| Product name: "PE Ultimate" in titles and headers (decide on PE Tools Store branding) | Yes | Yes |
| Print layout | Missing (prints the screen UI) | OK (dark background) |
| JSON import of an exported result | Missing (documented) | OK |
| AR/RU/ES/HE translations are AI drafts; native PE-teacher review | Needed | Needed |
| Untranslated accessibility labels | Few | 10 labels |
| Touch targets < 40 px on phones | Score and foul buttons | `↻` |
| Physical phone, tablet and projector pass; iOS Safari blob download (on iOS this usually opens a preview, not a download); real audio (scoreboard horn) | NOT DONE | NOT DONE |
| Delivery format (zip of HTML, how the buyer opens it on a phone, offline after the first open) | Undecided | Undecided |

## 4. Beep test and fitness tool (extraction plan only — nothing extracted)

Numbers from command #5 (S plus the B-emu pass on `Hamegrash.html`, unlocked with the e2e harness teacher code).

### 4.1 Beep test (`BT`, `hm-app.js`, section "מודול 1 — ביפ טסט")

| Item | Finding |
|---|---|
| Code | 26.7 KB JS + 7.8 KB markup (`#view-beep`, 48 DOM ids) + the CSS it uses from `hm-styles.css` (141 KB in total, needs to be subset) |
| Engine | Léger protocol schedule (20 m or custom distance, starting at 8.0 km/h, +0.5 km/h per level, 60 s levels). VO₂max formula `31.025+3.238·v−3.248·age+0.1536·age·v`. FITNESSGRAM® HFZ table for ages 10–18 |
| Audio | **Synthesized with Web Audio** (square-wave `tone()` scheduled on the `AudioContext` clock; level, start and warning cues). **No audio files.** In B-desk, starting the test created 2 oscillators in 10.5 s (the start tone and the first shuttle beep at 9 s; display "1 · 2/7", 20 m, 00:10). Spoken level announcements use `speechSynthesis`, or the native TTS bridge in the Android app. The screen is kept on with a wake lock. **The audible output and its timing on real phones, including background or locked screen, were NOT tested** |
| Storage keys | `peultimate.bt.{age,best,dist,heat,laneMode,laneN,profiles,results,sex,start}` |
| Shared helpers needed | `LS`, `SET`/`saveSet`, `ac`/`AC`, `beep`, `say`, `keepAwake`, `toast`, `ask`, `undo`, `dlCSV`, `esc`, `fmtMS`, `t`, `trUI`, `clsUI`, `H_LOC`, `typingIn` (all small, in `hm-app.js`) |
| **Student-data coupling (must be removed)** | `window.FT.pick` loads a class roster into the "heat list". `window.FT.ingest` and `window.STU.importFromBeep` write results into the class fitness tests and the student cards. `SESSION.active()` gives the live lesson's class (`cid`, `clsSnapshot`). In the standalone version: keep typed names or lane numbers, CSV export and local results; remove roster, class and student-card sync |
| Translations | 36 `data-i18n` keys, all with EN/AR/RU/ES. 91 Hebrew string literals in JS are translated at runtime by the DOM term translator (`hm-i18n.js` 326 KB + `hm-terms.js` 199 KB + `hm-texts.js` 2.04 MB). B-emu: **0 Hebrew text nodes left** in the initial beep view in EN/AR/RU/ES (1390 visible text nodes, including the reference table). A standalone build needs a small extracted dictionary (about 130 strings × 4 languages), not the 2.5 MB runtime. Spoken cues and toasts after interaction were not checked |
| Rights / claims risk | The UI says "FITNESSGRAM®" and "Cooper Institute", with a disclaimer that the app is not affiliated with or endorsed by them. Selling a product that names a registered trademark and reproduces its HFZ thresholds needs owner or legal review. Alternative: present VO₂max and level/shuttle results with neutral wording |
| Estimated effort | **M** (about 2–4 days): copy the engine; a small storage adapter with its own key prefix; strip the roster coupling; extract the dictionary; standalone CSS; tests (schedule, VO₂max, persistence, storage-throws). Then device audio timing tests on Android and iOS (NOT DONE) |
| Risks | iOS audio unlock and background throttling; `speechSynthesis` voices missing per language; drift if the tab is backgrounded (the schedule uses the audio clock, which is good); the trademark claim |

### 4.2 "Fitness tool" — two different things in the app; decide which one is the product

| Candidate | Code | Coupling | Assets / rights | Effort |
|---|---|---|---|---|
| **Fitness trainer** `FIT` (`hm-app.js`, "מודול 4"): interval timer with presets (Tabata, HIIT, EMOM…), circuit generator, 47-exercise library, fitness dice | 36.4 KB JS + 6.6 KB markup. **471 Hebrew literals**, all translated through the 2.5 MB runtime dictionary (B-emu: 0 Hebrew left in the initial view) | Light: `window.GAMES` once. No `peultimate.*` storage keys (settings are not persisted). Audio: Web Audio cues, `speechSynthesis`, wake lock | Uses `exercise-gifs/` (**6.3 MB**): 37 original rig GIFs (project-owned, per `exercise-gifs/CREDITS.md`) and **5 Wikimedia photos**: 4 CC BY-SA 4.0 and 1 public domain (CDC). A paid product must show the attribution and keep those files under CC BY-SA. Or replace them with rig GIFs | **M** |
| **Fitness tests** `FT` (`hm-tests.js`): class test runner, norms, school score, "אות החינוך הגופני" points | 168.7 KB JS + 10.7 KB markup | **Heavy:** `stu.list` (7 uses), `cid` (61), `sid` (13), `SESSION` (14), grades (`grades.examCols`, `grades.periods`), `STU`, `REC`, `HMDATA` (13 functions). Keys: `peultimate.ft.*` (10) + `stu.list` + grades | Norms quoted from Israeli Ministry of Education "אות החינוך הגופני" (תשס״ח/2007). Redistribution rights are unknown. It also processes minors' data, so a privacy review is needed | **L** |

Recommendation: if "fitness tool" means a timer and workout product, extract **FIT** (M). Before that, decide between bundling the CC BY-SA photos with attribution and using only the rig GIFs. Do not sell the fitness-test runner standalone. Its value comes from student records, which AGENTS.md and the privacy posture keep inside the app.

## 5. Lesson generator

| Item | Finding |
|---|---|
| What it is | `hm-lesson.js` (167 KB): `TOPICS` (21 topics × mid/high grade bands, main-part variants with timings and equipment), `WARM`/`COOL` pools, SHAPE America standards mapping, `gen()` (random variant selection weighted by local feedback and recent use). Timing and equipment helpers in `hm-data.js` (`warmMinutes`, `automaticBlockCount`, `variantFit`, `variantEquipConflicts`, `equipConflicts`, `mergeEquip`, `libSave`…; 15 HMDATA functions). Games from `window.GAMES` (`hm-know.js`, 128 KB) |
| Globals it needs | `COLLECTIONS, FT, GAMES, HM, HMDATA, I18N, KNOW, LBUILD, LESSON, LESSONBANK, LESSONDOCS, LIVE` (12). Storage: `peultimate.ls.{eqAvail,feedback,lib,pickGame,recentVariants,target,timeOpts}`, `ft.last`, `gm.open`, `stu.list` |
| Coupling | Start-from-plan opens a live lesson for a class (`cid` 26 uses, `SESSION`, `FT`). Personal library and lesson bank copies. Feedback history |
| Content language | Authored in Hebrew (**1,141 Hebrew literals**). Other languages come from the runtime dictionary: a draft that native speakers have not reviewed (stated in the app's own `set.langHint`) |
| Active development | Per AGENTS.md, Claude owns the "subsequent lesson-builder timing/equipment" work; the unit tests `timing-block-count`, `stage2` are current. A standalone copy would fork code that is still changing |
| Claims risk | "Mapped to standards" and "anchored in the curriculum" are claims that need PE-teacher review |
| Sellable soon? | **No.** Effort **L**: separate topics from app plumbing, ship a reviewed EN content set, remove the class/session paths, add deterministic output for support. Better: sell **generated, reviewed outputs** (lesson packs) first |

## 6. Lesson packs and drill/game/activity pack

| Dependency | Status on 2026-10-14 |
|---|---|
| Lesson content | 6 files `hm-lessonbank-*.js` on `main`: 50 records each = 10 lessons × 5 languages (300 records). `reviewStatus`: **10 teacher-reviewed (HE) + 40 draft per sport**. Some EN `identity` code lines are malformed (plan §1) |
| C2 diagram engine | Not delivered. The sibling worktree has no commits yet. Legend and starter sheet exist only on the unmerged `origin/docs/lesson-diagram-library` @ `7459759` |
| G1 export / G2 scenes (ChatGPT) | Not delivered. No `codex/store-content-2026-10-14` branch is visible |
| C3 reconciliation (lessons) | Not started (needs G1) |
| C4 activity import | Not started (needs G1, G3) |
| C6 pack builder | Not started (needs C2, C3, C4, G2b) |
| Activity bank (80 DR + 24 GM + 16 AC × 5 languages) | **Notion only, not in the repo.** Draft. Corrections were applied in the 2026-10-11 audit; there has been no teacher or native review. AGENTS.md pauses imports. The plan reads the owner's 2026-10-14 instruction as lifting the hold for preparation on branches only |

Lesson pack: **Not yet** (pipeline M after C2/G1/C3/C6, plus EN teacher review). Activity pack: **Do not sell yet** (unreviewed, not in the repo).

## 7. Do not claim (marketing copy, G4)

1. ~~"Tested on phones and tablets" / "works on iPhone / Android"~~. Only headless Chromium with emulated viewports was tested. There has been no device acceptance of any product.
2. ~~"Works offline" for a hosted web version~~. Only verified: an opened HTML file runs without network (`file://`, context offline) and makes no external requests. There is no service worker or install for the standalone boards.
3. ~~"Download / export on any device"~~. Only download *events* in desktop or emulated Chromium were verified. iOS Safari blob downloads and phone share sheets were not tested.
4. ~~"Beep test with accurate audio"~~ or any timing-accuracy claim. Audio is synthesized and scheduled on the Web Audio clock. Output on real speakers, in the background or on a locked screen was not tested.
5. ~~"Official FITNESSGRAM® / Cooper Institute norms"~~, ~~"Ministry of Education standards"~~, ~~"official rules"~~. The scoreboard presets are explicitly "not official competition rules".
6. ~~"Professionally translated" / "native-speaker reviewed"~~. AR/RU/ES (and the EN lessons) are AI drafts. Only the Hebrew lessons are teacher-reviewed.
7. ~~"Saves your games automatically"~~ for the scoreboard until bug 1 is fixed. After that: "saves on this device; export to keep a copy".
8. ~~"Import your results"~~ for the scoreboard. It has JSON export only.
9. ~~"Printable scoreboard"~~. It has no print layout. The coach board prints the court (dark background).
10. ~~"Includes drill/game/activity library"~~ or ~~"diagrams for every lesson"~~. Not in the repo or not built.
11. ~~"Accessible / screen-reader ready"~~. Coach labels are English in other languages, and some touch targets are under 40 px.
12. ~~"Syncs across devices" / "cloud backup"~~. Board data stays in that browser only.
13. ~~"AI lesson generator"~~ as a product. Not extracted, and its output is not reviewed.
14. Do not call the coach demos or court drawings "official" or "to scale". In the file they are "schematic" and "original teaching demonstrations; adapt to the group".

## 8. Recommended next steps (in order)

1. Owner reviews and applies `patches/scoreboard-reload-autosave.diff` on a reserved prototype branch. Then re-run commands #1–#3: 3 is expected to reach 57/57.
2. Boards product shell (S, both): about/version panel, licence and terms link, product branding decision, scoreboard print CSS, coach `aria-label` translations, the quick-select CSS above, and 44 px targets on phones.
3. Physical-device session (owner): Android Chrome and iPhone Safari at phone width; projector or TV; scoreboard sound; JSON and PNG export on each device. Record the results as device evidence, separate from this report.
4. Native PE-teacher review of the board strings in AR/RU/ES/HE.
5. Owner decisions: what "fitness tool" means (FIT trainer recommended); FITNESSGRAM® wording for the beep test; rights for the CC BY-SA photos and the Ministry norms. Only then extract the beep test (M) and FIT (M) into `store-content/` builds, without student-data paths.
6. Lesson and activity packs follow C2 → G1/G2 → C3/C4 → C6 and teacher review, per the store plan.

## 9. Files delivered

- `store-content/reports/product-readiness.md` (this file)
- `store-content/reports/boards-browser-result.json`: output of command #3 (55/2, observations)
- `store-content/reports/app-tools-extraction.json`: output of command #5
- `store-content/reports/patches/scoreboard-reload-autosave.diff`: proposed fix, not applied
- `store-content/reports/shots/` (10 PNGs, downscaled to 360 or 800 px wide, 96-colour, about 440 KB in total): `scoreboard-360x740-{en,ar}`, `scoreboard-print`, `scoreboard-display-1366`, `coach-360x740-{en,he,ru}`, `coach-1366x768-en`, `coach-print`, `coach-export`
- `store-content/checks/boards-browser-readiness.cjs`, `store-content/checks/app-tools-extraction-map.cjs`

Screenshots reviewed by eye (full size, in scratch): scoreboard 360 EN and AR (the "Match restored" toast covers the Start/Next/Edit row; English default team names in AR), print (screen UI printed), display mode 1366. Coach 360 EN, HE and RU (the RU sport selector is collapsed to a chevron), 1366 EN, print (court only), PNG export (court, 1600 px).

## 10. Limitations

Headless Chromium only (one engine, Chromium 141.0.7390.37 via Playwright 1.56.1). There was no WebKit or Firefox run, no physical device, no audible audio and no real file-system download UI. The language check compares visible strings with English and can miss strings that are the same in both languages. The beep-test translation check covers the initial view state only. Effort sizes are estimates: S ≈ ≤1 day, M ≈ 2–4 days, L ≈ 1–2+ weeks. The GitHub Issue #57 board was read (REST) but not modified.

## 11. Owner decisions and rights check — 2026-10-14

**Fitness tool = the interval trainer (`FIT`).** The owner decided this. The fitness-test runner is not a store product.
- The 5 Wikimedia photos in `exercise-gifs/` (4 under CC BY-SA 4.0) are **excluded** from the store build. The
  37 project-owned rig GIFs are used instead (see `exercise-gifs/CREDITS.md`). This avoids share-alike
  obligations on a paid product. Exercises that have only a photo get a rig GIF later, or ship without media.

**Beep test: neutral, no FITNESSGRAM.** The owner asked Claude to check the legal position and decide. What the
public sources show (this is not legal advice):
- **FITNESSGRAM** is a registered US trademark of The Cooper Institute, registration 1358533, registered and
  renewed ([Justia record](https://trademark.justia.com/734/74/fitnessgram-73474929.html)).
- A program guide that reproduces the Institute's notice says FITNESSGRAM® and **Healthy Fitness Zone®** are
  trademarks of The Cooper Institute. It says the material is copyrighted, "not in the public domain", free only
  within school programs, and "cannot be sold or distributed"
  ([guide](https://www.longbranch.k12.nj.us/cms/lib/NJ01001766/Centricity/Domain/466/Teacher%20guide.pdf)). The
  FitnessGram software is now owned by GreenLight Credentials, LLC
  ([Cooper Quarterly 2022](https://uploads-ssl.webflow.com/62cc5493bad4821d71779067/6393513027694b10c991ff18_Q1-Cooper%20Quarterly_Spring2022.DIGITAL.pdf)).
- **The test method is not theirs.** The 20 m multistage shuttle run was published by Léger & Lambert (1982) and
  revised by Léger, Mercier, Gadoury & Lambert, *J Sports Sci* 6(2):93–101, 1988
  ([PubMed 3184250](https://pubmed.ncbi.nlm.nih.gov/3184250/)): start at 8.5 km/h, plus 0.5 km/h every minute.
  "PACER" is Cooper's adaptation within FitnessGram. No PACER registration was found, but the name is strongly
  associated with their product.

**Decision for the store product:**
1. Name it **"20 m Shuttle Run (Beep Test)"** or "Multistage Shuttle Run". Do **not** use "FITNESSGRAM",
   "PACER", "Healthy Fitness Zone"/"HFZ", Cooper's names or logos, and do not say "compatible with", "official" or
   "approved".
2. Implement the **Léger 1988 protocol** with a citation. The app already uses it: start speed + 0.5 km/h per
   level, and VO₂max = 31.025 + 3.238·S − 3.248·A + 0.1536·A·S (`hm-app.js` ~2759, 2788). A method and an
   equation are cited, not copied. Beeps are generated with Web Audio, so no recorded audio is reused.
3. **No FITNESSGRAM/HFZ norm table** (`HFZ` in `hm-app.js` ~2789). The standalone tool shows level, shuttles,
   distance, speed and a VO₂max *estimate*. Teachers may enter their own reference thresholds; none is shipped.
   Peer-reviewed open norms can be added later, after a separate licence check.
4. Copy must say: "estimate based on Léger et al. (1988); not a medical test".

**Same exposure in the PE Ultimate app (not changed here).** The app names FITNESSGRAM® and ships the HFZ
threshold table in the beep-test norms view and in several lesson texts (`hm-app.js` ~2787–3012; `hm-texts.js`
lines 444, 1193, 1631, 2848, 2966). The app is heading to Google Play, so the owner should approve a separate,
reserved app task: neutral wording and removal or replacement of the HFZ table. That task touches shared files
(`hm-app.js`, `hm-texts.js`) and needs its own Issue reservation and review.

## 12. Owner decisions — 2026-10-14 (second set)

1. **Exercise media.** Every exercise in the library, in both the app and the store, gets an **animated drawn
   cartoon figure** (not a real person) that performs the movement correctly, looping in 2–3 seconds. It replaces
   the static rig GIFs and the Wikimedia photos. Pilot task C10 is running (`store-content/exercise-anim/`).
2. **Interval trainer packaging.** Claude chooses. Plan: when the animated figures are available as small
   animated SVGs, ship the trainer as a single self-contained HTML file if it stays under about 4 MB. Otherwise
   ship a folder with `media/`.
3. **Shuttle run, 15 m.** Approved as an adapted course for younger pupils or pupils with disabilities, so they
   can complete the test at a reasonably good level and have an experience of success. No VO₂max estimate at
   15 m (the equation is for 20 m). Task C11.
4. **Licence, privacy and safety texts.** Claude explained the options to the owner. Owner decision pending.
5. **Translations.** Approved without further native-speaker review. The user-facing statement says the
   translations were made with AI, and that the professional content was reviewed by several teachers and checked
   against Ministry of Education curricula, with minor proofreading, syntax or terminology errors possible. This is
   the **owner's statement**; Claude did not verify the teacher review itself.


---
**Update 2026-10-16:** the scoreboard reload-autosave bug (Bug 1) is fixed in commit a1bbc1e (merged on `ccr-f0f0c4fd-ymvjjb`); `patches/scoreboard-reload-autosave.diff` was removed. verify-boards 46/46, browser-boards 49/49, npm test 819/819 (headless Chromium only; no device evidence). Statements above that call the patch "proposed" or "not applied" are historical.
