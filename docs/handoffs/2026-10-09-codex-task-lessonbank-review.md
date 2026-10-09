# Task for Codex — review the reviewed he/en lesson bank (#24)
Date: 2026-10-09
Requested by: owner (Claude credits ran out for the week; Codex continues)
Branch: `ccr-e149e84d-s1sw05` (commits 9d59d5c, 4dd6494 on top of main 348c1ab)
Claude handoff: docs/handoffs/2026-10-08-lessonbank-he-en-review.md
Rules: AGENTS.md applies. Do not edit lesson text unless a check below proves a conversion error; do not touch ar/ru/es; do not merge or deploy.

## Background
The owner approved a language/terminology review of all 60 lessons in Hebrew and English plus eight content decisions (listed in the Claude handoff). Claude replaced the he/en arrays in `hm-lessonbank-<sport>.js` and pushed the same text to the 120 Notion pages (60 HE + 60 EN).

## Task 1 — code/data review (required)
1. `git diff 348c1ab -- hm-lessonbank-*.js hm-lessonbank.js`: confirm only `he` and `en` arrays and `meta.provenance` changed.
2. Prove ar/ru/es are untouched: load the bank before/after with `tools/notion-lessons-import.js` `loadExisting()` and compare the three arrays per sport (expected 18/18 identical).
3. Confirm for every he/en lesson that `bankLink`, `systemData`, `selfQualityCheck`, `ageRange`, `duration`, `n` are unchanged (expected 120/120).
4. Confirm the eight decisions are present (search strings):
   - FIT-10 en "one each for balance" / he "חמשת הרכיבים"
   - VB-03 en "nobody can interfere with"
   - BB-07 en "zero step" / he "צעד אפס"
   - FB-08 en "central gate" / he "לשער המרכזי"
   - FIT-03 en "partner gives one brief comment" / he "הערה קצרה אחת"
   - BB-04 he Main B contains "ממתינים מחוץ לאזור הנחיתה של הקולע"; BB-03 he Main B must NOT contain it.
5. Look for conversion artefacts in he/en text: leftover `**`, `#`, backslashes, duplicated sentences inside one field, empty fields. Report findings; fix only real artefacts.

## Task 2 — tests (required)
- `npm test` (expected 700 pass).
- `node build-standalone.js` twice; second run must leave no diff.
- `node tests/e2e/run.js`. Note: in Claude's runs the browser crashed around test 611 in long runs ("browser has been closed"); suites run alone (lang30, stage1, stage2, lessonbank) all passed. If it happens, run the remaining suites separately and say so.
- Open the lesson bank card in the app in Hebrew and English for 3 sports and read one lesson each.

## Task 3 — Notion check (only if you have Notion access; otherwise leave for the owner)
79 of the 120 pages were already read back from Notion and matched the source line by line (3 mismatches found and fixed). These 41 pages were updated but not yet read back:
- `3df128d0e21781ffaf3adb0056683955` כדוריד 01 — מסירה וקליטה בתנועה | עברית
- `3e0128d0e217819d989bc199979292f3` כדוריד 02 — כדרור, עצירה ושינוי כיוון | עברית
- `3e0128d0e21781c7a9a4eda27c8dd418` כדוריד 03 — תנועה ללא כדור ויצירת קו מסירה | עברית
- `3e0128d0e217813aad2ef5f490400d8d` כדוריד 04 — זריקת כתף מדויקת למטרה | עברית
- `3e0128d0e21781f49099e839d5def0f4` כדוריד 05 — קצב שלושה צעדים וסיום מבוקר | עברית
- `3e0128d0e217818c8aeff3cff7a6edd1` כדוריד 06 — הגנה ללא מגע וסגירת נתיב | עברית
- `3e0128d0e21781c5b1c8f15fd99aceaa` כדוריד 07 — מעבר מהיר ויתרון 3 נגד 2 | עברית
- `3e0128d0e21781e5a741c144b1e59206` כדוריד 08 — משחק מסכם והערכת רצף | עברית
- `3e0128d0e21781e89d1fce1a85d5d9f9` כדוריד 09 — רוחב, עומק ותמיכת קו בכדוריד 4 נגד 4 | עברית
- `3e0128d0e2178178933ceae2f2cfeb3e` כדוריד 10 — ניהול משחק טקטי והערכה מסכמת מורחבת | עברית
- `3df128d0e217816292d0c520ebfb84c5` Handball 01 — Passing and Receiving on the Move | English
- `3e0128d0e21781c98da9f2ccbf77b373` Handball 02 — Dribbling, Stop, and Change of Direction | English
- `3e0128d0e217810c83c4dc8021f4162e` Handball 03 — Off-Ball Movement and Passing Lanes | English
- `3e0128d0e2178199a471d255164c1dd8` Handball 04 — Accurate Overarm Throw to Target | English
- `3e0128d0e21781f7b767ebf5febcae87` Handball 05 — Three-Step Rhythm and Controlled Finish | English
- `3e0128d0e21781d685f0ff24d84cd357` Handball 06 — No-Contact Defence and Lane Control | English
- `3e0128d0e217811d89d8d7934df365a0` Handball 07 — Fast Transition and 3v2 Advantage | English
- `3e0128d0e21781b7b921cbefc61f13e1` Handball 08 — Final Applied Game and Pathway Assessment | English
- `3e0128d0e21781888f5fc3df66deecbc` Handball 09 — Width, Depth, and Line Support in 4v4 Handball | English
- `3e0128d0e21781dcab37da6c9aba5860` Handball 10 — Tactical Game Management and Extended Final Assessment | English
- `3df128d0e21781749f17f6a209701088` כדורעף 01 — עמדת מוכנות ומסירת אמות | עברית
- `3e0128d0e217815f9056f291aacc810e` כדורעף 02 — מסירה עילית ותנועה לתמיכה | עברית
- `3e0128d0e2178160ab15da306c688ff7` כדורעף 03 — הגשה תחתית לאזור מטרה | עברית
- `3e0128d0e21781f5b11bcc7d007cf6db` כדורעף 04 — קבלת הגשה במסירת אמות | עברית
- `3e0128d0e2178159949fda98b18df049` כדורעף 05 — רצף קבלה, מסירה והעברה | עברית
- `3e0128d0e217817c956ef7b41a951d8b` כדורעף 06 — תנועה וכיסוי שטח לאחר מגע | עברית
- `3e0128d0e2178190a1a6d1f93efafc54` כדורעף 07 — התקפה מבוקרת מעמידה | עברית
- `3e0128d0e2178115bf14d62be735e1bc` כדורעף 08 — הגנת רשת וכיסוי אחורי | עברית
- `3e0128d0e21781448101e78b3c6271b5` כדורעף 09 — משחק 3 נגד 3 ומעבר תפקידים | עברית
- `3e0128d0e21781aeb6e2c343b5197027` כדורעף 10 — משחק מסכם והערכת הרצף | עברית
- `3df128d0e21781e4966ad8343c126929` Volleyball 01 — Ready Position and Forearm Pass | English
- `3e0128d0e21781b2af67c7050d100417` Volleyball 02 — Overhead Set and Support Movement | English
- `3e0128d0e217819bb099df63134549e6` Volleyball 03 — Underhand Serve to a Target Zone | English
- `3e0128d0e21781cc9b02ed6117213d66` Volleyball 04 — Forearm Serve Reception | English
- `3e0128d0e217814fa0a6d206ebd25669` Volleyball 05 — Receive, Set, and Send Sequence | English
- `3e0128d0e217819bab4bdd8058a99065` Volleyball 06 — Movement and Coverage after Contact | English
- `3e0128d0e217819fa775fe262ad814be` Volleyball 07 — Controlled Standing Attack | English
- `3e0128d0e21781a4889af3969a7ecfb1` Volleyball 08 — Net Defence and Backcourt Coverage | English
- `3e0128d0e21781ca83bac6fdb2b11ba6` Volleyball 09 — 3v3 Play and Role Transition | English
- `3e0128d0e21781c093ace64bece55d2f` Volleyball 10 — Final Applied Game and Pathway Assessment | English
- `3df128d0e2178192afe3d8b1485b6ea0` כדורסל 03 — מסירה, קליטה ותנועה לתמיכה | עברית (checked once by the pilot agent, not by the line diff)

For each: open the page and check that (a) it has headings "# 1." to "# 20.", (b) the title matches the list, (c) a few sentences from sections 9, 13 and 19 match the app data for the same sport/lesson/language (`hm-lessonbank-<sport>.js`, fields `sections`, `assessment`, `pedagogicalValue`). Report mismatches; do not rewrite pages wholesale.

## Report
Write `docs/handoffs/2026-10-09-codex-lessonbank-review-result.md` with commands, results and findings. Open a PR from this branch for the owner if none exists.
