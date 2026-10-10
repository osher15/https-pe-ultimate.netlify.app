# Owner-approved PR #44 packaging split — 2026-10-10

Branch: `codex/pr44-packaging-only-2026-10-10`.
Base: current main `348c1ab2d4f069aea7f4640328b7e4f8f30611c3`.
Packaging source: draft #44 at `f51da88d9454bb2d943c71eb32a628250290ee19`.
Reservations: Issue #18 comments 6100104953 and 6100131213.
Owner approved splitting icons/package/store preparation from #44's unrelated UI changes on 2026-10-10. No merge/deployment/store upload approval.

## Implemented split

Selected 48 packaging/document paths (old and new Java paths counted separately):
- Web/PWA/Apple touch icon assets; manifest references/filenames unchanged.
- Android legacy/round/background/foreground icons, native source icon assets, iOS 1024 icon.
- Android namespace/applicationId, MainActivity package/path, strings package/url scheme, Capacitor appId and iOS debug/release bundle identifiers become `io.github.osher15.peultimate` as proposed in #44. All unrelated native config/version/signing settings stay byte-identical to current main.
- Store-listing assets/text, closed-test guide and three historical packaging/store handoffs. Store copy corrected to state icon application is implemented on the proposal; actual image description now includes volleyball as well as basketball/football. All listing translations remain drafts.

No lesson-mode/demo/rep interface, regMemo, lookup, i18n/style, app-data or game changes from #44 are included. No copied old generated HTML/SW, old collaboration/action-plan files, deleted current handoffs, lesson-bank arrays or old tests. All `hm-*` product-source files are byte-identical to main. Current-main source/generated content is retained.

The original #44 is left open/draft and unapproved. It is not safe to merge it wholesale. The accepted packaging-only branch supersedes only its packaging proposal; additional UI work needs a separate current-main branch, reservation and its own regressions. The historical #44 field17 bottom=1035/760 remains unresolved on that original branch; this split does not claim to repair it.

## Results and exact commands

```sh
npm test
# 700/700 pass, zero failures/skips.
node build-standalone.js
sha256sum index.html Hamegrash.html sw.js > ../packaging-build-first.txt
node build-standalone.js
sha256sum index.html Hamegrash.html sw.js > ../packaging-build-second.txt
cmp ../packaging-build-first.txt ../packaging-build-second.txt
git diff --exit-code -- index.html Hamegrash.html sw.js
# Both exit 0: repeat build identical; all three outputs unchanged from main.
node native/build-web.js
# Successful local asset assembly: 44 files, build 28216814.
# This is NOT Android/iOS compilation or a signed native artifact.
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node -r ../browser-preload.cjs -e 'const h=require("./tests/e2e/harness");h.run(["field17","native","i18n15"].map(n=>require("./tests/e2e/"+n+".e2e.js"))).then(n=>process.exit(n?1:0))'
# 42/42 pass. native suite uses synthetic Capacitor shims, not physical devices.
git diff --check
# Pass.
git diff --cached --binary origin/main > ../pr44-packaging-only.patch
git worktree add --detach ../packaging-apply-check origin/main
git -C ../packaging-apply-check apply --check ../pr44-packaging-only.patch
git -C ../packaging-apply-check apply ../pr44-packaging-only.patch
# Both exit 0; all 48 source paths then byte-compared exactly, including removal.
```

Additional static checks with Python/Pillow and actual repository source:
- Root icons 192/512/maskable 512/Apple touch 180 and store/iOS 1024 dimensions match. The two 1024 images are RGB, with no alpha. Inspected the store 1024 artwork visually; launcher/mask legibility still requires devices.
- Capacitor ID equals the proposed ID; iOS has two matching bundle identifiers; old MainActivity path removed.
- Replacing only the new ID with the old ID makes each edited native text configuration byte-identical to main. VersionName/code, release-signing setup and other settings were not overwritten.
- All `hm-*` product files byte-identical to main; no protected bank change or student-data access.
- `rg -n 'app.netlify.peultimate' native/android/app/src native/android/app/build.gradle native/capacitor.config.json native/ios/App/App.xcodeproj/project.pbxproj` returns no remaining old ID in these source/config scopes. Historical documentation is not claimed free of old ID references.

## Limits and residual risks

Browser evidence: installed runtime Playwright with existing scratch Chromium 153.0.8010.0, localhost and synthetic fixtures. Native suite evidence is simulated native; it does not establish OS icon rendering, sharing, camera, compilation or data migration.

NOT run: CI-pinned Playwright/Chromium, entire browser suite, Android Gradle/iOS Xcode compilation, signing, native simulator or physical devices, real quota/share/backup transfer, store-policy/native-speaker review, store upload or Netlify. No new CI results reviewed. DEVICE_ACCEPTANCE_SHEET_2026-10-09.md remains untouched/unfilled.

Package-ID change creates a separate app identity; it is not an in-place update of the owner's old-ID install and does not automatically transfer its data. Use an owner-verified encrypted backup/restore path before switching installs. No device migration is claimed. PWA installed-icon/cache refresh behavior is not proven by local asset replacement; current build hashing does not incorporate icon PNG bytes. New-install asset correctness and existing-install refresh/launcher masks require separate acceptance before release; no release readiness claim.

Draft guide/store wording is imported for review, not certified as current store eligibility or policy. Keep historical handoffs as historical; this file is the current split status.

## Netlify hold — instruction to Claude

Owner reports **no Netlify credits until 2026-10-22**. Do not merge to a deployment-linked branch, trigger deploy previews, invoke build/deploy hooks or deploy production before that date. Account status is owner-reported, not independently verified. Credit renewal on 22 October is NOT merge/deploy approval; owner approval still applies after then. No automation or scheduled deployment was created.

Publication uses a new review branch whose first published commit is tagged `[skip netlify]`; no initial branch at an untagged old commit, no PR/deploy-preview request, no Netlify API call. Main is unchanged. Reuse existing GitHub blob objects for the copied icon assets; do not re-upload or duplicate them unnecessarily.

## Exact next step

Claude: fetch the packaging-only source branch and inspect the diff against main. It is executable source, not the earlier A1/A3 patch-only delivery format. Retain this separation; do not apply #44's old whole branch on top. Review native identity/icon configuration and run native CI compilation separately when available; owner verifies backup migration and real icon/device behavior. Any final PR/main merge/deployment requires owner approval and respects the Netlify hold. Additional #44 UI work is a later independently scoped task.

Local compressed git patch is available as `docs/patches/2026-10-10-pr44-packaging-only.patch.gz` (2,338,100 bytes). The GitHub branch publishes the actual source/icon references plus this handoff rather than duplicating that binary patch in the repository. No PR, approval, original-branch overwrite, merge, signing, upload or deployment. Reservation released after publication.

## Exact source path list

- `apple-touch-icon.png`
- `docs/CLOSED_TEST_TESTER_GUIDE.md`
- `docs/handoffs/2026-10-05-closed-test-guide.md`
- `docs/handoffs/2026-10-05-icons-package-id.md`
- `docs/handoffs/2026-10-05-store-listing.md`
- `docs/store-listing/STORE_LISTING_2026-10-05.md`
- `docs/store-listing/assets/feature-graphic-1024x500.png`
- `docs/store-listing/assets/feature-graphic.svg`
- `docs/store-listing/assets/icon-1024.png`
- `docs/store-listing/assets/icon-512.png`
- `docs/store-listing/assets/icon.svg`
- `icon-192.png`
- `icon-512.png`
- `icon-maskable-512.png`
- `native/android/app/build.gradle`
- `native/android/app/src/main/java/app/netlify/peultimate/MainActivity.java`
- `native/android/app/src/main/java/io/github/osher15/peultimate/MainActivity.java`
- `native/android/app/src/main/res/mipmap-hdpi/ic_launcher.png`
- `native/android/app/src/main/res/mipmap-hdpi/ic_launcher_background.png`
- `native/android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png`
- `native/android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png`
- `native/android/app/src/main/res/mipmap-ldpi/ic_launcher.png`
- `native/android/app/src/main/res/mipmap-ldpi/ic_launcher_background.png`
- `native/android/app/src/main/res/mipmap-ldpi/ic_launcher_foreground.png`
- `native/android/app/src/main/res/mipmap-ldpi/ic_launcher_round.png`
- `native/android/app/src/main/res/mipmap-mdpi/ic_launcher.png`
- `native/android/app/src/main/res/mipmap-mdpi/ic_launcher_background.png`
- `native/android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png`
- `native/android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png`
- `native/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png`
- `native/android/app/src/main/res/mipmap-xhdpi/ic_launcher_background.png`
- `native/android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png`
- `native/android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png`
- `native/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
- `native/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_background.png`
- `native/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png`
- `native/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png`
- `native/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`
- `native/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_background.png`
- `native/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png`
- `native/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png`
- `native/android/app/src/main/res/values/strings.xml`
- `native/assets/icon-background.png`
- `native/assets/icon-foreground.png`
- `native/assets/icon-only.png`
- `native/capacitor.config.json`
- `native/ios/App/App.xcodeproj/project.pbxproj`
- `native/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`

Local decompressed patch SHA-256: `86eca575732a6df5a85e360c84a2a40820dce330f68ba5b0f13502c79b3ecc35`.
