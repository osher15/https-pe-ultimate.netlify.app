"use strict";
/* שלב 2 (30.09) — הבלוק הראשי במחולל: ציוד נדרש וזמן, מול הדפדפן. */
const {check,eq,ok}=require("./harness.js");
const go=async(page,m,ms)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(ms||500); };
const build=async(page,topic,grade,dur)=>{
  await page.selectOption("#ls-focus",topic);
  await page.click(`#ls-gradeSeg button[data-g="${grade}"]`);
  await page.fill("#ls-dur",String(dur));
  await page.click("#ls-gen"); await page.waitForTimeout(80);
  return page.evaluate(()=>{ const p=window.LESSON.current();
    return {eqWarn:(p.eqWarn||[]).map(w=>w.k),main:p.phases.filter(x=>x.k==="main").map(x=>({n:x.n,min:x.min,t:x.t||null,tr:x.tr||0,fit:x.fit||null}))}; });
};

module.exports={title:"שלב 2 — ציוד וזמן לבלוק הראשי",tests:[

  check("אירובי חטיבה, כדורים וקונוסים בלבד: מעגל דילוגי החבל לא נבחר (25 בניות)",null,async page=>{
    await go(page,"lesson");
    for(let i=0;i<25;i++){
      const r=await build(page,"aerobic","mid",45);
      ok(!/מעגל אירובי/.test(r.main[0].n),"בנייה "+(i+1)+": "+r.main[0].n);
      ok(r.eqWarn.indexOf("ls.eqVariant")<0,"אין אזהרת ציוד כשיש חלופה");
    }
  }),

  check("עם חבלים זמינים המעגל חוזר לבחירה (הסינון אינו חוסם לתמיד)",null,async page=>{
    await go(page,"lesson");
    await page.check('#ls-eq input[value="חבל"]');
    let seen=false;
    for(let i=0;i<40&&!seen;i++){ const r=await build(page,"aerobic","mid",45); seen=/מעגל אירובי/.test(r.main[0].n); }
    ok(seen,"המעגל לא נבחר אף פעם ב-40 בניות עם חבלים");
  }),

  check("אין חלופה (כדורסל בלי כדור סל): נבנה מערך, והאזהרה אומרת מה חסר",null,async page=>{
    await go(page,"lesson");
    await page.uncheck('#ls-eq input[value="כדור סל"]');
    const r=await build(page,"basket","mid",45);
    ok(r.main.length===1,"המערך נבנה");
    ok(r.eqWarn.indexOf("ls.eqVariant")>=0,"אזהרת ציוד על הבלוק: "+r.eqWarn);
  }),

  check("כל דקה מוסברת: סכום השלבים + מעברים = הזמן שהוקצה, או שיש אזהרה (חמישה נושאי כושר × 3 אורכים × 2 שכבות)",null,async page=>{
    await go(page,"lesson");
    let checkedN=0;
    for(const topic of ["aerobic","strength","core","speed","flex"])
      for(const grade of ["mid","high"])
        for(const dur of [30,45,60]){
          const r=await build(page,topic,grade,dur);
          r.main.forEach(m=>{
            ok(m.t&&m.fit,topic+"/"+grade+"/"+dur+": חסרים זמנים ב-"+m.n);
            const sum=m.t.reduce((a,x)=>a+x,0);
            const id=topic+"/"+grade+"/"+dur+" «"+m.n+"» "+m.min+" דק׳ מול "+sum;
            if(m.fit.status==="exact")eq(sum+m.tr,m.min,id+" + תקורה "+m.tr);
            if(m.fit.status==="short")ok(r.eqWarn.indexOf("ls.timeShort")>=0,id+": אין אזהרת «קצר מדי»");
            if(m.fit.status==="over")ok(r.eqWarn.indexOf("ls.timeOver")>=0,id+": אין אזהרת «ארוך מדי»");
            checkedN++;
          });
        }
    eq(checkedN,30,"כל הבניות נבדקו");
  }),

  check("המסך מציג דקות לכל שלב; עריכת התיאור מוחקת את הזמנים במקום להשאיר אותם לא מסונכרנים",null,async page=>{
    await go(page,"lesson");
    await build(page,"aerobic","mid",45);
    const shown=await page.$$eval("#ls-planCard .ls-steps .ls-tm",e=>e.map(x=>x.textContent.trim()));
    ok(shown.length>=3&&shown.every(x=>/^· \d+ /.test(x)),"דקות לצד השלבים: "+JSON.stringify(shown));
    await page.click('#ls-planCard [data-pe="toggle"]'); await page.waitForTimeout(200);
    await page.evaluate(()=>{ const ta=[...document.querySelectorAll('#ls-planCard textarea[data-pf="d"]')][1];
      ta.value=ta.value+"\nשורה שהמורה הוסיף"; ta.dispatchEvent(new Event("input",{bubbles:true})); });
    const after=await page.evaluate(()=>window.LESSON.current().phases.filter(x=>x.k==="main")[0]);
    ok(!after.t&&!after.tr&&!after.fit,"הזמנים נמחקו אחרי עריכת שלבים: "+JSON.stringify(after.t));
    ok(after.d.indexOf("שורה שהמורה הוסיף")>=0,"והעריכה עצמה נשמרה");
  }),
  check("גמישות זמנים: קצב כיתה איטי ומעברים איטיים נשמרים, והדקות נשארות בטווח היעיל ומוסברות",null,async page=>{
    await go(page,"lesson");
    await page.evaluate(()=>{ document.querySelector(".ls-flex").open=true; });
    await page.selectOption("#ls-pace","slow"); await page.selectOption("#ls-trans","slow");
    await page.uncheck("#ls-water");
    const r=await build(page,"strength","mid",45);
    const m=r.main[0];
    ok(m.t&&m.fit&&m.fit.min<=m.min,"המערך נבנה עם זמנים וטווח");
    const saved=await page.evaluate(()=>window.HM.LS.get("ls.timeOpts",null));
    eq(saved,{pace:"slow",trans:"slow",water:false},"הבחירה נשמרת");
    await page.reload(); await page.waitForTimeout(600); await go(page,"lesson");
    eq(await page.inputValue("#ls-pace"),"slow","הבחירה חוזרת אחרי רענון");
    eq(await page.isChecked("#ls-water"),false);
  }),

  check("עריכת הדקות של שלב מחשבת מחדש את שלבי הפעילות בתוך הטווח, ומסמנת חריגה בלי לחסום",null,async page=>{
    await go(page,"lesson");
    await build(page,"strength","mid",45);
    await page.click('#ls-planCard [data-pe="toggle"]'); await page.waitForTimeout(200);
    const idx=await page.evaluate(()=>window.LESSON.current().phases.findIndex(x=>x.k==="main"));
    const row=`#ls-planCard .pe-row[data-pi="${idx}"]`;
    const set=async v=>{ await page.fill(row+' [data-pf="min"]',String(v)); await page.dispatchEvent(row+' [data-pf="min"]',"input"); };
    await set(22);
    let ph=await page.evaluate(i=>window.LESSON.current().phases[i],idx);
    ok(ph.t&&ph.fit&&ph.fit.status==="exact","מחושב מחדש, לא נמחק: "+JSON.stringify(ph.fit));
    eq(ph.t.reduce((a,b)=>a+b,0)+(ph.tr||0),22,"שלבים + תקורה = הדקות החדשות");
    ok(/\d+–\d+/.test(await page.textContent(row+" .pe-range")),"טווח יעיל מוצג");
    await set(90);
    ph=await page.evaluate(i=>window.LESSON.current().phases[i],idx);
    eq(ph.min,90,"חריגה מותרת — לא חוסם");
    eq(ph.fit.status,"short");
    ok(/\d/.test(await page.textContent(row+" .pe-range")),"אזהרה רכה מוצגת");
  }),

  check("ציוד אחר: התיבות החדשות קיימות, הקלדה מסמנת «ציוד אחר» והטקסט נכנס לרשימת הציוד של המערך",null,async page=>{
    await go(page,"lesson");
    const vals=await page.$$eval("#ls-eq input",e=>e.map(x=>x.value));
    ["חבל","חבל עבה","צלחת מעופפת","ציוד אחר"].forEach(v=>ok(vals.includes(v),"חסרה תיבה: "+v));
    eq(await page.$eval("#ls-eqOtherOn",e=>e.checked),false,"ברירת מחדל — לא מסומן");
    await page.fill("#ls-eqOther","משרוקית וסרטים");
    eq(await page.$eval("#ls-eqOtherOn",e=>e.checked),true,"הקלדה מסמנת אוטומטית");
    await page.selectOption("#ls-focus","aerobic");
    await page.click("#ls-gen"); await page.waitForTimeout(100);
    const eqs=await page.evaluate(()=>window.LESSON.current().eq);
    ok(eqs.includes("משרוקית וסרטים"),"הציוד שהוקלד ברשימה: "+JSON.stringify(eqs));
  }),

  check("אין עברית שנשארת בשום שדה של אף משחק בארבע השפות, ובתיבות הציוד החדשות",null,async page=>{
    const leaks=await page.evaluate(()=>{
      const H=/[֐-׿]/, out=[], labels=[...document.querySelectorAll("#ls-eq label")].map(l=>l.textContent.trim());
      ["en","ar","ru","es"].forEach(L=>{
        window.I18N.set(L);
        window.GAMES.all().forEach(g=>{
          const f={name:g.name,who:g.who,space:g.space,equip:g.equip,time:g.time,goal:g.goal,fit:g.fit,safe:g.safe};
          g.how.forEach((x,i)=>f["how"+i]=x); g.vars.forEach((x,i)=>f["vars"+i]=x);
          Object.keys(f).forEach(k=>{ const t=window.I18N.tr(f[k]); if(H.test(t))out.push(L+" · "+g.name+" · "+k+": "+t.slice(0,90)); });
        });
        labels.concat(["ציוד אחר","מה עוד יש לך? (אפשר להקליד)"]).forEach(x=>{ const t=window.I18N.tr(x); if(H.test(t))out.push(L+" · תווית: "+x); });
      });
      return out;
    });
    eq(leaks,[],"עברית שנשארה");
  }),
  check("סוגי כדורים: שבע תיבות מסומנות כברירת מחדל; כדור סל חסר לא חוסם כדורעף וכדורגל, וכדור עף חסר כן חוסם כדורעף",null,async page=>{
    await go(page,"lesson");
    const balls=["כדור סל","כדור רגל","כדור עף","כדור יד","כדור ספוג","כדור גומי","כדור רך"];
    for(const b of balls)eq(await page.$eval('#ls-eq input[value="'+b+'"]',e=>e.checked),true,b+" מסומן כברירת מחדל");
    ok(await page.locator('#ls-eq input[value="כדורים"]').count()===0,"אין עוד תיבה כללית «כדורים»");
    await page.check('#ls-eq input[value="רשת"]');   /* כדורעף דורש גם רשת; היא לא מסומנת כברירת מחדל */
    await page.uncheck('#ls-eq input[value="כדור סל"]');
    for(let i=0;i<8;i++){
      const r=await build(page,"volley","mid",45);
      ok(r.eqWarn.indexOf("ls.eqVariant")<0,"כדורעף בלי כדור סל לא אמור להיחסם: "+r.eqWarn);
    }
    const bk=await build(page,"basket","mid",45);
    ok(bk.eqWarn.indexOf("ls.eqVariant")>=0,"כדורסל בלי כדור סל — אזהרה: "+bk.eqWarn);
    await page.check('#ls-eq input[value="כדור סל"]'); await page.uncheck('#ls-eq input[value="כדור עף"]');
    const vb=await build(page,"volley","mid",45);
    ok(vb.eqWarn.indexOf("ls.eqVariant")>=0,"כדורעף בלי כדור עף — אזהרה: "+vb.eqWarn);
  })
]};
