/* ============================================================
   PE Ultimate — גשר לגרסאות החנות (Capacitor, iOS ו-Android)
   ------------------------------------------------------------
   אותו קוד רץ באתר, ב-PWA ובאפליקציה הארוזה. בדפדפן הקובץ הזה
   לא עושה דבר: window.HMN.native הוא false וכל הפונקציות חוזרות
   מיד. באפליקציה הארוזה Capacitor מזריק את window.Capacitor לפני
   כל סקריפט, והגשר מחליף רק את מה שלא עובד בתוך WebView:

   1. הורדת קובץ (<a download>) — WebView לא מוריד קבצים. הקובץ
      נכתב לתיקיית המטמון של האפליקציה ונפתח גיליון השיתוף של
      המערכת (שמירה ב-Files / Drive / מייל / וואטסאפ).
   2. חלון הדפסה (window.open("")) — אין חלונות נוספים ב-WebView,
      וב-Android document.write היה דורס את האפליקציה עצמה. הדף
      מוצג בתוך האפליקציה, עם כפתור שיתוף כקובץ HTML.
   3. עותק נוסף של הנתונים — מערכת ההפעלה רשאית לפנות את האחסון
      של WebView כשהמכשיר מלא (כך כתוב בתיעוד של Capacitor). לכן
      כל שינוי ב-localStorage נכתב גם לקובץ בתיקיית הנתונים של
      האפליקציה, ואם בפתיחה localStorage ריק והקובץ קיים — הוא
      משוחזר. סרטוני השיאים (IndexedDB) אינם בעותק הזה; הם בגיבוי
      לקובץ המלא.
   4. טופס יצירת הקשר — באפליקציה הדף אינו מוגש מ-Netlify, ולכן
      השליחה היא לכתובת המלאה, דרך HTTP של המערכת (בלי CORS).
   5. מסך דולק, קול (Android: אין speechSynthesis ב-WebView),
      וצבע שורת הסטטוס לפי ערכת הנושא.

   אין כאן ספריות ואין bundler: Capacitor.nativePromise(שם, פעולה,
   פרמטרים) הוא ה-API שהגשר המוזרק חושף, ושמות הפעולות נבדקו מול
   קוד המקור של הפלאגינים (Filesystem, Share, CapacitorHttp,
   SystemBars, KeepAwake, TextToSpeech).
   ============================================================ */
(function(){
"use strict";
var C=window.Capacitor;
var NATIVE=!!(C&&typeof C.isNativePlatform==="function"&&C.isNativePlatform());
var PLATFORM=NATIVE&&typeof C.getPlatform==="function"?C.getPlatform():"web";
var SITE="https://pe-ultimate.netlify.app/";
var SNAP_FILE="pe-ultimate-data.json", SNAP_DIR="LIBRARY";
var NS="peultimate.";
try{ if(window.BRAND&&window.BRAND.ns)NS=window.BRAND.ns; }catch(e){}

function call(plugin,method,opts){
  return C.nativePromise(plugin,method,opts||{});
}
function has(plugin){
  try{ return !!(C&&C.isPluginAvailable&&C.isPluginAvailable(plugin)); }catch(e){ return false; }
}
function note(msg){
  try{ if(window.HM&&window.HM.toast){ window.HM.toast(msg); return; } }catch(e){}
  try{ console.warn("[HMN] "+msg); }catch(e){}
}
function safeName(n){
  return String(n||"file").replace(/[\\/:*?"<>|]/g,"").replace(/\s+/g,"-").slice(0,120)||"file";
}
function blobToB64(blob){
  return new Promise(function(res,rej){
    var r=new FileReader();
    r.onload=function(){ var s=String(r.result||""); res(s.slice(s.indexOf(",")+1)); };
    r.onerror=function(){ rej(r.error); };
    r.readAsDataURL(blob);
  });
}
function cancelled(err){
  var m=String(err&&(err.message||err.errorMessage||err)||"");
  return /cancel/i.test(m);
}

/* ---------- 1. שמירת קובץ: כתיבה למטמון + גיליון שיתוף ---------- */
function saveFile(name,blob){
  if(!NATIVE)return Promise.resolve(false);
  var path="exports/"+safeName(name);
  return blobToB64(blob).then(function(b64){
    return call("Filesystem","writeFile",{path:path,data:b64,directory:"CACHE",recursive:true});
  }).then(function(w){
    return call("Share","share",{title:name,dialogTitle:name,files:[w.uri]});
  }).then(function(){ return true; },function(err){
    if(cancelled(err)){ note("הקובץ לא נשמר — השיתוף בוטל"); return false; }
    note("שמירת הקובץ נכשלה: "+String(err&&err.message||err));
    return false;
  });
}

/* ---------- 2. חלון הדפסה בתוך האפליקציה ---------- */
var viewer=null;
function showDoc(html){
  if(!viewer){
    viewer=document.createElement("div");
    viewer.id="hmn-doc";
    viewer.setAttribute("role","dialog");
    viewer.innerHTML='<div class="hmn-bar"><button type="button" class="btn sm ghost" data-hmn="close">✕ סגירה</button>'+
      '<button type="button" class="btn sm acc" data-hmn="share">📤 שמירה או שיתוף</button></div>'+
      '<iframe title="מסמך" sandbox="allow-same-origin"></iframe>';
    document.body.appendChild(viewer);
    viewer.addEventListener("click",function(e){
      var b=e.target.closest&&e.target.closest("[data-hmn]"); if(!b)return;
      if(b.dataset.hmn==="close"){ viewer.classList.remove("on"); }
      else{
        var t=(viewer._title||"מסמך").replace(/\s+/g,"-");
        saveFile(t+".html",new Blob([viewer._html],{type:"text/html"}));
      }
    });
  }
  /* הסקריפט print() שבתוך המסמך לא ירוץ (sandbox בלי scripts) — ב-WebView
     הוא ממילא לא עושה דבר. ההדפסה היא מתוך הקובץ ששותף. */
  viewer._html=html;
  var m=/<title>([^<]*)<\/title>/i.exec(html); viewer._title=m?m[1]:"";
  /* לתצוגה — בלי סקריפטים (print() במסמך). הקובץ המשותף נשאר כמו שהוא:
     כשפותחים אותו בדפדפן הוא מציע הדפסה מעצמו. */
  viewer.querySelector("iframe").srcdoc=String(html).replace(/<script\b[\s\S]*?<\/script>/gi,"");
  viewer.classList.add("on");
}
function docWindow(){
  var buf=[], shown=false;
  var flush=function(){ if(!shown&&buf.length){ shown=true; showDoc(buf.join("")); } };
  var doc={write:function(s){ buf.push(String(s)); setTimeout(flush,0); },
           writeln:function(s){ doc.write(String(s)+"\n"); },
           close:flush, open:function(){ return doc; }};
  return {document:doc,print:flush,focus:function(){},close:function(){},closed:false};
}

/* ---------- 3. עותק נוסף של localStorage בתיקיית האפליקציה ---------- */
var mirrorReady=false, dirty=false, tm=null;
function ourKeys(){
  var out=[];
  try{ for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); if(k&&k.indexOf(NS)===0)out.push(k); } }catch(e){}
  return out;
}
function writeSnap(){
  tm=null; if(!mirrorReady||!dirty)return Promise.resolve();
  dirty=false;
  var data={}; ourKeys().forEach(function(k){ try{ data[k]=localStorage.getItem(k); }catch(e){} });
  var body=JSON.stringify({v:1,ns:NS,at:new Date().toISOString(),n:Object.keys(data).length,data:data});
  return call("Filesystem","writeFile",{path:SNAP_FILE,data:body,directory:SNAP_DIR,encoding:"utf8",recursive:true})
    .catch(function(e){ dirty=true; try{ console.warn("[HMN] snapshot",e); }catch(x){} });
}
function markDirty(){
  dirty=true;
  if(mirrorReady&&!tm)tm=setTimeout(writeSnap,1500);
}
function hookStorage(){
  var P=Storage.prototype, set=P.setItem, rem=P.removeItem, clr=P.clear;
  P.setItem=function(k){ var r=set.apply(this,arguments); if(this===window.localStorage&&String(k).indexOf(NS)===0)markDirty(); return r; };
  P.removeItem=function(k){ var r=rem.apply(this,arguments); if(this===window.localStorage&&String(k).indexOf(NS)===0)markDirty(); return r; };
  P.clear=function(){ var r=clr.apply(this,arguments); if(this===window.localStorage)markDirty(); return r; };
  document.addEventListener("visibilitychange",function(){ if(document.visibilityState==="hidden")writeSnap(); });
  window.addEventListener("pagehide",function(){ writeSnap(); });
}
/* נקרא פעם אחת, לפני שהאפליקציה כותבת משהו. אם localStorage ריק
   והעותק קיים — משחזרים ומרעננים. עד שהבדיקה מסתיימת לא כותבים
   את העותק, כדי שמצב ריק לא ידרוס עותק מלא. */
function bootMirror(){
  var empty=ourKeys().length===0;
  hookStorage();
  var done=function(){ mirrorReady=true; markDirty(); };
  if(!empty){ done(); return; }
  call("Filesystem","readFile",{path:SNAP_FILE,directory:SNAP_DIR,encoding:"utf8"}).then(function(r){
    var snap=null; try{ snap=JSON.parse(r.data); }catch(e){}
    var keys=snap&&snap.data?Object.keys(snap.data).filter(function(k){ return k.indexOf(NS)===0; }):[];
    if(!keys.length){ done(); return; }
    keys.forEach(function(k){ try{ localStorage.setItem(k,snap.data[k]); }catch(e){} });
    /* hm-i18n כבר רשם «en» כהתקנה חדשה. עותק בלי בחירת שפה הוא של משתמש
       קיים — מוחקים, וכך בטעינה הבאה הוא נשאר בשפה שראה (עברית). */
    if(!(NS+"lang" in snap.data))try{ localStorage.removeItem(NS+"lang"); }catch(e){}
    try{ sessionStorage.setItem("hmn.restored",String(keys.length)); }catch(e){}
    location.reload();
  },function(){ done(); });
}

/* ---------- 4. שליחת טופס ---------- */
function postForm(fields,timeout){
  var data={}; Object.keys(fields||{}).forEach(function(k){ data[k]=String(fields[k]==null?"":fields[k]); });
  return call("CapacitorHttp","request",{url:SITE,method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},data:data,
    connectTimeout:timeout||15000,readTimeout:timeout||15000,responseType:"text"})
    .then(function(r){ return {status:r.status,text:typeof r.data==="string"?r.data:JSON.stringify(r.data||"")}; });
}

/* ---------- 5. מסך דולק, קול, שורת סטטוס ---------- */
function awake(on){
  if(!NATIVE||!has("KeepAwake"))return Promise.resolve(false);
  return call("KeepAwake",on?"keepAwake":"allowSleep").then(function(){ return true; },function(){ return false; });
}
function say(text,lang,rate){
  if(!NATIVE||!has("TextToSpeech"))return false;
  call("TextToSpeech","speak",{text:String(text),lang:lang||"he-IL",rate:rate||1,category:"playback"}).catch(function(){});
  return true;
}
function barsFor(theme){
  if(!NATIVE||!has("SystemBars"))return;
  /* DARK = טקסט בהיר לרקע כהה; ערכת «יום» בהירה → LIGHT */
  call("SystemBars","setStyle",{style:theme==="day"?"LIGHT":"DARK"}).catch(function(){});
}
/* אחרי שחזור מהעותק: אומרים למורה מה קרה, פעם אחת */
function afterBoot(){
  var n=null; try{ n=sessionStorage.getItem("hmn.restored"); sessionStorage.removeItem("hmn.restored"); }catch(e){}
  if(n)setTimeout(function(){ note("✓ הנתונים שוחזרו מהעותק השמור באפליקציה ("+n+" קבוצות נתונים)"); },1200);
  /* התקנה חדשה בלי נתונים: הנתונים מהאתר לא עוברים לבד — מסבירים איך */
  var mig=document.getElementById("lock-migrate");
  if(mig){
    var list=null; try{ list=JSON.parse(localStorage.getItem(NS+"stu.list")||"null"); }catch(e){}
    mig.hidden=!!(list&&list.length);
  }
}
function watchTheme(){
  var paint=function(){ barsFor(document.body&&document.body.getAttribute("data-theme")); };
  var go=function(){
    paint();
    try{ new MutationObserver(paint).observe(document.body,{attributes:true,attributeFilter:["data-theme"]}); }catch(e){}
  };
  if(document.body)go(); else document.addEventListener("DOMContentLoaded",go);
}

if(NATIVE){
  document.documentElement.classList.add("hmn-native","hmn-"+PLATFORM);
  var click=HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click=function(){
    var href=this.href||"";
    if(this.hasAttribute("download")&&/^(blob:|data:)/.test(href)){
      var name=this.getAttribute("download")||"file";
      fetch(href).then(function(r){ return r.blob(); }).then(function(b){ return saveFile(name,b); })
        .catch(function(e){ note("שמירת הקובץ נכשלה: "+String(e&&e.message||e)); });
      return;
    }
    return click.apply(this,arguments);
  };
  var open=window.open;
  window.open=function(url){
    if(!url||url==="about:blank")return docWindow();
    return open.apply(window,arguments);
  };
  bootMirror();
  watchTheme();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",afterBoot); else afterBoot();
}

window.HMN={native:NATIVE,platform:PLATFORM,site:SITE,saveFile:saveFile,postForm:postForm,
  awake:awake,say:say,flush:writeSnap,_docWindow:docWindow};
})();
