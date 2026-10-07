"use strict";
/* Games library: easier/harder levels, tasks and medals, and the teacher's own variations (gm.mine). */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("fs"), path=require("path"), vm=require("vm");
global.window={};
const D=require("../../hm-data.js");
const R=path.join(__dirname,"..","..")+path.sep;
const src=fs.readFileSync(R+"hm-know.js","utf8");
const GAMES=eval("("+src.match(/const GAMES=\[[\s\S]*?\n\];/)[0].replace("const GAMES=","").replace(/;$/,"")+")");
const ADAPT=eval("("+src.match(/const GAME_ADAPT=\{[\s\S]*?\n\};/)[0].replace("const GAME_ADAPT=","").replace(/;$/,"")+")");
/* run the real merge code from hm-know.js so adapt/chal/vars are what the app shows */
new Function("GAMES","GAME_ADAPT",src.match(/GAMES\.forEach\(g=>\{ const a=GAME_ADAPT[\s\S]*?\n\}\);/)[0])(GAMES,ADAPT);
const MENU=eval(src.match(/const TASK_MENU=(\[[^\n]*\]);/)[1]);

function i18n(){
  const win={localStorage:{getItem:()=>null,setItem(){}},
    document:{documentElement:{setAttribute(){}},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null,body:null},addEventListener(){}};
  win.window=win; const ctx=vm.createContext(Object.assign(win,{console,CustomEvent:function(){}}));
  for(const f of ["hm-terms.js","hm-texts.js","hm-i18n.js"])vm.runInContext(fs.readFileSync(R+f,"utf8"),ctx,{filename:f});
  return {T:ctx.window.I18N_TERMS,I:ctx.window.I18N};
}

test("every game has easier and harder lines, and every adapted id exists",()=>{
  const ids=new Set(GAMES.map(g=>g.id));
  Object.keys(ADAPT).forEach(id=>assert.ok(ids.has(id),"unknown id "+id));
  GAMES.forEach(g=>{
    assert.ok(g.adapt&&g.adapt.easy&&g.adapt.hard,g.id+": missing levels");
    assert.notEqual(g.adapt.easy,g.adapt.hard,g.id);
  });
});

test("games with task lines point to the shared menu, and the menu exists",()=>{
  assert.equal(MENU.length,5);
  const withChal=GAMES.filter(g=>g.chal);
  assert.ok(withChal.length>=15,"challenges added to similar games");
  const gaga=GAMES.find(g=>g.id==="g-gaga");
  const t=gaga.chal.join(" ");
  assert.ok(/10 פגיעות.*ארד/.test(t)&&/20 פגיעות.*כסף/.test(t)&&/25 פגיעות.*זהב/.test(t),"gaga medals 10/20/25");
  assert.ok(gaga.chal.some(s=>/מהתפריט/.test(s)),"hit player does a task and returns");
});

test("the hybrid game scores body parts 1..5 and keeps safety text",()=>{
  const g=GAMES.find(x=>x.id==="g-strikeball");
  assert.ok(g,"added");
  const how=g.how.join(" ");
  ["יד — נקודה אחת","רגל — 2","ראש — 3","כתף — 4","גב — 5"].forEach(s=>assert.ok(how.includes(s),s));
  assert.ok(/ממסירה של חבר/.test(how));
  assert.ok(g.safe.length>20);
});

test("machanaim gets the golden-cone goalkeeper twist as a variation",()=>{
  const g=GAMES.find(x=>x.id==="g-machanaim");
  assert.ok(g.vars.some(v=>/מחניים זהב/.test(v)),"pointer to the full game");
  const d=GAMES.find(x=>x.id==="g-dodgegold"), t=d.how.join(" ");
  assert.ok(/קו מפריד/.test(t)&&/מאחורי כל קבוצה/.test(t)&&/קונוס גדול/.test(t)&&/4 קונוסים קטנים/.test(t),"line in the middle; 1 large + 4 small cones behind each team");
  assert.ok(/3 ״פסילות״/.test(t)&&/מלך חדש/.test(t),"king with 3 lives, then a new king");
  assert.ok(/פוסלים את כל חברי הקבוצה השנייה/.test(t)&&/שניים מהקונוסים הקטנים/.test(t)&&/קונוס הזהב/.test(t),"three ways to win");
  assert.ok(/קליטה נקייה/.test(t)&&/לפי סדר הפסילה/.test(t),"catch returns a teammate in order");
  assert.ok(d.vars.some(v=>/כדור שני איטי/.test(v)),"slow second ball");
});

test("all new Hebrew texts have en/ar/ru/es translations with no Hebrew left",()=>{
  const {T}=i18n();
  const need=[];
  GAMES.forEach(g=>{ if(g.adapt){need.push(g.adapt.easy,g.adapt.hard);} (g.chal||[]).forEach(s=>need.push(s)); });
  Object.values(ADAPT).forEach(a=>(a.more||[]).forEach(s=>need.push(s)));
  const sb=GAMES.find(x=>x.id==="g-strikeball");
  need.push(sb.name,sb.space,sb.equip,sb.goal,sb.fit,sb.safe,sb.who,...sb.how,...sb.vars,...MENU);
  const dg=GAMES.find(x=>x.id==="g-dodgegold");
  need.push(dg.name,dg.equip,dg.goal,dg.fit,dg.safe,...dg.how,...dg.vars);
  need.forEach(s=>{
    const row=T[s]; assert.ok(row&&row.length===4,"no translation: "+s.slice(0,50));
    row.forEach((x,i)=>{ assert.ok(x&&!/[֐-׿]/.test(x),"bad "+i+": "+s.slice(0,40)); });
  });
});

test("translated task/medal lines keep their numbers",()=>{
  const {T}=i18n();
  GAMES.forEach(g=>(g.chal||[]).concat(g.adapt?[g.adapt.easy,g.adapt.hard]:[]).forEach(s=>{
    const nums=(s.match(/\d+/g)||[]).join(",");
    T[s].forEach((x,i)=>assert.equal((x.match(/\d+/g)||[]).join(","),nums,["en","ar","ru","es"][i]+": "+s.slice(0,40)));
  }));
});

/* ---- teacher's own variations ---- */
test("add trims, rejects empty and duplicate lines, never mutates the input",()=>{
  const m0={}; Object.freeze(m0);
  const r=D.addGameMine(m0,"g-gaga","  שכיבות   סמיכה  אחרי כל פגיעה ",1);
  assert.equal(r.ok,true); assert.equal(r.map["g-gaga"][0].t,"שכיבות סמיכה אחרי כל פגיעה");
  assert.equal(D.addGameMine(r.map,"g-gaga","   ").reason,"empty");
  assert.equal(D.addGameMine(r.map,"g-gaga","שכיבות סמיכה אחרי כל פגיעה").reason,"dup");
  assert.equal(D.addGameMine(r.map,"","x").reason,"empty");
  assert.deepEqual(m0,{});
});
test("ids stay unique when two lines are added in the same millisecond",()=>{
  let m={}; for(let i=0;i<5;i++)m=D.addGameMine(m,"g-a","line "+i,7).map;
  const ids=m["g-a"].map(e=>e.id); assert.equal(new Set(ids).size,5);
});
test("limit per game and text length are enforced",()=>{
  let m={}; for(let i=0;i<D.MINE_PER_GAME;i++)m=D.addGameMine(m,"g-a","v"+i,i).map;
  assert.equal(D.addGameMine(m,"g-a","one more").reason,"limit");
  assert.equal(D.addGameMine(m,"g-b","x".repeat(900),1).map["g-b"][0].t.length,D.MINE_MAX);
});
test("delete removes only that line and drops the empty game entry",()=>{
  let m=D.addGameMine({},"g-a","one",1).map; m=D.addGameMine(m,"g-a","two",2).map; m=D.addGameMine(m,"g-b","three",3).map;
  const id=m["g-a"][0].id;
  m=D.delGameMine(m,"g-a",id);
  assert.deepEqual(m["g-a"].map(e=>e.t),["two"]); assert.equal(m["g-b"].length,1);
  m=D.delGameMine(m,"g-a",m["g-a"][0].id); assert.equal("g-a" in m,false);
  assert.equal(D.delGameMine(m,"nope","x")["g-b"].length,1);
});
test("corrupt stored values are dropped, valid lines survive",()=>{
  assert.deepEqual(D.normGameMine(null),{}); assert.deepEqual(D.normGameMine([1]),{}); assert.deepEqual(D.normGameMine("x"),{});
  const m=D.normGameMine({"g-a":[{id:"1",t:"ok"},{id:"1",t:"dup id"},{t:"no id"},null,{id:"2",t:"  "},{id:"3",t:5}],"g-b":"bad","g-c":[]});
  assert.deepEqual(m,{"g-a":[{id:"1",t:"ok"}]});
});
