# A4 — Offline lazy-load probe — 2026-10-10

Branch: `codex/offline-lazy-probe-2026-10-10`, main base `348c1ab2d4f069aea7f4640328b7e4f8f30611c3`.
Reservation: Issue #18 comment 6099250800.
Status: registration withheld; probe assertion defect reproduced. No product defect established, no lesson-bank edit, no merge/deploy or live data.

## Files

- `tests/review/offline-lazy.e2e.js`: exact unchanged probe from `codex/continuation-2026-10-06` (not on main).
- This handoff and compressed patch.
- `tests/e2e/run.js` NOT changed: user's green/stable registration condition is not met by the unchanged probe.

## Evidence

The unchanged probe ran three times against real index.html/service worker in fresh Chromium contexts. All three exit 1 at `nav missing he 820x1180`. The prior assertions completed: offline reload, first two sports present after lazy load, concurrent loading of an additional sport with exactly one script.

Cause is in the probe: it queries `#nav`. Main's navigation is `<div class="nav">`, with `#areaTabs` separately; no `id="nav"` exists. This assertion cannot pass against the inspected main and does not demonstrate missing product navigation.

A scratch-only in-memory experiment replaced exactly `page.locator("#nav")` with `page.locator(".nav")`. Three fresh runs passed `offline/lazy review probe PASS`. Original checked-in probe bytes were not modified. This separates a probe-selector error from an observed product failure. These experimental green results are NOT reported as green results for the unchanged probe or runner registration.

## Exact commands/results

```sh
git show origin/codex/continuation-2026-10-06:tests/review/offline-lazy.e2e.js > tests/review/offline-lazy.e2e.js
# Exact import from prior handoff branch.
for run in 1 2 3; do
  NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node -r ../browser-preload.cjs tests/review/offline-lazy.e2e.js
 done
# Three exit-1 results at the same obsolete selector; no registration.
```

Scratch experiment, run three times without writing the transformed source:

```sh
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node -r ../browser-preload.cjs - <<'JS'
const fs=require('fs'),path=require('path'),Module=require('module');
const f=path.resolve('tests/review/offline-lazy.e2e.js');
const m=new Module(f,module);m.filename=f;m.paths=Module._nodeModulePaths(path.dirname(f));
const code=fs.readFileSync(f,'utf8').replace('page.locator("#nav")','page.locator(".nav")');
m._compile(code,f);
JS
# Three exit-0 PASS results for the experimental selector correction only.
npm test
# 700/700 pass, zero failures/skips.
node build-standalone.js
sha256sum index.html Hamegrash.html sw.js > ../a4-build-hashes-first.txt
node build-standalone.js
sha256sum index.html Hamegrash.html sw.js > ../a4-build-hashes-second.txt
cmp ../a4-build-hashes-first.txt ../a4-build-hashes-second.txt
git diff --exit-code -- index.html Hamegrash.html sw.js
# Exit 0; no generated change.
```

Runtime: installed Playwright, Chromium 153.0.8010.0, scratch executable preload. Browser evidence uses synthetic storage and localhost SW; no runtime dependency added. Not a physical-device result. CI-pinned Chromium, native build/share, full browser suite, cache-removal/reconnect failure paths, real quota/low-storage and actual tablet layout were NOT run. The viewport portion checks navigation existence only; it is not full layout acceptance. No device sheet was filled.

## Exact next step / owner decision

Approve the one-selector probe correction before registering under the requested registration-only scope. The probe is a standalone self-running process, not a harness suite export: registration must launch it after successful normal harness execution, propagate nonzero exit status, and await completion; a bare `require` would start an unawaited process and provide unreliable accounting.

On the corrected-source branch, rerun three times with CI-pinned Chromium. Register only after stable green, run the registered path and verify error propagation. Do not register this unchanged copy. Additional cache-removal/reconnect recovery coverage remains a separate test improvement, not a proven product defect. Owner/Claude decides whether to authorize that probe edit now. Review patch against main; reservation released after delivery.
