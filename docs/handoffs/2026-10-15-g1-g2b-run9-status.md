# G1/G2b continuation — 2026-10-15, run 9

Scope: `osher15/https-pe-ultimate.netlify.app`, branch `codex/g1-notion-export-pilot-20261014`. No Main, merge, deploy, app code, or Notion writes.

## Baseline checked before writing
- Read `docs/handoffs/2026-10-14-g1-en-complete.md` and run-8 handoff, the actual manifest builder and lesson checker, and the diagram validator contract.
- Recursive GitHub tree at `87fc18509b42ea28d254dcfd7b20c2533476ab14`: **300 lesson files, 600 activity files, 22 scene files, 0 final manifests**.
- `DR-024` and `DR-028` were already exported. Their complete bodies were compared with Notion in run 8 (2/2 exact); not re-exported.
- The historical seven G2a warnings were already resolved and reviewed. No duplicate work.

## New saved work
- Committed **six** draft basketball diagrams: `BB-07-D1/D2`, `BB-08-D1/D2`, `BB-10-D1/D2`; added their six rows to `store-content/diagrams/placements.csv`.
- Commit: `7c0d4faf498611b971bcc8de9636090425998d96` — `G2b: add BB-07, BB-08, BB-10 draft diagrams [skip netlify]`.
- All six exact English anchor excerpts matched their relevant EN lesson text **before** the commit. Five non-empty language titles and alts per scene, in-bounds object coordinates, and no ball/player number overlap were checked.
- Read-back checks of all **18 basketball scenes** (BB-01/02/03/04/06/07/08/09/10): section-specific EN quote matches, five-language text, no ball overlap or orphan movement/dribble path; all passed. For the six newly added scenes, placements also matched.
- Independently checked the remaining **10 pilot scenes** (AT-04, FB-07, FIT-04, HB-07, VB-05): section-specific EN quote matches, five-language text, placements, no ball overlap or orphan movement/dribble path; all passed.
- Combined targeted static checks: **28 scenes, 0 findings**. These are limited GitHub-read-back checks, **not** execution of the official Node validator, renderer, or full visual QA.

## Open and blocked
1. **BB-05 (two draft scenes) is held**, not silently committed. EN source says three cones for three players but also instructs filling an empty cone. The local draft depicts a fourth cone; teacher/Claude must decide how to resolve this pedagogical ambiguity. A second diagram for 3v1 exists locally but the family is kept together for review.
2. A visual review of the local preview suggests BB-08-D2's upper-gate intention and resulting redirected path could be made clearer. The official SVG gallery is still required before acceptance.
3. `lessons.json`, `activities.json`, `manifest.csv` remain ungenerated. The official Node validators and builder have not run on a complete 900-file checkout. Earlier synthetic generator tests do not prove production success.
4. Container `git ls-remote` still fails with `Could not resolve host: github.com`; GitHub connector read/write works. No reliable complete checkout was obtained.
5. G2b must stop after basketball pending Claude visual and native terminology review. No work on another sport.

## Next actions
- Obtain an executable full checkout, run `node store-content/manifest/check-lessons.cjs`, `check-activities.cjs`, `node --test store-content/manifest/test/`, and `node store-content/manifest/build-manifest.cjs` twice; verify 300+600 and deterministic hashes before committing generated manifests.
- Resolve BB-05 three-cone versus empty-cone ambiguity with teacher/Claude, then complete the two scenes and official diagram validator/gallery.
- Keep all new commits on the task branch with `[skip netlify]`. Do not claim G1/G2b complete until the actual checks pass and Claude reviews.
