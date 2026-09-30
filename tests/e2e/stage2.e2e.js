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

  check("אין חלופה (כדורסל בלי כדורים): נבנה מערך, והאזהרה אומרת מה חסר",null,async page=>{
    await go(page,"lesson");
    await page.uncheck('#ls-eq input[value="כדורים"]');
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
            if(m.fit.status==="exact")eq(sum,m.min,id);
            if(m.fit.status==="transit")eq(sum+m.tr,m.min,id+" + מעברים "+m.tr);
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
  })
]};
