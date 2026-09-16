"use strict";
/* ============================================================
   מאגר הידע — קטלוג המקורות בשלוש שפות
   ------------------------------------------------------------
   SOURCES ב-hm-know.js הוא תוכן עמוק (תיאור ‎18‎ מקורות רשמיים),
   לא מעטפת — עד עכשיו לא היה לו שום i18n, גם לא לתוויות הסביב
   («הכל», «איך משתמשים בזה:»). זו הבדיקה הראשונה שתוכן עמוק
   מוצג נכון בשפה שאינה עברית — ושנופל בחזרה לעברית בלי להיעלם.
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const seed={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION};

const go=async(page,m,ms)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(ms||600); };
const switchLang=async(page,code)=>{ await page.evaluate(c=>window.I18N.set(c),code); await page.waitForTimeout(150); };
const firstCard=page=>page.evaluate(()=>{
  const c=document.querySelector("#kn-srcList .kn-src");
  if(!c)return null;
  return {
    title:c.querySelector("b").textContent,
    org:c.querySelector(".org").textContent,
    use:c.querySelector(".usebox").textContent,
    link:c.querySelector("a").textContent
  };
});
const regLabels=page=>page.evaluate(()=>
  [...document.querySelectorAll("#kn-regs [data-kr]")].map(b=>b.textContent));

module.exports={title:"מאגר הידע — קטלוג המקורות בשלוש שפות",tests:[

  check("עברית: ללא שינוי שפה, הכרטיס הראשון בעברית כרגיל",seed,async page=>{
    await go(page,"know");
    const c=await firstCard(page);
    ok(c.title.indexOf("תוכנית הלימודים")>=0,"כותרת עברית: "+c.title);
    ok(c.use.indexOf("איך משתמשים בזה")>=0,"התווית עצמה בעברית: "+c.use);
  }),

  check("אנגלית: הכרטיס הראשון וגם תוויות האזורים מתורגמים",seed,async page=>{
    await go(page,"know");
    await switchLang(page,"en");
    const c=await firstCard(page);
    ok(c.title.indexOf("Physical Education Curriculum")>=0,"כותרת אנגלית: "+c.title);
    ok(c.org.indexOf("Israeli Ministry of Education")>=0,"הגוף המצטט: "+c.org);
    ok(c.use.indexOf("How to use this")>=0,"התווית «איך משתמשים» עברה: "+c.use);
    ok(c.link.indexOf("official source")>=0,"קישור המקור: "+c.link);
    const regs=await regLabels(page);
    ok(regs.some(r=>r==="All"),"תווית «הכל»: "+JSON.stringify(regs));
  }),

  check("ערבית: כותרת ומגמת RTL נשארת נכונה",seed,async page=>{
    await go(page,"know");
    await switchLang(page,"ar");
    const c=await firstCard(page);
    ok(c.title.indexOf("منهج التربية البدنية")>=0,"כותרת ערבית: "+c.title);
    ok(c.use.indexOf("كيفية استخدام")>=0,"התווית בערבית: "+c.use);
  }),

  check("רוסית: כותרת מתורגמת",seed,async page=>{
    await go(page,"know");
    await switchLang(page,"ru");
    const c=await firstCard(page);
    ok(c.title.indexOf("Учебная программа")>=0,"כותרת רוסית: "+c.title);
  }),

  check("החלפת שפה בזמן שהמסך פתוח מציירת מחדש — לא רק בכניסה מחדש",seed,async page=>{
    /* זה בדיוק התיקון: go() לא היה מרענן תוכן דינמי במעבר שפה,
       רק data-i18n סטטי. בלי מאזין i18n:change בתוך KNOW, הכרטיס
       היה נשאר בעברית עד שיוצאים ונכנסים שוב. */
    await go(page,"know");
    const before=await firstCard(page);
    ok(before.title.indexOf("תוכנית הלימודים")>=0,"מתחילים בעברית");
    await switchLang(page,"en");
    const after=await firstCard(page);
    ok(after.title.indexOf("Physical Education Curriculum")>=0,
      "התעדכן בלי לצאת מהמסך: "+after.title);
  }),

  check("חזרה לעברית מציגה שוב את המקור העברי המקורי, לא תרגום קפוא",seed,async page=>{
    await go(page,"know");
    await switchLang(page,"en");
    await switchLang(page,"he");
    const c=await firstCard(page);
    ok(c.title.indexOf("תוכנית הלימודים")>=0,"חזר לעברית: "+c.title);
  }),

  check("סינון לפי אזור ממשיך לעבוד אחרי החלפת שפה",seed,async page=>{
    await go(page,"know");
    await switchLang(page,"en");
    await page.evaluate(()=>document.querySelector('#kn-regs [data-kr="std"]').click());
    await page.waitForTimeout(300);
    const n=await page.evaluate(()=>document.querySelectorAll("#kn-srcList .kn-src").length);
    eq(n,5,"חמישה מקורות סטנדרטים/מדידה (shape, fitgram, nsca-youth, fifa11, fifa11-rct)");
    const c=await firstCard(page);
    ok(c.title.indexOf("National Physical Education Standards")>=0,"והם עדיין מתורגמים: "+c.title);
  })

]};
