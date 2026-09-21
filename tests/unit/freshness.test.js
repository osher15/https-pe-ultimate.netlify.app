"use strict";
/* שלב 13 — טריות הראיה.
   הנקודה שהשכבה הזאת קיימת בשבילה: classCoverage אומרת «נמדד»
   ולא «מתי». הבדיקות כאן שומרות על שלושה דברים שקל לשבור בלי
   לשים לב — שהגבול בין המצבים נמדד בימים מלאים ולא משנה עם
   אזור הזמן, ש«לא נמדד מעולם» לא נבלע בתוך «נמדד מזמן», ושאף
   מסלול לא מייצר ציון או דירוג של תלמיד. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const D=require("../../hm-data.js");

const TESTS=[{id:"push",dir:"high"},{id:"r60",dir:"low"},{id:"situp",dir:"high"}];
const X="c:ח:1", Y="c:ח:2";
const AS_OF="2026-09-21";
const roster=()=>[
  {id:"a",name:"Alice",cid:X},
  {id:"b",name:"Bob",cid:X},
  {id:"c",name:"Carol",cid:X},
  {id:"d",name:"Dana",cid:X}
];
/* Alice טרייה · Bob ישן (‎51‎ יום) · Carol ישן מאוד (‎142‎ יום) ·
   Dana לא נמדדה מעולם */
const rows=()=>[
  {id:"r1",test:"push", sid:"a",cid:X,cls:"ח1",val:20, d:"2026-09-20"},
  {id:"r2",test:"r60",  sid:"a",cid:X,cls:"ח1",val:9.1,d:"2026-09-18"},
  {id:"r3",test:"push", sid:"b",cid:X,cls:"ח1",val:18, d:"2026-08-01"},
  {id:"r4",test:"situp",sid:"c",cid:X,cls:"ח1",val:30, d:"2026-05-02"},
  /* כיתה אחרת — לא אמורה להשפיע על אף חישוב */
  {id:"r5",test:"push", sid:"z",cid:Y,cls:"ח2",val:9,  d:"2026-09-20"}
];
const opts=()=>({cid:X,asOf:AS_OF});

/* ---------- אריתמטיקה של תאריכים ---------- */

test("daysBetweenISO סופר ימים מלאים, לא שעות",()=>{
  assert.equal(D.daysBetweenISO("2026-09-20","2026-09-21"),1);
  assert.equal(D.daysBetweenISO("2026-09-21","2026-09-21"),0);
  assert.equal(D.daysBetweenISO("2026-08-01","2026-09-21"),51);
});

test("daysBetweenISO חוצה מעבר שעון קיץ בלי לאבד או להוסיף יום",()=>{
  /* בישראל השעון זז בסוף מרץ ובסוף אוקטובר. חישוב שנשען על
     new Date מקומי היה נותן כאן ‎30.958…‎ ומעגל לפי מזל. */
  assert.equal(D.daysBetweenISO("2026-03-01","2026-04-01"),31);
  assert.equal(D.daysBetweenISO("2026-10-01","2026-11-01"),31);
});

test("daysBetweenISO מחזירה null על קלט שאינו תאריך",()=>{
  assert.equal(D.daysBetweenISO("","2026-09-21"),null);
  assert.equal(D.daysBetweenISO("2026-09-21",null),null);
  assert.equal(D.daysBetweenISO("אתמול","2026-09-21"),null);
});

test("daysBetweenISO שלילית לתאריך עתידי — לא מתקנת ולא מתאפסת",()=>{
  assert.equal(D.daysBetweenISO("2026-09-25","2026-09-21"),-4);
});

test("localISO מחזירה את היום המקומי, לא את היום לפי UTC",()=>{
  /* ‎1‎ בינואר ‎2026‎, ‎00:30‎ מקומי. ב-UTC זה עדיין ‎31‎ בדצמבר
     בכל אזור זמן מזרחי — וזה בדיוק ההיסט שהפונקציה נועדה למנוע. */
  const d=new Date(2026,0,1,0,30,0);
  assert.equal(D.localISO(d.getTime()),"2026-01-01");
});

test("localISO מחזירה null על חותמת זמן לא חוקית",()=>{
  assert.equal(D.localISO(NaN),null);
});

/* ---------- גבולות המצב ---------- */

test("evidenceState: הגבולות עצמם עדיין בצד הטוב",()=>{
  assert.equal(D.evidenceState(0),  D.EVIDENCE.FRESH);
  assert.equal(D.evidenceState(30), D.EVIDENCE.FRESH,  "יום ‎30‎ עוד טרי");
  assert.equal(D.evidenceState(31), D.EVIDENCE.STALE);
  assert.equal(D.evidenceState(90), D.EVIDENCE.STALE,  "יום ‎90‎ עוד רק ישן");
  assert.equal(D.evidenceState(91), D.EVIDENCE.EXPIRED);
});

test("evidenceState: «לא נמדד מעולם» אינו «ישן מאוד»",()=>{
  assert.equal(D.evidenceState(null),D.EVIDENCE.NEVER);
  assert.notEqual(D.evidenceState(null),D.EVIDENCE.EXPIRED);
});

test("evidenceState: תאריך עתידי אינו ישן",()=>{
  assert.equal(D.evidenceState(-3),D.EVIDENCE.FRESH);
});

/* ---------- המדידה האחרונה ---------- */

test("lastMeasuredOn מחזירה את התאריך האחרון מכל המבחנים",()=>{
  assert.equal(D.lastMeasuredOn(rows(),{id:"a"},TESTS,opts()),"2026-09-20");
});

test("lastMeasuredOn מצומצמת למבחן אחד כשמבקשים",()=>{
  const o=Object.assign(opts(),{testId:"r60"});
  assert.equal(D.lastMeasuredOn(rows(),{id:"a"},TESTS,o),"2026-09-18");
});

test("lastMeasuredOn אינה רואה מדידות של כיתה אחרת",()=>{
  const rs=rows().concat([{id:"r6",test:"push",sid:"a",cid:Y,cls:"ח2",val:22,d:"2026-09-21"}]);
  assert.equal(D.lastMeasuredOn(rs,{id:"a"},TESTS,opts()),"2026-09-20",
    "מדידה של אותו תלמיד בכיתה אחרת היא הקשר אחר");
});

test("lastMeasuredOn מתעלמת ממבחן שאינו בקטלוג ומתאריך פגום",()=>{
  const rs=rows().concat([
    {id:"r7",test:"unknown",sid:"a",cid:X,cls:"ח1",val:1,d:"2026-09-21"},
    {id:"r8",test:"push",   sid:"a",cid:X,cls:"ח1",val:1,d:"מחר"}
  ]);
  assert.equal(D.lastMeasuredOn(rs,{id:"a"},TESTS,opts()),"2026-09-20");
});

test("lastMeasuredOn מחזירה null כשאין מדידה",()=>{
  assert.equal(D.lastMeasuredOn(rows(),{id:"d"},TESTS,opts()),null);
});

/* ---------- טריות לתלמיד ---------- */

test("freshnessOf נותנת תאריך, גיל ומצב יחד",()=>{
  const f=D.freshnessOf(rows(),{id:"b"},TESTS,opts());
  assert.equal(f.last,"2026-08-01");
  assert.equal(f.days,51);
  assert.equal(f.state,D.EVIDENCE.STALE);
  assert.equal(f.future,false);
});

test("freshnessOf על תלמיד בלי מדידה — null ולא אפס",()=>{
  const f=D.freshnessOf(rows(),{id:"d"},TESTS,opts());
  assert.equal(f.last,null);
  assert.equal(f.days,null,"«לא נמדד» אינו «נמדד לפני אפס ימים»");
  assert.equal(f.state,D.EVIDENCE.NEVER);
});

test("freshnessOf מסמנת תאריך עתידי ולא מתקנת אותו",()=>{
  const rs=rows().concat([{id:"r9",test:"push",sid:"d",cid:X,cls:"ח1",val:5,d:"2026-10-01"}]);
  const f=D.freshnessOf(rs,{id:"d"},TESTS,opts());
  assert.equal(f.future,true);
  assert.equal(f.last,"2026-10-01","התאריך נשמר כפי שהוקלד; המורה מכריע");
});

/* ---------- תמונת הכיתה ---------- */

test("classFreshness שומרת על אותן עמודות של classCoverage",()=>{
  const cov=D.classCoverage(rows(),roster(),TESTS,{cid:X});
  const fr=D.classFreshness(rows(),roster(),TESTS,opts());
  assert.deepEqual(fr.tests,cov.tests,"שתי הגדרות ל«המבחנים של הכיתה» הן באג");
});

test("classFreshness שומרת על אותו done של classCoverage",()=>{
  const cov=D.classCoverage(rows(),roster(),TESTS,{cid:X});
  const fr=D.classFreshness(rows(),roster(),TESTS,opts());
  fr.students.forEach((s,i)=>assert.deepEqual(s.done,cov.students[i].done));
});

test("classFreshness: מצב לכל תלמיד",()=>{
  const fr=D.classFreshness(rows(),roster(),TESTS,opts());
  const st=id=>fr.students.find(s=>s.stud.id===id).state;
  assert.equal(st("a"),D.EVIDENCE.FRESH);
  assert.equal(st("b"),D.EVIDENCE.STALE);
  assert.equal(st("c"),D.EVIDENCE.EXPIRED);
  assert.equal(st("d"),D.EVIDENCE.NEVER);
});

test("classFreshness: counts הוא חלוקה מלאה של הרשימה",()=>{
  const fr=D.classFreshness(rows(),roster(),TESTS,opts());
  const sum=fr.counts.never+fr.counts.expired+fr.counts.stale+fr.counts.fresh;
  assert.equal(sum,fr.students.length,"אף תלמיד לא נספר פעמיים ואף אחד לא הושמט");
  assert.deepEqual(fr.counts,{never:1,expired:1,stale:1,fresh:1});
});

test("classFreshness: missing הוא המשלים של done, לא רשימה נפרדת",()=>{
  const fr=D.classFreshness(rows(),roster(),TESTS,opts());
  fr.students.forEach(s=>{
    const fromDone=fr.tests.filter(t=>!s.done[t]);
    assert.deepEqual(s.missing,fromDone);
  });
});

test("classFreshness מחזירה את asOf שלפיו חושבה",()=>{
  const fr=D.classFreshness(rows(),roster(),TESTS,opts());
  assert.equal(fr.asOf,AS_OF,"תמונה בלי התאריך שלה אי אפשר לקרוא בדיעבד");
});

test("classFreshness על כיתה ריקה אינה קורסת",()=>{
  const fr=D.classFreshness([],[],TESTS,opts());
  assert.deepEqual(fr.tests,[]);
  assert.deepEqual(fr.students,[]);
  assert.deepEqual(fr.counts,{never:0,expired:0,stale:0,fresh:0});
});

/* ---------- רשימת העבודה ---------- */

test("classAttention: הסיבה החזקה ביותר היא זו שנרשמת",()=>{
  const at=D.classAttention(rows(),roster(),TESTS,opts());
  const by=id=>at.list.find(x=>x.stud.id===id);
  assert.equal(by("d").reason,"never","לתלמיד שלא נמדד לא מוסיפים «חסרים מבחנים»");
  assert.equal(by("c").reason,"expired");
  assert.equal(by("b").reason,"stale");
});

test("classAttention: תלמיד טרי עם מבחן חסר נכנס בסיבה missing",()=>{
  const at=D.classAttention(rows(),roster(),TESTS,opts());
  const a=at.list.find(x=>x.stud.id==="a");
  assert.equal(a.reason,"missing");
  assert.deepEqual(a.missing,["situp"],"עשתה push ו-r60, לא situp");
});

test("classAttention: הסדר הוא חומרה ואז הוותק",()=>{
  const at=D.classAttention(rows(),roster(),TESTS,opts());
  assert.deepEqual(at.list.map(x=>x.stud.id),["d","c","b","a"]);
});

test("classAttention: בתוך אותה סיבה, המוזנח יותר קודם",()=>{
  const rs=rows().concat([{id:"r9",test:"push",sid:"e",cid:X,cls:"ח1",val:1,d:"2026-08-20"}]);
  const rst=roster().concat([{id:"e",name:"Eli",cid:X}]);
  const at=D.classAttention(rs,rst,TESTS,opts());
  const stale=at.list.filter(x=>x.reason==="stale").map(x=>x.stud.id);
  assert.deepEqual(stale,["b","e"],"‎51‎ יום לפני ‎32‎ יום");
});

test("classAttention: תלמיד שנמדד בכל מבחן ולאחרונה אינו ברשימה",()=>{
  const rs=rows().concat([
    {id:"r10",test:"situp",sid:"a",cid:X,cls:"ח1",val:40,d:"2026-09-19"}
  ]);
  const at=D.classAttention(rs,roster(),TESTS,opts());
  assert.equal(at.list.some(x=>x.stud.id==="a"),false);
});

test("classAttention: אותו קלט נותן תמיד את אותו סדר",()=>{
  const first=D.classAttention(rows(),roster(),TESTS,opts()).list.map(x=>x.stud.id);
  for(let i=0;i<5;i++){
    const again=D.classAttention(rows(),roster().reverse(),TESTS,opts()).list.map(x=>x.stud.id);
    assert.deepEqual(again,first,"סדר הרשימה הנכנסת אינו משנה את הפלט");
  }
});

test("classAttention אינה מייצרת ציון, דירוג או תווית יכולת",()=>{
  const at=D.classAttention(rows(),roster(),TESTS,opts());
  const allowed=["stud","reason","state","last","days","missing","future"];
  at.list.forEach(x=>assert.deepEqual(Object.keys(x).sort(),allowed.slice().sort()));
});

test("classAttention נושאת את הראיה שהובילה לכל שורה",()=>{
  const at=D.classAttention(rows(),roster(),TESTS,opts());
  const c=at.list.find(x=>x.stud.id==="c");
  assert.equal(c.last,"2026-05-02");
  assert.equal(c.days,142,"המלצה שאי אפשר לבדוק גרועה מהיעדר המלצה");
});

test("classAttention על כיתה שכולה טרייה מחזירה רשימה ריקה",()=>{
  const rst=[{id:"a",name:"Alice",cid:X}];
  const rs=[{id:"r1",test:"push",sid:"a",cid:X,cls:"ח1",val:20,d:"2026-09-20"}];
  const at=D.classAttention(rs,rst,TESTS,opts());
  assert.deepEqual(at.list,[]);
  assert.equal(at.counts.fresh,1);
});
