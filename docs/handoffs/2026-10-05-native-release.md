# Task handoff
Date: 2026-10-05
Owner: Claude
Base commit: 93587d9 (main)
Branch / PR: ccr-3cbe9a9d-h2mvca / PR to follow
Task / priority / status: #13 native release packaging, P1, step 1 (preparation) done; owner decisions and device evidence pending
Reserved files/sections: .github/workflows/native.yml; native/android/app/build.gradle (versionName only); docs/NATIVE_RELEASE_CHECKLIST.md; this handoff; COLLABORATION.md row. Reservation posted on Issue #13.
Changes and user behavior:
- Android versionName now `1.0-<build>` in CI (from the index.html build stamp), local builds keep `1.0`. versionCode unchanged (CI run number). applicationId and signing untouched.
- New CI job `android-release-bundle`: unsigned release AAB, labelled UNSIGNED, only on manual run or push to main; fails if the file carries a signature. No keys, no upload.
- docs/NATIVE_RELEASE_CHECKLIST.md: evidence levels, what CI produces, owner decisions, Android/iOS signing and upload steps, device pass including upgrade-without-uninstall, store asset inventory.
- No app code changed; the packaged app already includes the lesson-bank files (checked: `node native/build-web.js` copies all hm-*.js; bank loads by script injection).
Validation commands and results:
- `python3 -c "yaml.safe_load(...)"` on native.yml: parses. `node native/build-web.js`: 44 files, includes all hm-lessonbank-*.js, www 14 MB.
- Version label expression run locally: `1.0-4f3c032f`.
- `npm test` / e2e not rerun: no web code changed.
CI / emulation / physical-device evidence:
- The new release job and the versionName change have NOT run yet (no Android SDK in the sandbox). First evidence is the CI run on the PR.
- Physical devices: owner reports only (iOS tablet, Android APK). No recorded upgrade-without-uninstall test.
Unresolved issues and dependencies: owner decisions 1-8 in the checklist; 1024 px icon; store screenshots and listing text; Apple/Google accounts; iOS Build number must be raised per upload.
Publication status: committed on the task branch, PR to follow. Nothing uploaded, signed or submitted.
Next owner / next action: owner reviews the checklist and answers the decisions; owner runs the device pass; Claude then drafts five-language listing text and the store-privacy sentence once the audience decision is made.
