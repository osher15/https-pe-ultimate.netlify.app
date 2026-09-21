"use strict";
/* ============================================================
   בניית קובץ ספריית הקוריקולום מעמודי Notion שנשמרו
   ------------------------------------------------------------
   שימוש:  node tools/curric-build.js <תיקיית-md> <he|en|...>

   התיקייה מכילה קובץ Markdown לכל עמוד מערך, כפי ש-Notion
   מחזיר אותו, ולצדם `manifest.json` הממפה שם קובץ למזהה העמוד
   ותאריך השליפה. המניפסט הוא מה שהופך את הייבוא לניתן לשחזור:
   בלעדיו אי אפשר לדעת מאיזה עמוד הגיעה רשומה, ומתי.

   הסקריפט אינו רץ בזמן ריצת האפליקציה ואינו יכול לרוץ: לאפליקציה
   אין גישה לרשת בכוונה. הוא כלי פיתוח, והפלט שלו הוא קובץ
   סטטי שנכנס לריפו ונקרא בדיוק כמו hm-plans.js.

   עמוד שהמפענח דחה **אינו נכנס לפלט**, והסיבה מודפסת. בנייה
   שמייצרת פחות רשומות ממספר הקבצים נכשלת בקוד יציאה 1: קובץ
   נתונים שנבנה חלקית בשקט הוא בדיוק סוג הכשל שאיש לא מבחין בו
   עד שמורה פותח מערך ריק באמצע שיעור.
   ============================================================ */
var fs=require("fs"), path=require("path");
var P=require("./curric-parse.js");

function build(dir,lang){
  var manPath=path.join(dir,"manifest.json");
  var man=fs.existsSync(manPath)?JSON.parse(fs.readFileSync(manPath,"utf8")):{};
  var files=fs.readdirSync(dir).filter(function(f){
    return /\.md$/i.test(f)&&new RegExp("-"+lang+"\\.md$","i").test(f); }).sort();
  var out=[], bad=[];
  files.forEach(function(f){
    var md=fs.readFileSync(path.join(dir,f),"utf8");
    var entry=man[f]||{};
    var r=P.parseLesson(md,{src:{page:entry.page||null,
      standard:entry.standard||"V2", checked:entry.checked||null}});
    if(!r.ok){ bad.push({file:f,reason:r.reason,detail:r.detail}); return; }
    out.push(r.lesson);
  });
  return {lessons:out,bad:bad,files:files.length};
}

function emit(lessons,lang){
  var head=
"\"use strict\";\n"+
"/* ============================================================\n"+
"   PE Ultimate — ספריית הקוריקולום, מהדורת "+lang+"\n"+
"   נבנה אוטומטית. אין לערוך ידנית.\n"+
"   מקור: Notion, \"סדרת מערכים לבית הספר\", תקן V2 (20 סעיפים).\n"+
"   לבנייה מחדש:  node tools/curric-build.js <dir> "+lang+"\n"+
"\n"+
"   כל רשומה נושאת status ו-src. הסטטוס נקרא מהעמוד עצמו ואינו\n"+
"   מונח: \"draft\" פירושו שהמערך ממתין לבדיקה מקצועית, לעריכת\n"+
"   שפת־אם ולפיילוט, ואסור להציג אותו כתוכן מאושר.\n"+
"   ============================================================ */\n"+
"window.CURRIC=(window.CURRIC||[]).concat(\n";
  return head+JSON.stringify(lessons,null,1)+"\n);\n";
}

if(require.main===module){
  var dir=process.argv[2], lang=process.argv[3];
  if(!dir||!lang){ console.error("שימוש: node tools/curric-build.js <dir> <lang>"); process.exit(2); }
  var r=build(dir,lang);
  r.bad.forEach(function(b){ console.error("נדחה: "+b.file+" — "+b.reason+" ("+b.detail+")"); });
  if(!r.lessons.length){ console.error("לא נבנתה אף רשומה."); process.exit(1); }
  var file="hm-curric-"+lang+".js";
  fs.writeFileSync(file,emit(r.lessons,lang));
  console.log("נבנה "+file+" — "+r.lessons.length+" מערכים מתוך "+r.files+" קבצים, "+
    Math.round(fs.statSync(file).size/1024)+"KB");
  if(r.bad.length){ console.error(r.bad.length+" עמודים נדחו."); process.exit(1); }
}
module.exports={build:build,emit:emit};
