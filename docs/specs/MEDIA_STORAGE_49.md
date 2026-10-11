# #49 — Media storage visibility and recovery specification

Status: proposal and acceptance tests only; no product implementation. Baseline main348c1ab, inspected2026-10-11. No file-count threshold predicts a crash or usable capacity.

## Current source behavior

- `hm-app.js` REC `openDB` opens `BRAND.idbName`, version1, object store `rec`, keyPath `id`. Records contain id, sport, name/class labels, numeric result, status, source and timestamps, optionally a video File/Blob. These records are distinct from ordinary namespaced localStorage teacher state.
- `dbPut`/`dbDel` currently resolve request success and invoke optional existing sync before transaction completion. A subsequent transaction abort can invalidate the apparent success. `openDB` rejects errors but has no blocked/versionchange handling.
- `sendSub` validates required fields, a120MiB file ceiling and optional duration. It awaits put then refresh, closes and clears the form and announces submission. There is no local recovery catch; each invocation assigns a fresh ID. Browser console rejection is not a useful save error. This source review is not a reproduced real quota failure.
- `wireStorageWarn` reports the localStorage wrapper's health; it is not comprehensive IndexedDB failure reporting. Do not imply its existing banner covers REC transactions.
- `REC.exportAll` uses `HMDATA.planMedia` to budget video bytes. All record metadata remains. Budget omissions become `videoOmitted`; conversion failures become `videoFailed`. The returned `omitted` list contains budget omissions, not all conversion failures; `bytes` is planned allocation, not guaranteed successfully encoded media.
- `bkSnapshotFull` preserves localStorage backup when IndexedDB fails and records `idb.error`. The save notice currently summarizes omitted items as too large. A unified visible coverage summary must distinguish budget, read/encoding and database-unavailable failures.
- The app already has optional external sync/Drive paths. This proposal adds no network integration, service, account, upload, deletion or dependency.

## Smallest visible UI

Add an optional **Storage and backup** row in existing Settings. On explicit open/Refresh show:

1. Media records: N; videos: M; video payload: X MiB (sum finite Blob.size values, including zero-byte files). These are payload bytes, excluding IndexedDB overhead and other app stores.
2. Browser-origin usage: X of Y MiB **estimated**, only if finite, nonnegative usage and positive quota are available. Unknown/unsupported/rejected quota says **Capacity unavailable**. Zero usage is valid. Do not derive localStorage headroom, RAM, guaranteed writable bytes or native filesystem capacity from this estimate.
3. Last successful measurement time; loading/error state distinct from zero records. Do not hold the entire encoded backup in memory to compute usage.
4. **Create backup** reuses the encrypted full backup. No repeated alerts during teaching, startup scan or automatic deletion. A failed media save shows an inline error beside that save action, with Retry and existing export/recovery route.

Native WebView estimate remains labeled browser-origin estimate. Any separately measured native mirror must have a separate label and timestamp; do not add quantities that can overlap.

## Save contract for later implementation

Use a stable pending-record ID from the first attempt until transaction success. Disable only duplicate submission while pending. Resolve on transaction.oncomplete; reject request error/transaction abort/error, exactly once. Run optional sync only after committed success. On failure keep form values, selected File and existing records intact; Retry reuses the ID. Distinguish database unavailable/blocked, quota and unknown failure without promising that deleting a fixed number of files will fix it.

A read/refresh error after a successful commit is **saved, list could not refresh**, not an invitation to duplicate the record. Retry list refresh separately. No saved toast before confirmed commit. Abort late success callbacks after a settled error.

## Backup coverage contract

Before final download/share and on preview show: record metadata count; included video count/actual bytes; omitted video count with per-record ID/teacher-visible label and reason. Reasons: budget limit; read/encoding failed; database inaccessible (count unknown). No private detail on public panels. Keep machine-readable existing flags for backward compatibility. A partial backup is explicitly labeled partial; allow the teacher to save the useful remainder. Never delete originals or claim the unavailable database is empty. Keep report attached to the snapshot so restore can explain missing media.

## Acceptance tests (planned, not executed implementation tests)

| ID | Given / when | Required result |
|---|---|---|
| M01 | Empty database; open panel offline | 0 records/0 videos/0 bytes; capacity unknown if API absent; no network |
| M02 | Mixed metadata-only, zero-byte and large synthetic Blobs | Exact count and payload sum; no file-count safety rule; no encoding to measure |
| M03 | estimate returns usage0/quota1000, missing quota, quota0, NaN, negative, or rejection | Valid zero usage shown; invalid capacity unavailable; errors never become0 capacity |
| M04 | Estimate valid on native shim | Labeled origin estimate, never native free space; simulated evidence labeled |
| M05 | Request success followed by transaction abort | No saved toast/sync/form clearing; prior records unchanged; inline failure |
| M06 | IDB open/error/blocked/write quota failure | Action settles visibly; draft/File preserved; retry enabled; no alert loop |
| M07 | Retry/double-click after failed submission | One committed record with same pending ID, one sync after commit |
| M08 | Commit succeeds, refresh fails | Acknowledge persisted record with refresh error; refresh retry creates no record |
| M09 | Budget excludes one video and encoder rejects another | Metadata for both retained; both listed individually with distinct reasons; included bytes exclude failed encoding |
| M10 | Database inaccessible during full backup | localStorage backup available and explicitly partial; unknown media count; idb.error remains |
| M11 | Backup→reload→restore with omissions | sid/cid, grades, language unchanged; included Blob restored; omissions still explained; originals not auto-deleted |
| M12 | EN/HE/AR/RU/ES,320/390px,keyboard and offline | Localized optional panel and inline error; RTL correct; no overflow or blocked lesson |

Future evidence: injected browser transactions and synthetic blobs first; then physical-device low storage, file selection, encrypted backup/share and recovery. Real student data and device acceptance sheets are outside this task. Teacher/owner reviews copy before product work; no current store policy certification.
