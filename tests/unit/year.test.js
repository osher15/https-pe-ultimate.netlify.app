"use strict";
/* השכבה השנתית — שנת לימודים ויחידות הוראה.

   שלוש ההחלטות שהמודל עומד עליהן, וכל אחת מהן נשמרת כאן במפורש:
   יחידה שייכת לרמה ולא לשכבה (ולכן `cids` ולא `grade`), השיוך
   אוטומטי לפי תאריך (ולכן אין `unitId` על השיעור), וחפיפה מותרת
   אבל מוכרעת חד-משמעית (ולכן שיעור אחד לעולם לא נספר פעמיים).

   הבדיקה שתופסת הכי הרבה אם המודל יישבר היא «שיעור בחפיפה נספר
   ביחידה אחת בלבד» — בלעדיה סכום ההתקדמות מנפח את עצמו בשקט. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const D=require("../../hm-data.js");

const mkUnit=(list,o)=>D.makeUnit(list,Object.assign({
  yearId:"y1",title:"כדורעף — מסירות",level:"בסיס",
  cids:["c:ז:1"],from:"2025-11-01",to:"2025-12-15",planned:6},o||{}));
const ses=(id,cid,date,status)=>({id,cid,date,
  status:status||D.SESSION_DONE,startedAt:Date.parse(date)||1});

/* ============ שנת לימודים ============ */

test("שנת לימודים נגזרת מהתאריך — ספטמבר ויוני הם אותה שנה",()=>{
  assert.equal(D.schoolYearStart("2025-09-01"),2025,"היום הראשון");
  assert.equal(D.schoolYearStart("2025-12-31"),2025);
  assert.equal(D.schoolYearStart("2026-06-20"),2025,"סוף השנה — עדיין 2025/26");
  assert.equal(D.schoolYearStart("2026-08-31"),2025,"היום האחרון");
  assert.equal(D.schoolYearStart("2026-09-01"),2026,"וכאן מתחילה הבאה");
  assert.equal(D.schoolYearStart("לא תאריך"),null);
});

test("התווית היא מה שמורה מזהה, והטווח הוא ספטמבר–אוגוסט",()=>{
  assert.equal(D.schoolYearLabel(2025),"2025/26");
  assert.equal(D.schoolYearLabel(2099),"2099/00","מעבר מאה לא שובר את התווית");
  assert.deepEqual(D.schoolYearRange(2025),{start:"2025-09-01",end:"2026-08-31"});
});

test("שנה נוצרת מתאריך, ושנה חופפת מוחזרת במקום להיווצר פעמיים",()=>{
  const a=D.makeYear([],{on:"2025-11-03"});
  assert.equal(a.outcome,"created");
  assert.equal(a.year.label,"2025/26");
  assert.equal(a.year.start,"2025-09-01");

  const b=D.makeYear(a.list,{on:"2026-03-01"});
  assert.equal(b.outcome,"exists","אותה שנת לימודים — לא נוצרת שנייה");
  assert.equal(b.year.id,a.year.id);
  assert.equal(D.listYears(b.list).length,1);
});

test("hm-data לא קוראת את השעון — בלי תאריך אין שנה",()=>{
  const r=D.makeYear([],{});
  assert.equal(r.ok,false);
  assert.equal(r.outcome,"bad-year","הקורא מוסר תאריך; השכבה לא ממציאה אחד");
});

test("השנה שמכילה תאריך, ו-null כשאין",()=>{
  const {list}=D.makeYear([],{on:"2025-11-03"});
  assert.equal(D.yearOfDate(list,"2026-01-15").label,"2025/26");
  assert.equal(D.yearOfDate(list,"2027-01-15"),null,"שנה שלא נוצרה — לא מנוחשת");
  assert.equal(D.yearOfDate(list,"לא תאריך"),null);
});

/* ============ יחידה — רמה, לא שכבה ============ */

test("יחידה אחת חלה על כמה שכבות — הרמה קובעת, לא הגיל",()=>{
  const r=mkUnit([],{cids:["c:ז:1","c:ט:3"],level:"בסיס"});
  assert.equal(r.ok,true);
  assert.deepEqual(r.unit.cids,["c:ז:1","c:ט:3"],"ז׳ וט׳ באותה יחידה");
  assert.equal(r.unit.level,"בסיס");
  assert.equal(D.listUnits(r.list,{cid:"c:ט:3"}).length,1,"נמצאת דרך ט׳3");
  assert.equal(D.listUnits(r.list,{cid:"c:ז:1"}).length,1,"וגם דרך ז׳1");
  assert.equal(D.listUnits(r.list,{cid:"c:ח:2"}).length,0,"ולא דרך כיתה שאינה בה");
});

test("יחידה בלי כותרת, בלי כיתה או עם טווח הפוך נדחית",()=>{
  assert.equal(mkUnit([],{title:"  "}).outcome,"no-title");
  assert.equal(mkUnit([],{cids:[]}).outcome,"no-class");
  assert.equal(mkUnit([],{from:"2025-12-15",to:"2025-11-01"}).outcome,"bad-range");
  assert.equal(mkUnit([],{from:"לא תאריך"}).outcome,"bad-range");
});

test("כפילות ברשימת ההקשרים היא רעש ממשק ולא שגיאה",()=>{
  const r=mkUnit([],{cids:["c:ז:1","c:ז:1","c:ט:3"]});
  assert.deepEqual(r.unit.cids,["c:ז:1","c:ט:3"]);
});

test("הרשימה ממוינת לפי תאריך התחלה — מקור סדר אחד לכל המסכים",()=>{
  let L=mkUnit([],{title:"שלישית",from:"2026-02-01",to:"2026-03-01"}).list;
  L=mkUnit(L,{title:"ראשונה",from:"2025-10-01",to:"2025-11-01"}).list;
  L=mkUnit(L,{title:"שנייה",from:"2025-12-01",to:"2026-01-01"}).list;
  assert.deepEqual(D.listUnits(L).map(u=>u.title),["ראשונה","שנייה","שלישית"]);
});

test("עריכה משנה שדות ושומרת זהות",()=>{
  const a=mkUnit([]);
  const b=D.updateUnit(a.list,a.unit.id,{title:"כדורעף — חבטה",planned:9});
  assert.equal(b.outcome,"updated");
  assert.equal(b.unit.id,a.unit.id,"אותה יחידה");
  assert.equal(b.unit.title,"כדורעף — חבטה");
  assert.equal(b.unit.planned,9);
  assert.deepEqual(b.unit.cids,["c:ז:1"],"מה שלא נמסר נשאר");
  assert.equal(D.updateUnit(a.list,"אין-כזה",{title:"x"}).outcome,"not-found");
});

test("מחיקה מסירה, ומחיקה של מה שאין מדווחת ככישלון",()=>{
  const a=mkUnit([]);
  assert.equal(D.removeUnit(a.list,a.unit.id).ok,true);
  assert.equal(D.removeUnit(a.list,a.unit.id).list.length,0);
  assert.equal(D.removeUnit(a.list,"אין-כזה").ok,false);
});

/* ============ חפיפה — מותרת, ומדווחת ============ */

test("שתי יחידות לאותה כיתה באותו שבוע נשמרות, והחפיפה מדווחת",()=>{
  const a=mkUnit([],{title:"כדורסל",from:"2025-11-01",to:"2025-12-15"});
  assert.equal(a.overlap.length,0,"הראשונה לא חופפת לאיש");
  const b=mkUnit(a.list,{title:"כושר",from:"2025-12-01",to:"2026-01-31"});
  assert.equal(b.ok,true,"לא נדחית — מורה באמת מלמד שתי יחידות במקביל");
  assert.deepEqual(b.overlap.map(x=>x.title),["כדורסל"],"אבל הוא יודע על זה");
});

test("חפיפה נספרת רק כשיש כיתה משותפת ושנה משותפת",()=>{
  const a=mkUnit([],{title:"כדורסל",cids:["c:ז:1"]});
  const b=mkUnit(a.list,{title:"כושר",cids:["c:ח:2"]});
  assert.equal(b.overlap.length,0,"אותם תאריכים, כיתות שונות — אין חפיפה");
  const c=mkUnit(a.list,{title:"כושר",cids:["c:ז:1"],yearId:"y2"});
  assert.equal(c.overlap.length,0,"אותה כיתה, שנה אחרת — אין חפיפה");
});

/* ============ השיוך: שיעור → יחידה ============ */

test("שיעור נשלף ליחידה לפי תאריך וכיתה, בלי שדה על השיעור",()=>{
  const {list,unit}=mkUnit([],{cids:["c:ז:1","c:ט:3"]});
  assert.equal(D.unitOfSession(list,ses("s1","c:ז:1","2025-11-10")).id,unit.id);
  assert.equal(D.unitOfSession(list,ses("s2","c:ט:3","2025-12-15")).id,unit.id,
    "היום האחרון בטווח — בפנים");
  assert.equal(D.unitOfSession(list,ses("s3","c:ז:1","2025-10-31")),null,
    "יום לפני — בחוץ");
  assert.equal(D.unitOfSession(list,ses("s4","c:ח:2","2025-11-10")),null,
    "כיתה שאינה ביחידה");
  assert.equal(D.unitOfSession(list,{cid:"c:ז:1"}),null,"שיעור בלי תאריך");
});

test("היסטוריה שקדמה ליחידה נכנסת אליה — זאת כל הנקודה בשיוך לפי תאריך",()=>{
  const old=ses("s1","c:ז:1","2025-11-10");
  const {list,unit}=mkUnit([]);   /* היחידה נכתבת אחרי השיעור */
  assert.equal(D.unitOfSession(list,old).id,unit.id,
    "בלי הזנה חוזרת ובלי לגעת ברשומת השיעור");
});

test("בחפיפה מכריעה המאוחרת, ואותה תשובה בכל סדר של הרשימה",()=>{
  const a=mkUnit([],{title:"כדורסל",from:"2025-11-01",to:"2025-12-15"});
  const b=mkUnit(a.list,{title:"כושר",from:"2025-12-01",to:"2026-01-31"});
  const s=ses("s1","c:ז:1","2025-12-05");
  assert.equal(D.unitsOfSession(b.list,s).length,2,"שתיהן מכילות אותו");
  assert.equal(D.unitOfSession(b.list,s).title,"כושר","המאוחרת מנצחת");
  assert.equal(D.unitOfSession(b.list.slice().reverse(),s).title,"כושר",
    "וההכרעה אינה תלויה בסדר השמירה");
});

/* ============ גלגול התוצאות כלפי מעלה ============ */

test("שיעור בחפיפה נספר ביחידה אחת בלבד — אחרת ההתקדמות מנפחת עצמה",()=>{
  const a=mkUnit([],{title:"כדורסל",from:"2025-11-01",to:"2025-12-15",planned:4});
  const b=mkUnit(a.list,{title:"כושר",from:"2025-12-01",to:"2026-01-31",planned:4});
  const L=b.list;
  const S=[ses("s1","c:ז:1","2025-11-10"),ses("s2","c:ז:1","2025-12-05")];
  const pa=D.unitProgress(L,S,[],a.unit.id);
  const pb=D.unitProgress(L,S,[],b.unit.id);
  assert.equal(pa.done,1,"רק השיעור שמחוץ לחפיפה");
  assert.equal(pb.done,1,"ורק זה שבתוכה");
  assert.equal(pa.done+pb.done,S.length,"הסכום שווה למספר השיעורים האמיתי");
});

test("ההתקדמות מגלגלת מדידות ותלמידים דרך sessionId",()=>{
  const {list,unit}=mkUnit([],{cids:["c:ז:1","c:ט:3"],planned:6});
  const S=[ses("s1","c:ז:1","2025-11-10"),ses("s2","c:ט:3","2025-11-12"),
           ses("s3","c:ח:2","2025-11-12")];
  const rows=[{sessionId:"s1",sid:"a"},{sessionId:"s1",sid:"b"},
              {sessionId:"s2",sid:"a"},{sessionId:"s3",sid:"z"},
              {sessionId:null,sid:"q"}];
  const p=D.unitProgress(list,S,rows,unit.id);
  assert.equal(p.held,2,"שני השיעורים שביחידה");
  assert.equal(p.done,2);
  assert.equal(p.measurements,3,"מדידת הכיתה שמחוץ ליחידה לא נספרת");
  assert.equal(p.students,2,"אותו תלמיד בשני שיעורים — נספר פעם אחת");
  assert.equal(p.lastDate,"2025-11-12");
  assert.equal(p.pct,33,"2 מתוך 6");
});

test("«לא תוכנן» ו«לא התקיים» הן שתי אמירות שונות",()=>{
  const a=mkUnit([],{planned:0});
  assert.equal(D.unitProgress(a.list,[],[],a.unit.id).pct,null,
    "בלי מכנה אין אחוז — ולא אפס");
  const b=mkUnit([],{planned:5});
  assert.equal(D.unitProgress(b.list,[],[],b.unit.id).pct,0,
    "תוכנן ולא התקיים — אפס אמיתי");
  assert.equal(D.unitProgress([],[],[],"אין-כזה"),null);
});

test("התקדמות אינה עוברת 100 גם כשהתקיימו יותר משתוכנן",()=>{
  const a=mkUnit([],{planned:1});
  const S=[ses("s1","c:ז:1","2025-11-10"),ses("s2","c:ז:1","2025-11-17"),
           ses("s3","c:ז:1","2025-11-24")];
  const p=D.unitProgress(a.list,S,[],a.unit.id);
  assert.equal(p.done,3,"הספירה האמיתית נשמרת");
  assert.equal(p.pct,100,"והאחוז נעצר");
});

test("שיעור פתוח נספר כ«התקיים» רק אחרי שהסתיים",()=>{
  const a=mkUnit([],{planned:4});
  const S=[ses("s1","c:ז:1","2025-11-10",D.SESSION_ACTIVE)];
  const p=D.unitProgress(a.list,S,[],a.unit.id);
  assert.equal(p.held,1,"הוא ביחידה");
  assert.equal(p.done,0,"אבל עוד לא הסתיים");
});

/* ============ התוכנית השנתית ============ */

test("התוכנית השנתית מחזירה את היחידות לפי הסדר עם מצב מול היום",()=>{
  let L=mkUnit([],{title:"סתיו",from:"2025-10-01",to:"2025-11-30"}).list;
  L=mkUnit(L,{title:"חורף",from:"2025-12-01",to:"2026-02-28"}).list;
  L=mkUnit(L,{title:"אביב",from:"2026-03-01",to:"2026-05-31"}).list;
  const plan=D.annualPlan(L,[],[],{yearId:"y1",on:"2026-01-15"});
  assert.deepEqual(plan.map(p=>p.title),["סתיו","חורף","אביב"]);
  assert.deepEqual(plan.map(p=>p.phase),["past","current","upcoming"]);
});

test("התוכנית מסוננת לשנה ולכיתה",()=>{
  let L=mkUnit([],{title:"של ז׳",cids:["c:ז:1"]}).list;
  L=mkUnit(L,{title:"של ח׳",cids:["c:ח:2"]}).list;
  L=mkUnit(L,{title:"שנה אחרת",yearId:"y2",cids:["c:ז:1"]}).list;
  assert.deepEqual(D.annualPlan(L,[],[],{yearId:"y1"}).map(p=>p.title),
    ["של ז׳","של ח׳"]);
  assert.deepEqual(D.annualPlan(L,[],[],{yearId:"y1",cid:"c:ז:1"}).map(p=>p.title),
    ["של ז׳"]);
});

test("בלי תאריך אין מצב — ולא ניחוש שיחידה פעילה",()=>{
  const a=mkUnit([]);
  assert.equal(D.annualPlan(a.list,[],[],{})[0].phase,"","ריק, לא current");
  assert.equal(D.unitPhase(a.unit,"לא תאריך"),"");
});

test("היחידה הפעילה לכיתה היום — אותה הכרעה, לא כלל שני",()=>{
  const a=mkUnit([],{title:"כדורסל",from:"2025-11-01",to:"2025-12-15"});
  const b=mkUnit(a.list,{title:"כושר",from:"2025-12-01",to:"2026-01-31"});
  assert.equal(D.currentUnit(b.list,"c:ז:1","2025-11-10").title,"כדורסל");
  assert.equal(D.currentUnit(b.list,"c:ז:1","2025-12-05").title,"כושר",
    "כמו unitOfSession בדיוק");
  assert.equal(D.currentUnit(b.list,"c:ז:1","2026-06-01"),null);
  assert.equal(D.currentUnit(b.list,"c:ז:1",null),null,"בלי תאריך — null");
});

/* ============ עמידות בפני נתון פגום ============ */

test("רשומות פגומות מסוננות ולא מפילות",()=>{
  const junk=[null,undefined,{},{id:"u1"},{id:"u2",title:"בלי תאריכים"},
    {id:"u3",title:"בלי cids",from:"2025-11-01",to:"2025-12-01"},
    "מחרוזת",42];
  assert.deepEqual(D.listUnits(junk),[]);
  assert.deepEqual(D.listYears(junk),[]);
  assert.equal(D.unitOfSession(junk,ses("s1","c:ז:1","2025-11-10")),null);
  assert.deepEqual(D.annualPlan(junk,junk,junk,{on:"2025-11-10"}),[]);
  assert.equal(D.unitById(junk,"u1"),null,"רשומה פגומה אינה נמצאת גם לפי id");
});
