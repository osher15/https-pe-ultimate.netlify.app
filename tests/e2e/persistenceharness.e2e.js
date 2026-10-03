"use strict";
const {check,eq}=require("./harness.js");
const seed={"settings":{school:"Seed school"},"stu.list":[],lang:"en"};
module.exports={title:"Saved data across reloads",tests:[
  check("updates and deletions survive reload instead of fixture reseeding",seed,async page=>{
    await page.evaluate(()=>{
      window.HM.LS.set("settings",{school:"Changed school"});
      localStorage.removeItem("peultimate.stu.list");
    });
    await page.reload({waitUntil:"domcontentloaded"});
    eq(await page.evaluate(()=>window.HM.LS.get("settings",{}).school),"Changed school");
    eq(await page.evaluate(()=>localStorage.getItem("peultimate.stu.list")),null);
    await page.reload({waitUntil:"domcontentloaded"});
    eq(await page.evaluate(()=>window.HM.LS.get("settings",{}).school),"Changed school");
  }),
  check("a new test context still starts from its own fixture",seed,async page=>{
    eq(await page.evaluate(()=>window.HM.LS.get("settings",{}).school),"Seed school");
  }),
  check("cleared app data is not recreated by the fixture on reload",seed,async page=>{
    await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith("peultimate.")).forEach(k=>localStorage.removeItem(k)));
    await page.reload({waitUntil:"domcontentloaded"});
    eq(await page.evaluate(()=>window.HM.LS.get("settings",{}).school||null),null);
    eq(await page.evaluate(()=>window.I18N.lang()),"en");
  })
]};
