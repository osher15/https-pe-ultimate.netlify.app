# Task handoff
Date: 2026-10-08
Owner: Claude
Base commit: 348c1ab
Branch / PR: ccr-2c03659c-pv87t4 (no PR opened; owner coordinates merges)
Task / priority / status: Lesson bank - observable objectives start with a student-subject lead-in (all 6 sports, 5 languages); basketball 03 ready-stance/passing-angle fix; Hebrew catch term "תפיסה" in basketball/handball. Done, pending owner review.
Reserved files/sections: hm-lessonbank-{basketball,football,handball,volleyball,athletics,fitness}.js (`objectives` arrays, plus basketball lesson 3 text and the Hebrew term swap in basketball/football/handball), tests/unit/lessonbankobjectives.test.js; generated Hamegrash.html/index.html/sw.js rebuilt. No GitHub write access used for an Issue reservation; this handoff is the record.
Changes and user behavior:
- Every objective of 60 lessons x 5 languages opens with a lead-in: he "התלמיד יצליח ל… / התלמיד יבצע…", en "The student can …", ar "يستطيع الطالب أن …", ru "Ученик сможет …", es "El alumno será capaz de …". Role clauses may come first ("As the ball carrier, the student can …").
- Verbs were rewritten to the form each lead-in needs; numbers and criteria are unchanged. The stand-alone header item in basketball lesson 5 ("By the end, students will:") was removed.
- Basketball 03 (all languages): "move to a new support angle" is now two objectives - a correct ready stance for receiving the ball, and opening a comfortable passing angle for the passer (be where the passer sees you). Title, subtopic, opening (with a short explanation of both), keywords updated.
- Hebrew catch terminology (user decision): "תפיסה" (לתפוס, תופס) is used for catching in basketball and handball, because it covers both pass reception and rebounds. The earlier "קבלה" swap was reverted. Other languages keep "catch"/"поймать". Football (foot control) does not use "תפיסה"/"ידיים רכות": the football lesson now says "קבלת מסירה" or "השתלטות על הכדור" (user decision) in place of "קליטה". Existing original uses of "קבלה" (e.g. basketball 06 "קבלה בתנועה", volleyball serve reception) were not changed. Not touched: Ultimate/frisbee wording in hm-terms.js/hm-lesson.js and server-intake wording in hm-data.js.
- BB-03 title references in other lessons were updated to the new lesson 3 title in all five languages.
- tools/notion-lessons-import.js would overwrite these files if re-run; the Notion source needs the same wording first (imports remain on hold).
Validation commands and results:
- npm test: 730 pass, 0 fail (lessonbankobjectives.test.js checks every objective of every sport and language).
- node build-standalone.js run twice: second run no diff.
- Browser suites not run; only data strings changed.
CI / emulation / physical-device evidence: none.
Unresolved issues and dependencies: lesson-builder library text in hm-lesson.js/hm-texts.js still uses "קליטה" (not changed; the Hebrew source strings are also translation keys); ar/ru/es wording needs a native-speaker pass; football/handball lessons that mention "זווית תמיכה" were not changed.
Publication status: committed and pushed to the branch; not deployed.
Next owner / next action: User reviews the Hebrew wording and decides hm-lesson.js terminology (still "קליטה").
