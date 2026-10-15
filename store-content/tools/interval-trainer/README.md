# PE Tools · Interval Trainer (standalone)

Task C9, 2026-10-14. A standalone interval trainer for PE teachers, extracted from the fitness trainer
module `FIT` in `hm-app.js` ("מודול 4"). It has four tabs: interval timer with presets, class
stations (circuit generator), a 47-exercise library and the fitness dice. It works offline, with no
account, no student data, no class roster and no grades. It is **not connected** to the main app.
No app file, `exercise-gifs/`, `prototypes/`, test, workflow, `package.json` or generated output was
changed. (C20, 2026-10-15: the rig GIFs were replaced by the cartoon animations and a single-file build.)

## Run

Send or open **`interval-trainer.single.html`**: one self-contained file (1,827,001 B). No sibling
folder, no network. All 47 exercise animations and their still images are embedded as SVG and shown
through `data:` URIs. The Content-Security-Policy meta tag allows only inline code and `data:` images.

`interval-trainer.html` is the readable **source of truth**. Opened inside a checkout it loads the same
SVGs from `store-content/exercise-anim/out/`; sent alone it shows placeholders. Do not hand edit the
single file. Edit the source and rebuild:

```sh
node store-content/tools/interval-trainer/tools/build-single-file.cjs          # writes interval-trainer.single.html
node store-content/tools/interval-trainer/tools/build-single-file.cjs --check  # exit 1 if the file is stale
```

The build is deterministic (no timestamp, fixed order, SVG bytes embedded unchanged), so a second run
gives a byte-identical file. It stops if an exercise has no animation or still, or if an SVG differs from
the SHA-256 in `exercise-anim/out/manifest.json`.

## Files

| Path | Size | What |
|---|---|---|
| `interval-trainer.single.html` | 1,827,001 B | **Deliverable.** Generated: source + 47 animated SVGs + 47 stills, CSP `img-src data:` |
| `interval-trainer.html` | 165,722 B | Source: CSS, data block, engine, UI. `window.PE_IT_ANIM` is `null` here |
| `tools/build-single-file.cjs` | — | Builds the single file; `--check` |
| `tools/extract-app-data.cjs` | — | Rebuilds the data block from `hm-app.js` + `hm-terms.js` + `hm-texts.js` (read-only); `--check` exits 1 if stale |
| `checks/*.test.cjs` (+ `index.js`, `_load.cjs`) | — | Node checks |
| `checks/browser.cjs` | — | Headless Chromium pass (runs the single file, copied alone into a temp folder) |
| `shots/*.png` | 6 small PNGs | Screenshots from the browser pass (downscaled) |

The old `media/` folder (37 rig GIFs, 5.2 MB) is removed from the tool directory. Nothing referenced
it any more (the page, the checks and the README were switched to the animations, and a repository
search found no other reference). Git history keeps the files, and `exercise-gifs/rig/` in the app is
untouched.

## Features and behaviour

- **Interval timer:** Tabata 8×20/10 (3:58), Class HIIT 10×30/15 (7:23), EMOM 10 10×45/15 (9:53),
  Strength 3 sets 3×(6×40/20) with 60 s set rest (19:08), and Quick 6×15/10 (2:28). The values are the
  app's `PRESETS`. The schedule rules are the app's `buildPhases()`: 8 s preparation, no rest after
  the last round of a set, and set rest between sets only. The schedule is time-based, so pause,
  resume, skip and stop never drift. Custom values are clamped. The total time is shown.
- **Class stations:** draws 2–12 body-weight stations by focus (mix, strength, aerobic, core,
  mobility) with the app's pool rule. Then it runs a 5 s preparation, the work time per station and
  a changeover between stations. The current station and its animation are shown.
- **Exercise library:** 47 exercises with group filter, muscles, equipment, form cues, common mistakes
  and volume at three levels (easy/intermediate/advanced).
- **Fitness dice:** a random body-weight exercise and an amount (reps, or seconds for timed exercises),
  using the app's amount lists.
- **Audio:** Web Audio beeps and horn. The AudioContext is created only inside a user gesture
  (Start, Roll, Test sound, Sound on, Full screen). Voice uses `speechSynthesis` (toggle). The toggle
  is disabled when the browser has no speech support. A language is never read with another
  language's voice. A screen wake lock is held while a run is active, where the browser supports it.
- **Gym display:** the Full screen button shows a full-viewport panel with a very large timer and asks
  for browser full screen when available. Esc or the button exits. Space pauses or resumes.
- **Languages:** English (default), Hebrew, Arabic, Russian, Spanish. Hebrew and Arabic are RTL.
- **Settings stored locally** under the single key `pe-tools.interval-trainer.v1`: language, sound,
  voice, tab, timer values, station settings and the drawn list, and the library filter. Corrupt or
  hostile values are validated. If storage is blocked or full, the app keeps working in memory and
  shows a short notice. It never writes another key and never reads the app's `peultimate.*` keys.
- **About** panel: version 1.0.0, licence placeholder ("Licence terms: to be set by the publisher
  before sale."), privacy note, offline note, media credits and safety note. The footer carries the
  short safety note. The page makes no medical claims.

### Deliberate differences from the app module

1. Settings persist. The app's FIT keeps none.
2. Stations end on the last work period. The app also ran one extra changeover after the last station.
3. No YouTube "demonstration" link, so nothing leaves the page.
4. The gym programme (AB/ABC/ABCD) is **not included**. It was outside the product scope (timers,
   circuits, library, dice).
5. Pause, Skip, a "remaining" readout, preset total times, a library filter and full screen were added.
6. Circuits and dice use a seeded RNG (mulberry32). The checks verify that a seed always gives the
   same draw.

## Media

Source: `store-content/exercise-anim/` (task C10), own cartoon drawings with no third-party material,
keyed by **exercise id**: `out/svg/<id>.svg` (animated) and `out/still/<id>.svg`. All 47 exercises of
the app's `EX` list have both, so there are no placeholders and no gaps (the former `gluteb` and
`rtwist` gaps and the four approximate figures `wall`, `skip`, `hollow`, `inchworm` now have their own
animations). The Wikimedia/CDC photos are not used.

- Thumbnails (library grid, station list) use the **still** image. 47 running animations at once would
  cost CPU and battery.
- Detail dialog, running station and fitness dice use the **animated** SVG inside a `<picture>` whose
  `prefers-reduced-motion: reduce` source is the still, so the switch follows the setting live.
- An image that cannot be shown falls back to the neutral placeholder.

## Translations

Shown in the About panel in all five languages (owner-approved wording, 2026-10-14; keys
`about.i18nH` / `about.i18n`):

> Translations were produced with AI. The professional content is accurate and was reviewed by several teachers and checked against Ministry of Education curricula from all angles; small proofreading, syntax or terminology errors are possible.

Of the 105 UI strings, 71 are taken verbatim from the app's dictionaries. All 47 exercises (names,
muscles, cues, mistakes), the equipment names and the units also come from the app. The extractor
records the provenance of each string, and `data.test.cjs` re-derives every "app" string from
`hm-terms.js` and `hm-texts.js`. The app's EN/AR/RU/ES are themselves AI-translated.

**Changed from the app (2):** `pre.quick` "Agile/Ловкий/Ágil" became "Quick/Быстрый/Rápido" (the
Hebrew "זריז" here means a short workout). `lvl.medium` "Average/Средне/Regular" became
"Intermediate/Средний/Intermedio".

**New, written for this product (32), AI-translated into the other languages:** `brand`, `app.name`, `ui.lang`,
`ui.about`, `ui.sound`, `ui.voice`, `ui.voiceNA`, `ui.testSound`, `ui.full`, `ui.exitFull`, `t.pause`,
`t.resume`, `t.skip`, `t.paused`, `t.remaining`, `t.custom`, `l.tap`, `l.noMedia`, `l.equip`,
`st.blocked`, `safety.short`, `about.version`, `about.licenceH`, `about.licence`, `about.privacyH`,
`about.privacy`, `about.mediaH`, `about.media`, `about.safety`, `about.offline`, `about.i18nH`, `about.i18n`. The exact texts are in
`tools/extract-app-data.cjs` (`NEW`). The safety, privacy, licence and media texts also need owner or
legal approval.

"Dead bug", "Bird dog", "Hollow hold" and "EMOM 10" stay in English in every language, as in the app.

## Checks

```sh
node --test store-content/tools/interval-trainer/checks/
node store-content/tools/interval-trainer/tools/extract-app-data.cjs --check
node store-content/tools/interval-trainer/tools/build-single-file.cjs --check
NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  node store-content/tools/interval-trainer/checks/browser.cjs      # SHOTS_DIR=… for screenshots
```

- **Animation checks (`animation.test.cjs`):** the trainer's 47 ids equal the app `EX` list and
  `exercise-anim/library.json`; every id has an animated SVG and a still whose SHA-256 matches
  `manifest.json`; the single file embeds all of them unchanged (animated ones contain `<animate>`,
  stills do not); size < 2.5 MB; two builds are byte-identical and equal to the committed file; the
  single file equals the source plus the animation block and `img-src data:`; no network, app or
  old-media strings; the SVGs load nothing.
- **Browser, new in C20:** all 47 detail images render and really move (3 frames differ); the same under
  `prefers-reduced-motion` (still, 3 identical frames); 47 still thumbnails; network blocked (every
  non-`file://` request aborted, zero attempts); the page is the only request; the file runs alone in
  an empty temp folder.
- **Node checks (earlier):**
  - Every preset matches the app's `buildPhases` phase by phase. The checks cover the totals, the
    work/rest counts and custom cases.
  - Runner: pause, resume and skip, including skip while paused.
  - Circuit schedule.
  - Generator determinism, plus invariants over 5 foci × n 2..12 × 200 seeds.
  - Dice.
  - Settings validation.
  - Storage: round trip; blocked getter; throwing getItem/setItem; quota; corrupt JSON (no throw,
    not overwritten on load).
  - Five-language coverage: placeholders, and no Hebrew outside `he`.
  - Every used key exists and no key is unused.
  - Provenance against the app.
  - The AI translation notice in all 5 languages and in this README; no draft/review wording.
  - Media hashes against `CREDITS.md`.
  - No coupling or network strings: `peultimate`, roster, `SESSION`, `FT`, `STU`, `cid`/`sid`,
    `http(s)://`, `fetch`, and similar.
- **Browser (34, headless Chromium 141, `file://`):**
  - Layout: 360×740, 390×844, 768×1024 and 1366×768 × 5 languages × 4 tabs. No horizontal scroll,
    correct `lang`/`dir`, no raw keys, no stray Hebrew, no page errors.
  - A Quick preset run at 40× with pause, resume and skip to the end. No AudioContext before a
    gesture; exactly one after Start.
  - Hebrew set labels and Stop.
  - A station run with skip to the end, the current station highlighted and its figure shown.
  - Gym display mode and Esc.
  - The library: 47 stills load from the embedded data, no placeholders, and the dialog.
  - The dice in Arabic.
  - Reload persistence of language, work time, sound, tab and station list, with only the own key
    used.
  - Blocked `localStorage` (in-memory run and a translated notice).
  - About panel in all 5 languages: translation notice shown, no draft/review wording.
  - Offline `file://`: every request is `file://`.

## Limitations

Only headless Chromium was tested: no physical phone, no iOS Safari, no Firefox. Audible output, real
timing on a locked or backgrounded phone, real full screen and wake-lock behaviour on devices, and
speech voices per language were **not** verified. The timer is time-based and catches up after the
tab is throttled, but cues for phases that pass while the tab is hidden are not replayed. iPhone
Safari has no element full screen, so it uses the CSS display mode only. Translations: see the
notice under "Translations" above.
