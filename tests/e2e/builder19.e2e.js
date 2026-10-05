"use strict";
/* #19 — manual builder agrees with the quick generator: shared equipment availability,
   effective time window, weather/short-lesson warm-up recommendation (on request only),
   leftover time as free play. */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");
const base={lang:"en","ls.mode":"manual","schema.version":D.SCHEMA_VERSION,"pf.guideSeen":true};
const st=o=>({"lb.state":Object.assign({step:1,grade:"mid",dur:45,cls:"",size:30,place:"field",wuType:"general",wuId:"w-ramp",wuMin:10,
  cat:"str",level:2,count:2,fmt:"stations",picks:["d-squat","d-glute"],mainMin:0,finKind:"game",finId:"f-free",finMin:10,note:""},o)});
const go=async p=>{ await p.evaluate(()=>window.HM.go("lesson")); await p.waitForTimeout(700); };
const lb=p=>p.evaluate(()=>window.HM.LS.get("lb.state",null));

module.exports={title:"#19 — בונה ידני: ציוד, חלון זמן, חימום מומלץ",tests:[
  check("ציוד שלא סומן כזמין מופיע עם ⚠ על הכרטיס, ונעלם כשהוא מסומן",Object.assign({},base,st({step:3})),async p=>{
    await go(p);
    ok(await p.locator('[data-dr="d-glute"] .pill.warn').count()===1,"גשר ישבן דורש מזרנים, שלא זמינים כברירת מחדל");
    ok(await p.locator('[data-dr="d-squat"] .pill.warn').count()===0,"סקוואט בלי ציוד — בלי אזהרה");
    await p.evaluate(()=>window.HM.LS.set("ls.eqAvail",["כדור סל","קונוסים","מזרנים"]));
    await p.evaluate(()=>window.LBUILD.init&&0); await p.reload(); await p.waitForTimeout(800); await go(p);
    ok(await p.locator('[data-dr="d-glute"] .pill.warn').count()===0,"מזרנים סומנו — אין אזהרה");
  }),
  check("אזהרת ציוד בסיכום ובמערך שנבנה — בלי לחסום את הבנייה",Object.assign({},base,st({step:5})),async p=>{
    await go(p);
    ok(/mats|מזרנים|Missing|equipment/i.test(await p.textContent("#bw-eqWarn")),"אזהרה בסיכום");
    ok(!(await p.locator("#bw-build").isDisabled()),"הבנייה לא חסומה");
    await p.click("#bw-build"); await p.waitForTimeout(400);
    const w=await p.evaluate(()=>(window.LESSON.current().eqWarn||[]).map(x=>x.k));
    ok(w.indexOf("ls.eqVariant")>=0,"המערך נושא את האזהרה: "+w);
  }),
  check("רשימת הציוד משותפת עם המחולל המהיר: סימון במחולל נראה בבונה, ולהפך",base,async p=>{
    await go(p);
    await p.evaluate(()=>{ document.querySelector('#ls-modeTabs [data-lm="fast"]').click(); });
    await p.waitForTimeout(200);
    await p.uncheck('#ls-eq input[value="קונוסים"]');
    eq((await p.evaluate(()=>window.HM.LS.get("ls.eqAvail",[]))).indexOf("קונוסים"),-1,"נשמר");
    await p.evaluate(()=>{ document.querySelector('#ls-modeTabs [data-lm="manual"]').click(); });
    await p.waitForTimeout(200);
    await p.evaluate(()=>{ document.querySelector("#bw-eqBox").open=true; });
    eq(await p.isChecked('#bw-eq input[value="קונוסים"]'),false,"הבונה רואה את אותה רשימה");
    await p.check('#bw-eq input[value="מזרנים"]');
    ok((await p.evaluate(()=>window.HM.LS.get("ls.eqAvail",[]))).indexOf("מזרנים")>=0,"סימון בבונה נשמר");
    await p.evaluate(()=>{ document.querySelector('#ls-modeTabs [data-lm="fast"]').click(); });
    eq(await p.isChecked('#ls-eq input[value="מזרנים"]'),true,"והמחולל רואה אותו");
  }),
  check("חימום מומלץ לפי מזג אוויר: מוצג כהמלצה, לא משתנה בלי לחיצה, ומוחל בלחיצה",
    Object.assign({},base,st({step:2}),{"ls.timeOpts":{pace:"normal",trans:"normal",water:true,weather:"hot"}}),async p=>{
    await go(p);
    ok(await p.locator("#bw-wuRec").isVisible(),"המלצה מוצגת");
    eq((await lb(p)).wuMin,10,"לא שונה בלי לחיצה");
    const rec=+(await p.getAttribute("#bw-wuApply","data-n"));
    ok(rec<10&&rec>=5,"חם — חימום קצר יותר: "+rec);
    await p.click("#bw-wuApply");
    eq((await lb(p)).wuMin,rec,"הוחל בלחיצה");
    ok(await p.locator("#bw-wuRec").count()===0,"ההמלצה נעלמת אחרי שהוחלה");
  }),
  check("אין מספיק זמן לחלק העיקרי: ממליץ חימום קצר של 5 דקות — ורק בלחיצה",
    Object.assign({},base,st({step:2,dur:30,place:"hall",wuMin:10,finMin:10})),async p=>{
    await go(p);
    ok(/5/.test(await p.textContent("#bw-wuRec")),"המלצה ל-5 דק׳");
    eq((await lb(p)).wuMin,10,"לא שונה אוטומטית");
  }),
  check("חלון זמן יעיל בחלק העיקרי: בתוך הטווח, עודף ← משחק פנאי, וקצר מדי ← הערה רכה",
    Object.assign({},base,st({step:3,dur:45,count:4,picks:["d-squat","d-push","d-lunge","d-wall"]})),async p=>{
    await go(p);
    eq(await p.getAttribute("#bw-win","data-st"),"exact","45 דק׳ — בתוך הטווח");
    await p.evaluate(()=>{ const s=window.HM.LS.get("lb.state"); s.dur=120; window.HM.LS.set("lb.state",s); });
    await p.reload(); await p.waitForTimeout(800); await go(p);
    eq(await p.getAttribute("#bw-win","data-st"),"short","120 דק׳ — מעבר לטווח");
    ok(/free play|משחק פנאי/i.test(await p.textContent("#bw-win")),"העודף מוצג כמשחק פנאי");
    await p.evaluate(()=>{ const s=window.HM.LS.get("lb.state"); s.dur=30; s.fmt="sets"; s.count=6; s.picks=[]; window.HM.LS.set("lb.state",s); });
    await p.reload(); await p.waitForTimeout(800); await go(p);
    eq(await p.getAttribute("#bw-win","data-st"),"over","30 דק׳ ו-6 תרגילים בסטים — מתחת לטווח");
  }),
  check("מערך שנבנה עם עודף זמן נושא שורת משחק פנאי, והסכום נשמר",
    Object.assign({},base,st({step:5,dur:120})),async p=>{
    await go(p);
    await p.click("#bw-build"); await p.waitForTimeout(500);
    const info=await p.evaluate(()=>{ const ph=window.LESSON.current().phases; const mains=ph.filter(x=>x.k==="main"); const last=mains[mains.length-1];
      return {free:last.free||0,total:ph.reduce((a,x)=>a+x.min,0)}; });
    ok(info.free>0,"עודף מוקדש למשחק פנאי: "+info.free);
    eq(info.total,120,"אורך השיעור נשמר");
    ok(/free play|משחק פנאי/i.test(await p.textContent("#ls-planCard")),"השורה מוצגת במערך");
  })
]};
