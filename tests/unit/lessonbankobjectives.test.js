"use strict";
/* Every observable objective in every sport bank must read as a student
   outcome: it opens with the student-subject lead-in of its own language
   (optionally after a short role or time clause such as "As the ball carrier,"). */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const SPORTS=["basketball","football","handball","volleyball","athletics","fitness"];
const win={};
for(const s of SPORTS)
  new Function("window",fs.readFileSync(path.join(__dirname,`../../hm-lessonbank-${s}.js`),"utf8"))(win);

const LEAD={
  he:/^התלמיד (יצליח|יבצע)[ ,]/,
  en:/^(The student can |[^.]{0,80}, the student can )/,
  ar:/^(يستطيع الطالب[ ،]|[^.]{0,80}، يستطيع الطالب[ ،])/,
  ru:/^Ученик сможет[ ,]/,
  es:/^(El alumno será capaz de |[^.]{0,80}, el alumno será capaz de )/
};

for(const sport of SPORTS)
  for(const lang of Object.keys(LEAD))
    test(`${sport} objectives (${lang}) all start with the student lead-in`,()=>{
      const lessons=win.LESSONBANK.sports[sport][lang];
      assert.equal(lessons.length,10);
      for(const lesson of lessons){
        assert.ok(lesson.objectives.length>=3,`lesson ${lesson.n} has objectives`);
        for(const o of lesson.objectives)
          assert.match(o,LEAD[lang],`${sport} ${lang} lesson ${lesson.n}: ${o}`);
      }
    });
