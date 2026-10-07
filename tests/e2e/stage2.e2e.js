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
    return {eqWarn:(p.eqWarn||[]).map(w=>w.k),main:p.phases.filter(x=>x.k==="main").map(x=>({n:x.n,min:x.min,t:x.t||null,tr:x.tr||0,fit:x.fit||null,free:x.free||0}))}; });
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

  check("כל דקה מוסברת: סכום השלבים + מעברים = הזמן שהוקצה, או שיש אזהרה (חמישה נושאי כושר × 4 אורכים × 2 שכבות)",null,async page=>{
    await go(page,"lesson");
    let checkedN=0;
    for(const topic of ["aerobic","strength","core","speed","flex"])
      for(const grade of ["mid","high"])
        for(const dur of [45,50,60,90]){
          const r=await build(page,topic,grade,dur);
          r.main.forEach(m=>{
            ok(m.t&&m.fit,topic+"/"+grade+"/"+dur+": חסרים זמנים ב-"+m.n);
            const sum=m.t.reduce((a,x)=>a+x,0);
            const id=topic+"/"+grade+"/"+dur+" «"+m.n+"» "+m.min+" דק׳ מול "+sum;
            if(m.fit.status==="exact")eq(sum+m.tr,m.min,id+" + תקורה "+m.tr);
            if(m.fit.status==="short")eq(sum+m.tr+m.free,m.min,id+": העודף הופך למשחק פנאי ("+m.free+")");
            if(m.fit.status==="over")ok(r.eqWarn.indexOf("ls.timeOver")>=0,id+": אין אזהרת «ארוך מדי»");
            checkedN++;
          });
        }
    ok(checkedN>=40,"כל הבניות נבדקו ("+checkedN+"; בשיעור ארוך יש כמה בלוקים)");
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
    eq(saved,{pace:"slow",trans:"slow",water:false,weather:"normal"},"הבחירה נשמרת");
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

  check("שיעור קצר: מקצרים את החימום שבתחילת השיעור, והמשחק נשאר",null,async page=>{
    await go(page,"lesson");
    await page.selectOption("#ls-focus","aerobic");
    await page.selectOption("#ls-place","hall");
    await page.fill("#ls-dur","35"); await page.check("#ls-optGame"); await page.click("#ls-gen"); await page.waitForTimeout(100);
    const p=await page.evaluate(()=>{ const x=window.LESSON.current(); return {k:x.phases.map(f=>f.k),warm:x.phases[0].min,main:x.phases.find(f=>f.k==="main").min,total:x.phases.reduce((a,f)=>a+f.min,0),warns:(x.eqWarn||[]).map(w=>w.k),wn:x.phases[0].n}; });
    ok(p.k.indexOf("game")>=0,"המשחק נשאר: "+p.k);
    eq(p.warm,5,"חימום קצר"); ok(p.main>=18,"הפעילות העיקרית: "+p.main); eq(p.total,35,"אורך השיעור נשמר");
    ok(p.warns.indexOf("ls.shortLesson")>=0,"ההודעה מוצגת");
    ok(!/תופסת|קוביית|עצור וזוז|מספרים|מראה/.test(p.wn),"חימום סטנדרטי ולא חימום-משחק: "+p.wn);
    await page.fill("#ls-dur","60"); await page.click("#ls-gen"); await page.waitForTimeout(100);
    const q=await page.evaluate(()=>({k:window.LESSON.current().phases.map(f=>f.k),warm:window.LESSON.current().phases[0].min}));
    ok(q.k.indexOf("game")>=0&&q.warm>5,"בשיעור ארוך חימום רגיל ומשחק: "+JSON.stringify(q));
  }),

  check("אורכי שיעור 45/50/60/90: כפתורי בחירה, הסכום נשמר, ושיעור כפול מתחלק ל-2–3 בלוקים עיקריים",null,async page=>{
    await go(page,"lesson");
    await page.selectOption("#ls-focus","aerobic"); await page.selectOption("#ls-place","hall");
    eq(await page.evaluate(()=>[...document.querySelectorAll("#ls-durSeg button")].map(b=>b.dataset.d).join(",")),"45,50,60,90","ארבעה אורכים נפוצים, בלי 30");
    const res={};
    for(const d of [45,50,60,90]){
      await page.click(`#ls-durSeg button[data-d="${d}"]`);
      eq(await page.inputValue("#ls-dur"),String(d),"הכפתור ממלא את השדה");
      ok(await page.evaluate(d=>document.querySelector(`#ls-durSeg button[data-d="${d}"]`).classList.contains("on"),d),"הכפתור מסומן");
      await page.click("#ls-gen"); await page.waitForTimeout(100);
      res[d]=await page.evaluate(()=>{ const x=window.LESSON.current(); const m=x.phases.filter(f=>f.k==="main");
        return {total:x.phases.reduce((a,f)=>a+f.min,0),mains:m.length,names:m.map(f=>f.n),warm:x.phases[0].min,mainMin:m.map(f=>f.min)}; });
      eq(res[d].total,d,"הסכום "+d+": "+JSON.stringify(res[d]));
      ok(res[d].warm<=12,"חימום מוגבל: "+res[d].warm);
    }
    eq(res[90].mains>=2,true,"שיעור כפול — לפחות שני בלוקים עיקריים: "+JSON.stringify(res[90]));
    eq(new Set(res[90].names).size,res[90].mains,"הבלוקים שונים זה מזה: "+res[90].names);
    res[90].mainMin.forEach(m=>ok(m<=36,"בלוק לא ארוך מדי: "+m));
    eq(res[45].mains,1,"45 דק׳ — בלוק אחד");
  }),

  check("מזג אוויר: חם — חימום קצר יותר, קר — ארוך יותר; רק במגרש חוץ",null,async page=>{
    await go(page,"lesson");
    await page.evaluate(()=>{ document.querySelector(".ls-flex").open=true; });
    await page.selectOption("#ls-focus","aerobic"); await page.fill("#ls-dur","60");
    const warm=async(place,wx)=>{ await page.selectOption("#ls-place",place); await page.selectOption("#ls-weather",wx); await page.click("#ls-gen"); await page.waitForTimeout(100);
      return page.evaluate(()=>({w:window.LESSON.current().phases[0].min,warns:(window.LESSON.current().eqWarn||[]).map(x=>x.k)})); };
    const n=await warm("field","normal"), h=await warm("field","hot"), c=await warm("field","cold");
    ok(h.w<n.w&&n.w<c.w,"חם < רגיל < קר: "+[h.w,n.w,c.w]);
    ok(h.warns.indexOf("ls.weatherHot")>=0&&c.warns.indexOf("ls.weatherCold")>=0,"הודעה לפי מזג האוויר");
    const inHall=await warm("hall","hot");
    eq(inHall.w,n.w,"באולם מזג האוויר לא משפיע");
    eq(await page.evaluate(()=>window.HM.LS.get("ls.timeOpts",null).weather),"hot","הבחירה נשמרת");
  }),

  check("זמן שנשאר מעבר לטווח: משחק פנאי קליל או חופשי, בלי אזהרה, והסכום מדויק",null,async page=>{
    await go(page,"lesson");
    let seen=0;
    for(const topic of ["flex","core","speed"]){
      const r=await build(page,topic,"mid",90);
      r.main.forEach(m=>{ eq(m.t.reduce((a,x)=>a+x,0)+m.tr+m.free,m.min,topic+": שלבים + תקורה + משחק פנאי = הדקות"); if(m.free>0)seen++; });
    }
    ok(seen>0,"בשיעור ארוך נשאר זמן למשחק פנאי באחת הפעילויות");
    const html=await page.textContent("#ls-planCard");
    ok(/משחק פנאי קליל או משחק חופשי|free play/i.test(html),"השורה מוצגת בתוכנית");
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
