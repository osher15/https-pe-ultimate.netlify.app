"use strict";
/* ביקורת 2026-09-29 — חוזי הנתונים שמאחורי שלושת הליקויים:
   1. «התלמידים שלי» נפל על רשומה בלי tests (ההדגמה) — normalizeStudents.
   2. «קבוצות מהנוכחים» כלל נעדר — attendanceMarkOn / splitByAttendance.
   3. ציון חלקי סומן «סופי» — gradeResult, והמילוי מתוחם לתאריכי התקופה. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const D=require("../../hm-data.js");
const {memStore}=require("../helpers/memstore.js");

const T3="c:ט:3", T4="c:ט:4";
const store=()=>memStore({"ft.classes":{
  [T3]:{id:T3,name:"ט׳3",grade:"ט",num:3,key:"ט3"},
  [T4]:{id:T4,name:"ט׳4",grade:"ט",num:4,key:"ט4"}}});

/* ============ 1. צורת רשומת תלמיד ============ */

test("1.1 רשומת ההדגמה (בלי tests/h/w) מקבלת ברירות מחדל ריקות — ושום ערך קיים לא משתנה",()=>{
  const raw=[{id:"demo0",name:"דן אבירם",cls:"ט׳3",cid:T3,sex:"boys"}];
  const {list,bad}=D.normalizeStudents(raw);
  assert.equal(bad.length,0);
  assert.deepEqual(list[0],{id:"demo0",name:"דן אבירם",cls:"ט׳3",cid:T3,sex:"boys",tests:[],h:null,w:null});
  assert.equal(raw[0].tests,undefined,"הקלט לא שונה במקום");
});

test("1.2 רשומה תקינה עוברת כמו שהיא, כולל שדות לא מוכרים (grades)",()=>{
  const s={id:"s1",name:"נועה",cls:"ט׳3",cid:T3,sex:"girls",age:15,h:160,w:50,
    tests:[{d:"2026-09-01",dist:900}],grades:{"רבעון 1":{part:0}}};
  assert.deepEqual(D.normalizeStudent(s),s);
});

test("1.3 רשומות פגומות לא מפילות את הרשימה ולא נעלמות — הן חוזרות ב-bad",()=>{
  const raw=[null,"טקסט",42,[1,2],{id:"ok",name:"תקין"},{id:"n"}];
  const {list,bad}=D.normalizeStudents(raw);
  assert.deepEqual(list.map(s=>s.id),["ok","n"]);
  assert.equal(list[1].name,"","שם חסר הוא מחרוזת ריקה — s.name.includes לא נופל");
  assert.deepEqual(bad,[null,"טקסט",42,[1,2]]);
});

test("1.4 tests שאינו מערך, או עם פריטים פגומים — מסונן למערך של אובייקטים",()=>{
  assert.deepEqual(D.normalizeStudent({id:"a",tests:"x"}).tests,[]);
  assert.deepEqual(D.normalizeStudent({id:"a",tests:[null,{dist:5},3]}).tests,[{dist:5}]);
});

test("1.5 אותה כיתה, אותן זהויות: studentsIn מעל רשימה מנורמלת מחזיר את כל שמונת תלמידי ההדגמה",()=>{
  const st=store();
  const raw=Array.from({length:8},(_,i)=>({id:"demo"+i,name:"ת"+i,cls:"ט׳3",cid:T3,sex:"boys"}));
  const {list}=D.normalizeStudents(raw);
  assert.deepEqual(D.studentsIn(st,T3,list).map(s=>s.id),raw.map(s=>s.id));
});

test("1.6 רשימה שאינה מערך — ריקה, לא חריגה",()=>{
  assert.deepEqual(D.normalizeStudents(null),{list:[],bad:[]});
  assert.deepEqual(D.normalizeStudents({a:1}),{list:[],bad:[]});
});

/* ============ 2. מי נוכח היום ============ */

const DAY="2026-09-29";
const kids=()=>Array.from({length:8},(_,i)=>({id:"demo"+i,name:"ת"+i,cls:"ט׳3",cid:T3}));

test("2.1 שבעה נוכחים ונעדר אחד — הנעדר לא בין המשתתפים",()=>{
  const att={[DAY+"|ט׳3"]:{demo0:"a",demo1:"p",demo2:"p",demo3:"p",demo4:"p",demo5:"p",demo6:"p",demo7:"p"}};
  const sp=D.splitByAttendance(kids(),att,store(),DAY);
  assert.equal(sp.present.length,7);
  assert.deepEqual(sp.absent.map(s=>s.id),["demo0"]);
  assert.ok(!sp.present.some(s=>s.id==="demo0"));
});

test("2.2 חלקית משתתפת (ונספרת), פטור ולא-מסומן אינם נחשבים נוכחים",()=>{
  const att={[DAY+"|ט3"]:{demo0:"h",demo1:"e",demo2:"p"}};   /* תווית בלי גרש — אותה כיתה */
  const sp=D.splitByAttendance(kids(),att,store(),DAY);
  assert.deepEqual(sp.present.map(s=>s.id),["demo0","demo2"]);
  assert.equal(sp.partial,1);
  assert.deepEqual(sp.exempt.map(s=>s.id),["demo1"]);
  assert.equal(sp.unmarked.length,5,"מי שלא סומן לא מוכרז נוכח בשקט");
  assert.equal(sp.marked,3);
});

test("2.3 אין דליפה בין תאריכים ובין כיתות",()=>{
  const att={
    "2026-09-28|ט׳3":{demo0:"p"},             /* אתמול */
    [DAY+"|ט׳4"]:{demo0:"p"}                  /* אותו sid תחת כיתה אחרת */
  };
  const sp=D.splitByAttendance(kids(),att,store(),DAY);
  assert.equal(sp.present.length,0);
  assert.equal(sp.unmarked.length,8);
});

test("2.4 סימון בכיתה גובר על סימון תחת «כל הכיתות»; «all» משמש רק כשאין אחר",()=>{
  const st=store();
  const att={[DAY+"|all"]:{demo0:"p",demo1:"p"},[DAY+"|ט׳3"]:{demo0:"a"}};
  assert.equal(D.attendanceMarkOn(att,st,kids()[0],DAY),"a");
  assert.equal(D.attendanceMarkOn(att,st,kids()[1],DAY),"p");
});

test("2.5 שינוי נוכחות משתקף בחישוב הבא",()=>{
  const att={[DAY+"|ט׳3"]:{demo0:"p"}};
  assert.equal(D.splitByAttendance(kids(),att,store(),DAY).present.length,1);
  att[DAY+"|ט׳3"].demo0="a";
  assert.equal(D.splitByAttendance(kids(),att,store(),DAY).present.length,0);
});

/* ============ 3. ציון זמני או סופי ============ */

const W={part:70,exams:8,improve:11,team:11,know:0,bonusMax:10};

test("3.1 רק השתתפות מולאה — 70 הוא ציון זמני, לא סופי, עם רשימת החסרים",()=>{
  const r=D.gradeResult({part:100},W,[]);
  assert.equal(r.value,70);
  assert.equal(r.final,null);
  assert.equal(r.complete,false);
  assert.equal(r.status,D.GRADE_PROV);
  assert.deepEqual(r.missing,["exams","improve","team"]);
});

test("3.2 הנעדר שקיבל 0 מהנוכחות — 0 תקין, אבל עדיין זמני",()=>{
  const r=D.gradeResult({part:0},W,[]);
  assert.equal(r.value,0);
  assert.equal(r.status,D.GRADE_PROV);
});

test("3.3 אפסים תקינים בכל הרכיבים — ציון סופי 0, לא «חסר»",()=>{
  const r=D.gradeResult({part:0,improve:0,team:0,exams:{"מבחן 1":0}},W,["מבחן 1"]);
  assert.equal(r.complete,true);
  assert.equal(r.final,0);
  assert.deepEqual(r.missing,[]);
});

test("3.4 רכיב במשקל 0 אינו מונע ציון סופי",()=>{
  const r=D.gradeResult({part:90,improve:80,team:70,exams:{a:60}},W,["a"]);
  assert.equal(r.complete,true);
  assert.equal(r.final,Math.round((90*.7+60*.08+80*.11+70*.11)*10)/10);
});

test("3.5 הנוסחה לא השתנתה: אותו ערך מספרי כמו קודם, בונוס עד התקרה, עד 100",()=>{
  const g={part:100,improve:100,team:100,exams:{a:100},bonus:25};
  const r=D.gradeResult(g,W,["a"]);
  assert.equal(r.bonus,10);
  assert.equal(r.value,100);
  assert.equal(D.gradeResult({part:50,bonus:5},W,[]).value,40);
});

test("3.6 בונוס בלבד אינו הופך ציון לסופי; ריק לגמרי — empty",()=>{
  assert.equal(D.gradeResult({bonus:5},W,[]).status,D.GRADE_PROV);
  assert.equal(D.gradeResult({},W,[]).status,D.GRADE_EMPTY);
  assert.equal(D.gradeResult({part:""},W,[]).status,D.GRADE_EMPTY,"שדה ריק אינו 0");
});

test("3.7 מבחנים במשקל חיובי בלי אף עמודת מבחן — חסר, לא אפס שקט",()=>{
  const r=D.gradeResult({part:100,improve:100,team:100},W,[]);
  assert.deepEqual(r.missing,["exams"]);
  assert.equal(r.final,null);
});

test("3.8 נוכחות לפי טווח התקופה: נוכחות ישנה לא נכנסת לתקופה חדשה",()=>{
  const st=store(), s={id:"demo0",cid:T3};
  const att={"2026-01-10|ט׳3":{demo0:"a"},"2026-01-17|ט׳3":{demo0:"a"},
             "2026-09-22|ט׳3":{demo0:"p"},"2026-09-29|ט׳3":{demo0:"p"}};
  assert.equal(D.attendanceRateOf(att,s,st,{cid:T3}).pct,50,"בלי טווח — הכול, כמו קודם");
  assert.deepEqual(D.attendanceRateOf(att,s,st,{cid:T3,from:"2026-09-01",to:"2026-12-31"}),
    {days:2,p:2,h:0,a:0,e:0,pct:100});
  assert.equal(D.attendanceRateOf(att,s,st,{cid:T3,from:"2026-02-01",to:"2026-08-31"}),null,
    "אין נוכחות בטווח — null, לא 0");
});

/* ============ 6. ציוד זמין הוא אילוץ ============ */

test("6.1 פריט שלא סומן כזמין נחסם; חלופה («/») ודוגמה בסוגריים אינן דרישה",()=>{
  const un=["מזרנים","חישוקים","רשת","חבל","רמקול","וסטים"];
  assert.deepEqual(D.equipConflicts("קונוסים, כדורים, חישוקים",un),["חישוקים"]);
  assert.deepEqual(D.equipConflicts("קונוסים / חישוקים",un),[]);
  assert.deepEqual(D.equipConflicts("2 חפצים כ״דגל״ (סרט, חולצה, קונוס)",un),[]);
  assert.deepEqual(D.equipConflicts("רשת + כדור עף או כדור גומי",un),["רשת"]);
  assert.deepEqual(D.equipConflicts("אין",un),[]);
  assert.deepEqual(D.equipConflicts("קונוסים, כדורים, חישוקים",[]),[],"הכול זמין — אין התנגשות");
});

test("6.2 רשימת הציוד מאוחדת בלי כפילויות",()=>{
  assert.deepEqual(D.mergeEquip(["קונוסים","שעון עצר"],["קונוסים"," כדורים",""]),["קונוסים","שעון עצר","כדורים"]);
  assert.deepEqual(D.equipParts("חישוקים (״קנים״), כדורי ספוג/עצמים קטנים"),["חישוקים","כדורי ספוג/עצמים קטנים"]);
});

/* ============ 7. כיתות באותה שעה ============ */

test("7.1 בדוגמה, י״ב1 + י״ב2 הן משבצת קבוצה אחת — וכל כיתה נשארת כיתה",()=>{
  const at=D.sampleSlots().filter(s=>s.day===2&&s.time==="12:35");
  assert.equal(at.length,1);
  assert.ok(D.isGroupId(at[0].cid));
  assert.deepEqual(at[0].members,[D.classId("י״ב1"),D.classId("י״ב2")]);
  const st=memStore({});
  const g=D.makeGroup(st,{id:at[0].cid,name:at[0].clsSnapshot,members:at[0].members});
  assert.equal(g.ok,true);
  assert.deepEqual(D.expandCid(st,at[0].cid).sort(),at[0].members.slice().sort());
});

test("7.2 שתי משבצות נפרדות באותה שעה — «התנגשות», לא «הבא» ועוד «בהמשך»",()=>{
  const sl=(id,cid,time)=>({slot:{id,day:2,time,cid},startable:true,status:"planned",now:false});
  const rows=[sl("a","c:יב:1","12:35"),sl("b","c:יב:2","12:35"),sl("c","c:יב:3","14:10")];
  const d=D.splitDay(rows,12*60);
  assert.equal(d.next.slot.id,"a");
  assert.deepEqual(d.clash.map(r=>r.slot.id),["b"]);
  assert.deepEqual(d.later.map(r=>r.slot.id),["c"]);
});

test("7.3 בלי התנגשות — אותה חלוקה כמו קודם",()=>{
  const sl=(id,time)=>({slot:{id,day:2,time,cid:"c:ז:"+id},startable:true,status:"planned",now:false});
  const d=D.splitDay([sl("1","09:00"),sl("2","10:00")],8*60);
  assert.equal(d.next.slot.id,"1"); assert.deepEqual(d.later.map(r=>r.slot.id),["2"]); assert.deepEqual(d.clash,[]);
});

/* ============ 4. חיפוש רב־לשוני ============ */

test("4.1 קיפול לחיפוש: רישיות, הטעמה, ניקוד ותשכיל, ё — בלי לשנות את המקור",()=>{
  assert.ok(D.searchMatch("Capture the flag","capture"));
  assert.ok(D.searchMatch("Capture the flag","FLAG capt"),"כל המילים, בכל סדר");
  assert.ok(D.searchMatch("Robar la bandera","bandéra"));
  assert.ok(D.searchMatch("Захват флага","захват"));
  assert.ok(D.searchMatch("Ёлка","елка"));
  assert.ok(D.searchMatch("سَرِقَة العلم","سرقة"));
  assert.ok(D.searchMatch("תופסת דגלים","דגל"));
  assert.ok(!D.searchMatch("Capture the flag","bandera"));
  assert.ok(D.searchMatch("anything",""),"שאילתה ריקה — הכול");
});

/* ============ 9. המשך מומלץ לפי סוג הנושא ============ */

const doneSes=(o)=>[Object.assign({id:"s1",cid:"c:ט:3",date:"2026-09-20",status:D.SESSION_DONE,
  startedAt:1,endedAt:2,rating:0},o)];

test("9.1 שיעור אירובי «בינוני» — שלבי כושר, לא «תרגול בזוגות → משחק 3 נגד 3»",()=>{
  const r=D.nextLesson(doneSes({planTitle:"אירובי — בניית בסיס",planGroup:"כושר גופני"}),{cid:"c:ט:3"});
  assert.equal(r.family,"fit");
  r.steps.forEach(s=>assert.ok(D.LADDERS.fit.includes(s),s));
  assert.ok(!r.steps.some(s=>/3 נגד 3|משחק מלא/.test(s)));
  assert.ok(r.why.some(w=>/השיעור כולו/.test(w)),"לא מסיקים שליטה אישית ממשוב על השיעור");
});

test("9.2 שיעור ישן בלי planGroup: הסוג מהכותרת; כדורסל — סולם הכדור, כמו קודם",()=>{
  assert.equal(D.nextLesson(doneSes({planTitle:"אירובי — בניית בסיס"}),{cid:"c:ט:3"}).family,"fit");
  const b=D.nextLesson(doneSes({planTitle:"כדורסל"}),{cid:"c:ט:3"});
  assert.equal(b.family,"ball"); assert.equal(b.steps[0],D.LADDER[0]);
  assert.equal(D.ladderFamily("כושר גופני · בונה ידני",""),"fit");
});

test("9.3 סוג לא ידוע — הצעה צנועה של חזרה עם התאמה, לא שלב בסולם",()=>{
  const r=D.nextLesson(doneSes({planTitle:"שיעור מיוחד",rating:1}),{cid:"c:ט:3"});
  assert.equal(r.family,null);
  assert.deepEqual(r.steps,D.GENERIC_STEPS.up);
  assert.ok(r.why.some(w=>/אין מספיק פרטים/.test(w)));
});

test("9.4 createSession שומר planGroup (תוספתי) — שיעור בלעדיו נשאר תקין",()=>{
  const a=D.createSession([],{cid:"c:ט:3",planTitle:"x",planGroup:"כושר גופני"}).session;
  assert.equal(a.planGroup,"כושר גופני");
  assert.equal(D.createSession([],{cid:"c:ט:3"}).session.planGroup,"");
});
