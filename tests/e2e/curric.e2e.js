"use strict";
/* ============================================================
   שלב 14 — ספריית הקוריקולום על המסך
   ------------------------------------------------------------
   שכבת הנתונים נבדקת ב-Node, בשנייה, ב-curric.test.js. מה
   שהבדיקות כאן שומרות עליו הוא הדבר שבדיקת יחידה אינה יכולה
   לראות: **שתג הטיוטה באמת מגיע לעין של המורה.**

   זה אינו פרט עיצובי. כל ‎300‎ עמודי הקוריקולום נושאים במקור
   "נדרשת בדיקת איש מקצוע, עריכת שפה ופיילוט לפני פרסום", והתג
   הוא הדבר היחיד שמפריד בין מערך שנבדק בשטח לבין מערך שאיש
   מקצוע עוד לא ראה. שינוי עיצוב תמים שמסתיר אותו הופך את
   האפליקציה למשהו שמציג תוכן לא בדוק כאילו הוא מוכן, ולכן יש
   כאן בדיקה שתיפול אם זה יקרה.
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const seed={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION};
const openCurric=async page=>{
  await page.evaluate(()=>window.HM.go("curric"));
  await page.waitForTimeout(600);
};

module.exports={title:"ספריית הקוריקולום",tests:[

  check("המסך נפתח ומציג את המערכים שנטענו",seed,async page=>{
    await openCurric(page);
    const r=await page.evaluate(()=>({
      on:!!document.querySelector("#view-curric.on"),
      mod:document.body.dataset.mod,
      lib:(window.CURRIC||[]).length,
      cards:document.querySelectorAll("#cu-grid .cu-card").length
    }));
    ok(r.on,"המסך אינו פעיל");
    eq(r.mod,"curric","המודול אינו מסומן");
    ok(r.lib>0,"הספרייה ריקה");
    eq(r.cards,r.lib,"מספר הכרטיסים אינו תואם את מספר המערכים");
  }),

  check("כל כרטיס נושא תג סטטוס — אין מערך בלי תג",seed,async page=>{
    await openCurric(page);
    const r=await page.evaluate(()=>{
      const cards=[...document.querySelectorAll("#cu-grid .cu-card")];
      return cards.map(c=>({
        code:c.dataset.code,
        badge:(c.querySelector(".cu-badge")||{}).textContent||null
      }));
    });
    ok(r.length>0,"אין כרטיסים");
    r.forEach(c=>ok(c.badge&&c.badge.trim().length>0,
      c.code+" — כרטיס בלי תג סטטוס"));
  }),

  check("התג אומר «טיוטה» ונראה לעין, לא מוסתר",seed,async page=>{
    await openCurric(page);
    const r=await page.evaluate(()=>{
      const b=document.querySelector("#cu-grid .cu-badge");
      if(!b)return null;
      const cs=getComputedStyle(b), rc=b.getBoundingClientRect();
      return {text:b.textContent.trim(),
        display:cs.display, visibility:cs.visibility, opacity:+cs.opacity,
        w:Math.round(rc.width), h:Math.round(rc.height),
        /* צבע ומסגרת — התג אינו נשען על צבע בלבד */
        border:parseFloat(cs.borderTopWidth)};
    });
    ok(r,"לא נמצא תג");
    eq(r.text,"טיוטה","נוסח התג השתנה");
    ok(r.display!=="none"&&r.visibility!=="hidden","התג מוסתר");
    ok(r.opacity>0.7,"התג שקוף מדי: "+r.opacity);
    ok(r.w>20&&r.h>12,"התג קטן מכדי להיקרא: "+r.w+"×"+r.h);
    ok(r.border>0,"לתג אין מסגרת — הוא נשען על צבע בלבד");
  }),

  check("המערך הפתוח מציג את הפס ואת משפט הסטטוס מהמקור",seed,async page=>{
    await openCurric(page);
    await page.evaluate(()=>window.CURRICUI.open(
      document.querySelector("#cu-grid .cu-card").dataset.code));
    await page.waitForTimeout(400);
    const r=await page.evaluate(()=>{
      const s=document.querySelector("#cu-mBody .cu-strip");
      return {open:!!document.querySelector("#cu-modal.on"),
        strip:s?s.textContent.trim():null,
        tone:s?s.className:null,
        note:(document.querySelector("#cu-mBody .cu-strip-note")||{}).textContent||null,
        sections:document.querySelectorAll("#cu-mBody .cu-sec").length};
    });
    ok(r.open,"החלון לא נפתח");
    ok(r.strip&&/טיוטה/.test(r.strip),"אין פס סטטוס במערך הפתוח");
    ok(/warn|stop/.test(r.tone),"הפס אינו מסומן כאזהרה: "+r.tone);
    ok(r.note&&/בדיקת איש מקצוע/.test(r.note),
      "משפט הסטטוס מ-Notion אינו מוצג למורה");
    eq(r.sections,20,"לא כל ‎20‎ הסעיפים הוצגו");
  }),

  check("שלושת הסעיפים הראשונים פתוחים, השאר סגורים",seed,async page=>{
    await openCurric(page);
    await page.evaluate(()=>window.CURRICUI.open(
      document.querySelector("#cu-grid .cu-card").dataset.code));
    await page.waitForTimeout(400);
    const r=await page.evaluate(()=>({
      open:document.querySelectorAll("#cu-mBody .cu-sec[open]").length,
      all:document.querySelectorAll("#cu-mBody .cu-sec").length}));
    eq(r.open,3,"מערך פתוח במלואו הוא קיר טקסט");
    eq(r.all,20);
  }),

  check("תוכן המערך נמלט — אין HTML מתוך הנתונים",seed,async page=>{
    await openCurric(page);
    await page.evaluate(()=>{
      /* הזרקה מכוונת לתוך סעיף, כדי לוודא שהיא מוצגת כטקסט */
      window.CURRIC[0].sections[1].md='<img src=x onerror="window.__pwn=1">';
      window.CURRICUI.open(window.CURRIC[0].code);
    });
    await page.waitForTimeout(400);
    const r=await page.evaluate(()=>({
      pwn:!!window.__pwn,
      imgs:document.querySelectorAll("#cu-mBody img").length,
      shown:/onerror/.test(document.querySelector("#cu-mBody").textContent)}));
    ok(!r.pwn,"קוד מתוך התוכן רץ");
    eq(r.imgs,0,"תג HTML מהתוכן נוצר בפועל");
    ok(r.shown,"התוכן לא הוצג כטקסט");
  }),

  check("בחירת ענף מציגה את מסלול הלמידה",seed,async page=>{
    await openCurric(page);
    await page.evaluate(()=>
      document.querySelector('#cu-sports [data-sport="basketball"]').click());
    await page.waitForTimeout(400);
    const r=await page.evaluate(()=>({
      shown:document.querySelector("#cu-pathWrap").style.display!=="none",
      steps:document.querySelectorAll("#cu-path .cu-step").length,
      title:document.querySelector("#cu-pathTitle").textContent,
      note:document.querySelector("#cu-pathNote").textContent.trim()}));
    ok(r.shown,"המסלול אינו מוצג");
    const inLib=await page.evaluate(()=>
      (window.CURRIC||[]).filter(L=>L.sport==="basketball"&&L.lang==="he").length);
    eq(r.steps,inLib,"המסלול מציג "+r.steps+" שלבים מתוך "+inLib+" מערכים — שלב נפל");
    ok(/כדורסל/.test(r.title),"כותרת המסלול שגויה");
    ok(/חלקי/.test(r.note),"ייבוא חלקי אינו מסומן — רשימה שמדלגת נקראת כמו מלאה");
  }),

  check("«הכול» אינו מציג מסלול — שישה מסלולים ברשימה אחת חסרי משמעות",seed,async page=>{
    await openCurric(page);
    await page.evaluate(()=>
      document.querySelector('#cu-sports [data-sport=""]').click());
    await page.waitForTimeout(350);
    eq(await page.evaluate(()=>
      document.querySelector("#cu-pathWrap").style.display),"none");
  }),

  check("חיפוש מסנן, וסינון בלי תוצאות אומר זאת",seed,async page=>{
    await openCurric(page);
    const hit=await page.evaluate(async()=>{
      const i=document.querySelector("#cu-search");
      i.value="מסירה"; i.dispatchEvent(new Event("input"));
      await new Promise(r=>setTimeout(r,250));
      return document.querySelectorAll("#cu-grid .cu-card").length;
    });
    ok(hit>0&&hit<3,"החיפוש לא סינן: "+hit);
    const none=await page.evaluate(async()=>{
      const i=document.querySelector("#cu-search");
      i.value="שחייה בתעלה"; i.dispatchEvent(new Event("input"));
      await new Promise(r=>setTimeout(r,250));
      return {cards:document.querySelectorAll("#cu-grid .cu-card").length,
        empty:document.querySelector("#cu-empty").style.display!=="none"};
    });
    eq(none.cards,0,"חיפוש ללא תוצאות החזיר כרטיסים");
    ok(none.empty,"אין הודעה כשאין תוצאות");
  }),

  check("סינון גיל מחוץ לטווח מרוקן את הרשימה בלי לשקר",seed,async page=>{
    await openCurric(page);
    const r=await page.evaluate(async()=>{
      const s=document.querySelector("#cu-age");
      s.value="17"; s.dispatchEvent(new Event("change"));
      await new Promise(r=>setTimeout(r,250));
      return {cards:document.querySelectorAll("#cu-grid .cu-card").length,
        empty:document.querySelector("#cu-empty").style.display!=="none"};
    });
    eq(r.cards,0,"מערך לגיל ‎9‎–‎11‎ הוצג לגיל ‎17‎");
    ok(r.empty,"אין הודעת ריק");
  }),

  /* הבדיקה נוגעת בפקדים של המסך הזה בלבד. `.pf-tabs` הוא רכיב
     משותף ל-‎11‎ מסכים, עם גובה בסיס ‎35‎ פיקסל ומצב «כפתורים גדולים»
     מפורש בהגדרות — החלטת מוצר קיימת, שהגדלה שלה נוגעת בכל
     האפליקציה ואינה תופעת לוואי של הוספת מסך. היא מטופלת במעבר
     הנגישות הנפרד (KNOWLEDGE_REVIEW §‎7‎, פריט ‎6‎). */
  check("מטרות המגע של פקדי המסך עומדות ברף ‎40‎ פיקסל",seed,async page=>{
    await openCurric(page);
    await page.evaluate(()=>
      document.querySelector('#cu-sports [data-sport="basketball"]').click());
    await page.waitForTimeout(350);
    await page.evaluate(()=>window.CURRICUI.open(
      document.querySelector("#cu-grid .cu-card").dataset.code));
    await page.waitForTimeout(350);
    const bad=await page.evaluate(()=>{
      const out=[];
      document.querySelectorAll(".cu-chip, .cu-step, .cu-sec>summary")
        .forEach(el=>{
          const r=el.getBoundingClientRect();
          if(r.width>0&&r.height>0&&r.height<40)
            out.push((el.className||el.tagName)+" "+Math.round(r.height));
        });
      return out;
    });
    eq(bad.length,0,"מטרות מגע קטנות מדי: "+bad.join(", "));
  }),

  check("פקדי המסך גדלים במצב «כפתורים גדולים»",seed,async page=>{
    await openCurric(page);
    const before=await page.evaluate(()=>
      Math.round(document.querySelector(".cu-chip").getBoundingClientRect().height));
    const after=await page.evaluate(async()=>{
      document.body.dataset.touch="1";
      document.documentElement.style.setProperty("--touch","8px");
      await new Promise(r=>setTimeout(r,150));
      return Math.round(document.querySelector(".cu-chip").getBoundingClientRect().height);
    });
    ok(after>before,"הבוררים אינם משתתפים במצב ההגדלה: "+before+" → "+after);
  }),

  check("המסך נגיש מהתפריט הראשי",seed,async page=>{
    await page.evaluate(()=>document.getElementById("btnMenu").click());
    await page.waitForTimeout(320);
    const r=await page.evaluate(()=>{
      const b=document.querySelector('#navDrawer [data-go="curric"]');
      return b?{text:b.textContent.trim(),h:Math.round(b.getBoundingClientRect().height)}:null;
    });
    ok(r,"אין כניסה בתפריט");
    ok(/קוריקולום/.test(r.text),"תווית התפריט שגויה: "+r.text);
    ok(r.h>=40,"שורת התפריט נמוכה מדי");
  })
]};
