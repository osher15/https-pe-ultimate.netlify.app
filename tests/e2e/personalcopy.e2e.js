"use strict";
/* Personal editable copy of a lesson (#21 item 5 / #24 bank-to-copy) */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");
const seed={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION};
const go=async p=>{ await p.evaluate(()=>window.HM.go("lesson")); await p.waitForTimeout(500); };
const lib=p=>p.evaluate(()=>window.HM.LS.get("ls.lib",[]));
const gen=async p=>{ await p.selectOption("#ls-focus","aerobic"); await p.click("#ls-gen"); await p.waitForTimeout(150); };

module.exports={title:"#21 — עותק אישי של מערך",tests:[
  check("שמירה, עדכון מפורש עם גרסה קודמת, ושחזור — המקור לא נדרס בשמירה כעותק חדש",seed,async p=>{
    await go(p); await gen(p);
    eq(await p.isVisible("#ls-update"),false,"אין «עדכן» לפני שמירה");
    await p.click("#ls-save"); await p.waitForTimeout(100);
    let l=await lib(p); eq(l.length,1,"נשמר עותק"); ok(!l[0].plan.src,"מערך שנוצר במחולל — בלי src");
    eq(await p.isVisible("#ls-update"),true,"«עדכן» מופיע אחרי שמירה");
    const t0=l[0].plan.phases[0].n;
    await p.click('[data-pe="toggle"]'); await p.waitForTimeout(80);
    await p.fill('.pe-row[data-pi="0"] [data-pf="n"]',"שם ערוך שלי"); await p.click('[data-pe="toggle"]'); await p.waitForTimeout(80);
    l=await lib(p); eq(l[0].plan.phases[0].n,t0,"עריכה על המסך לבדה לא משנה את הספרייה");
    await p.click("#ls-update"); await p.waitForTimeout(100);
    l=await lib(p); eq(l.length,1,"עדכון לא יוצר כפילות"); eq(l[0].plan.phases[0].n,"שם ערוך שלי"); eq(l[0].prev.phases[0].n,t0,"הגרסה הקודמת נשמרה");
    await p.click("#ls-libList [data-undo]"); await p.waitForTimeout(100);
    l=await lib(p); eq(l[0].plan.phases[0].n,t0,"שוחזר"); eq(l[0].prev.phases[0].n,"שם ערוך שלי");
    /* טענו מהספרייה ← «שמור» יוצר עותק חדש שזוכר את המקור */
    await p.click("#ls-libList [data-load]"); await p.waitForTimeout(100);
    await p.click("#ls-save"); await p.waitForTimeout(100);
    l=await lib(p); eq(l.length,2); eq(l[0].plan.src.kind,"copy"); eq(l[0].plan.src.id,l[1].plan.id,"המקור מזוהה"); ok(l[0].plan.id!==l[1].plan.id,"מזהה חדש");
    ok(await p.locator(".ls-src").count()>0,"שורת «מבוסס על»");
  }),

  check("מערך מהבנק ← עותק אישי: הבנק לא משתנה, הדקות מהקטעים, מקור וסטטוס מוצגים, ואפשר לפתוח את המקור",seed,async p=>{
    await go(p);
    const before=await p.evaluate(()=>JSON.stringify(window.LESSONBANK.sports));
    await p.evaluate(()=>document.querySelector("#ls-bankList [data-bopen]").click()); await p.waitForTimeout(250);
    await p.click("#ls-bankCopy"); await p.waitForTimeout(250);
    const info=await p.evaluate(()=>({n:window.LESSON.current().phases.length,min:window.LESSON.current().phases.reduce((a,x)=>a+x.min,0),src:window.LESSON.current().src,
      lib:window.HM.LS.get("ls.lib",[]).length,after:JSON.stringify(window.LESSONBANK.sports),modal:document.getElementById("ls-bankModal").classList.contains("on")}));
    ok(info.n>=4,"שלבים מהקטעים: "+info.n); eq(info.src.kind,"bank"); eq(info.lib,1,"נשמר בספרייה"); eq(info.after,before,"רשומות הבנק לא השתנו"); eq(info.modal,false,"החלון נסגר");
    ok(info.min>=30&&info.min<=120,"סכום דקות סביר: "+info.min);
    const txt=await p.evaluate(()=>document.querySelector(".ls-src").textContent);
    ok(/טיוטה|draft/i.test(txt),"סטטוס טיוטה מוצג: "+txt);
    await p.click(".ls-src [data-bankopen]"); await p.waitForTimeout(400);
    ok(await p.evaluate(()=>document.getElementById("ls-bankModal").classList.contains("on")),"המקור נפתח");
  }),

  check("הספרייה מלאה: שמירה נדחית בהודעה, ושום מערך לא נמחק בשקט",seed,async p=>{
    await go(p); await gen(p);
    await p.evaluate(()=>{ const a=[]; for(let i=0;i<60;i++)a.push({id:1000+i,plan:{id:"x"+i,title:"P"+i,date:"2026-01-01",grade:"mid",em:"📋",phases:[{n:"a",min:5,d:"d",k:"main"}]}}); window.HM.LS.set("ls.lib",a); });
    await p.click("#ls-save"); await p.waitForTimeout(150);
    const l=await lib(p); eq(l.length,60,"ללא שינוי"); eq(l[59].plan.title,"P59","המערך הישן ביותר עדיין שם");
    ok(/60/.test(await p.evaluate(()=>document.querySelector(".toast, #toast")?.textContent||"")),"הודעת הספרייה מלאה");
  }),
]};
