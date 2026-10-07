"use strict";
/* Personal editable copy of a lesson: pure library helpers and bank-to-plan conversion. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const D=require("../../hm-data.js");

const plan=(t,extra)=>Object.assign({id:"p-"+t,title:t,phases:[{n:"a",min:5,d:"x",k:"main"}]},extra||{});

test("libSave new: adds an entry, never touches the others, does not mutate the input",()=>{
  const lib=[{id:1,plan:plan("old")}], copy=JSON.stringify(lib);
  const r=D.libSave(lib,plan("new"),{mode:"new",now:10});
  assert.equal(r.ok,true); assert.equal(r.lib.length,2); assert.equal(r.lib[0].plan.title,"new"); assert.equal(r.lib[1].plan.title,"old");
  assert.equal(JSON.stringify(lib),copy,"input unchanged");
  const r2=D.libSave(r.lib,plan("n2"),{mode:"new",now:10});
  assert.notEqual(r2.id,10,"unique id even with the same clock value");
});

test("libSave new refuses at the limit instead of silently dropping the oldest plan",()=>{
  const lib=Array.from({length:D.PLAN_LIB_MAX},(_,i)=>({id:i+1,plan:plan("p"+i)}));
  const r=D.libSave(lib,plan("x"),{mode:"new"});
  assert.equal(r.ok,false); assert.equal(r.reason,"limit"); assert.equal(r.lib.length,D.PLAN_LIB_MAX);
  assert.equal(r.lib[D.PLAN_LIB_MAX-1].plan.title,"p"+(D.PLAN_LIB_MAX-1),"oldest still there");
});

test("libSave update: replaces only the chosen entry and keeps exactly one previous version",()=>{
  const lib=[{id:1,plan:plan("a")},{id:2,plan:plan("b")}];
  const r=D.libSave(lib,plan("b2"),{mode:"update",libId:2,now:99});
  assert.equal(r.ok,true); assert.equal(r.lib[0].plan.title,"a"); assert.equal(r.lib[1].plan.title,"b2");
  assert.equal(r.lib[1].prev.title,"b"); assert.equal(r.lib[1].updated,99);
  const r2=D.libSave(r.lib,plan("b3"),{mode:"update",libId:2});
  assert.equal(r2.lib[1].prev.title,"b2","only the last version is kept");
  assert.equal(D.libSave(lib,plan("z"),{mode:"update",libId:77}).reason,"missing");
  assert.equal(lib[1].plan.title,"b","input unchanged");
});

test("libUndo swaps back and forth; no previous version is reported",()=>{
  const lib=D.libSave([{id:1,plan:plan("a")}],plan("a2"),{mode:"update",libId:1}).lib;
  const u=D.libUndo(lib,1); assert.equal(u.ok,true); assert.equal(u.lib[0].plan.title,"a"); assert.equal(u.lib[0].prev.title,"a2");
  assert.equal(D.libUndo([{id:1,plan:plan("a")}],1).reason,"noprev");
  assert.equal(D.libUndo(lib,9).ok,false);
});

test("libSave ignores damaged entries and rejects a plan without phases",()=>{
  assert.equal(D.libSave([null,{id:3}],{title:"x"},{mode:"new"}).ok,false);
  const r=D.libSave([null,{id:3},{id:4,plan:plan("k")}],plan("n"),{mode:"new",now:1});
  assert.equal(r.lib.length,2,"damaged entries are not carried");
});

test("bankSectionMinutes reads the stated duration in five languages",()=>{
  assert.equal(D.bankSectionMinutes("משך: 7 דקות. מטרה"),7);
  assert.equal(D.bankSectionMinutes("Duration: 10 minutes. Goal"),10);
  assert.equal(D.bankSectionMinutes("المدة: 8 دقائق"),8);
  assert.equal(D.bankSectionMinutes("Длительность: 12 мин."),12);
  assert.equal(D.bankSectionMinutes("Duración: 5 minutos"),5);
  assert.equal(D.bankSectionMinutes("no duration here"),0);
  assert.equal(D.bankSectionMinutes("משך: 400 דקות"),0,"implausible value ignored");
});

test("bankToPlan: timed phases from the sections, source recorded, bank record untouched",()=>{
  const lesson={n:3,title:"T",ageRange:"9–11",duration:"45",objectives:["g1"],equipment:"cones",safety:["s1","s2"],
    sections:{opening:"משך: 3 דקות. x",warmup:"משך: 7 דקות. y",mainA:"משך: 20 דקות. z",closing:"משך: 5 דקות. w"},
    adaptations:"ad",assessment:"as",continuity:"next",contentVersion:"v1",reviewStatus:"draft"};
  const copy=JSON.stringify(lesson);
  const p=D.bankToPlan(lesson,{sport:"football",lang:"he",labels:{opening:"O",warmup:"W",mainA:"M",closing:"C"},newId:"plz",today:"2026-10-07"});
  assert.equal(JSON.stringify(lesson),copy);
  assert.deepEqual(p.phases.map(x=>[x.n,x.min,x.k]),[["O",3,"warm"],["W",7,"warm"],["M",20,"main"],["C",5,"cool"]]);
  assert.equal(p.src.kind,"bank"); assert.equal(p.src.id,"football:3"); assert.equal(p.src.v,"v1"); assert.equal(p.src.status,"draft"); assert.equal(p.src.timeGuess,false);
  assert.equal(p.safe,"s1 · s2"); assert.equal(p.grade,"mid"); assert.equal(p.id,"plz");
  assert.equal(D.bankToPlan({sections:{}},{}),null);
  const g=D.bankToPlan({n:1,title:"T",ageRange:"15–17",sections:{mainA:"no minutes"}},{sport:"x"});
  assert.equal(g.grade,"high"); assert.equal(g.phases[0].min,3); assert.equal(g.src.timeGuess,true);
});
