"use strict";
/* שלב 14 — ספריית הקוריקולום.
   שלושה דברים שהבדיקות כאן שומרות עליהם, כי כולם קלים לשבירה
   בשקט: שהקוד הוא הזהות ולא הכותרת, שנפילה לשפה אחרת נשארת
   גלויה, ושבדיקת השלמות מדווחת על קישור שבור במקום לתקן אותו. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const D=require("../../hm-data.js");

const L=(code,lang,extra)=>Object.assign({
  code:code, lang:lang, sport:"basketball", n:+code.slice(-2),
  title:code+" "+lang, subtopic:"", ageFrom:9, ageTo:11, level:"מתחילים",
  minutes:45, students:"", equipment:"", space:"", complexity:"בסיסית",
  prev:null, next:null, tags:[], skills:[], keywords:[],
  load:{}, summary:[], status:"draft", sections:[]
},extra||{});

const lib=()=>[
  L("BB-01","he",{next:"BB-02",tags:["כדורסל","כדרור"],skills:["כדרור"]}),
  L("BB-02","he",{prev:"BB-01",next:"BB-03",tags:["כדורסל"]}),
  L("BB-03","he",{prev:"BB-02",tags:["כדורסל"]}),
  L("BB-01","en",{next:"BB-02",tags:["basketball"]}),
  L("BB-02","en",{prev:"BB-01",next:"BB-03",tags:["basketball"]}),
  Object.assign(L("AT-01","he"),{sport:"athletics",ageFrom:12,ageTo:14})
];

/* ---------- זהות ושפה ---------- */

test("curricOf מחזיר את המהדורה בשפה המבוקשת בלי לסמן נפילה",()=>{
  const r=D.curricOf(lib(),"BB-01","he");
  assert.equal(r.lesson.lang,"he");
  assert.equal(r.fallback,false);
  assert.equal(r.requested,"he");
});

test("curricOf: אין מהדורה בשפה — נפילה מסומנת, לא מוסתרת",()=>{
  const r=D.curricOf(lib(),"BB-03","en");
  assert.equal(r.fallback,true,"מסך שמציג עברית ומדווח «אנגלית» משקר למורה");
  assert.equal(r.lang,"he");
  assert.equal(r.requested,"en");
});

test("curricOf: קוד שאינו קיים בשום שפה — null ולא רשומה ריקה",()=>{
  assert.equal(D.curricOf(lib(),"BB-99","he"),null);
});

test("curricOf: הקוד הוא הזהות — אותו מערך בשתי שפות, שתי כותרות",()=>{
  const he=D.curricOf(lib(),"BB-01","he").lesson;
  const en=D.curricOf(lib(),"BB-01","en").lesson;
  assert.equal(he.code,en.code);
  assert.notEqual(he.title,en.title);
});

/* ---------- סינון ---------- */

test("curricList מסנן לפי שפה ואינו מדליף מהדורות אחרות",()=>{
  const out=D.curricList(lib(),{lang:"he"});
  assert.equal(out.length,4);
  assert.equal(out.every(x=>x.lang==="he"),true);
});

test("curricList: גיל נכלל בחפיפת טווח, לא בהתאמה מדויקת",()=>{
  const out=D.curricList(lib(),{lang:"he",age:10});
  assert.deepEqual(out.map(x=>x.code),["BB-01","BB-02","BB-03"],
    "מערך ל-9–11 רלוונטי לבן 10");
  assert.equal(D.curricList(lib(),{lang:"he",age:13}).length,1,"רק האתלטיקה");
});

test("curricList: גבולות הטווח עצמם נכללים",()=>{
  assert.equal(D.curricList(lib(),{lang:"he",age:9}).length,3);
  assert.equal(D.curricList(lib(),{lang:"he",age:11}).length,3);
  assert.equal(D.curricList(lib(),{lang:"he",age:8}).length,0);
});

test("curricList: חיפוש חופשי עובר על כותרת, תגיות ומיומנויות",()=>{
  assert.equal(D.curricList(lib(),{lang:"he",q:"כדרור"}).length,1);
  assert.equal(D.curricList(lib(),{lang:"he",q:"כדורסל"}).length,3);
});

test("curricList: מיון יציב — אותו קלט, אותו סדר",()=>{
  const first=D.curricList(lib(),{lang:"he"}).map(x=>x.code);
  for(let i=0;i<5;i++)
    assert.deepEqual(D.curricList(lib().reverse(),{lang:"he"}).map(x=>x.code),first);
});

test("curricList על ספרייה ריקה מחזיר מערך ריק ולא קורס",()=>{
  assert.deepEqual(D.curricList([],{lang:"he"}),[]);
  assert.deepEqual(D.curricList(null,{}),[]);
});

/* ---------- ענפים ומסלול ---------- */

test("curricSports סופר לפי שפה בלבד",()=>{
  assert.deepEqual(D.curricSports(lib(),"he"),
    [{sport:"athletics",count:1},{sport:"basketball",count:3}]);
  assert.deepEqual(D.curricSports(lib(),"en"),[{sport:"basketball",count:2}]);
});

test("curricPathway מחזיר את הרצף לפי מספר, לא לפי שרשור",()=>{
  const p=D.curricPathway(lib(),"basketball","he");
  assert.deepEqual(p.map(x=>x.n),[1,2,3]);
  assert.deepEqual(p.map(x=>x.code),["BB-01","BB-02","BB-03"]);
});

test("curricPathway: קישור שבור לא שובר את הרשימה",()=>{
  const bad=lib(); bad[1].prev="BB-77";
  const p=D.curricPathway(bad,"basketball","he");
  assert.equal(p.length,3,"המסלול נגזר מ-n ולכן שורד קישור פגום");
});

/* ---------- בדיקת שלמות ---------- */

test("curricValidate: ספרייה תקינה — אין ממצאים",()=>{
  const ok=lib().filter(x=>x.lang==="he"&&x.sport==="basketball");
  ok[2].next=null;
  assert.equal(D.curricValidate(ok).ok,true);
});

test("curricValidate תופס קישור שמצביע על מערך שאינו קיים",()=>{
  /* BB-02 מצביע על BB-03 שאינו בספרייה — בדיוק המצב של ייבוא
     חלקי, שבו הענף נמשך ב-Notion אך רק חלקו יובא. */
  const partial=lib().filter(x=>x.lang==="he"&&x.sport==="basketball").slice(0,2);
  const v=D.curricValidate(partial);
  assert.equal(v.ok,false);
  assert.equal(v.issues.some(i=>i.kind==="dangling-next"&&i.points==="BB-03"),true);
});

test("curricValidate: קישור תקין אינו מדווח כשבור",()=>{
  const full=lib().filter(x=>x.lang==="he"&&x.sport==="basketball");
  assert.equal(D.curricValidate(full).issues.some(i=>/^dangling/.test(i.kind)),false);
});

test("curricValidate תופס prev שאינו תואם את הסדר",()=>{
  const wrong=lib().filter(x=>x.lang==="he"&&x.sport==="basketball");
  wrong[2].prev="BB-01";
  assert.equal(D.curricValidate(wrong).issues.some(i=>i.kind==="prev-mismatch"),true);
});

test("curricValidate תופס כפילות של קוד+שפה",()=>{
  const dup=lib().concat([L("BB-01","he")]);
  assert.equal(D.curricValidate(dup).issues.some(i=>i.kind==="duplicate"),true);
});

test("curricValidate תופס חור ברצף המספרים",()=>{
  const gap=[L("BB-01","he"),L("BB-03","he")];
  assert.equal(D.curricValidate(gap).issues.some(i=>i.kind==="gap"),true);
});

test("curricValidate תופס סטטוס שאינו מוכר — ולא מקדם אותו",()=>{
  const bad=[L("BB-01","he",{status:"unknown"})];
  const v=D.curricValidate(bad);
  assert.equal(v.issues.some(i=>i.kind==="unknown-status"),true,
    "סטטוס שלא זוהה אינו «מאושר»");
});

test("curricValidate מדווח ואינו מתקן",()=>{
  const bad=lib(); const before=JSON.stringify(bad);
  D.curricValidate(bad);
  assert.equal(JSON.stringify(bad),before,"בדיקה ששינתה את הנתונים היא באג");
});

/* ---------- הגשר אל nextLesson ---------- */

test("curricForTopic מציע מערכים לפי נושא ההמלצה",()=>{
  const out=D.curricForTopic(lib(),"כדרור",{lang:"he"});
  assert.deepEqual(out.map(x=>x.code),["BB-01"]);
});

test("curricForTopic: אין התאמה — רשימה ריקה, לא ניחוש",()=>{
  assert.deepEqual(D.curricForTopic(lib(),"שחייה",{lang:"he"}),[]);
});

test("curricForTopic: נושא ריק אינו מחזיר את כל הספרייה",()=>{
  assert.deepEqual(D.curricForTopic(lib(),"",{lang:"he"}),[]);
  assert.deepEqual(D.curricForTopic(lib(),"  ",{lang:"he"}),[]);
});

test("curricForTopic אינו מדרג ואינו מוסיף ציון התאמה",()=>{
  const out=D.curricForTopic(lib(),"כדורסל",{lang:"he"});
  out.forEach(x=>assert.equal("score" in x,false,"אין בסיס למשקולות"));
});

/* ---------- הנתונים האמיתיים ---------- */

test("הספרייה שנבנתה מ-Notion נטענת ועוברת את הסכמה",()=>{
  const fs=require("fs");
  if(!fs.existsSync("hm-curric-he.js"))return;      /* טרם נבנתה */
  global.window={};
  eval(fs.readFileSync("hm-curric-he.js","utf8"));
  const real=global.window.CURRIC;
  assert.ok(real.length>0,"קובץ ריק");
  real.forEach(L=>{
    assert.match(L.code,/^[A-Z]{2,3}-\d{2}$/,"קוד לא תקין: "+L.code);
    assert.equal(L.minutes,45);
    assert.equal(L.sections.length,20,L.code+" — לא 20 סעיפים");
    assert.equal(L.status,"draft","כל מערך שלא נבדק מקצועית הוא טיוטה");
    assert.ok(L.src&&L.src.page,L.code+" — בלי מזהה עמוד מקור");
  });
});

/* ---------- תג הסטטוס ---------- */

test("curricBadge: טיוטה מוצגת, ואומרת מה חסר",()=>{
  const b=D.curricBadge({status:"draft"});
  assert.equal(b.show,true);
  assert.equal(b.tone,"warn");
  assert.ok(b.why.length>0,"«טיוטה» לבד לא עוזר למורה להחליט");
});

test("curricBadge: כל מה שאינו approved מציג תג",()=>{
  ["draft","reviewed","piloted","unknown"].forEach(s=>
    assert.equal(D.curricBadge({status:s}).show,true,s+" חייב להציג תג"));
  assert.equal(D.curricBadge({status:"approved"}).show,false);
});

test("curricBadge: סטטוס שאינו מוכר נופל ל-unknown, לא ל-approved",()=>{
  const b=D.curricBadge({status:"probably-fine"});
  assert.equal(b.status,"unknown");
  assert.equal(b.show,true);
  assert.equal(b.tone,"stop","«לא ידוע» חמור מ«טיוטה», לא קל ממנו");
});

test("curricBadge: רשומה בלי סטטוס בכלל אינה מאושרת",()=>{
  assert.equal(D.curricBadge({}).status,"unknown");
  assert.equal(D.curricBadge(null).show,true);
});

test("curricBadge מעביר את משפט הסטטוס מהמקור",()=>{
  const b=D.curricBadge({status:"draft",statusNote:"נדרשת בדיקת איש מקצוע"});
  assert.equal(b.note,"נדרשת בדיקת איש מקצוע");
});

test("curricBadge מחזיר שם מצב ולא צבע",()=>{
  const b=D.curricBadge({status:"draft"});
  assert.equal(/^#|rgb/.test(b.tone),false,"מיפוי לצבע שייך ל-CSS");
});

/* ---------- הודעת השפה ---------- */

test("curricLangNotice: אין הודעה כשאין נפילה",()=>{
  assert.equal(D.curricLangNotice({fallback:false,lang:"he",requested:"he"}),null,
    "הודעה שמופיעה תמיד מלמדת את המורה להתעלם ממנה");
  assert.equal(D.curricLangNotice(null),null);
});

test("curricLangNotice נוקב בשתי השפות בשמן",()=>{
  const n=D.curricLangNotice({fallback:true,lang:"he",requested:"en"});
  assert.match(n.text,/אנגלית/);
  assert.match(n.text,/עברית/);
});

test("curricLangNotice על שפה שאינה במילון אינה קורסת",()=>{
  const n=D.curricLangNotice({fallback:true,lang:"he",requested:"zz"});
  assert.equal(n.requestedName,"zz");
});

/* ---------- המערכים האמיתיים נושאים תג ---------- */

test("כל מערך בספרייה שנבנתה מציג תג סטטוס",()=>{
  const fs=require("fs");
  if(!fs.existsSync("hm-curric-he.js"))return;
  global.window={};
  eval(fs.readFileSync("hm-curric-he.js","utf8"));
  global.window.CURRIC.forEach(L=>{
    const b=D.curricBadge(L);
    assert.equal(b.show,true,L.code+" — מערך טיוטה חייב להציג תג");
    assert.ok(b.note.length>0,L.code+" — משפט הסטטוס מהמקור אבד");
  });
});

/* ---------- הגשר: nextLesson ↔ הספרייה ---------- */

let seq2=0;
/* שרשרת שיעורים שהסתיימו, עם נושא, דירוג ו-planId אופציונלי */
function hist(items,cid){
  let L=[];
  items.forEach(it=>{
    const c=D.createSession(L,{cid:cid||"c:ט:3",clsSnapshot:"ט׳3",
      date:"2026-09-"+String(10+(seq2%18)).padStart(2,"0"),
      now:1757000000000+(++seq2)*100000,
      planTitle:it.topic,planId:it.planId||null});
    L=c.list;
    L=D.completeSession(L,c.session.id,1757000000000+seq2*100000+60000,
      {rating:it.rating}).list;
  });
  return L;
}
const CUR=()=>[
  L("BB-01","he",{next:"BB-02",tags:["כדורסל"],skills:["כדרור"],title:"כדורסל 01 — כדרור"}),
  L("BB-02","he",{prev:"BB-01",next:"BB-03",tags:["כדורסל"],title:"כדורסל 02 — עצירה"}),
  L("BB-03","he",{prev:"BB-02",tags:["כדורסל"],title:"כדורסל 03 — מסירה"})
];

test("בלי opts.curric ההתנהגות זהה — אין שדות מערכים",()=>{
  const r=D.nextLesson(hist([{topic:"כדורסל",rating:1}]),{cid:"c:ט:3"});
  assert.equal(r.ok,true);
  assert.deepEqual(r.lessons,[],"קורא קיים אינו אמור לקבל המלצות שלא ביקש");
  assert.equal(r.lessonsFrom,null);
  assert.ok(Array.isArray(r.steps)&&r.steps.length>0,"הסולם לא נפגע");
});

test("הסולם אינו מוחלף — המערכים מתווספים לו",()=>{
  const h=hist([{topic:"כדורסל",rating:1}]);
  const a=D.nextLesson(h,{cid:"c:ט:3"});
  const b=D.nextLesson(h,{cid:"c:ט:3",curric:CUR()});
  assert.deepEqual(b.steps,a.steps,"הסולם השתנה בגלל הספרייה");
  assert.deepEqual(b.why,a.why,"הנימוקים הקיימים השתנו");
  assert.equal(b.stage,a.stage);
});

/* --- מסלול (א): לפי הרצף --- */

test("רצף: 👍 מצביע על המערך הבא",()=>{
  const h=hist([{topic:"כדורסל",rating:1,planId:D.curricPlanId("BB-01")}]);
  const r=D.nextLesson(h,{cid:"c:ט:3",curric:CUR()});
  assert.equal(r.lessonsFrom,"pathway");
  assert.deepEqual(r.lessons.map(x=>x.code),["BB-02"]);
  assert.match(r.lessonsWhy,/BB-01/,"הנימוק אינו נוקב במערך שנלמד");
});

test("רצף: 👎 חוזר למערך שלפניו",()=>{
  const h=hist([{topic:"כדורסל",rating:-1,planId:D.curricPlanId("BB-02")}]);
  const r=D.nextLesson(h,{cid:"c:ט:3",curric:CUR()});
  assert.equal(r.lessonsFrom,"pathway");
  assert.deepEqual(r.lessons.map(x=>x.code),["BB-01"]);
});

test("רצף: 😐 נשאר על אותו מערך",()=>{
  const h=hist([{topic:"כדורסל",rating:0,planId:D.curricPlanId("BB-02")}]);
  const r=D.nextLesson(h,{cid:"c:ט:3",curric:CUR()});
  assert.deepEqual(r.lessons.map(x=>x.code),["BB-02"]);
});

test("רצף: בלי משוב — אותו מערך, ולא קפיצה קדימה",()=>{
  const h=hist([{topic:"כדורסל",planId:D.curricPlanId("BB-02")}]);
  const r=D.nextLesson(h,{cid:"c:ט:3",curric:CUR()});
  assert.deepEqual(r.lessons.map(x=>x.code),["BB-02"],
    "העדר משוב אינו אישור להתקדם");
});

test("רצף: סוף המסלול אומר זאת ולא מציע משהו אחר",()=>{
  const h=hist([{topic:"כדורסל",rating:1,planId:D.curricPlanId("BB-03")}]);
  const r=D.nextLesson(h,{cid:"c:ט:3",curric:CUR()});
  assert.equal(r.lessonsFrom,"pathway");
  assert.deepEqual(r.lessons,[]);
  assert.match(r.lessonsWhy,/האחרון/,"סוף מסלול הוחלף בהתאמה מעורפלת");
});

test("רצף: תחילת המסלול אין לה «קודם»",()=>{
  const h=hist([{topic:"כדורסל",rating:-1,planId:D.curricPlanId("BB-01")}]);
  const r=D.nextLesson(h,{cid:"c:ט:3",curric:CUR()});
  assert.deepEqual(r.lessons,[]);
  assert.match(r.lessonsWhy,/הראשון/);
});

test("רצף: מערך שטרם יובא מדווח ככזה ולא מוחלף",()=>{
  const partial=CUR().slice(0,2);          /* BB-03 אינו בספרייה */
  const h=hist([{topic:"כדורסל",rating:1,planId:D.curricPlanId("BB-02")}]);
  const r=D.nextLesson(h,{cid:"c:ט:3",curric:partial});
  assert.equal(r.lessonsFrom,"pathway");
  assert.deepEqual(r.lessons,[]);
  assert.match(r.lessonsWhy,/BB-03/);
  assert.match(r.lessonsWhy,/לא יובא/);
});

/* --- מסלול (ב): לפי נושא --- */

test("נושא: שיעור שלא נפתח מהספרייה מסומן כהתאמת טקסט",()=>{
  const h=hist([{topic:"כדורסל — כדרור",rating:1}]);
  const r=D.nextLesson(h,{cid:"c:ט:3",curric:CUR()});
  assert.equal(r.lessonsFrom,"topic","התאמת טקסט מוצגת כצעד ברצף");
  assert.ok(r.lessons.length>0);
  assert.match(r.lessonsWhy,/לא לפי מיקום ברצף/,
    "המסך חייב לדעת שההתאמה חלשה יותר");
});

test("נושא: planId שאינו של הספרייה אינו נקרא כקוד",()=>{
  const h=hist([{topic:"כדורסל",rating:1,planId:"bi-doc-volley-serve"}]);
  const r=D.nextLesson(h,{cid:"c:ט:3",curric:CUR()});
  assert.equal(r.lessonsFrom,"topic");
});

test("נושא: אין התאמה — רשימה ריקה ולא ניחוש",()=>{
  const h=hist([{topic:"שחייה בתעלה",rating:1}]);
  const r=D.nextLesson(h,{cid:"c:ט:3",curric:CUR()});
  assert.deepEqual(r.lessons,[]);
  assert.equal(r.lessonsFrom,null);
});

test("נושא: לכל היותר שלוש הצעות",()=>{
  const many=[];
  for(let i=1;i<=8;i++)
    many.push(L("BB-"+String(i).padStart(2,"0"),"he",{tags:["כדורסל"]}));
  const h=hist([{topic:"כדורסל",rating:1}]);
  const r=D.nextLesson(h,{cid:"c:ט:3",curric:many});
  assert.equal(r.lessons.length,D.CURRIC_MAX_SUGGEST);
});

/* --- מזהה התוכנית --- */

test("curricPlanId ו-curricCodeOfPlan הם הפוכים זה לזה",()=>{
  ["BB-01","FIT-10","AT-07"].forEach(c=>
    assert.equal(D.curricCodeOfPlan(D.curricPlanId(c)),c));
});

test("curricCodeOfPlan דוחה כל מה שאינו קוד תקין",()=>{
  ["","bi-x","curric:","curric:bb-01","curric:BB-1","curric:BB-011",null,undefined,42]
    .forEach(v=>assert.equal(D.curricCodeOfPlan(v),null,"התקבל: "+v));
});

test("curricSuggest על ספרייה ריקה אינו קורס",()=>{
  const r=D.curricSuggest([],{planId:"curric:BB-01"},"כדורסל",1,{});
  assert.deepEqual(r,{lessons:[],from:null,why:""});
});

test("הצעות הרצף נושאות את הסטטוס — מערך טיוטה נשאר טיוטה",()=>{
  const h=hist([{topic:"כדורסל",rating:1,planId:D.curricPlanId("BB-01")}]);
  const r=D.nextLesson(h,{cid:"c:ט:3",curric:CUR()});
  r.lessons.forEach(x=>assert.equal(D.curricBadge(x).show,true,
    x.code+" — הצעה בלי תג סטטוס"));
});

/* ---------- סימון המערך לשיעור הפתוח ---------- */

test("setSessionPlan מסמן מערך לשיעור פתוח",()=>{
  const c=D.createSession([],{cid:"c:ט:3",clsSnapshot:"ט׳3",date:"2026-09-12"});
  const r=D.setSessionPlan(c.list,c.session.id,
    {planId:D.curricPlanId("BB-01"),planTitle:"כדורסל 01"});
  assert.equal(r.ok,true);
  assert.equal(r.session.planId,"curric:BB-01");
  assert.equal(r.session.planTitle,"כדורסל 01");
  assert.equal(D.curricCodeOfPlan(r.session.planId),"BB-01");
});

test("setSessionPlan אינה נוגעת בשיעור שהסתיים",()=>{
  const c=D.createSession([],{cid:"c:ט:3",date:"2026-09-12"});
  const done=D.completeSession(c.list,c.session.id,999,{rating:1});
  const r=D.setSessionPlan(done.list,c.session.id,{planId:D.curricPlanId("BB-02")});
  assert.equal(r.ok,false);
  assert.equal(r.outcome,"not-active","שינוי בדיעבד משכתב היסטוריה שההמלצה נשענת עליה");
  assert.equal(r.session.planId,null,"הרשומה ההיסטורית נגעה");
});

test("setSessionPlan אינה משנה סטטוס, דירוג או זמנים",()=>{
  const c=D.createSession([],{cid:"c:ט:3",date:"2026-09-12",now:1000});
  const before=c.session;
  const r=D.setSessionPlan(c.list,c.session.id,{planId:D.curricPlanId("BB-01")});
  ["id","cid","clsSnapshot","date","startedAt","endedAt","status"].forEach(k=>
    assert.deepEqual(r.session[k],before[k],"השדה "+k+" השתנה"));
});

test("setSessionPlan על מזהה שאינו קיים מחזירה not-found",()=>{
  const c=D.createSession([],{cid:"c:ט:3",date:"2026-09-12"});
  assert.equal(D.setSessionPlan(c.list,"אין-כזה",{planId:"x"}).outcome,"not-found");
});

test("setSessionPlan אינה משכפלת ואינה מוחקת שיעורים",()=>{
  const a=D.createSession([],{cid:"c:ט:3",date:"2026-09-12",now:1000});
  const done=D.completeSession(a.list,a.session.id,2000,{rating:1});
  const b=D.createSession(done.list,{cid:"c:ח:1",date:"2026-09-13",now:3000});
  const r=D.setSessionPlan(b.list,b.session.id,{planId:D.curricPlanId("BB-01")});
  assert.equal(r.list.length,b.list.length);
  assert.equal(r.list.filter(x=>x.id===b.session.id).length,1);
});

test("הלולאה נסגרת: סימון → סיום 👍 → המערך הבא ברצף",()=>{
  /* בדיוק המסלול שהמורה עובר: פותח שיעור, מסמן מערך, מסיים
     בסימון «עבד מצוין», ומקבל את המערך הבא. */
  const c=D.createSession([],{cid:"c:ט:3",clsSnapshot:"ט׳3",
    date:"2026-09-12",now:1757000000000});
  const marked=D.setSessionPlan(c.list,c.session.id,
    {planId:D.curricPlanId("BB-01"),planTitle:"כדורסל 01 — כדרור"});
  const done=D.completeSession(marked.list,c.session.id,1757000060000,{rating:1});
  const rec=D.nextLesson(done.list,{cid:"c:ט:3",curric:CUR()});
  assert.equal(rec.ok,true);
  assert.equal(rec.lessonsFrom,"pathway","הלולאה לא נסגרה — נפלנו להתאמת טקסט");
  assert.deepEqual(rec.lessons.map(x=>x.code),["BB-02"]);
});

test("בלי סימון אותה לולאה נופלת להתאמת נושא — ומסומנת ככזאת",()=>{
  const c=D.createSession([],{cid:"c:ט:3",clsSnapshot:"ט׳3",
    date:"2026-09-12",now:1757000000000,planTitle:"כדורסל — כדרור"});
  const done=D.completeSession(c.list,c.session.id,1757000060000,{rating:1});
  const rec=D.nextLesson(done.list,{cid:"c:ט:3",curric:CUR()});
  assert.equal(rec.lessonsFrom,"topic");
});
