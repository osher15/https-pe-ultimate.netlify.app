"use strict";
/* ============================================================
   Issue #58 — no built-in third-party fitness standards
   ------------------------------------------------------------
   The beep module shows a VO2max ESTIMATE (Léger et al. 1988). A
   category appears only where the teacher entered school reference
   thresholds (bt.refs). Zone strings already stored on pupil tests are
   historical and must be shown exactly as stored, never rewritten.
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const LSget=(page,k)=>page.evaluate(x=>JSON.parse(localStorage.getItem("peultimate."+x)),k);
const go=async(page,m)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(500); };
/* speed 12.5 at age 14 → VO2max ≈ 52.9 */
const ROW={id:1,name:"דן אבירם",level:7,sh:5,dist:1200,time:421.3,speed:12.5};
const base={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION,"bt.age":14,"bt.sex":"boys",
  "ft.classes":{"c:ט:3":{id:"c:ט:3",name:"ט׳3",grade:"ט",num:3,key:"ט3"}},
  "stu.list":[{id:"a",name:"דן אבירם",cls:"ט׳3",cid:"c:ט:3",sex:"boys",age:14,h:null,w:null,
    tests:[{d:"2026-01-01",type:"ביפ",dist:1180,level:"7·3",speed:12,vo2:44.2,zone:"אזור בריא"}]}],
  "bt.results":[ROW]};
const catCells=page=>page.$$eval("#bt-tbody tr td:nth-child(8)",tds=>tds.map(td=>td.textContent.trim()));
const setPair=async(page,sex,age,lo,hi)=>{
  await page.fill('#bt-normWrap .bt-refIn[data-sex="'+sex+'"][data-age="'+age+'"][data-i="0"]',String(lo));
  await page.fill('#bt-normWrap .bt-refIn[data-sex="'+sex+'"][data-age="'+age+'"][data-i="1"]',String(hi));
};
const openNorms=page=>page.evaluate(()=>{ document.getElementById("bt-normFold").open=true; });
/* The beep CSV as text: capture the Blob instead of downloading it. */
const beepCsv=page=>page.evaluate(async()=>{
  let blob=null; const o=URL.createObjectURL, c=HTMLAnchorElement.prototype.click;
  URL.createObjectURL=b=>{ blob=b; return "blob:x"; }; HTMLAnchorElement.prototype.click=function(){};
  try{ document.getElementById("bt-csvBtn").click(); }finally{ URL.createObjectURL=o; HTMLAnchorElement.prototype.click=c; }
  return blob?(await blob.text()).replace(/^\uFEFF/,"").split("\n").map(l=>l.split(",")):null; });

module.exports={title:"#58: VO₂max estimate, optional school reference thresholds",tests:[

  check("no thresholds: estimate only, no category, no third-party naming",base,async page=>{
    await go(page,"beep");
    eq(await LSget(page,"bt.refs"),null,"empty by default");
    eq(await catCells(page),["—"],"no category without thresholds");
    const vo2=await page.$eval("#bt-tbody tr td:nth-child(7)",td=>td.textContent.trim());
    eq(vo2,"52.9","the estimate is still shown");
    const note=await page.textContent("#bt-estNote");
    ok(/הערכה/.test(note)&&/Léger/.test(note)&&/לא הוזנו ספי ייחוס/.test(note),"note: "+note);
    await openNorms(page);
    const vals=await page.$$eval("#bt-normWrap .bt-refIn",i=>i.map(x=>x.value));
    eq(vals.length,36,"9 ages × 2 sexes × 2 inputs");
    ok(vals.every(v=>v===""),"editor starts empty");
    const csv=await beepCsv(page);
    eq(csv[0][8],"דרגה","the category column stays in the export");
    eq(csv[1][7],"52.9"); eq(csv[1][8],"","and is empty without thresholds");
    const body=await page.evaluate(()=>document.documentElement.outerHTML);
    ok(!/FITNESSGRAM|Healthy Fitness Zone|Cooper Institute|\bHFZ\b/i.test(body),"no third-party naming in the page");
  }),

  check("entering thresholds shows the band and persists",base,async page=>{
    await go(page,"beep"); await openNorms(page);
    await setPair(page,"boys",14,40,50);
    await page.click("#bt-refsSave"); await page.waitForTimeout(200);
    eq(await LSget(page,"bt.refs"),{boys:{14:[40,50]},girls:{}},"saved under bt.refs");
    eq(await catCells(page),["עומד בייחוס"],"52.9 ≥ 50 and < 56");
    ok(/לפי ספי הייחוס/.test(await page.textContent("#bt-estNote")));
    eq((await beepCsv(page))[1][8],"עומד בייחוס","export carries the band");
    /* a different sex has no thresholds → back to estimate only */
    await page.evaluate(x=>document.querySelector('#bt-sexSeg button[data-s="'+x+'"]').click(),"girls"); await page.waitForTimeout(150);
    eq(await catCells(page),["—"],"girls 14 has no pair");
    await page.evaluate(x=>document.querySelector('#bt-sexSeg button[data-s="'+x+'"]').click(),"boys"); await page.waitForTimeout(150);
    eq(await catCells(page),["עומד בייחוס"]);
    /* survives a reload (persisted, not just in memory) */
    await page.reload(); await page.waitForTimeout(800); await go(page,"beep");
    eq(await catCells(page),["עומד בייחוס"],"after reload");
    await openNorms(page);
    eq(await page.inputValue('#bt-normWrap .bt-refIn[data-sex="boys"][data-age="14"][data-i="1"]'),"50.0");
  }),

  check("invalid input is rejected and nothing is half-saved",base,async page=>{
    await go(page,"beep"); await openNorms(page);
    await setPair(page,"boys",13,38,42);
    await setPair(page,"boys",14,50,45);
    await page.click("#bt-refsSave"); await page.waitForTimeout(200);
    eq(await LSget(page,"bt.refs"),null,"lower ≥ upper → not saved, valid rows not saved either");
    ok(await page.isVisible("#bt-refsErr"),"error shown");
    eq(await page.getAttribute('#bt-normWrap .bt-refIn[data-sex="boys"][data-age="14"][data-i="0"]',"aria-invalid"),"true");
    await setPair(page,"boys",14,10,45);
    await page.click("#bt-refsSave"); await page.waitForTimeout(200);
    eq(await LSget(page,"bt.refs"),null,"out of range → not saved");
    await setPair(page,"boys",14,40,"");
    await page.click("#bt-refsSave"); await page.waitForTimeout(200);
    eq(await LSget(page,"bt.refs"),null,"one side empty → not saved");
    eq(await catCells(page),["—"]);
  }),

  check("clear removes all thresholds and ↩ undo restores them",
    Object.assign({},base,{"bt.refs":{boys:{14:[40,50]},girls:{}}}),async page=>{
    await go(page,"beep"); await openNorms(page);
    eq(await catCells(page),["עומד בייחוס"]);
    await page.click("#bt-refsClear"); await page.waitForTimeout(200);
    eq(D.refsEmpty(await LSget(page,"bt.refs")),true,"cleared");
    eq(await catCells(page),["—"]);
    await page.waitForSelector("#toastAct",{state:"visible",timeout:3000}); await page.click("#toastAct"); await page.waitForTimeout(300);
    eq(await LSget(page,"bt.refs"),{boys:{14:[40,50]},girls:{}},"undo restores");
  }),

  check("a stored historical zone string is shown as stored and never rewritten",
    Object.assign({},base,{"bt.refs":{boys:{14:[40,50]},girls:{}}}),async page=>{
    await go(page,"stu");
    const pill=await page.$eval('#stu-list .stu-row[data-id="a"] .catpill',e=>e.textContent.trim());
    eq(pill,"אזור בריא","list shows the stored label");
    await page.locator('.stu-row[data-id="a"]').click(); await page.waitForTimeout(300);
    const cells=await page.$$eval("#stu-mBody .tbl tbody .catpill",e=>e.map(x=>x.textContent.trim()));
    ok(cells.includes("אזור בריא"),"profile table shows the stored label: "+JSON.stringify(cells));
    await page.click("#stu-fSave"); await page.waitForTimeout(300);
    const s=(await LSget(page,"stu.list")).find(x=>x.id==="a");
    eq(s.tests[0].zone,"אזור בריא","save details does not rewrite a stored zone");
    eq(s.id,"a"); eq(s.cid,"c:ט:3");
  }),

  check("saving beep results to a class: zone only when thresholds apply",base,async page=>{
    await go(page,"beep");
    await page.evaluate(()=>window.STU.importFromBeep({quiet:true,cls:"ט׳3",cid:"c:ט:3"}));
    let t=(await LSget(page,"stu.list")).find(x=>x.id==="a").tests;
    eq(t.length,2); eq(t[0].zone,"אזור בריא","old record untouched");
    eq(t[1].zone,"","no thresholds → empty category on the new record");
    ok(t[1].vo2>52&&t[1].vo2<53,"estimate stored");
    await page.evaluate(()=>{ const s=window.HM.LS.get("stu.list",[]); s[0].tests.pop(); window.HM.LS.set("stu.list",s);
      window.HM.LS.set("bt.refs",{boys:{14:[40,50]},girls:{}}); });
    await page.evaluate(()=>window.STU.importFromBeep({quiet:true,cls:"ט׳3",cid:"c:ט:3"}));
    t=(await LSget(page,"stu.list")).find(x=>x.id==="a").tests;
    eq(t.map(x=>x.zone),["אזור בריא","עומד בייחוס"]);
  }),

  check("English: neutral labels and estimate note",Object.assign({},base,{"bt.refs":{boys:{14:[40,50]},girls:{}}}),async page=>{
    await page.evaluate(()=>window.I18N.set("en")); await page.waitForTimeout(200);
    await go(page,"beep"); await openNorms(page); await page.waitForTimeout(200);
    eq(await catCells(page),["Meets reference"]);
    ok(/estimate/i.test(await page.textContent("#bt-estNote")));
    ok(/School reference thresholds/.test(await page.textContent("#bt-normFold summary")));
    ok(/no built-in standards table/.test(await page.textContent("#bt-refsIntro")));
    const body=await page.evaluate(()=>document.body.innerText);
    ok(!/FITNESSGRAM|Healthy Fitness Zone|\bHFZ\b/i.test(body));
  })
]};
