"use strict";
/* Settings > backup > Android automatic backup: Android-only choice, off by default, persisted by the native plugin (simulated here). Records sync only accepts https:// URLs. */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");
const base={lang:"en","pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION};
const android=Object.assign({__native:"android"},base);
const ios=Object.assign({__native:"ios"},base);
const open=async p=>{ await p.evaluate(()=>window.HM.openSettings("backup")); await p.waitForTimeout(500); };
const calls=(p,m)=>p.evaluate(x=>window.__cap.filter(c=>c[0]==="PEBackup"&&c[1]===x),m);
module.exports={title:"Android automatic backup choice and https-only sync",tests:[
  check("android: the choice is visible and OFF by default",android,async p=>{
    await open(p);
    ok(await p.locator("#set-autoBkRow").isVisible(),"row visible on android");
    eq(await p.locator("#set-autoBk").isChecked(),false,"off by default");
  }),
  check("android: turning it on calls the native plugin, and it is still on after a reload",android,async p=>{
    await open(p);
    await p.evaluate(()=>document.querySelector("#set-autoBk").click()); await p.waitForTimeout(400);
    eq((await calls(p,"setAutoBackup")).pop()[2],{enabled:true},"native set(true)");
    await p.reload(); await p.waitForTimeout(1500); await open(p);
    eq(await p.locator("#set-autoBk").isChecked(),true,"on after reload (read back from the native flag)");
    await p.evaluate(()=>document.querySelector("#set-autoBk").click()); await p.waitForTimeout(400);
    eq((await calls(p,"setAutoBackup")).pop()[2],{enabled:false},"native set(false)");
  }),
  check("ios and web: the Android choice is not shown",ios,async p=>{
    await open(p);
    eq(await p.locator("#set-autoBkRow").isVisible(),false,"hidden on ios");
  }),
  check("web: the Android choice is not shown",base,async p=>{
    await open(p);
    eq(await p.locator("#set-autoBkRow").isVisible(),false,"hidden on web");
  }),
  check("sync URL: http:// is rejected on save, https:// is kept",base,async p=>{
    await open(p);
    await p.evaluate(()=>{ document.querySelector("#set-syncUrl").value="http://example.com/x"; document.querySelector("#set-save").click(); });
    await p.waitForTimeout(400);
    eq(await p.evaluate(()=>window.HM.LS.get("settings",{}).syncUrl||""),"","http cleared");
    await p.evaluate(()=>window.HM.openSettings("backup")); await p.waitForTimeout(300);
    await p.evaluate(()=>{ document.querySelector("#set-syncUrl").value="https://script.google.com/macros/s/abc/exec"; document.querySelector("#set-save").click(); });
    await p.waitForTimeout(400);
    eq(await p.evaluate(()=>window.HM.LS.get("settings",{}).syncUrl),"https://script.google.com/macros/s/abc/exec","https kept");
  }),
  check("sync URL: a stored http:// address never sends anything",Object.assign({settings:{syncUrl:"http://example.com/x",syncCode:"c"}},base),async p=>{
    await p.evaluate(()=>{ window.__sent=[]; const f=window.fetch; window.fetch=function(u){ window.__sent.push(String(u)); return f.apply(this,arguments); }; });
    await p.evaluate(async()=>{ try{ await REC.syncNow(); }catch(e){} });
    await p.waitForTimeout(400);
    eq(await p.evaluate(()=>window.__sent.filter(u=>/example\.com/.test(u)).length),0,"nothing sent to the http address");
  })
]};
