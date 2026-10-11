# Owner-approved offline probe registration — 2026-10-10

Source branch: `codex/offline-lazy-registration-2026-10-10`.
Base for patch: main `348c1ab2d4f069aea7f4640328b7e4f8f30611c3`.
Reservations: Issue #18 comments 6100104953 and 6100131213.
Owner explicitly approved the selector correction and subsequent registration on 2026-10-10. This supersedes the earlier A4 registration blocker; historical red results are retained in its handoff.

## Changed files

- `tests/review/offline-lazy.e2e.js`: imported prior real-index/SW probe; `.nav` replaces nonexistent `#nav`; comment states registration status. No product/bank edit.
- `tests/e2e/run.js`: after successful normal harness execution, run the standalone probe in an awaited child process, inherit runtime arguments, propagate child nonzero status, termination signal and spawn error. A failed harness never starts the probe.
- This handoff and `docs/patches/2026-10-10-offline-lazy-registration.patch.gz`.

Generated index.html, Hamegrash.html and sw.js are unchanged. Stable identities, grades, language, storage and real data are untouched.

## Exact commands and evidence

```sh
for run in 1 2 3; do
  NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node -r ../browser-preload.cjs tests/review/offline-lazy.e2e.js
 done
# Actual corrected source: 3/3 exit-0 offline/lazy review probe PASS.
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node -r ../browser-preload.cjs -r ../registration-narrow.cjs tests/e2e/run.js
# Actual registered runner, narrowed through a scratch Module._load preload
# to field17 only: 11/11 browser checks, followed by awaited probe PASS, exit 0.
for scenario in failure signal error upstream; do
  PE_REGISTRATION_SCENARIO="$scenario" NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node -r ../registration-failure.cjs tests/e2e/run.js
 done
# 4/4 process-control probes: exit 1 for child status 17, SIGTERM,
# injected spawn error and upstream harness failure; upstream starts no child.
npm test
# 700/700 pass, zero failures/skips.
node build-standalone.js
sha256sum index.html Hamegrash.html sw.js > ../registration-build-first.txt
node build-standalone.js
sha256sum index.html Hamegrash.html sw.js > ../registration-build-second.txt
cmp ../registration-build-first.txt ../registration-build-second.txt
git diff --exit-code -- index.html Hamegrash.html sw.js
git diff --check
# All exit 0; generated outputs unchanged; repeat build deterministic.
```

Scratch preload roles (not dependencies, not repository files): browser-preload supplies the existing Chromium 153.0.8010.0 executable; registration-narrow replaces unselected suite exports with empty suites while keeping field17 and the real harness/child probe; registration-failure substitutes harness/process outcomes only to verify runner exit accounting. These process-control checks are not native tests or product-storage failure evidence.

Browser evidence: real localhost index/SW and fresh synthetic browser storage. Five-language navigation existence and offline/lazy loading pass. Navigation existence is not comprehensive layout acceptance. This does not add cache-removal/reconnect recovery coverage.

NOT run: entire normal browser suite, CI-pinned Playwright 1.56.1/Chromium, native compilation, physical Android/iPhone/iPad, real storage quota failure or live student data. No new CI result reviewed. The full runner should execute the probe last in CI; only its bounded registration path was exercised here.

Residual risk: environment/runtime parity remains; the probe's existing scope is narrower than full offline acceptance. Registration can be reviewed independently of product changes and of the A3 candidate integration patch.

## Netlify hold and next action

Owner reports no Netlify credits until **2026-10-22**. Do not merge to a deployment-linked branch, request a deploy preview, invoke a build/deploy hook or deploy production before that date. This is owner-reported account availability, not verified account telemetry. Credit renewal is NOT merge/deploy authorization; owner approval is still required after that date. No automation or scheduled deployment was created.

Publication: dedicated review branch with `[skip netlify]` commit message, no PR/preview request, no Netlify API. Source test files, handoff and compressed patch are published; the remote test branch is executable, unlike earlier patch-only A1/A3 review branches. No merge/deploy/store upload.

Claude: read Issue #18 and this handoff, review runner accounting, then run `npm test`, builds twice and `npm run test:e2e` using pinned CI Chromium before any eventual source integration. Do not infer physical-device acceptance from these checks. Current device sheet 2026-10-09 remains untouched. Reservation released after publication.
