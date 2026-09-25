"use strict";
/* ============================================================
   המעטפת החדשה — חמישה אזורים לפי קצב העבודה של המורה
   ------------------------------------------------------------
   היום · הכנה · ▶ שיעור · כיתות · שיאים. הבדיקות כאן שומרות על:
   • שכל מסך עדיין בר־הגעה (המגירה בוטלה, ולא שום מסך איתה)
   • שכפתור «חזרה» של הטלפון חוזר צעד אחד ואינו יוצא מהאפליקציה
   • שמצב שיעור פותח שיעור בהקשה אחת על כיתה, ושהכלים בו גלויים
   • שהכיתה של השיעור עוברת לכלים בלי לבחור אותה שוב
   ============================================================ */
const {check,eq,ok,atToday}=require("./harness.js");
const D=require("../../hm-data.js");

const base={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION};
const withClass=Object.assign({},base,{
  "ft.classes":{"c:ט:3":{id:"c:ט:3",name:"ט׳3",grade:"ט",num:3,key:"ט3"}},
  "ft.roster":{"ט3":[{id:"a",name:"נועה לוי",sex:"girls"},{id:"b",name:"איתי כהן",sex:"boys"},{id:"c",name:"מאיה פרץ",sex:"girls"}]},
  "stu.list":[{id:"a",name:"נועה לוי",cls:"ט׳3",tests:[]},{id:"b",name:"איתי כהן",cls:"ט׳3",tests:[]},{id:"c",name:"מאיה פרץ",cls:"ט׳3",tests:[]}],
  "ft.last":{grade:"ט",num:3}
});
const go=async(page,m)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(350); };
const mod=page=>page.evaluate(()=>document.body.dataset.mod);
const startLive=async page=>{
  await go(page,"live");
  await page.click('#lv-root [data-cls="c:ט:3"]');
  await page.waitForTimeout(350);
};

module.exports={title:"מעטפת: חמישה אזורים, חזרה אמיתית ומצב שיעור",tests:[

  /* ---------- הסרגל ---------- */

  check("בסרגל חמישה כפתורים: היום · הכנה · שיעור · כיתות · שיאים",base,async page=>{
    const r=await page.evaluate(()=>[...document.querySelectorAll(".nav button")]
      .filter(b=>getComputedStyle(b).display!=="none").map(b=>b.dataset.go));
    eq(r,["home","lesson","live","stu","rec"]);
  }),

  check("אין יותר מגירה ואין ☰ — וההגדרות בכותרת",base,async page=>{
    const r=await page.evaluate(()=>({
      drawer:!!document.getElementById("navDrawer"),menu:!!document.getElementById("btnMenu"),
      more:!!document.getElementById("navMore"),
      set:!!document.querySelector(".topbar #btnSettings"),lang:!!document.querySelector(".topbar #btnLang")
    }));
    eq(r,{drawer:false,menu:false,more:false,set:true,lang:true});
  }),

  check("כל מסך בר־הגעה: סרגל, לשוניות אזור, קיצורי הבית או אריחי השיעור",withClass,async page=>{
    const got=new Set();
    const collect=async()=>{ (await page.evaluate(()=>
      [...document.querySelectorAll("[data-go],[data-tool]")].map(e=>e.dataset.go||("tool:"+e.dataset.tool))))
      .forEach(x=>got.add(x)); };
    await collect();
    for(const m of ["lesson","stu"]){ await go(page,m); await collect(); }
    await startLive(page); await collect();
    const reach=new Set([...got].map(x=>({"tool:att":"tools","tool:teams":"tools","tool:pick":"tools",
      "tool:meas":"ft","tool:beep":"beep","tool:photo":"photo","tool:timer":"fit","tool:games":"games"}[x]||x)));
    ["home","lesson","live","stu","rec","ft","beep","photo","fit","games","know","nut","tools"].forEach(m=>
      ok(reach.has(m),"אין דרך להגיע ל-«"+m+"»: "+[...reach].join(",")));
  }),

  check("לשוניות האזור: «משחקים» דולק תחת «הכנה», ו«מבחני כושר» תחת «כיתות»",base,async page=>{
    await go(page,"games");
    let r=await page.evaluate(()=>({tabs:[...document.querySelectorAll("#areaTabs [data-go]")].map(b=>b.dataset.go),
      on:(document.querySelector("#areaTabs .on")||{}).dataset.go,
      nav:(document.querySelector(".nav button.on")||{}).dataset.go}));
    eq(r.tabs,["lesson","games","fit","know","nut"]); eq(r.on,"games"); eq(r.nav,"lesson","כפתור «הכנה» דולק");
    await go(page,"ft");
    r=await page.evaluate(()=>({tabs:[...document.querySelectorAll("#areaTabs [data-go]")].map(b=>b.dataset.go),
      nav:(document.querySelector(".nav button.on")||{}).dataset.go}));
    eq(r.tabs,["stu","ft","tools"]); eq(r.nav,"stu","כפתור «כיתות» דולק");
    await go(page,"home");
    ok(await page.evaluate(()=>document.getElementById("areaTabs").hidden),"בבית אין לשוניות");
  }),

  /* ---------- חזרה ---------- */

  check("«חזרה» של הטלפון חוזרת צעד אחד — ולא יוצאת מהאפליקציה",base,async page=>{
    await go(page,"lesson"); await go(page,"games"); await go(page,"know");
    await page.goBack(); await page.waitForTimeout(350);
    eq(await mod(page),"games");
    await page.goBack(); await page.waitForTimeout(350);
    eq(await mod(page),"lesson");
    await page.goBack(); await page.waitForTimeout(350);
    eq(await mod(page),"home","ועדיין באפליקציה");
  }),

  check("«חזרה» כשחלון פתוח סוגרת את החלון ונשארת במסך",base,async page=>{
    await go(page,"lesson");
    await page.click("#btnSettings"); await page.waitForTimeout(300);
    ok(await page.evaluate(()=>document.getElementById("setModal").classList.contains("on")),"ההגדרות נפתחו");
    await page.goBack(); await page.waitForTimeout(350);
    const r=await page.evaluate(()=>({on:document.getElementById("setModal").classList.contains("on"),mod:document.body.dataset.mod}));
    eq(r,{on:false,mod:"lesson"});
  }),

  check("«חזרה» שבכותרת עושה אותו דבר",base,async page=>{
    await go(page,"stu"); await go(page,"tools");
    await page.click("#btnBack"); await page.waitForTimeout(350);
    eq(await mod(page),"stu");
  }),

  /* ---------- הגדרות ושפה ---------- */

  check("ההגדרות מחולקות לארבעה מקטעים, ו«כללי» פתוח",base,async page=>{
    await page.click("#btnSettings"); await page.waitForTimeout(300);
    const r=await page.evaluate(()=>[...document.querySelectorAll("#setModal .set-sec")].map(d=>d.open));
    eq(r.length,4); eq(r[0],true); eq(r.slice(1).every(x=>!x),true,"השאר מקופלים");
  }),

  check("«מערכת שעות» מתוך «תחילת שנה» פותחת את הטבלה וסוגרת את ההגדרות",base,async page=>{
    await page.click("#btnSettings"); await page.waitForTimeout(300);
    await page.evaluate(()=>{ document.getElementById("set-secYear").open=true; });
    await page.click("#set-openSched"); await page.waitForTimeout(400);
    const r=await page.evaluate(()=>({sched:document.getElementById("schedModal").classList.contains("on"),
      set:document.getElementById("setModal").classList.contains("on")}));
    eq(r,{sched:true,set:false});
  }),

  check("החלפת שפה מהירה מהכותרת — הסרגל מתורגם מיד",base,async page=>{
    await page.click("#btnLang"); await page.waitForTimeout(200);
    await page.click('#langPop [data-l="ru"]'); await page.waitForTimeout(400);
    const r=await page.evaluate(()=>({btn:document.getElementById("btnLang").textContent,
      nav:[...document.querySelectorAll(".nav button")].filter(b=>getComputedStyle(b).display!=="none").map(b=>b.textContent.trim()).join(" "),
      pop:document.getElementById("langPop").hidden}));
    eq(r.btn,"RU"); eq(r.pop,true,"החלונית נסגרה");
    ok(/Сегодня/.test(r.nav)&&/Подготовка/.test(r.nav)&&/Классы/.test(r.nav),"הסרגל ברוסית: "+r.nav);
    ok(!/[֐-׿]/.test(r.nav),"ואין בו עברית: "+r.nav);
  }),

  /* ---------- מצב שיעור ---------- */

  check("בלי שיעור: «לאיזו כיתה?» עם הכיתות הרשומות",withClass,async page=>{
    await go(page,"live");
    const r=await page.evaluate(()=>({chips:[...document.querySelectorAll("#lv-root [data-cls]")].map(b=>b.dataset.cls),
      tiles:[...document.querySelectorAll("#lv-root [data-tool]")].map(b=>b.dataset.tool)}));
    eq(r.chips,["c:ט:3"]);
    eq(r.tiles,["meas","beep","photo","timer"],"וכלים בלי כיתה");
  }),

  check("הקשה אחת על כיתה פותחת שיעור, והסרגל מראה את הכיתה",withClass,async page=>{
    await startLive(page);
    const r=await page.evaluate(()=>{ const a=window.HM.session.active();
      return {cid:a&&a.cid,head:(document.querySelector("#lv-root .lv-head .cls")||{}).textContent,
        tiles:[...document.querySelectorAll("#lv-root [data-tool]")].map(b=>b.dataset.tool),
        nav:document.getElementById("navLiveIc").textContent,
        act:document.getElementById("navLive").classList.contains("act")}; });
    eq(r.cid,"c:ט:3"); eq(r.head,"ט׳3");
    eq(r.tiles,["att","meas","beep","photo","timer","teams","pick","games"]);
    eq(r.nav,"ט׳3"); eq(r.act,true);
  }),

  check("אריחי השיעור גדולים מספיק ליד אחת (48px ומעלה)",withClass,async page=>{
    await startLive(page);
    const r=await page.evaluate(()=>[...document.querySelectorAll("#lv-root button")]
      .filter(b=>b.offsetParent).map(b=>{ const x=b.getBoundingClientRect(); return {id:b.id||b.dataset.tool||b.textContent.trim().slice(0,12),h:Math.round(x.height)}; }));
    const small=r.filter(x=>x.h<48);
    eq(small,[],"כפתורים קטנים מדי");
  }),

  check("«כולם נוכחים» מסמן את כל הכיתה בהקשה אחת",withClass,async page=>{
    await startLive(page);
    await page.click("#lv-allIn"); await page.waitForTimeout(300);
    const r=await page.evaluate(()=>{ const a=JSON.parse(localStorage.getItem("peultimate.tools.att")||"{}");
      const k=Object.keys(a)[0]; return {n:k?Object.keys(a[k]).length:0,all:k?Object.values(a[k]).every(v=>v==="p"):false,
        btn:!!document.getElementById("lv-allIn"),
        sub:(document.querySelector('#lv-root [data-tool="att"] small')||{}).textContent}; });
    eq(r.n,3); eq(r.all,true); eq(r.btn,false,"הכפתור יורד אחרי הסימון");
    ok(/3/.test(r.sub),"האריח מראה כמה נוכחים: "+r.sub);
  }),

  check("אריח «נוכחות» פותח את הנוכחות על כיתת השיעור, ו«חזרה» מחזירה לשיעור",withClass,async page=>{
    await startLive(page);
    await page.click('#lv-root [data-tool="att"]'); await page.waitForTimeout(450);
    const r=await page.evaluate(()=>({mod:document.body.dataset.mod,
      tab:(document.querySelector("#tl-tabs .on")||{}).dataset.tt,cls:document.getElementById("tl-attCls").value}));
    eq(r.mod,"tools"); eq(r.tab,"att"); ok(/ט.?3/.test(r.cls),"הכיתה נבחרה לבד: "+r.cls);
    await page.goBack(); await page.waitForTimeout(350);
    eq(await mod(page),"live");
  }),

  check("כיתה אחרת בשכבה ומספר — נרשמת ונפתח בה שיעור",base,async page=>{
    await go(page,"live");
    await page.click('#lv-og [data-g="ח"]'); await page.waitForTimeout(150);
    await page.click('#lv-on [data-n="2"]'); await page.waitForTimeout(150);
    await page.click("#lv-oGo"); await page.waitForTimeout(350);
    const r=await page.evaluate(()=>{ const a=window.HM.session.active();
      const reg=JSON.parse(localStorage.getItem("peultimate.ft.classes")||"{}");
      return {cid:a&&a.cid,reg:Object.keys(reg)}; });
    eq(r.cid,"c:ח:2"); ok(r.reg.indexOf("c:ח:2")>=0,"הכיתה נרשמה");
  }),

  check("«יציאה» לא מסיימת את השיעור, והכפתור האמצעי מחזיר אליו",withClass,async page=>{
    await startLive(page);
    await page.click("#lv-leave"); await page.waitForTimeout(350);
    eq(await mod(page),"home");
    ok(await page.evaluate(()=>!!window.HM.session.active()),"השיעור עדיין פתוח");
    await page.click("#navLive"); await page.waitForTimeout(350);
    eq(await mod(page),"live");
  }),

  check("«סיים שיעור» — דירוג, סיום, וחזרה להיום",withClass,async page=>{
    await startLive(page);
    await page.click("#lv-end"); await page.waitForTimeout(300);
    await page.click('#end-rate button[data-r="1"]');
    await page.click("#end-go"); await page.waitForTimeout(500);
    const r=await page.evaluate(()=>({act:!!window.HM.session.active(),mod:document.body.dataset.mod,
      last:window.HM.session.list()[0].rating,nav:document.getElementById("navLive").classList.contains("act")}));
    eq(r,{act:false,mod:"home",last:1,nav:false});
  }),

  check("מערך שעל המסך מצטרף לשיעור: שלב, זמן ומעבר לשלב הבא",withClass,async page=>{
    await go(page,"lesson");
    await page.click("#ls-gen"); await page.waitForTimeout(400);
    await startLive(page);
    const a=await page.evaluate(()=>({name:(document.getElementById("lv-phName")||{}).textContent,
      step:(document.querySelector("#lv-phase .pill")||{}).textContent}));
    ok(a.name&&/חימום/.test(a.name),"השלב הראשון: "+a.name);
    await page.click("#lv-nextBtn"); await page.waitForTimeout(300);
    const b=await page.evaluate(()=>(document.querySelector("#lv-phase .pill")||{}).textContent);
    ok(/2\//.test(b),"עברנו לשלב 2: "+b);
  }),

  check("התחלה מהמשבצת שבהיום מביאה ישר למצב שיעור",Object.assign({},withClass,{
    "sched.week":[{id:"s1",day:D.dayOfISO(new Date().toISOString().slice(0,10)),time:"10:00",cid:"c:ט:3",clsSnapshot:"ט׳3"}],
    __now:atToday("10:10")}),async page=>{
    await go(page,"home");
    await page.click("#hx-todayList [data-slot]"); await page.waitForTimeout(450);
    const r=await page.evaluate(()=>({mod:document.body.dataset.mod,cid:(window.HM.session.active()||{}).cid}));
    eq(r,{mod:"live",cid:"c:ט:3"});
  })

]};
