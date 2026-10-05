"use strict";
// Read-only regression review of merged #38. Not registered in run.js.
const {check,eq,ok}=require("../e2e/harness.js");
const go=async p=>{await p.evaluate(()=>window.HM.go("games"));await p.waitForTimeout(500);};
module.exports={title:"Codex review of merged library changes",tests:[
  check("compact card keeps the complete tug-of-war safety note visible",{lang:"en"},async p=>{
    await go(p);await p.click("#gm-compact");
    const sf=p.locator('[data-g="g-tug"] .sf');
    const size=await sf.evaluate(e=>({shown:e.clientHeight,needed:e.scrollHeight,text:e.textContent}));
    ok(size.needed<=size.shown+1,"Safety text is clipped: "+JSON.stringify(size));
  }),
  check("empty manual-filter state is translated in all non-Hebrew languages",{lang:"en"},async p=>{
    await go(p);
    await p.evaluate(()=>{document.querySelector("#gm-filters").open=true;});
    for(const lang of ["en","ar","ru","es"]){
      await p.evaluate(x=>window.I18N.set(x),lang);
      await p.fill("#gm-fN","99");await p.dispatchEvent("#gm-fN","input");
      eq(await p.locator("#gm-grid .gm-card").count(),0);
      const message=await p.textContent("#gm-grid");
      ok(!/[\u0590-\u05ff]/.test(message),lang+": untranslated empty state: "+message);
    }
  }),
  check("favorite, compact and filter settings survive a real backup and restore",{lang:"en"},async p=>{
    await go(p);await p.locator('[data-g="g-flags"] [data-fav]').click();await p.click("#gm-compact");
    await p.evaluate(()=>{document.querySelector("#gm-filters").open=true;});await p.selectOption("#gm-fAge","high");
    const state=await p.evaluate(async()=>{
      const b=window.HM.backupTest,snap=b.snapshot();
      window.HM.LS.set("gm.fav",[]);window.HM.LS.set("gm.compact",false);window.HM.LS.set("gm.flt",null);
      const result=await b.apply(snap);
      return {result,fav:window.HM.LS.get("gm.fav",[]),compact:window.HM.LS.get("gm.compact",false),filter:window.HM.LS.get("gm.flt",null)};
    });
    eq(state.fav,["g-flags"]);eq(state.compact,true);eq(state.filter.age,"high");
    await p.reload();await p.waitForTimeout(600);await go(p);
    eq(await p.inputValue("#gm-fAge"),"high");ok(await p.locator("#gm-grid.compact").count()===1);
  })
]};
