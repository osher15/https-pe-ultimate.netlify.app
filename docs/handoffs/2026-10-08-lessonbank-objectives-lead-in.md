# Task handoff
Date: 2026-10-08
Owner: Claude
Base commit: 348c1ab
Branch / PR: ccr-2c03659c-pv87t4 (no PR opened; owner coordinates merges)
Task / priority / status: Lesson bank - observable objectives start with a student-subject lead-in (all 6 sports, 5 languages); basketball 03 ready-stance/passing-angle fix; Hebrew term "קליטה" -> "קבלה" in ball-sport banks. Done, pending owner review.
Reserved files/sections: hm-lessonbank-{basketball,football,handball,volleyball,athletics,fitness}.js (`objectives` arrays, plus basketball lesson 3 text and the Hebrew term swap in basketball/football/handball), tests/unit/lessonbankobjectives.test.js; generated Hamegrash.html/index.html/sw.js rebuilt. No GitHub write access used for an Issue reservation; this handoff is the record.
Changes and user behavior:
- Every objective of 60 lessons x 5 languages opens with a lead-in: he "התלמיד יצליח ל… / התלמיד יבצע…", en "The student can …", ar "يستطيع الطالب أن …", ru "Ученик сможет …", es "El alumno será capaz de …". Role clauses may come first ("As the ball carrier, the student can …").
- Verbs were rewritten to the form each lead-in needs; numbers and criteria are unchanged. The stand-alone header item in basketball lesson 5 ("By the end, students will:") was removed.
- Basketball 03 (all languages): "move to a new support angle" is now two objectives - a correct ready stance for receiving the ball, and opening a comfortable passing angle for the passer (be where the passer sees you). Title, subtopic, opening (with a short explanation of both), keywords updated.
- Hebrew: "קליטה/קולט/קלוט/נקלטה" -> "קבלה/מקבל/קבל/התקבלה" in basketball, football and handball banks. Not touched: Ultimate/frisbee "זריקה וקליטה" in hm-terms.js/hm-lesson.js, and server-intake wording in hm-data.js.
- tools/notion-lessons-import.js would overwrite these files if re-run; the Notion source needs the same wording first (imports remain on hold).
Validation commands and results:
- npm test: 730 pass, 0 fail (lessonbankobjectives.test.js checks every objective of every sport and language).
- node build-standalone.js run twice: second run no diff.
- Browser suites not run; only data strings changed.
CI / emulation / physical-device evidence: none.
Unresolved issues and dependencies: other languages still say "catch/поймать" in places (only Hebrew was changed); lesson-builder library text in hm-lesson.js/hm-texts.js still uses "קליטה"; ar/ru/es wording needs a native-speaker pass; football/handball lessons that mention "זווית תמיכה" were not changed.
Publication status: committed and pushed to the branch; not deployed.
Next owner / next action: User reviews the Hebrew wording and decides about hm-lesson.js terminology and other-language "catch".
