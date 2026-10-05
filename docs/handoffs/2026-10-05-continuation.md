# Codex continuation — 2026-10-05

Base: Claude `eb8f1acf84023a2ecd6cd978b759ae457908b2b4`; main observed at `3b5dbcc`.
Branch: `codex/continuation-2026-10-05`.
Reservation: issue #18 comment 5997794273.

## Completed

1. Refreshed branches/open PRs/issues. Main now includes #40 and the two original bank sports. Claude separately added lazy loading in eb8f1ac; it is pending at observation.
2. Carried forward the corrected validator from `e134536` unchanged as `tests/unit/lessonbank.test.js`. The execution environment briefly recovered and `npm test` completed on the new candidate: **667 total, 666 passed, 0 failed, 1 explicit editorial metadata skip**. This supersedes the earlier inability to rerun the correction.
3. Updated live Issues #13, #15, #16, #17, #18, #19, #20, #21, #22, #23 and #24, preserving their implementation specifications. No issue/PR was closed, merged or deployed. #24's title no longer incorrectly says the original plans are held.
4. Reconciled the current delivery map in `docs/ACTION_PLAN_2026-10-03.md` and `docs/GITHUB_TASKS_2026-10-03.md`, preserving the historical inventory.

Only tests/docs are delivered in this branch. No product/data/native file change was made.

## Authorship correction

These lesson plans are original project-authored work developed from research, ideas and insights, then edited in Notion. No outside-source URL or per-plan Notion page/revision is required. Codex withdrew its former source gate; #24 and the coordination map now state that explicitly. The test only offers editorial version/status tracking; draft is an honest valid status. No research citation or human approval is fabricated.

The current default test skip concerns missing per-record version/status, not missing external sources. The global draft banner already discloses pending professional/language/field review. The eleven old archive documents are a separate audit and are not certified by this authorship clarification.

## Lazy-loading review

Source inspection of eb8f1ac:
- index.html loads only the metadata/header eagerly; versioned sport URLs live in data-lb placeholders.
- the service-worker shell precaches the sport URLs; the standalone build still embeds both sport files.
- LESSONBANK.load reuses an in-flight promise, checks for loaded data, and clears rejected promises for retry.
- the bank UI shows loading/error states, re-renders only if the selected sport still matches, and derives available count from declared sports.
- Claude added a URL/build/SW consistency unit test and one index.html browser check.

The source wiring and unit suite pass are **not** a fresh offline/browser acceptance pass.

A new review-only browser probe was attempted for:
1. wait for the real SW/cache, reload offline before opening either sport, then open both from cache;
2. remove only the football cache entry, attempt offline opening, confirm explicit failure, reconnect and reselect to retry;
3. eight concurrent loader calls should produce a single script and leave the other sport untouched;
4. 820×1180 and 1180×820 core views/settings in five languages, checking off-viewport controls while allowing intentionally scrollable tables.

The patch/runner execution transport became unresponsive and shell readback attempts also failed to return. No outcome from this new browser probe is available or counted. The review probe is not included in the published commit because its write/run could not be verified. Full browser/build reruns remain pending when execution recovers; avoid treating the previous candidate's browser evidence as a test of new lazy loading.

## Screen clipping

The current CSS includes a WebKit-touch rule setting input/select/textarea font size to at least 16px and text-size-adjust to 100%. That targets focus-triggered iOS zoom. The supplied home screenshots were reported corrected by the owner. This does not prove every screen/orientation is fixed.

Still required: physical iPad settings/student fields/photo-finish/lesson modal, focus and blur, keyboard dismiss, rotate both ways, verify layout at normal scale and ensure Save/navigation remain reachable. iPhone checks remain separate. No global zoom disabling or native setting was changed by Codex.

## Remaining work for Claude / owner

- R1: fractional target timing fitter hang (previous isolated 10.5-minute call timed out on 16e5623); eb8f1ac does not change hm-data.js.
- R2: compact safety truncation; eb8f1ac does not change its three-line clamp.
- Lazy-loading offline/error/retry and size acceptance; then remaining four authored sports via the deterministic importer.
- Bank-to-editable-copy, class/date assignment, live teaching and optional reflection through existing planner flow.
- Code/QR data transport is still future work; a backup verification code does not itself transmit data.
- Owner physical device/update/share/background/audio/camera checks and real lesson pilot.
- Keep separate component-bank expansion and payments deferred.

The heads of open PRs #26–#33 and #35 are already ancestral to main: code incorporated, PR metadata still open. Do not merge them again. Human/device acceptance is not completed by ancestry or unit tests.
