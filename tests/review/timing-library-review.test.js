"use strict";
// Independent review probes. Not registered in the production unit-test glob.
// The fractional-allocation regression intentionally fails on reviewed main.
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {spawnSync}=require("node:child_process");
const {webcrypto,createHash}=require("node:crypto");
const ROOT=path.resolve(__dirname,"../..");
const D=require(path.join(ROOT,"hm-data.js"));
function arrayFrom(file,name){
  const src=fs.readFileSync(path.join(ROOT,file),"utf8");
  const match=src.match(new RegExp("const "+name+"=\\[[\\s\\S]*?\\n\\];"));
  return vm.runInNewContext("("+match[0].replace("const "+name+"=","").replace(/;$/,"")+")");
}
const topics=arrayFrom("hm-lesson.js","TOPICS");
const games=arrayFrom("hm-know.js","GAMES");

test("all 108 variants conserve integer allocations across 9 pace/transition combinations",()=>{
  let count=0;
  for(const topic of topics)for(const grade of ["mid","high"])for(const v of topic.main[grade]||[])
    for(const alloc of [1,8,14,18,20,25,32,40,60,90])for(const pace of ["fast","normal","slow"])for(const trans of ["quick","normal","slow"]){
      const f=D.variantFit(v,alloc,{pace,trans});
      const total=f.fitted.reduce((a,b)=>a+b,0)+f.overhead;
      const explained=f.status==="short"?total+f.gap:f.status==="over"?total-f.gap:total;
      assert.equal(explained,alloc,topic.id+" / "+v.n);
      f.fitted.forEach((m,i)=>assert.ok(m>=f.sr.lo[i]&&m<=f.sr.hi[i]));
      count++;
    }
  assert.equal(count,9720);
});

test("REGRESSION: fractional allocation must return or reject without blocking",()=>{
  // Isolate the synchronous fitter so a defect cannot hang the review runner.
  const script="const D=require('./hm-data.js');D.variantFit({d:['work'],t:[10]},10.5);console.log('returned');";
  const child=spawnSync(process.execPath,["-e",script],{cwd:ROOT,timeout:2000,encoding:"utf8"});
  assert.notEqual(child.error&&child.error.code,"ETIMEDOUT","fitSteps/spreadMinutes never returned for 10.5 minutes");
  assert.equal(child.status,0,child.stderr);
});

test("current games have usable grade/pupil metadata; an empty filter preserves all 42",()=>{
  assert.equal(games.length,42);
  for(const game of games){
    const m=D.parseGameMeta(game);
    assert.ok(m.gFrom>=1&&m.gTo>=m.gFrom&&m.gTo<=12);
    assert.ok(m.pMin>=1&&m.pMax>=m.pMin);
    assert.equal(D.gameMatches(m,{}),true);
  }
});

test("fingerprint hashes exact UTF-8 file bytes, including whitespace and encrypted envelope",async()=>{
  const src=fs.readFileSync(path.join(ROOT,"hm-app.js"),"utf8");
  const fn=src.match(/async function bkFingerprint\(text\)\{[\s\S]*?\n\}/)[0];
  const context={window:{crypto:webcrypto},crypto:webcrypto,TextEncoder,Uint8Array};
  vm.createContext(context);vm.runInContext(fn,context);
  for(const text of ['{"name":"אבג العربية"}',' {"name":"אבג العربية"}',JSON.stringify({kind:"backup-encrypted",salt:"abc",data:"xyz"})]){
    const hex=createHash("sha256").update(text,"utf8").digest("hex").slice(0,8).toUpperCase();
    assert.equal(await context.bkFingerprint(text),hex.slice(0,4)+"-"+hex.slice(4));
  }
  assert.notEqual(await context.bkFingerprint("{}"),await context.bkFingerprint(" {}"));
});

test("fingerprint absence is graceful when Web Crypto is unavailable",async()=>{
  const fn=fs.readFileSync(path.join(ROOT,"hm-app.js"),"utf8").match(/async function bkFingerprint\(text\)\{[\s\S]*?\n\}/)[0];
  const context={window:{}};vm.createContext(context);vm.runInContext(fn,context);
  assert.equal(await context.bkFingerprint("{}"),"");
});
