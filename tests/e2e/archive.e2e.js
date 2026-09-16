"use strict";
/* ============================================================
   ארכוב מדידות ישנות — מקצה לקצה, כולל IndexedDB
   ------------------------------------------------------------
   ft.results גדלה לנצח ב-localStorage, ששם המכסה קטנה (~5MB —
   ARCHITECTURE_AUDIT.md §5). עד עכשיו הדרך היחידה להקטין אותה
   הייתה מחיקה בלתי הפיכה (§wirePurge). הבדיקות כאן נוגעות ב-
   IndexedDB אמיתי — לא הדמיה שלו — כי זה בדיוק המסלול ששבר את
   backup.e2e.js כשגרסת המסד עלתה מ-1 ל-2 (ראו התיקון שם).

   הערה מתודולוגית: am-go/am-restoreAll מרעננים את הדף אחרי הפעולה
   (כמו pg-go במחיקה), וסקריפט ההזרעה של ה-harness רץ מחדש בכל
   רענון — כלומר בדיקה שעוברת דרך הכפתור ובודקת ft.results אחרי
   הרענון תראה את הזרע המקורי, לא את התוצאה. זה לא באג באפליקציה;
   זו תכונת ה-harness (הזרעה דטרמיניסטית בכל טעינה). לכן: בדיקות
   על ft.results קוראות ל-RARC.archiveOld/restoreAll ישירות (כמו
   backupTest.apply בבדיקות הגיבוי), ובדיקת הכפתור עצמו מאמתת דרך
   IndexedDB — שאינו מוזרע מחדש ולכן בטוח לבדוק גם אחרי רענון. */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const OLD="2023-01-15", NEW="2026-08-01";
const base={
  "ft.classes":{"c:ט:3":{id:"c:ט:3",name:"ט׳3",grade:"ט",num:3,key:"ט3"}},
  "ft.roster":{"c:ט:3":["a"]},
  "stu.list":[{id:"a",name:"דן אבירם",cls:"ט׳3",cid:"c:ט:3",sex:"boys",age:14,h:null,w:null,tests:[]}],
  "ft.results":[
    {id:"r1",d:OLD,ts:1,cls:"ט׳3",cid:"c:ט:3",test:"push",name:"דן אבירם",sid:"a",val:20,unit:"חזרות"},
    {id:"r2",d:NEW,ts:2,cls:"ט׳3",cid:"c:ט:3",test:"push",name:"דן אבירם",sid:"a",val:25,unit:"חזרות"}
  ],
  "settings":{school:"מקיף גימל"},"schema.version":D.SCHEMA_VERSION,"pf.guideSeen":true};

const results=page=>page.evaluate(()=>window.HM.LS.get("ft.results",[]));
const arcCount=page=>page.evaluate(()=>window.RARC.count());
const openSettings=async page=>{
  await page.evaluate(()=>document.getElementById("btnSettings").click());
  await page.waitForTimeout(500);
};
const openArchiveModal=async page=>{
  await openSettings(page);
  await page.evaluate(()=>document.getElementById("set-archive").click());
  await page.waitForTimeout(500);
};

module.exports={title:"ארכוב מדידות ישנות",tests:[

  /* ---------- הלוגיקה עצמה, דרך RARC ישירות (כמו backupTest) ---------- */

  check("archiveOld מזיז מדידות ישנות מ-ft.results, ומשאיר את החדשות",base,async page=>{
    const r=await page.evaluate(()=>window.RARC.archiveOld("2025-01-01"));
    eq(r.archived,1);
    const res=await results(page);
    eq(res.map(x=>x.id),["r2"],"רק המדידה החדשה נשארה פעילה");
    eq(await arcCount(page),1,"והישנה עברה לארכיון");
  }),

  check("מדידה שארכבו נשמרת בשלמותה — לא נחתכת",base,async page=>{
    await page.evaluate(()=>window.RARC.archiveOld("2025-01-01"));
    const item=await page.evaluate(async()=>{
      const all=await window.RARC.exportAll();
      return all.items[0];
    });
    eq(item.id,"r1"); eq(item.val,20); eq(item.name,"דן אבירם"); eq(item.sid,"a");
  }),

  check("archiveOld על תאריך שאינו כולל כלום לא נוגע בדבר",base,async page=>{
    const r=await page.evaluate(()=>window.RARC.archiveOld("2020-01-01"));
    eq(r.archived,0);
    eq((await results(page)).length,2,"שתי המדידות עדיין פעילות");
    eq(await arcCount(page),0);
  }),

  check("restoreAll מחזיר את הארכיון לפעיל ומרוקן אותו",base,async page=>{
    await page.evaluate(()=>window.RARC.archiveOld("2025-01-01"));
    eq((await results(page)).length,1,"אחרי ארכוב — רק אחת פעילה");
    const r=await page.evaluate(()=>window.RARC.restoreAll());
    eq(r.restored,1);
    const res=await results(page);
    eq(res.map(x=>x.id).sort(),["r1","r2"],"שתי המדידות פעילות שוב");
    eq(await arcCount(page),0,"והארכיון התרוקן");
  }),

  check("restoreAll על ארכיון ריק לא עושה כלום",base,async page=>{
    const r=await page.evaluate(()=>window.RARC.restoreAll());
    eq(r.restored,0);
    eq((await results(page)).length,2,"ft.results לא זז");
  }),

  check("גיבוי מלא כולל את הארכיון, ושחזור מחזיר אותו לארכיון — לא לפעיל",base,async page=>{
    await page.evaluate(()=>window.RARC.archiveOld("2025-01-01"));
    const snap=await page.evaluate(()=>window.HM.backupTest.snapshotFull());
    ok(Array.isArray(snap.arc)&&snap.arc.length===1,"הגיבוי נושא את הרשומה הארכיבית");
    eq(snap.arc[0].id,"r1");

    /* מנקים הכול — כמו מכשיר חדש */
    await page.evaluate(async()=>{
      Object.keys(localStorage).filter(k=>k.indexOf("peultimate.")===0).forEach(k=>localStorage.removeItem(k));
      await window.RARC.restoreAll();      /* מרוקן את ה-oldres שהיה על המכשיר */
    });

    const r=await page.evaluate(s=>window.HM.backupTest.apply(s),snap);
    eq(r.arc.added,1,"רשומת הארכיון יובאה");
    const res=await results(page);
    eq(res.map(x=>x.id),["r2"],"רק הפעילה חזרה ל-ft.results — הארכיבית לא קפצה לפעיל");
    eq(await arcCount(page),1,"והיא נמצאת בארכיון, כמו שהייתה לפני הגיבוי");
  }),

  /* ---------- מד המקום, דרך הפונקציות הטהורות ---------- */

  check("מד המקום מוצג בהגדרות אחרי ארכוב",base,async page=>{
    await page.evaluate(()=>window.RARC.archiveOld("2025-01-01"));
    await openSettings(page);
    const text=await page.evaluate(()=>document.getElementById("set-quotaMeter").textContent);
    ok(/אחסון/.test(text),"מציג אחוז אחסון: "+text);
    ok(text.indexOf("1 מדידות בארכיון")>=0,"ומזכיר את הארכיון: "+text);
  }),

  /* ---------- חלון הארכוב: תצוגה מקדימה וכפתורים (בלי ללחוץ go) ---------- */

  check("בחירת תאריך מציגה תצוגה מקדימה נכונה ומדליקה את הכפתור",base,async page=>{
    await openArchiveModal(page);
    await page.evaluate(()=>{ document.getElementById("am-date").value="2025-01-01";
      document.getElementById("am-date").dispatchEvent(new Event("change")); });
    await page.waitForTimeout(300);
    const preview=await page.evaluate(()=>document.getElementById("am-preview").textContent);
    ok(preview.indexOf("1")>=0,"מזכיר מדידה אחת: "+preview);
    eq(await page.evaluate(()=>document.getElementById("am-go").disabled),false);
  }),

  check("תאריך שלא תופס כלום — הכפתור כבוי",base,async page=>{
    await openArchiveModal(page);
    await page.evaluate(()=>{ document.getElementById("am-date").value="2020-01-01";
      document.getElementById("am-date").dispatchEvent(new Event("change")); });
    await page.waitForTimeout(300);
    ok(await page.evaluate(()=>document.getElementById("am-go").disabled),"אין מה לארכב");
  }),

  check("כפתור «שחזר הכול» כבוי כשהארכיון ריק, ואומר את זה",base,async page=>{
    await openArchiveModal(page);
    const disabled=await page.evaluate(()=>document.getElementById("am-restoreAll").disabled);
    ok(disabled,"אין מה לשחזר");
    const text=await page.evaluate(()=>document.getElementById("am-count").textContent);
    ok(text.indexOf("ריק")>=0,"וכתוב את זה בפירוש: "+text);
  }),

  check("כשיש ארכיון — «שחזר הכול» פעיל ומציג כמות",base,async page=>{
    await page.evaluate(()=>window.RARC.archiveOld("2025-01-01"));
    await openArchiveModal(page);
    const disabled=await page.evaluate(()=>document.getElementById("am-restoreAll").disabled);
    eq(disabled,false);
    const text=await page.evaluate(()=>document.getElementById("am-count").textContent);
    ok(text.indexOf("1")>=0,"מציג את הכמות: "+text);
  }),

  /* ---------- לחיצה אמיתית על הכפתור — מאומתת דרך IndexedDB בלבד ----------
     (localStorage מוזרע מחדש ברענון, כמפורט למעלה — IndexedDB לא) */

  check("לחיצה אמיתית על «ארכב» כותבת בפועל ל-IndexedDB",base,async page=>{
    await openArchiveModal(page);
    await page.evaluate(()=>document.querySelector('#am-quick [data-m="24"]').click());
    await page.waitForTimeout(400);
    await page.evaluate(()=>document.getElementById("am-go").click());
    await page.waitForTimeout(1300);      /* עובר את הרענון של 700ms */
    eq(await arcCount(page),1,"הכפתור האמיתי ארכב בפועל");
  })

]};
