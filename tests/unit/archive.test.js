"use strict";
/* ארכוב מדידות ישנות.
   ft.results גדלה לנצח ב-localStorage, ששם המכסה קטנה (~5MB —
   ARCHITECTURE_AUDIT.md §5). הבדיקות כאן מכסות את החלק הטהור:
   מי נבחר לארכוב, ואיך מד המקום מתרגם בתים לרמת אזהרה. הכתיבה
   בפועל ל-IndexedDB (RARC) היא דבר דפדפן בלבד ומכוסה ב-e2e.
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
