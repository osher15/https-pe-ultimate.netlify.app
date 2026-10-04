"use strict";
const {check,eq,ok}=require("./harness.js"),D=require("../../hm-data.js");
const cid="c:ט:3",other="c:י:1",rule={target:40,step:5,points:5,min:0,max:100,rounding:"ceil"};
const policy={cid,period:"Q1",from:"2026-09-01",to:"2026-12-31",tests:[{id:"push",rule},{id:"situp"},{id:"shut4x10"}],exemptions:[{sid:"a",test:"shut4x10",reason:"Medical"}]};
const seed={lang:"en","schema.version":D.SCHEMA_VERSION,"grades.periods":["Q1","Q2"],"ft.classes":{[cid]:{id:cid,name:"Grade 9",grade:"ט",num:3},[other]:{id:other,name:"Grade 10",grade:"י",num:1}},
 "stu.list":[{id:"a",cid,cls:"Grade 9",name:"Same",tests:[],grades:{Q1:{exams:{manual:87}}}},{id:"b",cid,cls:"Grade 9",name:"Same",tests:[]},{id:"c",cid:other,cls:"Grade 10",name:"Other",tests:[]}],
 "ft.results":[{id:"r1",sid:"a",cid,test:"push",val:35,d:"2026-09-01",ts:1},{id:"r2",sid:"a",cid,test:"push",val:40,d:"2026-12-31",ts:2},{id:"old",sid:"a",cid,test:"push",val:55,d:"2026-08-31",ts:0},{id:"zero",sid:"b",cid,test:"push",val:0,d:"2026-10-03",ts:3}],"assessment.policies":{version:1,policies:[policy]}};
async function open(page,sid){await page.evaluate(({cid,sid})=>window.ASSESSMENT_REPORT.open(cid,sid,"Q1"),{cid,sid});}
module.exports={title:"Period reports and offline Excel",tests:[
 check("class report shows best period results, zero, blank missing/exempt scores and rule basis",seed,async page=>{
  await open(page);await page.locator("#ar-modal details").first().locator("summary").click();eq(await page.locator("#ar-table tbody tr").count(),6);const text=await page.locator("#ar-table").innerText();ok(text.includes("100"));ok(text.includes("Medical"));ok(!text.includes("55"));ok(text.includes("Target: 40"));
  const zero=page.locator("#ar-table tbody tr").nth(3);eq(await zero.locator("td").nth(12).innerText(),"0");eq(await zero.locator("td").nth(16).innerText(),"60");
  for(const index of [1,2,4,5])eq(await page.locator("#ar-table tbody tr").nth(index).locator("td").nth(16).innerText(),"");
  eq(await page.evaluate(()=>window.HM.LS.get("stu.list")[0].grades.Q1.exams.manual),87);
 }),
 check("pupil report and actual XLSX download contain only the selected pupil",seed,async page=>{
  await open(page,"a");eq(await page.locator("#ar-table tbody tr").count(),3);
  const [download]=await Promise.all([page.waitForEvent("download"),page.locator("#ar-xlsx").click()]);ok(download.suggestedFilename().endsWith(".xlsx"));await download.saveAs("/tmp/pe-assessment-pupil.xlsx");eq(await page.locator("#ar-error").innerText(),"");
 }),
 check("class CSV and Excel downloads are generated while offline from the displayed snapshot",seed,async page=>{
  await open(page);await page.context().setOffline(true);
  const [x]=await Promise.all([page.waitForEvent("download"),page.locator("#ar-xlsx").click()]);await x.saveAs("/tmp/pe-assessment-class.xlsx");
  const [c]=await Promise.all([page.waitForEvent("download"),page.locator("#ar-csv").click()]);await c.saveAs("/tmp/pe-assessment-class.csv");eq(await page.locator("#ar-error").innerText(),"");
 }),
 check("period without requirements cannot export an invented complete report",seed,async page=>{
  await open(page);await page.locator("#ar-period").selectOption("Q2");ok(await page.locator("#ar-noPolicy").isVisible());eq(await page.locator("#ar-xlsx").count(),0);await page.locator("#ar-configure").click();eq(await page.locator("#as-period").inputValue(),"Q2");
 }),
 check("corrupt restored configuration and export failure are visible without data mutation",seed,async page=>{
  await open(page);const before=await page.evaluate(()=>JSON.stringify(window.HM.LS.get("stu.list")));
  await page.evaluate(()=>window.HMXlsx.workbook=()=>{throw new Error("writer failed");});await page.locator("#ar-xlsx").click();ok((await page.locator("#ar-error").innerText()).includes("failed"));eq(await page.evaluate(()=>JSON.stringify(window.HM.LS.get("stu.list"))),before);
  await page.evaluate(()=>window.HM.LS.set("assessment.policies",{version:99,policies:[]}));await open(page);eq(await page.locator("#ar-xlsx").count(),0);ok((await page.locator("#ar-content").innerText()).includes("Cannot"));
 }),
 check("invalid and unidentified records show an exclusion warning and do not become scores",{...seed,"ft.results":[{sid:"a",cid,test:"push",val:null,d:"2026-10-03"},{sid:"a",cid,test:"push",val:40,d:"bad"},{name:"Same",cid,test:"push",val:40,d:"2026-10-03"}]},async page=>{
  await open(page);ok(await page.locator("#ar-content [role=status]").isVisible());eq(await page.locator("#ar-table tbody tr").first().locator("td").nth(16).innerText(),"");
 }),
 check("class coverage and pupil profile entry points open the correct report",seed,async page=>{
  await page.evaluate(cid=>window.FT.show(cid,"cov"),cid);await page.locator("#ft-cov [data-assessment-report]").click();eq(await page.locator("#ar-class").inputValue(),cid);await page.locator("#ar-close").click();
  await page.evaluate(()=>window.HM.go("stu"));await page.locator('.stu-row[data-id="a"]').click();await page.locator('#stu-mBody [data-assessment-report]').click();eq(await page.locator("#ar-table tbody tr").count(),3);
 }),
 check("five languages and phone width retain Excel and CSV controls without page overflow",seed,async page=>{
  await page.setViewportSize({width:390,height:844});
  for(const lang of ["en","he","ar","ru","es"]){await page.evaluate(lang=>window.I18N.set(lang),lang);await open(page,"a");ok((await page.locator("#ar-xlsx").innerText()).includes("Excel"));ok((await page.locator("#ar-csv").innerText()).includes("CSV"));ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2));await page.locator("#ar-close").click();}
 })
]};
