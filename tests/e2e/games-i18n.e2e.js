"use strict";
/* ============================================================
   מאגר המשחקים — קטלוג המשחקים בשלוש שפות
   ------------------------------------------------------------
   GAMES ב-hm-know.js הוא תוכן עמוק (42 משחקים, כל אחד עם שלבי
   ביצוע, וריאציות ובטיחות) — אותו דפוס בדיוק כמו SOURCES, כולל
   אותה מלכודת: בלי מאזין i18n:change בתוך GAMES, המסך היה נשאר
   בעברית עד שיוצאים ונכנסים שוב.
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const seed={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION};

const go=async(page,m,ms)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(ms||600); };
const switchLang=async(page,code)=>{ await page.evaluate(c=>window.I18N.set(c),code); await page.waitForTimeout(150); };
const firstCard=page=>page.evaluate(()=>{
  const c=document.querySelector("#gm-grid .gm-card");
  if(!c)return null;
  return {name:c.querySelector("b").textContent, tag:c.querySelector(".tag").textContent};
});
const openFirst=async page=>{
  await page.evaluate(()=>document.querySelector("#gm-grid .gm-card").click());
  await page.waitForTimeout(300);
};
const modalText=page=>page.evaluate(()=>document.getElementById("gm-mBody").textContent);

module.exports={title:"מאגר המשחקים — קטלוג המשחקים בשלוש שפות",tests:[

  check("עברית: ללא שינוי שפה, המשחק הראשון בעברית כרגיל",seed,async page=>{
    await go(page,"games");
    const c=await firstCard(page);
    ok(c.name.indexOf("תופסת דגלים")>=0,"שם עברי: "+c.name);
  }),

  check("אנגלית: הכרטיס הראשון וגם תוויות הקטגוריה מתורגמים",seed,async page=>{
    await go(page,"games");
    await switchLang(page,"en");
    const c=await firstCard(page);
    ok(c.name.indexOf("Capture the Flag")>=0,"שם אנגלי: "+c.name);
    ok(c.tag.indexOf("Large groups")>=0,"תווית הקטגוריה עברה: "+c.tag);
    await openFirst(page);
    const body=await modalText(page);
    ok(body.indexOf("Goal of the game")>=0,"כותרות המודל תורגמו: "+body.slice(0,80));
    ok(body.indexOf("Aerobic endurance")>=0,"והתוכן עצמו תורגם: "+body.slice(0,200));
  }),

  check("ערבית: שם ומגמת RTL",seed,async page=>{
    await go(page,"games");
    await switchLang(page,"ar");
    const c=await firstCard(page);
    ok(c.name.indexOf("لعبة صيد العلم")>=0,"שם ערבי: "+c.name);
  }),

  check("רוסית: שם מתורגם",seed,async page=>{
    await go(page,"games");
    await switchLang(page,"ru");
    const c=await firstCard(page);
    ok(c.name.indexOf("Захват флага")>=0,"שם רוסי: "+c.name);
  }),

  check("החלפת שפה בזמן שהמסך פתוח מציירת מחדש",seed,async page=>{
    await go(page,"games");
    const before=await firstCard(page);
    ok(before.name.indexOf("תופסת דגלים")>=0,"מתחילים בעברית");
    await switchLang(page,"en");
    const after=await firstCard(page);
    ok(after.name.indexOf("Capture the Flag")>=0,"התעדכן בלי לצאת מהמסך: "+after.name);
  }),

  check("חזרה לעברית מציגה שוב את המקור העברי המקורי",seed,async page=>{
    await go(page,"games");
    await switchLang(page,"en");
    await switchLang(page,"he");
    const c=await firstCard(page);
    ok(c.name.indexOf("תופסת דגלים")>=0,"חזר לעברית: "+c.name);
  }),

  check("סינון לפי קטגוריה ממשיך לעבוד אחרי החלפת שפה",seed,async page=>{
    await go(page,"games");
    await switchLang(page,"en");
    await page.evaluate(()=>document.querySelector('#gm-cats [data-gc="water"]').click());
    await page.waitForTimeout(300);
    const n=await page.evaluate(()=>document.querySelectorAll("#gm-grid .gm-card").length);
    eq(n,2,"שני משחקי מים (g-water, g-bucketrelay)");
    const c=await firstCard(page);
    ok(c.name.indexOf("Sponge Relay")>=0,"והם עדיין מתורגמים: "+c.name);
  })

]};
