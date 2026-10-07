"use strict";
/* Personal collections: pure helpers (references only, limits, duplicates, damaged data). */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const D=require("../../hm-data.js");

test("colAdd trims, rejects empty and duplicate names (case/space folded) and the 20-collection limit",()=>{
  const a=D.colAdd([],"  שבוע   הכדורשת ",{now:1,today:"2026-10-07"});
  assert.equal(a.ok,true); assert.equal(a.list[0].name,"שבוע הכדורשת"); assert.deepEqual(a.list[0].items,[]);
  assert.equal(D.colAdd(a.list,"שבוע הכדורשת").reason,"dup");
  assert.equal(D.colAdd(a.list,"   ").reason,"empty");
  let l=[]; for(let i=0;i<D.COL_MAX;i++)l=D.colAdd(l,"c"+i,{now:i+10}).list;
  assert.equal(l.length,D.COL_MAX); assert.equal(D.colAdd(l,"extra").reason,"limit");
  assert.equal(D.colAdd([],"x".repeat(100)).list[0].name.length,D.COL_NAME);
});

test("colToggle adds then removes a reference; never duplicates; 100-item limit; unknown collection/kind refused",()=>{
  const l=D.colAdd([],"A",{now:1}).list, id=l[0].id, it={k:"g",id:"g-flags"};
  const on=D.colToggle(l,id,it); assert.equal(on.has,true); assert.equal(on.list[0].items.length,1);
  assert.equal(D.colToggle(on.list,id,it).has,false);
  assert.equal(D.colToggle(l,"nope",it).reason,"missing");
  assert.equal(D.colToggle(l,id,{k:"x",id:"1"}).ok,false);
  let c=l; for(let i=0;i<D.COL_ITEMS;i++)c=D.colToggle(c,id,{k:"g",id:"g"+i}).list;
  assert.equal(D.colToggle(c,id,{k:"g",id:"more"}).reason,"limit");
  assert.equal(D.colToggle(c,id,{k:"g",id:"g0"}).has,false,"removal still works at the limit");
  assert.equal(JSON.stringify(l[0].items),"[]","input unchanged");
});

test("same id of different kinds are different items; colsOf finds every collection holding it",()=>{
  let l=D.colAdd([],"A",{now:1}).list; l=D.colAdd(l,"B",{now:2}).list;
  l=D.colToggle(l,l[0].id,{k:"g",id:"1"}).list; l=D.colToggle(l,l[1].id,{k:"g",id:"1"}).list; l=D.colToggle(l,l[1].id,{k:"p",id:"1"}).list;
  assert.deepEqual(D.colsOf(l,{k:"g",id:"1"}),[l[0].id,l[1].id]);
  assert.deepEqual(D.colsOf(l,{k:"p",id:"1"}),[l[1].id]);
  assert.deepEqual(D.colsOf(l,{k:"b",id:"1"}),[]);
});

test("colRename keeps items, refuses duplicates; colDelete removes only the collection",()=>{
  let l=D.colAdd([],"A",{now:1}).list; l=D.colAdd(l,"B",{now:2}).list; l=D.colToggle(l,l[0].id,{k:"g",id:"1"}).list;
  const r=D.colRename(l,l[0].id,"C"); assert.equal(r.ok,true); assert.equal(r.list[0].name,"C"); assert.equal(r.list[0].items.length,1);
  assert.equal(D.colRename(l,l[0].id,"B").reason,"dup");
  assert.equal(D.colRename(l,l[0].id,"A").ok,true,"same name as itself is fine");
  const d=D.colDelete(l,l[0].id); assert.equal(d.ok,true); assert.equal(d.list.length,1); assert.equal(D.colDelete(l,"zz").ok,false);
});

test("normCollections repairs damaged stored data without losing the valid parts",()=>{
  const out=D.normCollections([null,{id:"a",name:"Ok",items:[{k:"g",id:"1"},{k:"g",id:"1"},{k:"q",id:"2"},{k:"p"},null]},{id:"a",name:"Dup id",items:[]},
    {id:"b",name:"ok",items:[]},{id:"c",name:"",items:[]},{id:"d",items:"x"},"junk",{id:"e",name:"Fine",items:"bad"}]);
  assert.deepEqual(out.map(c=>c.name),["Ok","Fine"]);
  assert.equal(out[0].items.length,1);
  assert.deepEqual(D.normCollections("x"),[]); assert.deepEqual(D.normCollections(undefined),[]);
});
