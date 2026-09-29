# PE Ultimate — Release audit and fixes — 2026-09-29

Scope: verify and fix the browser-audit findings for build `3dc152b2`, inventory content
and privacy behaviour, and assess Android / Google Play readiness.

**Status vocabulary.** *VERIFIED FIXED* = reproduced on the audited build and shown fixed on
this branch with an automated check. *STILL REPRODUCIBLE* = present and not fixed.
*NOT REPRODUCED* = could not reproduce. *NOT TESTED* = no evidence gathered.
Separately, every change is marked **implemented locally → tested → committed → deployed**.
Nothing in this report is deployed: production still serves `4dae863`. Branch head at the end of this work: `3700a8a` (pushed, not merged).

---

## 0. Current state (Phase 0)

| Item | Evidence |
|---|---|
| Repository | `osher15/https-pe-ultimate.netlify.app` (public) |
| Audited build | `hm-app.js?v=3dc152b2` = commit `4dae863` (main, 2026-09-25) |
| Production deploy | Netlify deploy `6ab69f38…`, context *production*, branch `main`, `commit_ref 4dae863`, published 2026-09-25 16:20 UTC (read through the Netlify connector) |
| Work branch | `claude/pe-ultimate-audit-fixes-6fy4f3`, branched from `4dae863` |
| Deploy rule | Netlify builds `main` with no build step; `node build-standalone.js` must be run and committed (CI checks `Hamegrash.html`, `index.html` and `sw.js` are in sync) |
| AGENTS.md | none in the repository; README, `docs/TESTING.md` and `.github/workflows/tests.yml` were used |
| Live site | could not be fetched from this environment (egress policy); deployed commit was established via Netlify instead |
| Baseline tests (run now, on `4dae863`) | unit **503/503 pass**; e2e **448/448 pass**. None of the audited defects was covered by an existing test |

The audit was reproduced against a pristine worktree of `4dae863` with scripted Chromium
sessions (synthetic demo data only), then re-run against this branch.

---

## A. Executive decision

| Question | Answer | Why |
|---|---|---|
| Ready for a **supervised web pilot**? | **Yes, after this branch is merged and deployed**, with the owner completing three items: the privacy-page placeholders, a decision on where the contact form posts (see F-15), and one real-device smoke pass (phone, offline, Hebrew + one LTR language). | All P1 data defects that the audit found (plus one worse data-loss bug found here) are fixed and covered by tests; the core loop works end to end in Chromium. Not verified on real phones. |
| Ready for **Android closed testing**? | **No.** | There is no Android project, package ID, signing key, AAB, manifest, Data safety form or real-device evidence (section D). This is packaging work, not a bug fix. |
| Ready for **public Google Play release**? | **No.** | Everything in the closed-testing row, plus the closed test itself (12 testers × 14 days for new personal accounts — to be confirmed in Play Console), final privacy policy, content-rights clearance (section C) and native-speaker review. |

---

## B. Findings and fixes

Files column: only files with logic changes; every change also rebuilt `Hamegrash.html`,
re-stamped `index.html`, and bumped `sw.js`'s cache version (via `node build-standalone.js`).
All rows: implemented locally ✔ · tested ✔ · committed ✔ (this branch) · **deployed ✘**.

| ID | Pri | Reproduced on 3dc152b2? | Root cause | Files changed | Verification | Residual risk | Status |
|---|---|---|---|---|---|---|---|
| 1 Student list empty / TypeError | P1 | **Yes** — identical stack `hm-new.js?v=0918251e:76:40` | Demo seed wrote students as `{id,name,cls,cid,sex}` without `tests`; every other screen reads through `studentsIn()` and tolerated it, «My students» read `s.tests.length` and threw | `hm-data.js` (`normalizeStudent(s)` — safe defaults, keeps unknown fields, malformed entries returned separately), `hm-new.js` (STU reads normalised records, `save()` writes malformed entries back untouched, visible notice), demo seed fixed | Same 8 sids via «all», class chip, hub route and reload; legacy/malformed fixture; unit 1.1–1.6, e2e #1–#2 | Other modules still read `stu.list` raw (they already guarded `tests`) | VERIFIED FIXED |
| 1b **NEW — fill-from-attendance deletes other classes** | **P0** | **Yes** — with ט׳3 selected and a second class ח׳2 (5 students), «⬇ Fill from attendance» reduced `stu.list` from 13 to 8 | `fillFromAttendance()` saved the class-filtered array back to `stu.list` | `hm-new.js` | 13→13 after fix; e2e «3. מילוי … לא מוחק» | Any teacher who used the button with a class selected on 3dc152b2 may already have lost students; recovery = restore from a backup taken before | VERIFIED FIXED |
| 2 Groups include absent student; opens on «All classes» | P1 | **Yes** — דן אבירם (absent) placed in a team; class select stayed empty. **The random picker had the same defect** (picked the absent student) | Groups/picker never read attendance; lesson context was applied only to the attendance tab | `hm-data.js` (`attendanceMarkOn`, `splitByAttendance` over the existing `tools.att` model, cid-resolved labels, date-scoped), `hm-tools.js`, `index.html` | 7 of 8 in teams and picker; re-marking present → 8; explicit «whole class» → 8; unit 2.1–2.5, e2e #3–#4 | Rule is explicit in the UI: *present only* = full or partial; absent, exempt and **unmarked** are excluded and counted on screen. Default is *present only* when the class has any mark for the date, otherwise *whole class*. Outside a lesson the date is today | VERIFIED FIXED |
| 3 Incomplete grades labelled final | P1 | **Yes** — 70.0/0.0 «final», hub 8/8 | Formula summed whatever existed and treated missing components as 0 | `hm-data.js` (`gradeResult`: final only when every component with weight > 0 is filled; 0 is valid; zero-weight components never block; bonus optional), `hm-new.js` (table cell, hint, CSV status + missing columns, hub summary), `hm-hub.js`, CSS | Table shows «70.0 provisional — missing: …», hub 0/8 final + 8 provisional; CSV has *Grade / Status / Missing* columns; manual grade 55 preserved; unit 3.1–3.7, e2e #5–#6 | Numeric formula intentionally unchanged. An exam-weighted component with no exam column now keeps grades provisional (correct, but visible change for teachers) | VERIFIED FIXED |
| 3b Period boundaries for attendance | P1 (investigation) | **Yes, confirmed defect** — periods are names only («רבעון 1»), so every fill used all attendance ever recorded | No date model for periods | `hm-data.js` (`attendanceRateOf` accepts `from/to`), `hm-new.js` (per-period range stored in new additive key `grades.periodRanges`, asked once, default = recorded span) | 2020 attendance excluded when range set; unit 3.8, e2e #5 | Exempt («e») still counts as a day with 0 credit, identical to the attendance report — a product decision (see backlog) | VERIFIED FIXED |
| 4 Search ignores translated game titles | P1 intl | **Yes** — 0 results for «Capture», «العلم», «Захват», «bandera» | Filter matched only the Hebrew source fields | `hm-data.js` (`foldSearch`/`searchMatch`: case, accents, niqqud/tashkeel, ё→е, geresh; AND of words), `hm-know.js` (visible-language + Hebrew haystack, cached per language), `hm-new.js` (student search) | he/en/ar/ru/es queries all find the visible title; clear → 42; unit 4.1, e2e #7 | Lessons, exercises and knowledge have **no free-text search** to test (N/A). Category filter still resets to «all» when typing (existing behaviour) | VERIFIED FIXED |
| 5a English topic groups in Hebrew | P1 intl | **Yes** | DOM translator handled `placeholder/title/aria-label` only — never `<optgroup label>` | `hm-i18n.js` (`label`, `alt` added; selector derived from the list) | e2e #8 | — | VERIFIED FIXED |
| 5b Arabic live lesson «next» title in Hebrew | P1 intl | **Yes** — «التالي: ריצת קצב מודרגת …» | Translated prefix and Hebrew phase name concatenated into one text node | `hm-live.js` (separate spans) | Leak scan + e2e #8 | — | VERIFIED FIXED |
| 5c Other leaks (plan buttons after language switch, «Class ט׳3», «· בן») | P2 | **Yes** | Plan not redrawn on language change; mixed text nodes | `hm-lesson.js`, `hm-hub.js`, `hm-new.js` | Scripted scan of 10 screens × en/ar/ru/es (visible text + a11y attributes): **0 Hebrew leaks** after, 5 kinds before | Scan excludes teacher-entered data by design; dialogs/validation/print not exhaustively scanned | VERIFIED FIXED (scanned screens) |
| 5d «100%» next to «draft awaiting review» | P1 intl | **Yes** | Percentage was UI-key coverage vs English, presented as completeness | `hm-app.js` (status «source» / «draft, not reviewed»; key coverage kept as labelled tooltip), language hint rewritten in 5 languages, README | e2e #8 | Native-speaker review still not done | VERIFIED FIXED |
| 5e CSV headers only Hebrew | P2 | Yes (by code) | `dlCSV` bypasses the translator | `hm-app.js` (header row only; cells are data) | manual/code | Cell values like «שיפור» still Hebrew | FIXED, not separately tested |
| 6 Lesson requests unavailable equipment | P2 | **Yes** — 8/15 aerobic plans with only balls+cones listed hoops; checked items were blindly appended | «Available equipment» treated as additions, never as a constraint | `hm-data.js` (`equipConflicts` with «/» alternatives and parenthetical examples, `mergeEquip`), `hm-lesson.js` (auto-picked games must fit, teacher-picked games kept with warning, topic conflict warning, equipment derived from chosen activities — each game's equipment text kept whole so it stays translatable, «add game» merges + checks; warnings stored as key + items), print | 0/15 after; unit 6.1–6.2, e2e #9 | Main-block variants have no equipment metadata (e.g. «דילוגי חבל» in the aerobic circuit needs ropes). **Timing (validation, not an arithmetic defect):** a 45-min aerobic plan allots ~25 min to the main block while the Tabata variant describes ~4–5 min of work and the pace-run ~15.5 min; no setup/transition time is modelled | VERIFIED FIXED (games + topic); variants open |
| 7 Simultaneous classes shown as next + later | P2 | **Yes** — י״ב1 «Next» and י״ב2 «Later» at 12:35 | Sample declared the teaching group (`peI`) but expanded it into two separate slots | `hm-data.js` (sample emits one group slot with members; `splitDay` returns `clash` for separate same-time slots), `hm-app.js` (loader creates the group via existing `makeGroup`; Home shows a clash warning instead of «later») | «י״ב1 + י״ב2» as one lesson; 4 sample groups created; unit 7.1–7.3, e2e #10 | Existing user timetables with two separate same-time slots are **not merged** — they are flagged, per the requirement | VERIFIED FIXED |
| 8 «No change» merges equal and single-day | P2 | Yes (by code and existing tests, which asserted the merge) | Deliberate earlier design | `hm-data.js` (`insufficient` bucket), `hm-tests.js` (fifth column + hint), updated `progress11` unit/e2e tests | unit + e2e | — | VERIFIED FIXED |
| 9 Generic next-lesson progression | P2 | **Yes** — aerobic lesson got «pairs → 3v3 → full game» | One ball-game ladder for every topic; sessions stored no topic type | `hm-data.js` (fit / move / ball ladders chosen from new additive `planGroup`, or title keywords for old sessions; unknown → modest repeat-and-adjust; explicit «feedback is about the whole lesson, not a student»), `hm-lesson.js`, `hm-live.js` | unit 9.1–9.4 | Ladders are generic per family, not per activity | VERIFIED FIXED |
| 10 Mandatory contact form blocks first use | P2 | **Yes** (by code + existing test harness comment «no skip, deliberate») | Product decision | `index.html`, `hm-new.js` (language picker on the overlay, «skip for now» — sends nothing, Settings → About entry to give details later, recipient/purpose line, privacy link) | e2e #11 (no request to Google Forms on skip) | Existing «required fields» tests still pass | VERIFIED FIXED |
| 11 Privacy text contradicts features | P2 | **Yes** — About: «the only thing that leaves the device is your contact details» | Text predates sync/Drive/fonts | `index.html`, `hm-i18n.js` (5 languages), `README.md`, new `privacy.html` | Outbound inventory below; claims checked against code (PBKDF2-SHA256 310k → AES-GCM-256; Drive refuses unencrypted; password never stored) | `privacy.html` has **[TO COMPLETE]** fields (operator, contact, retention, audience) — owner decisions, not guessed | FIXED (text); policy **PENDING owner** |
| 12 Backup UX too technical | P2 | Yes (by inspection) | — | `index.html` (Drive setup folded into «Advanced», plain recovery steps, encryption marked recommended when the file leaves the device) | e2e #12: full-entity round-trip into a **separate browser context**, every key byte-identical, stable sids/cids, grade 0 preserved; double restore identical; newer-schema file rejected; existing suite covers wrong password, malformed file, v1 upgrade | A storage-quota failure *during* apply can still produce a reported partial restore (validation failures cannot) | VERIFIED (flows); UX FIXED |
| 13 CC BY-SA images without in-app attribution | P2 rights | Yes | Credits only in `exercise-gifs/CREDITS.md` | `index.html` (About → image credits) | manual | — | FIXED |

### Outbound network inventory (from code, `4dae863` + this branch)

| Destination | Trigger | Data | Default? |
|---|---|---|---|
| Netlify (hosting) | every online load | IP, UA, URL (server logs) | yes |
| `fonts.googleapis.com` / `fonts.gstatic.com` | every online load | IP, UA | **yes** |
| `docs.google.com/forms/…` (lead form) | «Send and continue» on the contact screen | teacher first/last name, phone and/or email | opt-in (skip now possible) |
| `script.google.com` (records sync) | after teacher sets URL + code | student name, event, result, status | opt-in |
| `accounts.google.com`, `www.googleapis.com` (Drive) | «Back up to Drive now» | encrypted backup blob | opt-in |
| YouTube / source sites / teacher-set Forms & Drive links | user taps a link | whatever those sites collect | user-initiated |

No analytics, ads or tracking SDKs were found. The service worker fetches same-origin only.

### Draft Data safety mapping (for Play Console — to be confirmed by the owner)

| Play category | Collected by developer? | Notes |
|---|---|---|
| Personal info → Name, Email, Phone | **Yes, optional** | Lead form → operator's Google Form. Purpose: developer communications / feedback. Not shared. |
| Student names, results, attendance | **Not collected by the developer** | Stored on device. Optional sync/Drive go to the **teacher's own** Google account — declare per Google's guidance on user-initiated transfers to user-controlled accounts (owner to confirm). |
| App activity, device IDs, location, photos/videos | Not collected | Camera frames for photo-finish and record videos stay on device (IndexedDB). |
| Data encrypted in transit | Yes (HTTPS) | |
| Deletion request mechanism | Needs the contact address in `privacy.html` | |

---

## C. Content inventory vs recent uploads / Notion

Sources inspected: repository (all commits since 2026-09-20), Notion (read-only via connector):
«PE Ultimate — דוח ביקורת שפות ותיקונים לקלוד — 2026-09-26» and its parent tree
«מאגר מערכי שיעור ספורט — מחקר בינלאומי / בנק רכיבים מקוריים / סדרת מערכים לבית הספר».
**Not found anywhere accessible:** `PE_Ultimate_Master_Knowledge_Document.md`,
`PE_Language_Audit_2026-09-26_FINAL.md` (not in the repo, not in Google Drive search; the
Notion page above appears to be the working version of the language audit) — **UNVERIFIED**.

| Content | Source / version | Languages | In repository | Deployed (4dae863) | Linguistic review | Rights / provenance | Next action |
|---|---|---|---|---|---|---|---|
| 42 games (`hm-know.js`) | repo | he + 4 via `hm-texts.js` | yes | yes | draft; back-translation pass in `docs/BACKTRANSLATION.md` | described as original summaries; not individually traced | Owner confirms authorship per game |
| 20 generator topics + variants (`hm-lesson.js`) | repo | he + 4 | yes | yes | draft | original (per code comments) | Add per-variant equipment/time metadata |
| 11 archive lesson documents (`hm-plans.js`) | «מקור: Google Drive», college coursework (מכללת קיי), one credited to ד״ר יותם לוריא; contain a named teacher and school | he + 4 | yes | yes | draft | **Unresolved** — college/course material and a third-party author; personal names published in a public repo | **Hold out of an Android/public release** until the owner confirms permission; consider removing personal names |
| 60-plan school series FIT/BB/FB/HB/VB/AT-01…10 | Notion, 5 separate language editions (300 pages); audited 2026-09-26, corrected 2026-09-28 per the page | he/en/es/ru/ar | **no** | **no** | Notion page records fixes; no independent native review | «בנק רכיבים מקוריים» — stated as original; not verified here | Do **not** bulk-import. The audit page flagged high-severity cross-language version gaps (FB-10, HB-03/04/08/10, VB-05) and records them as corrected on 2026-09-28; that correction was **not independently verified** here |
| Research bank (PE Central, SPARK, Dynamic PE ASAP pages) | Notion | en | no | no | — | **Third-party copyrighted plans** | Reference only; never ship |
| Exercise GIFs: `rig/` (42) | original renders | — | yes | yes | — | project-owned | — |
| Exercise GIFs: `photo/` (5) | Wikimedia Commons | — | yes | yes | — | 4 × CC BY-SA 4.0 (attribution + share-alike), 1 × public domain | Attribution now in-app (this branch) |
| UI dictionary (`hm-i18n.js`) | repo | 5 | yes | yes | draft | own | Native-speaker review |
| Knowledge base sources (`hm-know.js`) | cited links (education.gov.il, CDC, WHO, Cooper Institute …) | — | yes | yes | — | links + summaries; FITNESSGRAM® is a trademark | Confirm summaries are paraphrased, not copied |

Counts observed now match the audit (11 library entries, 42 games, 5 languages). The recent
Notion series is **not** in the app — this is consistent with the master document's
spec-vs-implementation distinction mentioned in the brief, but the master document itself
could not be read.

---

## D. Android / Google Play checklist

Checked 2026-09-29. `developer.android.com` was reachable; `support.google.com` was blocked by
this environment's network policy, so Play Console help pages are cited but not re-read.

| Gate | Status | Evidence / link |
|---|---|---|
| Android project exists | **PENDING** — none (no Gradle/Capacitor/TWA files) | repo tree |
| Packaging approach | **PENDING decision.** Recommended: Trusted Web Activity (Bubblewrap) — keeps the offline PWA, service worker, camera via `getUserMedia`, Web Audio. A WebView wrapper (Capacitor) is the alternative if camera/audio behave poorly in TWA on test devices | [TWA overview](https://developer.chrome.com/docs/android/trusted-web-activity/) |
| Package ID, versionCode/Name | PENDING | — |
| Signed release **AAB**, Play App Signing, upload-key custody | PENDING | [App signing](https://developer.android.com/studio/publish/app-signing) |
| Target API | **VERIFIED requirement:** new apps and updates must target **API 36** since 2026-08-31 (extension to 2026-11-01 on request) — project must meet it | [Target API requirement](https://developer.android.com/google/play/requirements/target-sdk) |
| Manifest permissions | PENDING — expected: `INTERNET`; `CAMERA` only if not handled by the browser in TWA; no location, contacts or storage needed | — |
| TWA Digital Asset Links (`/.well-known/assetlinks.json`) | PENDING (needs signing fingerprint) | — |
| Public privacy policy URL | **PENDING** — `privacy.html` drafted; placeholders must be completed and deployed | this branch |
| Data safety form | PENDING — draft mapping in section B | Play Console |
| Target audience & content | PENDING — app is for teachers; student mode exists but collects no contact data. Declaring an audience that includes children would bring the Families policy into scope | Play Console → App content (help page not re-read here) |
| Content rating questionnaire, ads declaration (no ads) | PENDING | Play Console |
| Account deletion requirement | **NOT APPLICABLE** — no account creation; the local teacher code is not an account | — |
| Health apps declaration | PENDING — app computes VO₂max estimates and «health zone» fitness categories for education; it is not a medical device. Complete the declaration accurately rather than assume exemption | Play Console → App content |
| Reviewer access | PENDING — reviewers need to know the first-run code flow and demo mode (no credentials needed) | — |
| Closed test for new personal accounts | **PENDING / to verify in Console.** Secondary sources consistently state: accounts created after 2023-11-13 need a closed test with ≥12 opted-in testers for 14 continuous days before production access. Account type and creation date not known here | [Play help 14151465](https://support.google.com/googleplay/android-developer/answer/14151465) (blocked here) |
| Real-device tests (install/upgrade, airplane mode, teacher/student separation, camera grant/deny/revoke, audio & beep timing, background/lock, wake lock, back/rotation/keyboard, small screens, long names, RTL/LTR, export/import, 35-student class, storage-full) | **NOT TESTED** — no device access in this environment | — |

---

## E. Prioritised backlog

**Must fix before pilot**
1. Merge this branch and deploy; verify the displayed build ID changes from `3dc152b2`.
2. Tell pilot teachers who used «Fill from attendance» with a class selected on the old build to check their roster (data-loss bug 1b).
3. Complete `privacy.html` placeholders (operator, contact, retention, audience).
4. Decide the contact-form destination: the code comment says the Google Form is «המגרש פרו משתמשים» (the Hamegrash PRO users form) — PE Ultimate leads may be landing in the other product's sheet, contrary to the separation described in the README.
5. One real-device smoke pass (Android Chrome + iOS Safari; offline; Hebrew + English).

**Must fix before public release**
6. Build the Android package (TWA recommended), signing, API 36, assetlinks, Data safety, content rating, health declaration, closed test.
7. Resolve rights for the 11 archive documents (college coursework, third-party author, personal names).
8. Native-speaker review of en/ar/ru/es; re-run the leak scan on dialogs, validation messages, prints and exports.
9. Decide exempt-student treatment in participation grades (currently counts as 0 for the day, like the attendance report).
10. Add equipment and duration metadata to generator variants; model setup/transition time.
11. Self-host fonts (removes the only default third-party request) and add Netlify security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`) — the current deploy processes no header rules.

**Can follow later**
12. Merge-offer for two same-time slots («join these classes?») instead of a warning only.
13. Translate CSV cell values (status words) and period names.
14. Per-activity (not per-family) next-lesson suggestions once plans carry structured metadata.
15. Decide whether/when to import the Notion 60-plan series, one plan at a time after a canonical version is chosen.

---

## F. Tests run for this report (all executed on 2026-09-29)

| Run | Build | Result |
|---|---|---|
| `npm test` (unit) — baseline | `4dae863` | **503 / 503 pass** |
| `npm run test:e2e` — baseline | `4dae863` | **448 / 448 pass** |
| `npm test` (unit) — after | this branch | **532 / 532 pass** (includes new `tests/unit/audit29.test.js`, 29 tests) |
| `tests/e2e/audit29.e2e.js` alone — after | this branch | **12 / 12 pass** |
| `npm run test:e2e` (full) — first run after fixes | `3dc35e9` | 458 / 460 — **2 real regressions caught**: (1) splitting game equipment text created Hebrew fragments with no translation (Russian deep-content check); (2) `attendgrade12` still asserted participation-only = final. Both fixed in `3700a8a` |
| `npm run test:e2e` (full) — final | `3700a8a` | **460 / 460 pass** (448 existing + 12 new in `audit29.e2e.js`) |
| Scripted reproductions (Chromium, synthetic data) | both | Issues 1, 1b, 2, 3, 4, 5, 6, 7 reproduced on `4dae863` and verified on this branch |

Existing tests changed because they asserted the audited behaviour: `progress11` (unit + e2e:
«no change» vs «no comparison yet»), `schedule` and `uid` unit tests and `week.e2e`
(sample week is now 39 slots because joint classes are one group slot; a same-time second
slot is a *clash*, not *later*), `attendgrade12.e2e` (seeds a period date range so the fill
logic is tested without the new dialog, which is covered in `audit29.e2e`).

### Data compatibility
No migration was added and no stored identifier changed. New keys/fields are additive:
`grades.periodRanges`, `hx.leadSkipped`, `session.planGroup`, `plan.eqAvail/eqNo/eqWarn`.
Old records without them keep working (unit 9.4, e2e #2).
