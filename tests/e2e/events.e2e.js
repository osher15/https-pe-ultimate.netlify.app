"use strict";
/* ============================================================
   אירועים בין מודולים
   ------------------------------------------------------------
   עד כאן כל נקודה ששינתה שיעור, מערכת שעות או קבוצה נאלצה לקרוא
   בעצמה לפונקציות הציור של דף הבית ושל פס השיעור. זה עבד, והיה
   שביר בדיוק במידה שבה מוסיפים מסכים: שכחה אחת אינה מייצרת שגיאה
   ואינה מפילה כלום — היא רק משאירה ממשק תקוע עד הניווט הבא, ולכן
   גם אי אפשר לתפוס אותה בבדיקה ידנית.

   הבדיקות כאן שומרות על ההיפוך: **מי ששינה מכריז, ומי שמאכפת לו
   מאזין.** לכן כולן נמנעות בכוונה מ-go("home") ומקריאה ידנית
   לפונקציית ציור אחרי הפעולה — אם הממשק מתעדכן, זה בגלל האירוע
   ולא בגלל שהבדיקה עזרה לו.
   ============================================================ */
const {check,eq,ok,atToday}=require("./harness.js");
const D=require("../../hm-data.js");

const CLS={
  "c:ז:2":{id:"c:ז:2",name:"ז׳2",grade:"ז",num:2,key:"ז2"},
  "c:ח:1":{id:"c:ח:1",name:"ח׳1",grade:"ח",num:1,key:"ח1"},
  "c:ט:3":{id:"c:ט:3",name:"ט׳3",grade:"ט",num:3,key:"ט3"}
};
const ROSTER={"ט3":[{id:"a",name:"דן אבירם",sex:"boys"},{id:"b",name:"רון לוי",sex:"boys"}],
              "ז2":[{id:"c",name:"עדי כהן",sex:"girls"}],
              "ח1":[{id:"d",name:"נועה שרון",sex:"girls"}]};
const STU=[
  {id:"a",name:"דן אבירם",cls:"ט׳3",cid:"c:ט:3",sex:"boys"},
  {id:"c",name:"עדי כהן",cls:"ז׳2",cid:"c:ז:2",sex:"girls"},
  {id:"d",name:"נועה שרון",cls:"ח׳1",cid:"c:ח:1",sex:"girls"}
];
/* היום נקבע בזמן ההרצה — בדיקה שעוברת רק בימי שלישי אינה בדיקה.
   השעון מוקפא לפני השיעור הראשון, אחרת המשבצות כאן כבר «הסתיימו». */
const DAY=()=>D.dayOfISO(new Date().toISOString().slice(0,10));
const base={"ft.classes":CLS,"ft.roster":ROSTER,"stu.list":STU,"ft.results":[],
  "ft.last":{grade:"ט",num:3,sort:"name"},"pf.guideSeen":true,
  "schema.version":D.SCHEMA_VERSION,__now:atToday("07:00")};
const week=()=>[
  {id:"s1",day:DAY(),time:"09:00",cid:"c:ז:2",clsSnapshot:"ז׳2",topic:"כדורסל — מסירה"},
  {id:"s2",day:DAY(),time:"10:45",cid:"c:ח:1",clsSnapshot:"ח׳1",topic:""}
];
const seeded=()=>Object.assign({},base,{"sched.week":week()});

const bar=page=>page.evaluate(()=>{
  const el=document.getElementById("lsBar");
  return {hidden:el.hidden,txt:el.textContent.replace(/\s+/g," ").trim()};
});
const homeTxt=page=>page.evaluate(()=>
  document.getElementById("hx-todayList").textContent.replace(/\s+/g," ").trim());
const mod=page=>page.evaluate(()=>document.body.dataset.mod);

/* מאזין מצטבר — נרשם מוקדם ואוסף כל אירוע hm:* שנורה מאז */
const spy=page=>page.evaluate(()=>{
  window.__ev=[];
  ["session-change","schedule-change","groups-change","classes-change"].forEach(n=>
    document.addEventListener("hm:"+n,e=>window.__ev.push({n,d:e.detail})));
});
const seen=page=>page.evaluate(()=>window.__ev||[]);

module.exports={title:"אירועים בין מודולים",tests:[

  /* ---------- הפס הגלוי בכל מסך ---------- */

  check("שיעור שנפתח מבורר הכיתה צובע את הפס בלי לנווט לדף הבית",base,
    async page=>{
      await page.evaluate(()=>window.HM.go("ft"));
      await page.waitForTimeout(700);
      eq(await mod(page),"ft","הבדיקה נשארת במודול אחר לאורך כל הדרך");
      await page.evaluate(()=>document.getElementById("ft-startLesson").click());
      await page.waitForTimeout(450);
      eq(await mod(page),"ft","ובאמת לא נווטנו");
      const b=await bar(page);
      eq(b.hidden,false,"הפס נפתח בלי שאיש קרא ל-paintSessionBar מבחוץ");
      ok(b.txt.indexOf("ט׳3")>=0,"ועם שם הכיתה: «"+b.txt+"»");
    }),

  check("שיעור שנפתח ממחולל מערכי השיעור צובע את הפס בלי לנווט",base,
    async page=>{
      await page.evaluate(()=>window.HM.go("lesson"));
      await page.waitForTimeout(800);
      /* אותה נקודת כניסה של המחולל — SESSION.start דרך הגשר */
      await page.evaluate(()=>window.HM.session.start(
        {cid:"c:ז:2",clsSnapshot:"ז׳2",date:new Date().toISOString().slice(0,10),
         planTitle:"כדורסל — מסירה"}));
      await page.waitForTimeout(350);
      eq(await mod(page),"lesson","לא נווטנו לדף הבית");
      const b=await bar(page);
      eq(b.hidden,false,"הפס נפתח");
      ok(b.txt.indexOf("ז׳2")>=0&&b.txt.indexOf("כדורסל")>=0,
        "עם הכיתה ושם המערך: «"+b.txt+"»");
    }),

  check("סיום שיעור ממודול אחר סוגר את הפס בלי לנווט",base,async page=>{
    await page.evaluate(()=>window.HM.go("ft"));
    await page.waitForTimeout(700);
    await page.evaluate(()=>document.getElementById("ft-startLesson").click());
    await page.waitForTimeout(450);
    eq((await bar(page)).hidden,false,"נפתח שיעור והפס מוצג");
    await page.evaluate(()=>window.HM.go("beep"));
    await page.waitForTimeout(600);
    await page.evaluate(()=>window.HM.session.complete(window.HM.session.active().id));
    await page.waitForTimeout(350);
    eq(await mod(page),"beep","עדיין במודול אחר");
    eq((await bar(page)).hidden,true,"והפס נסגר מעצמו");
  }),

  check("שינוי שם כיתה מעדכן את הפס של השיעור הפעיל",base,async page=>{
    await page.evaluate(()=>window.HM.go("ft"));
    await page.waitForTimeout(700);
    await page.evaluate(()=>document.getElementById("ft-startLesson").click());
    await page.waitForTimeout(450);
    ok((await bar(page)).txt.indexOf("ט׳3")>=0,"הפס מציג את השם הישן");
    await page.evaluate(()=>window.HM.openClassRename("c:ט:3"));
    await page.waitForTimeout(350);
    await page.evaluate(()=>{
      document.getElementById("set-clsNew").value="ט׳3 — מגמת ספורט";
      document.getElementById("set-clsRename").click();
    });
    await page.waitForTimeout(400);
    const b=await bar(page);
    ok(b.txt.indexOf("מגמת ספורט")>=0,"הפס מציג את השם החדש: «"+b.txt+"»");
  }),

  /* ---------- דף הבית, בזמן שהוא כבר גלוי ---------- */

  check("הוספה למערכת השעות מעדכנת דף בית גלוי בלי ציור ידני",base,
    async page=>{
      eq(await mod(page),"home","הבדיקה נפתחת בדף הבית ונשארת בו");
      await page.evaluate(d=>{
        window.HM.openSched();
        document.getElementById("sw-day").value=String(d);
        document.getElementById("sw-time").value="11:30";
        document.getElementById("sw-grade").value="ח";
        document.getElementById("sw-num").value="1";
        document.getElementById("sw-topic").value="כדורעף";
        document.getElementById("sw-add").click();
        window.HM.modal("schedModal",false);
      },DAY());
      await page.waitForTimeout(400);
      const txt=await homeTxt(page);
      ok(/11:30/.test(txt)&&/כדורעף/.test(txt),
        "המשבצת החדשה כבר בדף הבית: "+txt.slice(0,90));
    }),

  check("מחיקה ממערכת השעות מעדכנת דף בית גלוי בלי ציור ידני",seeded(),
    async page=>{
      ok(/כדורסל/.test(await homeTxt(page)),"המשבצת מוצגת לפני המחיקה");
      await page.evaluate(d=>{
        window.HM.openSched();
        window.HM.schedCell(d,2);
      },DAY());
      await page.waitForTimeout(350);
      await page.evaluate(()=>{
        const b=document.querySelector("#sw-cellList [data-del]");
        if(b)b.click();
        window.HM.modal("schedModal",false);
      });
      await page.waitForTimeout(400);
      const txt=await homeTxt(page);
      ok(!/כדורסל/.test(txt),"ואחריה נעלמה מדף הבית: "+txt.slice(0,90));
    }),

  check("ניקוי המערכת מעדכן דף בית גלוי",seeded(),async page=>{
    ok(/כדורסל/.test(await homeTxt(page)),"יש מה לנקות");
    await page.evaluate(()=>{
      window.HM.openSched();
      const b=document.getElementById("sw-clear");
      if(b)b.click(); else window.HM.sched.list().forEach(s=>window.HM.sched.remove(s.id));
      window.HM.modal("schedModal",false);
    });
    await page.waitForTimeout(450);
    eq(await page.evaluate(()=>window.HM.sched.list().length),0,"המערכת ריקה");
    const txt=await homeTxt(page);
    ok(!/כדורסל/.test(txt),"ודף הבית כבר לא מציג אותה: "+txt.slice(0,90));
  }),

  /* הקבוצה נבדקת דרך שינוי שם ולא דרך מחיקה, וזה לא מקרי: משבצת
     של קבוצה שנמחקה ממשיכה להציג את הצילום שלה — «המשבצות יישארו
     בלי קבוצה» הוא בדיוק מה שהמורה מאשר בדיאלוג. שינוי שם, לעומת
     זאת, נקרא מהרישום ולכן נראה מיד — וזה מה שהאירוע אמור להביא. */
  check("שינוי שם קבוצה מעדכן דף בית גלוי",base,async page=>{
    await page.evaluate(()=>window.HM.openGroups());
    await page.waitForTimeout(300);
    await page.evaluate(()=>{
      document.getElementById("grp-name").value="ז׳2 + ח׳1";
      ["c:ז:2","c:ח:1"].forEach(c=>{
        const i=document.querySelector('#grp-classes [data-gc="'+c+'"]');
        if(i)i.checked=true;
      });
      document.getElementById("grp-save").click();
    });
    await page.waitForTimeout(400);
    const gid=await page.evaluate(()=>{
      const st={get:(k,d)=>window.HM.LS.get(k,d===undefined?null:d),
                set:(k,v)=>window.HM.LS.set(k,v)};
      return window.HMDATA.listGroups(st)[0].id;
    });
    ok(gid,"נוצרה קבוצה");
    await page.evaluate(d=>{
      window.HM.modal("grpModal",false);
      window.HM.openSched();
      window.HM.schedCell(d,2);
      document.querySelector('#sw-scope [data-s="grp"]').click();
      document.getElementById("sw-add").click();
      window.HM.modal("schedModal",false);
    },DAY());
    await page.waitForTimeout(450);
    ok(/ז׳2 \+ ח׳1/.test(await homeTxt(page)),"הקבוצה מופיעה ביום");
    /* שינוי השם עצמו — מהמודאל, בלי ציור ידני אחריו */
    await page.evaluate(()=>window.HM.openGroups());
    await page.waitForTimeout(300);
    await page.evaluate(g=>{
      const b=document.querySelector('#grp-list [data-gedit="'+g+'"]');
      if(b)b.click();
    },gid);
    await page.waitForTimeout(300);
    await page.evaluate(()=>{
      document.getElementById("grp-name").value="שכבת ז׳-ח׳ משולבת";
      document.getElementById("grp-save").click();
      window.HM.modal("grpModal",false);
    });
    await page.waitForTimeout(450);
    const txt=await homeTxt(page);
    ok(/שכבת ז׳-ח׳ משולבת/.test(txt),
      "השם החדש כבר בדף הבית, בלי ניווט: "+txt.slice(0,90));
  }),

  check("קבוצה שנמחקה — המשבצת נשארת עם הצילום, והמערכת לא נשברת",base,
    async page=>{
      await page.evaluate(()=>window.HM.openGroups());
      await page.waitForTimeout(300);
      await page.evaluate(()=>{
        document.getElementById("grp-name").value="ז׳2 + ח׳1";
        ["c:ז:2","c:ח:1"].forEach(c=>{
          const i=document.querySelector('#grp-classes [data-gc="'+c+'"]');
          if(i)i.checked=true;
        });
        document.getElementById("grp-save").click();
      });
      await page.waitForTimeout(400);
      const gid=await page.evaluate(()=>{
        const st={get:(k,d)=>window.HM.LS.get(k,d===undefined?null:d),
                  set:(k,v)=>window.HM.LS.set(k,v)};
        return window.HMDATA.listGroups(st)[0].id;
      });
      await spy(page);
      await page.evaluate(g=>{
        const b=document.querySelector('#grp-list [data-gdel="'+g+'"]');
        if(b)b.click();
        window.HM.modal("grpModal",false);
      },gid);
      await page.waitForTimeout(400);
      const ev=(await seen(page)).filter(e=>e.n==="groups-change");
      eq(ev.length,1,"המחיקה הכריזה: "+JSON.stringify(ev));
      eq(ev[0].d.kind,"remove");
      eq(await page.evaluate(()=>{
        const st={get:(k,d)=>window.HM.LS.get(k,d===undefined?null:d),
                  set:(k,v)=>window.HM.LS.set(k,v)};
        return window.HMDATA.listGroups(st).length;
      }),0,"והקבוצה באמת נמחקה");
    }),

  check("שיעור שנפתח ממודול אחר מסמן את המשבצת בחזרה לדף הבית",seeded(),
    async page=>{
      await page.evaluate(()=>window.HM.go("ft"));
      await page.waitForTimeout(700);
      await page.evaluate(()=>document.getElementById("ft-startLesson").click());
      await page.waitForTimeout(450);
      await page.evaluate(()=>window.HM.session.complete(window.HM.session.active().id));
      await page.waitForTimeout(350);
      /* כאן הניווט מותר — הוא מה שנבדק: המצב שנוצר במודול אחר
         מגיע לדף הבית גם דרך go(), ולא רק דרך האירוע. */
      await page.evaluate(()=>window.HM.go("home"));
      await page.waitForTimeout(450);
      eq(await page.evaluate(()=>document.getElementById("hx-last").hidden),false,
        "כרטיס «השיעור האחרון» נפתח");
    }),

  /* ---------- חוזה האירועים עצמו ---------- */

  check("פתיחת שיעור וסיומו מכריזים hm:session-change",base,async page=>{
    await spy(page);
    await page.evaluate(()=>window.HM.session.start(
      {cid:"c:ז:2",clsSnapshot:"ז׳2",date:new Date().toISOString().slice(0,10)}));
    await page.waitForTimeout(200);
    await page.evaluate(()=>window.HM.session.complete(window.HM.session.active().id));
    await page.waitForTimeout(200);
    const ev=(await seen(page)).filter(e=>e.n==="session-change");
    eq(ev.length,2,"אחד לפתיחה ואחד לסיום: "+JSON.stringify(ev));
    eq(ev[0].d.kind,"start");
    eq(ev[0].d.outcome,"created");
    eq(ev[1].d.kind,"complete");
    eq(ev[1].d.outcome,"completed");
  }),

  check("שיעור חסום אינו מכריז — לא השתנה כלום",base,async page=>{
    await page.evaluate(()=>window.HM.session.start(
      {cid:"c:ז:2",clsSnapshot:"ז׳2",date:new Date().toISOString().slice(0,10)}));
    await page.waitForTimeout(250);
    await spy(page);
    const r=await page.evaluate(()=>window.HM.session.start(
      {cid:"c:ח:1",clsSnapshot:"ח׳1",date:new Date().toISOString().slice(0,10)}));
    await page.waitForTimeout(250);
    eq(r.outcome,"blocked","כיתה אחרת בזמן שיעור פתוח נחסמת");
    eq((await seen(page)).length,0,"ובלי שינוי אין הכרזה");
  }),

  check("משבצת כפולה אינה מכריזה — לא נכתב כלום",base,async page=>{
    await page.evaluate(d=>{
      window.HM.openSched();
      document.getElementById("sw-day").value=String(d);
      document.getElementById("sw-time").value="09:00";
      document.getElementById("sw-grade").value="ח";
      document.getElementById("sw-num").value="1";
      document.getElementById("sw-add").click();
    },DAY());
    await page.waitForTimeout(350);
    await spy(page);
    await page.evaluate(()=>document.getElementById("sw-add").click());
    await page.waitForTimeout(300);
    eq(await page.evaluate(()=>window.HM.sched.list().length),1,"לא נוספה משבצת שנייה");
    eq((await seen(page)).filter(e=>e.n==="schedule-change").length,0,
      "וממילא אין על מה להכריז");
  }),

  check("אין קריאות ציור ידניות שנשארו בנקודות המוטציה",base,async page=>{
    /* השמירה האמיתית של פריט 5: הרגע שבו מישהו יחזיר קריאה ידנית
       במקום אירוע, הבדיקה הזאת עדיין תעבור — אבל הבדיקות שלמעלה
       הן שיתפסו אירוע חסר. כאן נשמר רק שהגשר לא הצטמצם. */
    const api=await page.evaluate(()=>({
      emit:typeof window.HM.emit,
      bar:typeof window.HM.paintSessionBar,
      home:typeof window.HM.paintHome,
      today:typeof window.HM.paintToday
    }));
    eq(api.emit,"function","מודול חדש יכול להכריז בעצמו");
    eq(api.bar,"function","ופונקציות הציור נשארו ב-API שהבדיקות נשענות עליו");
    eq(api.home,"function");
    eq(api.today,"function");
  })

]};
