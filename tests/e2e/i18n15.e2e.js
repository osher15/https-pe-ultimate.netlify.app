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
  }),

  /* ---------- מילון המונחים: כותרות המסכים המקצועיים ---------- */

  check("משחקים: שמות המשחקים, הקטגוריות ושדה החיפוש מתורגמים בכל שפה",seed,async page=>{
    await go(page,"games");
    const want={en:"Dodgeball",ar:"الكرة المحرقة",ru:"Вышибалы",es:"Balón prisionero"};
    for(const l of LANGS){
      await switchLang(page,l);
      ok((await txt(page,"#view-games")).indexOf(want[l])>=0,l+": «מחניים» מתורגם");
      ok(!HEB.test(await page.evaluate(()=>document.querySelector("#view-games input[placeholder]").placeholder)),l+": placeholder");
    }
  }),

  check("ציור מחדש אחרי החלפת שפה (מעבר מסך, סינון) נשאר מתורגם",seed,async page=>{
    await switchLang(page,"es");
    await go(page,"ft"); await go(page,"games"); await go(page,"know");
    await go(page,"ft");
    const tabs=await page.evaluate(()=>[...document.querySelectorAll("#ft-tabs button")].map(b=>b.textContent));
    ok(tabs.some(t=>t.indexOf("Pruebas")>=0)&&tabs.every(t=>!HEB.test(t)),"לשוניות: "+tabs.join(" | "));
  }),

  check("שם תלמיד אינו מונח — נשאר בדיוק כפי שהוזן",withStudent,async page=>{
    await switchLang(page,"en");
    await go(page,"stu",700);
    ok((await txt(page,"#view-stu")).indexOf("דן אבירם")>=0,"השם העברי נשמר");
  }),

  check("הלוך־חזור לעברית מחזיר את מסך המבחנים אות באות",withStudent,async page=>{
    await go(page,"ft",700);
    const before=await txt(page,"#view-ft");
    for(const l of LANGS)await switchLang(page,l);
    await switchLang(page,"he"); await page.waitForTimeout(200);
    eq(await txt(page,"#view-ft"),before,"טקסט המסך זהה למקור");
  }),

  /* הדרישה: מי שבוחר שפה אחרת לא רואה עברית. סריקה של כל המסכים וכל
     הלשוניות שבהם — טקסט גלוי בלבד. */
  check("רוסית: אין אות עברית גלויה באף מסך ובאף לשונית",seed,async page=>{
    await switchLang(page,"ru");
    const mods=["home","ft","fit","lesson","games","know","tools","rec","stu","beep","photo","nut"];
    const left=[];
    for(const m of mods){
      await go(page,m,600);
      const n=await page.evaluate(x=>document.querySelectorAll("#view-"+x+" .tabs button, #view-"+x+" [data-tab], #view-"+x+" .seg button").length,m);
      for(let i=-1;i<n;i++){
        if(i>=0){ await page.evaluate(([x,i])=>{const b=document.querySelectorAll("#view-"+x+" .tabs button, #view-"+x+" [data-tab], #view-"+x+" .seg button")[i]; if(b)b.click();},[m,i]); await page.waitForTimeout(120); }
        const r=await page.evaluate(x=>{ const out=[]; const w=document.createTreeWalker(document.getElementById("view-"+x),NodeFilter.SHOW_TEXT);
          for(let t=w.nextNode();t;t=w.nextNode()){ const p=t.parentElement; if(/[֐-׿]/.test(t.nodeValue)&&p&&p.offsetParent!==null)out.push(t.nodeValue.trim()); } return out; },m);
        r.forEach(v=>{ if(left.indexOf(m+": "+v)<0)left.push(m+": "+v); });
      }
    }
    eq(left.length,0,"נשארה עברית:\n  "+left.slice(0,25).join("\n  "));
  }),

  /* מעבר לסריקת המסכים: התוכן העמוק שנפתח בחלונות — כל משחק, כל תוכנית
     אימון, מערך שנבנה לכל נושא ולשתי השכבות, וכל מסמך בארכיון המערכים. */
  check("רוסית, תוכן עמוק: משחקים, תוכניות, מערכים שנבנים ומסמכי הארכיון — בלי עברית",seed,async page=>{
    await switchLang(page,"ru");
    const scan=()=>page.evaluate(()=>{ const out=[]; const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
      for(let t=w.nextNode();t;t=w.nextNode()){ const p=t.parentElement;
        if(/[֐-׿]/.test(t.nodeValue)&&p&&p.offsetParent!==null&&!p.closest("script,style,textarea"))out.push(t.nodeValue.trim().slice(0,90)); }
      return out; });
    const closeAll=()=>page.evaluate(()=>document.querySelectorAll(".modal.on [data-close]").forEach(b=>b.click()));
    const left=new Set(); const note=(where,arr)=>arr.forEach(v=>left.add(where+": "+v));
    await go(page,"games");
    const nG=await page.evaluate(()=>document.querySelectorAll("#gm-grid .gm-card").length);
    for(let i=0;i<nG;i++){ await page.evaluate(i=>document.querySelectorAll("#gm-grid .gm-card")[i].click(),i);
      await page.waitForTimeout(60); note("game "+i,await scan()); await closeAll(); }
    await go(page,"know");
    await page.evaluate(()=>{ const b=document.querySelector('#kn-tabs [data-kt="prog"]')||document.querySelectorAll("#kn-tabs [data-kt]")[1]; if(b)b.click(); });
    await page.waitForTimeout(150);
    const nP=await page.evaluate(()=>document.querySelectorAll("#kn-progList .kn-prog").length);
    for(let i=0;i<nP;i++){ await page.evaluate(i=>document.querySelectorAll("#kn-progList .kn-prog")[i].click(),i);
      await page.waitForTimeout(60); note("program "+i,await scan()); await closeAll(); }
    await go(page,"lesson");
    for(const g of ["mid","high"]){
      await page.evaluate(g=>document.querySelector('#ls-gradeSeg [data-g="'+g+'"]').click(),g);
      const topics=await page.evaluate(()=>[...document.querySelectorAll("#ls-focus option")].map(o=>o.value));
      for(const t of topics){
        await page.evaluate(t=>{ const s=document.getElementById("ls-focus"); s.value=t; s.dispatchEvent(new Event("change")); document.getElementById("ls-gen").click(); },t);
        await page.waitForTimeout(80); note("plan "+g+"/"+t,await scan()); await closeAll();
      }
    }
    await page.evaluate(()=>{ const b=[...document.querySelectorAll("#ls-modeTabs button, #view-lesson .tabs button")].find(x=>/библиотек|Библиотек/i.test(x.textContent)); if(b)b.click(); });
    await page.waitForTimeout(200);
    const nD=await page.evaluate(()=>document.querySelectorAll("#ls-libList [data-doc]").length);
    for(let i=0;i<nD;i++){ await page.evaluate(i=>document.querySelectorAll("#ls-libList [data-doc]")[i].click(),i);
      await page.waitForTimeout(80); note("doc "+i,await scan()); await closeAll(); }
    ok(nG>=40&&nP>=10,"נפתחו "+nG+" משחקים ו-"+nP+" תוכניות");
    eq(left.size,0,"נשארה עברית:\n  "+[...left].slice(0,30).join("\n  "));
  }),

  check("תבניות: מרחקים, שלבים ושכבות מתורגמים גם כשהם נבנים ממספרים",seed,async page=>{
    const r=await page.evaluate(()=>{ window.I18N.set("ru");
      return ["300 מ׳","⏱ 15–25 דק׳","👥 ח׳–י׳ · 5–9 משתתפים","שלב 12"].map(s=>window.I18N.term(s)); });
    eq(JSON.stringify(r),JSON.stringify(["300 м","⏱ 15–25 мин","👥 8–10 кл. · 5–9 участников","Ступень 12"]));
  })

]};
