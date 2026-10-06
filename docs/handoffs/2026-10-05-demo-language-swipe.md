# Task handoff
Date: 2026-10-05
Owner: Claude
Base commit: branch ccr-d9e82175-eul5wi (PR #44)
Branch / PR: ccr-d9e82175-eul5wi / PR #44
Task / priority / status: Owner video feedback: demo and screens stay Hebrew after switching to English; page pans sideways on touch. First fixes done; class-loading simplification NOT started (needs the owner's list of slow steps).
Reserved files/sections: hm-new.js (demo block only), hm-i18n.js (9 new keys, via tools/i18n-addkeys.py), hm-tests.js (6 aria/title strings), hm-styles.css (one html rule), tests/e2e/demolang.e2e.js (new), lang30.e2e.js test 11, tests/e2e/run.js (one line), generated index.html/sw.js/Hamegrash.html. Shared files; no Issue reservation posted (GitHub write not used), recorded here.
Changes and user behavior:
- Switching the interface language while demo mode is on now replaces the demo students/results with names in the new language automatically (only ids demoN/dmN; other records untouched), and redraws the current data screen without a page reload. Before: a Hebrew demo stayed Hebrew in an English UI until a button was tapped. The old "reload demo" button now only appears if sync fails.
- The "demo blocked, device has real data" toast and dialog were hard-coded Hebrew; now translated (5 languages).
- Student-card title and +1/+5/-1/-5 rep-button aria labels were hard-coded Hebrew; now translated.
- html{overflow-x:hidden;overscroll-behavior-x:none} to stop the whole page being dragged sideways. Nested scroll strips (tabs, tables) keep their own scrolling. CORRECTED 2026-10-06: overflow-x on html broke sticky elements; now only overscroll-behavior-x:none (see 2026-10-06-lesson-mode.md).
Validation commands and results:
- npm test 654/654. node build-standalone.js (generated files rebuilt).
- Playwright (cloud Chromium, 430px): Hebrew demo then switch to English: 0 Hebrew text nodes across ft/cls/stu/tools/beep/photo/lesson/rec, join-classes dialog, add-students dialog, test screen (before: Hebrew student names and a mixed "חבר classes" button).
- e2e run separately: demolang, lang30, audit29 24/24 pass. Further suites (i18n15, classes, groups, combined23, native, lead, nav) started; results recorded in the PR if they differ.
CI / emulation / physical-device evidence:
- Sideways-pan fix is NOT verified on a phone (emulation cannot reproduce touch overscroll). Owner to retest in the APK.
- Not covered: Hebrew inside built-in lesson-plan text, units stored in demo results, and anything not on the screens listed.
Unresolved issues and dependencies: class-loading flow (owner video, 8 min, not seen); owner should say which steps felt slow. Video: do not publish until fixes are verified.
Publication status: committed and pushed to the task branch, PR #44.
Next owner / next action: owner lists slow class-loading steps; Claude proposes a shorter flow; owner retests swipe on device.
