# G1/G2b continuation — 2026-10-15, run 8

Scope: `osher15/https-pe-ultimate.netlify.app`, branch `codex/g1-notion-export-pilot-20261014`. No app-code changes, Notion writes, Main changes, merge, or deployment.

## Checked before edits
- Read `AGENTS.md`, `docs/handoffs/2026-10-14-g1-en-complete.md`, prior run-7 handoff, G1 quality gates, manifest builder and diagrams placements.
- Recursive GitHub tree (not capped compare) before and after: **300 lesson exports** and **600 activity exports** already present. In particular EN `DR-024` and `DR-028` exist; **no re-export**.
- `lessons.json`, `activities.json`, `manifest.csv` are **still absent**; full production generator and official validators have not been run on a complete checkout.
- Network retry: `git ls-remote https://github.com/osher15/https-pe-ultimate.netlify.app.git HEAD` still failed with `Could not resolve host: github.com`. TCP probes to known GitHub IPs also failed. Direct GitHub connector reads/writes worked.

## New verified work
1. Notion source-fidelity: fetched `DR-024` and `DR-028` read-only and compared their complete `<content>` blocks with exported Markdown bodies after trimming the terminal newline. **2/2 exact matches**. This does not imply all 600 bodies were compared.
2. G2b BB-01: corrected five-language alt texts for D1 (A2/A3 shown moving, not waiting) and D2 (lower gate, stop in S); D2 geometry and continuous dribble were reconciled with the reviewed local draft. Commit `f81ce76e7602b1b949812d79af66000efcf838d2`.
3. G1 manifest generator now fails on missing source files, wrong language, mismatched IDs, missing provenance, incomplete 300/600 inventory, duplicate identifiers, wrong activity `kind`, and Notion page ID mismatches against `activity-source-index.csv`. Commits `b87f86cdfd89a1ef050ba03df8624ee3bf54700e`, `0fa4473ffbdff6a63a2f16dbf8cec94c70a1881e`.
4. Added `store-content/manifest/test/build-manifest.test.cjs` with a synthetic 300+600 fixture and deterministic/negative-case assertions. Commit `e7326bf21cc704e7cc8ac0b3d1fe163d7243b655`. A **matching local synthetic test** was executed with Node: 1 test passed, 0 failed, including two identical output builds and failures on missing `DR-024`, wrong source page, and wrong kind. The committed test has **not** been executed from a GitHub checkout; distinguish it from the local test.
5. G2b BB-06: added D1 (move, scan, receive) and D2 (closed gate, support pass), both with five-language title/alt and exact EN lesson quote anchors, and added their placement rows. Commits `47ae4c9080093f87f0204a9a32d9dc29889eeac6`, `85886df13415288344738ed4a603e4dbdffb7978`. Independent read-back QA: 2/2 EN anchors matched, 2/2 placements present, all five language fields present, 0 ball-overlap or path-orphan findings. Official C2 validator and renderer **not** run.
6. Read-back static checks on the previously committed 20 scenes: 0 ball-overlap, path-orphan, or missing-language findings. These are limited checks, not official validator passes.

## Verified inventory after commits
- **300** lessons; **600** activities; **22** committed diagram scenes (12 pilot + 10 G2b basketball: BB-01/02/03/04/06, 2 each).
- **0** committed final manifest outputs.
- Latest branch HEAD before this report: `85886df13415288344738ed4a603e4dbdffb7978`.

## Remaining / gates
1. Full checkout: run `node store-content/manifest/check-lessons.cjs`, `check-activities.cjs`, and `node --test store-content/manifest/test/`. Fix only verified metadata problems without rewriting Notion bodies.
2. Run `node store-content/manifest/build-manifest.cjs` twice and compare all three output hashes. Confirm 300+600 rows, body hashes, and any additional schema/legacy requirements with Claude **before** accepting final manifests.
3. Run official `node store-content/diagrams/validate.js store-content/diagrams/scenes --placements store-content/diagrams/placements.csv --en-export store-content/export/lessons/en` and official gallery; visual review and native-language terminology review required.
4. Remaining basketball families: BB-05, BB-07, BB-08, BB-10 (2 scenes each) from the local draft. **BB-05 source inconsistency:** its process mentions filling an empty cone, while organisation says three cones for three players; flag for Claude/teacher review rather than silently declaring a four-cone setup canonical.
5. Do not proceed to another sport before Claude reviews G2b.

All commits include `[skip netlify]`. No merge, deploy, Main edit, Notion edit, or app-code edit.
