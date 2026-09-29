"use strict";
/* ============================================================
   Capacitor מדומה — לבדיקות בלבד
   ------------------------------------------------------------
   הבדיקות רצות ב-Chromium, לא בתוך אפליקציית iOS או Android. כדי
   לבדוק את המסלולים של hm-native.js (שמירה ושיתוף, הדפסה, העותק
   של הנתונים, שליחת הטופס) מזריקים window.Capacitor מדומה שרושם
   כל קריאה ומחזיר תשובה בצורה של הפלאגין האמיתי. זה בודק את הקוד
   שלנו מול ה-API — לא את המעטפת ולא את המכשיר.

   «מערכת הקבצים» יושבת במפתח __fakefs, מחוץ לתחילית peultimate.,
   כדי שסימולציית פינוי של נתוני האפליקציה לא תמחק גם אותה.
   ============================================================ */
function capShim(platform){
  if(!platform)return;
  window.__cap=[];
  var FS="__fakefs";
  var fs=function(){ try{ return JSON.parse(localStorage.getItem(FS)||"{}"); }catch(e){ return {}; } };
  var put=function(o){ localStorage.setItem(FS,JSON.stringify(o)); };
  if(platform==="android"){ try{ delete Window.prototype.speechSynthesis; delete window.speechSynthesis; }catch(e){} }
  var H={
    "Filesystem.writeFile":function(o){ var f=fs(); f[o.directory+"/"+o.path]=o.data; put(f);
      return {uri:"file:///fake/"+o.directory+"/"+o.path}; },
    "Filesystem.readFile":function(o){ var f=fs(), k=o.directory+"/"+o.path;
      if(!(k in f))throw {message:"File does not exist."}; return {data:f[k]}; },
    "Share.share":function(){ if(window.__shareCancel)throw {message:"Share canceled"}; return {activityType:"fake"}; },
    "CapacitorHttp.request":function(){ return window.__httpReply||{status:200,data:"<html>peu-contact-received-v1</html>"}; }
  };
  window.Capacitor={
    isNativePlatform:function(){ return true; },
    getPlatform:function(){ return platform; },
    isPluginAvailable:function(){ return true; },
    nativePromise:function(p,m,o){
      window.__cap.push([p,m,o]);
      var h=H[p+"."+m];
      return new Promise(function(res,rej){
        setTimeout(function(){ try{ res(h?h(o||{}):{}); }catch(e){ rej(e); } },0);
      });
    }
  };
}
module.exports={capShim};
