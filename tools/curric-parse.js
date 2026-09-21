"use strict";
/* ============================================================
   מפענח עמוד מערך מ-Notion → רשומה בסכמת הקוריקולום
   ------------------------------------------------------------
   התקן ("תקן כתיבת מערך מלא, גרסה 2") מחייב 20 סעיפים ממוספרים
   בכל אחת מחמש השפות. המפענח נשען על **המספור ועל קוד המערך**
   ולא על תוויות טקסט — "קוד מערך", "Lesson code", "رمز الدرس"
   ו-"Código" הם אותו שדה, ומיפוי תוויות לכל שפה היה נשבר בכל
   פעם שמישהו מנסח מחדש כותרת.

   שני עוגנים בלבד:
   1. `# N. כותרת` — גבול סעיף. המספר הוא הזהות, לא הכותרת.
   2. `BB-01-HE` — קוד המערך. הוא מקודד ענף, מספר ושפה בבת אחת,
      והוא היחיד שחייב להיות זהה בכל השפות.

   הכלל המרכזי: **המפענח לא מנחש.** עמוד שחסר בו סעיף, שקודו לא
   נפרס או שתחילית הענף שלו אינה מוכרת — נדחה עם סיבה מפורשת
   ואינו נכנס לפלט. עמוד פגום שנכנס בשקט לספרייה גרוע בהרבה
   מעמוד שלא נכנס: מורה שמקבל מערך קטוע באמצע שיעור אינו יכול
   לדעת שמשהו השתבש.
   ============================================================ */

/* תחילית קוד → מזהה ענף יציב. המזהה אינו שם התצוגה: שם מוצג
   משתנה בין חמש שפות, המזהה לא משתנה לעולם. */
var SPORTS={BB:"basketball",FB:"football",HB:"handball",
            VB:"volleyball",AT:"athletics",FIT:"fitness"};
var LANGS={HE:"he",EN:"en",RU:"ru",AR:"ar",ES:"es"};
var SECTIONS=20;

function fail(reason,detail){ return {ok:false,reason:reason,detail:detail||""}; }

/* פיצול לסעיפים לפי `# N. כותרת`. מחזיר מפה ממספר לסעיף, כדי
   שסדר הופעה משובש לא ישנה את הפירוש. */
function splitSections(md){
  var lines=String(md||"").split(/\r?\n/);
  var out={}, cur=null, i, m;
  for(i=0;i<lines.length;i++){
    m=/^#\s+(\d{1,2})\.\s*(.+?)\s*$/.exec(lines[i]);
    if(m){ cur={n:+m[1],title:m[2],body:[]}; out[cur.n]=cur; continue; }
    if(cur)cur.body.push(lines[i]);
  }
  Object.keys(out).forEach(function(k){
    out[k].md=out[k].body.join("\n").replace(/^\n+|\n+$/g,"");
    delete out[k].body;
  });
  return out;
}

/* כל הערכים המודגשים של סעיף, לפי סדר הופעה. `**תווית:** ערך`
   → הערך. הסדר הוא מה שנושא את המשמעות, ולכן התווית נזרקת.

   הסריקה אינה מוגבלת לתחילת שורה, וזה מכוון: התקן מרשה כמה
   שדות על שורה אחת ("**ענף:** כדורסל. **גיל:** 9–11.") וקריאה
   של שדה ראשון בלבד בכל שורה הייתה בולעת את השאר לתוך הערך
   ומזיזה את כל האינדקסים שאחריו. הערך נמשך עד ההדגשה הבאה או
   עד סוף השורה. */
function boldValues(md){
  var out=[], re=/\*\*([^*\n]+?):\*\*[ \t]*([^*\n]*)/g, m;
  while((m=re.exec(String(md||""))))out.push(m[2].trim());
  return out;
}

/* פריטי רשימה של סעיף (`- ...`), בלי הדגשות. */
function bullets(md){
  return String(md||"").split(/\r?\n/)
    .filter(function(l){ return /^[-*]\s+/.test(l); })
    .map(function(l){ return l.replace(/^[-*]\s+/,"").trim(); });
}

/* רשימה מופרדת בפסיקים מתוך ערך שדה, בלי פריטים ריקים. */
function commaList(s){
  return String(s||"").replace(/[.\s]+$/,"")
    .split(/[,،;]/).map(function(x){ return x.trim(); })
    .filter(function(x){ return x.length>0; });
}

/* טווח מספרים: "9–11", "9-11", "20–30". מקף עברי ומקף רגיל. */
function range(s){
  var m=/(\d+)\s*[–—\-]\s*(\d+)/.exec(String(s||""));
  if(m)return {from:+m[1],to:+m[2]};
  var one=/(\d+)/.exec(String(s||""));
  return one?{from:+one[1],to:+one[1]}:null;
}

/* הקוד הראשון שנראה כקוד מערך בתוך מחרוזת, או null. */
function codeIn(s){
  var m=/\b([A-Z]{2,3})-(\d{2})\b/.exec(String(s||""));
  return m?(m[1]+"-"+m[2]):null;
}

function parseLesson(md,opts){
  opts=opts||{};
  var sec=splitSections(md), i;
  for(i=1;i<=SECTIONS;i++) if(!sec[i])return fail("missing-section","סעיף "+i);

  /* הקוד הוא העוגן. הוא חייב להיפרס לפני כל שדה אחר. */
  var cm=/\b([A-Z]{2,3})-(\d{2})-([A-Z]{2})\b/.exec(sec[1].md);
  if(!cm)return fail("no-code","סעיף 1 בלי קוד מערך");
  var sport=SPORTS[cm[1]], lang=LANGS[cm[3]];
  if(!sport)return fail("unknown-sport",cm[1]);
  if(!lang)return fail("unknown-lang",cm[3]);

  /* סעיף 1 — אחת-עשרה שורות מודגשות, לפי הסדר שהתקן קובע.
     ספירה שונה פירושה שהתקן השתנה או שהעמוד קטוע: נעצרים. */
  var id=boldValues(sec[1].md);
  if(id.length<11)return fail("short-identity",id.length+" שדות מתוך 11");

  var age=range(id[4]), mins=/(\d+)/.exec(id[6]);
  if(!age)return fail("bad-age",id[4]);
  if(!mins)return fail("bad-duration",id[6]);

  /* סעיף 5 — קודם / נוכחי / הבא, לפי מיקום. שורת "נוכחי" נושאת
     את מטרת העל ולא קוד, ולכן אינה נקראת כאן. */
  var path=boldValues(sec[5].md);
  var prev=path.length>0?codeIn(path[0]):null;
  var next=path.length>2?codeIn(path[2]):null;
  var self=cm[1]+"-"+cm[2];
  if(prev===self)prev=null;
  if(next===self)next=null;

  /* סעיף 16 — חיבור למאגר. שורה 1 תגיות, שורה 5 מיומנויות,
     שורה 8 מילות מפתח (השורות שביניהן הן ענף/גיל/ציוד ועומס,
     שכבר נקראו מסעיף 1 ומסעיף 17). */
  var link=boldValues(sec[16].md);
  var tags=commaList(link[0]);
  var skills=link.length>4?commaList(link[4]):[];
  var keywords=link.length>7?commaList(link[7]):[];

  /* סעיף 17 — ארבעה מדדי עומס, לפי הסדר. */
  var load=boldValues(sec[17].md);
  if(load.length<4)return fail("short-load",load.length+" מתוך 4");

  /* סעיף 20 — הסטטוס הוא השורה המודגשת האחרונה. כל עוד הוא
     מכיל את מילת הטיוטה של אחת מחמש השפות, הרשומה היא טיוטה.
     בהיעדר התאמה מסומן "unknown" ולא "approved": ברירת מחדל
     שמקדמת מערך למאושר היא בדיוק הניחוש שאסור כאן. */
  var qa=boldValues(sec[20].md);
  var statusLine=qa.length?qa[qa.length-1]:"";
  var status=/טיוט|draft|чернов|مسودة|borrador/i.test(statusLine)?"draft":"unknown";

  return {ok:true,lesson:{
    code:self, lang:lang, sport:sport, n:+cm[2],
    title:id[0], subtopic:id[3],
    ageFrom:age.from, ageTo:age.to, level:id[5], minutes:+mins[1],
    students:id[7], equipment:id[8], space:id[9], complexity:id[10],
    prev:prev, next:next,
    tags:tags, skills:skills, keywords:keywords,
    load:{physical:load[0],cognitive:load[1],org:load[2],autonomy:load[3]},
    summary:bullets(sec[18].md),
    status:status, statusNote:statusLine,
    src:opts.src||null,
    sections:Object.keys(sec).map(Number).sort(function(a,b){ return a-b; })
      .map(function(n){ return {n:n,title:sec[n].title,md:sec[n].md}; })
  }};
}

module.exports={parseLesson:parseLesson,splitSections:splitSections,
  boldValues:boldValues,bullets:bullets,commaList:commaList,
  range:range,codeIn:codeIn,SPORTS:SPORTS,LANGS:LANGS,SECTIONS:SECTIONS};
