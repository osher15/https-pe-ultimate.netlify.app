# A3 — Proposed source integration — 2026-10-10

Local branch: `codex/candidate-integration-2026-10-10`.
Tested source commit: `2f73f7fcfda680bc46562ab92f035adb328d6b43`.
Main/base for review patch: `348c1ab2d4f069aea7f4640328b7e4f8f30611c3`.
Inputs: candidate dba3cbe + A1 fix 5e2837b + PR #47 head 1d72cb9.
Reservation: Issue #18 6099236093; test-only extension 6099308010.
Status: reviewable integration patch, NOT a merge to main or a deployment. Claude unavailable for review.

## Source combination

The local branch combines the sources using `git merge --no-commit --no-ff origin/ccr-e149e84d-s1sw05`. No source conflicts: only index.html, sw.js and Hamegrash.html conflict. The two index and two SW conflict blocks were checked to be identical after removing generated version/cache stamps. Only these stamp blocks were neutralized; all other auto-merged HTML/SW content was retained. Hamegrash.html was removed and rebuilt from accepted combined sources. No whole-side file checkout and no stale generated bundle copied.

All six bank files come from #47's reviewed HE/EN changes. No content expansion or hand edit. Exact source-array extraction verifies all 18 AR/RU/ES arrays byte-identical to current main. Global bank provenance remains draft; Hebrew per-record teacher review is separate from English per-record draft and pedagogical field validation.

## Test mismatch and bounded correction

First requested-suite run: 68 checks, 67 pass, 1 fail in personalcopy. Its hard-coded draft expectation disagrees with owner-approved #47 Hebrew `teacher-reviewed`; the UI already displayed the source metadata correctly. No product change was made for this failure.

After fresh reservation, only the bank-source test in `tests/e2e/personalcopy.e2e.js` was corrected: run both HE and EN, compare copy language/status/version with the actual selected bank record, verify the displayed version and honest status, retain unchanged-bank/source-open and minute assertions. Final affected suite: 4/4 pass.

The other eight suites' results remain valid because no product/generated files changed after their run. Final verified cases: 65 unaffected checks from the first run plus 4 current personalcopy cases = 69 passing cases across the recorded executions. This is NOT claimed as one all-green 69-case run or a full e2e suite.

## Commands/results

```sh
git switch -c codex/candidate-integration-2026-10-10
git -c user.name=Codex -c user.email=codex@openai.com merge --no-commit --no-ff origin/ccr-e149e84d-s1sw05
# Only derived output/version conflicts; guarded stamp normalization described above.
node build-standalone.js
npm test
# 715/715 pass, zero failures/skips.
sha256sum index.html Hamegrash.html sw.js > ../a3-build-hashes-first.txt
node build-standalone.js
sha256sum index.html Hamegrash.html sw.js > ../a3-build-hashes-second.txt
cmp ../a3-build-hashes-first.txt ../a3-build-hashes-second.txt
# Exit 0, second run no diff.
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node -r ../browser-preload.cjs -e 'const h=require("./tests/e2e/harness"); h.run(["collections","personalcopy","gameadapt","library21","lessonbank","i18n15","backuprestore","builder19","stage2"].map(n=>require("./tests/e2e/"+n+".e2e"))).then(n=>process.exit(n?1:0))'
# First run 67/68; exact stale-status failure above.
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node -r ../browser-preload.cjs -e 'const h=require("./tests/e2e/harness"); h.run([require("./tests/e2e/personalcopy.e2e")]).then(n=>process.exit(n?1:0))'
# Final personalcopy 4/4.
npm test
# Final source/tests: 715/715 pass.
node build-standalone.js
sha256sum index.html Hamegrash.html sw.js > ../a3-build-final-first.txt
node build-standalone.js
sha256sum index.html Hamegrash.html sw.js > ../a3-build-final-second.txt
cmp ../a3-build-final-first.txt ../a3-build-final-second.txt
# Exit 0; final second build identical.
git diff --check
# Current edit diff clean. Historical imported #47 Markdown contains
# three intentional trailing double-space line breaks; git apply warns.
git diff --binary origin/main HEAD -- . ':!docs/patches/*' > ../A3-candidate-integration.patch
git worktree add --detach ../integration-apply-check origin/main
git -C ../integration-apply-check apply --check ../A3-candidate-integration.patch
git -C ../integration-apply-check apply ../A3-candidate-integration.patch
# Both exit 0; three inherited Markdown whitespace warnings only.
# Byte comparison of all 37 changed files: exact tested-tree equality.
```

Protected-array check ran the actual six source files from main and the integration tree, extracting `LB.sports.<sport>.<lang>=[...];` blocks for ar/ru/es with an anchored assignment expression. 18/18 exact string equality. No protected-bank editorial changes.

## Evidence and limitations

Browser: installed runtime Playwright plus existing scratch Chromium 153.0.8010.0 override. All contexts use synthetic test data. Backuprestore includes injected write failures, rollback and simulated iOS mirroring: the simulated-native checks are NOT physical iOS tests. Collection tests include actual reload persistence, failed saves/draft retention and language switches. Personal-copy tests retain immutable bank checks and stored history. No live pupil data was used.

NOT run: pinned CI Playwright 1.56.1/Chromium, new CI, full browser suite, native compilation/simulator, Android/iPhone/iPad physical acceptance, teacher timing trial, real-media/share/low-storage. A4 real-index/offline probe is separately reported on main, not claimed as acceptance of this combined branch. PR #44 and #45 are not integrated; their owner scopes remain separate. Device acceptance sheet 2026-10-09 is unchanged and not filled.

Residual risks: pending candidate's behavior is only targeted-tested; timing values remain draft/unreviewed by a teacher. Reviewed HE metadata does not validate all five language drafts or real teaching. PR #44's historical pinned-browser layout failure remains unresolved. Wider regression/owner review are needed before source integration into main.

## Delivery and exact next owner step

`docs/patches/2026-10-10-candidate-integration.patch.gz` contains the source changes, regenerated outputs and input-branch docs against main 348c1ab, excluding binary patch-delivery artifacts. It is 3,351,898 bytes decompressed; SHA-256 accompanies delivery below. The executable integration branch and tested commit exist locally. The same-named GitHub branch is a review-artifact branch (handoff + patch) based on main, NOT the executable integration tree. This avoids publishing a partial source change with stale generated HTML through a connector when direct Git push has no credential.

Owner/Claude: inspect this patch as a whole before applying either pending candidate or #47 separately. Create a fresh source branch at 348c1ab:

```sh
gzip -dc docs/patches/2026-10-10-candidate-integration.patch.gz > /tmp/candidate-integration.patch
git apply --check /tmp/candidate-integration.patch
git apply /tmp/candidate-integration.patch
npm test
node build-standalone.js
node build-standalone.js
```

Run the nine suites with pinned CI Chromium and review candidate/timing/provenance behavior. Owner alone decides main merge/deploy. Do not additionally apply A1 on top: it is already included. Do not re-merge #26–#33/#35: their nine heads were freshly fetched and each passes `git merge-base --is-ancestor <head> origin/main`, despite open PR records.

B–D are not started in this batch: stop at A2's explicit #44 source-scope decision and A4's probe-edit/registration decision, as the owner instructed. C1/C2 remain specifications-first tasks; no reliability/storage/participation/home/tournament product scope was silently implemented. Reservation released after publication.

## Exact patch file list

- `COLLABORATION.md`
- `Hamegrash.html`
- `build-standalone.js`
- `docs/OWNER_NEXT_STEPS_2026-10-07.md`
- `docs/PERSONAL_COPY_DESIGN_2026-10-07.md`
- `docs/TIMING_DRAFT_REVIEW.md`
- `docs/handoffs/2026-10-07-codex-next-tasks-2.md`
- `docs/handoffs/2026-10-07-collections.md`
- `docs/handoffs/2026-10-07-personal-copy.md`
- `docs/handoffs/2026-10-07-timing-ranges.md`
- `docs/handoffs/2026-10-08-lessonbank-he-en-review.md`
- `docs/handoffs/2026-10-09-codex-lessonbank-review-result.md`
- `docs/handoffs/2026-10-09-codex-task-lessonbank-review.md`
- `docs/handoffs/2026-10-10-collection-repaint.md`
- `hm-app.js`
- `hm-collections.js`
- `hm-data.js`
- `hm-i18n.js`
- `hm-know.js`
- `hm-lesson.js`
- `hm-lessonbank-athletics.js`
- `hm-lessonbank-basketball.js`
- `hm-lessonbank-fitness.js`
- `hm-lessonbank-football.js`
- `hm-lessonbank-handball.js`
- `hm-lessonbank-volleyball.js`
- `hm-lessonbank.js`
- `hm-styles.css`
- `index.html`
- `sw.js`
- `tests/e2e/collections.e2e.js`
- `tests/e2e/personalcopy.e2e.js`
- `tests/e2e/run.js`
- `tests/e2e/stage2.e2e.js`
- `tests/unit/collections.test.js`
- `tests/unit/personalcopy.test.js`
- `tests/unit/stage2.test.js`

Decompressed patch SHA-256: `34b6fc5ef4be8d56e48489856227e1ca1075d8892ed11017596dd0f6179bfc41`.
