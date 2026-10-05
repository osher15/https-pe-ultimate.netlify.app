"use strict";
/* #21 — games library: favorites, compact view (safety stays visible), manual filters */
const {check,eq,ok}=require("./harness.js");
const go=async(page,m)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(500); };
const count=p=>p.locator("#gm-grid .gm-card").count();

module.exports={title:"#21 — ספריית משחקים: מועדפים, קומפקטי, סינון",tests:[
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
