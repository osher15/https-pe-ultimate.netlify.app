'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),D=require('../../hm-data.js');
const W={part:70,exams:8,improve:11,team:11,know:0,bonusMax:10};
test('explicit final decision preserves provisional basis, missing components and input',()=>{
 const g={part:80,exams:{manual:75},finalOverride:{value:86.5,note:'Teacher review'}},before=JSON.stringify(g);
 const r=D.gradeResult(g,W,['manual']);assert.equal(r.value,86.5);assert.equal(r.final,86.5);assert.equal(r.status,D.GRADE_FINAL);assert.equal(r.calculatedValue,62);assert.equal(r.calculatedComplete,false);assert.deepEqual(r.missing,['improve','team']);assert.equal(r.examsAvg,75);assert.equal(JSON.stringify(g),before);
});
test('zero is a teacher final grade even without components; removal restores empty',()=>{
 const g={finalOverride:{value:0,note:''}},r=D.gradeResult(g,W,[]);assert.equal(r.final,0);assert.equal(r.calculatedValue,null);assert.equal(r.calculatedStatus,D.GRADE_EMPTY);delete g.finalOverride;assert.equal(D.gradeResult(g,W,[]).final,null);
});
test('invalid restored overrides never become final grades',()=>{
 for(const finalOverride of [null,[],{}, {value:'90',note:''},{value:-1,note:''},{value:101,note:''},{value:NaN,note:''},{value:Infinity,note:''},{value:85},{value:85,note:5},{value:85,note:'x'.repeat(501)}]){
  const r=D.gradeResult({part:50,finalOverride},W,[]);assert.equal(r.overrideInvalid,true);assert.equal(r.value,35);assert.equal(r.final,null);
 }
});
test('teacher decision persists while components and weights change; calculated basis updates',()=>{
 const g={part:80,finalOverride:{value:100,note:''}},w={part:100};let r=D.gradeResult(g,w,[]);assert.equal(r.calculatedValue,80);g.part=0;r=D.gradeResult(g,w,[]);assert.equal(r.final,100);assert.equal(r.calculatedValue,0);assert.equal(r.calculatedComplete,true);
});
