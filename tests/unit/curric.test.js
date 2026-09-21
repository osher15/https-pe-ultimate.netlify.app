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
