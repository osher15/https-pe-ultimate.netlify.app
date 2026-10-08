"use strict";
/* Every basketball observable objective must open with a student-subject
   lead-in in its own language, so a teacher reads it as a student outcome. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const win={};
new Function("window",fs.readFileSync(path.join(__dirname,"../../hm-lessonbank-basketball.js"),"utf8"))(win);
const sport=win.LESSONBANK.sports.basketball;

const LEAD={
  he:/^התלמיד (יצליח|יבצע) /,
  en:/^(The student can |(As|With|In) [^,]+, the student can )/,
  ar:/^يستطيع الطالب أن /,
  ru:/^Ученик сможет /,
  es:/^El alumno será capaz de /
};

for(const lang of Object.keys(LEAD)){
  test(`basketball objectives (${lang}) all start with the student lead-in`,()=>{
    assert.equal(sport[lang].length,10);
    for(const lesson of sport[lang]){
      assert.ok(lesson.objectives.length>=4,`lesson ${lesson.n} has objectives`);
      for(const o of lesson.objectives)
        assert.match(o,LEAD[lang],`lesson ${lesson.n}: ${o}`);
    }
  });
}
