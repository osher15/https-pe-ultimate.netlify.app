# A1 — Collection language repaint — 2026-10-10

Local source branch: `codex/collection-repaint-2026-10-10`.
Base: candidate `dba3cbe6f97205a87922ad84212838113476b484`.
Reservation: Issue #18 comment 6099158381; patch delivery extension 6099227508.
Status: tested reviewable patch; not merged/deployed. Claude review unavailable.

## Changed files

- `hm-collections.js`: `i18n:change` listener updates dynamic manager/picker text and accessible labels in place. Existing Hebrew fallback strings are retained because the Hebrew dictionary is empty. No input replacement, storage write or collection/context reset on language change.
- `tests/e2e/collections.e2e.js`: already-open EN→ES→HE regression, actual input-node identity, expanded item visibility, draft values, reference preservation, picker context, committed reload persistence and injected save failures/retry.
- `index.html`, `Hamegrash.html`, `sw.js`: regenerated from sources.
- This handoff and the compressed patch delivery artifact.

## Commands and results

```sh
# Existing scratch browser binary was truncated and exited SIGSEGV.
# Re-extracted the existing @sparticuz/chromium Brotli asset into scratch;
# no repository dependency, package file, workflow or harness was changed.
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node -r ../browser-preload.cjs -e 'const h=require("./tests/e2e/harness"); const s=require("./tests/e2e/collections.e2e"); h.run([{...s,tests:[s.tests[0]]}]).then(n=>process.exit(n?1:0))'
# BEFORE product edit: exit 1, actual Game, expected Juego.
node build-standalone.js
npm test
# 715/715 passed, zero failures/skips.
sha256sum index.html Hamegrash.html sw.js > ../a1-build-hashes-first.txt
node build-standalone.js
sha256sum index.html Hamegrash.html sw.js > ../a1-build-hashes-second.txt
cmp ../a1-build-hashes-first.txt ../a1-build-hashes-second.txt
# Exit 0: second build produced no diff.
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node -r ../browser-preload.cjs -e 'const h=require("./tests/e2e/harness"); h.run([require("./tests/e2e/collections.e2e")]).then(n=>process.exit(n?1:0))'
# Final: 5/5 passed.
git diff --check
# Passed.
```

Browser evidence: real DOM/storage in Chromium 153.0.8010.0 using installed runtime Playwright and scratch executable override. This is synthetic-data browser evidence, not CI-parity, simulated-native or physical-device evidence. Full browser suite, native build, actual quota failure, touch/keyboard and physical devices were NOT run. Existing broader suites are tested separately in A3.

Residual risk: pinned CI Playwright 1.56.1/its Chromium not available here; new translations reuse existing keys, not native-speaker review. Dynamic title resolvers run again; source/user labels are preserved. An ordinary subsequent collection mutation still follows the pre-existing repaint behavior; this patch only preserves drafts across language changes.

## Patch and exact next step

`docs/patches/2026-10-10-collection-repaint.patch.gz` is a compressed ordinary git diff including rebuilt generated files, against dba3cbe. The executable source branch exists locally. The same-named GitHub delivery branch contains the handoff/patch, rather than a partial source update with stale generated HTML. Direct Git HTTPS publication has no username credential; connected GitHub APIs publish these review artifacts.

Owner/Claude: inspect the patch, create a source branch at dba3cbe, then:

```sh
gzip -dc docs/patches/2026-10-10-collection-repaint.patch.gz > /tmp/collection-repaint.patch
git apply --check /tmp/collection-repaint.patch
git apply /tmp/collection-repaint.patch
npm test
node build-standalone.js
node build-standalone.js
```

Run collections with pinned CI Chromium, review the combined A3 patch before choosing integration. Do not apply this directly to main (collections are pending candidate code). Owner alone decides merge/deploy. Reservation released after delivery; no live data accessed.
