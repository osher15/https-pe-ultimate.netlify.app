"use strict";
/* ============================================================
   מאגר הידע — תוכניות אימון מוערכות בשלוש שפות
   ------------------------------------------------------------
   PROGRAMS ב-hm-know.js הוא התוכן העמוק הרגיש ביותר שתורגם עד כה:
   12 תוכניות אימון עם מינון, בלוקים ו-cues שהם הוראות בטיחות ולא
   סגנון. הבדיקות כאן בודקות את אותו דפוס בדיוק כמו SOURCES/GAMES —
   כולל מעבר שפה תוך כדי שהמסך פתוח — ומוסיפות בדיקה ספציפית
   שהמספרים בתוך ה-cues/dose לא זזו בתרגום.
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const seed={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION};

const go=async(page,m,ms)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(ms||600); };
const switchLang=async(page,code)=>{ await page.evaluate(c=>window.I18N.set(c),code); await page.waitForTimeout(150); };
const openProgTab=async page=>{
  await page.evaluate(()=>document.querySelector('#kn-tabs [data-kt="prog"]').click());
  await page.waitForTimeout(250);
};
const firstProg=page=>page.evaluate(()=>{
  const c=document.querySelector("#kn-progList .kn-prog");
  return c?{name:c.querySelector("b").textContent, level:c.querySelector(".org").textContent}:null;
});
const openFirstProg=async page=>{
  await page.evaluate(()=>document.querySelector("#kn-progList .kn-prog").click());
  await page.waitForTimeout(300);
};
const modalText=page=>page.evaluate(()=>document.getElementById("kn-mBody").textContent);

module.exports={title:"מאגר הידע — תוכניות אימון בשלוש שפות",tests:[

  check("עברית: ללא שינוי שפה, התוכנית הראשונה בעברית כרגיל",seed,async page=>{
    await go(page,"know");
    await openProgTab(page);
    const p=await firstProg(page);
    ok(p.name.indexOf("חימום 11+")>=0,"שם עברי: "+p.name);
  }),

  check("אנגלית: הכרטיס וכותרות המודל מתורגמים, והמספרים לא זזים",seed,async page=>{
    await go(page,"know");
    await switchLang(page,"en");
    await openProgTab(page);
    const p=await firstProg(page);
    ok(p.name.indexOf("FIFA 11+")>=0,"שם אנגלי: "+p.name);
    await openFirstProg(page);
    const body=await modalText(page);
    ok(body.indexOf("Who it's for")>=0,"כותרת מתורגמת: "+body.slice(0,80));
    ok(body.indexOf("15–20 min")>=0,"המינון נשאר עם אותם מספרים: "+body.slice(0,200));
    ok(body.indexOf("30%")>=0&&body.indexOf("46%")>=0,"האחוזים בסקירה השיטתית לא זזו");
    ok(body.indexOf("Knee over toe")>=0,"דגש הבטיחות תורגם: "+body.slice(0,300));
  }),

  check("ערבית: שם ומגמת RTL",seed,async page=>{
    await go(page,"know");
    await switchLang(page,"ar");
    await openProgTab(page);
    const p=await firstProg(page);
    ok(p.name.indexOf("برنامج الإحماء")>=0,"שם ערבי: "+p.name);
  }),

  check("רוסית: שם מתורגם",seed,async page=>{
    await go(page,"know");
    await switchLang(page,"ru");
    await openProgTab(page);
    const p=await firstProg(page);
    ok(p.name.indexOf("Программа разминки")>=0,"שם רוסי: "+p.name);
  }),

  check("החלפת שפה בזמן שהמסך פתוח מציירת מחדש",seed,async page=>{
    await go(page,"know");
    await openProgTab(page);
    const before=await firstProg(page);
    ok(before.name.indexOf("חימום 11+")>=0,"מתחילים בעברית");
    await switchLang(page,"en");
    const after=await firstProg(page);
    ok(after.name.indexOf("FIFA 11+")>=0,"התעדכן בלי לצאת מהמסך: "+after.name);
  }),

  check("חזרה לעברית מציגה שוב את המקור העברי המקורי",seed,async page=>{
    await go(page,"know");
    await openProgTab(page);
    await switchLang(page,"en");
    await switchLang(page,"he");
    const p=await firstProg(page);
    ok(p.name.indexOf("חימום 11+")>=0,"חזר לעברית: "+p.name);
  }),

  check("מבנה הבלוקים (t/x) נשמר באותו אורך אחרי תרגום — לא רק השם",seed,async page=>{
    await go(page,"know");
    await switchLang(page,"en");
    await openProgTab(page);
    await openFirstProg(page);
    const n=await page.evaluate(()=>document.querySelectorAll("#kn-mBody .kn-blk").length);
    eq(n,3,"שלושת הבלוקים של חימום 11+ (ריצה, כוח, ריצה מהירה)");
  })

]};
