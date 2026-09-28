"use strict";
/* ============================================================
   תסריט הצילום: לאן המצלמה זזה בכל סצנה מהאפליקציה
   ------------------------------------------------------------
   הזמנים והמיקומים לא כתובים כאן — הם נלקחים מיומן ההקלטה
   (out/<lang>_<scene>.json), ולכן כל שפה מקבלת זום מדויק לאותו
   כפתור גם כשהממשק זז בה מעט.

   shots — לפי הסדר:
     tap:   חלק מהסלקטור של הקשה ביומן (הקשה ראשונה אחרי הצילום הקודם)
     track: סלקטור שנדגם לאורך ההקלטה (או מערך — מסגרים את כולם); after = כמה שניות אחרי הצילום הקודם
     z:     זום (1 = כל המסך)       follow: לעקוב אחרי האלמנט כשהוא נגלל
     lead:  כמה שניות לפני האירוע המצלמה כבר שם (ברירת מחדל 0.3)
   האירוע הראשון הוא העוגן: הוא נופל ברבע הראשון של הקטע.
   push — כשאין הקשות: דחיפה איטית לאורך כל הקטע.
   until — הרגע שחייב להיכנס לקטע (at / tap / track / tap:"last"), ועוד post שניות.
     אם הקטע קצר מדי, מראים את התוצאה בקצב טבעי ומוותרים על ההתחלה
     (הרצה קדימה רק עד ×1.15). בין שתי תנועות מצלמה עוברות לפחות 1.2 שנ׳.
   ============================================================ */
const SHOTS={
  /* מערך: המצלמה נוסעת אל המערך שנבנה ועוקבת אחריו בגלילה */
  lesson:{until:{track:"#ls-planBody",post:1.6}, shots:[
    {track:"#ls-planBody", after:0.3, z:1.35, follow:true}]},
  /* שיעור חי: השעון והשלב הנוכחי */
  live:{until:{tap:"#ls-startLesson",post:1.4}, shots:[
    {track:["#lv-clk","#lv-phase"], after:0.9, z:1.4, follow:true}]},
  /* פוטו־פיניש: מסלול + שעון יחד; הרצים חוצים את הקו ב-4.0–5.5 שנ׳ בהקלטה */
  pf:{until:{at:5.4,post:0.6}, shots:[
    {track:["#pf-stage","#pf-clock"], z:1.15, lead:0},
    {track:"#pf-chips", after:0.2, z:1.4, follow:true}]},
  /* ביפ טסט: לוח התוצאות, ואז «שמור לכיתה» והודעת האישור */
  beep:{until:{tap:"#bt-toFt",post:1.3}, shots:[
    {track:"#bt-tbl", after:3.0, z:1.3},
    {tap:"#bt-toFt", z:1.5}]},
  /* הזנת תוצאות: זום אחד על הרשימה, בלי לקפוץ משורה לשורה */
  test:{until:{tap:"last",post:0.7}, shots:[
    {tap:"data-val", z:1.45, lead:0.5}]},
  join:{until:{tap:"#ask-ok",post:1.0}, shots:[
    {tap:".ask-checks", z:1.5, lead:0.6},
    {track:"#ft-clsName", after:0.8, z:1.6}]},
  att:{until:{tap:"#tl-attAll",post:1.2}, shots:[
    {tap:"#tl-attAll", z:1.6, lead:0.5},
    {track:"#tl-attList", after:1.2, z:1.25, follow:true}]},
  player:{until:{tap:"[data-card]",post:1.4}, shots:[
    {track:"#ft-cardBody", after:0.2, z:1.3, follow:true}]},
  hub:{start:0.8, shots:[], push:{z:1.1, dy:30}}
};

/* הפתיח (קטע Gemini A, 1080×1920 אחרי חיתוך).
   look: השנייה בקטע שבה המורה מסתכלת למצלמה. ההקפאה («זו אני. כל שיעור.»)
   נופלת בדיוק על הפריים הזה, ולכן הקטע מתחיל מ-look פחות זמן ההקפאה.
   בועות: side/x = מרחק מהקצה (בועה ארוכה לא נחתכת); tail = לאן הזנב מצביע.
   face: נקודת הזום בהקפאה (הפנים בפריים של look) */
const HOOK={
  look:4.4,
  bubbles:[{side:"right",x:30,y:300,tail:"br",at:0.35},{side:"left",x:30,y:400,tail:"bl",at:1.0},{side:"left",x:300,y:150,tail:"b",at:1.65}],
  face:{x:430,y:620,z:1.35}
};
/* הרגע הרגוע (Gemini B): from = מאיפה בקטע מתחילים — מהרגע שהמורה
   מחייכת למצלמה והתלמיד מניף אגרופים */
const CALM={from:2.9};

/* אפקטים קוליים — Mixkit Sound Effects Free License, דרך video-shotcraft
   (assets/audio/ATTRIBUTION.md שם מתעד את המקור של כל קובץ) */
const SFX={
  pop:"ui/ui-message-pop.mp3",
  scratch:"film/vinyl-scratch-small.mp3",
  stamp:"impact/bass-hit-short.mp3",
  typing:"text/typewriter-digital.mp3",
  crumple:"paper/paper-crumple-quick.mp3",
  slam:"impact/impact-zoom-quick.mp3",
  needle:"film/vinyl-needle-drop.mp3",
  whoosh:"transition/swoosh-quick.mp3",
  tap:"ui/ui-select-click.mp3",
  sparkle:"light/shimmer-sparkle-sweep.mp3",
  chime:"ui/chime-crystal.mp3",
  logo:"light/sparkle-poof-hit.mp3"
};
/* מוזיקה: «House Vibez» (Lily J), Mixkit Stock Music Free License */
const BGM={file:"house-vibez.mp3", vol:0.11, endVol:0.3};

module.exports={SHOTS,HOOK,CALM,SFX,BGM};
