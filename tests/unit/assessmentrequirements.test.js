"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const A=require("../../hm-assessment-data.js");
const D=require("../../hm-data.js");
const cid="c:ט:3",other="c:י:1";
const defs=[{id:"push",dir:"high"},{id:"agility",dir:"low"},{id:"situp",dir:"high"}];
const student={id:"a",name:"Same Name",cid,cls:"ט׳3",grades:{Q1:{exams:{manual:87}}}};
const rule={target:40,step:5,points:5,rounding:"ceil",min:0,max:100};
const policy=extra=>Object.assign({cid,period:"Q1",from:"2026-09-01",to:"2026-12-31",tests:[{id:"push",rule}]},extra);
const row=(val,extra)=>Object.assign({id:"r1",sid:"a",name:"Same Name",cid,cls:"ט׳3",test:"push",d:"2026-10-03",ts:1,val},extra);
const report=(rows,p=policy(),s=student)=>A.studentAssessment(rows,s,p,defs);

test("target 40 and each five fewer costs five points; zero is measured",()=>{
  for(const [v,want] of [[45,100],[40,100],[35,95],[30,90],[0,60]])assert.equal(A.score(v,"high",rule),want);
  const r=report([row(0)]);assert.equal(r.tests[0].status,"measured");assert.equal(r.tests[0].suggestedScore,60);assert.deepEqual(r.missing,[]);
});
test("teacher chooses begun, complete or fractional steps explicitly",()=>{
  assert.equal(A.score(39,"high",rule),95);
  assert.equal(A.score(39,"high",{...rule,rounding:"floor"}),100);
  assert.equal(A.score(39,"high",{...rule,rounding:"linear"}),99);
});
test("lower time earns a better score; zero time is invalid",()=>{
  const r={...rule,target:10,step:1};
  assert.equal(A.score(9,"low",r),100);assert.equal(A.score(12,"low",r),90);assert.equal(A.score(0,"low",r),null);
});
test("decimal step boundaries are stable for both directions",()=>{
  const r={...rule,target:10,step:0.1};
  assert.equal(A.score(10.3,"low",r),85);assert.equal(A.score(9.7,"high",r),85);
});
test("scores are bounded and rules cannot exceed 100",()=>{
  assert.equal(A.score(200,"low",{...rule,target:10,min:20}),20);
  assert.equal(A.score(40,"high",{...rule,max:101}),null);
  assert.equal(A.score(40,"high",{...rule,max:99.999}),99.999);
});
test("invalid measurement values never become a score",()=>{
  for(const val of [null,undefined,NaN,Infinity,-1,"40",false])assert.equal(A.score(val,"high",rule),null);
});
test("policy requires stable real-class ID, explicit period and dates",()=>{
  for(const extra of [{cid:"ט׳3"},{cid:"g:combined"},{period:""},{from:""},{to:null},{from:"2027-01-01"},{tests:[]}])assert.equal(A.validatePolicy(policy(extra),defs).ok,false);
});
test("date validation uses real calendar dates including leap years",()=>{
  for(const d of ["2024-02-29","2026-12-31"])assert.equal(A.validDate(d),true);
  for(const d of ["2026-02-29","2026-02-30","2026-13-01","2026-2-01","2026-10-03T00:00:00Z",null])assert.equal(A.validDate(d),false);
});
test("unknown, repeated or directionless required tests fail validation",()=>{
  assert.equal(A.validatePolicy(policy({tests:[{id:"missing"}]}),defs).ok,false);
  assert.equal(A.validatePolicy(policy({tests:[{id:"push"},{id:"push"}]}),defs).ok,false);
  assert.equal(A.validatePolicy(policy(),[{id:"push"}]).ok,false);
});
test("rules reject unspecified rounding, unsafe bounds and zero step",()=>{
  for(const changes of [{rounding:null},{rounding:"round"},{step:0},{step:"5"},{points:0},{target:-1},{min:101},{min:50,max:40}])assert.equal(A.validatePolicy(policy({tests:[{id:"push",rule:{...rule,...changes}}]}),defs).ok,false);
});
test("low-direction target must be positive",()=>{
  const p=policy({tests:[{id:"agility",rule:{...rule,target:0}}]});
  assert.equal(A.validatePolicy(p,defs).ok,false);assert.equal(A.score(5,"low",p.tests[0].rule),null);
});
test("period boundaries are inclusive; earlier and later records do not complete it",()=>{
  assert.equal(report([row(40,{d:"2026-08-31"}),row(40,{d:"2027-01-01"})]).tests[0].status,"missing");
  const r=report([row(10,{id:"first",d:"2026-09-01"}),row(20,{id:"last",d:"2026-12-31"})]);
  assert.equal(r.tests[0].validCount,2);assert.equal(r.tests[0].best.id,"last");
});
test("invalid or undated records cannot satisfy a dated requirement",()=>{
  for(const d of [null,"","2026-02-30","2026-10-03T10:00:00Z"]){const r=report([row(40,{d})]);assert.equal(r.complete,false);assert.equal(r.invalidDateRows,1);}
});
test("registered custom class IDs and canonical free-class IDs are accepted",()=>{
  const store={get:()=>({custom:{id:"custom",name:"PE group",kind:"class"}})};
  assert.equal(A.validatePolicy(policy({cid:"custom"}),defs,store).ok,true);
  assert.equal(A.validatePolicy(policy({cid:"cn:PEclass"}),defs).ok,true);
  assert.equal(A.validatePolicy(policy({cid:"custom"}),defs).ok,false);
  assert.equal(A.validatePolicy(policy({cid:"custom"}),defs,{get:()=>({custom:{id:"custom",kind:"group"}})}).ok,false);
});
test("best result and latest result are separate, full in-period history retained",()=>{
  const r=report([row(30,{id:"early",d:"2026-09-01"}),row(40,{id:"best",d:"2026-10-01"}),row(35,{id:"latest",d:"2026-11-01"})]);
  assert.equal(r.tests[0].best.id,"best");assert.equal(r.tests[0].latest.id,"latest");assert.equal(r.tests[0].history.length,3);assert.equal(r.tests[0].suggestedScore,100);
});
test("duplicate names are isolated by stable student ID",()=>{
  const r=report([row(40,{sid:"b"})]);assert.equal(r.complete,false);
  assert.equal(report([row(40)],policy(),{...student,id:"b"}).complete,false);
});
test("unidentified legacy rows remain visible as a warning, not attributed by name",()=>{
  const r=report([row(40,{sid:null})]);assert.equal(r.complete,false);assert.equal(r.unidentifiedRows,1);
});
test("another class cannot supply results even for the same pupil",()=>{
  assert.equal(report([row(40,{cid:other,cls:"י׳1"})]).complete,false);
});
test("class rename preserves a measurement with stable cid",()=>{
  const r=report([row(40,{cls:"Old label"})],policy(),{...student,cls:"New label"});assert.equal(r.complete,true);
});
test("student-class mismatch and missing student ID return errors, never complete",()=>{
  assert.deepEqual(report([],policy(),{...student,cid:other}).errors,["student-class"]);
  assert.ok(report([],policy(),{...student,id:null}).errors.includes("student-id"));
});
test("required test with no rule tracks completeness without inventing a grade",()=>{
  const r=report([row(40)],policy({tests:[{id:"push"},{id:"situp"}]}));
  assert.equal(r.tests[0].suggestedScore,null);assert.deepEqual(r.missing,["situp"]);assert.equal(r.complete,false);
});
test("unrequired class tests do not silently become requirements",()=>{
  assert.deepEqual(report([row(20,{test:"situp"}),row(40)]).tests.map(t=>t.testId),["push"]);
});
test("a different period policy has its own tests and target",()=>{
  const p=policy({period:"Q2",from:"2027-01-01",to:"2027-03-31",tests:[{id:"situp",rule:{...rule,target:50}}]});
  const r=report([row(40),row(40,{test:"situp",d:"2027-02-01"})],p);
  assert.equal(r.period,"Q2");assert.equal(r.tests[0].suggestedScore,90);assert.equal(r.complete,true);
});
test("invalid results are missing with a reason, not a zero score",()=>{
  const r=report([row(NaN)]);assert.equal(r.tests[0].reason,"invalid-results");assert.equal(r.tests[0].invalidCount,1);assert.equal(r.tests[0].suggestedScore,null);
});
test("invalid plus legitimate results keep history and use valid best only",()=>{
  const r=report([row(-1),row(20,{id:"valid"})]);assert.equal(r.tests[0].history.length,2);assert.equal(r.tests[0].best.id,"valid");assert.equal(r.tests[0].invalidCount,1);assert.equal(r.complete,true);
});
test("explicit whole-period exemption has a reason and does not generate a score",()=>{
  const r=report([row(40)],policy({exemptions:[{sid:"a",test:"push",reason:"Teacher-approved exemption"}]}));
  assert.equal(r.tests[0].status,"exempt");assert.equal(r.tests[0].suggestedScore,null);assert.deepEqual(r.exempt,["push"]);assert.equal(r.complete,true);assert.equal(r.tests[0].history.length,1);
});
test("exemptions do not leak to another pupil or another test",()=>{
  const r=report([],policy({tests:[{id:"push"},{id:"situp"}],exemptions:[{sid:"b",test:"push",reason:"Medical"},{sid:"a",test:"situp",reason:"Medical"}]}));
  assert.deepEqual(r.missing,["push"]);assert.deepEqual(r.exempt,["situp"]);
});
test("invalid exemptions fail closed",()=>{
  for(const exemption of [{sid:"",test:"push",reason:"Medical"},{sid:"a",test:"other",reason:"Medical"},{sid:"a",test:"push",reason:" "}])assert.equal(A.validatePolicy(policy({exemptions:[exemption]}),defs).ok,false);
  const e={sid:"a",test:"push",reason:"Medical"};assert.equal(A.validatePolicy(policy({exemptions:[e,e]}),defs).ok,false);
});
test("combined view resolves each member's own real-class policy",()=>{
  const pupils=[student,{...student,id:"b",cid:other,cls:"י׳1"}];
  const policies=[policy(),policy({cid:other,tests:[{id:"situp"}]})];
  const rows=[row(40),row(20,{sid:"b",cid:other,test:"situp"})];
  const combined=pupils.map(s=>A.studentAssessment(rows,s,policies.find(p=>p.cid===D.cidOfStudent(s)),defs));
  assert.deepEqual(combined.map(r=>r.tests[0].testId),["push","situp"]);assert.ok(combined.every(r=>r.complete));
});
test("calculation does not mutate measurements, policies, identities or manual grades",()=>{
  const rows=[row(30),row(40,{id:"best"})],p=policy();
  const before=JSON.stringify({rows,p,student,defs});report(rows,p);
  assert.equal(JSON.stringify({rows,p,student,defs}),before);assert.equal(student.grades.Q1.exams.manual,87);
});
test("invalid policy produces an error without a partial completion result",()=>{
  const r=report([row(40)],policy({tests:[{id:"push",rule:{...rule,step:0}}]}));
  assert.equal(r.ok,false);assert.equal(r.complete,undefined);assert.equal(r.tests,undefined);
});
test("browser export uses the same existing HMDATA dependency and scoring",()=>{
  const vm=require("node:vm"),fs=require("node:fs");
  const context={window:{HMDATA:D}};
  vm.runInNewContext(fs.readFileSync(require.resolve("../../hm-assessment-data.js"),"utf8"),context);
  assert.equal(context.window.HMAssessment.score(35,"high",rule),95);
  assert.equal(context.window.HMAssessment.studentAssessment([row(0)],student,policy(),defs).complete,true);
});
