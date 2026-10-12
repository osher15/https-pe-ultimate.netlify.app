# Codex handoff — 2026-10-12 C5 prelaunch regression guard

Scope: `tools/prelaunch-check.sh` only; dedicated branch `codex/prelaunch-guard-2026-10-12`. Owner retains merge/deploy control. No product/native files edited.

Created a fail-closed Bash script running `npm test`, two `node build-standalone.js` builds with SHA-256 comparison of `index.html`, `Hamegrash.html`, `sw.js`, `node native/build-web.js`, and a recursive grep for the obsolete `app.netlify.peultimate` in native configuration. Invoke from repo root using `bash tools/prelaunch-check.sh` (no executable-bit requirement).

**Evidence:** GitHub commit saved; commands were **not executed** in this session because the connected GitHub tool provides file operations rather than a checked-out runnable repository. Do not mark C5 verified until the command runs in CI or locally and its exit code/output are captured. The script does not validate Android AAB signing, actual device behavior or store declarations.

Other completed work: C3 physical acceptance sheet saved on `codex/launch-device-sheet-2026-10-12` (commit `fc332d7`), with 12 device checks and three 20 m photo-finish comparisons; no physical test claimed.

Review note from C1 preliminary inspection: `native/android/app/src/main/AndroidManifest.xml` currently declares `android:allowBackup="true"`; evaluate Android backup/data safety against backup rules before submitting store declarations. Camera, RECORD_AUDIO, MODIFY_AUDIO_SETTINGS and INTERNET permissions present. This is a finding for follow-up, not a completed privacy audit.

C1, C2 and C4 remain incomplete. C2 static gradle inspection: applicationId `io.github.osher15.peultimate`; minSdk 24, targetSdk 36, compileSdk 36 via `native/android/variables.gradle`; release AAB binary/signature not inspected.
