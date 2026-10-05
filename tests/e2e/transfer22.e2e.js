"use strict";
/* #22 — העברה בין מכשירים בקובץ: קוד אימות זהה ביצירה ובתצוגה המקדימה של השחזור */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js"),fs=require("fs");
const seed={"settings":{school:"מקיף גימל",theme:"dark",sound:true},"lang":"en","schema.version":D.SCHEMA_VERSION,
  "ft.results":[{id:"r1",d:"2026-09-02",ts:1,cls:"ט׳3",test:"push",name:"דן",sid:"a",val:22,unit:"חזרות"}]};
const CODE=/\b[0-9A-F]{4}-[0-9A-F]{4}\b/;

async function exportFile(p,path){
  await p.evaluate(()=>window.HM.openSettings('backup'));
  const ev=p.waitForEvent("download");
  await p.locator("#set-bkExport").click();
  await (await ev).saveAs(path);
  await p.waitForFunction(()=>/[0-9A-F]{4}-[0-9A-F]{4}/.test(document.body.innerText));
  const text=await p.evaluate(()=>document.body.innerText);
  return text.match(CODE)[0];
}

module.exports={title:"#22 — העברה בין מכשירים: קוד אימות",tests:[
  check("הקוד שמוצג ביצירת הקובץ הוא הקוד שמוצג בתצוגה המקדימה של השחזור",seed,async p=>{
    const path="/tmp/pe-transfer22.json";
    const fp=await exportFile(p,path);
    await p.setInputFiles("#set-bkFile",path);
    await p.locator("#bk-fp").waitFor();
    eq((await p.textContent("#bk-fp")).match(CODE)[0],fp,"אותו קוד");
  }),
  check("קובץ ששונה ולו בתו אחד מקבל קוד אחר, וקובץ אחר לא מתחזה לקודם",seed,async p=>{
    const path="/tmp/pe-transfer22b.json";
    const fp=await exportFile(p,path);
    const altered=fs.readFileSync(path,"utf8").replace("מקיף גימל","מקיף דלת");
    await p.setInputFiles("#set-bkFile",{name:"x.json",mimeType:"application/json",buffer:Buffer.from(altered)});
    await p.locator("#bk-fp").waitFor();
    const got=(await p.textContent("#bk-fp")).match(CODE)[0];
    ok(got!==fp,"קוד שונה לקובץ שונה: "+got+" מול "+fp);
  }),
  check("קוד האימות מתורגם, ושחזור מהקובץ שומר שפה ומזהים",seed,async p=>{
    const path="/tmp/pe-transfer22c.json";
    await exportFile(p,path);
    await p.setInputFiles("#set-bkFile",path);
    await p.locator("#bk-fp").waitFor();
    ok(/Verification code/.test(await p.textContent("#bk-fp")),"באנגלית: "+await p.textContent("#bk-fp"));
    await p.locator("#bk-go").click();
    await p.waitForTimeout(800);
    const st=await p.evaluate(()=>({lang:window.HM.LS.get("lang",null),ids:window.HM.LS.get("ft.results",[]).map(r=>r.id)}));
    eq(st.ids,["r1"],"מזהים קבועים"); eq(st.lang,"en","שפה נשמרת");
  })
]};
