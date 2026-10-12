"use strict";
/* Photo-finish: load a whole class and run it as heats of up to 9 lanes; distance chips and typed distance. */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");
const C="c:ט:3";
const kids=Array.from({length:20},(_,i)=>({id:"p"+i,name:"Pupil "+String(i+1).padStart(2,"0"),cls:"ט׳3",cid:C,sex:"boys",age:14,tests:[]}));
const seed={lang:"en","pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION,
  "ft.classes":{[C]:{id:C,name:"ט׳3",grade:"ט",num:3,key:"ט3"}},"stu.list":kids,
  "ft.roster":{"ט3":kids.map(k=>({id:k.id,name:k.name,sex:"boys"}))},"ft.last":{grade:"ט",num:3,sort:"name"}};
const laneNames=p=>p.evaluate(()=>window.HM.LS.get("pf.names",[]));
const vis=(p,sel)=>p.evaluate(s=>{ const e=document.querySelector(s); if(!e)return false; const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; },sel);
async function loadClass(p){
  await p.evaluate(()=>window.HM.go("photo")); await p.waitForTimeout(700);
  await p.evaluate(()=>document.getElementById("pf-loadCls").click()); await p.waitForTimeout(600);
  await p.evaluate(()=>document.getElementById("cp-load").click()); await p.waitForTimeout(600);
}
module.exports={title:"Photo-finish: heats and distances",tests:[
  check("whole class loads as heats of 9, Next heat walks through them",seed,async p=>{
    await loadClass(p);
    let n=await laneNames(p); eq(n.length,9,"first heat has 9 lanes"); eq(n[0],"Pupil 01"); eq(n[8],"Pupil 09");
    ok(await vis(p,"#pf-nextHeat"),"Next heat visible"); ok((await p.locator("#pf-nextHeat").innerText()).includes("11"),"11 left");
    await p.evaluate(()=>document.getElementById("pf-nextHeat").click()); await p.waitForTimeout(400);
    n=await laneNames(p); eq(n[0],"Pupil 10"); eq(n.length,9); ok((await p.locator("#pf-nextHeat").innerText()).includes("2"),"2 left");
    await p.evaluate(()=>document.getElementById("pf-nextHeat").click()); await p.waitForTimeout(400);
    n=await laneNames(p); eq(n.slice(0,2),["Pupil 19","Pupil 20"]); eq(n.length,2,"last heat has 2 lanes");
    ok(!(await vis(p,"#pf-nextHeat")),"button hidden after the last heat");
  }),
  check("heat with times is archived once when moving on",seed,async p=>{
    await loadClass(p);
    await p.evaluate(()=>{ window.PF._test.setTimes([8.1,8.5,8.9]); });
    await p.evaluate(()=>document.getElementById("pf-nextHeat").click()); await p.waitForTimeout(400);
    eq(await p.evaluate(()=>window.HM.LS.get("pf.archive",[]).length),1,"archived");
    eq(await p.evaluate(()=>window.HM.LS.get("pf.archive",[])[0].results.length),3);
  }),
  check("distance chips and typed distance update the race and persist",seed,async p=>{
    await p.evaluate(()=>window.HM.go("photo")); await p.waitForTimeout(700);
    await p.evaluate(()=>document.querySelector('#pf-distChips [data-d="400"]').click()); await p.waitForTimeout(200);
    eq(await p.evaluate(()=>window.HM.LS.get("pf.meta",{}).dist),400);
    ok((await p.locator("#pf-metaRow").innerText()).includes("400"),"meta row shows 400");
    await p.fill("#pf-quickDist","1250"); await p.evaluate(()=>document.getElementById("pf-quickDist").dispatchEvent(new Event("change")));
    await p.waitForTimeout(200);
    eq(await p.evaluate(()=>window.HM.LS.get("pf.meta",{}).dist),1250);
    eq(await p.evaluate(()=>document.getElementById("pf-setDist").value),"1250","settings field in sync");
  })
]};
