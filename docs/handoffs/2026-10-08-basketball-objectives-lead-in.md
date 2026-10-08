# Task handoff
Date: 2026-10-08
Owner: Claude
Base commit: 348c1ab
Branch / PR: ccr-2c03659c-pv87t4 (no PR opened; owner coordinates merges)
Task / priority / status: Basketball bank - observable learning objectives start with a student-subject lead-in, all five languages. Done, pending owner review.
Reserved files/sections: hm-lessonbank-basketball.js (the `objectives` arrays only), tests/unit/basketballobjectives.test.js; generated Hamegrash.html/index.html/sw.js rebuilt. No GitHub write access was used to record a reservation in an Issue; this handoff is the record.
Changes and user behavior:
- Every objective of the 10 basketball lessons x 5 languages now opens with a lead-in:
  he "התלמיד יצליח ל… / התלמיד יבצע את…", en "The student can …", ar "يستطيع الطالب أن …", ru "Ученик сможет …", es "El alumno será capaz de …".
- Present-tense, noun and bare-infinitive items were rewritten to a verb form that fits the lead-in. Numeric targets and criteria are unchanged.
- Lesson 5 had a stand-alone header item ("By the end, students will:" and equivalents) in all languages; it was removed because every objective now carries its own lead-in.
- Role-specific items in lessons 9-10 keep the role first ("As the ball carrier, the student can …").
- tools/notion-lessons-import.js would overwrite this file if re-run; the Notion source needs the same wording before any re-import (imports remain on hold).
Validation commands and results:
- npm test: 700 pass, 0 fail (includes new basketballobjectives.test.js, 5 cases).
- node build-standalone.js run twice: second run produced no diff (md5 identical).
- Browser suites not run; only data strings changed, no UI/logic.
CI / emulation / physical-device evidence: none.
Unresolved issues and dependencies: The user's note about adding "the student" at the bottom of each objective was ambiguous; only the lead-in at the start was done. Other sports (football, handball, volleyball, athletics, fitness) were not touched. Wording needs a native-speaker pass for ar/ru/es.
Publication status: committed and pushed to the branch; not deployed.
Next owner / next action: User reviews the Hebrew wording, clarifies the "bottom" request, and decides whether to apply the same lead-in to the other sports.
