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
   until — הרגע שחייב להיכנס לקטע (tap / track / tap:"last"), ועוד post שניות;
     אם הקטע קצר מדי — ההקלטה מורצת מהר יותר (עד ×2.4).
   ============================================================ */
const SHOTS={
  lesson:{until:{track:"#ls-planBody",post:1.6}, shots:[
    {tap:"#ls-gen", z:1.9},
    {track:"#ls-planBody", after:0.6, z:1.35, follow:true, move:0.7}]},
  live:{until:{tap:"#ls-startLesson",post:1.0}, shots:[
    {tap:"#ls-startLesson", z:2.0},
    {track:"#lv-phase", after:0.6, z:1.55, follow:true, move:0.7}]},
  pf:{until:{track:"#pf-chips",post:0.9}, shots:[
    {tap:"#pf-gun", z:1.7},
    {track:["#pf-stage","#pf-clock"], after:0.45, z:1.15, move:0.5},
    {track:"#pf-chips", after:0.2, z:1.45, follow:true}]},
  beep:{until:{tap:"#bt-toFt",post:1.0}, shots:[
    {tap:"#bt-startBtn", z:1.8},
    {track:"#bt-lvlBar", after:0.5, z:1.45},
    {tap:"#bt-startBtn", z:1.6, lead:0.2},
    {tap:"#bt-toFt", z:1.8}]},
  test:{until:{tap:"last",post:0.7}, shots:[
    {tap:"data-val", z:1.75},
    {tap:"data-val", z:1.75, move:0.35, lead:0.15},
    {tap:"data-val", z:1.75, move:0.35, lead:0.15},
    {tap:"data-val", z:1.75, move:0.35, lead:0.15}]},
  join:{until:{tap:"#ask-ok",post:1.0}, shots:[
    {tap:"[data-join]", z:1.8},
    {tap:".ask-checks", z:1.7},
    {tap:"#ask-ok", z:1.7},
    {track:"#ft-clsName", after:0.6, z:1.7}]},
  att:{until:{tap:"#tl-attAll",post:1.2}, shots:[
    {tap:"#tl-attAll", z:1.9},
    {track:"#tl-attList", after:0.5, z:1.25, follow:true}]},
  player:{until:{tap:"[data-card]",post:1.4}, shots:[
    {tap:"[data-card]", z:1.8},
    {track:"#ft-cardBody", after:0.6, z:1.3, follow:true}]},
  hub:{start:0.8, shots:[], push:{z:1.14, dy:40}}
};

/* הפתיח (קטע Gemini A, 1080×1920 אחרי חיתוך): מיקום בועות הדיבור
   ליד התלמידים, ונקודת הזום על פני המורה בהקפאה */
const HOOK={
  /* side/x: מרחק מהקצה (כך שבועה ארוכה לא נחתכת); tail: לאן הזנב מצביע */
  bubbles:[{side:"right",x:36,y:215,tail:"bl",at:0.35},{side:"left",x:30,y:470,tail:"br",at:1.0},{side:"left",x:250,y:95,tail:"b",at:1.65}],
  face:{x:500,y:360,z:1.35}
};

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

module.exports={SHOTS,HOOK,SFX,BGM};
