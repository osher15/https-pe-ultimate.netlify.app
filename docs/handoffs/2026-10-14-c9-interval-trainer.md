# Handoff — C9 standalone Interval Trainer (2026-10-14)

Branch: `worktree-agent-ab170d5fa6d522d6b`. It was fast-forwarded from `main` @ `531b778` to the store
branch `ccr-f0f0c4fd-ymvjjb` @ `2238de1`, which holds `store-content/`. The work is one local commit,
**not pushed and no PR**. GitHub write access was not used. No Issue reservation was made from this
session. The files this task touches are new and live only under `store-content/tools/interval-trainer/`
plus this handoff.

## What was built

`store-content/tools/interval-trainer/`:
- `interval-trainer.html` (142,934 B): the self-contained app.
- `media/`: 37 rig GIFs, 5,227,644 B.
- `tools/extract-app-data.cjs`: data and translation extractor that reads `hm-app.js` FIT and the app
  dictionaries without changing them.
- `checks/`: the Node checks and the browser pass.
- `shots/`: 6 PNGs.
- `README.md`: details, deviations, media to be drawn and strings that need review.

Owner decisions applied:
- The product is the interval trainer only.
- Neutral "PE Tools" branding.
- Only rig GIFs; all 5 Wikimedia/CDC photos are excluded, checked by SHA-256.
- en default, plus he/ar/ru/es with RTL for he and ar.
- An About panel with a licence placeholder, a privacy note and media credits.
- A safety note with no medical claims.
- Web Audio created only after a gesture; optional speech; wake lock; gym full-screen mode.

No app file, `exercise-gifs/`, `prototypes/`, `package.json`, `tests/` or generated output was changed.

## Commands and results (this worktree)

| Command | Result |
|---|---|
| `node --test store-content/tools/interval-trainer/checks/` | 28/28 pass |
| `node store-content/tools/interval-trainer/tools/extract-app-data.cjs --check` | data block up to date |
| `NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node store-content/tools/interval-trainer/checks/browser.cjs` | 29/29 pass (Chromium 141.0.7390.37, `file://`) |
| `npm test` | 810/810 pass |
| `node build-standalone.js` then `git status --porcelain` | no diff to generated files |

Evidence is headless Chromium plus emulated viewports only. There was no physical device, no iOS
Safari and no audible-audio check.

## Open items for the owner

- Native PE-teacher review of all non-Hebrew strings. 30 new strings and 2 changed strings are
  listed in the README.
- Owner or legal approval of the licence, privacy, safety and media-credit texts.
- Draw rig figures for `gluteb` and `rtwist`, which ship with a placeholder. Consider dedicated
  figures for `wall`, `skip`, `hollow` and `inchworm`.
- A device pass: Android Chrome and iPhone Safari (audio unlock, wake lock, full screen, speech
  voices).
- Decide the delivery format (zip of the HTML plus `media/`). A single-file base64 build would be
  about 7.1 MB, so none is offered.
