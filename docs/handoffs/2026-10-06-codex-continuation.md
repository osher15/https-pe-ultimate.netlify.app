# Codex continuation — 2026-10-06

Base: main `070c47ed` (PR #43 merged). Branch: `codex/continuation-2026-10-06`.

## Completed in this batch

- Re-reviewed draft PR #44. Native workflow passed, but browser CI has one reproducible failure: field17 #491 at 390×760 reports `ft-clockBox bottom=1035/760`; the other 623 browser checks passed. This is not the previously documented browser-process flake. Finding recorded on Issue #18; no product CSS edited.
- Package ID evidence on #44 is consistent across inspected Android/Capacitor/iOS locations; repository code search found no old ID but returned `incomplete_results=true`, so this is not claimed as exhaustive proof.
- Store-listing draft contradicts the PR by saying icon replacement is future/not wired while #44 actually replaces icon assets; correct before approval.
- Added an **unregistered** real-index/service-worker lazy/offline probe. It is intentionally not in `tests/e2e/run.js` until a targeted run is green and repeatable. No pass is claimed yet.
- Added blank physical-device acceptance sheet; no invented device results.
- Added fixed-duration timing wording proposal from the existing ⚠ review markers: 41 affected steps across 28 variants, plus Tabata and pyramid protocol guidance. Proposal only.
- Added #23 design notes for score→grade mapping, pupil access/sharing and attendance-day exemptions. Design only.

## Limits / next action

Run `node tests/review/offline-lazy.e2e.js` in an environment with Playwright/Chromium. If stable green, move/register the probe in the normal e2e runner; if it exposes a product defect, report reproduction to Claude without editing reserved lesson-bank/product files. PR #44 remains draft and should not be approved while its browser CI is red. Physical-device rows remain for the owner to execute.
