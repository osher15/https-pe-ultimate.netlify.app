"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const A=require("../../hm-assessment-data.js");
const defs=[{id:"push",dir:"high"}];
const policy={cid:"c:ט:3",period:"Q1",from:"2026-09-01",to:"2026-12-31",tests:[{id:"push"}]};
test("configuration rejects unsupported versions, malformed policies and duplicates",()=>{
  for(const value of [null,[],{version:2,policies:[]},{version:1,policies:{}},{version:1,policies:[null]},{version:1,policies:[policy,policy]}])assert.equal(A.validateEnvelope(value,defs).ok,false);
});
test("update replaces only the same class/period without mutating the input",()=>{
  const other={...policy,period:"Q2"},value={version:1,policies:[policy,other]},before=JSON.stringify(value);
  const next=A.updateEnvelope(value,{...policy,to:"2026-11-30"},defs);
  assert.equal(next.ok,true);assert.equal(next.value.policies.length,2);assert.equal(next.value.policies[0].period,"Q2");assert.equal(JSON.stringify(value),before);
});
test("bad existing configuration and invalid proposed policy cannot be silently replaced",()=>{
  assert.equal(A.updateEnvelope({version:99,policies:[]},policy,defs).ok,false);
  assert.equal(A.updateEnvelope({version:1,policies:[]},{...policy,tests:[]},defs).ok,false);
});
