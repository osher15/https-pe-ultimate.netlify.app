"use strict";
/* שלב 15 — נגישות בכל השפות: פינת התזונה, טיפי השטח, הדרכת הפוטו־פיניש,
   בדיקת השפיות, מספרי החזה, המדריך המהיר ודף האודות.
   הבדיקה פשוטה בכוונה: בשפה שאינה עברית לא נשארת אות עברית אחת בטקסט
   שהמורה קורא — וחזרה לעברית מחזירה את המקור בדיוק. */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const seed={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION};
const withStudent={
  "stu.list":[{id:"a",name:"דן אבירם",cls:"ט׳3",cid:"c:ט:3",sex:"boys",age:14,tests:[]}],
  "pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION
};
const fresh={"schema.version":D.SCHEMA_VERSION};   /* הדרכת הפוטו־פיניש עוד לא נראתה */

const LANGS=["en","ar","ru","es"];
const go=async(page,m,ms)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(ms||500); };
const switchLang=async(page,code)=>{ await page.evaluate(c=>window.I18N.set(c),code); await page.waitForTimeout(150); };
/* הטקסט הגלוי של אלמנט, בלי שמות תלמידים שהמורה הזין בעברית */
const txt=(page,sel)=>page.evaluate(s=>[...document.querySelectorAll(s)].map(e=>e.textContent).join(" | "),sel);
const HEB=/[֐-׿]/;

module.exports={title:"שלב 15 — תזונה, פוטו־פיניש ומדריך בכל שפה",tests:[

  check("המילון: לכל שפה בדיוק אותם מפתחות — כיסוי ‎100%‎, כולל ספרדית",seed,async page=>{
    const cov=await page.evaluate(()=>window.I18N.coverage());
    ok(await page.evaluate(()=>window.I18N.langs().some(l=>l.code==="es")),"ספרדית ברשימת השפות");
    LANGS.forEach(l=>eq(cov.out[l],cov.base,"כיסוי "+l));
  }),

  check("פינת התזונה: כותרות, קטגוריות, טיפ היום וכל הטיפים — בלי עברית בשום שפה",seed,async page=>{
    await go(page,"nut");
    for(const l of LANGS){
      await switchLang(page,l);
      const all=await txt(page,"#view-nut");
      ok(!HEB.test(all),l+": נשארה עברית במסך התזונה — "+(all.match(/.{0,30}[֐-׿].{0,30}/)||[""])[0]);
      eq(await page.evaluate(()=>document.querySelectorAll("#nut-list .nut-tip").length),15,l+": כל 15 הטיפים");
    }
    await switchLang(page,"he");
    eq(await page.evaluate(()=>document.querySelector('[data-i18n="nut.daily"]').textContent),"הטיפ של היום");
    ok(HEB.test(await txt(page,"#nut-dailyTxt")),"חזרה לעברית מחזירה את הטיפ בעברית");
  }),

  check("פינת התזונה: החלפת שפה מתרגמת את אותו טיפ, ולא מגרילה אחר",seed,async page=>{
    await go(page,"nut");
    await page.evaluate(()=>document.getElementById("nut-shuffle").click());
    const he=await txt(page,"#nut-dailyTxt");
    await switchLang(page,"en"); await switchLang(page,"he");
    eq(await txt(page,"#nut-dailyTxt"),he,"אחרי הלוך־חזור מופיע אותו טיפ");
  }),

  check("הקראה לכיתה: הקול בשפת הממשק, והכריזות האחרות נשארות he-IL",seed,async page=>{
    await page.evaluate(()=>{
      window.__said=[];
      window.HM.SET.voice=true;
      speechSynthesis.speak=u=>window.__said.push(u.lang);
      speechSynthesis.cancel=()=>{};
    });
    await go(page,"nut");
    await switchLang(page,"es");
    await page.evaluate(()=>document.getElementById("nut-say").click());
    await switchLang(page,"ar");
    await page.evaluate(()=>document.getElementById("nut-say").click());
    await page.evaluate(()=>window.HM.say("בדיקה"));
    eq(JSON.stringify(await page.evaluate(()=>window.__said)),JSON.stringify(["es-ES","ar-SA","he-IL"]));
  }),

  check("דף הבית: טיפ השטח ושורת התזונה מתורגמים — גם בהחלפת שפה אחרי הכניסה",withStudent,async page=>{
    await go(page,"home");
    for(const l of LANGS){
      await switchLang(page,l);
      const t=await txt(page,"#fieldTip, #hx-nutTip");
      ok(!HEB.test(t),l+": "+t);
    }
  }),

  check("טיפ ההתחלה (מכשיר ריק) מתורגם, ועדיין מפנה למצב הדגמה",seed,async page=>{
    await go(page,"home");
    await switchLang(page,"en");
    ok((await txt(page,"#fieldTip")).indexOf("Demo mode")>=0,"באנגלית");
    await switchLang(page,"he");
    ok((await txt(page,"#fieldTip")).indexOf("מצב הדגמה")>=0,"ובחזרה לעברית");
  }),

  check("הדרכת הפוטו־פיניש: מוצגת בשפת הממשק, ומתורגמת גם כשהיא פתוחה",fresh,async page=>{
    await switchLang(page,"ru");
    await go(page,"photo",900);
    ok(await page.evaluate(()=>document.getElementById("pfGuideModal").classList.contains("on")),"ההדרכה נפתחה");
    let t=await txt(page,"#pfGuideModal");
    ok(!HEB.test(t),"ru: "+t.slice(0,120));
    ok(t.indexOf("Далее")>=0,"כפתור «הבא» ברוסית");
    await page.evaluate(()=>{ for(let i=0;i<3;i++)document.getElementById("pfg-next").click(); });
    await switchLang(page,"es");
    t=await txt(page,"#pfGuideModal");
    ok(!HEB.test(t),"es: "+t.slice(0,120));
    ok(t.indexOf("¡Vamos a medir!")>=0,"בשלב האחרון — כפתור הסיום בספרדית");
  }),

  check("בדיקת שפיות ומספרי חזה: מתורגמים בכל שפה",seed,async page=>{
    for(const l of LANGS){
      await switchLang(page,l);
      const t=await txt(page,"#pfSanityModal, #pfNumModal");
      ok(!HEB.test(t),l+": "+(t.match(/.{0,30}[֐-׿].{0,30}/)||[""])[0]);
    }
    eq(await page.evaluate(()=>document.querySelectorAll("#pfSanityModal ol li").length),5,"חמשת הסעיפים נשמרו");
  }),

  check("המדריך המהיר ודף האודות: כל הקטעים מתורגמים, ומבנה ה-details נשמר",seed,async page=>{
    for(const l of LANGS){
      await switchLang(page,l);
      const t=await txt(page,"#infoModal, #aboutModal .ab-p, #aboutModal .ab-sec b");
      ok(!HEB.test(t),l+": "+(t.match(/.{0,30}[֐-׿].{0,30}/)||[""])[0]);
    }
    eq(await page.evaluate(()=>document.querySelectorAll("#infoModal details[data-info]").length),13,"13 קטעים");
    await switchLang(page,"he");
    ok((await txt(page,'#infoModal [data-info="photo"] summary')).indexOf("פוטו־פיניש")>=0,"חזרה לעברית");
  })

]};
