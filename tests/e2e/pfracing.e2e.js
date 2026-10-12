"use strict";
/* Photo-finish field focus (APK field review 2026-10-13, P1): while a race runs, setup tools,
   the mode switch, the tool tabs and the bottom bar are hidden; stop or reset brings them back.
   Lane taps (recording a crossing) stay available. */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");
const seed={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION};
const vis=(p,sel)=>p.evaluate(s=>{ const e=document.querySelector(s); if(!e)return false; const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=="hidden"; },sel);

module.exports={title:"Photo-finish: focused race mode",tests:[
  check("start hides setup tools and the bottom bar, stop restores them, lane taps stay",seed,async p=>{
    await p.evaluate(()=>window.HM.go("photo")); await p.waitForTimeout(700);
    ok(await vis(p,"#pf-loadCls"),"setup visible before the race");
    ok(await vis(p,".nav"),"bottom bar visible before the race");
    await p.evaluate(()=>document.getElementById("pf-gun").click()); await p.waitForTimeout(3500);
    eq(await p.evaluate(()=>document.body.classList.contains("pf-racing")),true,"racing class on");
    for(const s of ["#pf-loadCls","#pf-laneCount","#pf-modes",".pf-tabs",".nav"]) ok(!(await vis(p,s)),"hidden while running: "+s);
    ok(await vis(p,"#pf-gun"),"stop button visible"); ok(await vis(p,"#pf-resetBtn"),"reset visible");
    ok(await vis(p,"#pf-chips"),"lane taps visible");
    await p.evaluate(()=>document.getElementById("pf-gun").click()); await p.waitForTimeout(600);
    eq(await p.evaluate(()=>document.body.classList.contains("pf-racing")),false,"racing class off");
    for(const s of ["#pf-loadCls","#pf-laneCount","#pf-modes",".pf-tabs",".nav"]) ok(await vis(p,s),"back after stop: "+s);
  }),
  check("the bottom bar is only hidden on the photo-finish screen",seed,async p=>{
    await p.evaluate(()=>window.HM.go("photo")); await p.waitForTimeout(700);
    await p.evaluate(()=>document.getElementById("pf-gun").click()); await p.waitForTimeout(3500);
    await p.evaluate(()=>window.HM.go("home")); await p.waitForTimeout(600);
    ok(await vis(p,".nav"),"bottom bar visible on another screen");
  })
]};
