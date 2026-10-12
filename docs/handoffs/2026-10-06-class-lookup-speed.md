# Task handoff
Date: 2026-10-06
Owner: Claude
Base commit: d6cfdd5 (branch ccr-d9e82175-eul5wi)
Branch / PR: ccr-d9e82175-eul5wi / PR #44
Task / priority / status: Owner report: "moving between screens / loading a class feels slow, especially during a lesson". Step 1 (speed, no visible change) done. Flow options proposed to the owner; none implemented yet.
Reserved files/sections: hm-data.js (classes/classOf/findClass/groupOf only), hm-app.js (LS.raw, REGSTORE), hm-tests.js (clsStore line), hm-tools.js (store line), hm-new.js (store line), tests/unit/regmemo.test.js (new), generated index.html/sw.js/Hamegrash.html. Shared files; no Issue reservation posted (GitHub write not used), recorded here.

Changes and user behavior:
- Root cause found by instrumenting storage reads: filtering measurements by class looked the class registry up once per measurement row (DATA.rowInScope -> groupOf, DATA.resolveClassId -> findClass), and every lookup re-read and re-parsed `ft.classes` from storage. With 8 classes x 30 students and ~5,800 measurements, opening Class hub or Fitness tests did ~11,800 registry reads and ~8 MB of JSON parsing.
- New DATA.classesRO(store): read-only lookups (classOf, findClass, groupOf) reuse the parsed registry while the raw stored text is unchanged (store.raw). Any change, through the app or written directly (restore), changes the text and is seen on the next lookup. Functions that modify the registry still use classes(store) and get a fresh copy. Stores without raw() (unit tests, backup previews) behave as before.
- LS.raw(k) added; the LS-backed store wrappers expose raw.
- No visible change to screens, data, ids or storage format.

Validation commands and results:
- Measurement script (Playwright, cloud Chromium, 412x860, CPU throttled x4, 8 classes / 240 students / 5,760 results / 320 attendance days, English UI), unchanged code vs. this change, two runs each:
  - go(cls) first visit: 416-614 ms -> ~195 ms; JSON parsed 8.4 MB -> 2.2 MB
  - go(ft) first visit: ~400 ms -> 210-430 ms (noisy); later visits 290-330 -> 155-235 ms
  - go(ft) during an active lesson: 303-598 ms -> 115-153 ms
  - go(stu) unchanged (~300-550 ms to paint): its cost is drawing 240 student cards, not data.
- npm test: 661/661 (7 new in regmemo.test.js: one parse for many lookups; rename/register/group changes visible; refused update not leaked; direct write seen; two stores never share; stores without raw unchanged).
- node build-standalone.js rebuilt generated files.
- e2e with this change: classes, groups, combined23, audit29, identity, rename9, backuprestore, attendgrade12, fieldjourney — 86/86 pass. The full e2e set was not run in one go (cloud Chromium limit); CI runs it on the PR.

CI / emulation / physical-device evidence:
- Timings are from CPU-throttled desktop Chromium, not a phone. Real devices vary; the ratio, not the absolute numbers, is the evidence.
- Not measured on the owner's real data (size unknown).

Flow findings (not changed yet):
- During a lesson, "Measure" opens Fitness tests with the year/class pickers, "Combine classes" and the class card first; the first test starts ~790 px down (below the bottom bar on a phone).
- "Attendance" opens Class tools with date/class selectors and five summary tiles before the first student.
- Both jump from the Lesson area to the Classes area (bottom bar highlight moves); getting back needs Back or the Lesson button.
- My Students opens on "All classes" (240 cards with the dataset above).
- Views fade in over 220 ms after the JS work finishes; the "Welcome back" toast covers the bottom of the screen.

Unresolved issues and dependencies: owner to choose a flow option (compact lesson-mode tools recommended). ft.results is still parsed twice per Fitness tests / Class hub visit (not cached on purpose: it is mutated in place by writers).
Publication status: committed and pushed to the task branch, PR #44. Nothing merged or deployed.
Next owner / next action: owner picks a flow option; Claude implements it with a fresh reservation on the affected screens.
