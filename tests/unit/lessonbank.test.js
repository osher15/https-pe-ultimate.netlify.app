"use strict";
/* Structural validator for the lesson bank: every available sport has 10 complete lessons in each of the five languages. */
const test=require("node:test"), assert=require("node:assert/strict");
const {loadExisting,FLOW_KEYS}=require("../../tools/notion-lessons-import.js");
const LB=loadExisting(require("path").join(__dirname,"../.."));
const TEXT=["title","identity","ageRange","duration","purpose","priorKnowledge","pathwayPosition","unitContribution","equipment","adaptations","assessment","reflection","continuity","teacherSummary"];
const LIST=["objectives","safety","commonErrors","teachingPoints"];

test("bank covers every available sport in five languages with 10 lessons",()=>{
  assert.equal(JSON.stringify(Object.keys(LB.sports).sort()),JSON.stringify(Array.from(LB.meta.available).sort()));
  LB.meta.available.forEach(sp=>LB.meta.langs.forEach(l=>{
    const arr=LB.sports[sp][l]; assert.equal(arr&&arr.length,LB.meta.lessonsPerSport,sp+"/"+l);
    arr.forEach((x,i)=>assert.equal(x.n,i+1,sp+"/"+l+" numbering"));
  }));
});
test("every lesson has all required fields and six flow sections",()=>{
  LB.meta.available.forEach(sp=>LB.meta.langs.forEach(l=>LB.sports[sp][l].forEach(x=>{
    const id=sp+"/"+l+"/"+x.n;
    TEXT.forEach(k=>assert.ok(typeof x[k]==="string"&&x[k].trim(),id+" "+k));
    LIST.forEach(k=>assert.ok(Array.isArray(x[k])&&x[k].length,id+" "+k));
    FLOW_KEYS.forEach(k=>assert.ok(x.sections&&x.sections[k]&&x.sections[k].trim(),id+" section "+k));
    assert.match(x.ageRange,/^\d+(–\d+|\+)?$|^\d+-\d+$/,id+" ageRange");
    assert.ok(+x.duration>=20&&+x.duration<=90,id+" duration");
  })));
});
test("data does not mention another product by name",()=>{
  const fs=require("fs"),path=require("path");
  LB.meta.available.forEach(sp=>assert.ok(!/HaMigrash\s*PRO|המגרש\s*PRO/i.test(fs.readFileSync(path.join(__dirname,"../../hm-lessonbank-"+sp+".js"),"utf8")),sp));
});
