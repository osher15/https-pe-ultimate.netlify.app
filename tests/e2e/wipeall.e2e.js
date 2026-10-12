"use strict";
/* Settings > backup > "Delete all my data": backup offered first, typed-word gate, local data and the native mirror are removed and not restored. */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");
const C="c:ט:3";
const base={lang:"en","pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION,
  "ft.classes":{[C]:{id:C,name:"ט׳3",grade:"ט",num:3,key:"ט3"}},
  "stu.list":[{id:"a",name:"Alice",cls:"ט׳3",cid:C,sex:"girls",age:14,tests:[]}]};
const android=Object.assign({__native:"android"},base);
const calls=(p,pl,m)=>p.evaluate(([a,b])=>window.__cap.filter(c=>c[0]===a&&(!b||c[1]===b)),[pl,m]);
const hasKey=(p,k)=>p.evaluate(x=>localStorage.getItem("pe."+x)!==null||localStorage.getItem(x)!==null,k);
async function open(p){
  await p.evaluate(()=>window.HM.openSettings("backup")); await p.waitForTimeout(400);
  /* The harness marks the tab as seeded in sessionStorage; keep that marker when the app clears session data so the reload is not re-seeded. */
  await p.evaluate(()=>{ const c=Storage.prototype.clear; Storage.prototype.clear=function(){
    if(this===window.sessionStorage){ Object.keys(this).filter(k=>k.indexOf("__peultimate")!==0).forEach(k=>this.removeItem(k)); return; }
    return c.call(this); }; });
}
const click=(p,sel)=>p.evaluate(s=>document.querySelector(s).click(),sel);
module.exports={title:"Delete all data",tests:[
  check("button is visible; backup option is on by default; cancel keeps the data",base,async p=>{
    await open(p);
    ok(await p.locator("#set-wipeAll").isVisible(),"button visible");
    await click(p,"#set-wipeAll"); await p.waitForTimeout(400);
    ok(await p.locator("#ask-f input[type=checkbox]").first().isChecked(),"backup checked by default");
    await click(p,"#ask-no"); await p.waitForTimeout(400);
    eq(await p.evaluate(()=>window.HM.LS.get("stu.list",[]).length),1,"data kept after cancel");
  }),
  check("without a backup the typed word gates the wipe, then everything is gone after reload",base,async p=>{
    await open(p);
    await click(p,"#set-wipeAll"); await p.waitForTimeout(400);
    await p.evaluate(()=>document.querySelector("#ask-f input[type=checkbox]").click()); // untick backup
    await click(p,"#ask-ok"); await p.waitForTimeout(500);
    ok(await p.locator("#ask-word").count()===1,"typed-word field shown");
    await p.fill("#ask-word","nope"); await click(p,"#ask-ok"); await p.waitForTimeout(400);
    eq(await p.evaluate(()=>window.HM.LS.get("stu.list",[]).length),1,"wrong word does not wipe");
    await p.fill("#ask-word","delete"); await click(p,"#ask-ok");
    await p.waitForLoadState("domcontentloaded"); await p.waitForTimeout(2500);
    eq(await p.evaluate(()=>window.HM.LS.get("stu.list",[]).length),0,"students gone");
    eq(await p.evaluate(()=>window.HM.LS.get("ft.classes",{})),{},"classes gone");
  }),
  check("native: the internal mirror file is deleted and data is not restored on reload",android,async p=>{
    await p.waitForTimeout(1500);
    await open(p);
    ok(Object.keys(await p.evaluate(()=>JSON.parse(localStorage.getItem("__fakefs")||"{}"))).some(k=>/pe-ultimate-data\.json$/.test(k)),"mirror exists before");
    await click(p,"#set-wipeAll"); await p.waitForTimeout(400);
    await p.evaluate(()=>document.querySelector("#ask-f input[type=checkbox]").click());
    await click(p,"#ask-ok"); await p.waitForTimeout(500);
    await p.fill("#ask-word","delete"); await click(p,"#ask-ok");
    await p.waitForLoadState("domcontentloaded"); await p.waitForTimeout(3000);
    const fs=await p.evaluate(()=>JSON.parse(localStorage.getItem("__fakefs")||"{}")), mk=Object.keys(fs).find(k=>/pe-ultimate-data\.json$/.test(k));
    /* A fresh boot may write a new default-only copy; it must hold none of the deleted data. */
    const keys=mk?Object.keys(JSON.parse(fs[mk]).data):[];
    ok(keys.indexOf("peultimate.stu.list")<0&&keys.indexOf("peultimate.ft.classes")<0,"mirror holds no pupil/class data: "+keys.join(","));
    eq(await p.evaluate(()=>window.HM.LS.get("stu.list",[]).length),0,"not restored from mirror");
  })
]};
