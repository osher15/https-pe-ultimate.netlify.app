# PE Tools · 20 m Shuttle Run (Beep Test) — standalone tool (task C8)

Version 0.9.0, 2026-10-14. Draft for the PE Tools Store. Not yet ready to list. See "Open items".

`shuttle-run.html` is one self-contained file. All code, styles and the five dictionaries are inline. It makes
no network requests and loads no fonts, CDN files or audio files. Beeps are generated with Web Audio. Open the
file in a modern browser. Start the test with a tap, because browsers only allow sound after a user gesture.

## What it does

- **Protocol (Léger et al. 1988).** By default: 20 m shuttles, level 1 at 8.5 km/h, +0.5 km/h per level,
  levels of about 60 s, up to 18.0 km/h. The shuttle length (20 m, or the adapted 15 m course) and the
  level-1 speed (4.0–10.0 km/h, 0.5 steps) can be changed, as in the app module. A "Modified protocol" badge
  and a warning appear when the level-1 speed is not 8.5 km/h (on either course).
- **Adapted 15 m course (owner decision, 2026-10-14).** 15 m at 8.5 km/h is a supported option, not a
  modified protocol. It shows an "Adapted 15 m course" badge and a short note (not a warning): the course is
  for younger pupils or pupils with disabilities, so they can complete the test at a reasonably good level
  without being eliminated too early; the goal is a positive experience of success. Results are not
  comparable with the 20 m course, and no VO₂max estimate is shown (the Léger equation is for 20 m). The same
  note is in the About panel. `protocolKind(distance, speed)` returns `std`, `adapted` or `mod`.
  Citation shown on screen and in About: Léger LA, Mercier D, Gadoury C, Lambert J. *J Sports Sci*
  1988;6(2):93–101.
- **Schedule.** The `buildSchedule` algorithm is copied from the app's beep-test module (`hm-app.js`,
  section "מודול 1"), including the floating-point order. Shuttle time = distance / speed. Shuttles per
  level = max(2, round(60 / shuttle time)). The Node check compares the output with the app's own
  `BT._test.buildSchedule()` for all 26 settings: they are bit-identical.
  **Deliberate difference from the app:** the app's default start is 8.0 km/h; this tool uses 8.5 km/h, per
  the owner's decision.
- **VO₂max estimate.** The Léger 1988 equation already used in the app:
  31.025 + 3.238·S − 3.248·A + 0.1536·A·S. S is the speed of the level in which the last full shuttle was
  completed (the same input as the app). A is the age, 6–18 (18 for adults). It is labelled "estimate, not a
  medical test". It is shown for the 20 m course only (the app also showed it for 15 m).
- **No norm table.** Nothing is shipped. Teachers can optionally enter up to 6 of their own thresholds
  (label + minimum distance or VO₂max). Each result shows the highest threshold it reaches.
- **Live display.** Big level and shuttle numbers, a countdown to the next beep with a shuttle progress bar,
  time, speed, distance and the VO₂max estimate. There is an optional 0/3/5/10 s get-ready countdown with pips.
- **Audio cues.** Shuttle beep, a triple beep at each level change, a double pip 3 s before each level change,
  and a start tone. All are scheduled ahead on the AudioContext clock (lookahead 0.15 s, 2 s when the tab is
  hidden). Pending tones are cancelled on pause or reset. If the device suspends or interrupts audio while
  the test is running, the test pauses and a notice explains why.
- **Spoken announcements.** Optional, using `speechSynthesis`. Only on-device voices (`localService`) for the
  current language are used. If there is none, nothing is spoken. This avoids network voices.
- **Screen and gym display.** A screen wake lock is requested while running (when available) and requested
  again when the page becomes visible. "Gym display" shows only the board, very large, and requests
  fullscreen (Esc or "Exit display" leaves it).
- **Runners (ad-hoc, optional).** Names or bib numbers typed for this test, one per line (de-duplicated,
  max 60), or numbered lanes (2–20). Tap a runner when they stop, or use the generic drop-out button
  ("Runner N"). Results can be edited (name), deleted, undone, sorted and exported as CSV. The CSV has a UTF-8
  BOM, quoting, and a guard against spreadsheet formulas.
- **Controls.** Start → Pause/Resume → Stop (undo available) → Reset (keeps results; undo available).
  Keyboard: Space = start/pause, Enter = record drop-out. There are no blocking alerts: undo uses toasts, and
  deleting all data needs a second tap.
- **Languages.** en (default), he, ar, ru, es. RTL for he and ar. Numbers are always shown LTR.
- **About panel.** Version, licence placeholder ("Licence terms: to be set by the publisher before sale."),
  citation, the 15 m course note, the VO₂max note, the privacy note, the safety note, "Independent tool. Not
  an official, certified or endorsed test product.", and the translation notice (below).

## Privacy footprint

- Keys: `pe-shuttle.v1` (settings, runner list, results, own thresholds) and `pe-shuttle.v1.lang`.
  `pe-shuttle.v1.corrupt` is written only when stored data cannot be parsed; the unreadable copy is kept there.
- It does not read or write any `peultimate.*` key. It has no roster, class, student card, live lesson or
  grade code. There are no host hooks to the app.
- "Delete all data on this device" removes exactly these keys.
- If storage is blocked or full, the tool still works for the session and shows "Not saved …". CSV export
  still works.
- A reload never resumes a running clock. Results, runners and settings are kept.

## Checks

```sh
node --test store-content/tools/shuttle-run/checks/
NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  node store-content/tools/shuttle-run/checks/browser-shuttle-run.cjs   # SHOTS_DIR=<dir> optional
```

- `checks/shuttle-run.test.cjs` (Node; `checks/index.js` lets `node --test <dir>` find it): **20/20 pass**.
  It covers:
  - the schedule against the app's `BT` module, run read-only from `hm-app.js` in a vm sandbox;
  - hand-computed Léger values;
  - VO₂max values;
  - cue list, snapshot and drop-out semantics;
  - forbidden third-party test-battery names and app branding (in the HTML and in this README);
  - the citation and licence text;
  - the dictionaries: identical keys, placeholders, and every `data-t` / `t('…')` key defined;
  - the 15 m adapted course (`protocolKind`: 15 m / 8.5 = adapted, other start speeds = modified) and its
    note in all 5 languages; the AI translation notice in all 5 languages and in this README, and no
    "pending review"/draft wording;
  - storage that is blocked, full or corrupted, key-prefix isolation, sanitising, CSV, and the runner list.
- `checks/browser-shuttle-run.cjs` (headless Chromium 141.0.7390.37, `file://`, context offline, every
  non-file request aborted and recorded): **37/37 pass**. It covers:
  - 4 viewports (360×740, 390×844, 768×1024, 1366×768) × 5 languages, with the language set through the real
    `<select>`: no horizontal scroll, correct `lang`/`dir`, no raw keys, main controls reachable and ≥ 40 px,
    gym display with digits ≥ 70 px and the drop-out button visible without scrolling;
  - the full flow with a fast test clock: no AudioContext before the Start tap and exactly one after it,
    countdown, level 2 at about 68 s, pause freezes the clock, resume, runner taps, generic drop-out, stop,
    CSV download (content and formula guard), reset, and running to the end of the protocol;
  - reload persistence and delete-all;
  - blocked storage, full storage, and corrupted data;
  - a real-clock smoke test;
  - the 15 m course at 390×844 in all 5 languages: adapted badge, info note instead of the warning, VO₂max
    hidden live and in the results row, and 15 m with another start speed still flagged as modified;
  - the About panel in all 5 languages: translation notice shown, no draft/review wording;
  - zero external requests.
- `shots/`: 6 downscaled screenshots from that run (EN, AR and RU main view; HE, ES and EN gym display).

Evidence limits: one browser engine, headless. There was **no** physical phone or tablet, no iOS Safari, no
audible speaker check of beep timing, no background or locked-screen behaviour, no real phone download or
share sheet, and no projector.

## Open items

1. **Translations.** Every he/ar/ru/es string not listed in `REUSED_FROM_APP` (in the HTML) is
   AI-translated: about 113 of the 142 keys per language. The rest reuse the app's existing wording, lightly
   adapted ("stage" → "level", "student" → "runner"). See "Translation notice" below.
   The Spanish product name ("test de pitidos") and the Arabic one ("اختبار البيب") need a native PE
   teacher's choice.
2. **Device pass (owner).** Android Chrome and iPhone Safari: audio unlock, beep timing against a stopwatch
   over a full test, the silent switch, a locked screen, wake lock, fullscreen (iPhone has no element
   fullscreen; gym display still works without it), and the CSV download or share flow.
3. **Product decisions.** The licence text; the delivery format (zip of HTML, or hosted); the age range 6–18
   for the equation. (15 m: decided — supported as the adapted course, see above.)
4. **Known behaviours.** In the background, scheduling still depends on timers: lookahead is 2 s while the tab
   is hidden, and browsers may throttle more after minutes. Results are capped at 60 per list. Two open tabs
   do not coordinate writes (the last write wins).

## Translation notice

Shown in the About panel in all five languages (owner-approved wording, 2026-10-14):

> Translations were produced with AI. The professional content is accurate and was reviewed by several teachers and checked against Ministry of Education curricula from all angles; small proofreading, syntax or terminology errors are possible.
