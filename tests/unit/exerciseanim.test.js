"use strict";
/* C17 / Issue #59 - the FIT module shows the cartoon exercise animations
   (exercise-anim/svg + exercise-anim/still), keyed by exercise id. */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.join(__dirname,"..","..");
const src=fs.readFileSync(path.join(ROOT,"hm-app.js"),"utf8");
const a=src.indexOf("const FIT=(function(){");
const fitEnd=src.indexOf("\n})();",a);
const fit=src.slice(a,fitEnd);
const b=fit.indexOf("const EX=[");
const exEnd=fit.indexOf("\n  ];",b);
const exBlock=fit.slice(b,exEnd);
const ids=[...exBlock.matchAll(/\{id:"([\w-]+)",name:/g)].map(m=>m[1]);

test("FIT module and EX list were located",()=>{
  assert.ok(a>0&&fitEnd>a&&b>0&&exEnd>b);
  assert.ok(ids.length>=47,"expected at least 47 exercises, got "+ids.length);
  assert.equal(new Set(ids).size,ids.length,"duplicate exercise ids");
});

test("every EX id has an animated svg and a still svg",()=>{
  for(const id of ids)for(const kind of ["svg","still"]){
    const f=path.join(ROOT,"exercise-anim",kind,id+".svg");
    assert.ok(fs.existsSync(f),"missing "+kind+"/"+id+".svg");
    const t=fs.readFileSync(f,"utf8");
    assert.ok(/^<svg[\s>]/.test(t)&&t.includes("</svg>"),"not an svg: "+f);
  }
});

test("exercise-anim has no orphan files beyond EX ids",()=>{
  for(const kind of ["svg","still"])
    for(const f of fs.readdirSync(path.join(ROOT,"exercise-anim",kind)))
      assert.ok(ids.includes(f.replace(/\.svg$/,"")),"orphan "+kind+"/"+f);
});

test("FIT module has no exercise-gifs or photo references left",()=>{
  assert.ok(fit.length>1000,"FIT module not isolated");
  assert.doesNotMatch(fit,/exercise-gifs/);
  assert.doesNotMatch(fit,/PHOTO_EX|rigGif|heroGif|gifImg|\.gif\b/);
  assert.match(fit,/exercise-anim\/svg\//);
  assert.match(fit,/exercise-anim\/still\//);
  assert.match(fit,/prefers-reduced-motion: reduce/);
});

test("native build copies exercise-anim",()=>{
  const nb=fs.readFileSync(path.join(ROOT,"native","build-web.js"),"utf8");
  assert.match(nb,/const DIRS=\[[^\]]*"exercise-anim"/);
});
