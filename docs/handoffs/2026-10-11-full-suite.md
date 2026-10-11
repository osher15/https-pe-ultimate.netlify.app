# Full integration suite evidence —2026-10-11 UTC

Branch: codex/full-suite-2026-10-11. Main freshly fetched348c1ab.
Reservation: Issue18 comments6108613958 and6114223488; separate task1 cache-fix reservation6111402990.
Executable source baseline: ef5ef2a (ordered candidate/A1/#47/packaging/offline, plus task1 source cache entry).
The published branch contains that executable integration and the review runner/logs.
No main merge, PR preview, deploy, upload or live student data. Keep [skip netlify].

## Outcome and distinct failure evidence

All67 browser suites/probes completed:650 passed,0 failed,0 not run.
npm test:715 passed,0 failed. A historical independent Node review probe has4 pass/1 fail:
it embeds42 games, but main348c1ab and this integration both contain44. Its assertion was
left unchanged. Therefore the combined evidence below is1369 passed/1 failed, not an
all-tests-green claim. The complete registered browser run and extra browser review are green.

Before the task1 cache correction,65 normal browser suites passed646 checks; the unchanged
offline probe failed with COLLECTIONS undefined. Three separately run historical browser
review checks also passed. sw.js SHELL omitted hm-collections.js although index.html loaded it.
Task1 supplied the one-entry source patch; generated stamps were rebuilt. No test assertion
was changed to make offline pass. The initial failed manifest/log is retained alongside final logs.

## Every suite run (one counts table)

| Suite | Evidence | Pass | Fail | Not run |
|---|---|---:|---:|---:|
| ../review/claude-review.e2e.js | Chromium localhost browser | 3 | 0 | 0 |
| assessmenteditor.e2e.js | Chromium localhost browser | 14 | 0 | 0 |
| assessmentexemptions.e2e.js | Chromium localhost browser | 12 | 0 | 0 |
| assessmentgrid.e2e.js | Chromium localhost browser | 9 | 0 | 0 |
| assessmentpaste.e2e.js | Chromium localhost browser | 9 | 0 | 0 |
| assessmentreport.e2e.js | Chromium localhost browser | 8 | 0 | 0 |
| attendgrade12.e2e.js | Chromium localhost browser | 7 | 0 | 0 |
| audit29.e2e.js | Chromium localhost browser | 12 | 0 | 0 |
| backup.e2e.js | Chromium localhost browser | 10 | 0 | 0 |
| backuprestore.e2e.js | Chromium localhost browser + synthetic storage/file data | 7 | 0 | 0 |
| builder19.e2e.js | Chromium localhost browser | 7 | 0 | 0 |
| classes.e2e.js | Chromium localhost browser | 9 | 0 | 0 |
| clean21.e2e.js | Chromium localhost browser | 17 | 0 | 0 |
| collections.e2e.js | Chromium localhost browser | 6 | 0 | 0 |
| combined23.e2e.js | Chromium localhost browser | 10 | 0 | 0 |
| corrective.e2e.js | Chromium localhost browser | 7 | 0 | 0 |
| coverage10.e2e.js | Chromium localhost browser | 9 | 0 | 0 |
| field17.e2e.js | Chromium localhost browser | 11 | 0 | 0 |
| field20.e2e.js | Chromium localhost browser | 8 | 0 | 0 |
| fieldjourney.e2e.js | Chromium localhost browser | 2 | 0 | 0 |
| finaloverride.e2e.js | Chromium localhost browser | 9 | 0 | 0 |
| focus.e2e.js | Chromium localhost browser | 14 | 0 | 0 |
| gameadapt.e2e.js | Chromium localhost browser | 6 | 0 | 0 |
| groups.e2e.js | Chromium localhost browser | 16 | 0 | 0 |
| hub18.e2e.js | Chromium localhost browser | 10 | 0 | 0 |
| i18n15.e2e.js | Chromium localhost browser | 16 | 0 | 0 |
| identity.e2e.js | Chromium localhost browser | 9 | 0 | 0 |
| identity8.e2e.js | Chromium localhost browser | 18 | 0 | 0 |
| info14.e2e.js | Chromium localhost browser | 8 | 0 | 0 |
| lang30.e2e.js | Chromium localhost browser | 10 | 0 | 0 |
| lead.e2e.js | Chromium localhost browser | 16 | 0 | 0 |
| lessonbank.e2e.js | Chromium localhost browser | 6 | 0 | 0 |
| lessonend.e2e.js | Chromium localhost browser | 14 | 0 | 0 |
| library21.e2e.js | Chromium localhost browser | 4 | 0 | 0 |
| manual.e2e.js | Chromium localhost browser | 9 | 0 | 0 |
| menu.e2e.js | Chromium localhost browser | 6 | 0 | 0 |
| native.e2e.js | Chromium localhost browser + simulated native bridge | 15 | 0 | 0 |
| nav.e2e.js | Chromium localhost browser | 3 | 0 | 0 |
| persistenceharness.e2e.js | Chromium localhost browser | 3 | 0 | 0 |
| personalcopy.e2e.js | Chromium localhost browser | 4 | 0 | 0 |
| pilotpolish13.e2e.js | Chromium localhost browser | 6 | 0 | 0 |
| polish10_5.e2e.js | Chromium localhost browser | 9 | 0 | 0 |
| prep19.e2e.js | Chromium localhost browser | 8 | 0 | 0 |
| prevlesson21.e2e.js | Chromium localhost browser | 6 | 0 | 0 |
| profile.e2e.js | Chromium localhost browser | 10 | 0 | 0 |
| progress.e2e.js | Chromium localhost browser | 12 | 0 | 0 |
| progress11.e2e.js | Chromium localhost browser | 8 | 0 | 0 |
| rename9.e2e.js | Chromium localhost browser | 14 | 0 | 0 |
| reps.e2e.js | Chromium localhost browser | 15 | 0 | 0 |
| rostersync.e2e.js | Chromium localhost browser | 9 | 0 | 0 |
| round3.e2e.js | Chromium localhost browser | 10 | 0 | 0 |
| session.e2e.js | Chromium localhost browser | 14 | 0 | 0 |
| shell16.e2e.js | Chromium localhost browser | 20 | 0 | 0 |
| shell22.e2e.js | Chromium localhost browser | 3 | 0 | 0 |
| stage1.e2e.js | Chromium localhost browser | 1 | 0 | 0 |
| stage2.e2e.js | Chromium localhost browser | 14 | 0 | 0 |
| storage.e2e.js | Chromium localhost browser | 7 | 0 | 0 |
| studentmissing.e2e.js | Chromium localhost browser | 5 | 0 | 0 |
| studentreport.e2e.js | Chromium localhost browser | 7 | 0 | 0 |
| teach.e2e.js | Chromium localhost browser | 14 | 0 | 0 |
| timing.e2e.js | Chromium localhost browser | 25 | 0 | 0 |
| today.e2e.js | Chromium localhost browser | 19 | 0 | 0 |
| topbar.e2e.js | Chromium localhost browser | 7 | 0 | 0 |
| transfer22.e2e.js | Chromium localhost browser | 3 | 0 | 0 |
| update.e2e.js | Chromium localhost browser | 16 | 0 | 0 |
| week.e2e.js | Chromium localhost browser | 14 | 0 | 0 |
| review/offline-lazy.e2e.js | Chromium real index/SW; synthetic data; viewport emulation | 1 | 0 | 0 |
| npm test: tests/unit/*.test.js | Node unit |715|0|0|
| review/timing-library-review.test.js | Node historical review; stale count |4|1|0|
| TOTAL (all listed evidence) | Browser + Node |1369|1|0|

The unit file inventory is: `ambiguous.test.js`, `assessment.test.js`, `assessmentconfig.test.js`, `assessmentgrid.test.js`, `assessmentpaste.test.js`, `assessmentreport.test.js`, `assessmentrequirements.test.js`, `attendgrade12.test.js`, `audit29.test.js`, `backup.test.js`, `backuprestore.test.js`, `classes.test.js`, `closure.test.js`, `collections.test.js`, `corrective.test.js`, `coverage10.test.js`, `finaloverride.test.js`, `gamesadapt.test.js`, `gamesfilter.test.js`, `groups.test.js`, `identity.test.js`, `identitybugs.test.js`, `iosinputzoom.test.js`, `lead.test.js`, `legacy.test.js`, `lessonbank-lazy.test.js`, `lessonbank-products.test.js`, `lessonbank.test.js`, `migration.test.js`, `nextlesson.test.js`, `oneroster.test.js`, `personalcopy.test.js`, `profile.test.js`, `progress.test.js`, `progress11.test.js`, `readside.test.js`, `registry9.test.js`, `rostersync.test.js`, `round3.test.js`, `schedule.test.js`, `scoring.test.js`, `session.test.js`, `stage2.test.js`, `storage.test.js`, `studentreport.test.js`, `translations.test.js`, `uid.test.js`, `xlsx.test.js`.

## Reproduction and browser lifecycle

`tests/review/run-chunked.cjs` enumerates all registered65 e2e suites, any unregistered
e2e files, historical exported review suites and the separate offline probe. Each suite
runs via an unchanged some.js/harness in a fresh child process/browser. No retry of failed
assertions, timeout extension in product, or altered assertion. Three deterministic shards
bound concurrency to three browsers. The final process sessions were discarded across an
environment/turn interruption after49 successful suites; only those completed suites were
retained on the same exact source hashes. Remaining suites ran after explicit PE_RESUME=1.
This is complete chunked coverage, not a single uninterrupted monolithic process.

The old browser-has-been-closed failure cause was NOT identified. No such crash occurred
within any completed final suite. Environment process disappearance is not proof of a
browser crash; the initial offline TypeError is a separate product defect.

For an ordinary environment with installed Playwright/browser, run:

```sh
git fetch origin
test "$(git rev-parse origin/main)" = 348c1ab2d4f069aea7f4640328b7e4f8f30611c3
git switch codex/full-suite-2026-10-11
npm test
node build-standalone.js
sha256sum index.html Hamegrash.html sw.js > /tmp/build-first.sha
node build-standalone.js
sha256sum index.html Hamegrash.html sw.js > /tmp/build-second.sha
cmp /tmp/build-first.sha /tmp/build-second.sha
node tests/review/run-chunked.cjs
node --test tests/review/timing-library-review.test.js
```

The last command is expected to report the recorded stale-count failure. Do not silently
change that assertion. For shards, use PE_SHARDS=3, PE_SHARD=0/1/2 and separate
PE_EVIDENCE_DIR values; PE_RESUME=1 explicitly reuses completed successful results.

Actual browser commands used the preinstalled runtime Playwright and Chromium153 with
--no-zygote and --disable-gpu. The optional committed runtime-browser.cjs provides the
same executable override without an absolute workspace dependency:

```sh
PE_CHROMIUM_BIN=/path/to/chromium PE_CHROMIUM_ARGS='["--no-zygote","--disable-gpu"]' NODE_PATH=/path/to/preinstalled/node_modules node -r ./tests/review/runtime-browser.cjs tests/review/run-chunked.cjs
```

No dependency was added/installed. CI uses its own pinned browser; these local results
are not CI evidence. Final unit/build logs and SHA hashes are in docs/reviews/full-suite-2026-10-11/.
Two builds exited0 with identical generated hashes; no product changes were made by this runner.
Task1 alone supplied the previously reserved SW source fix before the corrected baseline.

## Not run / remaining risk / owner next

Not run: CI workflow dispatch/pinned CI browser; physical devices; OS-native compilation;
real cameras/microphones/quota/share; classroom/teacher/native-language acceptance.
The native suite simulates its bridge; viewport checks are emulation. No physical acceptance
sheet was filled. Later R-T1 timing product changes are outside this integration full-suite run.

Owner next: review task1 cache fix, candidate and merge order; review/authorize any future
correction of the historical42-game assertion. Keep the Netlify hold through2026-10-22;
the date does not authorize deployment. No second-party review or native-review sign-off inferred.

Optional runtime adapter verification: unchanged offline probe PASS with the committed
runtime-browser.cjs and PE_CHROMIUM_BIN/PE_CHROMIUM_ARGS. This supplementary
one-probe verification is excluded from the650 unique browser check count.

Documentation-only completion: the task1 Package-ID migration gate is also present
in this executable integration's NATIVE_RELEASE_CHECKLIST.md. It was applied from
the existing exact task1 source patch; no product/assertion/generated-output change
and no additional tests counted. Source/build hashes remain those recorded above.
