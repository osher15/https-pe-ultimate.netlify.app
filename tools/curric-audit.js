"use strict";
/* ============================================================
   ביקורת תוכן לספריית הקוריקולום
   ------------------------------------------------------------
   שימוש:  node tools/curric-audit.js hm-curric-he.js [...]

   בקרת האיכות שרצה ב-Notion בדקה **מבנה**: שכל 20 הסעיפים
   קיימים, שהזמנים מסתכמים ב-45 דקות, שיש לפחות חמישה דגשי
   בטיחות. היא מצאה 300/300 תקינים, והיא צודקת — אף עמוד אינו
   קטוע.

   מה שבדיקת מבנה אינה יכולה לראות הוא אם הסעיף **מתאים למערך
   הזה**. סעיף "טעויות נפוצות" עם שישה פריטים עובר את הבדיקה גם
   כשהוא מעתיק מילה במילה את הטעויות של המערך הקודם, ואז השיעור
   על עצירה מבוקרת מזהיר מפני טעויות כדרור.

   לכן הביקורת כאן מודדת דבר אחד שהמבנה מחמיץ: **חפיפה**. כמה
   מכל מערך זהה בית-בית למערך אחר באותו ענף ובאותה שפה. חפיפה
   אינה באג בפני עצמה — חלק מהסעיפים (בטיחות, ארגון) אמורים
   לחזור על עצמם — אבל חפיפה בסעיפים שאמורים להיות ייחודיים
   (מטרות נצפות, טעויות, הערכה) היא ממצא שדורש עין של מורה.
   ============================================================ */
var fs=require("fs");
var D=require("../hm-data.js");

/* הסעיפים שאמורים להיות ייחודיים למערך. חזרה בהם היא ממצא;
   חזרה בסעיפי בטיחות או ארגון אינה. */
var UNIQUE={3:"מטרות למידה נצפות",9:"מהלך השיעור",10:"טעויות נפוצות",
            13:"הערכה",18:"תקציר למורה",19:"ערך פדגוגי"};

function load(files){
  global.window={};
  files.forEach(function(f){ eval(fs.readFileSync(f,"utf8")); });
  return global.window.CURRIC||[];
}

function overlap(list){
  var byGroup={};
  list.forEach(function(L){
    var k=L.sport+"|"+L.lang;
    (byGroup[k]=byGroup[k]||[]).push(L);
  });
  var rows=[];
  Object.keys(byGroup).sort().forEach(function(k){
    var g=byGroup[k];
    g.forEach(function(L){
      var dupTotal=0, total=0, dupUnique=[];
      (L.sections||[]).forEach(function(s){
        var bytes=Buffer.byteLength(s.md,"utf8"); total+=bytes;
        var twin=g.some(function(O){
          return O!==L&&(O.sections||[]).some(function(t){
            return t.n===s.n&&t.md===s.md; }); });
        if(twin){ dupTotal+=bytes; if(UNIQUE[s.n])dupUnique.push(s.n); }
      });
      rows.push({code:L.code,lang:L.lang,sport:L.sport,
        pct:total?Math.round(dupTotal/total*100):0,
        sharedUnique:dupUnique});
    });
  });
  return rows;
}

if(require.main===module){
  var files=process.argv.slice(2);
  if(!files.length){ console.error("שימוש: node tools/curric-audit.js <קבצי ספרייה>"); process.exit(2); }
  var list=load(files);
  console.log("רשומות: "+list.length);

  var v=D.curricValidate(list);
  console.log("\n— שלמות המבנה —");
  if(v.ok)console.log("אין ממצאים.");
  else v.issues.forEach(function(i){ console.log("  "+i.kind+": "+JSON.stringify(i)); });

  console.log("\n— חפיפה בין מערכים באותו ענף —");
  var rows=overlap(list), flagged=0;
  rows.forEach(function(r){
    var mark=r.sharedUnique.length?"  ⚠":"   ";
    if(r.sharedUnique.length)flagged++;
    console.log(mark+" "+r.code+" ["+r.lang+"] "+String(r.pct).padStart(3)+"% זהה"+
      (r.sharedUnique.length?"  — כולל סעיפים ייחודיים: "+
        r.sharedUnique.map(function(n){ return n+" ("+UNIQUE[n]+")"; }).join(", "):""));
  });
  console.log("\n"+flagged+" מתוך "+rows.length+" מערכים חולקים סעיף שאמור להיות ייחודי.");
}
module.exports={load:load,overlap:overlap,UNIQUE:UNIQUE};
