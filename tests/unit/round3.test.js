"use strict";
/* סבב 3 — כללי הציון: 0 הוא ערך, שדה ריק אינו 0, סופי דורש כל רכיב
   במשקל חיובי, ורכיב במשקל 0 אינו חוסם. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const D=require("../../hm-data.js");

const W={part:70,exams:30,improve:0,team:0,know:0};

test("0 הוא ציון תקף: נכנס לחישוב ומשלים רכיב",()=>{
  const r=D.gradeResult({part:0,exams:{t1:100}},W,["t1"]);
  assert.equal(r.status,D.GRADE_FINAL);
  assert.equal(r.value,30);
  assert.deepEqual(r.missing,[]);
});

test("שדה ריק או חסר אינו 0: הרכיב חסר והציון זמני",()=>{
  for(const part of [undefined,null,""]){
    const r=D.gradeResult({part,exams:{t1:100}},W,["t1"]);
    assert.equal(r.status,D.GRADE_PROV,String(part));
    assert.deepEqual(r.missing,["part"]);
    assert.equal(r.final,null);
  }
});

test("סופי דורש את כל הרכיבים במשקל חיובי",()=>{
  const r=D.gradeResult({part:80},W,["t1"]);
  assert.equal(r.status,D.GRADE_PROV);
  assert.deepEqual(r.missing,["exams"]);
});

test("רכיב במשקל 0 אינו חוסם סופי, גם כשהוא ריק",()=>{
  const r=D.gradeResult({part:90},{part:100,exams:0,improve:0,team:0,know:0},[]);
  assert.equal(r.status,D.GRADE_FINAL);
  assert.equal(r.final,90);
});

test("אין שום רכיב — ריק, לא 0",()=>{
  const r=D.gradeResult({},W,["t1"]);
  assert.equal(r.status,D.GRADE_EMPTY);
  assert.equal(r.value,null);
});
