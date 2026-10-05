"use strict";
const {test}=require("node:test");const assert=require("node:assert/strict");
const {replace}=require("../../hm-backup-restore.js");
function storage(){
 const map=new Map([["p.a","old"],["p.removed","keep"],["p.skip","device"],["other","untouched"]]);
 return {map,get length(){return map.size;},key:i=>[...map.keys()][i],getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
}
const incoming={a:"new",b:"added"},skip={skip:1};
test("replace exact namespace and protect device/external keys",()=>{
 const be=storage();const r=replace(be,"p.",skip,{...incoming,skip:"incoming"});assert.equal(r.failed,0);
 assert.deepEqual([...be.map],[['p.a','new'],['p.skip','device'],['other','untouched'],['p.b','added']]);
});
for(const failure of ["get","key","length"]){test("unreadable "+failure+" aborts without mutation",()=>{
 const be=storage(),before=[...be.map];
 if(failure==='get')be.getItem=()=>{throw Error('read');};
 if(failure==='key')be.key=()=>null;
 if(failure==='length')Object.defineProperty(be,'length',{get(){throw Error('length');}});
 assert.throws(()=>replace(be,'p.',skip,incoming));assert.deepEqual([...be.map],before);
});}
for(const failure of ["write","delete","silent-write","silent-delete"]){test(failure+" rolls back exact raw values",()=>{
 const be=storage(),before=[...be.map],set=be.setItem,remove=be.removeItem;
 be.setItem=(k,v)=>{if(k==='p.b'){if(failure==='write')throw Error('quota');if(failure==='silent-write')return;}return set(k,v);};
 be.removeItem=k=>{if(k==='p.removed'){if(failure==='delete')throw Error('delete');if(failure==='silent-delete')return;}return remove(k);};
 const r=replace(be,'p.',skip,incoming);assert.equal(r.failed,1);assert.equal(r.rolledBack,true);
 assert.deepEqual(Object.fromEntries(be.map),Object.fromEntries(before));assert.equal(r.recovery.a,'old');
});}
test("permanent rollback failure is explicit and recovery snapshot remains available",()=>{
 const be=storage(),set=be.setItem;be.setItem=(k,v)=>{if(k==='p.b'||v==='old')throw Error('blocked');return set(k,v);};
 const r=replace(be,'p.',skip,incoming);assert.equal(r.rolledBack,false);assert.equal(r.recovery.a,'old');assert.equal(r.recovery.removed,'keep');
});
test("first write quota failure needs no destructive rollback writes",()=>{
 const be=storage(),before=[...be.map];be.setItem=()=>{throw Error('quota');};
 assert.equal(replace(be,'p.',skip,incoming).rolledBack,true);assert.deepEqual([...be.map],before);
});
test("invalid values rejected before mutation and unusual keys use own properties",()=>{
 const be=storage(),before=[...be.map];assert.throws(()=>replace(be,'p.',skip,{a:2}));assert.deepEqual([...be.map],before);
 const data=JSON.parse('{"__proto__":"literal","constructor":"value"}');assert.equal(replace(be,'p.',skip,data).failed,0);assert.equal(be.getItem('p.__proto__'),'literal');
});
