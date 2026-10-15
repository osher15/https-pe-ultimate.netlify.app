# C20: Interval trainer as one offline file with cartoon animations

Date: 2026-10-15. Branch: `c20-interval-single-file` (from `ccr-f0f0c4fd-ymvjjb` at `3ab64e4`).
Scope reservation: Issue #59 area, files only under `store-content/tools/interval-trainer/` plus this
handoff. GitHub write access was not used, so the reservation is recorded here only and the board was
not changed. No push, no PR, no merge, no deploy.

## What changed

- New deliverable `store-content/tools/interval-trainer/interval-trainer.single.html` (1,827,001 B).
  It embeds the 47 animated SVGs and the 47 stills from `store-content/exercise-anim/out/` and needs no
  other file and no network. CSP is `default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'`.
- `interval-trainer.html` stays the readable source of truth. Media is now keyed by exercise id.
  Thumbnails (library grid, station list) use the still. Detail dialog, running station and dice use
  the animated SVG in a `<picture>` whose `prefers-reduced-motion: reduce` source is the still. In a
  checkout the source loads the SVGs from `../../exercise-anim/out/`. An image that fails falls back to
  the existing neutral placeholder.
- New `tools/build-single-file.cjs` (`--check` exits 1 if the committed file is stale). Deterministic,
  verifies every SVG against `exercise-anim/out/manifest.json`, fails on a missing animation.
- `tools/extract-app-data.cjs`: removed `NO_MEDIA`, `fig`, `appFig`, `noMedia` (media is by id now);
  `about.media` text changed from "original 3D figures" to "original cartoon-style drawings" in all five
  languages (the old text was wrong for the new media). Data block regenerated.
- Kept unchanged: backup-first delete-all-data flow and restore (the C18 checks still pass), five
  languages, storage key `pe-tools.interval-trainer.v1`, timer/stations/library/dice behaviour.
- Removed `media/` (37 rig GIFs, 5.2 MB) from the tool directory. Nothing references it any more (page,
  checks, README; a repository search found no other reference except historical handoffs). Git history
  keeps the files. `exercise-gifs/` in the app was not touched.
- Checks: `media-coupling.test.cjs` removed and replaced by `animation.test.cjs`; `checks/browser.cjs`
  extended and now runs the single file copied alone into a fresh temp folder. Six screenshots in
  `shots/` refreshed. README updated.

## Gaps check

The trainer lists 47 exercises, equal in ids and order to the app `EX` list (re-extracted from
`hm-app.js` by `tools/extract-app-data.cjs`) and to `exercise-anim/library.json`. All 47 have an
animated SVG and a still. **No gaps.** The former media gaps (`gluteb`, `rtwist`) and the four
approximate figures (`wall`, `skip`, `hollow`, `inchworm`) now have their own animations.

## Commands and results (Chromium 141 headless, Node 22, Linux container)

| Command | Result |
|---|---|
| `node --test store-content/tools/interval-trainer/checks/` | 36 tests, 36 pass, 0 fail |
| `node store-content/tools/interval-trainer/tools/extract-app-data.cjs --check` | `data block up to date` |
| `node store-content/tools/interval-trainer/tools/build-single-file.cjs` (run twice) | both runs: 1,827,001 B, SHA-256 `e28daeee1a9e7ffb8611c68f77f5fca1ac5a737e6a3925aa71bf46a48e57cb3f`, no diff |
| `node store-content/tools/interval-trainer/tools/build-single-file.cjs --check` | `single file up to date` |
| `NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node store-content/tools/interval-trainer/checks/browser.cjs` | 50/50 passed (about 2 min 40 s) |
| `npm test` | 819 tests, 819 pass, 0 fail |

The size is 1.83 MB, below the 2.5 MB budget and near the 1.64 MB estimate (base64-free, URI-encoded at
run time; the JSON-embedded SVG text and the 166 KB page account for the rest).

What the new checks cover:

- Node: ids equal the app list; hashes equal `manifest.json`; embedded SVGs byte-identical to
  `out/`; animated ones contain `<animate>`, stills do not; size < 2.5 MB; two builds identical and
  equal to the committed file; single file equals source plus animation block plus stricter CSP; CSP
  string exact; no network/app-coupling/old-media strings; SVGs load no resource.
- Browser: file from `file://` alone in an empty folder; every non-`file://` request aborted and
  counted (zero attempts) while the library, 47 thumbnails, a detail image and the timer work; the
  page itself is the only request; all 47 detail images decode and move (three frames differ); under
  emulated `prefers-reduced-motion: reduce` all 47 show the still and three frames are identical; no
  placeholders; 47 stills in the grid; the earlier layout, run, language, storage, About and C18
  delete/restore checks still pass.

## Limitations

- Evidence is headless Chromium 141 only (CI-like, desktop and emulated phone viewports). There is no
  physical device, no iOS Safari, no Firefox, no Android WebView evidence. Reduced motion was
  emulated, not set in an OS.
- `<picture>` plus SVG-in-`<img>` motion on real phones, battery or CPU use of running animations,
  and decode time of a 1.8 MB file on slow devices were not measured. Only one animation runs at a
  time (detail, run or dice); lists use stills.
- The animated SVGs are shown with a light background (`#eef3f8`) inside the dark UI (rounded card).
- The single file is generated. A change in the source, the data extractor or `exercise-anim/out/`
  requires a rebuild, otherwise the node check "committed file is current" fails.
- The owner review of the animation drawings (contact sheet, doubts list in the exercise-anim README)
  is still open and was not part of this task.
- `exercise-gifs/` in the app and the C10 integration proposal for the app are untouched.
