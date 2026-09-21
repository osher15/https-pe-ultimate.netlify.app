"use strict";
/* ארכוב מדידות ושיעורים ישנים.
   ft.results גדלה לנצח ב-localStorage, ששם המכסה קטנה (~5MB —
   ARCHITECTURE_AUDIT.md §5). ls.sessions גדלה עד SESSION_MAX=300
   ואז **גוזרת** בשקט את הישן ביותר — מורה עם הרבה כיתות מגיע לזה
   בתוך שנת לימודים אחת. הבדיקות כאן מכסות את החלק הטהור: מי נבחר
   לארכוב, ואיך מד המקום מתרגם בתים לרמת אזהרה. הכתיבה בפועל
   ל-IndexedDB (RARC/SARC) היא דבר דפדפן בלבד ומכוסה ב-e2e.
   ============================================================ */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const D=require("../../hm-data.js");

/* ---------- resultsBefore ---------- */

test("resultsBefore: רק מדידות עם תאריך שקודם לגבול",()=>{
  const rows=[
    {id:"a",d:"2024-01-01"},
    {id:"b",d:"2025-06-01"},
    {id:"c",d:"2026-01-01"},
    {id:"d"},                 /* בלי תאריך — לא נבחר, לא מנחשים */
  ];
  const move=D.resultsBefore(rows,"2025-09-01");
  assert.deepEqual(move.map(r=>r.id),["a","b"]);
});

test("resultsBefore: קלט ריק או לא מערך מחזיר ריק, לא נופל",()=>{
  assert.deepEqual(D.resultsBefore(null,"2025-01-01"),[]);
  assert.deepEqual(D.resultsBefore(undefined,"2025-01-01"),[]);
  assert.deepEqual(D.resultsBefore([],"2025-01-01"),[]);
});

test("resultsBefore: גבול הוא < ולא <=, תואם למחיקה הקיימת",()=>{
  const rows=[{id:"a",d:"2025-09-01"}];
  assert.deepEqual(D.resultsBefore(rows,"2025-09-01"),[],"אותו יום — לא נכלל");
  assert.deepEqual(D.resultsBefore(rows,"2025-09-02").map(r=>r.id),["a"]);
});

test("resultsBefore: רשומה פגומה (לא אובייקט) מדולגת ולא מפילה",()=>{
  const rows=[null,undefined,"x",42,{id:"a",d:"2024-01-01"}];
  assert.deepEqual(D.resultsBefore(rows,"2025-01-01").map(r=>r.id),["a"]);
});

/* ---------- sessionsBefore ---------- */

test("sessionsBefore: רק שיעורים שהסתיימו ותאריכם קודם לגבול",()=>{
  const S=D.SESSION_DONE, A=D.SESSION_ACTIVE;
  const rows=[
    {id:"a",date:"2024-01-01",status:S},
    {id:"b",date:"2025-06-01",status:S},
    {id:"c",date:"2026-01-01",status:S},
    {id:"d",date:"2024-01-01"},           /* בלי status — לא נבחר */
  ];
  assert.deepEqual(D.sessionsBefore(rows,"2025-09-01").map(r=>r.id),["a","b"]);
});

test("sessionsBefore: שיעור פעיל לא נארכב גם אם התאריך שלו ישן",()=>{
  const rows=[{id:"open",date:"2020-01-01",status:D.SESSION_ACTIVE}];
  assert.deepEqual(D.sessionsBefore(rows,"2026-01-01"),[],
    "שיעור שנשכח פתוח לא נעלם מתחת למורה");
});

test("sessionsBefore: קלט ריק או לא מערך מחזיר ריק, לא נופל",()=>{
  assert.deepEqual(D.sessionsBefore(null,"2025-01-01"),[]);
  assert.deepEqual(D.sessionsBefore(undefined,"2025-01-01"),[]);
  assert.deepEqual(D.sessionsBefore([],"2025-01-01"),[]);
});

test("sessionsBefore: גבול הוא < ולא <=, תואם ל-resultsBefore",()=>{
  const rows=[{id:"a",date:"2025-09-01",status:D.SESSION_DONE}];
  assert.deepEqual(D.sessionsBefore(rows,"2025-09-01"),[],"אותו יום — לא נכלל");
  assert.deepEqual(D.sessionsBefore(rows,"2025-09-02").map(r=>r.id),["a"]);
});

test("sessionsBefore: רשומה פגומה מדולגת ולא מפילה",()=>{
  const rows=[null,undefined,"x",42,{id:"a",date:"2024-01-01",status:D.SESSION_DONE}];
  assert.deepEqual(D.sessionsBefore(rows,"2025-01-01").map(r=>r.id),["a"]);
});

/* ---------- מד מקום ---------- */

test("fmtBytes: יחידה לפי גודל, לא תמיד KB",()=>{
  assert.equal(D.fmtBytes(0),"0B");
  assert.equal(D.fmtBytes(500),"500B");
  assert.equal(D.fmtBytes(1536),"1.5KB");
  assert.equal(D.fmtBytes(3*1024*1024),"3.0MB");
});

test("fmtBytes: קלט לא מספרי נופל ל-0, לא זורק",()=>{
  assert.equal(D.fmtBytes(null),"0B");
  assert.equal(D.fmtBytes(undefined),"0B");
  assert.equal(D.fmtBytes("x"),"0B");
});

test("storageLevel: שלוש רמות לפי אחוז מהמכסה",()=>{
  const q=1000;
  assert.equal(D.storageLevel(100,q).level,"ok");
  assert.equal(D.storageLevel(700,q).level,"warn");
  assert.equal(D.storageLevel(900,q).level,"critical");
});

test("storageLevel: בלי מכסה מפורשת — נופל למכסה הטיפוסית",()=>{
  const lvl=D.storageLevel(D.BYTES_TYPICAL_QUOTA);
  assert.equal(lvl.pct,100);
  assert.equal(lvl.quota,D.BYTES_TYPICAL_QUOTA);
});

test("storageLevel: אחוז מעוגל, ומכסה 0 לא מתפוצצת בחילוק",()=>{
  assert.equal(D.storageLevel(33,100).pct,33);
  assert.equal(D.storageLevel(500,0).pct,0);
});

/* ---------- גיבוי: מקטע הארכיון ---------- */

test("buildSnapshot: מקטע arc נכנס רק כשיש מה להכניס",()=>{
  const withArc=D.buildSnapshot({data:{},arc:[{id:"r1"}]});
  assert.deepEqual(withArc.arc,[{id:"r1"}]);
  const noArc=D.buildSnapshot({data:{}});
  assert.equal("arc" in noArc,false);
});

test("validateBackup: arc חייב להיות מערך אם קיים",()=>{
  const base={app:D.BK_APP,kind:"backup",v:D.BK_V,schema:D.SCHEMA_VERSION,
    at:"2026-09-11T00:00:00.000Z",data:{}};
  assert.equal(D.validateBackup(Object.assign({},base,{arc:[{id:"r1"}]})).ok,true);
  assert.equal(D.validateBackup(Object.assign({},base,{arc:{}})).ok,false);
  assert.ok(D.validateBackup(Object.assign({},base,{arc:"x"})).errors.includes("bad-arc"));
});

test("planRestore: arcCount סופר מדידות בארכיון של הקובץ",()=>{
  const snap={data:{},arc:[{id:"a"},{id:"b"},{id:"c"}]};
  assert.equal(D.planRestore(snap,[]).arcCount,3);
  assert.equal(D.planRestore({data:{}},[]).arcCount,0);
});

/* ---------- גיבוי: מקטע ארכיון השיעורים ---------- */

test("buildSnapshot: מקטע sarc נכנס רק כשיש מה להכניס, בנפרד מ-arc",()=>{
  const withBoth=D.buildSnapshot({data:{},arc:[{id:"r1"}],sarc:[{id:"s1"}]});
  assert.deepEqual(withBoth.arc,[{id:"r1"}]);
  assert.deepEqual(withBoth.sarc,[{id:"s1"}]);
  const neither=D.buildSnapshot({data:{}});
  assert.equal("sarc" in neither,false);
});

test("validateBackup: sarc חייב להיות מערך אם קיים",()=>{
  const base={app:D.BK_APP,kind:"backup",v:D.BK_V,schema:D.SCHEMA_VERSION,
    at:"2026-09-11T00:00:00.000Z",data:{}};
  assert.equal(D.validateBackup(Object.assign({},base,{sarc:[{id:"s1"}]})).ok,true);
  assert.equal(D.validateBackup(Object.assign({},base,{sarc:{}})).ok,false);
  assert.ok(D.validateBackup(Object.assign({},base,{sarc:"x"})).errors.includes("bad-sarc"));
});

test("planRestore: sarcCount סופר שיעורים בארכיון, בנפרד מ-arcCount",()=>{
  const snap={data:{},arc:[{id:"a"}],sarc:[{id:"s1"},{id:"s2"}]};
  const p=D.planRestore(snap,[]);
  assert.equal(p.arcCount,1);
  assert.equal(p.sarcCount,2);
  assert.equal(D.planRestore({data:{}},[]).sarcCount,0);
});
