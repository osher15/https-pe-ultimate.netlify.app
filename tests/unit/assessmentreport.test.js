"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const R=require("../../hm-assessment-report.js");
const cid="c:ט:3",other="c:י:1",defs=[{id:"push",dir:"high"},{id:"run",dir:"low"}];
const pupils=[{id:"a",name:"Same",cid,grades:{Q1:{exams:{manual:87}}}},{id:"b",name:"Same",cid},{id:"c",name:"Other",cid:other}];
const policy={cid,period:"Q1",from:"2026-09-01",to:"2026-12-31",tests:[{id:"push",rule:{target:40,step:5,points:5,min:0,max:100,rounding:"ceil"}},{id:"run"}]};
const row=(sid,val,extra={})=>({sid,cid,test:"push",d:"2026-10-03",val,...extra});
test("class snapshot uses stable pupil IDs and does not mutate final grades",()=>{
 const before=JSON.stringify(pupils),r=R.snapshot(pupils,[row("a",35),row("b",0),row("c",40,{cid:other})],policy,defs);
 assert.equal(r.ok,true);assert.equal(r.reports.length,2);assert.equal(r.reports[0].tests[0].suggestedScore,95);assert.equal(r.reports[1].tests[0].best.val,0);assert.deepEqual(r.reports[0].missing,["run"]);assert.equal(JSON.stringify(pupils),before);
});
test("pupil snapshot excludes every other pupil including duplicate names",()=>{
 const r=R.snapshot(pupils,[row("a",35),row("b",40)],policy,defs,null,"a");assert.deepEqual(r.reports.map(s=>s.studentId),["a"]);
 assert.equal(R.snapshot(pupils,[],policy,defs,null,"c").ok,false);
});
test("period boundaries, exemption and invalid values keep missing scores blank",()=>{
 const p={...policy,exemptions:[{sid:"a",test:"run",reason:"Medical"}]};
 const r=R.snapshot(pupils,[row("a",45,{d:"2026-08-31"}),row("a",35,{d:"2026-09-01"}),row("a",40,{d:"2026-12-31"}),row("b",null)],p,defs);
 assert.equal(r.reports[0].tests[0].best.val,40);assert.equal(r.reports[0].tests[0].history.length,2);assert.equal(r.reports[0].tests[1].status,"exempt");assert.equal(r.reports[0].tests[1].suggestedScore,null);assert.equal(r.reports[1].tests[0].suggestedScore,null);
});
test("bad identities or configuration cannot create a success report",()=>{
 assert.equal(R.snapshot({},[],policy,defs).ok,false);assert.equal(R.snapshot(pupils,null,policy,defs).ok,false);
 assert.equal(R.snapshot([...pupils,pupils[0]],[],policy,defs).ok,false);assert.equal(R.snapshot(pupils,[],{...policy,from:"bad"},defs).ok,false);
});
