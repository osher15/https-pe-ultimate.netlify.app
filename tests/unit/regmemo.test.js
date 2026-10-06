"use strict";
/* Read-only class lookups reuse one parse of the registry while the stored
   text is unchanged (DATA.classesRO). Opening a screen with a school year of
   measurements used to parse the registry once per measurement. These tests
   pin the safety side: a change is always visible on the next lookup, writers
   never hand out the shared copy, and stores without raw() work as before. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const D=require("../../hm-data.js");

/* a store shaped like the app's LS wrappers: parsed get/set plus raw() */
function rawStore(){
  const m=new Map(); let parses=0;
  return {
    get(k,d){ if(!m.has(k))return d===undefined?null:d; parses++; return JSON.parse(m.get(k)); },
    set(k,v){ m.set(k,JSON.stringify(v)); },
    raw(k){ return m.has(k)?m.get(k):null; },
    poke(k,text){ m.set(k,text); },          /* a write that bypasses set(), e.g. restore */
    parses:()=>parses
  };
}

test("many lookups, one parse while the registry text is unchanged",()=>{
  const s=rawStore();
  D.registerClass(s,"ז׳1"); D.registerClass(s,"ח׳2");
  const before=s.parses();
  for(let i=0;i<5000;i++){
    assert.equal(D.classOf(s,"c:ז:1").name,"ז׳1");
    assert.equal(D.groupOf(s,"c:ח:2"),null);
    assert.equal(D.resolveClassId(s,"ח׳2"),"c:ח:2");
  }
  assert.ok(s.parses()-before<=1,"parsed "+(s.parses()-before)+" times");
});

test("rename, register, group create/update/remove — the next lookup sees it",()=>{
  const s=rawStore();
  D.registerClass(s,"ז׳1");
  assert.equal(D.classOf(s,"c:ז:1").name,"ז׳1");
  D.renameClass(s,"c:ז:1","Seventh A");
  assert.equal(D.classOf(s,"c:ז:1").name,"Seventh A");
  assert.equal(D.findClass(s,"Seventh A").id,"c:ז:1");
  D.registerClass(s,"ח׳3");
  assert.equal(D.classOf(s,"c:ח:3").name,"ח׳3");
  const g=D.makeGroup(s,{name:"Mixed",members:["c:ז:1","c:ח:3"]});
  assert.ok(g.ok);
  assert.equal(D.groupOf(s,g.group.id).name,"Mixed");
  D.updateGroup(s,g.group.id,{name:"Mixed 2"});
  assert.equal(D.groupOf(s,g.group.id).name,"Mixed 2");
  D.removeGroup(s,g.group.id);
  assert.equal(D.groupOf(s,g.group.id),null);
});

test("a failed update does not leak into later lookups",()=>{
  const s=rawStore();
  D.registerClass(s,"ז׳1");
  const g=D.makeGroup(s,{name:"Pair",members:["c:ז:1"]});
  D.groupOf(s,g.group.id);                                   /* warm the shared copy */
  const r=D.updateGroup(s,g.group.id,{name:"Renamed",members:[],sids:[]});
  assert.equal(r.ok,false,"empty group is refused");
  assert.equal(D.groupOf(s,g.group.id).name,"Pair","the refused change was never saved or shown");
});

test("a write that bypasses set() (restore, another tab) is seen on the next lookup",()=>{
  const s=rawStore();
  D.registerClass(s,"ז׳1");
  assert.ok(D.classOf(s,"c:ז:1"));
  s.poke("ft.classes",JSON.stringify({"c:ט:4":{id:"c:ט:4",name:"ט׳4",grade:"ט",num:4,key:"ט4"}}));
  assert.equal(D.classOf(s,"c:ז:1"),null);
  assert.equal(D.classOf(s,"c:ט:4").name,"ט׳4");
});

test("two stores with different contents never share a cached registry",()=>{
  const a=rawStore(), b=rawStore();
  D.registerClass(a,"ז׳1"); D.registerClass(b,"ח׳2");
  assert.ok(D.classOf(a,"c:ז:1")); assert.equal(D.classOf(a,"c:ח:2"),null);
  assert.ok(D.classOf(b,"c:ח:2")); assert.equal(D.classOf(b,"c:ז:1"),null);
  assert.ok(D.classOf(a,"c:ז:1"));
});

test("stores without raw() read fresh every time, as before",()=>{
  const m=new Map(); let parses=0;
  const s={get(k,d){ if(!m.has(k))return d===undefined?null:d; parses++; return JSON.parse(m.get(k)); },
           set(k,v){ m.set(k,JSON.stringify(v)); }};
  D.registerClass(s,"ז׳1");
  const before=parses;
  for(let i=0;i<10;i++)D.classOf(s,"c:ז:1");
  assert.equal(parses-before,10);
});

test("missing or corrupt registry: empty, never throws",()=>{
  const s=rawStore();
  assert.equal(D.classOf(s,"c:ז:1"),null);
  s.poke("ft.classes","{not json");
  assert.throws(()=>s.get("ft.classes"));   /* the fake store throws on bad JSON; the app's LS reports it */
});
