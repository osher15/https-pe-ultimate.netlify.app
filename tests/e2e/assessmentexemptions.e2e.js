"use strict";
const {check,eq,ok}=require("./harness.js"),D=require("../../hm-data.js");
const cid="c:ט:3",other="c:י:1",rule={target:40,step:5,points:5,min:0,max:100,rounding:"ceil"};
const base={cid,period:"Q1",from:"2026-09-01",to:"2026-12-31",tests:[{id:"push",rule},{id:"situp"}],exemptions:[]};
const extra={cid:other,period:"Q2",from:"2027-01-01",to:"2027-03-31",tests:[{id:"push"}],exemptions:[{sid:"c",test:"push",reason:"Other class"}]};
const seed={lang:"en","schema.version":D.SCHEMA_VERSION,"grades.periods":["Q1","Q2"],"ft.classes":{[cid]:{id:cid,name:"Grade 9",grade:"ט",num:3},[other]:{id:other,name:"Grade 10",grade:"י",num:1}},
 "stu.list":[{id:"a",cid,cls:"Grade 9",name:"Same",tests:[],grades:{Q1:{exams:{manual:87}}}},{id:"b",cid,cls:"Grade 9",name:"Same",tests:[]},{id:"c",cid:other,cls:"Grade 10",name:"Other",tests:[]}],
 "ft.results":[{id:"r1",sid:"a",cid,test:"push",val:35,d:"2026-10-03",ts:1}],"assessment.policies":{version:1,policies:[base,extra]}};
async function open(page,sid="a"){await page.evaluate(({cid,sid})=>window.ASSESSMENT.open(cid,"Q1",sid),{cid,sid});}
const exrow=(page,id="push")=>page.locator('.as-ex-row[data-test="'+id+'"]');
async function exempt(page,reason="Temporary injury",id="push"){await exrow(page,id).locator(".as-ex-check").check();await exrow(page,id).locator(".as-ex-reason").fill(reason);}
const envelope=page=>page.evaluate(()=>window.HM.LS.get("assessment.policies"));
const policy=async page=>(await envelope(page)).policies.find(p=>p.cid===cid&&p.period==="Q1");
const withEx=exemptions=>({...seed,"assessment.policies":{version:1,policies:[{...base,exemptions},extra]}});
module.exports={title:"Teacher period exemptions",tests:[
 check("reason is required; save/reload keeps pupil identity, measured history and manual grades",seed,async page=>{
  await open(page);await exrow(page).locator(".as-ex-check").check();await page.locator("#as-save").click();ok((await page.locator("#as-error").innerText()).includes("reason"));eq((await policy(page)).exemptions,[]);
  await exrow(page).locator(".as-ex-reason").fill("Temporary injury");await page.locator("#as-save").click();await page.reload();await open(page);ok(await exrow(page).locator(".as-ex-check").isChecked());eq(await exrow(page).locator(".as-ex-reason").inputValue(),"Temporary injury");
  eq((await policy(page)).exemptions,[{sid:"a",test:"push",reason:"Temporary injury"}]);eq(await page.evaluate(()=>window.HM.LS.get("stu.list")[0].grades.Q1.exams.manual),87);eq(await page.evaluate(()=>window.HM.LS.get("ft.results").length),1);eq((await envelope(page)).policies.find(p=>p.cid===other),extra);
 }),
 check("removing an exemption restores measured/suggested results without deleting history",withEx([{sid:"a",test:"push",reason:"Injury"}]),async page=>{
  await open(page);await exrow(page).locator(".as-ex-check").uncheck();await page.locator("#as-save").click();
  await page.evaluate(cid=>window.ASSESSMENT_REPORT.open(cid,"a","Q1"),cid);const r=page.locator("#ar-quick tbody tr").first();ok((await r.innerText()).includes("Measured"));eq(await r.locator("td").nth(3).innerText(),"35");eq(await r.locator("td").nth(4).innerText(),"95");eq(await page.evaluate(()=>window.HM.LS.get("ft.results").length),1);
 }),
 check("duplicate names use IDs; switching pupils preserves both drafts and other policies",seed,async page=>{
  await open(page);ok((await page.locator('#as-ex-pupil option[value="a"]').innerText()).includes("[a]"));ok((await page.locator('#as-ex-pupil option[value="b"]').innerText()).includes("[b]"));
  await exempt(page,"A reason");await page.locator("#as-ex-pupil").selectOption("b");await exempt(page,"B reason","situp");await page.locator("#as-ex-pupil").selectOption("a");eq(await exrow(page).locator(".as-ex-reason").inputValue(),"A reason");await page.locator("#as-save").click();
  eq((await policy(page)).exemptions,[{sid:"a",test:"push",reason:"A reason"},{sid:"b",test:"situp",reason:"B reason"}]);eq((await envelope(page)).policies.find(p=>p.cid===other),extra);
 }),
 check("removing a required test cannot silently discard its saved exemption",withEx([{sid:"a",test:"push",reason:"Injury"}]),async page=>{
  await open(page);await page.locator('.as-test[data-test="push"] .as-required').uncheck();await page.locator("#as-save").click();ok((await page.locator("#as-error").innerText()).includes("Remove"));eq((await policy(page)).tests.length,2);
  await exrow(page).locator(".as-ex-check").click();eq(await exrow(page).count(),0);await page.locator("#as-save").click();eq((await policy(page)).tests,[{id:"situp"}]);eq((await policy(page)).exemptions,[]);
 }),
 {...check("actual quota failure leaves the saved envelope and reason draft intact",seed,async page=>{
  const before=await envelope(page);await open(page);await exempt(page);
  await page.evaluate(()=>{const real=localStorage.setItem.bind(localStorage);localStorage.setItem=(k,v)=>{if(k==="peultimate.assessment.policies")throw new DOMException("Quota","QuotaExceededError");return real(k,v);};});await page.locator("#as-save").click();eq(await envelope(page),before);ok((await page.locator("#as-error").innerText()).includes("failed"));eq(await exrow(page).locator(".as-ex-reason").inputValue(),"Temporary injury");
 }),allow:/\[אחסון\].*assessment\.policies/},
 check("stale window and pupils moved during editing cannot receive new exemptions",seed,async page=>{
  await open(page);await exempt(page);await page.evaluate(other=>{const v=window.HM.LS.get("stu.list");v[0].cid=other;window.HM.LS.set("stu.list",v);},other);await page.locator("#as-save").click();ok((await page.locator("#as-error").innerText()).includes("changed"));eq((await policy(page)).exemptions,[]);
  await page.evaluate(cid=>{const v=window.HM.LS.get("stu.list");v[0].cid=cid;v[1].id="a";window.HM.LS.set("stu.list",v);},cid);await page.locator("#as-save").click();eq((await policy(page)).exemptions,[]);
  await page.evaluate(()=>{const v=window.HM.LS.get("assessment.policies");v.policies[0].to="2026-12-30";window.HM.LS.set("assessment.policies",v);});await page.locator("#as-save").click();eq((await policy(page)).to,"2026-12-30");eq((await policy(page)).exemptions,[]);
 }),
 check("unknown saved pupil exemptions stay intact and allow explicit removal only",withEx([{sid:"gone",test:"push",reason:"Historical"}]),async page=>{
  await open(page);await exempt(page,"Current pupil");await page.locator("#as-save").click();ok((await policy(page)).exemptions.some(e=>e.sid==="gone"&&e.reason==="Historical"));
  await open(page,"gone");eq(await exrow(page).locator(".as-ex-reason").inputValue(),"Historical");ok(await exrow(page,"situp").locator(".as-ex-check").isDisabled());await exrow(page).locator(".as-ex-check").uncheck();ok(await exrow(page).locator(".as-ex-check").isDisabled());await page.locator("#as-save").click();eq((await policy(page)).exemptions,[{sid:"a",test:"push",reason:"Current pupil"}]);
 }),
 check("class/period/Back discard protection includes exemption drafts",seed,async page=>{
  await open(page);await exempt(page);await page.locator("#as-period").selectOption("Q2");await page.locator("#ask-no").click();eq(await page.locator("#as-period").inputValue(),"Q1");eq(await exrow(page).locator(".as-ex-reason").inputValue(),"Temporary injury");await page.locator("#as-close").click();await page.locator("#ask-no").click();ok(await page.locator("#as-modal").isVisible());eq((await policy(page)).exemptions,[]);
 }),
 check("pupil report edit entry preselects pupil; saved exemption is blank-scored in actual Excel/CSV and backup",seed,async page=>{
  await page.evaluate(cid=>window.ASSESSMENT_REPORT.open(cid,"a","Q1"),cid);await page.locator("#ar-editRequirements").click();eq(await page.locator("#as-ex-pupil").inputValue(),"a");await exempt(page,"=Medical reason");await page.locator("#as-ex-save").click();
  const restore=await page.evaluate(async()=>{const snap=window.HM.backupTest.snapshot();window.HM.LS.set("assessment.policies",{version:1,policies:[]});return window.HM.backupTest.apply(snap);});eq(restore.failed,0);
  await page.evaluate(cid=>window.ASSESSMENT_REPORT.open(cid,"a","Q1"),cid);const r=page.locator("#ar-quick tbody tr").first();ok((await r.innerText()).includes("Exempt"));eq(await r.locator("td").nth(3).innerText(),"");eq(await r.locator("td").nth(4).innerText(),"");
  const [x]=await Promise.all([page.waitForEvent("download"),page.locator("#ar-xlsx").click()]);await x.saveAs("/tmp/pe-exemption-report.xlsx");const [c]=await Promise.all([page.waitForEvent("download"),page.locator("#ar-csv").click()]);await c.saveAs("/tmp/pe-exemption-report.csv");
 }),
 check("new requirements and a reasoned exemption can be saved together without inventing a pupil",{...seed,"assessment.policies":{version:1,policies:[extra]}},async page=>{
  await open(page);eq(await exrow(page).count(),0);await page.locator("#as-from").fill("2026-09-01");await page.locator("#as-to").fill("2026-12-31");await page.locator('.as-test[data-test="push"] .as-required').check();await exempt(page,"Recovery");await page.locator("#as-save").click();eq((await policy(page)).exemptions,[{sid:"a",test:"push",reason:"Recovery"}]);eq((await envelope(page)).policies.find(p=>p.cid===other),extra);
 }),
 check("pupil navigation alone is not a dirty edit; five languages fit a narrow phone",seed,async page=>{
  await page.setViewportSize({width:390,height:844});for(const lang of ["en","he","ar","ru","es"]){await page.evaluate(lang=>window.I18N.set(lang),lang);await open(page);ok(await page.locator("#as-ex-panel").isVisible());ok((await page.locator("#as-ex-panel").innerText()).includes("[a]"));ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));await page.locator("#as-ex-pupil").selectOption("b");await page.locator("#as-close").click();ok(!(await page.locator("#askModal").isVisible()));}
 })
]};
