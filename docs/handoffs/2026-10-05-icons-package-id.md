# Task handoff
Date: 2026-10-05
Owner: Claude
Base commit: 54d6b15 (main) plus earlier docs commits on this branch
Branch / PR: ccr-d9e82175-eul5wi / no PR requested
Task / priority / status: Apply new logo (stopwatch + basketball, volleyball, football) as app icons; change package/bundle ID before first store upload. Done, CI build not yet run
Reserved files/sections: icon-192/512/maskable-512.png, apple-touch-icon.png, native/assets/icon-*.png, native/android res/mipmap-*/ic_launcher*.png, iOS AppIcon-512@2x.png, native/capacitor.config.json, native/android/app/build.gradle (namespace, applicationId), MainActivity.java (moved), strings.xml, project.pbxproj (bundle ID), docs/NATIVE_RELEASE_CHECKLIST.md decision 1 line. GitHub write access was not used; reservation recorded here, not on the board. The owner asked for this change directly.
Changes and user behavior:
- Icons replaced from docs/store-listing/assets/icon.svg (web icons, maskable with safe-zone margin, Android legacy/round/adaptive layers, iOS 1024, native/assets sources). Splash screens unchanged.
- ID changed from app.netlify.peultimate to io.github.osher15.peultimate (Android applicationId/namespace/package dir, strings.xml, Capacitor appId, iOS bundle ID). The old ID borrowed Netlify's namespace; the new one is under the owner's GitHub username. Valid Play format (lowercase segments, letters/digits).
- User-visible effect: an APK built with the new ID installs as a NEW app beside the old one and does not receive its data. Back up and restore if test data matters. Nothing is uploaded yet, so this is the cheap moment to change it; after the first upload it is permanent.
- Launcher label stays "PE Ultimate"; the store name "PE Ultimate App" is store-listing only.
Validation commands and results:
- npm test: 654/654 pass. node build-standalone.js run twice: no diff in generated index.html/sw.js/Hamegrash.html. node native/build-web.js: 44 files, ok.
- Icons viewed as images (square, round, adaptive foreground on grey).
CI / emulation / physical-device evidence:
- NOT verified: the Android/iOS builds with the moved MainActivity and new ID have not been compiled (no Android SDK or Xcode here). First evidence is the CI run on a PR. No device check of the new launcher icon.
Unresolved issues and dependencies: compile check in CI; adaptive-icon look on a device; iOS icon needs an Xcode build to confirm; Hebrew store text edits by the owner not yet synced into the repo.
Publication status: committed and pushed to the task branch only. No PR, nothing uploaded.
Next owner / next action: owner opens a PR (or asks for one) so CI compiles the debug APK, installs it, checks the icon and the new app ID.
