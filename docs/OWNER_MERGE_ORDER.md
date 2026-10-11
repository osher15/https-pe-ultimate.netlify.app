# Owner integration order — proposal, not merge approval

Baseline: main `348c1ab2d4f069aea7f4640328b7e4f8f30611c3`.
Do not merge, deploy, create a preview or upload a store build under this document.
Retain `[skip netlify]` on commits; the owner-reported hold through 2026-10-22
is not automatic approval afterward. Claude/second-party review is still absent.

## Choose one route

The old A3 patch is cumulative against **main only**. Its apply-check passes on
main; applying it after candidate/A1/#47 duplicates those changes. The following
incremental route is the proposed order requested by the owner. Do not combine
the cumulative route with the incremental route. Owner confirms the eventual
merge strategy after reviewing these results; all commands below are local only.

```sh
git fetch origin
test "$(git rev-parse origin/main)" = 348c1ab2d4f069aea7f4640328b7e4f8f30611c3
# Candidate contains inherited source changes; inspect before accepting it.
git switch -c review/owner-ordered-integration dba3cbe6f97205a87922ad84212838113476b484
npm test
node build-standalone.js
node build-standalone.js
# Export the source patches from the published self-review artifact branch.
git show origin/codex/a1-a4-self-review-2026-10-11:docs/patches/2026-10-11-a1-only.patch > /tmp/2026-10-11-a1-only.patch
git show origin/codex/a1-a4-self-review-2026-10-11:docs/patches/2026-10-11-offline-collections-cache.patch > /tmp/2026-10-11-offline-collections-cache.patch
git show origin/codex/a1-a4-self-review-2026-10-11:docs/patches/2026-10-11-pr47-metadata-test.patch > /tmp/2026-10-11-pr47-metadata-test.patch
git show origin/codex/a1-a4-self-review-2026-10-11:docs/patches/2026-10-11-package-migration.patch > /tmp/2026-10-11-package-migration.patch
git apply --check /tmp/2026-10-11-a1-only.patch
git apply /tmp/2026-10-11-a1-only.patch
# Candidate omitted the new core module from SW precache. Source entry only:
git apply --check /tmp/2026-10-11-offline-collections-cache.patch
git apply /tmp/2026-10-11-offline-collections-cache.patch
npm test
node build-standalone.js
node build-standalone.js
git add hm-collections.js tests/e2e/collections.e2e.js index.html Hamegrash.html sw.js
git commit -m 'Apply reviewed A1 repaint slice [skip netlify]'
# PR47 has bank/docs edits and generated stamp changes only in index/SW.
# Regenerate these outputs; never resolve by copying a whole generated side.
git diff --binary 348c1ab 1d72cb9 -- . ':!index.html' ':!Hamegrash.html' ':!sw.js' > /tmp/pr47-source.patch
git apply --check /tmp/pr47-source.patch
git apply /tmp/pr47-source.patch
# Retain A3's exact test correction: source metadata now differs in HE/EN.
git apply --check /tmp/2026-10-11-pr47-metadata-test.patch
git apply /tmp/2026-10-11-pr47-metadata-test.patch
npm test
node build-standalone.js
node build-standalone.js
git diff --binary 348c1ab origin/codex/pr44-packaging-only-2026-10-10 -- . ':!docs/patches/*' > /tmp/packaging.patch
git apply --check /tmp/packaging.patch
git apply /tmp/packaging.patch
# Include the separate release-checklist correction from self-review.
git apply /tmp/2026-10-11-package-migration.patch
npm test
node build-standalone.js
node build-standalone.js
git diff --binary 348c1ab origin/codex/offline-lazy-registration-2026-10-10 -- . ':!docs/patches/*' > /tmp/offline.patch
git apply --check /tmp/offline.patch
git apply /tmp/offline.patch
npm test
node build-standalone.js
sha256sum index.html Hamegrash.html sw.js > /tmp/build-first.sha
node build-standalone.js
sha256sum index.html Hamegrash.html sw.js > /tmp/build-second.sha
cmp /tmp/build-first.sha /tmp/build-second.sha
# Run full browser evidence as documented in task 2, then review before commits/publication.
```

At each step compare hashes across the two builds, as shown for the last step.
Expected unit counts: candidate 715; A1 715; #47 715; packaging 715;
offline registration 715 (zero failures/skips). These are unit counts, not a
promise that browser acceptance is green. All steps rebuild `index.html`,
`Hamegrash.html`, `sw.js` with `build-standalone.js`; the packaging-only and
registration-only steps should not alter those outputs. Native web assembly,
if needed for later native compilation, is `node native/build-web.js`.
A1 targeted suite is now 6 checks; full-browser counts belong to task 2.

The A1-only and metadata-test patches contain source/tests only. They deliberately
omit generated outputs, documentation and inherited candidate changes.
All 18 protected AR/RU/ES bank arrays must remain byte-identical to main.

Task2 exposed an inherited candidate offline defect: hm-collections.js was absent
from SW SHELL. The additional task1 patch adds that source entry; build-standalone.js
regenerates its version and build stamps. The original full browser run is retained
as646 suite checks passed plus one offline probe failure. The final task2 report
records rerun coverage on the corrected integration; no assertion is weakened.
