# Task handoff
Date: 2026-10-13
Owner: Codex / GPT
Base commit: main `fa9f29e0d87ae493cd569955aeb24b39e16500fb`
Branch / PR: `codex/launch-support-completion-2026-10-13` / no PR opened
Task / priority / status: Issue #55 Google Play launch support C1-C5. C1 and C2 completed as evidence reviews; C3 and C5 already present on main; C4 attempted but blocked by browser policy in this execution environment and is explicitly not marked passed.
Reserved files/sections: Issue #55 comment 6144361674; docs/evidence only. No product code, native config, tests, merge, deploy, signing or store submission.

Changes and user behavior:
- Added `docs/reviews/launch-privacy-aab-2026-10-13.md`: complete C1 network/permission/storage/Auto Backup audit, claim/evidence/status table, draft Play Data safety answers, Health apps recommendation, content-rating guidance, and C2 actual AAB inspection.
- Added `docs/reviews/launch-a11y-2026-10-13/README.md`: exact C4 execution attempt and blocker. It intentionally contains no fabricated screenshots or pass claim.
- No app behavior changed.

Validation commands and results:
- Downloaded GitHub Actions artifact from run `38270990317`, artifact id `11757157476`, `pe-ultimate-android-release-unsigned`, 11,874,708 bytes.
- Unzipped artifact and AAB. Actual file: `pe-ultimate-release-UNSIGNED-7af8b4b3-54c8afc.aab`.
- `jarsigner -verify -verbose -certs ...` -> `jar is unsigned.`
- `find <unpacked-aab> -name '*.so'` -> no results.
- `strings base/manifest/AndroidManifest.xml` -> package `io.github.osher15.peultimate`, versionName `1.0-7af8b4b3`, permissions INTERNET/CAMERA/RECORD_AUDIO/MODIFY_AUDIO_SETTINGS, `allowBackup=true`.
- Gradle/workflow evidence at artifact commit: minSdk 24, targetSdk 36, compileSdk 36; release build has no signing config; `versionCode` is `GITHUB_RUN_NUMBER`, therefore run #47 implies versionCode 47 (recorded explicitly as inferred rather than binary-decoded).
- AAB metadata: Android Gradle Plugin 8.13.0; D8 metadata reports min API 24.
- Packaged network grep found Google Drive APIs/GIS, teacher-configured `syncUrl`, Netlify contact endpoint via native bridge, relative `version.json`, and local blob fetch; no XHR/sendBeacon/WebSocket matches.
- Current main Android `res/xml` contains only `file_paths.xml`; no Auto Backup exclusion/data-extraction rules were found.
- Current official Google documentation checked 2026-10-13: target API 36 is required for new mobile apps/updates from 2026-08-31; the artifact meets this. 16 KB guidance applies to API 35+; no app-bundled `.so` exists in this AAB, so no native-library alignment patch is indicated from artifact evidence. Final Play compatibility report remains authoritative.
- C4 environment check: Node Playwright absent; Chromium exists, but organization policy blocked both localhost and `file://`. Therefore the PE Ultimate DOM could not be rendered and no valid C4 screenshots were generated.

CI / emulation / physical-device evidence:
- C2 uses a real GitHub Actions AAB artifact from successful run 38270990317 plus local archive/signature inspection. It is not a signed Play build and not a phone test.
- C1 is source/artifact evidence, not runtime packet capture.
- C3 already exists on main as `docs/DEVICE_ACCEPTANCE_SHEET_2026-10-09.md`; rows are deliberately blank for the owner's real-phone evidence.
- C5 already exists on main as `tools/prelaunch-check.sh`; this task did not modify or rerun it because this environment has no repository checkout. Claude's later integration history records the guard fix/verification separately.
- No physical Android/iOS testing was performed by Codex in this task.

Unresolved issues and dependencies:
1. C4 still needs a normal Playwright/localhost environment: 360x640 + 390x844, 200% root font, 8 screens, screenshots and issue-ready findings.
2. `MODIFY_AUDIO_SETTINGS` is declared but this review did not find a direct app-level call proving why it is required; Claude/native owner should justify or remove only in a separately reserved product/native task.
3. Records sync accepts a configurable URL. Before checking a blanket Data safety answer "data encrypted in transit", require/document HTTPS for that URL or declare the limitation accurately.
4. Android `allowBackup=true` has no exclusions. Current privacy text correctly warns that Android may back up pupil data to the user's Google account. Decide later whether to keep this convenience or add BackupAgent/rules excluding pupil data; that is a product/native decision, not made here.
5. Health declaration: recommended answer is **Health and fitness -> Activity and Fitness**, not "no health features", because the app records fitness/activity measurements and routines even though it is educational and non-medical.
6. Data safety: contact form means the app cannot truthfully choose a global "no data collected" answer. Draft exact answer set is in the review doc; owner must confirm in live Play Console before submission.
7. The inspected AAB is commit `54c8afc`, older than current main `fa9f29e`. A fresh release bundle is required after owner approval so current wipe/privacy/photo-finish changes are included.
8. AAB is intentionally unsigned. Owner still controls upload-key creation/signing/Play App Signing and submission.

Publication status:
- Pushed documentation only to `codex/launch-support-completion-2026-10-13`.
- No merge, deploy, signing, Play Console action or store upload.

Next owner / next action:
- Claude: read `docs/reviews/launch-privacy-aab-2026-10-13.md`, decide whether to change HTTPS enforcement / Android backup rules / `MODIFY_AUDIO_SETTINGS`; do not change them merely because this review flags them.
- Owner: execute the existing C3 sheet on a real Android phone and later sign/upload a fresh AAB.
- Codex/Claude in a normal browser-test environment: finish C4 only, save screenshots, then close Issue #55 when the owner/device items are separately recorded.
