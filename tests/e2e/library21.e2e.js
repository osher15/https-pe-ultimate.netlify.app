"use strict";
/* #21 — games library: favorites, compact view (safety stays visible), manual filters */
const {check,eq,ok}=require("./harness.js");
const go=async(page,m)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(500); };
const count=p=>p.locator("#gm-grid .gm-card").count();

module.exports={title:"#21 — ספריית משחקים: מועדפים, קומפקטי, סינון",tests:[
  /* סקירת Codex R2: הערת הבטיחות בכרטיס הקומפקטי לא נחתכת — בכל שפה וגם בטלפון צר */
  check("קומפקטי: הערת הבטיחות מוצגת במלואה בכל חמש השפות, גם ברוחב טלפון צר",{lang:"en"},async p=>{
    await p.setViewportSize({width:360,height:800});
    await go(p,"games"); await p.click("#gm-compact");
    for(const l of ["he","en","ar","ru","es"]){
      await p.evaluate(x=>window.I18N.set(x),l); await p.waitForTimeout(250);
      const r=await p.evaluate(()=>[...document.querySelectorAll("#gm-grid .gm-card .sf")].map(e=>({id:e.parentElement.dataset.g,shown:e.clientHeight,needed:e.scrollHeight}))
        .filter(x=>x.needed>x.shown+1));
      eq(r.length,0,l+": הערות בטיחות חתוכות: "+JSON.stringify(r.slice(0,3)));
    }
    const sf=await p.locator('[data-g="g-tug"] .sf').count();
    ok(sf===1,"כרטיס משיכת החבל (הבדיקה של Codex) מוצג");
  }),

  check("דרגות קושי: «קל יותר» ו«מאתגר יותר» מוצגים בחלון המשחק בכל חמש השפות",{lang:"en"},async p=>{
    await go(p,"games");
    const exp={he:["קל יותר","מאתגר יותר"],en:["Easier","More challenging"],ar:["أسهل","أكثر تحديًا"],ru:["Проще","Сложнее"],es:["Más fácil","Más desafiante"]};
    for(const l of ["he","en","ar","ru","es"]){
      await p.evaluate(x=>window.I18N.set(x),l); await p.waitForTimeout(200);
      await p.locator('[data-g="g-flags"]').click(); await p.waitForTimeout(200);
      const r=await p.evaluate(()=>({labels:[...document.querySelectorAll("#gm-mBody .gm-lv b")].map(b=>b.textContent.trim()),texts:[...document.querySelectorAll("#gm-mBody .gm-lv span")].map(b=>b.textContent.trim())}));
      eq(r.labels,exp[l],l+": תוויות");
      ok(r.texts.length===2&&r.texts.every(x=>x.length>10&&(l==="he"||!/[\u0590-\u05ff]/.test(x))),l+": טקסט מתורגם: "+JSON.stringify(r.texts));
      await p.keyboard.press("Escape"); await p.evaluate(()=>{ const m=document.querySelector("#gm-modal, .modal.on, .modal.show"); });
      await p.evaluate(()=>{ document.querySelectorAll(".modal.on,.modal.show,.sheet.on").forEach(e=>e.classList.remove("on","show")); });
    }
  }),

  check("מועדף בלחיצה אחת נשמר, מופיע בלשונית המועדפים ושורד רענון",{lang:"en"},async p=>{
    await go(p,"games");
    const first=p.locator("#gm-grid .gm-card").first(), id=await first.getAttribute("data-g");
    await first.locator("[data-fav]").click();
    eq(await p.evaluate(()=>window.HM.LS.get("gm.fav",[])),[id],"נשמר");
    await p.locator('#gm-cats [data-gc="fav"]').click();
    eq(await count(p),1,"רק המועדף");
    await p.reload(); await p.waitForTimeout(600); await go(p,"games");
    await p.locator('#gm-cats [data-gc="fav"]').click();
    eq(await count(p),1,"אחרי רענון");
    await p.locator("#gm-grid .gm-card [data-fav]").click();
    ok(/No favorites yet/.test(await p.textContent("#gm-grid")),"הודעה כשאין מועדפים");
  }),
  check("תצוגה קומפקטית: הבטיחות גלויה בכרטיס ובחלון, והבחירה נשמרת",{lang:"en"},async p=>{
    await go(p,"games");
    const full=await p.locator("#gm-grid .gm-card").first().textContent();
    ok(!/⚠/.test(full),"בתצוגה מלאה אין שורת בטיחות בכרטיס");
    await p.click("#gm-compact");
    eq(await p.evaluate(()=>window.HM.LS.get("gm.compact",false)),true);
    const cmp=await p.locator("#gm-grid .gm-card").first().textContent();
    ok(/⚠/.test(cmp),"בתצוגה קומפקטית הבטיחות נראית בכרטיס");
    await p.locator("#gm-grid .gm-card").first().click();
    ok(await p.locator("#gm-mBody .gm-sec.warn").isVisible(),"הבטיחות גלויה בחלון");
    ok(await p.locator("#gm-mBody details.gm-more").count()===1,"שאר הסעיפים מקופלים");
    await p.reload(); await p.waitForTimeout(600); await go(p,"games");
    ok(await p.locator("#gm-grid.compact").count()===1,"נשמר אחרי רענון");
  }),
  check("סינון ידני: שכבה, משך, מספר תלמידים ובלי ציוד — ונקה סינון מחזיר הכול",{lang:"en"},async p=>{
    await go(p,"games");
    const total=await count(p);
    await p.evaluate(()=>{ document.querySelector("#gm-filters").open=true; });
    await p.selectOption("#gm-fAge","high"); const a=await count(p); ok(a>0&&a<total,"שכבה: "+a);
    await p.selectOption("#gm-fTime","10"); const b=await count(p); ok(b<=a,"משך: "+b);
    await p.fill("#gm-fN","40"); await p.dispatchEvent("#gm-fN","input"); const c=await count(p); ok(c<=b,"תלמידים: "+c);
    await p.check("#gm-fNoEq"); const d=await count(p); ok(d<=c,"בלי ציוד: "+d);
    ok(/filtered/.test(await p.textContent("#gm-count")),"המונה מציין סינון");
    await p.click("#gm-fClear"); eq(await count(p),total,"נקה מחזיר הכול");
    eq(await p.evaluate(()=>window.HM.LS.get("gm.flt",null)),null);
  })
]};
