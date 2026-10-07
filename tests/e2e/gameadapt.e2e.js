"use strict";
/* Games library: levels (easier · base · harder), tasks and medals, and the teacher's own variations */
const {check,eq,ok}=require("./harness.js");
const go=async(page,m)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(500); };
const open=async(p,id)=>{ await p.evaluate(()=>window.HM.modal("gm-modal",false)).catch(()=>{}); await go(p,"games"); await p.locator('#gm-grid [data-g="'+id+'"]').click(); await p.waitForTimeout(300); };

module.exports={title:"משחקים: רמות, משימות ומדליות, וריאציות אישיות",tests:[
  check("חלון משחק: קל · בסיס · מאתגר, ומשימות ומדליות עם תפריט",{lang:"en"},async p=>{
    await open(p,"g-gaga");
    const txt=await p.textContent("#gm-mBody");
    ok(/Easier/.test(txt)&&/Base/.test(txt)&&/More challenging/.test(txt),"שלוש הרמות: "+txt.slice(0,80));
    eq(await p.locator("#gm-mBody .gm-lv").count(),3,"שלוש שורות");
    ok(/10 hits — bronze/.test(txt)&&/25 hits — gold/.test(txt),"מדליות 10/20/25");
    ok(await p.locator("#gm-mBody details.gm-tm li").count()===5,"תפריט של 5 משימות");
    ok(await p.locator("#gm-mBody .gm-sec.warn").isVisible(),"הבטיחות גלויה");
  }),
  check("המשחק המשולב החדש מופיע וגם משחק בלי משימות לא מציג תפריט",{lang:"en"},async p=>{
    await open(p,"g-strikeball");
    const txt=await p.textContent("#gm-mBody");
    ok(/shoulder — 4/.test(txt),"ניקוד לפי חלק גוף");
    eq(await p.locator("#gm-mBody details.gm-tm").count(),0,"אין תפריט משימות במשחק בלי שורת משימה");
  }),
  check("חמש שפות: אין עברית בחלון בשפות הזרות והרמות מתורגמות",{lang:"en"},async p=>{
    for(const l of ["en","ar","ru","es"]){
      await p.evaluate(x=>window.I18N.set(x),l); await open(p,"g-machanaim");
      const left=await p.evaluate(()=>[...document.querySelectorAll("#gm-mBody .gm-lv span,#gm-mBody .gm-lv b,#gm-mBody h4,#gm-mBody .gm-sec li")]
        .map(e=>e.textContent).filter(t=>/[֐-׿]/.test(t)).slice(0,3));
      eq(left.length,0,l+": עברית שנשארה: "+JSON.stringify(left));
    }
  }),
  check("וריאציה אישית: נוספת, נשמרת אחרי רענון, נכללת בגיבוי ונמחקת בשתי לחיצות",{lang:"en"},async p=>{
    await open(p,"g-flags");
    await p.fill("#gm-mineIn","Everyone does 3 star jumps after a score");
    await p.click("#gm-mineBtn");
    eq(await p.locator("#gm-mineList li [data-del]").count(),1,"נוספה");
    eq(await p.inputValue("#gm-mineIn"),"","התיבה התרוקנה");
    const stored=await p.evaluate(()=>window.HM.LS.get("gm.mine",null));
    eq(stored["g-flags"][0].t,"Everyone does 3 star jumps after a score","נשמר במפתח gm.mine");
    await p.reload(); await p.waitForTimeout(600); await open(p,"g-flags");
    ok(/3 star jumps/.test(await p.textContent("#gm-mineList")),"שרד רענון");
    await open(p,"g-gaga");
    ok(!/3 star jumps/.test(await p.textContent("#gm-mineList")),"לא דולף למשחק אחר");
    await open(p,"g-flags");
    await p.click("#gm-mineList [data-del]");
    eq(await p.locator("#gm-mineList [data-del]").count(),1,"לחיצה ראשונה רק מבקשת אישור");
    await p.click("#gm-mineList [data-del].sure");
    eq(await p.locator("#gm-mineList [data-del]").count(),0,"נמחקה בלחיצה שנייה");
    eq(await p.evaluate(()=>window.HM.LS.get("gm.mine",null)),{}, "המפתח התרוקן");
  }),
  check("טקסט פגום ב-gm.mine לא שובר את החלון ומשאיר את השורות התקינות",{lang:"en"},async p=>{
    await p.evaluate(()=>window.HM.LS.set("gm.mine",{"g-flags":[{id:"a",t:"keep me"},{id:7,t:"bad"},null],"g-gaga":"oops"}));
    await open(p,"g-flags");
    ok(/keep me/.test(await p.textContent("#gm-mineList")),"שורה תקינה מוצגת");
    await open(p,"g-gaga");
    ok(/No variations of your own/.test(await p.textContent("#gm-mineList")),"משחק עם ערך פגום מציג רשימה ריקה");
    await p.evaluate(()=>window.HM.LS.set("gm.mine",{}));
  }),
  check("תצוגה קומפקטית: הכול מקופל מלבד המהלך והבטיחות, והווריאציות שלי בפנים",{lang:"en"},async p=>{
    await go(p,"games"); await p.evaluate(()=>window.HM.LS.set("gm.compact",true)); await go(p,"games");
    await p.locator('#gm-grid [data-g="g-gaga"]').click(); await p.waitForTimeout(300);
    ok(await p.locator("#gm-mBody details.gm-more #gm-mine").count()===1,"הווריאציות שלי בתוך המקופל");
    ok(await p.locator("#gm-mBody details.gm-more .gm-lv").count()===3,"הרמות בתוך המקופל");
    ok(await p.locator("#gm-mBody .gm-sec.warn").isVisible(),"בטיחות גלויה");
    await p.evaluate(()=>window.HM.LS.set("gm.compact",false));
  }),
  check("תצוגת הגיבוי: «הווריאציות שלי» עם שם ידידותי בחמש שפות וספירה של הווריאציות עצמן",{lang:"en"},async p=>{
    await p.evaluate(()=>window.HM.LS.set("gm.mine",{"g-flags":[{id:"a",t:"one"},{id:"b",t:"two"}],"g-gaga":[{id:"c",t:"three"}]}));
    const snap=await p.evaluate(()=>window.HM.backupTest.snapshot());
    await p.evaluate(()=>window.HM.openSettings("backup"));
    await p.setInputFiles("#set-bkFile",{name:"backup.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(snap))});
    await p.locator("#bk-go").waitFor({state:"visible"});
    for(const l of ["en","ar","ru","es","he"]){
      await p.evaluate(x=>window.I18N.set(x),l); await p.waitForTimeout(250);
      const row=await p.evaluate(()=>[...document.querySelectorAll("#bk-diff tr")].map(r=>[...r.children].map(c=>c.textContent.trim())).find(r=>/variation|تنويع|вариант|variante|וריאציות/i.test(r[0])));
      ok(row,l+": שורת וריאציות אישיות קיימת");
      eq(row.slice(1),["3","3"],l+": 3 וריאציות בקובץ ובמכשיר, לא 2 משחקים");
      ok(!/gm\.mine/.test(row[0]),l+": אין מפתח גולמי");
    }
    await p.evaluate(()=>window.HM.LS.set("gm.mine",{}));
  })
]};
