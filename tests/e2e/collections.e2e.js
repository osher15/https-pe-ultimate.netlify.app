"use strict";
/* Personal collections (#21 item 3): games, my plans and bank lessons; manager; games filter; persistence. */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");
const seed={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION};
const go=async(p,m)=>{ await p.evaluate(x=>window.HM.go(x),m); await p.waitForTimeout(500); };
const cols=p=>p.evaluate(()=>window.HM.LS.get("col.list",[]));

module.exports={title:"#21 — אוספים אישיים",tests:[
  check("משחק: יצירת אוסף מהחלון, הוספה, סינון בדף המשחקים, שרידות ברענון, והסרה — המשחק עצמו לא משתנה",seed,async p=>{
    await go(p,"games");
    const before=await p.evaluate(()=>JSON.stringify(window.GAMES.byId("g-flags")));
    await p.locator('#gm-grid [data-g="g-flags"]').click(); await p.waitForTimeout(250);
    await p.click("#gm-colBtn"); await p.waitForTimeout(200);
    await p.fill("#col-newIn","שבוע כדורשת"); await p.click("#col-newBtn"); await p.waitForTimeout(150);
    let c=await cols(p); eq(c.length,1); eq(c[0].name,"שבוע כדורשת"); eq(c[0].items,[{k:"g",id:"g-flags"}]);
    ok(await p.isChecked('#col-pickBody [data-pc]'),"מסומן");
    await p.fill("#col-newIn","שבוע כדורשת"); await p.click("#col-newBtn"); await p.waitForTimeout(100);
    eq((await cols(p)).length,1,"שם כפול נדחה");
    await p.evaluate(()=>{ document.querySelectorAll(".modal.on").forEach(m=>m.classList.remove("on")); });
    ok(await p.locator('#gm-cats [data-gc^="col:"]').count()===1,"צ׳יפ אוסף בדף המשחקים");
    await p.locator('#gm-cats [data-gc^="col:"]').click(); await p.waitForTimeout(150);
    eq(await p.locator("#gm-grid .gm-card").count(),1,"רק משחקי האוסף");
    await p.reload(); await p.waitForTimeout(700); await go(p,"games");
    eq((await cols(p)).length,1,"שרד רענון");
    eq(await p.evaluate(()=>JSON.stringify(window.GAMES.byId("g-flags"))),before,"המשחק לא השתנה");
    /* הסרה מהאוסף דרך הבוחר */
    await p.locator('#gm-grid [data-g="g-flags"], #gm-cats [data-gc="all"]').first().click(); await p.waitForTimeout(150);
    await p.locator('#gm-grid [data-g="g-flags"]').click(); await p.waitForTimeout(250);
    await p.click("#gm-colBtn"); await p.waitForTimeout(150);
    await p.uncheck('#col-pickBody [data-pc]'); await p.waitForTimeout(150);
    c=await cols(p); eq(c[0].items.length,0,"הוסר, האוסף נשאר");
  }),

  check("מנהל האוספים: מערך שלי ומערך מהבנק, פתיחה, הסרה, שינוי שם, ומחיקה בשתי לחיצות — הפריטים נשארים",seed,async p=>{
    await go(p,"lesson");
    await p.selectOption("#ls-focus","aerobic"); await p.click("#ls-gen"); await p.waitForTimeout(150);
    await p.click("#ls-save"); await p.waitForTimeout(150);
    await p.click("#ls-libList [data-col]"); await p.waitForTimeout(200);
    await p.fill("#col-newIn","לשבוע הבא"); await p.click("#col-newBtn"); await p.waitForTimeout(150);
    await p.evaluate(()=>document.getElementById("col-modal").classList.remove("on"));
    await p.evaluate(()=>document.querySelector("#ls-bankList [data-bopen]").click()); await p.waitForTimeout(250);
    await p.click("#ls-bankCol"); await p.waitForTimeout(200);
    await p.check('#col-pickBody [data-pc]'); await p.waitForTimeout(150);
    await p.evaluate(()=>document.querySelectorAll(".modal.on").forEach(m=>m.classList.remove("on")));
    let c=await cols(p); eq(c[0].items.map(i=>i.k).sort(),["b","p"]);
    ok((await p.locator("#ls-colList .col-item").count())===1,"אוסף במנהל");
    await p.click("#ls-colList [data-ctoggle]"); await p.waitForTimeout(100);
    eq(await p.locator("#ls-colList .col-items li").count(),2);
    ok(!/לא זמין|Unavailable/.test(await p.locator("#ls-colList").innerText()),"שני הפריטים זמינים");
    /* פתיחת מערך שלי טוענת אותו למתכנן */
    await p.evaluate(()=>{ window.LESSON.current&&0; });
    await p.locator('#ls-colList [data-copen^="p|"]').click(); await p.waitForTimeout(200);
    ok(await p.isVisible("#ls-planCard"),"המערך נטען");
    /* מחיקת המערך מהספרייה: ההפניה נשארת כ«לא זמין», האוסף לא נמחק */
    await p.evaluate(()=>window.HM.LS.set("ls.lib",[])); await p.evaluate(()=>window.COLLECTIONS.paint()); await p.waitForTimeout(100);
    ok(/לא זמין|Unavailable/.test(await p.locator("#ls-colList").innerText()),"פריט שנמחק מסומן כלא זמין");
    /* הסרת הפריט, שינוי שם */
    await p.locator('#ls-colList [data-crm^="p|"]').click(); await p.waitForTimeout(100);
    eq((await cols(p))[0].items.length,1);
    await p.click("#ls-colList [data-cren]"); await p.fill("#ls-colList [data-cn]","שם חדש"); await p.click("#ls-colList [data-cok]"); await p.waitForTimeout(100);
    eq((await cols(p))[0].name,"שם חדש");
    /* מחיקה: לחיצה ראשונה רק מבקשת אישור */
    await p.click("#ls-colList [data-cdel]"); await p.waitForTimeout(100);
    eq((await cols(p)).length,1,"לחיצה ראשונה לא מוחקת");
    await p.click("#ls-colList [data-cdel]"); await p.waitForTimeout(100);
    eq((await cols(p)).length,0,"שנייה מוחקת את האוסף");
  }),

  check("המפתח col.list נשמר תחת קידומת האפליקציה (הגיבוי המלא לוקח את כל המפתחות לפי קידומת)",seed,async p=>{
    await go(p,"games");
    await p.evaluate(()=>{ const D=window.HMDATA; const a=D.colAdd([],"גיבוי",{now:5}); window.HM.LS.set("col.list",D.colToggle(a.list,a.id,{k:"g",id:"g-flags"}).list); });
    const snap=await p.evaluate(()=>Object.keys(localStorage).filter(k=>/col\.list$/.test(k)).length);
    eq(snap,1,"המפתח נשמר באחסון עם קידומת האפליקציה (נכלל בגיבוי לפי קידומת)");
  }),
]};
