"use strict";
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");
const cid="c:ט:3";
const seed={lang:"en","schema.version":D.SCHEMA_VERSION,"grades.periods":["Q1","Q2"],
  "grades.periodRanges":{Q1:{from:"2026-09-01",to:"2026-12-31"}},
  "ft.classes":{[cid]:{id:cid,name:"Grade 9",grade:"ט",num:3}},
  "stu.list":[{id:"a",cid,cls:"Grade 9",name:"Student",tests:[],grades:{Q1:{exams:{manual:87}}}}]};
async function open(page){await page.evaluate(cid=>window.ASSESSMENT.open(cid,"Q1"),cid);await page.waitForTimeout(100);}
async function choose(page){await page.locator('.as-test[data-test="push"] .as-required').check();}
const config=page=>page.evaluate(()=>window.HM.LS.get("assessment.policies",null));
module.exports={title:"Assessment requirements editor",tests:[
  check("grading and fitness coverage buttons open the existing class context",seed,async page=>{
    await page.evaluate(()=>window.HM.go("stu"));
    await page.evaluate(()=>document.querySelector('.pf-tabs [data-st="grades"]').click());
    await page.locator("#stu-sub-grades [data-assessment-open]").click();
    eq(await page.locator("#as-class").inputValue(),cid);eq(await page.locator("#as-period").inputValue(),"Q1");await page.locator("#as-close").click();
    await page.evaluate(cid=>window.FT.show(cid,"cov"),cid);await page.locator("#ft-cov [data-assessment-open]").click();
    eq(await page.locator("#as-class").inputValue(),cid);
  }),
  check("save selected requirements and explicit date snapshot across reload",seed,async page=>{
    await open(page);eq(await page.locator("#as-from").inputValue(),"2026-09-01");
    eq(await page.locator("#as-period option:checked").innerText(),"Q1");
    await choose(page);await page.locator("#as-save").click();
    const value=await config(page);eq(value.version,1);eq(value.policies[0].tests,[{id:"push"}]);
    eq(await page.evaluate(()=>window.HM.LS.get("stu.list")[0].grades.Q1.exams.manual),87);
    await page.evaluate(()=>window.HM.LS.set("grades.periodRanges",{Q1:{from:"2026-10-01",to:"2026-10-31"}}));
    await page.reload();await open(page);eq(await page.locator("#as-from").inputValue(),"2026-09-01");
    ok(await page.locator('.as-test[data-test="push"] .as-required').isChecked());
  }),
  check("scoring rule must choose rounding; preview and saved values agree",seed,async page=>{
    await open(page);await choose(page);const row=page.locator('.as-test[data-test="push"]');await row.locator(".as-rule").check();
    for(const [k,v] of Object.entries({target:40,step:5,points:5}))await row.locator(".as-"+k).fill(String(v));
    await page.locator("#as-save").click();ok(await page.locator("#as-error").innerText());eq(await config(page),null);
    await row.locator(".as-rounding").selectOption("ceil");ok((await row.locator(".as-preview").innerText()).includes("35 → 95"));
    await page.locator("#as-save").click();eq((await config(page)).policies[0].tests[0].rule.rounding,"ceil");
  }),
  check("write failure preserves previous configuration and editable draft",seed,async page=>{
    await open(page);await choose(page);
    await page.evaluate(()=>{const set=window.HM.LS.set;window.HM.LS.set=(key,v)=>key==="assessment.policies"?false:set(key,v);});
    await page.locator("#as-save").click();ok(await page.locator("#as-modal").isVisible());ok((await page.locator("#as-error").innerText()).includes("failed"));
    eq(await config(page),null);ok(await page.locator('.as-test[data-test="push"] .as-required').isChecked());
  }),
  check("invalid restored configuration is not overwritten",{...seed,"assessment.policies":{version:99,policies:[]}},async page=>{
    await open(page);ok(await page.locator("#as-save").isDisabled());eq((await config(page)).version,99);ok(await page.locator("#as-error").innerText());
  }),
  check("external changes cannot be overwritten by an old draft",seed,async page=>{
    await open(page);await choose(page);
    await page.evaluate(cid=>window.HM.LS.set("assessment.policies",{version:1,policies:[{cid,period:"Q2",from:"2027-01-01",to:"2027-03-31",tests:[{id:"situp"}]}]}),cid);
    await page.locator("#as-save").click();ok((await page.locator("#as-error").innerText()).includes("changed"));eq((await config(page)).policies.length,1);
  }),
  check("saved policy blocks period deletion; other periods remain independent",seed,async page=>{
    await open(page);await choose(page);await page.locator("#as-save").click();
    eq(await page.evaluate(()=>window.ASSESSMENT.canDeletePeriod("Q1")),false);
    eq(await page.evaluate(()=>window.ASSESSMENT.canDeletePeriod("Q2")),true);
    await page.evaluate(cid=>window.ASSESSMENT.open(cid,"Q2"),cid);ok(!(await page.locator('.as-test[data-test="push"] .as-required').isChecked()));
    eq(await page.locator("#as-from").inputValue(),"");
  }),
  check("configuration is present in the existing full backup",seed,async page=>{
    await open(page);await choose(page);await page.locator("#as-save").click();
    const backed=await page.evaluate(()=>JSON.parse(window.HM.backupTest.snapshot().data["assessment.policies"]));eq(backed,await config(page));
    const restored=await page.evaluate(async()=>{const snap=window.HM.backupTest.snapshot();window.HM.LS.set("assessment.policies",{version:1,policies:[]});return window.HM.backupTest.apply(snap);});
    eq(restored.failed,0);eq(await config(page),backed);
  }),
  check("bad imported requirements are rejected before any backup restore writes",seed,async page=>{
    const result=await page.evaluate(async()=>{
      const snap=window.HM.backupTest.snapshot();snap.data["assessment.policies"]=JSON.stringify({version:99,policies:[]});
      const before=JSON.stringify(window.HM.LS.get("stu.list"));
      try{await window.HM.backupTest.apply(snap);return {rejected:false};}
      catch(e){return {rejected:true,preserved:before===JSON.stringify(window.HM.LS.get("stu.list"))};}
    });ok(result.rejected);ok(result.preserved);eq(await config(page),null);
  }),
  {...check("real quota failure preserves saved configuration and editable draft",seed,async page=>{
    await open(page);await choose(page);await page.locator("#as-save").click();const before=await config(page);await open(page);
    await page.locator('.as-test[data-test="situp"] .as-required').check();
    await page.evaluate(()=>{const real=localStorage.setItem.bind(localStorage);localStorage.setItem=(key,v)=>{if(key==="peultimate.assessment.policies")throw new DOMException("Quota","QuotaExceededError");return real(key,v);};});
    await page.locator("#as-save").click();eq(await config(page),before);ok(await page.locator("#as-modal").isVisible());ok((await page.locator("#as-error").innerText()).includes("failed"));
  }),allow:/\[אחסון\].*assessment\.policies/},
  check("native mirror includes requirements after saving",{...seed,__native:"android"},async page=>{
    await open(page);await choose(page);await page.locator("#as-save").click();await page.waitForTimeout(1200);
    const value=await page.evaluate(()=>{
      const files=JSON.parse(localStorage.getItem("__fakefs")||"{}");
      return JSON.parse(JSON.parse(files["LIBRARY/pe-ultimate-data.json"]).data["peultimate.assessment.policies"]);
    });eq(value,await config(page));
  }),
  check("remove requirements keeps grades and allows period deletion",seed,async page=>{
    await open(page);await choose(page);await page.locator("#as-save").click();await open(page);
    await page.locator("#as-delete").click();await page.locator("#ask-ok").click();
    eq((await config(page)).policies,[]);eq(await page.evaluate(()=>window.ASSESSMENT.canDeletePeriod("Q1")),true);
    eq(await page.evaluate(()=>window.HM.LS.get("stu.list")[0].grades.Q1.exams.manual),87);
  }),
  check("switching class or period cannot silently lose an unsaved draft",seed,async page=>{
    await open(page);await choose(page);await page.locator("#as-period").selectOption("Q2");await page.locator("#ask-no").click();
    eq(await page.locator("#as-period").inputValue(),"Q1");ok(await page.locator('.as-test[data-test="push"] .as-required').isChecked());
    await page.evaluate(()=>{document.getElementById("as-modal").__onBack();});await page.locator("#ask-no").click();ok(await page.locator("#as-modal").isVisible());
  }),
  check("editor uses every language and fits narrow phones",seed,async page=>{
    await page.setViewportSize({width:390,height:844});
    const titles={en:"Assessment requirements",he:"מבחני חובה",ar:"الاختبارات المطلوبة",ru:"Обязательные тесты",es:"Pruebas obligatorias"};
    for(const [lang,title] of Object.entries(titles)){
      await page.evaluate(l=>window.I18N.set(l),lang);await open(page);
      ok((await page.locator("#as-modal h3").innerText()).includes(title),lang);
      ok(await page.locator("#as-modal .box").evaluate(e=>e.scrollWidth<=e.clientWidth+1),lang);
      await page.locator("#as-close").click();
    }
  })
]};
