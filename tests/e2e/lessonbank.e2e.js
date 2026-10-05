"use strict";
/* ============================================================
   מאגר מערכים בינלאומי (hm-lessonbank.js)
   ------------------------------------------------------------
   60 מערכים מלאים (10 לכל ענף) בחמש שפות עצמאיות, מוצגים בארכיון
   הקיים של מסך «מערכי שיעור». הבדיקה כאן לא בודקת תוכן פדגוגי —
   זה נטען כמות שהוא ממאגר Notion — אלא רק שהארכיון עולה, מציג
   לפחות מערך אחד בענף פעיל, ושפתיחת מערך בכל אחת מחמש השפות
   מציגה כותרת אמיתית בלי לקרוס.
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const seed={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION};
const LANGS=["he","en","ar","ru","es"];
const go=async page=>{ await page.evaluate(()=>window.HM.go("lesson")); await page.waitForTimeout(500); };
const switchLang=async(page,code)=>{ await page.evaluate(c=>window.I18N.set(c),code); await page.waitForTimeout(150); };

module.exports={title:"מאגר מערכים בינלאומי",tests:[

  check("הארכיון הבינלאומי מוצג עם ענף פעיל ולפחות מערך אחד",seed,async page=>{
    await go(page);
    const shown=await page.evaluate(()=>document.getElementById("ls-bankCard").style.display!=="none");
    ok(shown,"כרטיס המאגר מוצג כשיש נתונים");
    const n=await page.evaluate(()=>document.querySelectorAll("#ls-bankList [data-bopen]").length);
    ok(n>=1,"לפחות מערך אחד ברשימה — התקבל "+n);
    const sportBtns=await page.evaluate(()=>document.querySelectorAll("#ls-bankSports button").length);
    ok(sportBtns>=1,"לפחות כפתור ענף אחד");
  }),

  check("כל אחת מחמש השפות: פתיחת המערך הראשון מציגה כותרת אמיתית",seed,async page=>{
    await go(page);
    for(const l of LANGS){
      await switchLang(page,l);
      await page.evaluate(()=>{
        const b=document.querySelector("#ls-bankList [data-bopen]");
        if(b)b.click();
      });
      await page.waitForTimeout(200);
      const title=await page.evaluate(()=>document.getElementById("ls-bankTitle").textContent.trim());
      ok(title.length>3,l+": כותרת המערך ריקה או קצרה מדי — "+JSON.stringify(title));
      const secCount=await page.evaluate(()=>document.querySelectorAll("#ls-bankBody .ls-bank-sec").length);
      ok(secCount>=5,l+": פחות מ-5 סעיפים מוצגים בגוף המערך — "+secCount);
      await page.evaluate(()=>document.querySelector('[data-close="ls-bankModal"]').click());
      await page.waitForTimeout(150);
    }
  }),

  check("החלפת ענף מרעננת את הרשימה בלי לקרוס",seed,async page=>{
    await go(page);
    const sports=await page.evaluate(()=>[...document.querySelectorAll("#ls-bankSports button")].map(b=>b.dataset.bsport));
    ok(sports.length>=1,"יש לפחות ענף אחד לבדוק");
    for(const s of sports){
      await page.evaluate(sp=>document.querySelector('#ls-bankSports [data-bsport="'+sp+'"]').click(),s);
      await page.waitForTimeout(150);
      const n=await page.evaluate(()=>document.querySelectorAll("#ls-bankList [data-bopen]").length);
      ok(n>=1,s+": הרשימה ריקה אחרי מעבר ענף");
    }
  }),
  check("סטטוס טיוטה מוצג בכרטיס ובמערך, והתווית של תגיות אינה מזכירה מוצר אחר",seed,async page=>{
    await go(page);
    ok(await page.locator("#ls-bankHint .ls-bank-draft").count()===1,"באנר טיוטה בכרטיס");
    eq(await page.evaluate(()=>window.LESSONBANK.meta.provenance.reviewStatus),"draft","סטטוס מקור");
    for(const code of LANGS){
      await switchLang(page,code); await go(page);
      await page.locator("#ls-bankList [data-bopen]").first().click(); await page.waitForTimeout(150);
      const body=await page.textContent("#ls-bankBody");
      ok(!/\bPRO\b|המגרש PRO/.test(body),code+": אין אזכור של מוצר אחר");
      ok(await page.locator("#ls-bankBody .ls-bank-draft").count()===1,code+": באנר טיוטה במערך");
      await page.evaluate(()=>document.querySelector("#ls-bankModal").classList.remove("on"));
    }
  }),
  check("ענף שחסר בשפה הפעילה: הודעה מפורשת וחזרה לעברית — לא בשקט",seed,async page=>{
    await go(page);
    await page.evaluate(()=>{ delete window.LESSONBANK.sports.basketball.ru; });
    await switchLang(page,"ru"); await go(page);
    await page.locator('#ls-bankSports button[data-bsport="basketball"]').click();
    ok(await page.locator("#ls-bankHint .ls-bank-missing").count()===1,"הודעת שפה חסרה");
    ok(await page.locator("#ls-bankList [data-bopen]").count()>=1,"המערכים מוצגים בעברית");
  }),
]};
