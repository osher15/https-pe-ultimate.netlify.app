"use strict";
/* #21 — manual games library filters: metadata is parsed from the existing fields. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("fs"), path=require("path");
global.window={};
const D=require("../../hm-data.js");
const src=fs.readFileSync(path.join(__dirname,"../../hm-know.js"),"utf8");
const GAMES=eval("("+src.match(/const GAMES=\[[\s\S]*?\n\];/)[0].replace("const GAMES=","").replace(/;$/,"")+")");

test("21.1 every game's grades and pupil range parse; open-ended times stay null",()=>{
  assert.equal(GAMES.length,44);
  GAMES.forEach(g=>{
    const m=D.parseGameMeta(g);
    assert.ok(m.gFrom>=1&&m.gTo<=12&&m.gFrom<=m.gTo,g.id+": grades "+g.who);
    assert.ok(m.pMin>=1&&m.pMax>=m.pMin,g.id+": pupils "+g.who);
    if(m.tMin!=null)assert.ok(m.tMax>=m.tMin,g.id+": time "+g.time);
  });
  assert.ok(GAMES.some(g=>D.parseGameMeta(g).tMin==null),"some games are open-ended");
});

test("21.2 gameMatches: each filter narrows, empty filter keeps everything",()=>{
  const all=GAMES.map(g=>D.parseGameMeta(g));
  assert.equal(all.filter(m=>D.gameMatches(m,{})).length,GAMES.length);
  const mid=all.filter(m=>D.gameMatches(m,{age:"mid"})).length, high=all.filter(m=>D.gameMatches(m,{age:"high"})).length;
  assert.ok(mid>0&&high>0&&mid<=GAMES.length&&high<=GAMES.length);
  assert.ok(all.filter(m=>D.gameMatches(m,{age:"high"})).every(m=>m.gTo>=10),"a high-school game reaches grade 10+");
  const short=all.filter(m=>D.gameMatches(m,{tmax:10}));
  assert.ok(short.every(m=>m.tMin==null||m.tMin<=10),"10-minute filter");
  assert.ok(short.length<GAMES.length);
  const n=all.filter(m=>D.gameMatches(m,{n:40}));
  assert.ok(n.every(m=>m.pMin<=40&&m.pMax>=40)&&n.length<GAMES.length,"40 pupils");
  const none=all.filter(m=>D.gameMatches(m,{noeq:true}));
  assert.ok(none.length>0&&none.every(m=>m.noEquip));
  assert.equal(D.gameMatches(D.parseGameMeta({who:"ז׳–ט׳ · 10–30 משתתפים",time:"8–12 דק׳",equip:"אין"}),{age:"high"}),false,"middle-school only game excluded for high school");
  assert.equal(D.gameMatches(D.parseGameMeta({who:"ז׳–י״ב · 4–12 בכל מגרש",time:"פתוח",equip:"כדור"}),{tmax:10,n:8}),true,"open time fits any length");
});
