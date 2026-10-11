# A1–A4 adversarial self-review — 2026-10-11

Branch: `codex/a1-a4-self-review-2026-10-11`, based on executable local A3 `4a014b3`.
Main freshly fetched: `348c1ab`. Reservation: Issue18 comment6108584210.
No second-party review, merge, deploy, preview, native upload or live data.

## Findings and evidence

1. A1 attribution: the 28-file main diff is not an A1-only change. Exactly 7 paths
have an A1 delta relative to candidate, 21 paths are inherited unchanged. Source
patch `docs/patches/2026-10-11-a1-only.patch` contains only hm-collections.js and
collections.e2e.js; apply-check and application against candidate pass. Build outputs
must be regenerated. Per-file attribution follows below.
2. A1 lifecycle: one module-level `i18n:change` listener, not installed by pick/init.
The app keeps these views in the DOM for the document lifetime; the listener queries
current nodes and creates no observer/timer or retained detached DOM nodes. Repeated
open/close gives one resolver call on language change. Hidden picker stays closed,
drafts/input identity stay intact, focus/selection survive, AR RTL and RU LTR pass.
A single latest picker context remains in the existing module, not a growing leak.
No product fix required. Added one lifecycle regression; collections6/6 pass.
3. A3 is a cumulative main patch, not a patch to apply after candidate/#47. Fresh
main apply-check passes. Independently reconstructed candidate → A1 → #47 source
patches apply. The HE/EN metadata-test correction must accompany #47; omitted from
an incremental recipe, its old draft assertion is stale. Exact correction delivered.
No whole-side conflict resolution. Ordered source assembly also accepts packaging
and offline-registration patches cleanly.
4. A2 scope passes: remote packaging diff has no hm-*, CSS, app HTML/SW or test
changes. Native text edits are package-ID changes; assets/docs are selected scope.
But NATIVE_RELEASE_CHECKLIST lacks separate-ID backup/restore instructions and still
contains historical inventory/CI assertions. Added a bounded migration gate; historical
CI/store statements are not revalidated here. New app installs beside old; verify
backup→restore before removal. No physical migration claim.
5. A4 registration source awaits the child and propagates failed exit/signal/spawn;
upstream harness failure skips probe. No new process-control defect found in review.
Full integration execution is task2; historical passes alone are not current proof.

## Exact 28-file attribution

| File | Attribution |
|---|---|
| `COLLABORATION.md` | Inherited candidate only |
| `Hamegrash.html` | A1 delta on candidate (candidate also contains this path) |
| `build-standalone.js` | Inherited candidate only |
| `docs/OWNER_NEXT_STEPS_2026-10-07.md` | Inherited candidate only |
| `docs/PERSONAL_COPY_DESIGN_2026-10-07.md` | Inherited candidate only |
| `docs/TIMING_DRAFT_REVIEW.md` | Inherited candidate only |
| `docs/handoffs/2026-10-07-codex-next-tasks-2.md` | Inherited candidate only |
| `docs/handoffs/2026-10-07-collections.md` | Inherited candidate only |
| `docs/handoffs/2026-10-07-personal-copy.md` | Inherited candidate only |
| `docs/handoffs/2026-10-07-timing-ranges.md` | Inherited candidate only |
| `docs/handoffs/2026-10-10-collection-repaint.md` | A1 delivery document/artifact |
| `docs/patches/2026-10-10-collection-repaint.patch.gz` | A1 delivery document/artifact |
| `hm-app.js` | Inherited candidate only |
| `hm-collections.js` | A1 delta on candidate (candidate also contains this path) |
| `hm-data.js` | Inherited candidate only |
| `hm-i18n.js` | Inherited candidate only |
| `hm-know.js` | Inherited candidate only |
| `hm-lesson.js` | Inherited candidate only |
| `hm-styles.css` | Inherited candidate only |
| `index.html` | A1 delta on candidate (candidate also contains this path) |
| `sw.js` | A1 delta on candidate (candidate also contains this path) |
| `tests/e2e/collections.e2e.js` | A1 delta on candidate (candidate also contains this path) |
| `tests/e2e/personalcopy.e2e.js` | Inherited candidate only |
| `tests/e2e/run.js` | Inherited candidate only |
| `tests/e2e/stage2.e2e.js` | Inherited candidate only |
| `tests/unit/collections.test.js` | Inherited candidate only |
| `tests/unit/personalcopy.test.js` | Inherited candidate only |
| `tests/unit/stage2.test.js` | Inherited candidate only |

## Commands / evidence

- `git fetch origin`; `git rev-parse origin/main`:348c1ab2d4f069aea7f4640328b7e4f8f30611c3.
- `git diff --name-only 348c1ab codex/collection-repaint-2026-10-10` and
  `git diff --name-only dba3cbe codex/collection-repaint-2026-10-10`: attribution above.
- `git apply --check` for A3 cumulative patch on fresh main:exit0.
- Ordered candidate/A1/#47/packaging/offline source patches:apply-check+apply exit0.
- `npm test`:715/715, no fail/skip on candidate, A1 and final integration.
- `node build-standalone.js` twice; SHA256 comparison exit0, outputs unchanged on repeat.
- `NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node -r /workspace/scratch/56dee9fc55c5/browser-preload.cjs tests/e2e/some.js collections`:6/6.

Browser evidence: synthetic localhost Chromium153 via installed runtime Playwright,
not pinned CI. No new CI, emulation/native compile, physical-device, quota/transfer
or teacher/native-language review. Full suite deferred to task2. Draft timing unchanged.
Residual risk: singleton lifecycle verified under current static DOM architecture,
not hypothetical hot module reload. Store checklist retains historical material;
release policy and device evidence need fresh release-time verification.

Owner next: review OWNER_MERGE_ORDER and the small patches; confirm route only when
ready for eventual integration. Do not apply both the cumulative and incremental routes.
Netlify hold remains through2026-10-22 and beyond until explicit deployment approval.
