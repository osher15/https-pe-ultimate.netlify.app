"use strict";
/* Personal collections (#21 item 3): games, my plans and bank lessons; manager; games filter; persistence. */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");
const seed={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION};
const go=async(p,m)=>{ await p.evaluate(x=>window.HM.go(x),m); await p.waitForTimeout(500); };
const cols=p=>p.evaluate(()=>window.HM.LS.get("col.list",[]));

module.exports={title:"#21 — אוספים אישיים",tests:[
  check("Collection reopen keeps one language repaint and hidden-view changes preserve drafts",seed,async p=>{
    await go(p,"lesson");
    await p.evaluate(()=>{
      const D=window.HMDATA,a=D.colAdd([],"Lifecycle",{now:57});
      window.HM.LS.set("col.list",D.colToggle(a.list,a.id,{k:"g",id:"g-flags"}).list);
      window.COLLECTIONS.register("g",{title:()=>{window.__titleCalls=(window.__titleCalls||0)+1; return "Stable title";}});
      window.COLLECTIONS.paint();
    });
    await p.click("#ls-colList [data-ctoggle]");
    await p.click("#ls-colList [data-cren]");
    await p.fill("#ls-colList [data-cn]","Retained rename");
    for(let i=0;i<5;i++)await p.evaluate(()=>{
      window.COLLECTIONS.pick({k:"g",id:"g-flags"},"Lifecycle");
      window.HM.modal("col-modal",false);
    });
    await p.evaluate(()=>{
      const input=document.querySelector("#col-newIn"); input.value="Hidden draft";
      window.__draftNode=input; window.__titleCalls=0;
      window.I18N.set("ar");
    });
    eq(await p.evaluate(()=>window.__titleCalls),1,"One resolver call after repeated opens");
    eq(await p.evaluate(()=>document.documentElement.dir),"rtl");
    eq(await p.inputValue("#ls-colList [data-cn]"),"Retained rename");
    eq(await p.inputValue("#col-newIn"),"Hidden draft");
    ok(await p.evaluate(()=>window.__draftNode===document.querySelector("#col-newIn")),"Hidden draft node retained");
    ok(!await p.locator("#col-modal").isVisible(),"Language event does not reopen modal");
    await p.evaluate(()=>{window.HM.modal("col-modal"); const i=document.querySelector("#col-newIn");i.focus();i.setSelectionRange(2,5);window.I18N.set("ru");});
    eq(await p.evaluate(()=>{const i=document.querySelector("#col-newIn");return [document.activeElement===i,i.selectionStart,i.selectionEnd,document.documentElement.dir];}),[true,2,5,"ltr"]);
  }),
  check("Open collections repaint EN to ES and Hebrew without replacing draft inputs or references",seed,async p=>{
    await go(p,"lesson");
    await p.evaluate(()=>{
      window.I18N.set("en");
      const D=window.HMDATA, a=D.colAdd([],"Language probe",{now:55});
      window.HM.LS.set("col.list",D.colToggle(a.list,a.id,{k:"g",id:"g-flags"}).list);
      window.COLLECTIONS.paint();
    });
    await p.click("#ls-colList [data-ctoggle]");
    await p.click("#ls-colList [data-cren]");
    await p.fill("#ls-colList [data-cn]","Unsaved rename");
    await p.evaluate(()=>window.COLLECTIONS.pick({k:"g",id:"g-flags"},"Probe"));
    await p.fill("#col-newIn","Unsaved creation");
    await p.evaluate(()=>{
      window.__collectionInputs=[document.querySelector('[data-cn]'),document.querySelector('#col-newIn')];
      window.__collectionBefore=JSON.stringify(window.HM.LS.get('col.list',[]));
    });
    for(const lang of ["es","he"]){
      await p.evaluate(l=>window.I18N.set(l),lang);
      const actual=await p.evaluate(()=>({
        pill:document.querySelector('#ls-colList .col-items .pill').textContent,
        expected:window.HM.t('col.kindG','משחק'),
        title:document.querySelector('#col-pickTitle').textContent,
        titleExpected:window.HM.t('col.pickTitle','הוספה לאוסף')+' · Probe',
        create:document.querySelector('#col-newBtn').textContent,
        createExpected:window.HM.t('col.create','צור והוסף'),
        same:window.__collectionInputs[0]===document.querySelector('[data-cn]')&&window.__collectionInputs[1]===document.querySelector('#col-newIn'),
        persisted:JSON.stringify(window.HM.LS.get('col.list',[]))===window.__collectionBefore,
        dir:document.documentElement.dir
      }));
      eq(actual.pill,actual.expected,"Already-open type pill uses current language");
      eq(actual.title,actual.titleExpected); eq(actual.create,actual.createExpected);
      ok(actual.same,"Draft input nodes retained"); ok(actual.persisted,"References unchanged");
      eq(await p.inputValue('#ls-colList [data-cn]'),"Unsaved rename");
      eq(await p.inputValue('#col-newIn'),"Unsaved creation");
      eq(actual.dir,lang==="he"?"rtl":"ltr");
    }
    await p.click('#col-newBtn');
    eq((await cols(p))[1].items,[{k:"g",id:"g-flags"}],"Picker context survives language switches");
    await p.reload(); await go(p,"lesson");
    eq((await cols(p)).length,2,"Committed collection survives reload");
  }),
  check("Failed rename and create retain drafts through language repaint and retry",seed,async p=>{
    await go(p,"lesson");
    await p.evaluate(()=>{
      const D=window.HMDATA,a=D.colAdd([],"Original",{now:56});
      window.HM.LS.set('col.list',a.list); window.COLLECTIONS.paint();
      window.__realCollectionSet=window.HM.LS.set;
      window.HM.LS.set=(key,value)=>key==='col.list'?false:window.__realCollectionSet(key,value);
    });
    await p.click('#ls-colList [data-cren]'); await p.fill('#ls-colList [data-cn]','Retry rename');
    await p.click('#ls-colList [data-cok]');
    await p.evaluate(()=>window.I18N.set('es'));
    eq(await p.inputValue('#ls-colList [data-cn]'),'Retry rename'); eq((await cols(p))[0].name,'Original');
    await p.evaluate(()=>window.COLLECTIONS.pick({k:'g',id:'g-flags'},'Probe'));
    await p.fill('#col-newIn','Retry create'); await p.click('#col-newBtn');
    await p.evaluate(()=>window.I18N.set('he'));
    eq(await p.inputValue('#col-newIn'),'Retry create'); eq((await cols(p)).length,1);
    await p.evaluate(()=>window.HM.LS.set=window.__realCollectionSet);
    await p.click('#col-newBtn');
    eq((await cols(p)).length,2); eq((await cols(p))[1].items,[{k:'g',id:'g-flags'}]);
  }),
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
